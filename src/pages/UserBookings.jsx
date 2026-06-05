import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export default function UserBookings() {
  const [rows, setRows] = useState([])
  useEffect(() => { api.userBookings().then((r) => setRows(r.bookings || [])) }, [])
  return <section className="admin-card"><h2>Bookings</h2><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Code</th><th>Campaign</th><th>Design</th><th>Payment</th><th>Booked</th><th>Open</th></tr></thead><tbody>{rows.map((r)=><tr key={r.id}><td>{r.registrationCode}</td><td>{r.campaignName}</td><td>{r.selectedDesignName || '-'}</td><td>{r.paymentStatus}</td><td>{r.bookedAt}</td><td><Link className="admin-link-btn" to={`/user/bookings/${r.id}`}>Open</Link></td></tr>)}</tbody></table></div></section>
}
