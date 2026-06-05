import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminSession } from '../../context/AdminSessionContext'

export default function AdminLayout() {
  const { session, logout } = useAdminSession()
  const navigate = useNavigate()

  const signOut = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link to="/admin/dashboard" className="admin-brand-link">
            <span className="admin-brand-mark">RC</span>
            <span className="admin-brand-copy">
              <strong>Rug Circle</strong>
              <small>Admin control room</small>
            </span>
          </Link>
        </div>

        <div className="admin-sidebar-panel">
          <span className="admin-sidebar-label">Signed in</span>
          <div className="admin-session-email">{session?.email}</div>
          <p className="admin-sidebar-note">Route-first admin. One page, one job.</p>
        </div>

        <nav className="admin-side-nav">
          <NavLink to="/admin/dashboard" end className={({ isActive }) => `admin-side-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
          <NavLink to="/admin/campaigns" className={({ isActive }) => `admin-side-link ${isActive ? 'active' : ''}`}>Campaigns</NavLink>
          <NavLink to="/admin/registrations" className={({ isActive }) => `admin-side-link ${isActive ? 'active' : ''}`}>Registrations</NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `admin-side-link ${isActive ? 'active' : ''}`}>Products</NavLink>
        </nav>

        <div className="admin-sidebar-panel admin-quick-actions">
          <span className="admin-sidebar-label">Quick open</span>
          <Link to="/admin/campaigns/new" className="admin-quick-link">New campaign</Link>
          <Link to="/admin/registrations" className="admin-quick-link">All registrations</Link>
          <Link to="/admin/products" className="admin-quick-link">Manage products</Link>
        </div>

        <button className="admin-logout-btn" onClick={signOut}>Logout</button>
      </aside>

      <main className="admin-main">
        <div className="admin-workspace">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
