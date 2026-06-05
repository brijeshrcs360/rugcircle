const bcrypt = require('bcryptjs')
const mysql = require('mysql2/promise')

const cfg = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
}

;(async () => {
  const conn = await mysql.createConnection(cfg)
  const email = process.env.ADMIN_EMAIL || 'admin@rugcircle.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const hash = await bcrypt.hash(password, 12)

  await conn.query(
    `UPDATE admin_users SET password_hash = ?, status = 'active' WHERE email = ?`,
    [hash, email],
  )

  console.log('Password updated for', email)
  await conn.end()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})

