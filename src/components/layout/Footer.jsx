import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import logo from '../../assets/logo.png'

export default function Footer() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <footer className="footer" ref={ref}>
      <div className="footer-inner">
        <motion.div
          className="footer-top"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="footer-brand">
            <img src={logo} alt="Rug Circle" />
            <p>Where every thread is yours.<br />Handmade in Ahmedabad.</p>
            <div className="footer-socials">
              <a className="social-btn" href="https://www.instagram.com/rugcircle" target="_blank" rel="noopener">📸</a>
              <a className="social-btn" href="tel:+917600200530">📞</a>
              <a className="social-btn" href="mailto:support@rugcircle.com">✉️</a>
            </div>
          </div>
          <div className="footer-col">
            <h5>Studio</h5>
            <a href="https://rugcircle.com/">Home</a>
            <a href="https://rugcircle.com/workshop/">Workshops</a>
            <a href="https://rugcircle.com/custom-rugs/">Custom Rugs</a>
            <a href="https://rugcircle.com/about-us/">About</a>
          </div>
          <div className="footer-col">
            <h5>Teams</h5>
            <a href="#packages">Packages</a>
            <a href="#how">How It Works</a>
            <a href="#faq">FAQ</a>
            <a href="#inquire">Request a Quote</a>
          </div>
          <div className="footer-col">
            <h5>Reach Us</h5>
            <a href="tel:+917600200530">+91 76002 00530</a>
            <a href="mailto:support@rugcircle.com">support@rugcircle.com</a>
            <a href="https://www.instagram.com/rugcircle" target="_blank" rel="noopener">@rugcircle</a>
          </div>
        </motion.div>

        <div className="footer-bottom">
          <p>© 2026 Rug Circle. All rights reserved.</p>
          <p>Made by hand in Ahmedabad 🧶</p>
        </div>
      </div>
    </footer>
  )
}
