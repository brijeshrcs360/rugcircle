import { motion } from 'motion/react'

/**
 * Reusable animated button.
 * variant: 'primary' | 'secondary' | 'outline'
 */
export default function Button({ children, variant = 'primary', onClick, type = 'button', disabled = false, style = {}, className = '' }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: '16px 36px', borderRadius: 100,
    fontSize: 15, fontWeight: 700, cursor: 'pointer', border: 'none',
    fontFamily: 'inherit', transition: 'all 0.3s',
    ...style,
  }

  const variants = {
    primary: {
      background: 'var(--color-primary)', color: 'white',
      boxShadow: '0 6px 24px rgba(225,128,45,0.3)',
    },
    secondary: {
      background: 'white', color: 'var(--color-text)',
      border: '1.5px solid var(--color-border)',
      boxShadow: '0 2px 8px rgba(26,22,22,0.06)',
    },
    outline: {
      background: 'transparent', color: 'var(--color-primary)',
      border: '2px solid var(--color-primary)',
    },
    dark: {
      background: 'var(--color-text)', color: 'white',
      boxShadow: '0 4px 16px rgba(26,22,22,0.25)',
    },
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ ...base, ...variants[variant] }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  )
}
