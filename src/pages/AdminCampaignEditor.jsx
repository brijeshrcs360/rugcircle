import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { api } from '../services/api'
import useSEO from '../hooks/useSEO'

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

function normalizeStringList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.map((x) => String(x || '')).filter(Boolean)
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map((x) => String(x || '')).filter(Boolean) : []
  } catch {
    return []
  }
}

function normalizeObjectList(value, keyA, keyB) {
  if (!value) return []
  const source = Array.isArray(value) ? value : (() => { try { return JSON.parse(value) } catch { return [] } })()
  if (!Array.isArray(source)) return []
  return source.map((item) => ({ [keyA]: String(item?.[keyA] || ''), [keyB]: String(item?.[keyB] || '') })).filter((x) => x[keyA] || x[keyB])
}

function StringListEditor({ label, items, onChange, placeholder }) {
  const setItem = (idx, value) => onChange(items.map((it, i) => (i === idx ? value : it)))
  const add = () => onChange([...items, ''])
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx))

  return (
    <div className="admin-list-editor">
      <div className="admin-list-head"><strong>{label}</strong><button type="button" onClick={add}>Add</button></div>
      {items.length === 0 && <div className="admin-list-empty">No items.</div>}
      {items.map((item, idx) => (
        <div key={idx} className="admin-list-row">
          <input value={item} onChange={(e) => setItem(idx, e.target.value)} placeholder={placeholder} />
          <button type="button" onClick={() => remove(idx)}>Remove</button>
        </div>
      ))}
    </div>
  )
}

function PairListEditor({ label, items, onChange, keyA, keyB, placeholderA, placeholderB }) {
  const setField = (idx, key, value) => onChange(items.map((it, i) => (i === idx ? { ...it, [key]: value } : it)))
  const add = () => onChange([...items, { [keyA]: '', [keyB]: '' }])
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx))

  return (
    <div className="admin-list-editor">
      <div className="admin-list-head"><strong>{label}</strong><button type="button" onClick={add}>Add</button></div>
      {items.length === 0 && <div className="admin-list-empty">No items.</div>}
      {items.map((item, idx) => (
        <div key={idx} className="admin-pair-row">
          <input value={item[keyA]} onChange={(e) => setField(idx, keyA, e.target.value)} placeholder={placeholderA} />
          <input value={item[keyB]} onChange={(e) => setField(idx, keyB, e.target.value)} placeholder={placeholderB} />
          <button type="button" onClick={() => remove(idx)}>Remove</button>
        </div>
      ))}
    </div>
  )
}


function RichTextField({ label, value, onChange }) {
  const hostRef = useRef(null)
  const quillRef = useRef(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!hostRef.current || quillRef.current) return
    const q = new Quill(hostRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          [{ font: [] }],
          ['bold', 'italic', 'underline'],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image', 'code-block'],
          ['clean'],
        ],
      },
    })

    q.on('text-change', () => {
      onChangeRef.current(q.root.innerHTML)
    })

    quillRef.current = q
  }, [])

  useEffect(() => {
    const q = quillRef.current
    if (!q) return

    const next = value || ''
    const current = q.root.innerHTML
    if (current !== next) {
      const sel = q.getSelection()
      q.root.innerHTML = next
      if (sel) q.setSelection(sel.index, sel.length)
    }
  }, [value])

  return (
    <Field label={label}>
      <div className="admin-quill-wrap">
        <div ref={hostRef} />
      </div>
    </Field>
  )
}

