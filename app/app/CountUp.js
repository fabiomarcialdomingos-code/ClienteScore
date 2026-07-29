'use client'

import { useEffect, useRef, useState } from 'react'

export default function CountUp({ value, duration = 1100 }) {
  const [n, setN] = useState(0)
  const ref = useRef(null)
  const done = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !done.current) {
          done.current = true
          const t0 = performance.now()
          const step = (t) => {
            const k = Math.min((t - t0) / duration, 1)
            const eased = 1 - Math.pow(1 - k, 3)
            setN(Math.round(value * eased))
            if (k < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
          io.disconnect()
        }
      })
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [value, duration])

  return <span ref={ref}>{n}</span>
}