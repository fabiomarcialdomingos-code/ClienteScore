'use client'
// Controles da esteira como CLIENT component — único motivo: dar feedback
// visual IMEDIATO no clique (useFormStatus fica pending no instante do submit,
// antes do round-trip da server action voltar). Sem isso, os chips de delay e o
// toggle de pausa pareciam "travados" por 1–2s (a Vercel re-renderiza a rota
// force-dynamic inteira). As actions (setDelay/togglePause) seguem intactas;
// aqui só vestimos o estado de "salvando" por cima dos forms progressivos.
import { useFormStatus } from 'react-dom'
import { setDelay, togglePause } from './belt-actions'
import styles from './app.module.css'

const DELAYS = [15, 30, 60, 120]

// transição suave compartilhada — o botão "respira" no clique, não some seco
const FADE = { transition: 'opacity .15s ease, transform .12s ease, filter .15s ease' }

function label(m) {
  return m < 60 ? m + ' min' : m / 60 + ' h'
}

function DelayChip({ m, current }) {
  const { pending } = useFormStatus()
  const on = m === current
  return (
    <button
      type="submit"
      name="minutes"
      value={m}
      disabled={pending}
      aria-pressed={on}
      className={styles.dchip + (on ? ' ' + styles.dchipOn : '')}
      style={{
        ...FADE,
        opacity: pending ? 0.5 : 1,
        cursor: pending ? 'progress' : 'pointer',
        transform: pending && on ? 'scale(.97)' : 'none',
      }}
    >
      {pending && on ? '…' : label(m)}
    </button>
  )
}

function PauseButton({ paused }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      name="paused"
      value={paused ? 'false' : 'true'}
      disabled={pending}
      className={styles.pauseToggle + (paused ? ' ' + styles.pauseOn : '')}
      style={{
        ...FADE,
        opacity: pending ? 0.6 : 1,
        cursor: pending ? 'progress' : 'pointer',
      }}
    >
      <span className={styles.pauseDot} /> {pending ? 'Salvando…' : (paused ? 'Pausado hoje ⏸' : 'Automação ligada ⚡')}
    </button>
  )
}

export default function BeltControls({ tenantId, delay, paused }) {
  return (
    <div className={styles.beltControls}>
      <form action={setDelay} className={styles.delayForm}>
        <input type="hidden" name="tenantId" value={tenantId} />
        <span className={styles.ctrlLabel}>Mandar convite após o atendimento:</span>
        <div className={styles.delayChips}>
          {DELAYS.map((m) => (
            <DelayChip key={m} m={m} current={delay} />
          ))}
        </div>
      </form>
      <form action={togglePause} className={styles.pauseForm}>
        <input type="hidden" name="tenantId" value={tenantId} />
        <PauseButton paused={paused} />
      </form>
    </div>
  )
}