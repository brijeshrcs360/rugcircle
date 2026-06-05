import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { useRegistration } from '../../context/RegistrationContext'
import RegistrationLayout from '../../components/registration/RegistrationLayout'
import { generatePaymentQR, pollPaymentStatus, clearPaymentSimulation } from '../../services/hdfcVyapar'
import { CheckCircle2, AlertCircle, Clock, Loader } from 'lucide-react'
import { api } from '../../services/api'

export default function Step5Payment() {
  const supportWa = import.meta.env.VITE_SUPPORT_WHATSAPP_NUMBER || '919999999999'
  const { slug } = useParams()
  const navigate = useNavigate()
  const { registration, startPayment, setPaymentStatus } = useRegistration()
  const [qrData, setQrData] = useState(null)
  const [paymentStatus, setPaymentStatusLocal] = useState('waiting')
  const [timeRemaining, setTimeRemaining] = useState(15 * 60)
  const [pollingCount, setPollingCount] = useState(0)
  const pollIntervalRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const [loadingQR, setLoadingQR] = useState(true)
  const [campaign, setCampaign] = useState(null)
  const [campaignError, setCampaignError] = useState('')
  const [bookingBusy, setBookingBusy] = useState(false)
  const [paymentError, setPaymentError] = useState('')

  useEffect(() => { api.getPublicCampaignBySlug(slug).then((res) => setCampaign(res.campaign || null)).catch((err) => setCampaignError(err?.message || 'Failed to load campaign')) }, [slug])
  const teamSize = Number(registration?.contact_info?.participants_count || 1)
  const subtotal = Number(campaign?.price || 0) * Math.max(1, teamSize)
  const gst = Math.round(subtotal * 0.18)
  const total = subtotal + gst
  const paymentPercent = Number(registration?.payment_percent || 100)
  const amount = paymentPercent === 50 ? Math.round(total * 0.5) : total

  const createUserBookingAndRedirect = useCallback(async (fallbackId) => {
    setBookingBusy(true)
    try {
      const payload = {
        campaignSlug: slug,
        participantName: `${registration.personal_info?.first_name || ''} ${registration.personal_info?.last_name || ''}`.trim() || 'Customer',
        email: registration.contact_info?.email || 'temp.user@rugcircle.com',
        mobile: registration.contact_info?.mobile || '9999999999',
        companyName: registration.contact_info?.company || null,
        teamSize: 1,
        selectedDesignName: registration.selected_design_name || null,
        paymentPercent: registration.payment_percent || 50,
      }
      const bookRes = await api.createBooking(payload)
      navigate(`/register/${slug}/success`, {
        state: {
          bookingId: bookRes?.booking?.registrationCode || fallbackId,
          auth: bookRes?.auth || null,
          notify: bookRes?.notify || null,
        },
      })
    } catch (err) {
      setPaymentStatusLocal('failed')
      setPaymentStatus('failed', null)
      setPaymentError(err?.message || 'Failed to create booking')
    } finally {
      setBookingBusy(false)
    }
  }, [navigate, registration, setPaymentStatus, slug])

  const initPayment = useCallback(async () => {
    try {
      if (!amount || amount <= 0) { setLoadingQR(false); return }
      const regCode = await startPayment(slug, amount)
      const qr = await generatePaymentQR(amount, regCode)
      setQrData(qr)
    } finally {
      setLoadingQR(false)
    }
  }, [amount, slug, startPayment])

  useEffect(() => { initPayment() }, [initPayment])
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((p) => {
        if (p <= 1) {
          setPaymentStatusLocal('expired')
          clearInterval(timerIntervalRef.current)
          return 0
        }
        return p - 1
      })
    }, 1000)
    return () => clearInterval(timerIntervalRef.current)
  }, [])

  useEffect(() => {
    if (!qrData || paymentStatus !== 'waiting') return
    const startPolling = async () => {
      try {
        const result = await pollPaymentStatus(qrData.hdfc_reference_id, registration.registration_code)
        setPollingCount((prev) => prev + 1)
        if (result.status === 'paid') {
          setPaymentStatusLocal('paid')
          setPaymentStatus('paid', result.transaction_id)
          clearInterval(pollIntervalRef.current)
          clearPaymentSimulation(registration.registration_code)
          await createUserBookingAndRedirect(result.transaction_id || qrData.hdfc_reference_id)
        } else if (result.status === 'failed') {
          setPaymentStatusLocal('failed')
          clearInterval(pollIntervalRef.current)
        }
      } catch (err) {
        setPaymentStatusLocal('failed')
        setPaymentStatus('failed', null)
        setPaymentError(err?.message || 'Request failed')
        clearInterval(pollIntervalRef.current)
      }
    }
    pollIntervalRef.current = setInterval(startPolling, 5000)
    return () => clearInterval(pollIntervalRef.current)
  }, [createUserBookingAndRedirect, qrData, paymentStatus, registration, slug, navigate, setPaymentStatus])

  const onClickSuccess = async () => {
    setPaymentStatusLocal('paid')
    setPaymentStatus('paid', qrData?.hdfc_reference_id || null)
    clearInterval(pollIntervalRef.current)
    await createUserBookingAndRedirect(qrData?.hdfc_reference_id || null)
  }

  const onClickFail = () => {
    setPaymentStatusLocal('failed')
    setPaymentStatus('failed', null)
    clearInterval(pollIntervalRef.current)
  }

  const handleBack = () => navigate(`/register/${slug}?step=4`)
  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
  const formatCurrency = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)
  if (loadingQR) return <RegistrationLayout currentStep={5} onBack={handleBack} title="Complete Payment"><div className="loading-container"><div className="spinner" /><p>Generating UPI QR Code...</p></div></RegistrationLayout>
  if (campaignError || !amount || !qrData) return <RegistrationLayout currentStep={5} onBack={handleBack} title="Complete Payment"><div className="error-container"><AlertCircle size={48} /><p>{campaignError || 'Failed to generate QR code.'}</p></div></RegistrationLayout>
  if (paymentStatus === 'expired') return <RegistrationLayout currentStep={5} onBack={handleBack} title="Complete Payment"><div className="error-container"><Clock size={48} /><p>This QR code expired. Please go back and generate a new one.</p><button type="button" className="btn-primary" onClick={handleBack}>Go Back</button></div></RegistrationLayout>

  return <RegistrationLayout currentStep={5} onBack={handleBack} title="Complete Payment"><div className="payment-container"><motion.div className="payment-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}><div className="payment-header"><h2>Scan to Pay</h2><p className="amount">{formatCurrency(amount)}</p>{paymentStatus === 'waiting' && <div className="timer"><Clock size={16} /><span>Expires in {formatTime(timeRemaining)}</span></div>}</div>{paymentStatus === 'waiting' && <div className="qr-section"><img src={qrData.qr_code} alt="Payment QR Code" className="qr-code" /><a href={qrData.upi_string} className="upi-link">Pay via Direct UPI Link</a><div className="step5-actions"><button type="button" className="btn-primary" disabled={bookingBusy} onClick={onClickSuccess}>{bookingBusy ? 'Creating User...' : 'Success'}</button><button type="button" onClick={onClickFail} className="step5-ghost-btn">Fail</button></div></div>}{paymentStatus === 'waiting' && <div className="status-section"><div className="polling-status"><Loader size={20} className="spinner-icon" /><p>Waiting for payment confirmation...</p><span className="polling-count">Checking... ({pollingCount})</span></div></div>}{paymentStatus === 'paid' && <motion.div className="status-section success" initial={{ scale: 0.8 }} animate={{ scale: 1 }}><CheckCircle2 size={48} className="success-icon" /><h3>Payment Successful</h3></motion.div>}{paymentStatus === 'failed' && <div className="status-section error"><AlertCircle size={48} className="error-icon" /><h3>Payment Failed</h3><p>{paymentError || 'User not created. Please contact us.'}</p><div className="step5-fail-actions"><a href={`https://wa.me/${supportWa}?text=Need%20help%20for%20failed%20payment`} target="_blank" rel="noreferrer" className="btn-primary" style={{ textAlign: 'center' }}>Contact Us</a><button type="button" onClick={() => navigate('/')} className="step5-ghost-btn">Back to Home</button></div></div>}</motion.div></div></RegistrationLayout>
}
