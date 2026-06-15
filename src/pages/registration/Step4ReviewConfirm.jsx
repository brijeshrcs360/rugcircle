import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRegistration } from '../../context/RegistrationContext'
import RegistrationLayout from '../../components/registration/RegistrationLayout'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { api } from '../../services/api'

export default function Step4ReviewConfirm() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { registration, updateStep, updatePaymentInfo, updateCoupon } = useRegistration()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [couponCode, setCouponCode] = useState(registration.coupon?.code || '')
  const [couponMessage, setCouponMessage] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const campaignPrice = 5500
  const quantity = 1
  const subtotal = campaignPrice * quantity
  const gst = Math.round(subtotal * 0.18)
  const total = subtotal + gst
  const paymentPercent = Number(registration.payment_percent || 50)
  const payableNow = paymentPercent === 50 ? Math.round(total * 0.5) : total
  const couponDiscount = Number(registration.coupon?.discount || 0)
  const finalPayableNow = Math.max(0, payableNow - couponDiscount)

  const applyCoupon = async () => {
    const code = couponCode.trim()
    if (!code) return
    setCouponLoading(true)
    setCouponMessage('')
    try {
      const res = await api.validateCoupon(code, payableNow)
      updateCoupon(res.coupon)
      setCouponMessage(`Applied ${res.coupon.code}. Discount Rs ${Number(res.coupon.discount || 0).toLocaleString()}`)
    } catch (e) {
      updateCoupon(null)
      setCouponMessage(e.message || 'Coupon invalid')
    } finally {
      setCouponLoading(false)
    }
  }

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
        <div className="review-hero">
          <p className="review-eyebrow">Final Check</p>
          <h2>Review Before Payment</h2>
          <p>Confirm your details and payment choice. Then continue to secure payment.</p>
        </div>

        <div className="review-cards">
          <div className="review-card">
            <h3 className="card-title"><CheckCircle2 size={18} /> Your Details</h3>
            <div className="card-content">
              <div className="info-row"><span className="label">Name</span><span className="value">{fullName}</span></div>
              <div className="info-row"><span className="label">Email</span><span className="value">{registration.contact_info.email}</span></div>
              <div className="info-row"><span className="label">Mobile</span><span className="value">{registration.contact_info.mobile}</span></div>
              <div className="info-row"><span className="label">Company</span><span className="value">{registration.contact_info.company}</span></div>
            </div>
          </div>

          <div className="review-card">
            <h3 className="card-title"><CheckCircle2 size={18} /> Selected Product</h3>
            <div className="card-content">
              <div className="info-row"><span className="label">Product</span><span className="value">{registration.selected_design_name || 'Not selected'}</span></div>
            </div>
          </div>

          <div className="review-card">
            <h3 className="card-title"><CheckCircle2 size={18} /> Pricing</h3>
            <div className="card-content pricing">
              <div className="info-row"><span className="label">Workshop Fee</span><span className="value">Rs {campaignPrice.toLocaleString()}</span></div>
              <div className="info-row"><span className="label">GST (18%)</span><span className="value">Rs {gst.toLocaleString()}</span></div>
              <div className="divider" />
              <div className="info-row total"><span className="label">Total Amount</span><span className="value">Rs {total.toLocaleString()}</span></div>
              <div className="divider" />
              <div className="info-row">
                <span className="label">Payment Option</span>
                <span className="value">
                  <select value={paymentPercent} onChange={(e) => updatePaymentInfo(Number(e.target.value))}>
                    <option value={50}>Pay 50% now</option>
                    <option value={100}>Pay 100% now</option>
                  </select>
                </span>
              </div>
              <div className="info-row total"><span className="label">Payable Now</span><span className="value">Rs {payableNow.toLocaleString()}</span></div>
              <div className="info-row">
                <span className="label">Coupon</span>
                <span className="value">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon code" />
                    <button type="button" onClick={applyCoupon} disabled={couponLoading}>{couponLoading ? 'Checking...' : 'Apply'}</button>
                  </div>
                  {couponMessage && <div style={{ marginTop: 6, fontSize: 12, color: couponMessage.startsWith('Applied') ? '#2f7d32' : '#b00020' }}>{couponMessage}</div>}
                </span>
              </div>
              {couponDiscount > 0 && <div className="info-row total"><span className="label">After Coupon</span><span className="value">Rs {finalPayableNow.toLocaleString()}</span></div>}
            </div>
          </div>

          <div className="review-card terms-card">
            <h3 className="card-title"><AlertCircle size={18} /> Terms & Conditions</h3>
            <div className="card-content">
              <div className="checkbox-group">
                <input id="terms" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                <label htmlFor="terms">I agree to the <a href="/terms">terms and conditions</a> and understand the cancellation policy</label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={handleBack}>Back</button>
          <button type="button" className="btn-primary" onClick={handleNext} disabled={!termsAccepted}>Next: Payment</button>
        </div>
      </div>

      <style jsx>{`
        .review-container {
          display: grid;
          gap: 18px;
        }

        .review-hero {
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 18px;
          background:
            radial-gradient(120% 140% at 0% 0%, rgba(225, 128, 45, 0.13) 0%, rgba(225, 128, 45, 0.04) 45%, rgba(255,255,255,0.95) 100%),
            #fff;
        }

        .review-hero h2 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.4px;
          color: #1f1a17;
        }

        .review-hero p {
          margin: 8px 0 0;
          color: #6d5e53;
          font-size: 14px;
          line-height: 1.5;
        }

        .review-eyebrow {
          margin: 0 0 6px !important;
          font-size: 11px !important;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: #b86b22 !important;
          font-weight: 700;
        }

        .review-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .review-card {
          background: #fff;
          border: 1px solid var(--color-border);
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 8px 24px rgba(26, 22, 22, 0.04);
        }

        .card-title {
          margin: 0 0 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          color: #1f1a17;
        }

        .card-content {
          display: grid;
          gap: 8px;
        }

        .info-row {
          display: grid;
          grid-template-columns: 130px 1fr;
          gap: 8px;
          align-items: start;
        }

        .label {
          color: #7a6f67;
          font-size: 13px;
          font-weight: 600;
        }

        .value {
          color: #1f1a17;
          font-size: 14px;
          word-break: break-word;
        }

        .pricing .divider {
          height: 1px;
          background: #eee4dc;
          margin: 4px 0;
        }

        .info-row.total .label,
        .info-row.total .value {
          font-weight: 800;
          color: #222;
        }

        .value select {
          width: 100%;
          min-height: 36px;
          border-radius: 10px;
          border: 1.5px solid var(--color-border);
          padding: 6px 10px;
          font-size: 14px;
          background: #fff;
        }

        .terms-card {
          grid-column: 1 / -1;
          background: linear-gradient(180deg, #fff, #fef9f4);
        }

        .checkbox-group {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .checkbox-group input {
          margin-top: 2px;
        }

        .checkbox-group label {
          color: #473b33;
          line-height: 1.45;
          font-size: 14px;
        }

        .checkbox-group a {
          color: #c06b1e;
          text-decoration: underline;
        }

        .form-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .btn-primary, .btn-secondary {
          min-height: 48px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
        }

        @media (max-width: 880px) {
          .review-cards {
            grid-template-columns: 1fr;
          }
          .info-row {
            grid-template-columns: 1fr;
            gap: 2px;
          }
          .form-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </RegistrationLayout>
  )
}
