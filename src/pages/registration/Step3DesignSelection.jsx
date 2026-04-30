import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRegistration } from '../../context/RegistrationContext'
import RegistrationLayout from '../../components/registration/RegistrationLayout'
import { CheckCircle2 } from 'lucide-react'

export default function Step3DesignSelection() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { registration, updateSelectedDesign, updateStep } = useRegistration()
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)

  // Dummy designs (replace with API call)
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setDesigns([
        {
          id: 1,
          name: 'Classic Geometric',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=300&fit=crop',
          difficulty: 'Easy',
          description: 'Traditional patterns with modern flair',
        },
        {
          id: 2,
          name: 'Floral Garden',
          image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=300&h=300&fit=crop',
          difficulty: 'Medium',
          description: 'Beautiful botanical inspired designs',
        },
        {
          id: 3,
          name: 'Abstract Dreams',
          image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300&h=300&fit=crop',
          difficulty: 'Easy',
          description: 'Contemporary abstract patterns',
        },
        {
          id: 4,
          name: 'Tribal Heritage',
          image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=300&h=300&fit=crop',
          difficulty: 'Hard',
          description: 'Intricate traditional tribal motifs',
        },
        {
          id: 5,
          name: 'Minimalist Vibes',
          image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300&h=300&fit=crop',
          difficulty: 'Easy',
          description: 'Clean and simple line work',
        },
        {
          id: 6,
          name: 'Mandala Magic',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&h=300&fit=crop',
          difficulty: 'Medium',
          description: 'Symmetrical mandala patterns',
        },
      ])
      setLoading(false)
    }, 600)
  }, [slug])

  const handleSelectDesign = (design) => {
    updateSelectedDesign(design.id, design.name)
    updateStep(4)
    navigate(`/register/${slug}?step=4`)
  }

  const handleBack = () => {
    updateStep(2)
    navigate(`/register/${slug}?step=2`)
  }

  if (loading) {
    return (
      <RegistrationLayout currentStep={3} onBack={handleBack} title="Choose Your Design">
        <div className="loading-state">
          <p>Loading rug designs...</p>
        </div>
      </RegistrationLayout>
    )
  }

  return (
    <RegistrationLayout currentStep={3} onBack={handleBack} title="Choose Your Design">
      <div className="design-container">
        <div className="design-header">
          <h2 className="section-title">Pick Your Perfect Rug Design</h2>
          <p className="section-desc">Choose from our collection of beautiful handmade rug patterns</p>
        </div>

        <div className="designs-grid">
          {designs.map((design) => (
            <button
              key={design.id}
              type="button"
              className={`design-card ${registration.selected_design_id === design.id ? 'selected' : ''}`}
              onClick={() => handleSelectDesign(design)}
            >
              <div className="design-image-wrapper">
                <img src={design.image} alt={design.name} className="design-image" />
                {registration.selected_design_id === design.id && (
                  <div className="selection-badge">
                    <CheckCircle2 size={32} />
                  </div>
                )}
              </div>

              <div className="design-info">
                <h3 className="design-name">{design.name}</h3>
                <p className="design-desc">{design.description}</p>
                <div className="design-meta">
                  <span className="difficulty-badge">{design.difficulty}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleBack}>
            Back
          </button>
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
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .design-header {
          text-align: center;
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: var(--color-text);
        }

        .section-desc {
          font-size: 14px;
          color: var(--color-text);
          opacity: 0.6;
          margin: 0;
        }

        .designs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
        }

        .design-card {
          background: white;
          border: 2px solid var(--color-border);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
          text-align: left;
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        .design-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(26, 22, 22, 0.1);
        }

        .design-card.selected {
          border-color: var(--color-primary);
          background: rgba(225, 128, 45, 0.05);
        }

        .design-image-wrapper {
          position: relative;
          width: 100%;
          padding-bottom: 100%;
          overflow: hidden;
          background: var(--color-bg-alt);
        }

        .design-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .selection-badge {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(26, 22, 22, 0.3);
          color: var(--color-secondary);
          backdrop-filter: blur(4px);
        }

        .design-info {
          padding: 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .design-name {
          font-size: 13px;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: var(--color-text);
        }

        .design-desc {
          font-size: 11px;
          color: var(--color-text);
          opacity: 0.6;
          margin: 0 0 8px 0;
          flex: 1;
        }

        .design-meta {
          display: flex;
          gap: 6px;
        }

        .difficulty-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 4px 8px;
          background: rgba(225, 128, 45, 0.15);
          color: var(--color-primary);
          border-radius: 4px;
        }

        .loading-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--color-text);
          opacity: 0.6;
        }

        .form-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }

        button {
          padding: 14px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #d97023;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(225, 128, 45, 0.2);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: var(--color-bg-alt);
          color: var(--color-text);
          border: 1.5px solid var(--color-border);
        }

        .btn-secondary:hover {
          background: var(--color-border);
        }

        @media (max-width: 640px) {
          .designs-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .form-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </RegistrationLayout>
  )
}
