import { useMotionValue, useSpring, useTransform } from 'motion/react'

/**
 * Returns motion values for a 3D tilt effect based on mouse position.
 * Usage: const { rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt()
 */
export function useTilt(strength = 6) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const springX = useSpring(mx, { stiffness: 120, damping: 18 })
  const springY = useSpring(my, { stiffness: 120, damping: 18 })
  const rotateX = useTransform(springY, [-0.5, 0.5], [strength, -strength])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-strength, strength])

  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const onMouseLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return { rotateX, rotateY, onMouseMove, onMouseLeave }
}
