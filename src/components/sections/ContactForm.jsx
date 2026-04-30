import { useState, useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { CONTACT_DETAILS } from '../../constants/content'
import SectionHeader from '../common/SectionHeader'

export default function ContactForm() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [teamSize, setTeamSize] = useState('16 – 25')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
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
              <input type="text" placeholder="Full name" required />
            </div>
            <div className="form-group">
              <label>Company</label>
              <input type="text" placeholder="Company name" required />
            </div>
            <div className="form-group">
              <label>Work email</label>
              <input type="email" placeholder="you@company.com" required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" placeholder="+91 XXXXX XXXXX" required />
            </div>
            <div className="form-group full">
              <label>Team size</label>
              <div className="team-size-options">
                {['10 – 15', '16 – 25', '26 – 50', '50+'].map((size) => (
                  <motion.button
                    key={size} type="button"
                    className={`team-size-btn ${teamSize === size ? 'active' : ''}`}
                    onClick={() => setTeamSize(size)}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="form-group full">
              <label>Interested in</label>
              <select defaultValue="">
                <option value="" disabled>Select a package</option>
                <option>Team Tuft (at our studio)</option>
                <option>Office Pop-Up (onsite)</option>
                <option>Brand Rug (collaborative)</option>
                <option>Not sure yet</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Ideal date window</label>
              <input type="text" placeholder="e.g., June 2nd week" />
            </div>
            <div className="form-group full">
              <label>Anything else</label>
              <textarea placeholder="Custom design requests, dietary restrictions, anything..." />
            </div>
            <div className="form-group full">
              <motion.button
                type="submit"
                className={`submit-btn ${submitted ? 'success' : ''}`}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              >
                {submitted
                  ? <><span>✓</span> Sent! We'll be in touch within 24 hours.</>
                  : <>Send inquiry <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span></>}
              </motion.button>
            </div>
          </div>
        </motion.form>
      </motion.div>
    </section>
  )
}
