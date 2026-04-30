import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { useRegistration } from '../../context/RegistrationContext'
import RegistrationLayout from '../../components/registration/RegistrationLayout'
import {
  generatePaymentQR,
  pollPaymentStatus,
  simulateWebhookPayment,
  simulateFailedPayment,
  clearPaymentSimulation,
} from '../../services/hdfcVyapar'
import { CheckCircle2, AlertCircle, Clock, Loader } from 'lucide-react'
import { api } from '../../services/api'

export default function Step5Payment() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { registration, startPayment, setPaymentStatus } = useRegistration()

  const [qrData, setQrData] = useState(null)
  const [paymentStatus, setPaymentStatusLocal] = useState('waiting') // waiting, paid, failed, expired
  const [timeRemaining, setTimeRemaining] = useState(15 * 60) // 15 minutes in seconds
  const [pollingCount, setPollingCount] = useState(0)
  const pollIntervalRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const [loadingQR, setLoadingQR] = useState(true)
  const [campaign, setCampaign] = useState(null)
  const [campaignError, setCampaignError] = useState('')

  useEffect(() => {
    api.getPublicCampaignBySlug(slug)
      .then((res) => setCampaign(res.campaign || null))
      .catch((err) => setCampaignError(err?.message || 'Failed to load campaign'))
  }, [slug])

  const amount = Number(campaign?.price || 0)

  // Initialize QR generation
  useEffect(() => {
    const initPayment = async () => {
      try {
        if (!amount || amount <= 0) {
          setLoadingQR(false)
          return
        }
        const regCode = await startPayment(slug, amount)
        const qr = await generatePaymentQR(amount, regCode)
        setQrData(qr)
        setLoadingQR(false)
      } catch (error) {
        console.error('Error generating QR:', error)
        setLoadingQR(false)
      }
    }

    initPayment()
  }, [slug, amount])

  // Timer countdown
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setPaymentStatusLocal('expired')
          clearInterval(timerIntervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerIntervalRef.current)
  }, [])

  // Payment polling
  useEffect(() => {
    if (!qrData || paymentStatus !== 'waiting') return

    const startPolling = async () => {
      const result = await pollPaymentStatus(qrData.hdfc_reference_id, registration.registration_code)

      setPollingCount((prev) => prev + 1)

      if (result.status === 'paid') {
        setPaymentStatusLocal('paid')
        setPaymentStatus('paid', result.transaction_id)
        clearInterval(pollIntervalRef.current)
        clearPaymentSimulation(registration.registration_code)

        // Auto redirect after 2 seconds
        setTimeout(() => {
          navigate(`/register/${slug}/success`, {
            state: {
              paymentId: result.transaction_id || qrData.hdfc_reference_id,
              bookingId: result.transaction_id || qrData.hdfc_reference_id,
            },
          })
        }, 2000)
      } else if (result.status === 'failed') {
        setPaymentStatusLocal('failed')
        clearInterval(pollIntervalRef.current)
      }

    }

    pollIntervalRef.current = setInterval(startPolling, 5000)
    return () => clearInterval(pollIntervalRef.current)
  }, [qrData, paymentStatus, registration.registration_code, slug, navigate, setPaymentStatus])

  const handleRetry = () => {
    setPaymentStatusLocal('waiting')
    setTimeRemaining(15 * 60)
    setPollingCount(0)
    clearPaymentSimulation(registration.registration_code)
  }

  const handleBack = () => {
    navigate(`/register/${slug}?step=4`)
  }

  // Demo helper: simulate successful payment
  const handleDemoPaymentSuccess = () => {
    simulateWebhookPayment(registration.registration_code)
  }

  // Demo helper: simulate failed payment
  const handleDemoPaymentFailed = () => {
    simulateFailedPayment(registration.registration_code)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  if (loadingQR) {
    return (
      <RegistrationLayout currentStep={5} onBack={handleBack} title="Complete Payment">
        <div className="loading-container">
          <div className="spinner" />
          <p>Generating UPI QR Code...</p>
        </div>
      </RegistrationLayout>
    )
  }

  if (campaignError) {
    return (
      <RegistrationLayout currentStep={5} onBack={handleBack} title="Complete Payment">
        <div className="error-container">
          <AlertCircle size={48} />
          <p>{campaignError}</p>
          <button className="btn-primary" onClick={handleBack}>
            Go Back
          </button>
        </div>
      </RegistrationLayout>
    )
  }

  if (!amount || amount <= 0) {
    return (
      <RegistrationLayout currentStep={5} onBack={handleBack} title="Complete Payment">
        <div className="error-container">
          <AlertCircle size={48} />
          <p>Invalid campaign price. Contact Rug Circle.</p>
          <button className="btn-primary" onClick={handleBack}>
            Go Back
          </button>
        </div>
      </RegistrationLayout>
    )
  }

  if (!qrData) {
    return (
      <RegistrationLayout currentStep={5} onBack={handleBack} title="Complete Payment">
        <div className="error-container">
          <AlertCircle size={48} />
          <p>Failed to generate QR code. Please try again.</p>
          <button className="btn-primary" onClick={handleBack}>
            Go Back
          </button>
        </div>
      </RegistrationLayout>
    )
  }

  return (
    <RegistrationLayout currentStep={5} onBack={handleBack} title="Complete Payment">
      <div className="payment-container">
        {/* Main Payment Card */}
        <motion.div className="payment-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="payment-header">
            <h2>Scan to Pay</h2>
            <p className="amount">{formatCurrency(amount)}</p>
            {paymentStatus === 'waiting' && (
              <div className="timer">
                <Clock size={16} />
                <span>Expires in {formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>

          {/* QR Code Display */}
          {paymentStatus === 'waiting' && (
            <div className="qr-section">
              <img src={qrData.qr_code} alt="Payment QR Code" className="qr-code" />
              <p className="qr-hint">Use any UPI app to scan this QR code</p>
              <a href={qrData.upi_string} className="upi-link">
                Pay via Direct UPI Link
              </a>
            </div>
          )}

          {/* Payment Status: Pending */}
          {paymentStatus === 'waiting' && (
            <div className="status-section">
              <div className="polling-status">
                <Loader size={20} className="spinner-icon" />
                <p>Waiting for payment confirmation...</p>
                <span className="polling-count">Checking... ({pollingCount})</span>
              </div>
            </div>
          )}

          {/* Payment Status: Success */}
          {paymentStatus === 'paid' && (
            <motion.div className="status-section success" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <CheckCircle2 size={48} className="success-icon" />
              <h3>Payment Successful! 🎉</h3>
              <p>Your registration is confirmed. Redirecting...</p>
            </motion.div>
          )}

          {/* Payment Status: Failed */}
          {paymentStatus === 'failed' && (
            <div className="status-section error">
              <AlertCircle size={48} className="error-icon" />
              <h3>Payment Failed</h3>
              <p>Your payment could not be processed. Please try again.</p>
              <button className="btn-primary" onClick={handleRetry}>
                Try Again
              </button>
            </div>
          )}

          {/* Payment Status: Expired */}
          {paymentStatus === 'expired' && (
            <div className="status-section error">
              <Clock size={48} className="error-icon" />
              <h3>QR Code Expired</h3>
              <p>This QR code is no longer valid. Please generate a new one.</p>
              <button className="btn-primary" onClick={handleRetry}>
                Generate New QR
              </button>
            </div>
          )}
        </motion.div>

        {/* Demo Controls (Remove in production) */}
        {import.meta.env.DEV && paymentStatus === 'waiting' && (
          <div className="demo-controls">
            <p className="demo-label">🧪 Demo Controls (Development Only)</p>
            <div className="demo-buttons">
              <button className="demo-btn success" onClick={handleDemoPaymentSuccess}>
                ✓ Simulate Payment Success
              </button>
              <button className="demo-btn error" onClick={handleDemoPaymentFailed}>
                ✗ Simulate Payment Failed
              </button>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-rows">
            <div className="summary-row">
              <span>Workshop Fee</span>
              <span>₹5,500</span>
            </div>
            <div className="summary-row">
              <span>Quantity</span>
              <span>1</span>
            </div>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹5,500</span>
            </div>
            <div className="summary-row">
              <span>GST (18%)</span>
              <span>₹990</span>
            </div>
            <div className="summary-row">
              <span>Total</span>
              <span>₹6,490</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row paying">
              <span>Paying Now (50%)</span>
              <span>{formatCurrency(amount)}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .payment-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .payment-card {
          background: white;
          border: 1.5px solid var(--color-border);
          border-radius: 16px;
          padding: 32px 24px;
          text-align: center;
        }

        .payment-header {
          margin-bottom: 28px;
        }

        .payment-header h2 {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: var(--color-text);
        }

        .amount {
          font-size: 32px;
          font-weight: 700;
          color: var(--color-primary);
          margin: 0 0 8px 0;
        }

        .timer {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: rgba(225, 128, 45, 0.1);
          color: var(--color-primary);
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
        }

        .qr-section {
          margin-bottom: 24px;
        }

        .qr-code {
          width: 200px;
          height: 200px;
          border: 2px solid var(--color-primary);
          border-radius: 12px;
          margin: 0 auto 16px;
          display: block;
          padding: 8px;
          background: white;
        }

        .qr-hint {
          font-size: 13px;
          color: var(--color-text);
          opacity: 0.6;
          margin: 0 0 12px 0;
        }

        .upi-link {
          display: inline-block;
          padding: 10px 16px;
          background: var(--color-bg-alt);
          color: var(--color-primary);
          border: 1.5px solid var(--color-primary);
          border-radius: 6px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .upi-link:hover {
          background: var(--color-primary);
          color: white;
        }

        .status-section {
          margin-top: 24px;
          padding: 24px;
          background: var(--color-bg-alt);
          border-radius: 12px;
        }

        .status-section.success {
          background: rgba(145, 186, 121, 0.1);
        }

        .status-section.error {
          background: rgba(231, 76, 60, 0.1);
        }

        .polling-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .spinner-icon {
          animation: spin 2s linear infinite;
          color: var(--color-primary);
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .polling-status p {
          margin: 0;
          font-weight: 600;
          color: var(--color-text);
        }

        .polling-count {
          font-size: 12px;
          color: var(--color-text);
          opacity: 0.5;
        }

        .success-icon {
          color: var(--color-secondary);
          margin-bottom: 12px;
        }

        .error-icon {
          color: #e74c3c;
          margin-bottom: 12px;
        }

        .status-section h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: var(--color-text);
        }

        .status-section p {
          font-size: 14px;
          color: var(--color-text);
          opacity: 0.7;
          margin: 0 0 16px 0;
        }

        .demo-controls {
          background: #f0f8ff;
          border: 2px dashed #0066cc;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }

        .demo-label {
          font-size: 12px;
          font-weight: 600;
          color: #0066cc;
          margin: 0 0 12px 0;
        }

        .demo-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .demo-btn {
          padding: 10px 14px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .demo-btn.success {
          background: rgba(145, 186, 121, 0.2);
          color: var(--color-secondary);
          border: 1px solid var(--color-secondary);
        }

        .demo-btn.success:hover {
          background: var(--color-secondary);
          color: white;
        }

        .demo-btn.error {
          background: rgba(231, 76, 60, 0.2);
          color: #e74c3c;
          border: 1px solid #e74c3c;
        }

        .demo-btn.error:hover {
          background: #e74c3c;
          color: white;
        }

        .order-summary {
          background: white;
          border: 1.5px solid var(--color-border);
          border-radius: 12px;
          padding: 20px;
        }

        .order-summary h3 {
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: var(--color-text);
        }

        .summary-rows {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--color-text);
        }

        .summary-row span:first-child {
          opacity: 0.6;
        }

        .summary-row.paying {
          font-weight: 700;
          color: var(--color-primary);
          margin-top: 8px;
        }

        .summary-divider {
          height: 1px;
          background: var(--color-border);
          margin: 8px 0;
        }

        .loading-container {
          text-align: center;
          padding: 60px 20px;
          color: var(--color-text);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        .error-container {
          text-align: center;
          padding: 40px 20px;
          color: var(--color-text);
        }

        .error-container svg {
          color: #e74c3c;
          margin-bottom: 16px;
        }

        .btn-primary {
          padding: 12px 24px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 16px;
        }

        .btn-primary:hover {
          background: #d97023;
        }

        @media (max-width: 640px) {
          .payment-card {
            padding: 24px 16px;
          }

          .demo-buttons {
            grid-template-columns: 1fr;
          }

          .amount {
            font-size: 24px;
          }
        }
      `}</style>
    </RegistrationLayout>
  )
}
