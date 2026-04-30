import { useEffect, useMemo, useState } from 'react'
import { api } from '../../services/api'

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
    return { totalCampaigns, activeCampaigns, totalRegs, paidRegs }
  }, [campaigns, registrations])

  return (
    <section className="admin-card">
      <h2>Dashboard</h2>
      {error && <div className="admin-error" style={{ marginBottom: 12 }}>{error}</div>}
      <div className="admin-kpi-grid">
        <div className="admin-kpi"><div className="n">{stats.totalCampaigns}</div><div className="l">Total Campaigns</div></div>
        <div className="admin-kpi"><div className="n">{stats.activeCampaigns}</div><div className="l">Active Campaigns</div></div>
        <div className="admin-kpi"><div className="n">{stats.totalRegs}</div><div className="l">Registrations</div></div>
        <div className="admin-kpi"><div className="n">{stats.paidRegs}</div><div className="l">Paid Registrations</div></div>
      </div>
    </section>
  )
}
