import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { pool } from '../lib/db.js'
import { randomToken, sha256 } from '../lib/crypto.js'
import { config } from '../config/env.js'

const otpTtlMinutes = 10
const otpWindowMinutes = 15
const otpMaxRequests = 3
const otpMaxVerifyAttempts = 5
const otpLockMinutes = 15
const otpRequestCooldownMs = 30 * 1000
const otpLastRequestAt = new Map()

const cookieName = 'rc_user_session'
const cookieCfg = { httpOnly: true, secure: config.nodeEnv === 'production', sameSite: 'lax', path: '/' }

function otpCode() { return String(Math.floor(100000 + Math.random() * 900000)) }
function tempPassword() { return `RC${Math.random().toString(36).slice(2, 8).toUpperCase()}9` }

async function sendOtpEmail(toEmail, otp) {
  if (!config.mail.host || !config.mail.user || !config.mail.pass) return
  const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.port === 465,
    auth: { user: config.mail.user, pass: config.mail.pass },
  })
  await transporter.sendMail({
    from: config.mail.from,
    to: toEmail,
    subject: 'Your Rug Circle verification code',
    text: `Your verification code is ${otp}. It is valid for ${otpTtlMinutes} minutes.`,
  })
}

async function sendBookingConfirmationEmail(toEmail, details) {
  if (!config.mail.host || !config.mail.user || !config.mail.pass) return
  const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.port === 465,
    auth: { user: config.mail.user, pass: config.mail.pass },
  })
  await transporter.sendMail({
    from: config.mail.from,
    to: toEmail,
    subject: `Booking confirmed: ${details.campaignName}`,
    text: [
      'Your Rug Circle booking is confirmed.',
      `Booking Code: ${details.registrationCode}`,
      `Campaign: ${details.campaignName}`,
      `Date: ${details.workshopDate || '-'}`,
      `Time: ${details.startTime || '-'}`,
      `Location: ${details.location || '-'}`,
      `City: ${details.city || '-'}`,
      `Team Size: ${details.teamSize}`,
      `Selected Product: ${details.selectedDesignName || '-'}`,
      `Amount Paid: Rs ${Number(details.amountAdvance || 0).toLocaleString('en-IN')}`,
      details.whatsappLink ? `WhatsApp: ${details.whatsappLink}` : null,
    ].filter(Boolean).join('\n'),
  })
}

export async function createSession(res, user, req) {
  const rawToken = randomToken(32)
  const tokenHash = sha256(rawToken)
  const expires = new Date(Date.now() + config.session.ttlHours * 60 * 60 * 1000)
  await pool.query('INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at, last_seen_at) VALUES (:userId, :token, :ip, :ua, :expiresAt, NOW())', {
    userId: user.id, token: tokenHash, ip: req.ip || null, ua: req.get('user-agent') || null, expiresAt: expires,
  })
  res.cookie(cookieName, rawToken, { ...cookieCfg, expires })
  return expires
}

export function getUserCookieConfig() { return { cookieName, cookieCfg } }

export async function requireUserFromCookie(rawCookie) {
  if (!rawCookie) return null
  const [rows] = await pool.query(`SELECT s.id AS sessionId, u.id, u.email, u.mobile, u.full_name AS fullName
    FROM user_sessions s INNER JOIN app_users u ON u.id=s.user_id
    WHERE s.session_token=:t AND s.expires_at > NOW() AND u.status='active' LIMIT 1`, { t: sha256(rawCookie) })
  return rows[0] || null
}

export async function touchUserSession(sessionId) {
  await pool.query('UPDATE user_sessions SET last_seen_at=NOW() WHERE id=:id', { id: sessionId })
}

export async function createBooking(d) {
  const [campaignRows] = await pool.query(
    `SELECT id, name, location, city, workshop_date AS workshopDate, start_time AS startTime, price_pp AS price
     FROM campaigns WHERE slug=:slug LIMIT 1`,
    { slug: d.campaignSlug },
  )
  const c = campaignRows[0]
  if (!c) throw Object.assign(new Error('Campaign not found'), { status: 404 })

  const subtotal = Number(c.price) * d.teamSize
  const gst = Math.round(subtotal * 0.18)
  const total = subtotal + gst
  const advance = d.paymentPercent === 100 ? total : Math.round(total * 0.5)
  const code = `CORP-${Date.now()}`

  const [userRows] = await pool.query('SELECT id, email, mobile FROM app_users WHERE email=:email OR mobile=:mobile LIMIT 1', { email: d.email.toLowerCase(), mobile: d.mobile })
  let user = userRows[0]
  let tempPass = null
  if (!user) {
    tempPass = tempPassword()
    const hash = await bcrypt.hash(tempPass, 10)
    const [r] = await pool.query('INSERT INTO app_users (email, mobile, password_hash, full_name, status) VALUES (:email,:mobile,:ph,:fullName,\'active\')', {
      email: d.email.toLowerCase(), mobile: d.mobile, ph: hash, fullName: d.participantName,
    })
    user = { id: r.insertId, email: d.email.toLowerCase(), mobile: d.mobile }
  }

  const otp = otpCode()
  await pool.query('INSERT INTO user_otps (user_id, otp_code_hash, expires_at) VALUES (:uid,:h,DATE_ADD(NOW(), INTERVAL :m MINUTE))', {
    uid: user.id, h: sha256(otp), m: otpTtlMinutes,
  })
  await sendOtpEmail(user.email, otp)

  const [ins] = await pool.query(`INSERT INTO registrations
    (campaign_id, user_id, registration_code, participant_name, email, mobile, company_name, team_size, selected_design_name, amount_subtotal, amount_gst, amount_total, amount_advance, payment_status, registered_at)
    VALUES (:campaignId,:userId,:code,:name,:email,:mobile,:company,:team,:design,:subtotal,:gst,:total,:advance,'pending',NOW())`, {
    campaignId: c.id, userId: user.id, code, name: d.participantName, email: d.email.toLowerCase(), mobile: d.mobile,
    company: d.companyName || null, team: d.teamSize, design: d.selectedDesignName || null, subtotal, gst, total, advance,
  })

  await pool.query('INSERT INTO user_activities (user_id, activity_type, meta) VALUES (:uid,:type,:meta)', { uid: user.id, type: 'booking_created', meta: JSON.stringify({ registrationId: ins.insertId, registrationCode: code }) })
  const smsPreview = `Rug Circle booking ${code} confirmed.`
  const whatsappLink = 'https://wa.me/' + encodeURIComponent(d.mobile) + '?text=' + encodeURIComponent(smsPreview)

  const bookingDetails = {
    registrationCode: code,
    campaignName: c.name,
    workshopDate: c.workshopDate,
    startTime: c.startTime,
    location: c.location,
    city: c.city,
    teamSize: d.teamSize,
    selectedDesignName: d.selectedDesignName || null,
    amountAdvance: advance,
    whatsappLink,
  }
  await sendBookingConfirmationEmail(user.email, bookingDetails)

  return {
    ok: true,
    booking: { id: ins.insertId, registrationCode: code, amount: advance },
    auth: { loginEmail: user.email, loginMobile: user.mobile, requiresPasswordSetup: !userRows[0]?.id && !!tempPass },
    notify: { smsPreview, whatsappLink, bookingDetails },
  }
}

