import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUserSession } from '../../context/UserSessionContext'
import { api } from '../../services/api'

export default function UserLogin() {
  const [form, setForm] = useState({ identifier: '', password: '', otp: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otpInfo, setOtpInfo] = useState('')
  const [otpCooldown, setOtpCooldown] = useState(0)
  const { login } = useUserSession()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/user/dashboard'

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (!form.password && !form.otp) throw new Error('Enter password or OTP')
      const payload = { identifier: form.identifier.trim() }
      if (form.password?.trim()) payload.password = form.password
      if (form.otp?.trim()) payload.otp = form.otp.trim()
      await login(payload)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const requestOtp = async () => {
    setError('')
    setOtpInfo('')
    if (otpCooldown > 0) return
    if (!form.identifier) {
      setError('Enter email first')
      return
    }
    setOtpCooldown(30)
    try {
      const r = await api.requestUserOtp(form.identifier)
      setOtpInfo(`Verification code sent to ${r?.notify?.email || 'your email'}`)
    } catch (err) {
      setOtpCooldown(0)
      setError(err.message || 'Failed to send OTP')
    }
  }

  useEffect(() => {
    if (otpCooldown <= 0) return
    const t = setTimeout(() => setOtpCooldown((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [otpCooldown])

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={submit}>
        <h1>User Login</h1>
        <p>Use email + password or email verification code.</p>
        <label>Email</label>
        <input value={form.identifier} onChange={(e) => setForm((s) => ({ ...s, identifier: e.target.value }))} required />
        <label>Password (optional)</label>
        <input type="password" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} />
        <label>OTP (optional)</label>
        <input value={form.otp} onChange={(e) => setForm((s) => ({ ...s, otp: e.target.value }))} />
        <button type="button" onClick={requestOtp} style={{ marginTop: 8 }} disabled={otpCooldown > 0}>
          {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : (otpInfo ? 'Resend OTP' : 'Send OTP')}
        </button>
        {otpInfo ? <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>{otpInfo}</div> : null}
        {error ? <div className="admin-error">{error}</div> : null}
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{ marginTop: 10, width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', background: '#fff', color: 'var(--color-text)', fontWeight: 700, cursor: 'pointer' }}
        >
          Back to Home
        </button>
      </form>
    </div>
  )
}
