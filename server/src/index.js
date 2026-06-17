import express from 'express'
import path from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { config } from './config/env.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import userRoutes from './routes/user.js'
import { pool } from './lib/db.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
app.set('trust proxy', 1)

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      styleSrcElem: ["'self'", 'https://fonts.googleapis.com'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcElem: ["'self'", 'https://checkout.razorpay.com', 'https://cdn.razorpay.com'],
      scriptSrc: ["'self'", 'https://checkout.razorpay.com', 'https://cdn.razorpay.com'],
      frameSrc: ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com'],
      connectSrc: ["'self'", 'https:'],
      fontSrc: ["'self'", 'data:', 'https:'],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}))
app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser(config.session.secret))
const uploadsDir = path.resolve(process.cwd(), 'server', 'uploads')
if (existsSync(uploadsDir)) {
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
  }, express.static(uploadsDir))
}

const clientDist = path.resolve(process.cwd(), 'dist')
const clientIndexPath = path.join(clientDist, 'index.html')
const clientIndexHtml = existsSync(clientIndexPath) ? readFileSync(clientIndexPath, 'utf8') : null
if (existsSync(clientDist)) app.use(express.static(clientDist))

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
      `SELECT id, slug, campaign_type AS campaignType, seasonal_label AS seasonalLabel, name, location, city,
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
      `SELECT c.id, c.slug, c.campaign_type AS campaignType, c.seasonal_label AS seasonalLabel, c.name, c.location, c.city,
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
              cc.gallery,
              cc.product_ids_json AS productIdsJson
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
    const productIds = parseMaybeJson(row.productIdsJson, []).map((v) => Number(v)).filter((v) => Number.isInteger(v) && v > 0)
    if (productIds.length > 0) {
      const [productRows] = await pool.query(
        `SELECT id, title, price, description, main_image_url AS mainImageUrl, gallery_images_json AS galleryImagesJson
         FROM products
         WHERE id IN (?) ORDER BY id ASC`,
        [productIds],
      )
      const byId = new Map(productRows.map((p) => [p.id, { ...p, galleryImages: parseMaybeJson(p.galleryImagesJson, []) }]))
      row.products = productIds.map((id) => byId.get(id)).filter(Boolean)
    } else {
      row.products = []
    }
    res.json({ ok: true, campaign: row })
  } catch (err) {
    next(err)
  }
})
app.get('/api/public/products', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, price, description, main_image_url AS mainImageUrl, gallery_images_json AS galleryImagesJson, created_at AS createdAt
       FROM products
       ORDER BY id DESC`,
    )
    res.json({ ok: true, products: rows.map((row) => ({
      ...row,
      galleryImages: (() => { try { return row.galleryImagesJson ? JSON.parse(row.galleryImagesJson) : [] } catch { return [] } })(),
    })) })
  } catch (err) {
    next(err)
  }
})
app.get('/api/public/products/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, message: 'Invalid product id' })
    const [rows] = await pool.query(
      `SELECT id, title, price, description, main_image_url AS mainImageUrl, gallery_images_json AS galleryImagesJson, created_at AS createdAt
       FROM products WHERE id = ? LIMIT 1`,
      [id],
    )
    if (!rows[0]) return res.status(404).json({ ok: false, message: 'Product not found' })
    const row = rows[0]
    row.galleryImages = (() => { try { return row.galleryImagesJson ? JSON.parse(row.galleryImagesJson) : [] } catch { return [] } })()
    res.json({ ok: true, product: row })
  } catch (err) {
    next(err)
  }
})
app.get('/api/public/coupons/validate', async (req, res, next) => {
  try {
    const code = String(req.query.code || '').trim().toUpperCase()
    const amount = Number(req.query.amount || 0)
    if (!code) return res.status(400).json({ ok: false, message: 'Coupon code required' })
    const [rows] = await pool.query(`SELECT * FROM coupons WHERE code = ? LIMIT 1`, [code])
    const coupon = rows[0]
    if (!coupon) return res.status(404).json({ ok: false, message: 'Coupon not found' })
    const today = new Date().toISOString().slice(0, 10)
    if (coupon.status !== 'active') return res.status(400).json({ ok: false, message: 'Coupon inactive' })
    if (coupon.start_date && today < String(coupon.start_date).slice(0, 10)) return res.status(400).json({ ok: false, message: 'Coupon not active yet' })
    if (coupon.end_date && today > String(coupon.end_date).slice(0, 10)) return res.status(400).json({ ok: false, message: 'Coupon expired' })
    if (amount < Number(coupon.min_amount || 0)) return res.status(400).json({ ok: false, message: 'Order amount too low for this coupon' })
    if (Number(coupon.usage_limit || 0) > 0 && Number(coupon.usage_count || 0) >= Number(coupon.usage_limit || 0)) return res.status(400).json({ ok: false, message: 'Coupon limit reached' })
    let discount = coupon.discount_type === 'percent' ? Math.round((amount * Number(coupon.discount_value)) / 100) : Number(coupon.discount_value)
    if (Number(coupon.max_discount || 0) > 0) discount = Math.min(discount, Number(coupon.max_discount))
    discount = Math.max(0, Math.min(discount, amount))
    res.json({ ok: true, coupon: { code: coupon.code, discountType: coupon.discount_type, discountValue: Number(coupon.discount_value), discount, minAmount: Number(coupon.min_amount || 0) } })
  } catch (err) {
    next(err)
  }
})
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/user', userRoutes)

app.use(errorHandler)

function serveClientShell(req, res) {
  if (!clientIndexHtml) return res.status(503).type('text').send('Client build not available')
  res.type('html').status(200).send(clientIndexHtml)
}

app.get('/admin/login', serveClientShell)
app.get('/user/login', serveClientShell)

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next()
  if (req.path.startsWith('/api/')) return next()
  if (req.path.startsWith('/uploads/')) return next()
  serveClientShell(req, res)
})

app.listen(config.port, () => {
  console.log(`API listening on ${config.port}`)
})

