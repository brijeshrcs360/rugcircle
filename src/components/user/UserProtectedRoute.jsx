import { Navigate, useLocation } from 'react-router-dom'
import { useUserSession } from '../../context/UserSessionContext'

export default function UserProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useUserSession()
  const location = useLocation()
  if (loading) return <div className="admin-page">Checking user session...</div>
  if (!isAuthenticated) return <Navigate to="/user/login" replace state={{ from: location.pathname }} />
  return children
}
