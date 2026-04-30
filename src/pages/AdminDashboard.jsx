import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdminSession } from '../context/AdminSessionContext'
import { api } from '../services/api'

function toCsv(rows) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const escape = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`
  return [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\n')
}

function downloadCsv(filename, rows) {
  const csv = toCsv(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function nextStatus(current) {
  if (current === 'draft') return 'active'
  if (current === 'active') return 'closed'
  return 'draft'
}

export default function AdminDashboard() {
  const { session, logout } = useAdminSession()
  const navigate = useNavigate()

  const [campaigns, setCampaigns] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [campaignFilter, setCampaignFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  const [newCampaign, setNewCampaign] = useState({
    name: '', location: '', city: '', workshopDate: '', startTime: '', price: '', seatCapacity: '', status: 'draft',
  })

  const fetchCampaigns = async () => {
    const res = await api.listCampaigns()
    setCampaigns(res.campaigns || [])
  }

  const fetchRegistrations = async () => {
    const params = {
      campaignId: campaignFilter !== 'all' ? campaignFilter : '',
      paymentStatus: paymentFilter !== 'all' ? paymentFilter : '',
      date: dateFilter,
    }
    const res = await api.listRegistrations(params)
    setRegistrations(res.registrations || [])
  }

  useEffect(() => {
    Promise.all([fetchCampaigns(), fetchRegistrations()])
      .catch((e) => setError(e.message || 'Failed loading admin data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchRegistrations().catch((e) => setError(e.message || 'Failed loading registrations'))
  }, [campaignFilter, paymentFilter, dateFilter])

  const campaignNameMap = useMemo(() => new Map(campaigns.map((c) => [String(c.id), c.name])), [campaigns])

  const addCampaign = async (e) => {
    e.preventDefault()
    setError('')

    const payload = {
      ...newCampaign,
      price: Number(newCampaign.price),
      seatCapacity: Number(newCampaign.seatCapacity),
    }

    const res = await api.createCampaign(payload)
    await fetchCampaigns()
    setNewCampaign({ name: '', location: '', city: '', workshopDate: '', startTime: '', price: '', seatCapacity: '', status: 'draft' })
    if (res?.id) navigate(`/admin/campaign/${res.id}`)
  }

  const toggleStatus = async (id, currentStatus) => {
    const status = nextStatus(currentStatus)
    await api.updateCampaignStatus(id, status)
    await fetchCampaigns()
  }

  if (loading) return <div className="admin-page">Loading admin panel...</div>

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div>
          <h1>Rug Circle Admin Panel</h1>
          <p>Logged in as {session?.email}</p>
        </div>
        <button onClick={logout}>Logout</button>
      </header>

      {error && <div className="admin-error" style={{ marginBottom: 12 }}>{error}</div>}

      <section className="admin-grid">
        <div className="admin-card">
          <h2>Create Campaign</h2>
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
        </div>

        <div className="admin-card">
          <h2>Campaigns</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Date</th><th>Location</th><th>Price</th><th>Seats</th><th>Status</th><th>Edit</th><th>State</th></tr>
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
                    <td><Link to={`/admin/campaign/${c.id}`} className="admin-link-btn">Open</Link></td>
                    <td><button onClick={() => toggleStatus(c.id, c.status)}>Cycle</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-card-head">
          <h2>Registration Management</h2>
          <button onClick={() => downloadCsv('registrations.csv', registrations)}>Export CSV</button>
        </div>

        <div className="admin-filters">
          <select value={campaignFilter} onChange={(e) => setCampaignFilter(e.target.value)}>
            <option value="all">All Campaigns</option>
            {campaigns.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="initiated">Initiated</option>
            <option value="failed">Failed</option>
          </select>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Participant</th><th>Email</th><th>Mobile</th><th>Campaign</th><th>Payment</th><th>Ref ID</th><th>Design</th><th>Date</th></tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id}>
                  <td>{r.participantName}</td>
                  <td>{r.email}</td>
                  <td>{r.phone}</td>
                  <td>{r.campaignName || campaignNameMap.get(String(r.campaignId)) || '-'}</td>
                  <td><span className={`status-pill ${String(r.paymentStatus || '').toLowerCase()}`}>{r.paymentStatus}</span></td>
                  <td>{r.paymentRefId || '-'}</td>
                  <td>{r.selectedDesign || '-'}</td>
                  <td>{r.registrationDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
