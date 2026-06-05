import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRegistration } from '../../context/RegistrationContext'
import RegistrationLayout from '../../components/registration/RegistrationLayout'

export default function Step2ContactInfo() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { registration, updateContactInfo, updateStep } = useRegistration()
  const [formData, setFormData] = useState(registration.contact_info)
  const [validationErrors, setValidationErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required'
    if (!/^[0-9]{10}$/.test(formData.mobile.replace(/\D/g, ''))) newErrors.mobile = 'Mobile must be 10 digits'
    if (!formData.company.trim()) newErrors.company = 'Company/Organization name is required'

    setValidationErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      updateContactInfo(formData)
      updateStep(3)
      navigate(`/register/${slug}?step=3`)
    }
  }

  const handleBack = () => {
    updateContactInfo(formData)
    updateStep(1)
    navigate(`/register/${slug}?step=1`)
  }

  return (
    <RegistrationLayout currentStep={2} onBack={handleBack} title="Contact Information">
      <div className="form-container">
        <div className="form-section">
          <h2 className="section-title">How can we reach you?</h2>
          <p className="section-desc">We'll send workshop updates and confirmation to these details</p>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={validationErrors.email ? 'input-error' : ''}
            />
            {validationErrors.email && <p className="error-text">{validationErrors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number *</label>
            <input
              id="mobile"
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="+91 9876 543210"
              className={validationErrors.mobile ? 'input-error' : ''}
            />
            {validationErrors.mobile && <p className="error-text">{validationErrors.mobile}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="company">Company/Organization *</label>
            <input
              id="company"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Your company name"
              className={validationErrors.company ? 'input-error' : ''}
            />
            {validationErrors.company && <p className="error-text">{validationErrors.company}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address (Optional)</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address, City, State"
              rows="3"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleBack}>
            Back
          </button>
          <button type="button" className="btn-primary" onClick={handleNext}>
            Next: Choose Design
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

        input,
        textarea {
          padding: 12px;
          border: 1.5px solid var(--color-border);
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s;
          resize: vertical;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(225, 128, 45, 0.1);
        }

        input.input-error,
        textarea.input-error {
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
