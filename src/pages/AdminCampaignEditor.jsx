import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'

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

export default function AdminCampaignEditor() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [campaign, setCampaign] = useState({
    name: '', location: '', city: '', workshopDate: '', startTime: '', price: '', seatCapacity: '', status: 'draft',
  })

  const [content, setContent] = useState({
    shortSubtitle: '', badgeText: '', priceUnitLabel: '/ person', totalExample: '', overview: '',
    whatsIncluded: [], detailFeatures: [], itinerary: [], faq: [], termsAndPolicy: '', gallery: [], seoTitle: '', seoDescription: '',
  })

  useEffect(() => {
    Promise.all([api.getCampaignById(id), api.getCampaignContent(id)])
      .then(([cRes, ctRes]) => {
        const c = cRes.campaign
        setCampaign({
          name: c.name || '', location: c.location || '', city: c.city || '', workshopDate: c.workshopDate || '',
          startTime: c.startTime || '', price: Number(c.price || 0), seatCapacity: Number(c.seatCapacity || 0), status: c.status || 'draft',
        })

        const t = ctRes.content || {}
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
          <input value={campaign.name} placeholder="Campaign name" onChange={(e) => setCampaign((s) => ({ ...s, name: e.target.value }))} />
          <input value={campaign.location} placeholder="Location" onChange={(e) => setCampaign((s) => ({ ...s, location: e.target.value }))} />
          <input value={campaign.city} placeholder="City" onChange={(e) => setCampaign((s) => ({ ...s, city: e.target.value }))} />
          <input type="date" value={campaign.workshopDate} onChange={(e) => setCampaign((s) => ({ ...s, workshopDate: e.target.value }))} />
          <input type="time" value={campaign.startTime} onChange={(e) => setCampaign((s) => ({ ...s, startTime: e.target.value }))} />
          <input type="number" value={campaign.price} onChange={(e) => setCampaign((s) => ({ ...s, price: e.target.value }))} />
          <input type="number" value={campaign.seatCapacity} onChange={(e) => setCampaign((s) => ({ ...s, seatCapacity: e.target.value }))} />
          <select value={campaign.status} onChange={(e) => setCampaign((s) => ({ ...s, status: e.target.value }))}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </section>

      <section className="admin-card">
        <h2>Campaign Content</h2>
        <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <input placeholder="Subtitle" value={content.shortSubtitle} onChange={(e) => setContent((s) => ({ ...s, shortSubtitle: e.target.value }))} />
          <input placeholder="Badge text" value={content.badgeText} onChange={(e) => setContent((s) => ({ ...s, badgeText: e.target.value }))} />
          <input placeholder="Price unit" value={content.priceUnitLabel} onChange={(e) => setContent((s) => ({ ...s, priceUnitLabel: e.target.value }))} />
          <input placeholder="Total example" value={content.totalExample} onChange={(e) => setContent((s) => ({ ...s, totalExample: e.target.value }))} />
          <textarea style={{ gridColumn: '1/-1', minHeight: 90 }} placeholder="Overview" value={content.overview} onChange={(e) => setContent((s) => ({ ...s, overview: e.target.value }))} />
          <textarea style={{ gridColumn: '1/-1', minHeight: 90 }} placeholder="Terms and policy" value={content.termsAndPolicy} onChange={(e) => setContent((s) => ({ ...s, termsAndPolicy: e.target.value }))} />
          <input placeholder="SEO title" value={content.seoTitle} onChange={(e) => setContent((s) => ({ ...s, seoTitle: e.target.value }))} />
          <input placeholder="SEO description" value={content.seoDescription} onChange={(e) => setContent((s) => ({ ...s, seoDescription: e.target.value }))} />
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
