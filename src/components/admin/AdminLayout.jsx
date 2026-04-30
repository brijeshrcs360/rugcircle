import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminSession } from '../../context/AdminSessionContext'

export default function AdminLayout() {
  const { session, logout } = useAdminSession()
  const navigate = useNavigate()

  const signOut = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div>
          <h1>Rug Circle Admin</h1>
          <p>{session?.email}</p>
        </div>
        <button onClick={signOut}>Logout</button>
      </header>

      <nav className="admin-nav-tabs">
        <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
        <NavLink to="/admin/campaigns" className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>Campaigns</NavLink>
        <NavLink to="/admin/registrations" className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>Registrations</NavLink>
      </nav>

      <Outlet />
    </div>
  )
}
