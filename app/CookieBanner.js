'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import styles from './legal.module.css'

const KEY = 'cs-cookie-consent' // 'all' | 'essential'

export default function CookieBanner() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (pathname && pathname.startsWith('/app')) return // dono logado não vê banner de marketing
    let decided = false
    try { decided = !!localStorage.getItem(KEY) } catch (e) { /* sem storage, mostra */ }
    if (!decided) { const t = setTimeout(() => setOpen(true), 900); return () => clearTimeout(t) }
  }, [pathname])

  const decide = (val) => {
    try { localStorage.setItem(KEY, val) } catch (e) { /* segue */ }
    setClosing(true)
    setTimeout(() => setOpen(false), 420)
  }

  if (!open) return null
  return (
    <div className={styles.cookie + (closing ? ' ' + styles.out : ' ' + styles.show)} role="dialog" aria-label="Aviso de cookies">
      <span className={styles.cookieStar}>★</span>
      <p className={styles.cookieTxt}>
        Usamos cookies essenciais pra o sistema funcionar e, com sua permissão, cookies de análise pra melhorar o produto.
        Saiba mais na <a href="/privacidade#cookies">Política de Privacidade</a>.
      </p>
      <div className={styles.cookieBtns}>
        <button className={styles.cAccept} onClick={() => decide('all')}>Aceitar tudo</button>
        <button className={styles.cEssential} onClick={() => decide('essential')}>Só essenciais</button>
      </div>
    </div>
  )
}