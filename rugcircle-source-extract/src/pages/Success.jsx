import { useLocation, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useEffect } from 'react'
import { formatCurrency } from '../utils/format'

export default function Success() {
  const { state } = useLocation()

  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="success-page">
      <motion.div
        className="success-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <motion.div
          className="success-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          ✓
        </motion.div>
        <h1>Booking Confirmed!</h1>
        <p>
          Thank you for choosing Rug Circle. Your {state?.package || 'experience'} is booked.
          {state?.paymentId && (
            <>
              <br /><br />
              <span style={{ fontSize: 13, color: '#888' }}>
                Payment ID: {state.paymentId}
              </span>
            </>
          )}
        </p>
        {state?.amount && (
          <div style={{
            padding: 20, background: 'var(--color-bg)', borderRadius: 12,
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 13, color: '#888' }}>Advance paid</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-primary)' }}>
              {formatCurrency(state.amount)}
            </div>
            {state.people > 1 && (
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
                for {state.people} people
              </div>
            )}
          </div>
        )}
        <p style={{ fontSize: 14, color: '#888' }}>
          We'll reach out within 24 hours with your stencil designs and event details.
          Check your email for the GST invoice.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
          <Link to="/" className="btn-primary">
            Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
