const API_BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

export const api = {
  listPublicCampaigns: () => request('/public/campaigns'),
  getPublicCampaignBySlug: (slug) => request(`/public/campaigns/${encodeURIComponent(slug)}`),

  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  listCampaigns: () => request('/admin/campaigns'),
  getCampaignById: (id) => request(`/admin/campaigns/${id}`),
  createCampaign: (payload) => request('/admin/campaigns', { method: 'POST', body: JSON.stringify(payload) }),
  updateCampaign: (id, payload) => request(`/admin/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteCampaign: (id) => request(`/admin/campaigns/${id}`, { method: 'DELETE' }),
  updateCampaignStatus: (id, status) => request(`/admin/campaigns/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getCampaignContent: (id) => request(`/admin/campaigns/${id}/content`),
  saveCampaignContent: (id, payload) => request(`/admin/campaigns/${id}/content`, { method: 'PUT', body: JSON.stringify(payload) }),

  listRegistrations: (params) => {
    const q = new URLSearchParams()
    if (params?.campaignId) q.set('campaignId', params.campaignId)
    if (params?.paymentStatus) q.set('paymentStatus', params.paymentStatus)
    if (params?.date) q.set('date', params.date)
    if (params?.from) q.set('from', params.from)
    if (params?.to) q.set('to', params.to)
    if (params?.q) q.set('q', params.q)
    const qs = q.toString()
    return request(`/admin/registrations${qs ? `?${qs}` : ''}`)
  },
  getRegistrationById: (id) => request(`/admin/registrations/${id}`),
}
