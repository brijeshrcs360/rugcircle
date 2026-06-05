import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRegistration } from '../../context/RegistrationContext'
import RegistrationLayout from '../../components/registration/RegistrationLayout'
import { api } from '../../services/api'
import { CheckCircle2 } from 'lucide-react'

const API_ROOT = import.meta.env.DEV ? 'http://localhost:8787' : window.location.origin
const fullImageUrl = (path) => {
  if (!path) return ''
  if (String(path).startsWith('http://') || String(path).startsWith('https://')) return path
  return `${API_ROOT}${path}`
}

export default function Step3DesignSelection() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { registration, updateSelectedDesign, updateStep } = useRegistration()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api.getPublicCampaignBySlug(slug)
      .then((res) => {
        setProducts(Array.isArray(res?.campaign?.products) ? res.campaign.products : [])
      })
      .catch((e) => {
        setError(e?.message || 'Failed to load products')
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [slug])

  const handleSelectProduct = (p) => {
    updateSelectedDesign(p.id, p.title)
  }

  const handleBack = () => {
    updateStep(2)
    navigate(`/register/${slug}?step=2`)
  }

  if (loading) {
    return (
      <RegistrationLayout currentStep={3} onBack={handleBack} title="Choose Product">
        <div className="loading-state"><p>Loading products...</p></div>
      </RegistrationLayout>
    )
  }

  return (
    <RegistrationLayout currentStep={3} onBack={handleBack} title="Choose Product">
      {error && <div className="admin-error" style={{ marginBottom: 12 }}>{error}</div>}
      <div className="design-container">
        <div className="design-header">
          <h2 className="section-title">Pick Product</h2>
          <p className="section-desc">Selected products from campaign are shown below.</p>
        </div>

        <div className="designs-grid">
          {products.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`design-card ${registration.selected_design_id === p.id ? 'selected' : ''}`}
              onClick={() => handleSelectProduct(p)}
            >
              <div className="design-image-wrapper">
                <img src={fullImageUrl(p.mainImageUrl)} alt={p.title} className="design-image" />
                {registration.selected_design_id === p.id && (
                  <div className="selection-badge"><CheckCircle2 size={32} /></div>
                )}
              </div>
              <div className="design-info">
                <h3 className="design-name">{p.title}</h3>
                <p className="design-desc">{p.description || 'No description'}</p>
              </div>
            </button>
          ))}
        </div>

        {products.length === 0 && <div className="loading-state"><p>No products assigned to this campaign.</p></div>}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleBack}>Back</button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              if (registration.selected_design_id) {
                updateStep(4)
                navigate(`/register/${slug}?step=4`)
              }
            }}
            disabled={!registration.selected_design_id}
          >
            Next: Review & Payment
          </button>
        </div>
      </div>

      <style jsx>{`
        .design-container {
          display: grid;
          gap: 18px;
        }

        .design-header {
          display: grid;
          gap: 4px;
        }

        .section-title {
          margin: 0;
          font-size: 28px;
          line-height: 1.15;
          letter-spacing: -0.3px;
          color: #1f1a17;
        }

        .section-desc {
          margin: 0;
          color: #78685a;
          font-size: 14px;
        }

        .designs-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .design-card {
          border: 1px solid var(--color-border);
          border-radius: 14px;
          overflow: hidden;
          background: #fff;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          text-align: left;
          padding: 0;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
          box-shadow: 0 6px 20px rgba(20, 16, 12, 0.06);
        }

        .design-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px rgba(20, 16, 12, 0.1);
        }

        .design-card.selected {
          border-color: #db8d3d;
          box-shadow: 0 0 0 2px rgba(219, 141, 61, 0.2), 0 12px 28px rgba(182, 93, 11, 0.16);
        }

        .design-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #f6f3f0;
          overflow: hidden;
        }

        .design-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .selection-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          background: rgba(27, 133, 77, 0.95);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(18, 94, 55, 0.35);
        }

        .design-info {
          padding: 12px;
          display: grid;
          gap: 8px;
        }

        .design-name {
          margin: 0;
          font-size: 16px;
          line-height: 1.3;
          color: #1f1a17;
        }

        .design-desc {
          margin: 0;
          font-size: 13px;
          color: #6f6258;
          line-height: 1.45;
          min-height: 36px;
        }

        .difficulty-badge {
          display: inline-flex;
          font-size: 12px;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 999px;
          background: #fff4e7;
          border: 1px solid #f0d6b8;
          color: #a55b15;
        }

        .loading-state {
          border: 1px dashed var(--color-border);
          border-radius: 12px;
          background: #fff;
          padding: 20px;
          text-align: center;
          color: #78685a;
        }

        .form-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .btn-primary, .btn-secondary {
          min-height: 46px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
        }

        @media (max-width: 980px) {
          .designs-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .section-title {
            font-size: 24px;
          }

          .designs-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </RegistrationLayout>
  )
}
