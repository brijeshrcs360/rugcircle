import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import useSEO from '../../hooks/useSEO'

const CAMPAIGN_TYPE_OPTIONS = [
  { value: 'city_workshop', label: 'Workshop in City' },
  { value: 'seasonal_promotion', label: 'Seasonal Promotion' },
  { value: 'discounted_workshop', label: 'Special Discounted Workshop' },
  { value: 'partner_couple', label: 'Partner/Couple Workshop' },
]

function Field({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 700, color: '#444' }}>
      <span>{label}</span>
      {children}
    </label>
  )
}

export default function AdminCampaignCreate() {
  useSEO({
    title: 'Create Campaign',
    description: 'Create a new Rug Circle campaign and select products before opening the editor.',
    canonical: '/admin/campaigns/new',
    robots: 'noindex, nofollow',
  })

  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [products, setProducts] = useState([])
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [newCampaign, setNewCampaign] = useState({
    campaignType: 'city_workshop',
    seasonalLabel: '',
    name: '',
    location: '',
    city: '',
    workshopDate: '',
    startTime: '',
    price: '',
    seatCapacity: '',
    status: 'draft',
    seoTitle: '',
    seoDescription: '',
  })

  useEffect(() => {
    api.listProducts()
      .then((res) => setProducts(res.products || []))
      .catch((err) => console.error('Failed fetching products:', err))
      .finally(() => setLoadingProducts(false))
  }, [])

  const addProduct = (pid) => {
    const idNum = Number(pid)
    if (!Number.isInteger(idNum) || idNum <= 0) return
    setSelectedProductIds((s) => s.includes(idNum) ? s : [...s, idNum])
  }

  const removeProduct = (pid) => {
    const idNum = Number(pid)
    setSelectedProductIds((s) => s.filter((x) => x !== idNum))
  }

  const filteredProducts = products.filter((p) => {
    const q = productSearch.trim().toLowerCase()
    if (!q) return true
    const title = String(p?.title || '').toLowerCase()
    const price = String(Number(p?.price || 0).toLocaleString('en-IN')).toLowerCase()
    return title.includes(q) || price.includes(q)
  })

  const selectedProducts = products.filter((p) => selectedProductIds.includes(Number(p.id)))


  const addCampaign = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...newCampaign,
        price: Number(newCampaign.price),
        seatCapacity: Number(newCampaign.seatCapacity),
        productIds: selectedProductIds,
        seoTitle: newCampaign.seoTitle,
        seoDescription: newCampaign.seoDescription,
      }
      const res = await api.createCampaign(payload)
      setNewCampaign({
        campaignType: 'city_workshop',
        seasonalLabel: '',
        name: '',
        location: '',
        city: '',
        workshopDate: '',
        startTime: '',
        price: '',
        seatCapacity: '',
        status: 'draft',
        seoTitle: '',
        seoDescription: '',
      })
      setSelectedProductIds([])
      setProductSearch('')
      if (res?.id) navigate(`/admin/campaign/${res.id}`)
    } catch (e2) {
      setError(e2.message || 'Failed creating campaign')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <div>
          <h2>Create New Campaign</h2>
          <p style={{ margin: '4px 0 0', color: '#74675d' }}>Fill campaign details, then open the editor.</p>
        </div>
        <Link className="admin-link-btn" to="/admin/campaigns">Back to Campaigns</Link>
      </div>

      {error && <div className="admin-error" style={{ marginBottom: 12 }}>{error}</div>}

      <form className="admin-form-grid" onSubmit={addCampaign}>
        <Field label="Campaign Type">
          <select value={newCampaign.campaignType} onChange={(e) => setNewCampaign((s) => ({ ...s, campaignType: e.target.value }))}>
            {CAMPAIGN_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        {newCampaign.campaignType === 'seasonal_promotion' && (
          <Field label="Which Seasonal Promotion">
            <input
              placeholder="Valentine's Day, Women's Day..."
              value={newCampaign.seasonalLabel}
              onChange={(e) => setNewCampaign((s) => ({ ...s, seasonalLabel: e.target.value }))}
              required
            />
          </Field>
        )}

        <Field label="Campaign Name">
          <input placeholder="Campaign name" value={newCampaign.name} onChange={(e) => setNewCampaign((s) => ({ ...s, name: e.target.value }))} required />
        </Field>
        <Field label="Location">
          <input placeholder="Location" value={newCampaign.location} onChange={(e) => setNewCampaign((s) => ({ ...s, location: e.target.value }))} required />
        </Field>
        <Field label="City">
          <input placeholder="City" value={newCampaign.city} onChange={(e) => setNewCampaign((s) => ({ ...s, city: e.target.value }))} />
        </Field>
        <Field label="Workshop Date">
          <input type="date" value={newCampaign.workshopDate} onChange={(e) => setNewCampaign((s) => ({ ...s, workshopDate: e.target.value }))} required />
        </Field>
        <Field label="Start Time">
          <input type="time" value={newCampaign.startTime} onChange={(e) => setNewCampaign((s) => ({ ...s, startTime: e.target.value }))} required />
        </Field>
        <Field label="Price">
          <input type="number" min="1" step="0.01" placeholder="Price" value={newCampaign.price} onChange={(e) => setNewCampaign((s) => ({ ...s, price: e.target.value }))} required />
        </Field>
        <Field label="Seat Capacity">
          <input type="number" min="1" placeholder="Seats" value={newCampaign.seatCapacity} onChange={(e) => setNewCampaign((s) => ({ ...s, seatCapacity: e.target.value }))} required />
        </Field>
        <Field label="Status">
          <select value={newCampaign.status} onChange={(e) => setNewCampaign((s) => ({ ...s, status: e.target.value }))}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </Field>

        <Field label="SEO Title">
          <input
            placeholder="Meta title for search results"
            value={newCampaign.seoTitle}
            onChange={(e) => setNewCampaign((s) => ({ ...s, seoTitle: e.target.value }))}
          />
        </Field>

        <Field label="SEO Description">
          <textarea
            placeholder="Meta description for search engines"
            value={newCampaign.seoDescription}
            onChange={(e) => setNewCampaign((s) => ({ ...s, seoDescription: e.target.value }))}
            style={{ minHeight: 90, border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '10px 12px' }}
          />
        </Field>

        <Field label="Products (Search + Select)">
          <input
            placeholder="Search product by name or price..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
          <div style={{ marginTop: 8, border: '1.5px solid var(--color-border)', borderRadius: 12, maxHeight: 220, overflow: 'auto', background: '#fff' }}>
            {loadingProducts && <div style={{ padding: 10, fontSize: 12, color: '#888' }}>Loading products...</div>}
            {!loadingProducts && filteredProducts.map((p) => {
              const picked = selectedProductIds.includes(Number(p.id))
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => (picked ? removeProduct(p.id) : addProduct(p.id))}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    border: 'none',
                    borderBottom: '1px solid #f0f0f0',
                    background: picked ? 'rgba(225, 128, 45, 0.12)' : '#fff',
                    cursor: 'pointer',
                    fontSize: 14,
                    color: '#2a2a2a',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{p.title}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#7b6c61' }}>INR {Number(p.price || 0).toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: picked ? '#b65d0b' : '#999' }}>{picked ? 'Selected' : 'Add'}</span>
                  </span>
                </button>
              )
            })}
            {!loadingProducts && filteredProducts.length === 0 && <div style={{ padding: 10, fontSize: 12, color: '#888' }}>No products found</div>}
          </div>
          <div style={{ marginTop: 10, border: '1px dashed #ebd8c7', borderRadius: 12, padding: 10, background: '#fffaf4' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#8c6748', marginBottom: 8 }}>
              Selected Products ({selectedProducts.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {selectedProducts.map((p) => (
                <button
                  key={`selected-${p.id}`}
                  type="button"
                  onClick={() => removeProduct(p.id)}
                  style={{
                    border: '1px solid #e6b88a',
                    borderRadius: 999,
                    padding: '6px 10px',
                    background: '#fff',
                    fontSize: 12,
                    cursor: 'pointer',
                    color: '#6b4d34',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{p.title}</span>
                  <span style={{ opacity: 0.8 }}>x</span>
                </button>
              ))}
              {selectedProducts.length === 0 && <span style={{ fontSize: 12, color: '#888' }}>No products selected</span>}
            </div>
          </div>
        </Field>

        <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Campaign'}</button>
      </form>
    </section>
  )
}
