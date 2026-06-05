import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { CheckCircle2 } from 'lucide-react'
import RegistrationLayout from '../../components/registration/RegistrationLayout'

export default function RegisterSuccess() {
  const { slug } = useParams()
  const { state = {} } = useLocation()
  const navigate = useNavigate()
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <RegistrationLayout currentStep={5} onBack={() => navigate(`/register/${slug}?step=5`)} title="Booking Confirmed">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 16, padding: 24, textAlign: 'left' }}>
        <div style={{ textAlign: 'center' }}><CheckCircle2 size={54} style={{ color: 'var(--color-secondary)' }} /><h2 style={{ margin: '12px 0 6px', fontSize: 20 }}>Payment received</h2></div>
        <p style={{ margin: 0, opacity: 0.8, fontSize: 14 }}>Booking ID: <b>{state.bookingId || state.paymentId || '-'}</b></p>
        {state.auth ? <div style={{ marginTop: 14, background: '#f8f8f8', borderRadius: 10, padding: 12 }}><h3 style={{ marginTop: 0 }}>User Login Details</h3><p style={{ margin: '6px 0' }}>Email: <b>{state.auth.loginEmail}</b></p><p style={{ margin: '6px 0' }}>Mobile: <b>{state.auth.loginMobile}</b></p><p style={{ margin: '6px 0' }}>Security: <b>Use OTP from email, then set your own password in Profile.</b></p></div> : null}
        {state.notify?.whatsappLink ? <div style={{ marginTop: 12, fontSize: 13, opacity: 0.85 }}><p><a href={state.notify.whatsappLink} target="_blank" rel="noreferrer">WhatsApp Message Preview</a></p></div> : null}
        <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
          <button type="button" onClick={() => navigate('/user/login')} className="btn-primary">Go to User Login</button>
          <button type="button" onClick={() => navigate('/user/dashboard')} className="btn-primary">Go to Dashboard</button>
          <button type="button" onClick={() => navigate('/')} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--color-border)', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>Back to Home</button>
        </div>
      </motion.div>
    </RegistrationLayout>
  )
}
