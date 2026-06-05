import { useState, useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'motion/react'
import { FAQS } from '../../constants/faqs'
import SectionHeader from '../common/SectionHeader'

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-20px' })

  return (
    <motion.div
      ref={ref}
      className="faq-item"
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <button className="faq-question" onClick={() => setOpen(!open)}>
        <span>{faq.q}</span>
        <span className={`faq-icon-wrap ${open ? 'open' : ''}`}>+</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="faq-answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <p>{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  return (
    <section className="faq-section" id="faq">
      <div className="faq-inner">
        <SectionHeader
          label="FAQ"
          title="Everything procurement <em>will ask.</em>"
          center
          className="faq-header"
        />
        {FAQS.map((faq, i) => <FAQItem key={i} faq={faq} index={i} />)}
      </div>
    </section>
  )
}
