import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { CheckCircle2 } from 'lucide-react'
import RegistrationLayout from '../../components/registration/RegistrationLayout'

export default function RegisterSuccess() {
  const { slug } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const state = location.state || {}
  const bookingId = state.bookingId || state.paymentId || null

  return (
    <RegistrationLayout currentStep={5} onBack={() => navigate(`/register/${slug}?step=5`)} title="Booking Confirmed">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          background: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <CheckCircle2 size={54} style={{ color: 'var(--color-secondary)' }} />
        <h2 style={{ margin: '12px 0 6px', fontSize: 20 }}>Payment received</h2>
        <p style={{ margin: 0, opacity: 0.7, fontSize: 14 }}>
          We saved your workshop slot. You will get confirmation on WhatsApp/email.
        </p>

        {bookingId && (
          <div style={{ marginTop: 14, fontSize: 13, opacity: 0.8 }}>
            Booking ID: <span style={{ fontWeight: 700 }}>{bookingId}</span>
          </div>
        )}

        <div style={{ marginTop: 18, display: 'grid', gap: 10 }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid var(--color-border)',
              background: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Back to Home
          </button>
        </div>
      </motion.div>
    </RegistrationLayout>
  )
}

