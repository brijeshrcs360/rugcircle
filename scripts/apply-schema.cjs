const fs = require('fs')
const mysql = require('mysql2/promise')

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME']
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing env var: ${key}`)
    process.exit(1)
  }
}

const sql = fs.readFileSync('db/schema.sql', 'utf8')

const cfg = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectTimeout: 20000,
  multipleStatements: true,
}

;(async () => {
  const conn = await mysql.createConnection(cfg)
  await conn.query(sql)
  const [tables] = await conn.query('SHOW TABLES')
  console.log('Schema applied. Tables:', tables.map((row) => Object.values(row)[0]).join(', '))
  await conn.end()
})().catch((e) => {
  console.error('Schema apply failed:', e.code || '', e.message)
  process.exit(1)
})

