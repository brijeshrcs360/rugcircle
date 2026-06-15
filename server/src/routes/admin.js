import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { pool } from '../lib/db.js'
import { campaignCreateSchema, campaignStatusSchema, productCreateSchema, couponCreateSchema } from '../lib/validators.js'
import { requireAdminSession } from '../middleware/requireAdminSession.js'
import { listLeads, updateLeadStatus } from '../services/leadService.js'

const router = express.Router()


const uploadsRoot = path.resolve(process.cwd(), 'server', 'uploads', 'products')
fs.mkdirSync(uploadsRoot, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg'
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith('image/')) return cb(null, true)
    cb(new Error('Only image files are allowed'))
  },
})

const parseJsonArray = (value) => {
  if (!value) return []
  try { return JSON.parse(value) } catch { return [] }
}

router.use(requireAdminSession)

router.get('/campaigns', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.slug, c.campaign_type AS campaignType, c.seasonal_label AS seasonalLabel, c.name, c.location, c.city,
            DATE_FORMAT(c.workshop_date, '%Y-%m-%d') AS workshopDate,
            DATE_FORMAT(c.start_time, '%H:%i') AS startTime,
            c.price_pp AS price,
            c.seat_capacity AS seatCapacity,
            c.status,
            c.created_at AS createdAt,
            COUNT(r.id) AS registrationCount,
            SUM(CASE WHEN r.payment_status = 'paid' THEN 1 ELSE 0 END) AS paidCount
     FROM campaigns c
     LEFT JOIN registrations r ON r.campaign_id = c.id
     GROUP BY c.id
     ORDER BY c.workshop_date DESC, c.start_time DESC`,
  )

  res.json({ ok: true, campaigns: rows })
})

router.get('/campaigns/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, message: 'Invalid campaign id' })

  const [rows] = await pool.query(
    `SELECT id, slug, campaign_type AS campaignType, seasonal_label AS seasonalLabel, name, location, city,
            DATE_FORMAT(workshop_date, '%Y-%m-%d') AS workshopDate,
            DATE_FORMAT(start_time, '%H:%i') AS startTime,
            price_pp AS price,
            seat_capacity AS seatCapacity,
            status,
            notes
     FROM campaigns
     WHERE id = :id
     LIMIT 1`,
    { id },
  )
  if (!rows[0]) return res.status(404).json({ ok: false, message: 'Campaign not found' })
  res.json({ ok: true, campaign: rows[0] })
})

router.get('/campaigns/:id/content', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, message: 'Invalid campaign id' })

  const [rows] = await pool.query(
    `SELECT campaign_id AS campaignId, short_subtitle, badge_text, price_unit_label, total_example,
            overview, whats_included, detail_features, itinerary, faq, terms_and_policy, gallery,
            seo_title, seo_description, product_ids_json
     FROM campaign_content
     WHERE campaign_id = :id
     LIMIT 1`,
    { id },
  )

  res.json({ ok: true, content: rows[0] || null })
})

router.put('/campaigns/:id/content', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, message: 'Invalid campaign id' })

  const payload = {
    shortSubtitle: req.body?.shortSubtitle || null,
    badgeText: req.body?.badgeText || null,
    priceUnitLabel: req.body?.priceUnitLabel || '/ person',
    totalExample: req.body?.totalExample || null,
    overview: req.body?.overview || null,
    whatsIncluded: JSON.stringify(req.body?.whatsIncluded || []),
    detailFeatures: JSON.stringify(req.body?.detailFeatures || []),
    itinerary: JSON.stringify(req.body?.itinerary || []),
    faq: JSON.stringify(req.body?.faq || []),
    termsAndPolicy: req.body?.termsAndPolicy || null,
    gallery: JSON.stringify(req.body?.gallery || []),
    seoTitle: req.body?.seoTitle || null,
    seoDescription: req.body?.seoDescription || null,
    productIdsJson: JSON.stringify(req.body?.productIds || []),
  }

  await pool.query(
    `INSERT INTO campaign_content
      (campaign_id, short_subtitle, badge_text, price_unit_label, total_example, overview, whats_included, detail_features, itinerary, faq, terms_and_policy, gallery, seo_title, seo_description, product_ids_json)
     VALUES
      (:id, :shortSubtitle, :badgeText, :priceUnitLabel, :totalExample, :overview, :whatsIncluded, :detailFeatures, :itinerary, :faq, :termsAndPolicy, :gallery, :seoTitle, :seoDescription, :productIdsJson)
     ON DUPLICATE KEY UPDATE
      short_subtitle = VALUES(short_subtitle),
      badge_text = VALUES(badge_text),
      price_unit_label = VALUES(price_unit_label),
      total_example = VALUES(total_example),
      overview = VALUES(overview),
      whats_included = VALUES(whats_included),
      detail_features = VALUES(detail_features),
      itinerary = VALUES(itinerary),
      faq = VALUES(faq),
      terms_and_policy = VALUES(terms_and_policy),
      gallery = VALUES(gallery),
      seo_title = VALUES(seo_title),
      seo_description = VALUES(seo_description),
      product_ids_json = VALUES(product_ids_json),
      updated_at = CURRENT_TIMESTAMP`,
    { id, ...payload },
  )

  res.json({ ok: true })
})

router.post('/campaigns', async (req, res) => {
  const parsed = campaignCreateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ ok: false, message: 'Invalid campaign payload' })

  const data = parsed.data
  const slug = `${data.name}-${Date.now()}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const [result] = await pool.query(
    `INSERT INTO campaigns
      (slug, campaign_type, seasonal_label, name, location, city, workshop_date, start_time, price_pp, seat_capacity, status, created_by)
     VALUES
      (:slug, :campaignType, :seasonalLabel, :name, :location, :city, :workshopDate, :startTime, :price, :seatCapacity, :status, :createdBy)`,
    {
      slug,
      campaignType: data.campaignType,
      seasonalLabel: data.seasonalLabel || null,
      name: data.name,
      location: data.location,
      city: data.city || null,
      workshopDate: data.workshopDate,
      startTime: data.startTime,
      price: data.price,
      seatCapacity: data.seatCapacity,
      status: data.status,
      createdBy: req.admin.userId,
    },
  )

  const campaignId = result.insertId
  const productIds = data.productIds || []
  await pool.query(
    `INSERT INTO campaign_content (campaign_id, seo_title, seo_description, product_ids_json) VALUES (:campaignId, :seoTitle, :seoDescription, :productIdsJson)`,
    {
      campaignId,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      productIdsJson: JSON.stringify(productIds),
    },
  )

  res.status(201).json({ ok: true, id: campaignId })
})

