import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import PackageDetails from './pages/PackageDetails'
import ProductDetails from './pages/ProductDetails'
import Payment from './pages/Payment'
import Success from './pages/Success'
import AdminLogin from './pages/AdminLogin'
import AdminCampaignEditor from './pages/AdminCampaignEditor'
import AdminProtectedRoute from './components/admin/AdminProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminCampaigns from './pages/admin/AdminCampaigns'
import AdminCampaignCreate from './pages/admin/AdminCampaignCreate'
import AdminLeads from './pages/admin/AdminLeads'
import AdminRegistrations from './pages/admin/AdminRegistrations'
import AdminRegistrationDetails from './pages/admin/AdminRegistrationDetails'
import AdminProducts from './pages/admin/AdminProducts'
import RegisterFlow from './pages/registration/RegisterFlow'
import RegisterSuccess from './pages/registration/RegisterSuccess'
import UserProtectedRoute from './components/user/UserProtectedRoute'
import UserLayout from './components/user/UserLayout'
import UserLogin from './pages/user/UserLogin'
import UserDashboard from './pages/user/UserDashboard'
import UserBookings from './pages/user/UserBookings'
import UserBookingDetails from './pages/user/UserBookingDetails'
import UserHelp from './pages/user/UserHelp'
import UserProfile from './pages/user/UserProfile'
import './App.css'

function App() {
  const location = useLocation()
  const hideMainShell = location.pathname.startsWith('/admin') || location.pathname.startsWith('/user')

  return (
    <>
      {!hideMainShell && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/package/:slug" element={<PackageDetails />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/payment/:slug" element={<Payment />} />
        <Route path="/success" element={<Success />} />
        <Route path="/register/:slug" element={<RegisterFlow />} />
        <Route path="/register/:slug/success" element={<RegisterSuccess />} />

        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user" element={<UserProtectedRoute><UserLayout /></UserProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="bookings" element={<UserBookings />} />
          <Route path="bookings/:id" element={<UserBookingDetails />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="help" element={<UserHelp />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="campaigns/new" element={<AdminCampaignCreate />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="registrations" element={<AdminRegistrations />} />
          <Route path="registrations/:id" element={<AdminRegistrationDetails />} />
          <Route path="campaign/:id" element={<AdminCampaignEditor />} />
        </Route>
      </Routes>
      {!hideMainShell && <Footer />}
    </>
  )
}

export default App
