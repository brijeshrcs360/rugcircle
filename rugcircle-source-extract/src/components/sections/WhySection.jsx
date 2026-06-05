import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { WHY_CARDS } from '../../constants/content'
import { useTilt } from '../../hooks/useTilt'
import SectionHeader from '../common/SectionHeader'

function TiltCard({ card, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt(8)

  return (
    <motion.div
      ref={ref}
      className="why-card"
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', background: card.bg }}
      initial={{ opacity: 0, y: 60, rotateX: 15 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className="why-card-gradient" style={{ background: card.gradient }} />
      <div className="why-card-icon" style={{ background: card.iconBg }}>
        <span>{card.emoji}</span>
      </div>
      <div className="why-card-num">{card.num}</div>
      <h3>{card.title}</h3>
      <p>{card.desc}</p>
    </motion.div>
  )
}

export default function WhySection() {
  return (
    <section className="why-section" id="why">
      <div className="why-inner">
        <SectionHeader
          label="Why rug tufting"
          title="Most team activities end the moment<br />everyone goes <em>home.</em>"
          subtitle="Escape rooms, bowling, paint-and-sip — all fine, all forgotten by Monday. A tufted rug sits on a desk or wall for years."
          className="why-header"
        />
        <div className="why-grid">
          {WHY_CARDS.map((card, i) => <TiltCard key={i} card={card} index={i} />)}
        </div>
      </div>
    </section>
  )
}
