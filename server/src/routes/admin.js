import express from 'express'
import { pool } from '../lib/db.js'
import { campaignCreateSchema, campaignStatusSchema } from '../lib/validators.js'
import { requireAdminSession } from '../middleware/requireAdminSession.js'

const router = express.Router()

router.use(requireAdminSession)

router.get('/campaigns', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.slug, c.name, c.location, c.city,
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
    `SELECT id, slug, name, location, city,
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
            seo_title, seo_description
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
  }

  await pool.query(
    `INSERT INTO campaign_content
      (campaign_id, short_subtitle, badge_text, price_unit_label, total_example, overview, whats_included, detail_features, itinerary, faq, terms_and_policy, gallery, seo_title, seo_description)
     VALUES
      (:id, :shortSubtitle, :badgeText, :priceUnitLabel, :totalExample, :overview, :whatsIncluded, :detailFeatures, :itinerary, :faq, :termsAndPolicy, :gallery, :seoTitle, :seoDescription)
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
      (slug, name, location, city, workshop_date, start_time, price_pp, seat_capacity, status, created_by)
     VALUES
      (:slug, :name, :location, :city, :workshopDate, :startTime, :price, :seatCapacity, :status, :createdBy)`,
    {
      slug,
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

  res.status(201).json({ ok: true, id: result.insertId })
})

router.put('/campaigns/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ ok: false, message: 'Invalid campaign id' })

  const parsed = campaignCreateSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ ok: false, message: 'Invalid campaign payload' })

  const data = parsed.data
  await pool.query(
    `UPDATE campaigns SET
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

export default router
