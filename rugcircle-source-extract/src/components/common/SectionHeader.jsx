import { motion, useInView } from 'motion/react'
import { useRef } from 'react'

/**
 * Reusable section header with label, title (supports <em>), and optional subtitle.
 */
export default function SectionHeader({ label, title, subtitle, center = false, light = false, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      style={center ? { textAlign: 'center' } : {}}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {label && (
        <div className="section-label" style={center ? { justifyContent: 'center' } : {}}>
          {label}
        </div>
      )}
      {title && (
        <h2
          className="section-title"
          style={light ? { color: 'white' } : {}}
          dangerouslySetInnerHTML={{ __html: title }}
        />
      )}
      {subtitle && (
        <p
          className="section-subtitle"
          style={{
            ...(center ? { maxWidth: 520, margin: '0 auto' } : {}),
            ...(light ? { color: 'rgba(255,255,255,0.5)' } : {}),
          }}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
