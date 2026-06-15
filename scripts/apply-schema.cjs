require('dotenv').config()
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

async function ensureRegistrationsUserLink(conn, dbName) {
  const [col] = await conn.query("SELECT COUNT(*) cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='registrations' AND COLUMN_NAME='user_id'", [dbName])
  if (!col[0].cnt) await conn.query('ALTER TABLE registrations ADD COLUMN user_id BIGINT UNSIGNED NULL AFTER campaign_id')

  const [idx] = await conn.query("SELECT COUNT(*) cnt FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=? AND TABLE_NAME='registrations' AND INDEX_NAME='idx_registrations_user'", [dbName])
  if (!idx[0].cnt) await conn.query('ALTER TABLE registrations ADD KEY idx_registrations_user (user_id)')

  const [fk] = await conn.query("SELECT COUNT(*) cnt FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=? AND TABLE_NAME='registrations' AND CONSTRAINT_NAME='fk_registrations_user' AND CONSTRAINT_TYPE='FOREIGN KEY'", [dbName])
  if (!fk[0].cnt) await conn.query('ALTER TABLE registrations ADD CONSTRAINT fk_registrations_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL')
}

async function ensureCampaignTypeColumn(conn, dbName) {
  const [col] = await conn.query("SELECT COUNT(*) cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='campaigns' AND COLUMN_NAME='campaign_type'", [dbName])
  if (!col[0].cnt) {
    await conn.query("ALTER TABLE campaigns ADD COLUMN campaign_type ENUM('city_workshop','seasonal_promotion','discounted_workshop','partner_couple') NOT NULL DEFAULT 'city_workshop' AFTER slug")
  }
}

async function ensureSeasonalLabelColumn(conn, dbName) {
  const [col] = await conn.query("SELECT COUNT(*) cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='campaigns' AND COLUMN_NAME='seasonal_label'", [dbName])
  if (!col[0].cnt) {
    await conn.query("ALTER TABLE campaigns ADD COLUMN seasonal_label VARCHAR(120) NULL AFTER campaign_type")
  }
}

async function ensureCampaignContentProductIds(conn, dbName) {
  const [col] = await conn.query("SELECT COUNT(*) cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='campaign_content' AND COLUMN_NAME='product_ids_json'", [dbName])
  if (!col[0].cnt) {
    await conn.query('ALTER TABLE campaign_content ADD COLUMN product_ids_json JSON NULL AFTER seo_description')
  }
}

async function ensureCouponsTable(conn, dbName) {
  const [tbl] = await conn.query("SELECT COUNT(*) cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_NAME='coupons'", [dbName])
  if (!tbl[0].cnt) {
    await conn.query(`
      CREATE TABLE coupons (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        code VARCHAR(40) NOT NULL,
        discount_type ENUM('percent','fixed') NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        min_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        max_discount DECIMAL(10,2) NOT NULL DEFAULT 0,
        usage_limit INT UNSIGNED NOT NULL DEFAULT 0,
        usage_count INT UNSIGNED NOT NULL DEFAULT 0,
        status ENUM('active','inactive') NOT NULL DEFAULT 'active',
        start_date DATE NULL,
        end_date DATE NULL,
        created_by BIGINT UNSIGNED NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_coupons_code (code),
        KEY idx_coupons_status_dates (status, start_date, end_date),
        CONSTRAINT fk_coupons_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  }
}

async function ensureLeadsTable(conn, dbName) {
  const [tbl] = await conn.query("SELECT COUNT(*) cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_NAME='leads'", [dbName])
  if (!tbl[0].cnt) {
    await conn.query(`
      CREATE TABLE leads (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        name VARCHAR(140) NOT NULL,
        company VARCHAR(180) NULL,
        email VARCHAR(190) NOT NULL,
        phone VARCHAR(32) NULL,
        team_size VARCHAR(40) NULL,
        interest VARCHAR(120) NULL,
        date_window VARCHAR(120) NULL,
        message TEXT NULL,
        source VARCHAR(80) NOT NULL DEFAULT 'website',
        status ENUM('new','contacted','qualified','won','lost') NOT NULL DEFAULT 'new',
        whatsapp_link VARCHAR(500) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY idx_leads_status_created (status, created_at),
        KEY idx_leads_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
  }
}

;(async () => {
  const conn = await mysql.createConnection(cfg)
  await conn.query(sql)
  await ensureRegistrationsUserLink(conn, process.env.DB_NAME)
  await ensureCampaignTypeColumn(conn, process.env.DB_NAME)
  await ensureSeasonalLabelColumn(conn, process.env.DB_NAME)
  await ensureCampaignContentProductIds(conn, process.env.DB_NAME)
  await ensureCouponsTable(conn, process.env.DB_NAME)
  await ensureLeadsTable(conn, process.env.DB_NAME)
  const [tables] = await conn.query('SHOW TABLES')
  console.log('Schema applied. Tables:', tables.map((row) => Object.values(row)[0]).join(', '))
  await conn.end()
})().catch((e) => {
  console.error('Schema apply failed:', e.code || '', e.message)
  process.exit(1)
})
