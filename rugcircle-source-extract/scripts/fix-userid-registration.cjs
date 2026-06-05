require('dotenv').config()
const mysql = require('mysql2/promise')

;(async () => {
  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  })

  const [col] = await c.query("SELECT COUNT(*) cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='registrations' AND COLUMN_NAME='user_id'", [process.env.DB_NAME])
  if (!col[0].cnt) {
    await c.query('ALTER TABLE registrations ADD COLUMN user_id BIGINT UNSIGNED NULL AFTER campaign_id')
    console.log('added registrations.user_id')
  }

  const [idx] = await c.query("SELECT COUNT(*) cnt FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=? AND TABLE_NAME='registrations' AND INDEX_NAME='idx_registrations_user'", [process.env.DB_NAME])
  if (!idx[0].cnt) {
    await c.query('ALTER TABLE registrations ADD KEY idx_registrations_user (user_id)')
    console.log('added idx_registrations_user')
  }

  const [fk] = await c.query("SELECT COUNT(*) cnt FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=? AND TABLE_NAME='registrations' AND CONSTRAINT_NAME='fk_registrations_user' AND CONSTRAINT_TYPE='FOREIGN KEY'", [process.env.DB_NAME])
  if (!fk[0].cnt) {
    await c.query('ALTER TABLE registrations ADD CONSTRAINT fk_registrations_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL')
    console.log('added fk_registrations_user')
  }

  const [r] = await c.query('SHOW COLUMNS FROM registrations')
  console.log('registrations_cols', r.map((x) => x.Field).join(','))
  await c.end()
})().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
