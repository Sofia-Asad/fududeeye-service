import { useEffect, useRef, useState } from 'react'

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Animates a number from 0 to `target` once the element scrolls into view.
 * Respects `prefers-reduced-motion` by rendering the final value immediately.
 */
export function useCountUp(target: number, durationMs = 1400) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0))
  const ref = useRef<HTMLSpanElement>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    const node = ref.current
    if (!node || prefersReducedMotion()) return

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (!entry?.isIntersecting || hasRun.current) return
        hasRun.current = true

        const start = performance.now()
        const step = (now: number) => {
          const progress = Math.min((now - start) / durationMs, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.round(eased * target))
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      },
      { threshold: 0.4 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [target, durationMs])

  return { ref, value }
}
