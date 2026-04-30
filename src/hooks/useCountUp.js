import { useState, useEffect, useRef } from 'react'
import { useInView } from 'motion/react'

/**
 * Animates a number from 0 to `to` when the ref enters the viewport.
 * Usage: const { ref, count } = useCountUp(200)
 */
export function useCountUp(to, duration = 1200) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true

    const steps = 50
    const increment = to / steps
    const interval = duration / steps

    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + increment
        if (next >= to) {
          clearInterval(timer)
          return to
        }
        return Math.floor(next)
      })
    }, interval)

    return () => clearInterval(timer)
  }, [inView, to, duration])

  return { ref, count }
}
