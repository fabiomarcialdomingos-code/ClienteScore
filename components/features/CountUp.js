'use client'
import { useEffect, useState } from 'react'

// Contador animado no MOUNT (não via IntersectionObserver).
//
// Por que troquei o observer pelo mount (01/ago/2026, P3 de UX):
//   no /app os 3 cards do placar nascem ACIMA da dobra, então "animar quando
//   visível" e "animar no mount" dão no mesmo resultado — mas o observer, em
//   alguns loads, não entregava a contagem visível (relato real: o número já
//   aparecia no valor final, sem subir de 0). Animar no mount é estritamente
//   mais confiável para este uso: resolve o caso quebrado e não piora o que
//   já funcionava. Mantém o mesmo easing cúbico e a mesma duração de antes.
//
// Regra pra quem vier depois: NÃO "conserte" isto voltando pro observer
// achando que é bug. O observer só faria sentido se este componente fosse
// usado ABAIXO da dobra — e hoje não é (só os 3 cards do topo do /app).
// Se um dia for, aí sim volte o observer; até lá, mount vence.
//
// Acessibilidade: respeita prefers-reduced-motion — se o SO pedir menos
//   movimento, mostra o valor direto, sem animar (o observer antigo não fazia isso).
export default function CountUp({ value, duration = 1100 }) {
  const [n, setN] = useState(0)

  useEffect(() => {
    const v = Number(value) || 0

    // sem animação pra quem pediu menos movimento no SO
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setN(v)
      return
    }

    let raf = 0
    const t0 = performance.now()
    const step = (t) => {
      const k = Math.min((t - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - k, 3) // easeOutCubic — sobe rápido, freia no fim
      setN(Math.round(v * eased))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf) // cleanup: não deixa frame pendurado
  }, [value, duration])

  return <span>{n}</span>
}