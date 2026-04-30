import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../services/api'

function money(n) {
  const v = Number(n || 0)
  return `INR ${v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function AdminRegistrationDetails() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [registration, setRegistration] = useState(null)
  const [events, setEvents] = useState([])

  useEffect(() => {
    api.getRegistrationById(id)
      .then((res) => {
        setRegistration(res.registration || null)
        setEvents(res.paymentEvents || [])
      })
      .catch((e) => setError(e.message || 'Failed loading registration'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="admin-page">Loading registration...</div>
  if (!registration) return <div className="admin-page"><div className="admin-card">Registration not found.</div></div>

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div>
          <h1>Registration Details</h1>
          <p>ID: {registration.id} · Code: {registration.registration_code}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="admin-link-btn" to="/admin/registrations">Back</Link>
          <Link className="admin-link-btn" to={`/admin/campaign/${registration.campaign_id}`}>Open Campaign</Link>
        </div>
      </header>

      {error && <div className="admin-error" style={{ marginBottom: 12 }}>{error}</div>}

      <section className="admin-card" style={{ marginBottom: 16 }}>
        <h2>Participant</h2>
        <div className="admin-form-grid">
          <input readOnly value={registration.participant_name || ''} />
          <input readOnly value={registration.email || ''} />
          <input readOnly value={registration.mobile || ''} />
          <input readOnly value={registration.company_name || ''} />
          <input readOnly value={registration.selected_design_name || ''} />
          <input readOnly value={String(registration.team_size || '')} />
          <input readOnly value={registration.payment_status || ''} />
          <input readOnly value={registration.payment_reference_id || ''} />
        </div>
      </section>

      <section className="admin-card" style={{ marginBottom: 16 }}>
        <h2>Campaign</h2>
        <div className="admin-form-grid">
          <input readOnly value={registration.campaignName || ''} />
          <input readOnly value={registration.campaignSlug || ''} />
          <input readOnly value={`${registration.campaignLocation || ''}${registration.campaignCity ? `, ${registration.campaignCity}` : ''}`} />
          <input readOnly value={`${registration.campaignDate || ''} ${registration.campaignStartTime || ''}`} />
          <input readOnly value={registration.campaignStatus || ''} />
          <input readOnly value={registration.registered_at || ''} />
        </div>
      </section>

      <section className="admin-card" style={{ marginBottom: 16 }}>
        <h2>Payment Breakdown</h2>
        <div className="admin-kpi-grid">
          <div className="admin-kpi"><div className="n">{money(registration.amount_subtotal)}</div><div className="l">Subtotal</div></div>
          <div className="admin-kpi"><div className="n">{money(registration.amount_gst)}</div><div className="l">GST</div></div>
          <div className="admin-kpi"><div className="n">{money(registration.amount_total)}</div><div className="l">Total</div></div>
          <div className="admin-kpi"><div className="n">{money(registration.amount_advance)}</div><div className="l">Advance</div></div>
        </div>
      </section>

      <section className="admin-card" style={{ marginBottom: 16 }}>
        <h2>Notes</h2>
        <textarea readOnly style={{ width: '100%', minHeight: 90, border: '1px solid var(--color-border)', borderRadius: 10, padding: 10 }} value={registration.notes || ''} />
      </section>

      <section className="admin-card">
        <h2>Payment Events</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>Type</th><th>Provider</th><th>Provider Event ID</th><th>Status</th><th>Amount</th><th>Created</th></tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr><td colSpan={7}>No payment events</td></tr>
              ) : events.map((ev) => (
                <tr key={ev.id}>
                  <td>{ev.id}</td>
                  <td>{ev.eventType}</td>
                  <td>{ev.provider}</td>
                  <td>{ev.providerEventId || '-'}</td>
                  <td>{ev.status || '-'}</td>
                  <td>{ev.amount != null ? money(ev.amount) : '-'}</td>
                  <td>{ev.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
