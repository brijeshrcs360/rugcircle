import { useEffect, useState } from 'react'
import { api } from '../../services/api'

export default function AdminLeads() {
  const [leads, setLeads] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    const res = await api.listLeads()
    setLeads(res.leads || [])
  }

  useEffect(() => {
    load().catch((e) => setError(e.message || 'Failed loading leads'))
  }, [])

  const changeStatus = async (id, status) => {
    await api.updateLeadStatus(id, status)
    await load()
  }

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <div>
          <h2>Leads</h2>
          <p style={{ margin: '4px 0 0', color: '#74675d' }}>Website inquiries and follow-up pipeline.</p>
        </div>
      </div>
      {error && <div className="admin-error" style={{ marginBottom: 12 }}>{error}</div>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Interest</th><th>Status</th><th>WhatsApp</th><th>Action</th></tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.name}</td>
                <td>{lead.company || '-'}</td>
                <td>{lead.email}</td>
                <td>{lead.phone || '-'}</td>
                <td>{lead.interest || '-'}</td>
                <td>{lead.status}</td>
                <td>{lead.whatsapp_link ? <a href={lead.whatsapp_link} target="_blank" rel="noreferrer">Open</a> : '-'}</td>
                <td>
                  <select value={lead.status} onChange={(e) => changeStatus(lead.id, e.target.value)}>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                </td>
              </tr>
            ))}
            {leads.length === 0 && <tr><td colSpan={8}>No leads yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}
