import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import logo from '../../assets/logo.png'
import { NAV_LINKS } from '../../constants/content'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const scrollTo = (id) => (e) => {
    if (isHome) {
      e.preventDefault()
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      setMenuOpen(false)
    }
  }

  const navLinks = NAV_LINKS

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar-inner-wrap">
        <div className="nav-inner">
          <Link to="/">
            <motion.img
              src={logo} alt="Rug Circle" style={{ height: 40 }}
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 400 }}
            />
          </Link>

          <div className="nav-links">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={isHome ? `#${link.id}` : `/#${link.id}`}
                onClick={scrollTo(link.id)}
              >
                {link.label}
              </a>
            ))}
            <motion.a
              href={isHome ? '#inquire' : '/#inquire'}
              onClick={scrollTo('inquire')}
              className="nav-cta"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Request a Quote
            </motion.a>
          </div>

          <motion.button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={menuOpen ? 'x' : 'menu'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {menuOpen ? '✕' : '☰'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu open"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.id}
                href={isHome ? `#${link.id}` : `/#${link.id}`}
                onClick={scrollTo(link.id)}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href={isHome ? '#inquire' : '/#inquire'}
              onClick={scrollTo('inquire')}
              className="btn-hero-primary"
              style={{ textAlign: 'center', justifyContent: 'center' }}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Request a Quote →
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