router.put('/campaigns/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, message: 'Invalid campaign id' })

  const parsed = campaignCreateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ ok: false, message: 'Invalid campaign payload' })

  const data = parsed.data
  await pool.query(
    `UPDATE campaigns SET
      campaign_type = :campaignType,
      seasonal_label = :seasonalLabel,
      name = :name,
      location = :location,
      city = :city,
      workshop_date = :workshopDate,
      start_time = :startTime,
      price_pp = :price,
      seat_capacity = :seatCapacity,
      status = :status
     WHERE id = :id`,
    {
      id,
      campaignType: data.campaignType,
      seasonalLabel: data.seasonalLabel || null,
      name: data.name,
      location: data.location,
      city: data.city || null,
      workshopDate: data.workshopDate,
      startTime: data.startTime,
      price: data.price,
      seatCapacity: data.seatCapacity,
      status: data.status,
    },
  )
  res.json({ ok: true })
})

router.patch('/campaigns/:id/status', async (req, res) => {
  const parsed = campaignStatusSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ ok: false, message: 'Invalid status payload' })

  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, message: 'Invalid campaign id' })

  await pool.query('UPDATE campaigns SET status = :status WHERE id = :id', {
    status: parsed.data.status,
    id,
  })

  res.json({ ok: true })
})

router.delete('/campaigns/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, message: 'Invalid campaign id' })
  await pool.query('DELETE FROM campaigns WHERE id = :id', { id })
  res.json({ ok: true })
})

