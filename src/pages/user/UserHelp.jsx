import { useState } from 'react'
import { useUserSession } from '../../context/UserSessionContext'
import { api } from '../../services/api'

export default function UserHelp() {
  const { session } = useUserSession()
  const [mode, setMode] = useState('case')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [waLink, setWaLink] = useState('')
  const [form, setForm] = useState({
    name: session?.fullName || '',
    email: session?.email || '',
    mobile: session?.mobile || '',
    subject: '',
    registrationCode: '',
    transactionId: '',
    paymentStatus: '',
    message: '',
  })

  const onChange = (key, value) => setForm((s) => ({ ...s, [key]: value }))
  const validate = () => {
    const next = {}
    if (!form.subject.trim()) next.subject = 'Subject is required'
    if (!form.message.trim()) next.message = 'Query details are required'
    if (form.transactionId && form.transactionId.trim().length < 4) next.transactionId = 'Transaction ID looks too short'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const onRaiseCase = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')
    setOk('')
    setWaLink('')
    if (!validate()) return
    try {
      setLoading(true)
      await api.raiseCase({
        subject: form.subject,
        message: form.message,
        registrationCode: form.registrationCode,
        transactionId: form.transactionId,
        paymentStatus: form.paymentStatus,
      })
      setOk('Case raised successfully.')
    } catch (err) {
      setError(err.message || 'Failed to raise case')
    } finally {
      setLoading(false)
    }
  }

  const onWhatsApp = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')
    setOk('')
    if (!validate()) return
    try {
      setLoading(true)
      const r = await api.raiseCase({
        subject: form.subject,
        message: form.message,
        registrationCode: form.registrationCode,
        transactionId: form.transactionId,
        paymentStatus: form.paymentStatus,
      })
      setWaLink(r.whatsapp || '')
      if (r.whatsapp) window.open(r.whatsapp, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setError(err.message || 'Failed to prepare WhatsApp message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="admin-card user-profile-card">
      <div className="user-profile-head">
        <h2>Help & Support</h2>
        <p>Choose support type and submit issue details.</p>
      </div>
      <div className="admin-nav-tabs" style={{ marginBottom: 14 }}>
        <button type="button" className={`admin-tab ${mode === 'case' ? 'active' : ''}`} onClick={() => setMode('case')}>Raise Case</button>
        <button type="button" className={`admin-tab ${mode === 'wa' ? 'active' : ''}`} onClick={() => setMode('wa')}>WhatsApp Support</button>
      </div>

      <form onSubmit={mode === 'case' ? onRaiseCase : onWhatsApp}>
        <div className="user-profile-grid">
          <div className="user-profile-field"><label>Name</label><input value={form.name} disabled readOnly className="user-profile-locked" /></div>
          <div className="user-profile-field"><label>Email</label><input value={form.email} disabled readOnly className="user-profile-locked" /></div>
          <div className="user-profile-field"><label>Mobile</label><input value={form.mobile} disabled readOnly className="user-profile-locked" /></div>
          <div className="user-profile-field"><label>Subject</label><input value={form.subject} onChange={(e) => onChange('subject', e.target.value)} placeholder="Payment issue, login issue, booking update..." />{fieldErrors.subject ? <div className="user-field-error">{fieldErrors.subject}</div> : null}</div>
          <div className="user-profile-field"><label>Registration Code</label><input value={form.registrationCode} onChange={(e) => onChange('registrationCode', e.target.value)} placeholder="CORP-..." /></div>
          <div className="user-profile-field"><label>Payment Transaction ID</label><input value={form.transactionId} onChange={(e) => onChange('transactionId', e.target.value)} placeholder="HDFC/TXN id" />{fieldErrors.transactionId ? <div className="user-field-error">{fieldErrors.transactionId}</div> : null}</div>
          <div className="user-profile-field user-profile-full"><label>Payment Status</label><input value={form.paymentStatus} onChange={(e) => onChange('paymentStatus', e.target.value)} placeholder="paid / pending / failed" /></div>
          <div className="user-profile-field user-profile-full">
            <label>Query Details</label>
            <textarea value={form.message} onChange={(e) => onChange('message', e.target.value)} placeholder="Write complete issue details..." style={{ width: '100%', minHeight: 130, padding: 11, border: '1.5px solid var(--color-border)', borderRadius: 10 }} />
            {fieldErrors.message ? <div className="user-field-error">{fieldErrors.message}</div> : null}
          </div>
        </div>
        <button className="user-profile-submit" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : (mode === 'case' ? 'Raise Case' : 'Send on WhatsApp')}
        </button>
      </form>
      {error ? <div className="admin-error">{error}</div> : null}
      {ok ? <div style={{ marginTop: 12, color: '#257544', fontSize: 13 }}>{ok}</div> : null}
      {waLink ? <p style={{ marginTop: 10, fontSize: 13 }}><a href={waLink} target="_blank" rel="noreferrer">Open WhatsApp Message</a></p> : null}
    </section>
  )
}
