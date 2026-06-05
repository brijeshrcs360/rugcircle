import { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function UserDashboard() {
  const [data, setData] = useState(null)
  useEffect(() => { api.userDashboard().then((r) => setData(r.dashboard)).catch(() => setData({ bookings: 0, recentActivity: [] })) }, [])
  return <section className="admin-card"><h2>Dashboard</h2><div className="admin-kpi-grid"><div className="admin-kpi"><div className="n">{data?.bookings ?? 0}</div><div className="l">Total Bookings</div></div></div></section>
}
