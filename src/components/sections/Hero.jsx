import { motion, useScroll, useTransform, useSpring } from 'motion/react'
import { useRef, useEffect, useState } from 'react'
import { HERO_IMAGES } from '../../constants/content'

const IMGS = HERO_IMAGES

const floatItems = [
  { emoji: '🧶', top: '20%', left: '7%', size: 68, delay: 0, dur: 4.2 },
  { emoji: '✂️', top: '68%', left: '4%', size: 52, delay: 0.5, dur: 3.8 },
  { emoji: '🎨', top: '22%', right: '5%', size: 62, delay: 1, dur: 4.5 },
  { emoji: '🪡', top: '70%', right: '6%', size: 50, delay: 0.3, dur: 3.5 },
  { emoji: '🏠', top: '48%', left: '2%', size: 46, delay: 0.8, dur: 5 },
  { emoji: '⭐', top: '14%', right: '20%', size: 40, delay: 1.2, dur: 3.2 },
]

function FloatShape({ item }) {
  return (
    <motion.div
      className="float-shape"
      style={{
        top: item.top, left: item.left, right: item.right,
        width: item.size, height: item.size,
        background: 'rgba(255,255,255,0.92)',
        boxShadow: '0 8px 32px rgba(26,22,22,0.08), 0 2px 8px rgba(225,128,45,0.08)',
        border: '1px solid rgba(225,128,45,0.1)',
      }}
      initial={{ opacity: 0, scale: 0, rotate: -20 }}
      animate={{
        opacity: 1, scale: 1, rotate: 0,
        y: [0, -18, 0],
      }}
      transition={{
        opacity: { delay: item.delay + 0.9, duration: 0.5 },
        scale: { delay: item.delay + 0.9, duration: 0.5, type: 'spring', stiffness: 200 },
        rotate: { delay: item.delay + 0.9, duration: 0.5 },
        y: { delay: item.delay + 1.4, duration: item.dur, repeat: Infinity, ease: 'easeInOut' },
      }}
    >
      {item.emoji}
    </motion.div>
  )
}

function CountUp({ to, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        let n = 0; const step = to / 50
        const t = setInterval(() => {
          n += step
          if (n >= to) { setCount(to); clearInterval(t) }
          else setCount(Math.floor(n))
        }, 20)
      }
    })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to])

  return <span ref={ref}>{count}{suffix}</span>
}

// Floating image card (3D perspective)
function FloatingImageCard({ src, style, delay, rotate = 0, className = '' }) {
  return (
    <motion.div
      className={className}
      style={{
        position: 'absolute',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(26,22,22,0.18), 0 4px 16px rgba(26,22,22,0.08)',
        border: '3px solid rgba(255,255,255,0.9)',
        ...style,
      }}
      initial={{ opacity: 0, scale: 0.7, rotate: rotate - 10 }}
      animate={{
        opacity: 1, scale: 1, rotate: rotate,
        y: [0, -10, 0],
      }}
      transition={{
        opacity: { delay: delay + 0.8, duration: 0.6 },
        scale: { delay: delay + 0.8, duration: 0.6, type: 'spring', stiffness: 150 },
        rotate: { delay: delay + 0.8, duration: 0.6 },
        y: { delay: delay + 1.5, duration: 5, repeat: Infinity, ease: 'easeInOut' },
      }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
    >
      <img
        src={src} alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={(e) => { e.target.src = `https://picsum.photos/seed/${Math.floor(Math.random()*50)+1}/400/300` }}
      />
    </motion.div>
  )
}

const words = ['rug,', 'memory.', 'keepsake.', 'story.']

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94])
  const springY = useSpring(y, { stiffness: 60, damping: 20 })

  const [wordIndex, setWordIndex] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setWordIndex(i => (i + 1) % words.length), 2800)
    return () => clearInterval(t)
  }, [])

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  }
  const item = {
    hidden: { opacity: 0, y: 44, rotateX: 18 },
    show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
  }

  return (
    <section className="hero" ref={ref} style={{ minHeight: '100vh', perspective: 1200 }}>
      <div className="hero-grid-bg" />
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />

      {/* Floating image cards — left side */}
      <FloatingImageCard
        src={IMGS.yarn1}
        className="hero-floating-card"
        style={{ width: 200, height: 220, top: '18%', left: '3%', zIndex: 0 }}
        delay={0.2} rotate={-6}
      />
      <FloatingImageCard
        src={IMGS.craft}
        className="hero-floating-card"
        style={{ width: 150, height: 160, top: '58%', left: '6%', zIndex: 0 }}
        delay={0.5} rotate={5}
      />
      {/* Floating image cards — right side */}
      <FloatingImageCard
        src={IMGS.textile}
        className="hero-floating-card"
        style={{ width: 190, height: 200, top: '16%', right: '3%', zIndex: 0 }}
        delay={0.35} rotate={7}
      />
      <FloatingImageCard
        src={IMGS.weave}
        className="hero-floating-card"
        style={{ width: 160, height: 180, top: '60%', right: '5%', zIndex: 0 }}
        delay={0.6} rotate={-4}
      />
      {/* Bottom floating card */}
      <FloatingImageCard
        src={IMGS.yarn2}
        className="hero-floating-card"
        style={{ width: 130, height: 130, bottom: '14%', left: '16%', zIndex: 0 }}
        delay={0.8} rotate={10}
      />

      {/* Small emoji floats */}
      <div className="hero-floats">
        {floatItems.map((fi, i) => <FloatShape key={i} item={fi} />)}
      </div>

      <motion.div
        className="hero-inner"
        style={{ y: springY, opacity, scale, position: 'relative', zIndex: 2 }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div className="hero-badge" variants={item}>
          <span className="dot" />
          Now booking corporate dates · Apr — Jul 2026
        </motion.div>

        <motion.h1 className="hero-title" variants={item} style={{ perspective: 1000 }}>
          Your team leaves with a{' '}
          <br />
          <em style={{ display: 'inline-block', position: 'relative' }}>
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 30, rotateX: -30 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -20, rotateX: 20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'inline-block' }}
            >
              {words[wordIndex]}
            </motion.span>
          </em>
        </motion.h1>

        <motion.p className="hero-sub" variants={item}>
          A hands-on rug tufting experience for corporate teams.{' '}
          <strong>No trust falls. No forced fun.</strong>{' '}
          Just yarn, colour, and a craft that surprises everyone.
        </motion.p>

        <motion.p className="hero-tagline" variants={item}>
          At our Ahmedabad studio or your office
        </motion.p>

        <motion.div className="hero-buttons" variants={item}>
          <motion.a
            href="#inquire"
            className="btn-hero-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Plan your team event
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >→</motion.span>
          </motion.a>
          <motion.a
            href="#packages"
            className="btn-hero-secondary"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            See packages & pricing
          </motion.a>
        </motion.div>

        {/* Mini stats */}
        <motion.div
          variants={item}
          className="hero-mini-stats"
        >
          {[
            { n: 200, s: '+', label: 'events done' },
            { n: 3, s: ' hrs', label: 'per session' },
            { n: 60, s: '+', label: 'yarn shades' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div className="hero-mini-stat-value">
                <CountUp to={s.n} suffix={s.s} />
              </div>
              <div className="hero-mini-stat-label">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="hero-scroll-hint"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <span>scroll</span>
        <div className="scroll-line" />
      </motion.div>
    </section>
  )
}
