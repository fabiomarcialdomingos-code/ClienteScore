'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { addAppointment, serveTick, sendInvite } from './belt-actions'
import styles from './app.module.css'

function maskPhone(v) {
  v = String(v || '').replace(/\D/g, '').slice(0, 11)
  if (!v.length) return ''
  if (v.length <= 2) return '(' + v
  if (v.length <= 6) return '(' + v.slice(0, 2) + ') ' + v.slice(2)
  if (v.length <= 10) return '(' + v.slice(0, 2) + ') ' + v.slice(2, 6) + '-' + v.slice(6)
  return '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7)
}
function fmtCountdown(ms) {
  if (ms <= 0) return '0:00'
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return h + 'h' + (m < 10 ? '0' : '') + m + 'm'
  return m + ':' + (s < 10 ? '0' : '') + s
}
function waLinkFor(item, tenant) {
  const first = (item.customer_name || 'cliente').split(' ')[0]
  const isLocal = typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  const base = isLocal ? location.origin + '/' + tenant.slug : 'https://clientescore.com.br/' + tenant.slug
  const link = base + '?i=' + item.token
  const msg = 'Oi, ' + first + '! Aqui é da ' + tenant.name + ' ✨ Passando pra agradecer sua visita hoje. Se puder, deixa uma avaliação rapidinha? Leva 10 segundos e ajuda demais a gente: ' + link + ' 🙏'
  const d = (item.whatsapp || '').replace(/\D/g, '')
  return 'https://wa.me/' + (d.length <= 11 ? '55' + d : d) + '?text=' + encodeURIComponent(msg)
}

function Line({ item, tenant }) {
  const [pending, start] = useTransition()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (item.status !== 'served' || item.invite_sent_at) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [item.status, item.invite_sent_at])

  const fire = item.invite_fire_at ? new Date(item.invite_fire_at).getTime() : 0
  const remaining = fire - now
  const ready = item.status === 'served' && !item.invite_sent_at && !tenant.paused && fire > 0 && remaining <= 0

  let state = 'scheduled'
  if (item.converted) state = 'converted'
  else if (item.invite_sent_at) state = 'invited'
  else if (ready) state = 'ready'
  else if (item.served_at) state = 'served'

  const doTick = () => {
    if (!item.whatsapp) return
    start(() => serveTick(item.id))
  }
  const doSend = () => {
    try { window.open(waLinkFor(item, tenant), '_blank') } catch (e) { /* segue */ }
    start(() => sendInvite(item.id))
  }

  return (
    <div className={styles.line + ' ' + styles['line_' + state]}>
      <button
        className={styles.tick + (state !== 'scheduled' ? ' ' + styles.tickDone : '')}
        onClick={doTick}
        disabled={state !== 'scheduled' || pending || !item.whatsapp}
        title={item.whatsapp ? 'Marcar como atendido' : 'Sem WhatsApp cadastrado'}
        aria-label="Marcar como atendido"
      >
        <svg className={styles.tickSvg} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
      </button>

      <div className={styles.lineMain}>
        <div className={styles.lineName}>{item.customer_name || 'Cliente'}</div>
        <div className={styles.lineSub}>{item.whatsapp ? maskPhone(item.whatsapp) : 'sem WhatsApp'}</div>
      </div>

      <div className={styles.lineRight}>
        {state === 'scheduled' && <span className={styles.schedTag}>na agenda</span>}
        {state === 'served' && !tenant.paused && <span className={styles.countdown}>⏳ convite em {fmtCountdown(remaining)}</span>}
        {state === 'served' && tenant.paused && <span className={styles.pauseTag}>⏸ automação pausada</span>}
        {state === 'ready' && (
          <>
            <span className={styles.readyTag}>pronto pra mandar</span>
            <button className={styles.btnSend} onClick={doSend} disabled={pending}>📲 Mandar agora</button>
          </>
        )}
        {state === 'invited' && <span className={styles.sentTag}>✓ convite enviado</span>}
        {state === 'converted' && <span className={styles.convTag}>★ virou avaliação</span>}
      </div>
    </div>
  )
}

export default function ServiceBelt({ items, customers, tenant }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [custId, setCustId] = useState('')
  const [pending, start] = useTransition()
  const wrapRef = useRef(null)

  const suggestions = name.trim().length >= 1
    ? customers.filter((c) => c.name.toLowerCase().includes(name.trim().toLowerCase())).slice(0, 5)
    : []

  useEffect(() => {
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setCustId((cur) => cur) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const pick = (c) => { setName(c.name); setPhone(maskPhone(c.whatsapp || '')); setCustId(c.id) }

  const onAdd = (e) => {
    // deixa o form submeter via action; limpa depois no próximo render via key? limpamos aqui:
    setTimeout(() => { setName(''); setPhone(''); setCustId('') }, 50)
  }

  // contadores do dia
  const served = items.filter((i) => i.served_at).length
  const sent = items.filter((i) => i.invite_sent_at).length
  const conv = items.filter((i) => i.converted).length
  const ready = items.filter((i) => i.status === 'served' && !i.invite_sent_at && !tenant.paused && i.invite_fire_at && new Date(i.invite_fire_at).getTime() <= Date.now()).length

  return (
    <>
      <div className={styles.beltFunnel} aria-label="Funil do dia">
        <div className={styles.fItem}><span className={styles.fNum}>{served}</span><span className={styles.fLab}>atendidos hoje</span></div>
        <div className={styles.fItem}><span className={styles.fNum}>{sent}</span><span className={styles.fLab}>convites enviados</span></div>
        <div className={styles.fItem}><span className={styles.fNum}>{conv}</span><span className={styles.fLab}>viraram avaliação</span></div>
        <div className={styles.fItem + ' ' + styles.fHot}><span className={styles.fNum}>{ready}</span><span className={styles.fLab}>prontos pra mandar 🔔</span></div>
      </div>

      <form action={addAppointment} onSubmit={onAdd} className={styles.beltAdd}>
        <input type="hidden" name="tenantId" value={tenant.id} />
        <input type="hidden" name="customerId" value={custId} />
        <div className={styles.acWrap} ref={wrapRef}>
          <input
            className={styles.addInput}
            name="name"
            value={name}
            onChange={(e) => { setName(e.target.value); setCustId('') }}
            placeholder="Nome do cliente (busca no cadastro…)"
            autoComplete="off"
            required
          />
          {suggestions.length > 0 && (
            <div className={styles.acList}>
              {suggestions.map((c) => (
                <button type="button" key={c.id} className={styles.acItem} onClick={() => pick(c)}>
                  <span>{c.name}</span><small>{c.whatsapp ? maskPhone(c.whatsapp) : 'sem tel.'}</small>
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          className={styles.addInput}
          name="phone"
          value={phone}
          onChange={(e) => { setPhone(maskPhone(e.target.value)); setCustId('') }}
          placeholder="WhatsApp (se não estiver no cadastro)"
          inputMode="numeric"
        />
        <button type="submit" className={styles.addBtn} disabled={pending}>+ Adicionar à esteira</button>
      </form>

      <div className={styles.beltList}>
        {items.length === 0 ? (
          <div className={styles.lineEmpty}>
            <span className={styles.e}>🗓️</span>
            <p>Ainda ninguém na esteira hoje. Adicione quem você vai atender — ou quem já atendeu — e dê o <b>✓</b>.</p>
          </div>
        ) : (
          items.map((i) => <Line key={i.id} item={i} tenant={tenant} />)
        )}
      </div>
    </>
  )
}