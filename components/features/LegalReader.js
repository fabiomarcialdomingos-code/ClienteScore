'use client'

import { useEffect, useRef, useState } from 'react'
import styles from '../../styles/legal.module.css'

export default function LegalReader() {
  const barRef = useRef(null)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      const p = max > 0 ? (h.scrollTop / max) * 100 : 0
      if (barRef.current) barRef.current.style.width = p + '%'
      setShowTop(h.scrollTop > 420)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const ioRev = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.setAttribute('data-revealed', ''); ioRev.unobserve(e.target) }
    }), { threshold: 0.12 })
    document.querySelectorAll('[data-reveal]').forEach((el) => ioRev.observe(el))

    const links = Array.from(document.querySelectorAll('[data-toc]'))
    const ioAct = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) {
        const id = e.target.id
        links.forEach((l) => l.classList.toggle(styles.on, l.getAttribute('data-toc') === id))
      }
    }), { rootMargin: '-45% 0px -50% 0px', threshold: 0 })
    document.querySelectorAll('section[data-sec]').forEach((el) => ioAct.observe(el))

    return () => { window.removeEventListener('scroll', onScroll); ioRev.disconnect(); ioAct.disconnect() }
  }, [])

  return (
    <>
      <div className={styles.progress}><i ref={barRef} /></div>
      <button
        className={styles.toTop + (showTop ? ' ' + styles.show : '')}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Voltar ao topo"
      >↑</button>
    </>
  )
}