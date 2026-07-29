'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { login, signup } from '@/lib/auth-actions'
import styles from './auth.module.css'

const PROOF = [
  { q: '"Eu não postava nunca. Agora meu Instagram vive de elogios reais dos meus clientes."', w: '— João · Barbearia Fígaro' },
  { q: '"Em 2 semanas, mais avaliações no Google do que nos últimos 2 anos."', w: '— Mariana · Clínica Bella' },
  { q: '"O cliente elogia, o post aparece pronto. Eu só aperto um botão."', w: '— Pedro · Pet Shop Amigo' },
]

export default function AuthForm() {
  const [tab, setTab] = useState('login')
  const [loginState, loginAction, loginPending] = useActionState(login, null)
  const [signupState, signupAction, signupPending] = useActionState(signup, null)

  // prova social girando
  const [pi, setPi] = useState(0)
  const [swap, setSwap] = useState(false)
  useEffect(() => {
    const id = setInterval(() => {
      setSwap(true)
      setTimeout(() => { setPi((p) => (p + 1) % PROOF.length); setSwap(false) }, 400)
    }, 4500)
    return () => clearInterval(id)
  }, [])

  // limpa o alerta do outro modo ao trocar de aba
  useEffect(() => { /* useActionState mantém estado por form; ok */ }, [tab])

  const forgotRef = useRef(null)

  return (
    <div className={styles.shell}>
      <section className={styles.brand}>
        <a className={styles.logo} href="/"><span className={styles.logoMark}>★</span><span>Cliente<span className={styles.amber}>Score</span></span></a>
        <h1>Seus elogios viram <em>score</em>.</h1>
        <p className={styles.sub}>Enquanto você atende, o ClienteScore transforma a opinião dos seus clientes em posts prontos e avaliações no Google — e soma tudo num placar só.</p>
        <div className={`${styles.proof} ${swap ? styles.swap : ''}`}>
          <div className={styles.pstars}>★★★★★</div>
          <p className={styles.quote}>{PROOF[pi].q}</p>
          <div className={styles.who}>{PROOF[pi].w}</div>
        </div>
        <div className={styles.markers}>
          <span><b>✓</b> 7 dias grátis</span><span><b>✓</b> Sem cartão</span><span><b>✓</b> LGPD</span><span><b>✓</b> Cancele quando quiser</span>
        </div>
      </section>

      <section className={styles.formSide}>
        <div className={styles.card}>
          <h2>{tab === 'login' ? 'Bem-vindo de volta 👋' : 'Vamos criar sua página ⭐'}</h2>
          <p className={styles.hint}>{tab === 'login' ? 'Entre para ver o seu placar.' : 'Em 5 minutos seu QR Code está pronto.'}</p>

          <div className={styles.tabs} role="tablist">
            <span className={`${styles.tabGlide} ${tab === 'signup' ? styles.right : ''}`} />
            <button className={tab === 'login' ? styles.on : ''} onClick={() => setTab('login')}>Entrar</button>
            <button className={tab === 'signup' ? styles.on : ''} onClick={() => setTab('signup')}>Criar conta grátis</button>
          </div>

          {tab === 'login' ? (
            <form action={loginAction} noValidate>
              {loginState?.error ? <div className={`${styles.alert} ${styles.err}`}>⚠️ {loginState.error}</div> : null}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="liEmail">E-mail</label>
                <input className={styles.in} id="liEmail" name="email" type="email" placeholder="voce@seunegocio.com.br" autoComplete="email" required />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="liPass">Senha</label>
                <input className={styles.in} id="liPass" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
              </div>
              <div className={styles.rowBetween}>
                <a className={styles.linkish} href="/login">Esqueci minha senha</a>
              </div>
              <button type="submit" className={styles.btn} disabled={loginPending}>{loginPending ? 'Entrando…' : 'Entrar no meu painel →'}</button>
            </form>
          ) : (
            <form action={signupAction} noValidate>
              {signupState?.error ? <div className={`${styles.alert} ${styles.err}`}>⚠️ {signupState.error}</div> : null}
              {signupState?.needConfirm ? <div className={`${styles.alert} ${styles.ok}`}>📧 Quase lá! Enviamos um link de confirmação pro seu e-mail. Confirme e volte aqui pra entrar.</div> : null}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="suName">Seu nome</label>
                <input className={styles.in} id="suName" name="name" type="text" placeholder="Ex.: João Silva" autoComplete="name" required />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="suBiz">Nome do negócio</label>
                <input className={styles.in} id="suBiz" name="business" type="text" placeholder="Ex.: Barbearia Fígaro" autoComplete="organization" required />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="suEmail">E-mail</label>
                <input className={styles.in} id="suEmail" name="email" type="email" placeholder="voce@seunegocio.com.br" autoComplete="email" required />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="suPass">Senha <small style={{ color: 'var(--muted)', fontWeight: 500 }}>(mínimo 6)</small></label>
                <input className={styles.in} id="suPass" name="password" type="password" placeholder="••••••••" autoComplete="new-password" required />
              </div>
              <button type="submit" className={styles.btn} disabled={signupPending}>{signupPending ? 'Criando…' : 'Criar minha página grátis →'}</button>
              <p className={styles.fine}><b>7 dias grátis</b> · sem cartão · sem fidelidade</p>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}