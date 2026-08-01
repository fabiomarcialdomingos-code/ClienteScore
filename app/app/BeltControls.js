'use client'
// Controles da esteira com OPTIMISTIC UPDATE (P0 de UX, 01/ago/2026).
//
// Por que não useFormStatus / form progressivo (a versão anterior):
//   o form progressivo só dá o estado "pending" DURANTE o round-trip; quando a
//   action termina, o revalidatePath('/app') faz o Next re-renderizar a rota
//   force-dynamic INTEIRA e a tela "pisca" por 1–2s = a câmera-lenta que o dono
//   sente. O useFormStatus não evita esse pisca; só mascara o começo dele.
//
// O que este arquivo faz diferente:
//   - o chip / o toggle mudam NA HORA no navegador (setState imediato = optimistic);
//   - a server action é chamada COMO FUNÇÃO (FormData montada à mão, mesmos nomes
//     de campo que o belt-actions.js lê: tenantId/minutes e tenantId/paused);
//   - router.refresh() sincroniza o resto da página (ServiceBelt/contadores) DEPOIS,
//     mas como o controle já está no estado certo, o refresh não pisca nada aqui
//     (useState não reseta com props novas, e o client component não desmonta no refresh);
//   - se a action falhar, faz ROLLBACK do estado local + mostra a linha de erro.
//
// Regra pra quem vier depois: o useState(delay)/useState(paused) NÃO é "estado
// duplicado bugado" — é a fonte da verdade visual que torna o clique instantâneo.
// NÃO "conserte" trocando por props diretos, senão a câmera-lenta volta.
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setDelay as setDelayAction, togglePause as togglePauseAction } from './belt-actions'
import styles from './app.module.css'

const DELAYS = [15, 30, 60, 120]

function label(m) {
  return m < 60 ? m + ' min' : m / 60 + ' h'
}

export default function BeltControls({ tenantId, delay: initialDelay, paused: initialPaused }) {
  const router = useRouter()
  const [delay, setDelay] = useState(initialDelay)     // optimistic: fonte da verdade visual
  const [paused, setPaused] = useState(initialPaused)  // idem
  const [pending, start] = useTransition()             // só pra travar duplo-clique + cursor
  const [err, setErr] = useState('')

  const pickDelay = (m) => {
    if (m === delay) return
    setErr('')
    const prev = delay
    setDelay(m) // acende NA HORA
    start(async () => {
      const fd = new FormData()
      fd.set('tenantId', tenantId)
      fd.set('minutes', String(m))
      try {
        await setDelayAction(fd)
        router.refresh() // sincroniza ServiceBelt/contadores sem piscar o controle
      } catch (e) {
        setDelay(prev) // rollback
        setErr('Não salvei o tempo. Tenta de novo.')
      }
    })
  }

  const toggle = () => {
    setErr('')
    const prev = paused
    const next = !paused
    setPaused(next) // troca NA HORA
    start(async () => {
      const fd = new FormData()
      fd.set('tenantId', tenantId)
      fd.set('paused', String(next))
      try {
        await togglePauseAction(fd)
        router.refresh()
      } catch (e) {
        setPaused(prev) // rollback
        setErr('Não salvei a pausa. Tenta de novo.')
      }
    })
  }

  // cursor de "salvando" SEM opacidade: o controle já está no estado certo, então
  // não parece travado — só não deixa clicar de novo antes do servidor confirmar.
  const busyCursor = pending ? 'progress' : 'pointer'

  return (
    <div className={styles.beltControls}>
      <div className={styles.delayForm}>
        <span className={styles.ctrlLabel}>Mandar convite após o atendimento:</span>
        <div className={styles.delayChips}>
          {DELAYS.map((m) => {
            const on = m === delay
            return (
              <button
                key={m}
                type="button"
                aria-pressed={on}
                disabled={pending}
                onClick={() => pickDelay(m)}
                className={styles.dchip + (on ? ' ' + styles.dchipOn : '')}
                style={{ cursor: busyCursor }}
              >
                {label(m)}
              </button>
            )
          })}
        </div>
      </div>
      <div className={styles.pauseForm}>
        <button
          type="button"
          disabled={pending}
          onClick={toggle}
          className={styles.pauseToggle + (paused ? ' ' + styles.pauseOn : '')}
          style={{ cursor: busyCursor }}
        >
          <span className={styles.pauseDot} /> {paused ? 'Pausado hoje ⏸' : 'Automação ligada ⚡'}
        </button>
      </div>
      {err ? <p style={{ color: '#ff8a8a', fontSize: 13, margin: '6px 2px 0' }}>⚠️ {err}</p> : null}
    </div>
  )
}