import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'

function nextStatus(current) {
  if (current === 'draft') return 'active'
  if (current === 'active') return 'closed'
  return 'draft'
}

export default function AdminCampaigns() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState([])
  const [error, setError] = useState('')
  const [newCampaign, setNewCampaign] = useState({
    name: '', location: '', city: '', workshopDate: '', startTime: '', price: '', seatCapacity: '', status: 'draft',
  })

  const fetchCampaigns = async () => {
    const res = await api.listCampaigns()
    setCampaigns(res.campaigns || [])
  }

  useEffect(() => {
    fetchCampaigns().catch((e) => setError(e.message || 'Failed loading campaigns'))
  }, [])

  const addCampaign = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...newCampaign, price: Number(newCampaign.price), seatCapacity: Number(newCampaign.seatCapacity) }
      const res = await api.createCampaign(payload)
      await fetchCampaigns()
      setNewCampaign({ name: '', location: '', city: '', workshopDate: '', startTime: '', price: '', seatCapacity: '', status: 'draft' })
      if (res?.id) navigate(`/admin/campaign/${res.id}`)
    } catch (e2) {
      setError(e2.message || 'Failed creating campaign')
    }
  }

  const toggleStatus = async (id, currentStatus) => {
    await api.updateCampaignStatus(id, nextStatus(currentStatus))
    await fetchCampaigns()
  }

  return (
    <>
      <section className="admin-card" style={{ marginBottom: 16 }}>
        <h2>Create Campaign</h2>
        {error && <div className="admin-error" style={{ marginBottom: 12 }}>{error}</div>}
        <form className="admin-form-grid" onSubmit={addCampaign}>
          <input placeholder="Campaign name" value={newCampaign.name} onChange={(e) => setNewCampaign((s) => ({ ...s, name: e.target.value }))} required />
          <input placeholder="Location" value={newCampaign.location} onChange={(e) => setNewCampaign((s) => ({ ...s, location: e.target.value }))} required />
          <input placeholder="City" value={newCampaign.city} onChange={(e) => setNewCampaign((s) => ({ ...s, city: e.target.value }))} />
          <input type="date" value={newCampaign.workshopDate} onChange={(e) => setNewCampaign((s) => ({ ...s, workshopDate: e.target.value }))} required />
          <input type="time" value={newCampaign.startTime} onChange={(e) => setNewCampaign((s) => ({ ...s, startTime: e.target.value }))} required />
          <input type="number" min="1" step="0.01" placeholder="Price" value={newCampaign.price} onChange={(e) => setNewCampaign((s) => ({ ...s, price: e.target.value }))} required />
          <input type="number" min="1" placeholder="Seats" value={newCampaign.seatCapacity} onChange={(e) => setNewCampaign((s) => ({ ...s, seatCapacity: e.target.value }))} required />
          <select value={newCampaign.status} onChange={(e) => setNewCampaign((s) => ({ ...s, status: e.target.value }))}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          <button type="submit">Save Campaign</button>
        </form>
      </section>

      <section className="admin-card">
        <h2>Campaign List</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Date</th><th>Location</th><th>Price</th><th>Seats</th><th>Status</th><th>Registrations</th><th>Edit</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.workshopDate} {c.startTime}</td>
                  <td>{c.location}</td>
                  <td>INR {Number(c.price).toLocaleString()}</td>
                  <td>{c.seatCapacity}</td>
                  <td><span className={`status-pill ${c.status}`}>{c.status}</span></td>
                  <td>{c.registrationCount || 0} ({c.paidCount || 0} paid)</td>
                    <td><Link className="admin-link-btn" to={`/admin/campaign/${c.id}`}>Open</Link></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link className="admin-link-btn" to={`/admin/campaign/${c.id}`}>View</Link>
                        <Link className="admin-link-btn" to={`/admin/registrations?campaignId=${c.id}`}>Show Registrations</Link>
                        <button onClick={() => toggleStatus(c.id, c.status)}>Cycle</button>
                      </div>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
