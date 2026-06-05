import { Navigate, useLocation } from 'react-router-dom'
import { useAdminSession } from '../../context/AdminSessionContext'

export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdminSession()
  const location = useLocation()

  if (loading) return <div className="admin-page">Checking session...</div>
  if (!isAuthenticated) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  return children
}

