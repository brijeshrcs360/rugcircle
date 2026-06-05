import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useUserSession } from '../../context/UserSessionContext'

export default function UserLayout() {
  const { session, logout } = useUserSession()
  const navigate = useNavigate()
  const doLogout = async () => {
    await logout()
    navigate('/user/login')
  }

  return (
    <div className="admin-page user-panel-bg">
      <header className="admin-topbar">
        <div>
          <h1>My Account</h1>
          <p>{session?.email} - {session?.mobile}</p>
        </div>
        <button onClick={doLogout}>Logout</button>
      </header>
      <nav className="admin-nav-tabs">
        <NavLink to="/user/dashboard" className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
        <NavLink to="/user/bookings" className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>Bookings</NavLink>
        <NavLink to="/user/profile" className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>Profile</NavLink>
        <NavLink to="/user/help" className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>Help</NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
