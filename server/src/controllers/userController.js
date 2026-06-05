import { pool } from '../lib/db.js'
import { sha256 } from '../lib/crypto.js'
import { config } from '../config/env.js'
import { bookingCreateSchema, userLoginSchema } from '../lib/validators.js'
import { createBooking, getUserCookieConfig, loginUser, requestOtp, requireUserFromCookie, touchUserSession } from '../services/userService.js'

function errRes(res, err) { return res.status(err?.status || 500).json({ ok: false, message: err?.message || 'Request failed' }) }

export async function requireUser(req, res, next) {
  try {
    const { cookieName } = getUserCookieConfig()
    const user = await requireUserFromCookie(req.cookies?.[cookieName])
    if (!user) return res.status(401).json({ ok: false, message: 'Unauthorized' })
    req.user = user
    await touchUserSession(user.sessionId)
    return next()
  } catch {
    return res.status(401).json({ ok: false, message: 'Unauthorized' })
  }
}

export async function createBookingHandler(req, res) {
  const parsed = bookingCreateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ ok: false, message: 'Invalid booking payload' })
  try { return res.status(201).json(await createBooking(parsed.data)) } catch (err) { return errRes(res, err) }
}

export async function loginHandler(req, res) {
  const p = userLoginSchema.safeParse(req.body)
  if (!p.success) return res.status(400).json({ ok: false, message: 'Invalid login payload' })
  try { return res.json(await loginUser(p.data, req, res)) } catch (err) { return errRes(res, err) }
}

export async function requestOtpHandler(req, res) {
  const identifier = String(req.body?.identifier || '').trim()
  if (!identifier) return res.status(400).json({ ok: false, message: 'Identifier required' })
  try { return res.json(await requestOtp(identifier)) } catch (err) { return errRes(res, err) }
}

export async function paymentWebhookHandler(req, res) {
  const sig = String(req.get('x-payment-signature') || '')
  const raw = JSON.stringify(req.body || {})
  if (!config.payment.webhookSecret) return res.status(500).json({ ok: false, message: 'Webhook secret not configured' })
  const validSig = sha256(raw + config.payment.webhookSecret)
  if (sig !== validSig) return res.status(401).json({ ok: false, message: 'Invalid signature' })
  const code = String(req.body?.registration_code || '').trim()
  const status = String(req.body?.status || '').trim().toLowerCase()
  const txnId = String(req.body?.transaction_id || '').trim() || null
  if (!code) return res.status(400).json({ ok: false, message: 'registration_code required' })
  const paymentStatus = status === 'paid' || status === 'success' ? 'paid' : 'failed'
  await pool.query('UPDATE registrations SET payment_status=:st, hdfc_txn_id=:txn, payment_reference_id=:txn, updated_at=NOW() WHERE registration_code=:code', { st: paymentStatus, txn: txnId, code })
  await pool.query('INSERT INTO payment_events (registration_id, event_type, provider, provider_event_id, status, payload) SELECT id, :evt, :provider, :providerEventId, :st, :payload FROM registrations WHERE registration_code=:code', {
    evt: 'webhook_update', provider: 'hdfc_vyapar', providerEventId: txnId, st: paymentStatus, payload: raw, code,
  })
  return res.json({ ok: true })
}
