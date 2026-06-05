const API_BASE = '/api'
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
      if (xhr.status >= 200 && xhr.status < 300) resolve(data)
      else reject(new Error(data.message || 'Request failed'))
    }
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(formData)
  })
}
async function request(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const headers = { ...(options.headers || {}) }
  if (!isFormData && !headers['Content-Type']) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', headers, ...options })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}
export const api = {
  listPublicCampaigns: () => request('/public/campaigns'), getPublicCampaignBySlug: (slug) => request(`/public/campaigns/${encodeURIComponent(slug)}`),
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }), logout: () => request('/auth/logout', { method: 'POST' }), me: () => request('/auth/me'),
  userLogin: (identifier, password, otp) => request('/user/login', { method: 'POST', body: JSON.stringify({ identifier, password, otp }) }), userLogout: () => request('/user/logout', { method: 'POST' }), userMe: () => request('/user/me'),
  userSetPassword: (newPassword) => request('/user/profile/password', { method: 'POST', body: JSON.stringify({ newPassword }) }),
  requestUserOtp: (identifier) => request('/user/request-otp', { method: 'POST', body: JSON.stringify({ identifier }) }),
  createBooking: (payload) => request('/user/bookings', { method: 'POST', body: JSON.stringify(payload) }), userDashboard: () => request('/user/dashboard'), userBookings: () => request('/user/bookings'), userBookingById: (id) => request(`/user/bookings/${id}`), raiseCase: (payload) => request('/user/help/case', { method: 'POST', body: JSON.stringify(payload) }),
  listCampaigns: () => request('/admin/campaigns'), getCampaignById: (id) => request(`/admin/campaigns/${id}`), createCampaign: (payload) => request('/admin/campaigns', { method: 'POST', body: JSON.stringify(payload) }), updateCampaign: (id, payload) => request(`/admin/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(payload) }), deleteCampaign: (id) => request(`/admin/campaigns/${id}`, { method: 'DELETE' }), updateCampaignStatus: (id, status) => request(`/admin/campaigns/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }), getCampaignContent: (id) => request(`/admin/campaigns/${id}/content`), saveCampaignContent: (id, payload) => request(`/admin/campaigns/${id}/content`, { method: 'PUT', body: JSON.stringify(payload) }),
  listProducts: () => request('/admin/products'),
  createProduct: (formData, onProgress) => requestUpload('/admin/products', 'POST', formData, onProgress),
  updateProduct: (id, formData, onProgress) => requestUpload(`/admin/products/${id}`, 'PUT', formData, onProgress),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  listRegistrations: (params) => { const q = new URLSearchParams(); if (params?.campaignId) q.set('campaignId', params.campaignId); if (params?.paymentStatus) q.set('paymentStatus', params.paymentStatus); if (params?.date) q.set('date', params.date); if (params?.from) q.set('from', params.from); if (params?.to) q.set('to', params.to); if (params?.q) q.set('q', params.q); const qs = q.toString(); return request(`/admin/registrations${qs ? `?${qs}` : ''}`) }, getRegistrationById: (id) => request(`/admin/registrations/${id}`),
}
