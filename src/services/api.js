const API_BASE = '/api'
const TOAST_EVENT = 'rugcircle:toast'

function emitToast(type, message) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type, message } }))
}

function isMutatingMethod(method) {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(String(method || 'GET').toUpperCase())
}

function toastLabelFor(path, method) {
  const verb = String(method || 'GET').toUpperCase()
  if (path.includes('/auth/login') || path.includes('/user/login')) return 'Login'
  if (path.includes('/auth/logout') || path.includes('/user/logout')) return 'Logout'
  if (path.includes('/user/request-otp')) return 'OTP sent'
  if (path.includes('/user/bookings')) return verb === 'POST' ? 'Booking created' : 'Booking updated'
  if (path.includes('/admin/campaigns')) {
    if (verb === 'POST') return 'Campaign created'
    if (verb === 'PUT' || verb === 'PATCH') return 'Campaign updated'
    if (verb === 'DELETE') return 'Campaign deleted'
  }
  if (path.includes('/admin/products')) {
    if (verb === 'POST') return 'Product created'
    if (verb === 'PUT') return 'Product updated'
    if (verb === 'DELETE') return 'Product deleted'
  }
  if (path.includes('/admin/registrations')) return 'Registration updated'
  return 'Saved'
}

function requestUpload(path, method, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, `${API_BASE}${path}`)
    xhr.withCredentials = true
    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable || typeof onProgress !== 'function') return
      onProgress(Math.max(0, Math.min(100, Math.round((evt.loaded / evt.total) * 100))))
    }
    xhr.onload = () => {
      const data = (() => { try { return JSON.parse(xhr.responseText || '{}') } catch { return {} } })()
      if (xhr.status >= 200 && xhr.status < 300) {
        if (isMutatingMethod(method)) emitToast('success', toastLabelFor(path, method))
        resolve(data)
      } else {
        const message = data.message || 'Request failed'
        emitToast('error', message)
        reject(new Error(message))
      }
    }
    xhr.onerror = () => {
      const message = 'Network error'
      emitToast('error', message)
      reject(new Error(message))
    }
    xhr.send(formData)
  })
}
async function request(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const headers = { ...(options.headers || {}) }
  if (!isFormData && !headers['Content-Type']) headers['Content-Type'] = 'application/json'
  const method = String(options.method || 'GET').toUpperCase()
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', headers, ...options })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data.message || 'Request failed'
    emitToast('error', message)
    throw new Error(message)
  }
  if (isMutatingMethod(method)) emitToast('success', toastLabelFor(path, method))
  return data
}
export const api = {
  listPublicCampaigns: () => request('/public/campaigns'), getPublicCampaignBySlug: (slug) => request(`/public/campaigns/${encodeURIComponent(slug)}`),
  listPublicProducts: () => request('/public/products'), getPublicProductById: (id) => request(`/public/products/${id}`), validateCoupon: (code, amount) => request(`/public/coupons/validate?code=${encodeURIComponent(code)}&amount=${encodeURIComponent(amount)}`),
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }), logout: () => request('/auth/logout', { method: 'POST' }), me: () => request('/auth/me'),
  userLogin: (identifier, password, otp) => request('/user/login', { method: 'POST', body: JSON.stringify({ identifier, password, otp }) }), userLogout: () => request('/user/logout', { method: 'POST' }), userMe: () => request('/user/me'),
  userSetPassword: (newPassword) => request('/user/profile/password', { method: 'POST', body: JSON.stringify({ newPassword }) }),
  requestUserOtp: (identifier) => request('/user/request-otp', { method: 'POST', body: JSON.stringify({ identifier }) }),
  createLead: (payload) => request('/user/lead', { method: 'POST', body: JSON.stringify(payload) }),
  createBooking: (payload) => request('/user/bookings', { method: 'POST', body: JSON.stringify(payload) }), userDashboard: () => request('/user/dashboard'), userBookings: () => request('/user/bookings'), userBookingById: (id) => request(`/user/bookings/${id}`), raiseCase: (payload) => request('/user/help/case', { method: 'POST', body: JSON.stringify(typeof payload === 'string' ? { message: payload } : payload) }),
  listCampaigns: () => request('/admin/campaigns'), getCampaignById: (id) => request(`/admin/campaigns/${id}`), createCampaign: (payload) => request('/admin/campaigns', { method: 'POST', body: JSON.stringify(payload) }), updateCampaign: (id, payload) => request(`/admin/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(payload) }), deleteCampaign: (id) => request(`/admin/campaigns/${id}`, { method: 'DELETE' }), duplicateCampaign: (id) => request(`/admin/campaigns/${id}/duplicate`, { method: 'POST' }), updateCampaignStatus: (id, status) => request(`/admin/campaigns/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }), getCampaignContent: (id) => request(`/admin/campaigns/${id}/content`), saveCampaignContent: (id, payload) => request(`/admin/campaigns/${id}/content`, { method: 'PUT', body: JSON.stringify(payload) }), getCampaignCalendar: () => request('/admin/campaign-calendar'), getAnalyticsSummary: () => request('/admin/analytics/summary'),
  listProducts: () => request('/admin/products'),
  createProduct: (formData, onProgress) => requestUpload('/admin/products', 'POST', formData, onProgress),
  updateProduct: (id, formData, onProgress) => requestUpload(`/admin/products/${id}`, 'PUT', formData, onProgress),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  exportCampaigns: () => request('/admin/export/campaigns'), exportProducts: () => request('/admin/export/products'), importProducts: (payload) => request('/admin/import/products', { method: 'POST', body: JSON.stringify(payload) }),
  listCoupons: () => request('/admin/coupons'), createCoupon: (payload) => request('/admin/coupons', { method: 'POST', body: JSON.stringify(payload) }), deleteCoupon: (id) => request(`/admin/coupons/${id}`, { method: 'DELETE' }),
  listRegistrations: (params) => { const q = new URLSearchParams(); if (params?.campaignId) q.set('campaignId', params.campaignId); if (params?.paymentStatus) q.set('paymentStatus', params.paymentStatus); if (params?.date) q.set('date', params.date); if (params?.from) q.set('from', params.from); if (params?.to) q.set('to', params.to); if (params?.q) q.set('q', params.q); const qs = q.toString(); return request(`/admin/registrations${qs ? `?${qs}` : ''}`) }, getRegistrationById: (id) => request(`/admin/registrations/${id}`), listLeads: () => request('/admin/leads'), updateLeadStatus: (id, status) => request(`/admin/leads/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}
