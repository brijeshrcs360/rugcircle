import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { TRUSTED_BY } from '../../constants/content'

export default function Testimonial() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="testimonial-section">
      <motion.div
        className="testimonial-inner"
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="trusted-by">Trusted by teams at</p>
        <div className="logo-row">
          {TRUSTED_BY.map((c, i) => (
            <motion.div
              key={i}
              className="logo-chip"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 + 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              {c}
            </motion.div>
          ))}
        </div>
        <motion.span
          className="quote-mark"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={inView ? { opacity: 0.3, scale: 1 } : {}}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          "
        </motion.span>
        <motion.p
          className="testimonial-quote"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          We've done escape rooms, painting classes, the lot.{" "}
          <em>The rugs are the first offsite outcome still sitting on people's desks six months later.</em>{" "}
          Worth every rupee.
        </motion.p>
        <motion.div
          className="testimonial-author-wrap"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.55 }}
        >
          <div className="author-avatar">H</div>
          <div className="author-info">
            <div className="author-name">Head of People</div>
            <div className="author-role">38-person team · Ahmedabad</div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