router.post('/campaigns/:id/duplicate', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, message: 'Invalid campaign id' })
  const [rows] = await pool.query(
    `SELECT * FROM campaigns c LEFT JOIN campaign_content cc ON cc.campaign_id = c.id WHERE c.id = :id LIMIT 1`,
    { id },
  )
  const src = rows[0]
  if (!src) return res.status(404).json({ ok: false, message: 'Campaign not found' })
  const slug = `${String(src.name || 'campaign')}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const [result] = await pool.query(
    `INSERT INTO campaigns (slug, campaign_type, seasonal_label, name, location, city, workshop_date, start_time, price_pp, seat_capacity, status, created_by)
     VALUES (:slug, :campaignType, :seasonalLabel, :name, :location, :city, :workshopDate, :startTime, :price, :seatCapacity, 'draft', :createdBy)`,
    {
      slug,
      campaignType: src.campaign_type,
      seasonalLabel: src.seasonal_label,
      name: `${src.name} Copy`,
      location: src.location,
      city: src.city,
      workshopDate: src.workshop_date,
      startTime: src.start_time,
      price: src.price_pp,
      seatCapacity: src.seat_capacity,
      createdBy: req.admin.userId,
    },
  )
  const campaignId = result.insertId
  if (src.short_subtitle || src.overview || src.seo_title || src.product_ids_json) {
    await pool.query(
      `INSERT INTO campaign_content (campaign_id, short_subtitle, badge_text, price_unit_label, total_example, overview, whats_included, detail_features, itinerary, faq, terms_and_policy, gallery, seo_title, seo_description, product_ids_json)
       VALUES (:campaignId, :shortSubtitle, :badgeText, :priceUnitLabel, :totalExample, :overview, :whatsIncluded, :detailFeatures, :itinerary, :faq, :termsAndPolicy, :gallery, :seoTitle, :seoDescription, :productIdsJson)`,
      {
        campaignId,
        shortSubtitle: src.short_subtitle || null,
        badgeText: src.badge_text || null,
        priceUnitLabel: src.price_unit_label || '/ person',
        totalExample: src.total_example || null,
        overview: src.overview || null,
        whatsIncluded: src.whats_included || null,
        detailFeatures: src.detail_features || null,
        itinerary: src.itinerary || null,
        faq: src.faq || null,
        termsAndPolicy: src.terms_and_policy || null,
        gallery: src.gallery || null,
        seoTitle: src.seo_title || null,
        seoDescription: src.seo_description || null,
        productIdsJson: src.product_ids_json || null,
      },
    )
  }
  res.status(201).json({ ok: true, id: campaignId })
})


router.get('/products', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT id, title, price, description, main_image_url AS mainImageUrl, gallery_images_json AS galleryImagesJson,
            created_at AS createdAt, updated_at AS updatedAt
     FROM products
     ORDER BY id DESC`,
  )

  const products = rows.map((row) => ({
    ...row,
    galleryImages: parseJsonArray(row.galleryImagesJson),
  }))

  res.json({ ok: true, products })
})

router.post('/products', upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 7 }]), async (req, res) => {
  const parsed = productCreateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ ok: false, message: 'Invalid product payload' })

  const main = req.files?.mainImage?.[0]
  if (!main) return res.status(400).json({ ok: false, message: 'Main image is required' })

  const gallery = Array.isArray(req.files?.galleryImages) ? req.files.galleryImages : []
  const mainUrl = `/uploads/products/${main.filename}`
  const galleryUrls = gallery.map((f) => `/uploads/products/${f.filename}`)

  const data = parsed.data
  const [result] = await pool.query(
    `INSERT INTO products (title, price, description, main_image_url, gallery_images_json, created_by)
     VALUES (:title, :price, :description, :mainImageUrl, :galleryImagesJson, :createdBy)`,
    {
      title: data.title,
      price: data.price,
      description: data.description || null,
      mainImageUrl: mainUrl,
      galleryImagesJson: JSON.stringify(galleryUrls),
      createdBy: req.admin.userId,
    },
  )

  res.status(201).json({ ok: true, id: result.insertId })
})

