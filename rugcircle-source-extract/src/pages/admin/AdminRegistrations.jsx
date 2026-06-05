import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'

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

export default function AdminRegistrations() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [campaigns, setCampaigns] = useState([])
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')

  const campaignId = searchParams.get('campaignId') || 'all'
  const paymentStatus = searchParams.get('paymentStatus') || 'all'
  const date = searchParams.get('date') || ''
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const q = searchParams.get('q') || ''

  const setParam = (k, v) => {
    const p = new URLSearchParams(searchParams)
    if (!v || v === 'all') p.delete(k)
    else p.set(k, v)
    setSearchParams(p)
  }

  useEffect(() => {
    api.listCampaigns().then((r) => setCampaigns(r.campaigns || [])).catch((e) => setError(e.message || 'Failed campaigns'))
  }, [])

  useEffect(() => {
    api.listRegistrations({
      campaignId: campaignId === 'all' ? '' : campaignId,
      paymentStatus: paymentStatus === 'all' ? '' : paymentStatus,
      date,
      from,
      to,
      q,
    })
      .then((r) => setRows(r.registrations || []))
      .catch((e) => setError(e.message || 'Failed registrations'))
  }, [campaignId, paymentStatus, date, from, to, q])

  const summary = useMemo(() => {
    const total = rows.length
    const paid = rows.filter((r) => String(r.paymentStatus).toLowerCase() === 'paid').length
    const pending = rows.filter((r) => String(r.paymentStatus).toLowerCase() === 'pending').length
    return { total, paid, pending }
  }, [rows])

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <h2>Registrations</h2>
        <button onClick={() => downloadCsv('registrations.csv', rows)}>Export CSV</button>
      </div>
      {error && <div className="admin-error" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="admin-kpi-grid" style={{ marginBottom: 12 }}>
        <div className="admin-kpi"><div className="n">{summary.total}</div><div className="l">Total</div></div>
        <div className="admin-kpi"><div className="n">{summary.paid}</div><div className="l">Paid</div></div>
        <div className="admin-kpi"><div className="n">{summary.pending}</div><div className="l">Pending</div></div>
      </div>

      <div className="admin-filters admin-filters-four">
        <select value={campaignId} onChange={(e) => setParam('campaignId', e.target.value)}>
          <option value="all">All Campaigns</option>
          {campaigns.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
        <select value={paymentStatus} onChange={(e) => setParam('paymentStatus', e.target.value)}>
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="initiated">Initiated</option>
          <option value="failed">Failed</option>
        </select>
        <input type="date" value={from} onChange={(e) => setParam('from', e.target.value)} />
        <input type="date" value={to} onChange={(e) => setParam('to', e.target.value)} />
      </div>
      <div className="admin-filters admin-filters-two">
        <input type="date" value={date} onChange={(e) => setParam('date', e.target.value)} />
        <input value={q} onChange={(e) => setParam('q', e.target.value)} placeholder="Search name/email/mobile/ref/campaign" />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Participant</th><th>Email</th><th>Mobile</th><th>Campaign</th><th>Payment</th><th>Ref ID</th><th>Design</th><th>Date</th><th>Open</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.participantName}</td>
                <td>{r.email}</td>
                <td>{r.phone}</td>
                <td>{r.campaignName || '-'}</td>
                <td><span className={`status-pill ${String(r.paymentStatus || '').toLowerCase()}`}>{r.paymentStatus}</span></td>
                <td>{r.paymentRefId || '-'}</td>
                <td>{r.selectedDesign || '-'}</td>
                <td>{r.registrationDate}</td>
                <td><Link className="admin-link-btn" to={`/admin/registrations/${r.id}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
