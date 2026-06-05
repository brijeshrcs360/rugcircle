import 'dotenv/config'

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASS', 'DB_NAME', 'SESSION_SECRET']
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`)
}

export const config = {
  port: Number(process.env.PORT || 8787),
  nodeEnv: process.env.NODE_ENV || 'development',
  adminUiOrigin: process.env.ADMIN_UI_ORIGIN || 'http://localhost:5173',
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
  session: {
    ttlHours: Number(process.env.SESSION_TTL_HOURS || 8),
    cookieName: process.env.SESSION_COOKIE_NAME || 'rc_admin_session',
    secret: process.env.SESSION_SECRET,
  },
  payment: {
    webhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || '',
  },
  mail: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'no-reply@rugcircle.com',
  },
  support: {
    whatsappNumber: process.env.SUPPORT_WHATSAPP_NUMBER || '',
    email: process.env.SUPPORT_EMAIL || '',
    phone: process.env.SUPPORT_PHONE || '',
  },
}

