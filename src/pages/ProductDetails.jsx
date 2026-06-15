import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../services/api'
import useSEO from '../hooks/useSEO'

const API_ROOT = import.meta.env.DEV ? 'http://localhost:8787' : window.location.origin
const fullImageUrl = (path) => {
  if (!path) return ''
  if (String(path).startsWith('http://') || String(path).startsWith('https://')) return path
  return `${API_ROOT}${path}`
}

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.getPublicProductById(id)
      .then((res) => setProduct(res.product || null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  useSEO({
    title: product?.title || 'Product',
    description: product?.description || 'Rug Circle product details and gallery.',
    canonical: `/product/${id}`,
    ogType: 'product',
  })

  if (loading) return <div className="details-page"><div className="details-inner"><h1>Loading product...</h1></div></div>
  if (!product) return <div className="details-page"><div className="details-inner"><h1>Product not found</h1><Link className="btn-primary" to="/">Back to home</Link></div></div>

  return (
    <div className="details-page">
      <div className="details-inner">
        <div className="details-hero">
          <div className="section-label">Product</div>
          <h1>{product.title}</h1>
          <div className="price-big">INR {Number(product.price || 0).toLocaleString('en-IN')}</div>
          <p style={{ color: '#666', marginTop: 10 }}>{product.description || 'No description provided.'}</p>
        </div>
        <div className="details-content">
          {product.mainImageUrl && <img src={fullImageUrl(product.mainImageUrl)} alt={product.title} style={{ width: '100%', borderRadius: 18, marginBottom: 16 }} />}
          {Array.isArray(product.galleryImages) && product.galleryImages.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
              {product.galleryImages.map((img, idx) => <img key={idx} src={fullImageUrl(img)} alt={`${product.title}-${idx + 1}`} style={{ width: '100%', borderRadius: 14 }} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