export default function AdminCampaignEditor() {
  useSEO({
    title: 'Campaign Editor',
    description: 'Edit campaign basics, products, and content for Rug Circle campaigns.',
    canonical: '/admin/campaign/:id',
    robots: 'noindex, nofollow',
  })

  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState([])
  const [productSearch, setProductSearch] = useState('')

  const [campaign, setCampaign] = useState({
    campaignType: 'city_workshop', seasonalLabel: '', name: '', location: '', city: '', workshopDate: '', startTime: '', price: '', seatCapacity: '', status: 'draft',
  })

  const [content, setContent] = useState({
    shortSubtitle: '', badgeText: '', priceUnitLabel: '/ person', totalExample: '', overview: '',
    whatsIncluded: [], detailFeatures: [], itinerary: [], faq: [], termsAndPolicy: '', gallery: [], seoTitle: '', seoDescription: '',
    productIds: [],
  })

  const filteredProducts = products.filter((p) => {
    const q = productSearch.trim().toLowerCase()
    if (!q) return true
    const title = String(p?.title || '').toLowerCase()
    const price = String(Number(p?.price || 0).toLocaleString('en-IN')).toLowerCase()
    return title.includes(q) || price.includes(q)
  })

  const selectedProducts = products.filter((p) => content.productIds.includes(Number(p.id)))

  const addProduct = (pid) => {
    const idNum = Number(pid)
    if (!Number.isInteger(idNum) || idNum <= 0) return
    setContent((s) => ({ ...s, productIds: s.productIds.includes(idNum) ? s.productIds : [...s.productIds, idNum] }))
  }

  const removeProduct = (pid) => {
    const idNum = Number(pid)
    setContent((s) => ({ ...s, productIds: s.productIds.filter((x) => x !== idNum) }))
  }

  useEffect(() => {
    Promise.all([api.getCampaignById(id), api.getCampaignContent(id), api.listProducts()])
      .then(([cRes, ctRes, pRes]) => {
        const c = cRes.campaign
        setCampaign({
          campaignType: c.campaignType || 'city_workshop', seasonalLabel: c.seasonalLabel || '', name: c.name || '', location: c.location || '', city: c.city || '', workshopDate: c.workshopDate || '',
          startTime: c.startTime || '', price: Number(c.price || 0), seatCapacity: Number(c.seatCapacity || 0), status: c.status || 'draft',
        })

        const t = ctRes.content || {}
        setProducts(pRes.products || [])
        setContent({
          shortSubtitle: t.short_subtitle || '',
          badgeText: t.badge_text || '',
          priceUnitLabel: t.price_unit_label || '/ person',
          totalExample: t.total_example || '',
          overview: t.overview || '',
          whatsIncluded: normalizeStringList(t.whats_included),
          detailFeatures: normalizeObjectList(t.detail_features, 'title', 'desc'),
          itinerary: normalizeObjectList(t.itinerary, 'step', 'detail'),
          faq: normalizeObjectList(t.faq, 'q', 'a'),
          termsAndPolicy: t.terms_and_policy || '',
          gallery: normalizeStringList(t.gallery),
          seoTitle: t.seo_title || '',
          seoDescription: t.seo_description || '',
          productIds: normalizeStringList(t.product_ids_json).map((x) => Number(x)).filter((x) => Number.isInteger(x) && x > 0),
        })
      })
      .catch((e) => setError(e.message || 'Failed loading campaign'))
      .finally(() => setLoading(false))
  }, [id])

  const saveAll = async () => {
    setSaving(true)
    setError('')
    try {
      await api.updateCampaign(id, {
        campaignType: campaign.campaignType,
        seasonalLabel: campaign.seasonalLabel,
        name: campaign.name,
        location: campaign.location,
        city: campaign.city,
        workshopDate: campaign.workshopDate,
        startTime: campaign.startTime,
        price: Number(campaign.price),
        seatCapacity: Number(campaign.seatCapacity),
        status: campaign.status,
      })

      await api.saveCampaignContent(id, {
        shortSubtitle: content.shortSubtitle,
        badgeText: content.badgeText,
        priceUnitLabel: content.priceUnitLabel,
        totalExample: content.totalExample,
        overview: content.overview,
        whatsIncluded: content.whatsIncluded.filter(Boolean),
        detailFeatures: content.detailFeatures.filter((x) => x.title || x.desc),
        itinerary: content.itinerary.filter((x) => x.step || x.detail),
        faq: content.faq.filter((x) => x.q || x.a),
        termsAndPolicy: content.termsAndPolicy,
        gallery: content.gallery.filter(Boolean),
        seoTitle: content.seoTitle,
        seoDescription: content.seoDescription,
        productIds: content.productIds,
      })
    } catch (e) {
      setError(e.message || 'Failed saving')
    } finally {
      setSaving(false)
    }
  }

  const deleteCampaign = async () => {
    const ok = window.confirm('Delete this campaign permanently?')
    if (!ok) return
    await api.deleteCampaign(id)
    navigate('/admin')
  }

  if (loading) return <div className="admin-page">Loading campaign editor...</div>

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div>
          <h1>Campaign Editor</h1>
          <p>ID: {id}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="admin-link-btn" to="/admin">Back</Link>
          <button onClick={saveAll} disabled={saving}>{saving ? 'Saving...' : 'Save All'}</button>
          <button onClick={deleteCampaign} style={{ background: '#b93a3a', color: '#fff' }}>Delete</button>
        </div>
      </header>

      {error && <div className="admin-error" style={{ marginBottom: 12 }}>{error}</div>}

      <section className="admin-card" style={{ marginBottom: 16 }}>
        <h2>Campaign Basics</h2>
        <div className="admin-form-grid">
          <Field label="Campaign Type">
            <select value={campaign.campaignType} onChange={(e) => setCampaign((s) => ({ ...s, campaignType: e.target.value }))}>
              {CAMPAIGN_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          {campaign.campaignType === 'seasonal_promotion' && (
            <Field label="Which Seasonal Promotion">
              <input
                value={campaign.seasonalLabel}
                placeholder="Valentine's Day, Women's Day..."
                onChange={(e) => setCampaign((s) => ({ ...s, seasonalLabel: e.target.value }))}
              />
            </Field>
          )}
          <Field label="Campaign Name">
            <input value={campaign.name} placeholder="Campaign name" onChange={(e) => setCampaign((s) => ({ ...s, name: e.target.value }))} />
          </Field>
          <Field label="Location">
            <input value={campaign.location} placeholder="Location" onChange={(e) => setCampaign((s) => ({ ...s, location: e.target.value }))} />
          </Field>
          <Field label="City">
            <input value={campaign.city} placeholder="City" onChange={(e) => setCampaign((s) => ({ ...s, city: e.target.value }))} />
          </Field>
          <Field label="Workshop Date">
            <input type="date" value={campaign.workshopDate} onChange={(e) => setCampaign((s) => ({ ...s, workshopDate: e.target.value }))} />
          </Field>
          <Field label="Start Time">
            <input type="time" value={campaign.startTime} onChange={(e) => setCampaign((s) => ({ ...s, startTime: e.target.value }))} />
          </Field>
          <Field label="Price">
            <input type="number" value={campaign.price} onChange={(e) => setCampaign((s) => ({ ...s, price: e.target.value }))} />
          </Field>
          <Field label="Seat Capacity">
            <input type="number" value={campaign.seatCapacity} onChange={(e) => setCampaign((s) => ({ ...s, seatCapacity: e.target.value }))} />
          </Field>
          <Field label="Status">
            <select value={campaign.status} onChange={(e) => setCampaign((s) => ({ ...s, status: e.target.value }))}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </Field>

          <Field label="Products (Search + Select)">
            <input
              placeholder="Search product by name or price..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
            <div style={{ marginTop: 8, border: '1.5px solid var(--color-border)', borderRadius: 12, maxHeight: 220, overflow: 'auto', background: '#fff' }}>
              {filteredProducts.map((p) => {
                const picked = content.productIds.includes(Number(p.id))
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
              {filteredProducts.length === 0 && <div style={{ padding: 10, fontSize: 12, color: '#888' }}>No products found</div>}
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
        </div>
      </section>

      <section className="admin-card">
        <h2>Campaign Content</h2>
        <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <Field label="Subtitle">
            <input placeholder="Subtitle" value={content.shortSubtitle} onChange={(e) => setContent((s) => ({ ...s, shortSubtitle: e.target.value }))} />
          </Field>
          <Field label="Badge Text">
            <input placeholder="Badge text" value={content.badgeText} onChange={(e) => setContent((s) => ({ ...s, badgeText: e.target.value }))} />
          </Field>
          <Field label="Price Unit">
            <input placeholder="Price unit" value={content.priceUnitLabel} onChange={(e) => setContent((s) => ({ ...s, priceUnitLabel: e.target.value }))} />
          </Field>
          <Field label="Total Example">
            <input placeholder="Total example" value={content.totalExample} onChange={(e) => setContent((s) => ({ ...s, totalExample: e.target.value }))} />
          </Field>
          <RichTextField label="Overview" value={content.overview} onChange={(v) => setContent((s) => ({ ...s, overview: v }))} />
          <RichTextField label="Terms and Policy" value={content.termsAndPolicy} onChange={(v) => setContent((s) => ({ ...s, termsAndPolicy: v }))} />
          <Field label="SEO Title">
            <input placeholder="SEO title" value={content.seoTitle} onChange={(e) => setContent((s) => ({ ...s, seoTitle: e.target.value }))} />
          </Field>
          <Field label="SEO Description">
            <input placeholder="SEO description" value={content.seoDescription} onChange={(e) => setContent((s) => ({ ...s, seoDescription: e.target.value }))} />
          </Field>
        </div>

        <div className="admin-content-grid">
          <StringListEditor label="What's Included" items={content.whatsIncluded} onChange={(v) => setContent((s) => ({ ...s, whatsIncluded: v }))} placeholder="Item" />
          <PairListEditor label="Detail Features" items={content.detailFeatures} onChange={(v) => setContent((s) => ({ ...s, detailFeatures: v }))} keyA="title" keyB="desc" placeholderA="Title" placeholderB="Description" />
          <PairListEditor label="Itinerary" items={content.itinerary} onChange={(v) => setContent((s) => ({ ...s, itinerary: v }))} keyA="step" keyB="detail" placeholderA="Step" placeholderB="Detail" />
          <PairListEditor label="FAQs" items={content.faq} onChange={(v) => setContent((s) => ({ ...s, faq: v }))} keyA="q" keyB="a" placeholderA="Question" placeholderB="Answer" />
          <StringListEditor label="Gallery URLs" items={content.gallery} onChange={(v) => setContent((s) => ({ ...s, gallery: v }))} placeholder="https://..." />
        </div>
      </section>
    </div>
  )
}
