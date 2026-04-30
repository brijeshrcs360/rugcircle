import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { PACKAGES } from '../constants/packages'
import { formatCurrency, calculatePricing } from '../utils/format'
import {
  generatePaymentQR,
  pollPaymentStatus,
  HDFC_CONFIG,
  simulateWebhookPayment,
  simulateFailedPayment,
  clearPaymentSimulation,
} from '../services/hdfcVyapar'
import { api } from '../services/api'

const staticMap = Object.fromEntries(PACKAGES.map((p) => [p.slug, p]))

export default function Payment() {
  const { slug } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    navigate(`/register/${slug}?step=1`, { replace: true })
  }, [navigate, slug])

  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true)

  const [payPercent, setPayPercent] = useState(50)
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', gst: '' })
  const [processing, setProcessing] = useState(false)
  const [qrData, setQrData] = useState(null)
  const [paymentError, setPaymentError] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('idle')
  const [simulatorPayload, setSimulatorPayload] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    api.getPublicCampaignBySlug(slug)
      .then((res) => setCampaign(res.campaign || null))
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false))
  }, [slug])

  const staticPkg = staticMap[slug]

  const isPerPerson = slug !== 'brand-rug'
  const minPeople = staticPkg?.minPeople || 1
  const maxPeople = staticPkg?.maxPeople || Math.max(1, Number(campaign?.seatCapacity || 50))

  const [people, setPeople] = useState(minPeople)

  useEffect(() => {
    setPeople(minPeople)
  }, [slug, minPeople])

  const campaignName = campaign?.name || staticPkg?.title
  const subtitle = campaign ? `${campaign.location}${campaign.city ? `, ${campaign.city}` : ''}` : staticPkg?.location
  const pricePerPerson = Number(campaign?.price || staticPkg?.pricePerPerson || 0)

  const qty = isPerPerson ? people : 1
  const { subtotal, gst, total } = calculatePricing(pricePerPerson, qty)
  const halfAmount = Math.round(total * 0.5)
  const fullAmount = total
  const payableAmount = payPercent === 100 ? fullAmount : halfAmount

  const handlePayment = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setPaymentError('')
    setPaymentStatus('waiting')
    try {
      const registrationCode = `CORP-${Date.now()}`
      const qr = await generatePaymentQR(payableAmount, registrationCode)
      clearPaymentSimulation(registrationCode)
      setQrData(qr)
    } catch (err) {
      setPaymentStatus('failed')
      setPaymentError(err?.message || 'Failed to create HDFC payment QR.')
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    if (!qrData || paymentStatus !== 'waiting') return
    const pollTimer = setInterval(async () => {
      try {
        const res = await pollPaymentStatus(qrData.hdfc_reference_id, qrData.registration_code)
        if (res.status === 'paid') {
          setPaymentStatus('paid')
          navigate('/success', {
            state: {
              paymentId: res.transaction_id || qrData.hdfc_reference_id,
              package: campaignName,
              amount: payableAmount,
              people,
            },
          })
        } else if (res.status === 'failed') {
          setPaymentStatus('failed')
          setPaymentError(res.error_message || 'Payment failed')
        }
      } catch (err) {
        setPaymentStatus('failed')
        setPaymentError(err?.message || 'Polling failed')
      }
    }, HDFC_CONFIG.POLL_INTERVAL_MS)
    return () => clearInterval(pollTimer)
  }, [qrData, paymentStatus, navigate, campaignName, payableAmount, people])

  const applySimulatorStatus = (mode) => {
    if (!qrData?.registration_code) return
    const code = qrData.registration_code
    if (mode === 'success') {
      simulateWebhookPayment(code)
      setSimulatorPayload(JSON.stringify({ event: 'PAYMENT_SUCCESS', registration_code: code }, null, 2))
      return
    }
    if (mode === 'failed') {
      simulateFailedPayment(code)
      setSimulatorPayload(JSON.stringify({ event: 'PAYMENT_FAILED', registration_code: code, reason: 'DECLINED' }, null, 2))
      return
    }
    if (mode === 'pending') {
      clearPaymentSimulation(code)
      setPaymentStatus('waiting')
      setPaymentError('')
      setSimulatorPayload(JSON.stringify({ event: 'PAYMENT_PENDING', registration_code: code }, null, 2))
      return
    }
    if (mode === 'expired') {
      setPaymentStatus('failed')
      setPaymentError('QR expired in simulator. Regenerate payment.')
      setSimulatorPayload(JSON.stringify({ event: 'PAYMENT_EXPIRED', registration_code: code }, null, 2))
      return
    }
    if (mode === 'gateway_error') {
      setPaymentStatus('failed')
      setPaymentError('Simulator gateway error: SG_500_INTERNAL')
      setSimulatorPayload(
        JSON.stringify({ event: 'PAYMENT_ERROR', code: 'SG_500_INTERNAL', registration_code: code, message: 'Internal gateway error' }, null, 2),
      )
    }
  }

  if (loading) {
    return (
      <div className="payment-page">
        <div style={{ textAlign: 'center', paddingTop: 100 }}>
          <h1>Loading payment page...</h1>
        </div>
      </div>
    )
  }

  if (!campaignName || !pricePerPerson) {
    return (
      <div className="payment-page">
        <div style={{ textAlign: 'center', paddingTop: 100 }}>
          <h1>Package not found</h1>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: 24 }}>
            Back to home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-page">
      <motion.div className="payment-inner" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-item">
            <div>
              <div className="order-item-name">{campaignName}</div>
              <div className="order-item-desc">{subtitle}</div>
            </div>
            <div className="order-item-price">{formatCurrency(pricePerPerson)}</div>
          </div>

          {isPerPerson && (
            <div className="order-item">
              <div>
                <div className="order-item-name">Team size</div>
                <div className="order-item-desc">
                  <div className="payment-team-size-row">
                    <button type="button" onClick={() => setPeople(Math.max(minPeople, people - 1))} style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>-</button>
                    <span style={{ fontSize: 20, fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{people}</span>
                    <button type="button" onClick={() => setPeople(Math.min(maxPeople, people + 1))} style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid var(--color-border)', background: 'var(--color-bg)', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>+</button>
                    <span style={{ fontSize: 13, color: '#888' }}>({minPeople}-{maxPeople} people)</span>
                  </div>
                </div>
              </div>
              <div className="order-item-price">x{people}</div>
            </div>
          )}

          <div className="order-item"><div><div className="order-item-name">Subtotal</div></div><div className="order-item-price">{formatCurrency(subtotal)}</div></div>
          <div className="order-item"><div><div className="order-item-name">GST (18%)</div></div><div className="order-item-price">{formatCurrency(gst)}</div></div>
          <div className="order-total"><span>Total</span><span className="amount">{formatCurrency(total)}</span></div>
        </div>

        <form className="payment-form" onSubmit={handlePayment}>
          <h2>Registration Details</h2>

          <div className="form-grid">
            <div className="form-group"><label>Full name</label><input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" /></div>
            <div className="form-group"><label>Company</label><input type="text" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" /></div>
            <div className="form-group"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="billing@company.com" /></div>
            <div className="form-group"><label>Phone</label><input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" /></div>
            <div className="form-group full"><label>GST Number (optional)</label><input type="text" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} placeholder="22AAAAA0000A1Z5" /></div>
          </div>

          <div style={{ marginTop: 24 }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>Select Payment Plan</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { percent: 50, label: '50% Advance', desc: 'Pay half now, balance on event' },
                { percent: 100, label: '100% Full Payment', desc: 'Pay complete amount now' }
              ].map(({ percent, label, desc }) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => setPayPercent(percent)}
                  style={{
                    padding: '16px',
                    borderRadius: 12,
                    border: payPercent === percent ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                    background: payPercent === percent ? 'rgba(225,128,45,0.1)' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: payPercent === percent ? '0 2px 8px rgba(225,128,45,0.15)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-primary)' }}>
                    {formatCurrency(percent === 50 ? halfAmount : fullAmount)}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{label}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="pay-btn" disabled={processing}>
            {processing ? 'Processing...' : `Pay ${formatCurrency(payableAmount)} with HDFC Vyapar`}
          </button>

          <div className="secure-badge"><span>Lock</span><span>Secure payment · GST-compliant invoice</span></div>

          {qrData && paymentStatus === 'waiting' && (
            <div style={{ marginTop: 16, border: '1.5px solid var(--color-border)', borderRadius: 12, padding: 14, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Scan HDFC UPI QR</div>
              <img src={qrData.qr_code} alt="HDFC UPI QR" style={{ width: 180, height: 180, borderRadius: 8 }} />
              <div style={{ marginTop: 10 }}>
                <a href={qrData.upi_string} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Open UPI Link</a>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: '#777' }}>Checking payment every 5 seconds...</div>
            </div>
          )}

          {paymentError && (
            <div style={{ marginTop: 12, color: '#b00020', fontSize: 13, fontWeight: 600 }}>
              {paymentError}
            </div>
          )}

          {import.meta.env.DEV && qrData && (
            <div style={{ marginTop: 16, border: '1.5px dashed #c7c7c7', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Simulator Controls</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <button type="button" onClick={() => applySimulatorStatus('success')}>Success</button>
                <button type="button" onClick={() => applySimulatorStatus('failed')}>Failed</button>
                <button type="button" onClick={() => applySimulatorStatus('pending')}>Pending</button>
                <button type="button" onClick={() => applySimulatorStatus('expired')}>Expired</button>
                <button type="button" onClick={() => applySimulatorStatus('gateway_error')}>Gateway Error</button>
              </div>
              {simulatorPayload && (
                <pre style={{ marginTop: 10, padding: 10, background: '#f8f8f8', borderRadius: 8, fontSize: 11, overflow: 'auto' }}>
                  {simulatorPayload}
                </pre>
              )}
            </div>
          )}
        </form>
      </motion.div>
    </div>
  )
}
