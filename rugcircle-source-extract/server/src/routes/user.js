import express from 'express'
import { pool } from '../lib/db.js'
import { config } from '../config/env.js'
import bcrypt from 'bcryptjs'
import { getUserCookieConfig } from '../services/userService.js'
import {
  createBookingHandler,
  loginHandler,
  paymentWebhookHandler,
  requestOtpHandler,
  requireUser,
} from '../controllers/userController.js'

const router = express.Router()

router.post('/bookings', createBookingHandler)
router.post('/login', loginHandler)
router.post('/request-otp', requestOtpHandler)
router.post('/payment/webhook', paymentWebhookHandler)

router.post('/logout', requireUser, async (req, res) => {
  const { cookieCfg } = getUserCookieConfig()
  await pool.query('DELETE FROM user_sessions WHERE id=:id', { id: req.user.sessionId })
  res.clearCookie('rc_user_session', cookieCfg)
  res.json({ ok: true })
})

router.get('/me', requireUser, async (req, res) => res.json({ ok: true, user: req.user }))
router.get('/dashboard', requireUser, async (req, res) => {
  const [countRows] = await pool.query('SELECT COUNT(*) AS bookings FROM registrations WHERE user_id=:uid', { uid: req.user.id })
  const [activityRows] = await pool.query('SELECT activity_type AS activityType, created_at AS createdAt FROM user_activities WHERE user_id=:uid ORDER BY id DESC LIMIT 10', { uid: req.user.id })
  res.json({ ok: true, dashboard: { bookings: Number(countRows[0]?.bookings || 0), recentActivity: activityRows } })
})
router.get('/bookings', requireUser, async (req, res) => {
  const [rows] = await pool.query(`SELECT r.id, r.registration_code AS registrationCode, c.name AS campaignName, r.selected_design_name AS selectedDesignName,
    r.payment_status AS paymentStatus, r.amount_total AS amountTotal, DATE_FORMAT(r.registered_at, '%Y-%m-%d %H:%i') AS bookedAt
    FROM registrations r INNER JOIN campaigns c ON c.id=r.campaign_id WHERE r.user_id=:uid ORDER BY r.id DESC`, { uid: req.user.id })
  res.json({ ok: true, bookings: rows })
})
router.get('/bookings/:id', requireUser, async (req, res) => {
  const id = Number(req.params.id)
  const [rows] = await pool.query(`SELECT r.*, c.name AS campaignName, c.location, c.city FROM registrations r INNER JOIN campaigns c ON c.id=r.campaign_id
    WHERE r.id=:id AND r.user_id=:uid LIMIT 1`, { id, uid: req.user.id })
  if (!rows[0]) return res.status(404).json({ ok: false, message: 'Booking not found' })
  res.json({ ok: true, booking: rows[0] })
})
router.post('/help/case', requireUser, async (req, res) => {
  const subject = String(req.body?.subject || '').trim()
  const msg = String(req.body?.message || '').trim()
  const registrationCode = String(req.body?.registrationCode || '').trim()
  const transactionId = String(req.body?.transactionId || '').trim()
  const paymentStatus = String(req.body?.paymentStatus || '').trim()
  if (!msg) return res.status(400).json({ ok: false, message: 'Message required' })
  const payload = {
    subject: subject || 'Support Case',
    message: msg,
    registrationCode: registrationCode || null,
    transactionId: transactionId || null,
    paymentStatus: paymentStatus || null,
    email: req.user.email,
    mobile: req.user.mobile,
  }
  await pool.query('INSERT INTO user_activities (user_id, activity_type, meta) VALUES (:uid,:type,:meta)', { uid: req.user.id, type: 'support_case_raised', meta: JSON.stringify(payload) })
  const waText = [
    'Rug Circle Support Request',
    `Name: ${req.user.fullName || '-'}`,
    `Email: ${req.user.email || '-'}`,
    `Mobile: ${req.user.mobile || '-'}`,
    `Subject: ${payload.subject}`,
    `Registration Code: ${registrationCode || '-'}`,
    `Payment Transaction ID: ${transactionId || '-'}`,
    `Payment Status: ${paymentStatus || '-'}`,
    `Query: ${msg}`,
  ].join('\n')
  const waNumber = String(config.support.whatsappNumber || '').replace(/[^\d]/g, '')
  if (!waNumber) return res.status(500).json({ ok: false, message: 'Support WhatsApp number not configured' })
  res.status(201).json({ ok: true, whatsapp: `https://wa.me/${waNumber}?text=` + encodeURIComponent(waText) })
})
router.post('/profile/password', requireUser, async (req, res) => {
  const newPassword = String(req.body?.newPassword || '')
  if (newPassword.length < 8) return res.status(400).json({ ok: false, message: 'New password must be at least 8 characters' })
  const [rows] = await pool.query('SELECT id, password_hash FROM app_users WHERE id=:id LIMIT 1', { id: req.user.id })
  const u = rows[0]
  if (!u) return res.status(404).json({ ok: false, message: 'User not found' })
  const nextHash = await bcrypt.hash(newPassword, 10)
  await pool.query('UPDATE app_users SET password_hash=:h WHERE id=:id', { h: nextHash, id: req.user.id })
  await pool.query('DELETE FROM user_sessions WHERE user_id=:uid AND id<>:sid', { uid: req.user.id, sid: req.user.sessionId })
  res.json({ ok: true, message: 'Password updated' })
})

export default router
