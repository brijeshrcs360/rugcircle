import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUserSession } from '../context/UserSessionContext'

export default function UserLogin() {
  const [form, setForm] = useState({ identifier: '', password: '', otp: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useUserSession()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/user/dashboard'

  const onSubmit = async (e) => { e.preventDefault(); setError(''); setLoading(true); try { await login(form); navigate(from, { replace: true }) } catch (err) { setError(err.message || 'Login failed') } finally { setLoading(false) } }

  return <div className="admin-login-page"><form className="admin-login-card" onSubmit={onSubmit}><h1>User Login</h1><p>Login with email/mobile + password or OTP.</p><label>Email or Mobile</label><input required value={form.identifier} onChange={(e)=>setForm((s)=>({...s, identifier:e.target.value}))} /><label>Password (optional)</label><input type="password" value={form.password} onChange={(e)=>setForm((s)=>({...s, password:e.target.value}))} /><label>OTP (optional)</label><input value={form.otp} onChange={(e)=>setForm((s)=>({...s, otp:e.target.value}))} />{error && <div className="admin-error">{error}</div>}<button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button></form></div>
}
