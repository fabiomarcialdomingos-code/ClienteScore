'use client'

import { useState, useTransition, useRef } from 'react'
import { markPublished, markScheduled } from './post-actions'
import styles from './app.module.css'

function timeAgo(iso) {
  const d = new Date(iso), now = new Date(), s = Math.floor((now - d) / 1000)
  if (s < 60) return 'agora'
  const m = Math.floor(s / 60); if (m < 60) return 'há ' + m + ' min'
  const h = Math.floor(m / 60); if (h < 24) return 'há ' + h + ' h'
  const dd = Math.floor(h / 24); if (dd < 7) return dd === 1 ? 'ontem' : 'há ' + dd + ' dias'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
function fmt(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
function makeCaption(name, slug) {
  const f = (name || 'cliente').split(' ')[0]
  return 'Mais um cliente satisfeito! 💈 Obrigado, ' + f + ', pela confiança no nosso trabalho. Vem você também! ✂️ #' + (slug || 'clientescore')
}

function PostCard({ post, tenant, notify }) {
  const rev = post.reviews || {}
  const r = rev.rating || 5
  const name = rev.customer_name || 'Cliente'
  const text = rev.text || ''
  const caption = post.caption || makeCaption(name, tenant.slug)
  const [openSched, setOpenSched] = useState(false)
  const [schedVal, setSchedVal] = useState('')
  const [pending, start] = useTransition()

  const doPublish = () => {
    start(async () => {
      try { await navigator.clipboard.writeText(caption) } catch (e) { /* sem clipboard, segue */ }
      if (post.image_url) { try { window.open(post.image_url, '_blank') } catch (e) { /* segue */ } }
      const res = await markPublished(post.id)
      if (res.ok) notify('✅ Legenda copiada e arte aberta — é só colar no Instagram!', 'ok')
      else notify('⚠️ ' + (res.error || 'Não foi possível marcar como publicado.'), 'error')
    })
  }
  const doCopy = async () => {
    try { await navigator.clipboard.writeText(caption); notify('📋 Legenda copiada!', 'ok') }
    catch (e) { notify('Não consegui copiar a legenda.', 'error') }
  }
  const doSchedule = () => {
    if (!schedVal) return
    start(async () => {
      const res = await markScheduled(post.id, schedVal)
      if (res.ok) { notify('⏱️ Agendado para ' + fmt(new Date(schedVal).toISOString()) + '!', 'ok'); setOpenSched(false) }
      else notify('⚠️ ' + (res.error || 'Não foi possível agendar.'), 'error')
    })
  }

  return (
    <article className={styles.postCard}>
      <div className={styles.thumb}>
        {post.image_url
          ? <img src={post.image_url} alt={'Arte do depoimento de ' + name} />
          : <div className={styles.thumbPh} style={{ background: tenant.brand_color }}>★</div>}
      </div>
      <div className={styles.postMain}>
        <div className={styles.postMeta}>
          <span className={styles.stars}>{'★'.repeat(r)}<span className={styles.dim}>{'★'.repeat(5 - r)}</span></span>
          <span className={styles.pname}>{name}</span>
          <span className={styles.ptime}>{timeAgo(post.created_at)}</span>
          {post.status === 'scheduled' && post.scheduled_for ? <span className={styles.badgeSched}>⏱️ {fmt(post.scheduled_for)}</span> : null}
          {post.status === 'pending' ? <span className={styles.badgePend}>⏳ gerando…</span> : null}
        </div>
        <p className={styles.postText}>“{text}”</p>
        <div className={styles.capBox}><span className={styles.capLabel}>Legenda pronta</span><p className={styles.capText}>{caption}</p></div>
        <div className={styles.postActions}>
          <button className={styles.btnPost} onClick={doPublish} disabled={pending}>{pending ? '…' : '🚀 Postar no Instagram'}</button>
          <button className={styles.btnGhost2} onClick={doCopy}>📋 Legenda</button>
          <button className={styles.btnSched} onClick={() => setOpenSched((o) => !o)}>⏱️ Agendar</button>
        </div>
        {openSched ? (
          <div className={styles.schedRow}>
            <input type="datetime-local" value={schedVal} onChange={(e) => setSchedVal(e.target.value)} aria-label="Data e hora do agendamento" />
            <button className={styles.btnConfirm} onClick={doSchedule} disabled={pending}>Confirmar</button>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default function PostsQueue({ posts, tenant }) {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)
  const notify = (msg, type) => {
    setToast({ msg, type })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), type === 'error' ? 6000 : 3500)
  }

  return (
    <>
      {(!posts || posts.length === 0) ? (
        <div className={styles.emptyQueue}>
          <span className={styles.e}>📭</span>
          <h4>A fila está vazia</h4>
          <p>Quando um cliente deixar 4–5★ com consentimento, o post aparece aqui sozinho — com a arte do Storage e a legenda prontas.</p>
        </div>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} tenant={tenant} notify={notify} />)
      )}
      {toast ? <div className={styles.queueToast + ' ' + (toast.type === 'error' ? styles.qErr : styles.qOk)}>{toast.msg}</div> : null}
    </>
  )
}