router.put('/products/:id', upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'galleryImages', maxCount: 7 }]), async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, message: 'Invalid product id' })

  const parsed = productCreateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ ok: false, message: 'Invalid product payload' })

  const [rows] = await pool.query('SELECT main_image_url AS mainImageUrl, gallery_images_json AS galleryImagesJson FROM products WHERE id=:id LIMIT 1', { id })
  const current = rows[0]
  if (!current) return res.status(404).json({ ok: false, message: 'Product not found' })

  const newMain = req.files?.mainImage?.[0]
  const newGallery = Array.isArray(req.files?.galleryImages) ? req.files.galleryImages : []

  const nextMainUrl = newMain ? `/uploads/products/${newMain.filename}` : current.mainImageUrl
  const nextGalleryUrls = newGallery.length > 0 ? newGallery.map((f) => `/uploads/products/${f.filename}`) : parseJsonArray(current.galleryImagesJson)
  const data = parsed.data

  await pool.query(
    `UPDATE products
     SET title=:title, price=:price, description=:description, main_image_url=:mainImageUrl, gallery_images_json=:galleryImagesJson
     WHERE id=:id`,
    {
      id,
      title: data.title,
      price: data.price,
      description: data.description || null,
      mainImageUrl: nextMainUrl,
      galleryImagesJson: JSON.stringify(nextGalleryUrls),
    },
  )

  if (newMain && current.mainImageUrl) {
    const oldMainAbs = path.resolve(process.cwd(), 'server', current.mainImageUrl.replace(/^\//, '').replaceAll('/', path.sep))
    if (oldMainAbs.startsWith(path.resolve(process.cwd(), 'server', 'uploads'))) fs.promises.unlink(oldMainAbs).catch(() => {})
  }
  if (newGallery.length > 0) {
    for (const rel of parseJsonArray(current.galleryImagesJson)) {
      const abs = path.resolve(process.cwd(), 'server', String(rel || '').replace(/^\//, '').replaceAll('/', path.sep))
      if (abs.startsWith(path.resolve(process.cwd(), 'server', 'uploads'))) fs.promises.unlink(abs).catch(() => {})
    }
  }

  res.json({ ok: true })
})

router.delete('/products/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, message: 'Invalid product id' })

  const [rows] = await pool.query('SELECT main_image_url AS mainImageUrl, gallery_images_json AS galleryImagesJson FROM products WHERE id=:id LIMIT 1', { id })
  if (!rows[0]) return res.status(404).json({ ok: false, message: 'Product not found' })

  await pool.query('DELETE FROM products WHERE id = :id', { id })

  const paths = [rows[0].mainImageUrl, ...parseJsonArray(rows[0].galleryImagesJson)]
  for (const rel of paths) {
    if (!rel) continue
    const abs = path.resolve(process.cwd(), 'server', rel.replace(/^\//, '').replaceAll('/', path.sep))
    if (abs.startsWith(path.resolve(process.cwd(), 'server', 'uploads'))) {
      fs.promises.unlink(abs).catch(() => {})
    }
  }

  res.json({ ok: true })
})

router.get('/analytics/summary', async (_req, res) => {
  const [[campaigns]] = await pool.query('SELECT COUNT(*) AS total, SUM(status = "active") AS active, SUM(status = "draft") AS draft, SUM(status = "closed") AS closed FROM campaigns')
  const [[products]] = await pool.query('SELECT COUNT(*) AS total FROM products')
  const [[registrations]] = await pool.query('SELECT COUNT(*) AS total, SUM(payment_status = "paid") AS paid, SUM(payment_status = "pending") AS pending FROM registrations')
  const [[coupons]] = await pool.query('SELECT COUNT(*) AS total, SUM(status = "active") AS active FROM coupons')
  res.json({ ok: true, summary: { campaigns, products, registrations, coupons } })
})

router.get('/campaign-calendar', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT id, name, slug, workshop_date AS workshopDate, start_time AS startTime, status, seat_capacity AS seatCapacity
     FROM campaigns
     ORDER BY workshop_date ASC, start_time ASC`,
  )
  res.json({ ok: true, campaigns: rows })
})

router.get('/export/campaigns', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM campaigns ORDER BY id DESC')
  res.json({ ok: true, campaigns: rows })
})

router.get('/export/products', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC')
  res.json({ ok: true, products: rows })
})

router.post('/import/products', async (req, res) => {
  const products = Array.isArray(req.body?.products) ? req.body.products : []
  let inserted = 0
  for (const item of products) {
    if (!item?.title || !Number(item?.price)) continue
    await pool.query(
      `INSERT INTO products (title, price, description, main_image_url, gallery_images_json, created_by)
       VALUES (:title, :price, :description, :mainImageUrl, :galleryImagesJson, :createdBy)`,
      {
        title: String(item.title),
        price: Number(item.price),
        description: item.description || null,
        mainImageUrl: item.mainImageUrl || null,
        galleryImagesJson: JSON.stringify(Array.isArray(item.galleryImages) ? item.galleryImages : []),
        createdBy: req.admin.userId,
      },
    )
    inserted += 1
  }
  res.json({ ok: true, inserted })
})

router.get('/coupons', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM coupons ORDER BY id DESC')
  res.json({ ok: true, coupons: rows })
})

router.post('/coupons', async (req, res) => {
  const parsed = couponCreateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ ok: false, message: 'Invalid coupon payload' })
  const data = parsed.data
  const code = String(data.code).trim().toUpperCase()
  const [result] = await pool.query(
    `INSERT INTO coupons (code, discount_type, discount_value, min_amount, max_discount, usage_limit, status, start_date, end_date, created_by)
     VALUES (:code, :discountType, :discountValue, :minAmount, :maxDiscount, :usageLimit, :status, :startDate, :endDate, :createdBy)`,
    {
      code,
      discountType: data.discountType,
      discountValue: data.discountValue,
      minAmount: data.minAmount,
      maxDiscount: data.maxDiscount,
      usageLimit: data.usageLimit,
      status: data.status,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      createdBy: req.admin.userId,
    },
  )
  res.status(201).json({ ok: true, id: result.insertId })
})

router.delete('/coupons/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, message: 'Invalid coupon id' })
  await pool.query('DELETE FROM coupons WHERE id = :id', { id })
  res.json({ ok: true })
})

router.get('/registrations', async (req, res) => {
  const campaignId = Number(req.query.campaignId || 0)
  const paymentStatus = String(req.query.paymentStatus || '').trim().toLowerCase()
  const date = String(req.query.date || '').trim()
  const from = String(req.query.from || '').trim()
  const to = String(req.query.to || '').trim()
  const q = String(req.query.q || '').trim()

  const clauses = []
  const params = {}

  if (campaignId > 0) {
    clauses.push('r.campaign_id = :campaignId')
    params.campaignId = campaignId
  }
  if (paymentStatus) {
    clauses.push('r.payment_status = :paymentStatus')
    params.paymentStatus = paymentStatus
  }
  if (date) {
    clauses.push('DATE(r.registered_at) = :regDate')
    params.regDate = date
  }
  if (from) {
    clauses.push('DATE(r.registered_at) >= :fromDate')
    params.fromDate = from
  }
  if (to) {
    clauses.push('DATE(r.registered_at) <= :toDate')
    params.toDate = to
  }
  if (q) {
    clauses.push('(r.participant_name LIKE :q OR r.email LIKE :q OR r.mobile LIKE :q OR r.payment_reference_id LIKE :q OR c.name LIKE :q)')
    params.q = `%${q}%`
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''

  const [rows] = await pool.query(
    `SELECT
      r.id,
      r.participant_name AS participantName,
      r.email,
      r.mobile AS phone,
      c.id AS campaignId,
      c.name AS campaignName,
      r.payment_status AS paymentStatus,
      r.payment_reference_id AS paymentRefId,
      r.selected_design_name AS selectedDesign,
      DATE_FORMAT(r.registered_at, '%Y-%m-%d') AS registrationDate
     FROM registrations r
     INNER JOIN campaigns c ON c.id = r.campaign_id
     ${where}
     ORDER BY r.registered_at DESC`,
    params,
  )

  res.json({ ok: true, registrations: rows })
})

router.get('/registrations/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, message: 'Invalid registration id' })

  const [rows] = await pool.query(
    `SELECT
      r.*,
      c.slug AS campaignSlug,
      c.name AS campaignName,
      c.location AS campaignLocation,
      c.city AS campaignCity,
      DATE_FORMAT(c.workshop_date, '%Y-%m-%d') AS campaignDate,
      DATE_FORMAT(c.start_time, '%H:%i') AS campaignStartTime,
      c.status AS campaignStatus
     FROM registrations r
     INNER JOIN campaigns c ON c.id = r.campaign_id
     WHERE r.id = :id
     LIMIT 1`,
    { id },
  )

  if (!rows[0]) return res.status(404).json({ ok: false, message: 'Registration not found' })

  const [events] = await pool.query(
    `SELECT id, event_type AS eventType, provider, provider_event_id AS providerEventId,
            amount, status, created_at AS createdAt
     FROM payment_events
     WHERE registration_id = :id
     ORDER BY created_at DESC`,
    { id },
  )

  res.json({ ok: true, registration: rows[0], paymentEvents: events })
})

router.get('/leads', async (_req, res) => {
  const leads = await listLeads()
  res.json({ ok: true, leads })
})

router.patch('/leads/:id/status', async (req, res) => {
  const id = Number(req.params.id)
  const status = String(req.body?.status || '').trim()
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, message: 'Invalid lead id' })
  if (!['new', 'contacted', 'qualified', 'won', 'lost'].includes(status)) return res.status(400).json({ ok: false, message: 'Invalid status' })
  await updateLeadStatus(id, status)
  res.json({ ok: true })
})

export default router
