import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { HOW_STEPS } from '../../constants/steps'
import SectionHeader from '../common/SectionHeader'

// Extracted into its own component so hooks are called at the top level
function StepCard({ step, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      className="step-card"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="step-circle"
        whileHover={{ scale: 1.12, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <span className="step-icon">{step.icon}</span>
      </motion.div>
      <div className="step-num-text" style={{ marginBottom: 8 }}>{step.num}</div>
      <h4>{step.title}</h4>
      <p>{step.desc}</p>
    </motion.div>
  )
}

export default function HowItWorks() {
  return (
    <section className="how-section" id="how">
      <div className="how-bg-grid" />
      <div className="how-inner">
        <SectionHeader
          label="How it works"
          title="From first email to <em>finished rug</em> — four steps."
          subtitle="Most teams go from inquiry to event in about two weeks. Rush dates possible if the calendar allows."
          center
          light
          className="how-header"
        />
        <div className="steps-row">
          {HOW_STEPS.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
