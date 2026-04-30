import { pool } from '../lib/db.js'
import { sha256 } from '../lib/crypto.js'
import { config } from '../config/env.js'

export async function requireAdminSession(req, res, next) {
  const token = req.cookies?.[config.session.cookieName]
  if (!token) return res.status(401).json({ ok: false, message: 'Unauthorized' })

  const tokenHash = sha256(token)
  const [rows] = await pool.query(
    `SELECT s.id, s.admin_user_id, s.expires_at, u.email, u.role, u.status
     FROM admin_sessions s
     INNER JOIN admin_users u ON u.id = s.admin_user_id
     WHERE s.session_token = :tokenHash
     LIMIT 1`,
    { tokenHash },
  )

  const row = rows[0]
  if (!row) return res.status(401).json({ ok: false, message: 'Unauthorized' })
  if (row.status !== 'active') return res.status(403).json({ ok: false, message: 'User inactive' })
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await pool.query('DELETE FROM admin_sessions WHERE id = :id', { id: row.id })
    return res.status(401).json({ ok: false, message: 'Session expired' })
  }

  req.admin = {
    sessionId: row.id,
    userId: row.admin_user_id,
    email: row.email,
    role: row.role,
  }

  next()
}

