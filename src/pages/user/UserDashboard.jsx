import { useEffect, useState } from 'react'
import { api } from '../../services/api'

export default function UserDashboard() {
  const [dashboard, setDashboard] = useState({ bookings: 0, recentActivity: [] })
  useEffect(() => { api.userDashboard().then((r) => setDashboard(r.dashboard || { bookings: 0, recentActivity: [] })) }, [])

  return (
    <section className="admin-card">
      <h2>Dashboard</h2>
      <div className="admin-kpi-grid">
        <div className="admin-kpi"><div className="n">{dashboard.bookings}</div><div className="l">Total Bookings</div></div>
      </div>
    </section>
  )
}
