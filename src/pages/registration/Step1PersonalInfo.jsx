import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRegistration } from '../../context/RegistrationContext'
import RegistrationLayout from '../../components/registration/RegistrationLayout'

export default function Step1PersonalInfo() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { registration, updatePersonalInfo, updateStep } = useRegistration()
  const [formData, setFormData] = useState(registration.personal_info)
  const [validationErrors, setValidationErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (formData.first_name.trim().length < 2) newErrors.first_name = 'First name must be at least 2 characters'
    if (formData.last_name.trim().length < 2) newErrors.last_name = 'Last name must be at least 2 characters'

    setValidationErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      updatePersonalInfo(formData)
      updateStep(2)
      navigate(`/register/${slug}?step=2`)
    }
  }

  const handleBack = () => {
    navigate(`/package/${slug}`)
  }

  return (
    <RegistrationLayout currentStep={1} onBack={handleBack} title="Your Details">
      <div className="form-container">
        <div className="form-section">
          <h2 className="section-title">What's your name?</h2>
          <p className="section-desc">We'll use this to personalize your workshop experience</p>

          <div className="form-group">
            <label htmlFor="first_name">First Name *</label>
            <input
              id="first_name"
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="John"
              className={validationErrors.first_name ? 'input-error' : ''}
            />
            {validationErrors.first_name && <p className="error-text">{validationErrors.first_name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name *</label>
            <input
              id="last_name"
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Doe"
              className={validationErrors.last_name ? 'input-error' : ''}
            />
            {validationErrors.last_name && <p className="error-text">{validationErrors.last_name}</p>}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleBack}>
            Back
          </button>
          <button type="button" className="btn-primary" onClick={handleNext}>
            Next: Contact Info
          </button>
        </div>
      </div>

      <style jsx>{`
        .form-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .form-section {
          background: white;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid var(--color-border);
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
          margin: 0 0 20px 0;
        }

        .form-group {
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        label {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text);
        }

        input {
          padding: 12px;
          border: 1.5px solid var(--color-border);
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s;
        }

        input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(225, 128, 45, 0.1);
        }

        input.input-error {
          border-color: #e74c3c;
        }

        .error-text {
          font-size: 12px;
          color: #e74c3c;
          margin: 0;
        }

        .form-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
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

        .btn-primary:hover {
          background: #d97023;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(225, 128, 45, 0.2);
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
          .form-section {
            padding: 18px;
          }

          .form-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </RegistrationLayout>
  )
}
