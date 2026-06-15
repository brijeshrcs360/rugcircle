import { useState, useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { CONTACT_DETAILS } from '../../constants/content'
import SectionHeader from '../common/SectionHeader'
import { api } from '../../services/api'

export default function ContactForm() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [teamSize, setTeamSize] = useState('16 - 25')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', interest: '', dateWindow: '', message: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.createLead({ ...form, teamSize })
      setSubmitted(true)
      setForm({ name: '', company: '', email: '', phone: '', interest: '', dateWindow: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      setError(err?.message || 'Failed to send inquiry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="contact-section" id="inquire">
      <motion.div
        className="contact-inner"
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="contact-info">
          <SectionHeader label="Start here" title="Tell us about your <em>team.</em>" />
          <p>
            Fill the form and we'll come back within one working day with a quote,
            suggested dates, and design ideas. No commitment.
          </p>
          <div className="contact-details">
            {CONTACT_DETAILS.map((d, i) => (
              <motion.div
                key={i}
                className="contact-detail"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.1 + 0.3 }}
              >
                <div className="contact-detail-icon">{d.icon}</div>
                <div>
                  <div className="contact-detail-label">{d.label}</div>
                  <div className="contact-detail-value">{d.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.form
          className="contact-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="form-grid">
            <div className="form-group">
              <label>Your name</label>
              <input type="text" placeholder="Full name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input type="text" placeholder="Company name" value={form.company} onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Work email</label>
              <input type="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} required />
            </div>
            <div className="form-group full">
              <label>Team size</label>
              <div className="team-size-options">
                {['10 - 15', '16 - 25', '26 - 50', '50+'].map((size) => (
                  <motion.button
                    key={size}
                    type="button"
                    className={`team-size-btn ${teamSize === size ? 'active' : ''}`}
                    onClick={() => setTeamSize(size)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="form-group full">
              <label>Interested in</label>
              <select value={form.interest} onChange={(e) => setForm((s) => ({ ...s, interest: e.target.value }))}>
                <option value="" disabled>Select a package</option>
                <option>Team Tuft (at our studio)</option>
                <option>Office Pop-Up (onsite)</option>
                <option>Brand Rug (collaborative)</option>
                <option>Not sure yet</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Ideal date window</label>
              <input type="text" placeholder="e.g., June 2nd week" value={form.dateWindow} onChange={(e) => setForm((s) => ({ ...s, dateWindow: e.target.value }))} />
            </div>
            <div className="form-group full">
              <label>Anything else</label>
              <textarea placeholder="Custom design requests, dietary restrictions, anything..." value={form.message} onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))} />
            </div>
            {error && <div className="form-group full" style={{ color: '#b00020', fontSize: 13, fontWeight: 600 }}>{error}</div>}
            <div className="form-group full">
              <motion.button
                type="submit"
                className={`submit-btn ${submitted ? 'success' : ''}`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {submitted
                  ? <><span>✓</span> Sent! We'll be in touch within 24 hours.</>
                  : loading ? 'Sending...' : <>Send inquiry <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span></>}
              </motion.button>
            </div>
          </div>
        </motion.form>
      </motion.div>
    </section>
  )
}