export async function loginUser(p, req, res) {
  const idf = p.identifier.trim().toLowerCase()
  const [rows] = await pool.query('SELECT id, email, mobile, full_name AS fullName, password_hash FROM app_users WHERE email=:v OR mobile=:raw LIMIT 1', { v: idf, raw: p.identifier.trim() })
  const user = rows[0]
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 })

  const [recentFailed] = await pool.query(
    `SELECT COUNT(*) AS c FROM user_activities WHERE user_id=:uid AND activity_type='login_failed' AND created_at > DATE_SUB(NOW(), INTERVAL :m MINUTE)`,
    { uid: user.id, m: otpLockMinutes },
  )
  if (Number(recentFailed?.[0]?.c || 0) >= otpMaxVerifyAttempts) {
    throw Object.assign(new Error(`Too many failed attempts. Try again in ${otpLockMinutes} minutes.`), { status: 429 })
  }

  let valid = false
  if (p.password && user.password_hash) valid = await bcrypt.compare(p.password, user.password_hash)
  if (!valid && p.otp) {
    const [otps] = await pool.query('SELECT id FROM user_otps WHERE user_id=:uid AND otp_code_hash=:h AND consumed_at IS NULL AND expires_at>NOW() ORDER BY id DESC LIMIT 1', { uid: user.id, h: sha256(p.otp) })
    if (otps[0]) { valid = true; await pool.query('UPDATE user_otps SET consumed_at=NOW() WHERE id=:id', { id: otps[0].id }) }
  }
  if (!valid) {
    await pool.query('INSERT INTO user_activities (user_id, activity_type, meta) VALUES (:uid,:type,:meta)', { uid: user.id, type: 'login_failed', meta: JSON.stringify({ at: new Date().toISOString() }) })
    throw Object.assign(new Error('Invalid credentials'), { status: 401 })
  }

  const expires = await createSession(res, user, req)
  return { ok: true, user: { email: user.email, mobile: user.mobile, fullName: user.fullName }, expiresAt: expires.toISOString() }
}

export async function requestOtp(identifier) {
  const key = identifier.toLowerCase()
  const lastAt = otpLastRequestAt.get(key) || 0
  const now = Date.now()
  if (now - lastAt < otpRequestCooldownMs) {
    const waitSec = Math.ceil((otpRequestCooldownMs - (now - lastAt)) / 1000)
    throw Object.assign(new Error(`Please wait ${waitSec}s before requesting OTP again.`), { status: 429 })
  }

  const [rows] = await pool.query('SELECT id, email, mobile FROM app_users WHERE email=:v LIMIT 1', { v: key })
  const user = rows[0]
  if (!user) throw Object.assign(new Error('User not found with this email'), { status: 404 })

  const [recentOtp] = await pool.query(`SELECT COUNT(*) AS c FROM user_otps WHERE user_id=:uid AND created_at > DATE_SUB(NOW(), INTERVAL :m MINUTE)`, { uid: user.id, m: otpWindowMinutes })
  if (Number(recentOtp?.[0]?.c || 0) >= otpMaxRequests) {
    throw Object.assign(new Error(`Too many OTP requests. Try again in ${otpWindowMinutes} minutes.`), { status: 429 })
  }

  const otp = otpCode()
  await pool.query('INSERT INTO user_otps (user_id, otp_code_hash, expires_at) VALUES (:uid,:h,DATE_ADD(NOW(), INTERVAL :m MINUTE))', {
    uid: user.id, h: sha256(otp), m: otpTtlMinutes,
  })
  await sendOtpEmail(user.email, otp)
  otpLastRequestAt.set(key, now)
  return { ok: true, otpSent: true, notify: { email: user.email } }
}
