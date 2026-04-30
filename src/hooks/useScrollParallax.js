import { useRef } from 'react'
import { useScroll, useTransform, useSpring } from 'motion/react'

/**
 * Returns parallax y/opacity/scale values driven by scroll position of a ref.
 * Usage: const { ref, y, opacity, scale } = useScrollParallax()
 */
export function useScrollParallax(yRange = [0, 100], opacityRange = [1, 0]) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  const rawY = useTransform(scrollYProgress, [0, 1], yRange)
  const opacity = useTransform(scrollYProgress, [0, 0.6], opacityRange)
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94])
  const y = useSpring(rawY, { stiffness: 60, damping: 20 })

  return { ref, y, opacity, scale }
}
