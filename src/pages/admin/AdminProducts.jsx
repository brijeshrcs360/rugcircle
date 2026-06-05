import { useEffect, useMemo, useState } from 'react'
import { api } from '../../services/api'

const API_ROOT = import.meta.env.DEV ? 'http://localhost:8787' : window.location.origin

function fullImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_ROOT}${path}`
}

export default function AdminProducts() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    title: '',
    price: '',
    description: '',
    mainImage: null,
    galleryImages: [],
  })

  const isEdit = editingId !== null
  const canSubmit = useMemo(() => {
    return form.title.trim().length >= 2 && Number(form.price) > 0 && (isEdit || !!form.mainImage)
  }, [form, isEdit])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.listProducts()
      setRows(res.products || [])
    } catch (e) {
      const msg = String(e?.message || '').trim()
      setError(msg && msg !== 'Request failed' ? msg : 'Product API not reachable. Restart API/server and login again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setEditingId(null)
    setEditingProduct(null)
    setUploadProgress(0)
    setForm({ title: '', price: '', description: '', mainImage: null, galleryImages: [] })
  }

  const onEdit = (p) => {
    setEditingId(p.id)
    setEditingProduct(p)
    setForm({
      title: p.title || '',
      price: p.price || '',
      description: p.description || '',
      mainImage: null,
      galleryImages: [],
    })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    setUploadProgress(0)
    setError('')
    try {
      const fd = new FormData()
      fd.append('title', form.title.trim())
      fd.append('price', String(form.price))
      fd.append('description', form.description.trim())
      if (form.mainImage) fd.append('mainImage', form.mainImage)
      form.galleryImages.forEach((f) => fd.append('galleryImages', f))
      if (isEdit) {
        await api.updateProduct(editingId, fd, setUploadProgress)
      } else {
        await api.createProduct(fd, setUploadProgress)
      }
      resetForm()
      await load()
    } catch (err) {
      const msg = String(err?.message || '').trim()
      setError(msg && msg !== 'Request failed' ? msg : `Product ${isEdit ? 'update' : 'create'} failed. Restart API/server and login again.`)
    } finally {
      setSaving(false)
      setUploadProgress(0)
    }
  }

  const onDelete = async (id) => {
    const ok = window.confirm('Delete this product?')
    if (!ok) return
    setError('')
    try {
      await api.deleteProduct(id)
      await load()
    } catch (e) {
      setError(e.message || 'Failed to delete product')
    }
  }

  return (
    <section className="admin-card">
      <h2>{isEdit ? `Edit Product #${editingId}` : 'Create Product'}</h2>
      {error && <div className="admin-error" style={{ marginBottom: 12 }}>{error}</div>}

      <form className="admin-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }} onSubmit={onSubmit}>
        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700 }}>
          <span>Title</span>
          <input value={form.title} placeholder="Product title" onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
        </label>

        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700 }}>
          <span>Price</span>
          <input type="number" min="0" step="0.01" value={form.price} placeholder="0.00" onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} />
        </label>

        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700, gridColumn: '1 / -1' }}>
          <span>Description</span>
          <textarea style={{ minHeight: 110, border: '1.5px solid var(--color-border)', borderRadius: 10, padding: '10px 12px' }} value={form.description} placeholder="Write product description" onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
        </label>

        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700 }}>
          <span>Main Image {isEdit ? '(optional replace)' : ''}</span>
          <input type="file" accept="image/*" onChange={(e) => setForm((s) => ({ ...s, mainImage: e.target.files?.[0] || null }))} />
          {form.mainImage
            ? <img src={URL.createObjectURL(form.mainImage)} alt="main-preview" style={{ width: 92, height: 92, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }} />
            : (isEdit && editingProduct?.mainImageUrl
              ? <img src={fullImageUrl(editingProduct.mainImageUrl)} alt="main-current" style={{ width: 92, height: 92, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }} />
              : null)}
        </label>

        <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700 }}>
          <span>Gallery Images (multiple) {isEdit ? '(optional replace all)' : ''}</span>
          <input type="file" accept="image/*" multiple onChange={(e) => setForm((s) => ({ ...s, galleryImages: Array.from(e.target.files || []) }))} />
          {form.galleryImages.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {form.galleryImages.map((f, i) => (
                <img key={`${f.name}-${i}`} src={URL.createObjectURL(f)} alt={`gallery-preview-${i + 1}`} style={{ width: 62, height: 62, objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd' }} />
              ))}
            </div>
          )}
          {form.galleryImages.length === 0 && isEdit && Array.isArray(editingProduct?.galleryImages) && editingProduct.galleryImages.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {editingProduct.galleryImages.map((g, i) => (
                <img key={`existing-gallery-${i}`} src={fullImageUrl(g)} alt={`gallery-current-${i + 1}`} style={{ width: 62, height: 62, objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd' }} />
              ))}
            </div>
          )}
        </label>

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
          <button type="submit" disabled={!canSubmit || saving} style={{ flex: 1 }}>{saving ? `Uploading ${uploadProgress}%...` : (isEdit ? 'Update Product' : 'Create Product')}</button>
          {isEdit && <button type="button" className="admin-link-btn" onClick={resetForm}>Cancel Edit</button>}
        </div>
      </form>

      <h2 style={{ marginTop: 24 }}>Product List</h2>
      {loading ? <p>Loading products...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table" style={{ minWidth: 980 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Main Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Description</th>
                <th>Gallery</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {p.mainImageUrl ? <img src={fullImageUrl(p.mainImageUrl)} alt={p.title} style={{ width: 62, height: 62, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }} /> : '-'}
                  </td>
                  <td>{p.title}</td>
                  <td>INR {Number(p.price || 0).toLocaleString('en-IN')}</td>
                  <td style={{ maxWidth: 240, whiteSpace: 'pre-wrap' }}>{p.description || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(Array.isArray(p.galleryImages) ? p.galleryImages : []).map((g, idx) => (
                        <img key={idx} src={fullImageUrl(g)} alt={`${p.title}-${idx + 1}`} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd' }} />
                      ))}
                    </div>
                  </td>
                  <td><div style={{ display: 'flex', gap: 8 }}><button type="button" onClick={() => onEdit(p)}>Edit</button><button type="button" onClick={() => onDelete(p.id)} style={{ background: '#b93a3a', color: '#fff' }}>Delete</button></div></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7}>No products yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
