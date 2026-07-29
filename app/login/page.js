import AuthForm from './AuthForm'
import styles from './auth.module.css'

export const metadata = { title: 'Entrar · ClienteScore' }

// estrelas decorativas geradas uma vez (sem JS no cliente)
const STARS = Array.from({ length: 54 }, (_, i) => {
  const isStar = Math.random() < 0.16
  const size = isStar ? 8 + Math.random() * 9 : 1 + Math.random() * 2
  return {
    i,
    isStar,
    size,
    left: Math.random() * 100,
    top: Math.random() * 100,
    dur: 2 + Math.random() * 4,
    delay: Math.random() * 4,
    o: 0.35 + Math.random() * 0.6,
  }
})

export default function LoginPage() {
  return (
    <div className={styles.root}>
      <div className={styles.stars} aria-hidden="true">
        {STARS.map((s) =>
          s.isStar ? (
            <i key={s.i} className={styles.c} style={{ left: `${s.left}%`, top: `${s.top}%`, fontSize: `${s.size}px`, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s`, ['--o']: s.o }}>★</i>
          ) : (
            <i key={s.i} style={{ left: `${s.left}%`, top: `${s.top}%`, width: `${s.size}px`, height: `${s.size}px`, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s`, ['--o']: s.o }} />
          )
        )}
      </div>
      <div className={styles.glow} aria-hidden="true" />
      <AuthForm />
    </div>
  )
}