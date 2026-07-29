'use client'

import { useState, useEffect, useRef } from 'react'
import { Caveat } from 'next/font/google'
import styles from './landing.module.css'

const handwriting = Caveat({ weight: '600', subsets: ['latin'] })

const STAR = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
const GOOD = [
  { t: 'Corte impecável e atendimento nota 10! Virei cliente fiel.', by: 'Rafael, cliente há 2 anos' },
  { t: 'Melhor experiência que já tive. Ambiente top, super recomendo!', by: 'Mariana, cliente nova' },
  { t: 'Profissionais incríveis e resultado perfeito. Voltarei sempre!', by: 'Pedro, cliente há 1 ano' },
]
const BAD = [
  { t: 'A espera foi longa hoje, quase 40 minutos…', by: 'Carla, cliente' },
  { t: 'O serviço foi bom, mas o preço subiu bastante.', by: 'Diego, cliente' },
]
const SEQ = [5, 5, 2, 5, 4]

function makeCap(by) {
  return 'Mais um cliente satisfeito! 💈 Obrigado, ' + by.split(',')[0] + ', pela confiança no nosso trabalho. Vem você também! ✂️ #clientescore'
}

export default function LandingDemo() {
  const [filled, setFilled] = useState(0)
  const [stage, setStage] = useState('hint') // hint | raw | post | wa
  const [rawText, setRawText] = useState('')
  const [item, setItem] = useState(null)
  const confettiRef = useRef(null)
  const timers = useRef([])
  const autoRef = useRef(null)
  const userTook = useRef(false)
  const seqIdx = useRef(0)
  const gi = useRef(0)
  const bi = useRef(0)

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.current.push(id); return id }

  const type = (text, done) => {
    let i = 0; setRawText('')
    const id = setInterval(() => { setRawText(text.slice(0, ++i)); if (i >= text.length) { clearInterval(id); done && done() } }, 26)
    timers.current.push(id)
  }

  const runDemo = (r) => {
    clearTimers()
    setFilled(r); setStage('raw'); setItem(null)
    const isGood = r >= 4
    const it = isGood ? GOOD[gi.current++ % GOOD.length] : BAD[bi.current++ % BAD.length]
    setItem(it)
    later(() => {
      type('"' + it.t + '"', () => {
        later(() => { setStage(isGood ? 'post' : 'wa') }, 900)
      })
    }, 380)
  }

  const pickStar = (i) => { userTook.current = true; if (autoRef.current) clearInterval(autoRef.current); runDemo(i + 1) }
  const reset = () => runDemo(5)

  const fireConfetti = () => {
    const c = confettiRef.current; if (!c) return
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const cols = ['#F5B841', '#FFCE63', '#3ECF8E', '#EDE9DD', '#FFF3D6']
    for (let i = 0; i < 55; i++) {
      const p = document.createElement('i'); const s = 6 + Math.random() * 7
      p.style.cssText = 'left:' + (Math.random() * 100) + '%;background:' + cols[(Math.random() * cols.length) | 0] + ';width:' + s + 'px;height:' + (s * (Math.random() > .5 ? 1 : .5)) + 'px;animation-duration:' + (2.2 + Math.random() * 1.6) + 's;animation-delay:' + (Math.random() * .5) + 's;--dx:' + ((Math.random() - .5) * 160) + 'px;--rot:' + (Math.random() * 720 - 360) + 'deg;'
      c.appendChild(p); setTimeout(() => p.remove(), 4400)
    }
  }

  const copyCap = async (e) => {
    const txt = item ? makeCap(item.by) : ''
    try { await navigator.clipboard.writeText(txt) } catch (err) { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove() }
    const b = e.currentTarget; b.textContent = '✓ Copiado!'; b.classList.add(styles.done); setTimeout(() => { b.textContent = 'Copiar legenda'; b.classList.remove(styles.done) }, 1600)
  }
  const fakePost = (e) => { const b = e.currentTarget; b.textContent = '✓ Pronto!'; fireConfetti(); setTimeout(() => { b.textContent = '🚀 Postar' }, 1500) }

  // auto-play enquanto o visitante não interage
  useEffect(() => {
    const start = setTimeout(() => { if (!userTook.current) runDemo(5) }, 1100)
    timers.current.push(start)
    autoRef.current = setInterval(() => { if (!userTook.current) runDemo(SEQ[seqIdx.current++ % SEQ.length]) }, 8500)
    return () => { clearTimers(); if (autoRef.current) clearInterval(autoRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // observa os reveals + dispara os count-ups + o anel de score (sem depender de hash de CSS)
  useEffect(() => {
    const countUp = (el, target) => {
      const t0 = performance.now(), dur = 1100
      const step = (t) => { const k = Math.min((t - t0) / dur, 1); const e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(target * e); if (k < 1) requestAnimationFrame(step) }
      requestAnimationFrame(step)
    }
    const ioRev = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-revealed', ''); ioRev.unobserve(e.target) } }), { threshold: 0.14 })
    const ioNum = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { countUp(e.target, +e.target.getAttribute('data-countup')); ioNum.unobserve(e.target) } }), { threshold: 0.4 })
    const ioRing = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-on', ''); ioRing.unobserve(e.target) } }), { threshold: 0.4 })
    document.querySelectorAll('[data-reveal]').forEach((el) => ioRev.observe(el))
    document.querySelectorAll('[data-countup]').forEach((el) => ioNum.observe(el))
    document.querySelectorAll('[data-ring]').forEach((el) => ioRing.observe(el))
    return () => { ioRev.disconnect(); ioNum.disconnect(); ioRing.disconnect() }
  }, [])

  return (
    <div className={styles.demoCard}>
      <div className={styles.demoHead}><span className={styles.liveDot} /> Teste você mesmo — toque numa nota</div>
      <div className={styles.dstars} role="group" aria-label="Escolha uma nota de 1 a 5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} className={styles.dstar + (n <= filled ? ' ' + styles.filled : '')} onClick={() => pickStar(n - 1)} aria-label={n + ' estrela(s)'}>
            <svg viewBox="0 0 24 24" className={n === filled ? styles.pop : ''}><path d={STAR} /></svg>
          </button>
        ))}
      </div>

      <div className={styles.stageBody}>
        <div className={styles.stageHint + (stage === 'hint' ? ' ' + styles.show : '')}><span className={styles.big}>👆</span>toque numa estrela pra ver o que acontece</div>

        <div className={styles.rawNote + (stage === 'raw' ? ' ' + styles.show : '')}>
          <div className={styles.rnLabel}>✍️ elogio do cliente</div>
          <p className={`${styles.rnText} ${handwriting.className}`}>{rawText}<span className={styles.caret} /></p>
          <div className={styles.rnBy}>{item ? '— ' + item.by : ''}</div>
        </div>

        <div className={(stage === 'post' ? styles.show : '')}>
          <div className={styles.dpLabel}>✨ virou um post pronto</div>
          <div className={styles.dpArt}>
            <div className={styles.dpBrand}>Barbearia Fígaro</div>
            <div className={styles.dpHandle}>@barbeariafigaro</div>
            <div className={styles.dpStars}>{item ? '★'.repeat(Math.max(filled, 1)) + '' : ''}<span className={styles.dim}>{item ? '★'.repeat(5 - Math.max(filled, 1)) : ''}</span></div>
            <div className={styles.dpQuote}>{item ? '“' + item.t + '”' : ''}</div>
            <div className={styles.dpName}>{item ? '— ' + item.by.split(',')[0] : ''}</div>
          </div>
          <div className={styles.dpCaption}><b>legenda gerada</b>{item ? makeCap(item.by) : ''}</div>
          <div className={styles.dpActions}>
            <button className={styles.dpCopy} onClick={copyCap}>Copiar legenda</button>
            <button className={styles.dpPost} onClick={fakePost}>🚀 Postar</button>
          </div>
        </div>

        <div className={(stage === 'wa' ? styles.show : '')}>
          <div className={styles.dwLabel}>🔒 feedback privado</div>
          <div className={styles.waBubble}>
            <p>{item ? '“' + item.t + '”' : ''}</p>
            <div className={styles.waMeta}>Enviado direto pro WhatsApp do gerente ✓✓</div>
          </div>
          <div className={styles.dwNote}>Nada vai para o Google ou redes. Reputação protegida. 🛡️</div>
        </div>
      </div>

      <button className={styles.demoReset} onClick={reset}>↺ testar de novo</button>
      <p className={styles.demoFine}>demonstração · no seu negócio roda com a sua marca</p>
      <div className={styles.confetti} ref={confettiRef} />
    </div>
  )
}