import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { STATS } from '../../constants/content'
import { useCountUp } from '../../hooks/useCountUp'

function StatItem({ stat, index, parentInView }) {
  const { ref, count } = useCountUp(stat.n)
  return (
    <motion.div
      ref={ref}
      className="stat-item"
      initial={{ opacity: 0, y: 30 }}
      animate={parentInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="stat-num">{count}{stat.s}</div>
      <div className="stat-label">{stat.label}</div>
    </motion.div>
  )
}

export default function StatsBand() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <section className="stats-band">
      <div className="stats-inner" ref={ref}>
        {STATS.map((s, i) => (
          <StatItem key={i} stat={s} index={i} parentInView={inView} />
        ))}
      </div>
    </section>
  )
}
