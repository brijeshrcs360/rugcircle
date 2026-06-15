import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import useSEO from '../../hooks/useSEO'

function nextStatus(current) {
  if (current === 'draft') return 'active'
  if (current === 'active') return 'closed'
  return 'draft'
}

const CAMPAIGN_TYPE_OPTIONS = [
  { value: 'city_workshop', label: 'Workshop in City' },
  { value: 'seasonal_promotion', label: 'Seasonal Promotion' },
  { value: 'discounted_workshop', label: 'Special Discounted Workshop' },
  { value: 'partner_couple', label: 'Partner/Couple Workshop' },
]

export default function AdminCampaigns() {
  useSEO({
    title: 'Admin Campaigns',
    description: 'Create, edit, and manage Rug Circle campaigns from the admin panel.',
    canonical: '/admin/campaigns',
    robots: 'noindex, nofollow',
  })

  const [campaigns, setCampaigns] = useState([])
  const [error, setError] = useState('')

  const fetchCampaigns = async () => {
    const res = await api.listCampaigns()
    setCampaigns(res.campaigns || [])
  }

  useEffect(() => {
    fetchCampaigns().catch((e) => setError(e.message || 'Failed loading campaigns'))
  }, [])

  const toggleStatus = async (id, currentStatus) => {
    await api.updateCampaignStatus(id, nextStatus(currentStatus))
    await fetchCampaigns()
  }

  const duplicateCampaign = async (id) => {
    await api.duplicateCampaign(id)
    await fetchCampaigns()
  }

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <div>
          <h2>Campaign List</h2>
          <p style={{ margin: '4px 0 0', color: '#74675d' }}>Create new campaigns from a separate page.</p>
        </div>
        <Link className="admin-link-btn" to="/admin/campaigns/new">Create New Campaign</Link>
      </div>

      {error && <div className="admin-error" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Type</th><th>Date</th><th>Location</th><th>Price</th><th>Seats</th><th>Status</th><th>Registrations</th><th>Edit</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{CAMPAIGN_TYPE_OPTIONS.find((o) => o.value === c.campaignType)?.label || c.campaignType || '-'}</td>
                <td>{c.workshopDate} {c.startTime}</td>
                <td>{c.location}</td>
                <td>INR {Number(c.price).toLocaleString()}</td>
                <td>{c.seatCapacity}</td>
                <td><span className={`status-pill ${c.status}`}>{c.status}</span></td>
                <td>{c.registrationCount || 0} ({c.paidCount || 0} paid)</td>
                <td><Link className="admin-link-btn" to={`/admin/campaign/${c.id}`}>Open</Link></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Link className="admin-link-btn" to={`/admin/registrations?campaignId=${c.id}`}>Registrations</Link>
                    <button onClick={() => duplicateCampaign(c.id)}>Duplicate</button>
                    <button onClick={() => toggleStatus(c.id, c.status)}>Cycle</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
