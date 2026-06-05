import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'

const CAMPAIGN_TYPE_OPTIONS = [
  { value: 'city_workshop', label: 'Workshop in City' },
  { value: 'seasonal_promotion', label: 'Seasonal Promotion' },
  { value: 'discounted_workshop', label: 'Special Discounted Workshop' },
  { value: 'partner_couple', label: 'Partner/Couple Workshop' },
]

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 700, color: '#444' }}>
      <span>{label}</span>
      {children}
    </label>
  )
}

export default function AdminCampaignCreate() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    campaignType: 'city_workshop',
    seasonalLabel: '',
    name: '',
    location: '',
    city: '',
    workshopDate: '',
    startTime: '',
    price: '',
    seatCapacity: '',
    status: 'draft',
  })

  const addCampaign = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...newCampaign,
        price: Number(newCampaign.price),
        seatCapacity: Number(newCampaign.seatCapacity),
      }
      const res = await api.createCampaign(payload)
      setNewCampaign({
        campaignType: 'city_workshop',
        seasonalLabel: '',
        name: '',
        location: '',
        city: '',
        workshopDate: '',
        startTime: '',
        price: '',
        seatCapacity: '',
        status: 'draft',
      })
      if (res?.id) navigate(`/admin/campaign/${res.id}`)
    } catch (e2) {
      setError(e2.message || 'Failed creating campaign')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <div>
          <h2>Create New Campaign</h2>
          <p style={{ margin: '4px 0 0', color: '#74675d' }}>Fill campaign details, then open the editor.</p>
        </div>
        <Link className="admin-link-btn" to="/admin/campaigns">Back to Campaigns</Link>
      </div>

      {error && <div className="admin-error" style={{ marginBottom: 12 }}>{error}</div>}

      <form className="admin-form-grid" onSubmit={addCampaign}>
        <Field label="Campaign Type">
          <select value={newCampaign.campaignType} onChange={(e) => setNewCampaign((s) => ({ ...s, campaignType: e.target.value }))}>
            {CAMPAIGN_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        {newCampaign.campaignType === 'seasonal_promotion' && (
          <Field label="Which Seasonal Promotion">
            <input
              placeholder="Valentine's Day, Women's Day..."
              value={newCampaign.seasonalLabel}
              onChange={(e) => setNewCampaign((s) => ({ ...s, seasonalLabel: e.target.value }))}
              required
            />
          </Field>
        )}

        <Field label="Campaign Name">
          <input placeholder="Campaign name" value={newCampaign.name} onChange={(e) => setNewCampaign((s) => ({ ...s, name: e.target.value }))} required />
        </Field>
        <Field label="Location">
          <input placeholder="Location" value={newCampaign.location} onChange={(e) => setNewCampaign((s) => ({ ...s, location: e.target.value }))} required />
        </Field>
        <Field label="City">
          <input placeholder="City" value={newCampaign.city} onChange={(e) => setNewCampaign((s) => ({ ...s, city: e.target.value }))} />
        </Field>
        <Field label="Workshop Date">
          <input type="date" value={newCampaign.workshopDate} onChange={(e) => setNewCampaign((s) => ({ ...s, workshopDate: e.target.value }))} required />
        </Field>
        <Field label="Start Time">
          <input type="time" value={newCampaign.startTime} onChange={(e) => setNewCampaign((s) => ({ ...s, startTime: e.target.value }))} required />
        </Field>
        <Field label="Price">
          <input type="number" min="1" step="0.01" placeholder="Price" value={newCampaign.price} onChange={(e) => setNewCampaign((s) => ({ ...s, price: e.target.value }))} required />
        </Field>
        <Field label="Seat Capacity">
          <input type="number" min="1" placeholder="Seats" value={newCampaign.seatCapacity} onChange={(e) => setNewCampaign((s) => ({ ...s, seatCapacity: e.target.value }))} required />
        </Field>
        <Field label="Status">
          <select value={newCampaign.status} onChange={(e) => setNewCampaign((s) => ({ ...s, status: e.target.value }))}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </Field>

        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Campaign'}</button>
      </form>
    </section>
  )
}
