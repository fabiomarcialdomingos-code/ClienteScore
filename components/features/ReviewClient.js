'use client'
import { useState, useTransition } from 'react'
import { saveReview, saveFeedback } from '../../app/[slug]/actions'

const LABELS = ['Péssimo 😞', 'Ruim 😕', 'Ok 😐', 'Muito bom 😊', 'Excelente 🤩']
const STAR = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
const SCISSORS = 'M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3h-2z'

function maskPhone(v) {
  v = String(v || '').replace(/\D/g, '').slice(0, 11)
  if (!v.length) return ''
  if (v.length <= 2) return '(' + v
  if (v.length <= 6) return '(' + v.slice(0, 2) + ') ' + v.slice(2)
  if (v.length <= 10) return '(' + v.slice(0, 2) + ') ' + v.slice(2, 6) + '-' + v.slice(6)
  return '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7)
}

export default function ReviewClient({ tenant, tag, invitationToken }) {
  const [screen, setScreen] = useState('stars')
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(false)
  const [optin, setOptin] = useState(false)
  const [chips, setChips] = useState({})
  const [pending, start] = useTransition()
  const [err, setErr] = useState('')

  const go = (s) => setScreen(s)

  const pickStar = (i) => {
    setRating(i + 1)
    setTimeout(() => go(i >= 3 ? 'positive' : 'negative'), 620)
  }

  const toggleChip = (label) => {
    setChips((c) => {
      const next = { ...c, [label]: !c[label] }
      const picked = Object.keys(next).filter((k) => next[k])
      setText((t) => {
        const base = t.split('. ').filter((x) => !Object.keys(c).includes(x) && !picked.includes(x)).join('. ')
        const add = picked.join('. ')
        return (base ? base.replace(/[.\s]*$/, '') + (add ? '. ' : '') : '') + add
      })
      return next
    })
  }

  const submitPositive = (e) => {
    e.preventDefault()
    if (!text.trim()) { e.target.querySelector('textarea').classList.add('shake'); setTimeout(() => e.target.querySelector('textarea').classList.remove('shake'), 500); return }
    setErr('')
    start(async () => {
      const r = await saveReview({ slug: tenant.slug, rating, text: text.trim(), name, consent, optin, phone: phone.replace(/\D/g, ''), invitationToken })
      if (r.ok) { setScreen('thanks-positive'); fireConfetti() }
      else setErr(r.error || 'Não foi possível enviar.')
    })
  }

  const submitNegative = (e) => {
    e.preventDefault()
    if (!text.trim()) { e.target.querySelector('textarea').classList.add('shake'); setTimeout(() => e.target.querySelector('textarea').classList.remove('shake'), 500); return }
    setErr('')
    start(async () => {
      const r = await saveFeedback({ slug: tenant.slug, rating, text: text.trim(), name, phone: phone.replace(/\D/g, '') })
      if (r.ok) setScreen('thanks-negative')
      else setErr(r.error || 'Não foi possível enviar.')
    })
  }

  const reset = () => { setScreen('stars'); setRating(0); setText(''); setName(''); setPhone(''); setConsent(false); setOptin(false); setChips({}); setErr('') }

  const waHref = 'https://wa.me/' + (tenant.whatsapp || '5511987654321') + '?text=' + encodeURIComponent('Olá! Acabei de enviar um feedback privado pela página ' + tenant.name + ' (nota ' + rating + '/5) e gostaria de falar com o responsável.')

  return (
    <>
      <main className="df-app">
        <section className={'df-screen' + (screen === 'stars' ? ' is-active' : '')}>
          <div className="df-status"><span className="dot" /> Aberto agora · até às 19h</div>
          <header className="df-brand">
            <div className="df-logo">
              <svg viewBox="0 0 24 24" style={{ display: tenant.logo_url ? 'none' : 'block' }}><path d={SCISSORS} /></svg>
              {tenant.logo_url ? <img src={tenant.logo_url} alt={tenant.name} /> : null}
            </div>
            <h1>{tenant.name}</h1>
            <p className="tag">{tag}</p>
          </header>
          <div className="df-card">
            <div className="df-card-top"><h2>Como foi sua experiência hoje?</h2><p>Toque nas estrelas para avaliar</p></div>
            <div className="df-card-body">
              <div className="df-stars" role="radiogroup">
                {[0, 1, 2, 3, 4].map((i) => (
                  <button key={i} className={'df-star' + (i < rating ? ' is-filled' : '')} onClick={() => pickStar(i)} aria-label={(i + 1) + ' estrela(s)'}>
                    <svg viewBox="0 0 24 24" className={i === rating - 1 ? 'pop' : ''}><path d={STAR} /></svg>
                  </button>
                ))}
              </div>
              <p className={'df-rating-label' + (rating >= 4 ? ' good' : '')}>{rating ? LABELS[rating - 1] : '\u00A0'}</p>
            </div>
          </div>
        </section>

        <section className={'df-screen' + (screen === 'positive' ? ' is-active' : '')}>
          <button className="df-back" onClick={() => go('stars')}>← voltar</button>
          <div className="df-card">
            <div className="df-card-top"><h2>Que bom que você curtiu! 🙌</h2><p>Conta pra gente o que mais gostou:</p></div>
            <div className="df-card-body">
              <form onSubmit={submitPositive}>
                <div className="df-chips">
                  {[['✂️ Corte impecável', 'Corte impecável'], ['💈 Atendimento nota 10', 'Atendimento nota 10'], ['🔥 Ambiente top', 'Ambiente top'], ['⚡ Preço justo', 'Preço justo']].map(([lab, val]) => (
                    <button type="button" key={val} className={'df-chip' + (chips[val] ? ' on' : '')} onClick={() => toggleChip(val)}>{lab}</button>
                  ))}
                </div>
                <div className="df-field"><textarea className="df-in" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex.: atendimento rápido, corte caprichado…" required /></div>
                <div className="df-field"><input className="df-in" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome (opcional)" /></div>
                <div className="df-field"><input className="df-in" type="tel" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="Seu WhatsApp (opcional) 📲" inputMode="numeric" /></div>
                <label className="df-consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span className="box" /><span>Autorizo o uso do meu depoimento e do meu nome nas redes sociais de {tenant.name}.<em>🔒 Seus dados estão protegidos · LGPD</em></span></label>
                <label className="df-consent"><input type="checkbox" checked={optin} onChange={(e) => setOptin(e.target.checked)} /><span className="box" /><span>Quero receber atualizações e confirmações da {tenant.name} no WhatsApp 📲<em>🔔 Canal de atendimento · pode cancelar quando quiser</em></span></label>
                {err ? <p className="df-privacy" style={{ color: '#B02A37' }}>⚠️ {err}</p> : null}
                <button type="submit" className="df-btn" disabled={pending}>{pending ? 'Enviando…' : 'Enviar depoimento ✨'}</button>
              </form>
            </div>
          </div>
        </section>

        <section className={'df-screen' + (screen === 'negative' ? ' is-active' : '')}>
          <button className="df-back" onClick={() => go('stars')}>← voltar</button>
          <div className="df-card">
            <div className="df-card-top"><h2>Poxa, sentimos muito 😔</h2><p>O que podemos melhorar da próxima vez?</p></div>
            <div className="df-card-body">
              <form onSubmit={submitNegative}>
                <div className="df-field"><textarea className="df-in" value={text} onChange={(e) => setText(e.target.value)} placeholder="Conta com sinceridade, a gente quer melhorar…" required /></div>
                <div className="df-field"><input className="df-in" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome (opcional)" /></div>
                <div className="df-field"><input className="df-in" type="tel" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="Seu WhatsApp (opcional) 📲" inputMode="numeric" /></div>
                {err ? <p className="df-privacy" style={{ color: '#B02A37' }}>⚠️ {err}</p> : null}
                <button type="submit" className="df-btn" disabled={pending}>{pending ? 'Enviando…' : 'Enviar feedback privado'}</button>
                <p className="df-privacy">🔒 Só o gerente recebe. Nada é publicado.</p>
              </form>
            </div>
          </div>
        </section>

        <section className={'df-screen' + (screen === 'thanks-positive' ? ' is-active' : '')}>
          <h2 className="df-thanks-head">{name ? 'Valeu, ' + name.split(' ')[0] + '! 🎉' : 'Valeu! 🎉'}</h2>
          <p className="df-thanks-sub">Seu depoimento foi enviado com sucesso.</p>
          {consent ? (
            <>
              <p className="df-magic">✨ E olha a mágica: seu elogio já virou um post!</p>
              <div className="df-art">
                <div className="df-art-top">
                  <span className="df-art-logo"><svg viewBox="0 0 24 24"><path d={STAR} /></svg></span>
                  <span><span className="df-art-brand">{tenant.name}</span><br /><span className="df-art-handle">@{tenant.slug}</span></span>
                </div>
                <div className="df-art-stars">{'★'.repeat(rating)}<span className="dim">{'★'.repeat(5 - rating)}</span></div>
                <blockquote className="df-art-quote">“{text}”</blockquote>
                <div className="df-art-name">— {name || 'Cliente'}</div>
              </div>
              <div className="df-caption"><b>Legenda gerada automaticamente</b>Mais um cliente satisfeito! 💈 Obrigado, {(name || 'cliente').split(' ')[0]}, pela confiança. Vem você também! ✂️ #{tenant.slug}<small>Pronta para publicar em 1 clique no painel do gerente.</small></div>
            </>
          ) : null}
          <a className="df-google" href={tenant.gmb_link || '#'} target="_blank" rel="noopener">
            <svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" /></svg>
            Avaliar no Google Maps
          </a>
          <p className="df-micro">Leva menos de 10 segundos e ajuda demais a gente 💚</p>
          <button className="df-restart" onClick={reset}>↺ Fazer outra avaliação</button>
        </section>

        <section className={'df-screen' + (screen === 'thanks-negative' ? ' is-active' : '')}>
          <h2 className="df-thanks-head">Obrigado por nos ajudar a melhorar 🙏</h2>
          <p className="df-thanks-sub">Seu feedback foi enviado em privado ao gerente.</p>
          {tenant.whatsapp ? (
            <a className="df-wa" href={waHref} target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24"><path d="M12.1 21.8h-.01a9.9 9.9 0 01-5.04-1.38l-.36-.21-3.75.98 1-3.65-.24-.37a9.86 9.86 0 01-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 019.89 9.89c0 5.45-4.44 9.88-9.88 9.88m8.4-18.3A11.8 11.8 0 0012.1 0C5.5 0 .1 5.4.1 12c0 2.1.55 4.16 1.6 5.97L0 24l6.2-1.62a11.9 11.9 0 005.9 1.5h.01c6.6 0 12-5.4 12-12 0-3.2-1.25-6.2-3.5-8.4z" /></svg>
              Chamar o gerente no WhatsApp
            </a>
          ) : null}
          <p className="df-micro">Nada será publicado. Sua opinião fica só entre a gente.</p>
          <button className="df-restart" onClick={reset}>↺ Fazer outra avaliação</button>
        </section>
      </main>
      <a className="df-powered" href="/">⚡ por <b>ClienteScore</b></a>
      <div className="df-confetti" id="df-confetti" />
    </>
  )
}

function fireConfetti() {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const c = document.getElementById('df-confetti')
  if (!c) return
  const cols = ['#E0A82E', '#F2BE45', '#F6EEDD', '#155241', '#FFF3D6']
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('i')
    const s = 6 + Math.random() * 7
    p.style.cssText = 'left:' + (Math.random() * 100) + '%;background:' + cols[(Math.random() * cols.length) | 0] + ';width:' + s + 'px;height:' + (s * (Math.random() > .5 ? 1 : .5)) + 'px;animation-duration:' + (2.2 + Math.random() * 1.7) + 's;animation-delay:' + (Math.random() * .6) + 's;--dx:' + ((Math.random() - .5) * 180) + 'px;--rot:' + (Math.random() * 720 - 360) + 'deg;'
    c.appendChild(p)
    setTimeout(() => p.remove(), 4600)
  }
}