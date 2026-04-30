import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useAdminSession } from '../context/AdminSessionContext'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAdminSession()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const from = location.state?.from || '/admin'

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login({ email: form.email.trim().toLowerCase(), password: form.password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <motion.form className="admin-login-card" onSubmit={onSubmit} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1>Admin Login</h1>
        <p>Manage campaigns, sessions, and registrations.</p>

        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} placeholder="admin@rugcircle.com" required />

        <label>Password</label>
        <input type="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} placeholder="••••••••" required />

        {error && <div className="admin-error">{error}</div>}

        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login to Admin Panel'}</button>
      </motion.form>
    </div>
  )
}

