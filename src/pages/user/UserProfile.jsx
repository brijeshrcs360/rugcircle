import { useState } from 'react'
import { useUserSession } from '../../context/UserSessionContext'
import { api } from '../../services/api'

export default function UserProfile() {
  const { session } = useUserSession()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setOk('')
    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Confirm password does not match')
      return
    }
    try {
      setLoading(true)
      await api.userSetPassword(newPassword)
      setOk('Password updated')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="admin-card user-profile-card">
      <div className="user-profile-head">
        <h2>Profile</h2>
        <p>Manage password. Email and mobile are locked.</p>
      </div>
      <div className="user-profile-grid" style={{ marginBottom: 16 }}>
        <div className="user-profile-field">
          <label>Email</label>
          <input value={session?.email || ''} disabled readOnly className="user-profile-locked" />
        </div>
        <div className="user-profile-field">
          <label>Mobile</label>
          <input value={session?.mobile || ''} disabled readOnly className="user-profile-locked" />
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="user-profile-grid">
          <div className="user-profile-field">
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div className="user-profile-field user-profile-full">
            <label>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
        </div>
        <button className="user-profile-submit" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Password'}</button>
      </form>
      {error ? <div className="admin-error">{error}</div> : null}
      {ok ? <div style={{ marginTop: 12, color: '#257544', fontSize: 13 }}>{ok}</div> : null}
    </section>
  )
}
