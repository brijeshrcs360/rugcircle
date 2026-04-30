import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import PackageDetails from './pages/PackageDetails'
import Payment from './pages/Payment'
import Success from './pages/Success'
import AdminLogin from './pages/AdminLogin'
import AdminCampaignEditor from './pages/AdminCampaignEditor'
import AdminProtectedRoute from './components/admin/AdminProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminCampaigns from './pages/admin/AdminCampaigns'
import AdminRegistrations from './pages/admin/AdminRegistrations'
import AdminRegistrationDetails from './pages/admin/AdminRegistrationDetails'
import RegisterFlow from './pages/registration/RegisterFlow'
import RegisterSuccess from './pages/registration/RegisterSuccess'
import './App.css'

function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/package/:slug" element={<PackageDetails />} />
        <Route path="/payment/:slug" element={<Payment />} />
        <Route path="/success" element={<Success />} />

        <Route path="/register/:slug" element={<RegisterFlow />} />
        <Route path="/register/:slug/success" element={<RegisterSuccess />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={(
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          )}
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="registrations" element={<AdminRegistrations />} />
          <Route path="registrations/:id" element={<AdminRegistrationDetails />} />
          <Route path="campaign/:id" element={<AdminCampaignEditor />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  )
}

export default App
