import nodemailer from 'nodemailer'
import { pool } from '../lib/db.js'
import { config } from '../config/env.js'

function makeTransport() {
  if (!config.mail.host || !config.mail.user || !config.mail.pass) return null
  return nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.port === 465,
    auth: { user: config.mail.user, pass: config.mail.pass },
  })
}

async function sendMail(subject, text) {
  const transporter = makeTransport()
  if (!transporter) return
  await transporter.sendMail({
    from: config.mail.from,
    to: config.support.email || config.mail.from,
    subject,
    text,
  })
}

export async function createLead(payload) {
  const name = String(payload.name || '').trim()
  const email = String(payload.email || '').trim().toLowerCase()
  if (!name || !email) throw Object.assign(new Error('Name and email required'), { status: 400 })

  const whatsappNumber = String(config.support.whatsappNumber || '').replace(/[^\d]/g, '')
  const waText = [
    'Rug Circle Lead',
    `Name: ${name}`,
    `Company: ${payload.company || '-'}`,
    `Email: ${email}`,
    `Phone: ${payload.phone || '-'}`,
    `Team size: ${payload.teamSize || '-'}`,
    `Interested in: ${payload.interest || '-'}`,
    `Date window: ${payload.dateWindow || '-'}`,
    `Message: ${payload.message || '-'}`,
  ].join('\n')
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waText)}` : null

  const [result] = await pool.query(
    `INSERT INTO leads (name, company, email, phone, team_size, interest, date_window, message, source, status, whatsapp_link)
     VALUES (:name, :company, :email, :phone, :teamSize, :interest, :dateWindow, :message, 'website', 'new', :whatsappLink)`,
    {
      name,
      company: payload.company || null,
      email,
      phone: payload.phone || null,
      teamSize: payload.teamSize || null,
      interest: payload.interest || null,
      dateWindow: payload.dateWindow || null,
      message: payload.message || null,
      whatsappLink,
    },
  )

  await sendMail(
    `New Rug Circle lead: ${name}`,
    [
      `Lead ID: ${result.insertId}`,
      `Name: ${name}`,
      `Company: ${payload.company || '-'}`,
      `Email: ${email}`,
      `Phone: ${payload.phone || '-'}`,
      `Team size: ${payload.teamSize || '-'}`,
      `Interest: ${payload.interest || '-'}`,
      `Date window: ${payload.dateWindow || '-'}`,
      `Message: ${payload.message || '-'}`,
      whatsappLink ? `WhatsApp: ${whatsappLink}` : null,
    ].filter(Boolean).join('\n'),
  )

  return { ok: true, leadId: result.insertId, whatsapp: whatsappLink }
}

export async function listLeads() {
  const [rows] = await pool.query('SELECT * FROM leads ORDER BY id DESC')
  return rows
}

export async function updateLeadStatus(id, status) {
  await pool.query('UPDATE leads SET status=:status WHERE id=:id', { id, status })
  return { ok: true }
}
