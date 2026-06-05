import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'

const QUICK_LINKS = [
  { to: '/admin/campaigns', title: 'Campaigns', text: 'Create, edit, and manage campaign pages.' },
  { to: '/admin/products', title: 'Products', text: 'Add rugs, update pricing, and manage images.' },
  { to: '/admin/registrations', title: 'Registrations', text: 'Filter bookings and open full records.' },
]

export default function AdminOverview() {
  const [campaigns, setCampaigns] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.listCampaigns(), api.listRegistrations({})])
      .then(([c, r]) => {
        setCampaigns(c.campaigns || [])
        setRegistrations(r.registrations || [])
      })
      .catch((e) => setError(e.message || 'Failed loading dashboard'))
  }, [])

  const stats = useMemo(() => {
    const totalCampaigns = campaigns.length
    const activeCampaigns = campaigns.filter((c) => c.status === 'active').length
    const totalRegs = registrations.length
    const paidRegs = registrations.filter((r) => String(r.paymentStatus).toLowerCase() === 'paid').length
    const draftCampaigns = campaigns.filter((c) => c.status === 'draft').length
    const closedCampaigns = campaigns.filter((c) => c.status === 'closed').length
    return { totalCampaigns, activeCampaigns, draftCampaigns, closedCampaigns, totalRegs, paidRegs }
  }, [campaigns, registrations])

  const recentCampaigns = campaigns.slice(0, 5)
  const recentRegistrations = registrations.slice(0, 5)

  return (
    <>
      <section
        className="admin-card"
        style={{
          marginBottom: 16,
          background: 'linear-gradient(135deg, rgba(255, 251, 244, 0.98), rgba(255, 246, 235, 0.98))',
          border: '1px solid rgba(225, 128, 45, 0.16)',
          overflow: 'hidden',
        }}
      >
        <div className="admin-overview-hero">
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#b05c14', marginBottom: 10 }}>Control room</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', lineHeight: 1.05, marginBottom: 10 }}>Dashboard.</h2>
            <p style={{ color: '#6f5f52', maxWidth: 640, lineHeight: 1.7 }}>
              This is the admin home base. Open a page from the sidebar, or jump straight into recent work below.
            </p>
          </div>
        </div>

        {error && <div className="admin-error" style={{ marginTop: 16 }}>{error}</div>}
      </section>

      <section className="admin-card admin-overview-stats">
        <div className="admin-kpi-grid admin-overview-metrics">
          <div className="admin-kpi"><div className="n">{stats.activeCampaigns}</div><div className="l">Active</div></div>
          <div className="admin-kpi"><div className="n">{stats.totalRegs}</div><div className="l">Registrations</div></div>
          <div className="admin-kpi"><div className="n">{stats.draftCampaigns}</div><div className="l">Drafts</div></div>
          <div className="admin-kpi"><div className="n">{stats.paidRegs}</div><div className="l">Paid</div></div>
        </div>
      </section>

      <section className="admin-card">
        <h2>Quick Links</h2>
        <div className="admin-content-grid admin-overview-quicklinks" style={{ marginTop: 12 }}>
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="admin-card"
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                marginBottom: 0,
                borderRadius: 18,
                border: '1px solid rgba(225, 128, 45, 0.12)',
              }}
            >
              <h3 style={{ marginBottom: 8 }}>{item.title}</h3>
              <p style={{ margin: 0, color: '#666' }}>{item.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-grid">
        <div className="admin-card">
          <div className="admin-card-head">
            <h2>Recent Campaigns</h2>
            <Link className="admin-link-btn" to="/admin/campaigns">Open all</Link>
          </div>
          <div className="admin-table-wrap admin-overview-table-wrap">
            <table className="admin-table admin-overview-table">
              <thead>
                <tr><th>Name</th><th>Date</th><th>Status</th><th>Open</th></tr>
              </thead>
              <tbody>
                {recentCampaigns.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.workshopDate}</td>
                    <td><span className={`status-pill ${c.status}`}>{c.status}</span></td>
                    <td><Link className="admin-link-btn" to={`/admin/campaign/${c.id}`}>Open</Link></td>
                  </tr>
                ))}
                {recentCampaigns.length === 0 && <tr><td colSpan={4}>No campaigns yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-head">
            <h2>Recent Registrations</h2>
            <Link className="admin-link-btn" to="/admin/registrations">Open all</Link>
          </div>
          <div className="admin-table-wrap admin-overview-table-wrap">
            <table className="admin-table admin-overview-table admin-overview-registrations-table">
              <thead>
                <tr><th>Participant</th><th>Campaign</th><th>Payment</th></tr>
              </thead>
              <tbody>
                {recentRegistrations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.participantName}</td>
                    <td>{r.campaignName || '-'}</td>
                    <td><span className={`status-pill ${String(r.paymentStatus || '').toLowerCase()}`}>{r.paymentStatus}</span></td>
                  </tr>
                ))}
                {recentRegistrations.length === 0 && <tr><td colSpan={3}>No registrations yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}
