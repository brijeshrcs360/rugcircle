import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { config } from './config/env.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import { pool } from './lib/db.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: config.adminUiOrigin, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser(config.session.secret))

app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }),
)

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.get('/api/public/campaigns', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, slug, name, location, city,
              DATE_FORMAT(workshop_date, '%Y-%m-%d') AS workshopDate,
              DATE_FORMAT(start_time, '%H:%i') AS startTime,
              price_pp AS price,
              seat_capacity AS seatCapacity,
              status
       FROM campaigns
       WHERE status = 'active'
       ORDER BY workshop_date ASC, start_time ASC`,
    )
    res.json({ ok: true, campaigns: rows })
  } catch (err) {
    next(err)
  }
})
app.get('/api/public/campaigns/:slug', async (req, res, next) => {
  try {
    const slug = String(req.params.slug || '').trim().toLowerCase()
    const [rows] = await pool.query(
      `SELECT c.id, c.slug, c.name, c.location, c.city,
              DATE_FORMAT(workshop_date, '%Y-%m-%d') AS workshopDate,
              DATE_FORMAT(start_time, '%H:%i') AS startTime,
              c.price_pp AS price,
              c.seat_capacity AS seatCapacity,
              c.status,
              c.notes,
              cc.short_subtitle AS shortSubtitle,
              cc.badge_text AS badgeText,
              cc.price_unit_label AS priceUnitLabel,
              cc.total_example AS totalExample,
              cc.overview,
              cc.whats_included AS whatsIncluded,
              cc.detail_features AS detailFeatures,
              cc.itinerary,
              cc.faq,
              cc.terms_and_policy AS termsAndPolicy,
              cc.gallery
       FROM campaigns c
       LEFT JOIN campaign_content cc ON cc.campaign_id = c.id
       WHERE c.slug = ?
       LIMIT 1`,
      [slug],
    )
    if (!rows[0]) return res.status(404).json({ ok: false, message: 'Campaign not found' })
    const row = rows[0]
    const parseMaybeJson = (v, fallback = []) => {
      if (!v) return fallback
      try { return typeof v === 'string' ? JSON.parse(v) : v } catch { return fallback }
    }
    row.whatsIncluded = parseMaybeJson(row.whatsIncluded, [])
    row.detailFeatures = parseMaybeJson(row.detailFeatures, [])
    row.itinerary = parseMaybeJson(row.itinerary, [])
    row.faq = parseMaybeJson(row.faq, [])
    row.gallery = parseMaybeJson(row.gallery, [])
    res.json({ ok: true, campaign: row })
  } catch (err) {
    next(err)
  }
})
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)

app.use(errorHandler)

app.listen(config.port, () => {
  console.log(`API listening on ${config.port}`)
})

