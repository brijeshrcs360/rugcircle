import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../services/api'

export default function UserBookingDetails() {
  const { id } = useParams()
  const [b, setB] = useState(null)
  useEffect(() => { api.userBookingById(id).then((r) => setB(r.booking)) }, [id])
  if (!b) return <section className="admin-card">Loading...</section>
  return (
    <section className="admin-card">
      <h2>Booking Details</h2>
      <p>Code: {b.registration_code}</p>
      <p>Campaign: {b.campaignName}</p>
      <p>Selected Image: {b.selected_design_name || '-'}</p>
      <p>Email: {b.email}</p>
      <p>Mobile: {b.mobile}</p>
      <p>Payment: {b.payment_status}</p>
    </section>
  )
}
