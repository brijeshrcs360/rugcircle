import express from 'express'
import bcrypt from 'bcryptjs'
import { pool } from '../lib/db.js'
import { randomToken, sha256 } from '../lib/crypto.js'
import { loginSchema } from '../lib/validators.js'
import { config } from '../config/env.js'
import { requireAdminSession } from '../middleware/requireAdminSession.js'

const router = express.Router()

const sessionCookieConfig = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax',
  path: '/',
}

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ ok: false, message: 'Invalid login payload' })

  const email = parsed.data.email.trim().toLowerCase()
  const password = parsed.data.password

  const [rows] = await pool.query(
    'SELECT id, email, password_hash, role, status FROM admin_users WHERE email = :email LIMIT 1',
    { email },
  )

  const user = rows[0]
  if (!user || user.status !== 'active') return res.status(401).json({ ok: false, message: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ ok: false, message: 'Invalid credentials' })

  const rawToken = randomToken(32)
  const tokenHash = sha256(rawToken)
  const expires = new Date(Date.now() + config.session.ttlHours * 60 * 60 * 1000)

  await pool.query(
    `INSERT INTO admin_sessions (admin_user_id, session_token, ip_address, user_agent, expires_at, last_seen_at)
     VALUES (:adminUserId, :tokenHash, :ip, :ua, :expiresAt, NOW())`,
    {
      adminUserId: user.id,
      tokenHash,
      ip: req.ip || null,
      ua: req.get('user-agent') || null,
      expiresAt: expires,
    },
  )

  res.cookie(config.session.cookieName, rawToken, {
    ...sessionCookieConfig,
    expires,
  })

  res.json({ ok: true, user: { email: user.email, role: user.role }, expiresAt: expires.toISOString() })
})

router.post('/logout', requireAdminSession, async (req, res) => {
  await pool.query('DELETE FROM admin_sessions WHERE id = :id', { id: req.admin.sessionId })
  res.clearCookie(config.session.cookieName, sessionCookieConfig)
  res.json({ ok: true })
})

router.get('/me', requireAdminSession, async (req, res) => {
  await pool.query('UPDATE admin_sessions SET last_seen_at = NOW() WHERE id = :id', { id: req.admin.sessionId })
  res.json({ ok: true, user: { email: req.admin.email, role: req.admin.role } })
})

export default router

