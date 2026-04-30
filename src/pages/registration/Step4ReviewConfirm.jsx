import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRegistration } from '../../context/RegistrationContext'
import RegistrationLayout from '../../components/registration/RegistrationLayout'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Step4ReviewConfirm() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { registration, updateStep } = useRegistration()
  const [termsAccepted, setTermsAccepted] = useState(false)

  const campaignPrice = 5500 // Dummy price (replace with actual)
  const quantity = 1
  const subtotal = campaignPrice * quantity
  const gst = Math.round(subtotal * 0.18)
  const total = subtotal + gst

  const handleNext = () => {
    if (!termsAccepted) return
    updateStep(5)
    navigate(`/register/${slug}?step=5`)
  }

  const handleBack = () => {
    updateStep(3)
    navigate(`/register/${slug}?step=3`)
  }

  const fullName = `${registration.personal_info.first_name} ${registration.personal_info.last_name}`

  return (
    <RegistrationLayout currentStep={4} onBack={handleBack} title="Review Your Registration">
      <div className="review-container">
        <div className="review-cards">
          {/* Personal Info Card */}
          <div className="review-card">
            <h3 className="card-title">
              <CheckCircle2 size={18} /> Your Details
            </h3>
            <div className="card-content">
              <div className="info-row">
                <span className="label">Name</span>
                <span className="value">{fullName}</span>
              </div>
              <div className="info-row">
                <span className="label">Email</span>
                <span className="value">{registration.contact_info.email}</span>
              </div>
              <div className="info-row">
                <span className="label">Mobile</span>
                <span className="value">{registration.contact_info.mobile}</span>
              </div>
              <div className="info-row">
                <span className="label">Company</span>
                <span className="value">{registration.contact_info.company}</span>
              </div>
            </div>
          </div>

          {/* Design Card */}
          <div className="review-card">
            <h3 className="card-title">
              <CheckCircle2 size={18} /> Selected Design
            </h3>
            <div className="card-content">
              <div className="info-row">
                <span className="label">Design</span>
                <span className="value">{registration.selected_design_name || 'Not selected'}</span>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="review-card">
            <h3 className="card-title">
              <CheckCircle2 size={18} /> Pricing
            </h3>
            <div className="card-content pricing">
              <div className="info-row">
                <span className="label">Workshop Fee</span>
                <span className="value">₹{campaignPrice.toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="label">GST (18%)</span>
                <span className="value">₹{gst.toLocaleString()}</span>
              </div>
              <div className="divider" />
              <div className="info-row total">
                <span className="label">Total Amount</span>
                <span className="value">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Terms Card */}
          <div className="review-card terms-card">
            <h3 className="card-title">
              <AlertCircle size={18} /> Terms & Conditions
            </h3>
            <div className="card-content">
              <div className="checkbox-group">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <label htmlFor="terms">
                  I agree to the <a href="/terms">terms and conditions</a> and understand the cancellation policy
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleBack}>
            Back
          </button>
          <button type="button" className="btn-primary" onClick={handleNext} disabled={!termsAccepted}>
            Next: Payment
          </button>
        </div>
      </div>

      <style jsx>{`
        .review-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .review-cards {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .review-card {
          background: white;
          border: 1.5px solid var(--color-border);
          border-radius: 12px;
          padding: 20px;
        }

        .review-card.terms-card {
          background: rgba(225, 128, 45, 0.05);
          border-color: var(--color-primary);
        }

        .card-title {
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: var(--color-text);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-title svg {
          color: var(--color-secondary);
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          font-size: 14px;
        }

        .info-row.total {
          font-weight: 700;
          padding-top: 8px;
          border-top: 1px solid var(--color-border);
        }

        .label {
          color: var(--color-text);
          opacity: 0.6;
        }

        .value {
          color: var(--color-text);
          font-weight: 600;
          text-align: right;
          flex: 1;
        }

        .divider {
          height: 1px;
          background: var(--color-border);
          margin: 4px 0;
        }

        .pricing .info-row:last-child .value {
          color: var(--color-primary);
          font-size: 16px;
        }

        .checkbox-group {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        input[type='checkbox'] {
          width: 20px;
          height: 20px;
          margin-top: 2px;
          cursor: pointer;
          accent-color: var(--color-primary);
          flex-shrink: 0;
        }

        label {
          font-size: 13px;
          color: var(--color-text);
          cursor: pointer;
          line-height: 1.5;
        }

        a {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 600;
        }

        a:hover {
          text-decoration: underline;
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
          .form-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </RegistrationLayout>
  )
}
