import { useState } from 'react'
import { api } from '../services/api'

export default function UserHelp() {
  const [subject, setSubject] = useState('Support Case')
  const [message, setMessage] = useState('')
  const [wa, setWa] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setWa('')
    try {
      const r = await api.raiseCase({ subject, message })
      setWa(r.whatsapp || '')
    } catch (err) {
      setError(err?.message || 'Failed to raise case')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="admin-card">
      <h2>Help</h2>
      {error && <div className="admin-error" style={{ marginBottom: 12 }}>{error}</div>}
      <form onSubmit={submit}>
        <div className="form-group">
          <label>Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Case Raise</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Raise Case'}</button>
      </form>
      {wa && <p style={{ marginTop: 12 }}><a href={wa} target="_blank" rel="noreferrer">WhatsApp Help</a></p>}
    </section>
  )
}
