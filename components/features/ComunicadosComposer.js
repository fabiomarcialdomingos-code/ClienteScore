'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import styles from '../../styles/dashboard.module.css'

const TPL = {
  promo:     { emoji: '🔥', label: 'PROMOÇÃO',       bg: '#F5B841',            fg: '#14203A', txt: true,  date: true },
  horario:   { emoji: '🕐', label: 'HORÁRIO DE HOJE', bg: 'rgba(246,238,221,.16)', fg: '#F6EEDD', times: true },
  aberto:    { emoji: '🟢', label: 'ABERTO AGORA',    bg: '#3ECF8E',            fg: '#0B2417' },
  fechado:   { emoji: '🔴', label: 'FECHADO HOJE',    bg: '#FF8A7A',            fg: '#3A0F0A', txt: true },
  livre:     { emoji: '📣', label: 'NOVIDADE',        bg: '#F5B841',            fg: '#14203A', txt: true },
}

function fmtDate(d) { if (!d) return ''; const p = d.split('-'); return p[2] + '/' + p[1] }
function timeAgo(iso) {
  const d = new Date(iso), s = Math.floor((Date.now() - d) / 1000)
  if (s < 60) return 'agora'; const m = Math.floor(s / 60); if (m < 60) return 'há ' + m + ' min'
  const h = Math.floor(m / 60); if (h < 24) return 'há ' + h + ' h'; const dd = Math.floor(h / 24)
  if (dd < 7) return dd === 1 ? 'ontem' : 'há ' + dd + ' dias'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
function wrap(x, t, mw) {
  const w = String(t || '').split(/\s+/); const L = []; let l = ''
  for (let i = 0; i < w.length; i++) { const s = l ? l + ' ' + w[i] : w[i]; if (x.measureText(s).width > mw && l) { L.push(l); l = w[i] } else l = s }
  if (l) L.push(l); return L
}
function roundRect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath() }

export default function ComunicadosComposer({ tenant, history }) {
  const router = useRouter()
  const [tpl, setTpl] = useState('promo')
  const [text, setText] = useState('')
  const [abre, setAbre] = useState('09:00')
  const [fecha, setFecha] = useState('19:00')
  const [date, setDate] = useState('')
  const [toast, setToast] = useState(null)
  const [busy, setBusy] = useState(false)
  const supa = useRef(null)
  const toastT = useRef(null)
  const confRef = useRef(null)

  useEffect(() => { supa.current = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) }, [])
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute('data-revealed', ''); io.unobserve(e.target) } }), { threshold: 0.12 })
    document.querySelectorAll('[data-comreveal]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [history])

  const T = TPL[tpl]
  const cfg = (() => {
    let main = '', sub = ''
    if (tpl === 'promo') { main = text.trim() || 'Desconto especial pra você!'; sub = date ? 'Válido até ' + fmtDate(date) : '' }
    else if (tpl === 'horario') { main = (abre || '09:00') + ' às ' + (fecha || '19:00'); sub = 'Te esperamos lá! 🙌' }
    else if (tpl === 'aberto') { main = 'Hoje até às ' + (fecha || '19:00'); sub = 'Vem que dá tempo! 🏃' }
    else if (tpl === 'fechado') { main = text.trim() || 'Voltamos amanhã!'; sub = 'Até breve! 🙏' }
    else { main = text.trim() || 'Confira as novidades!'; sub = '' }
    return { emoji: T.emoji, label: T.label, bg: T.bg, fg: T.fg, main, sub }
  })()

  const message = (() => {
    const b = tenant.name
    if (tpl === 'promo') return cfg.emoji + ' PROMOÇÃO na ' + b + '! ' + cfg.main + (cfg.sub ? ' ' + cfg.sub + '.' : '') + ' Corre aproveitar! 🏃‍♂️'
    if (tpl === 'horario') return cfg.emoji + ' Horário de hoje na ' + b + ': ' + cfg.main + '. Te esperamos lá!'
    if (tpl === 'aberto') return cfg.emoji + ' Estamos ABERTOS agora na ' + b + '! ' + cfg.main + '. Vem que dá tempo!'
    if (tpl === 'fechado') return cfg.emoji + ' Hoje a ' + b + ' está fechada. ' + cfg.main + ' Até breve! 🙏'
    return cfg.emoji + ' ' + cfg.main + ' — ' + b
  })()

  function notify(msg, type) { setToast({ msg, type }); if (toastT.current) clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(null), type === 'error' ? 6000 : 3500) }
  async function copy(t) { try { await navigator.clipboard.writeText(t) } catch (e) { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove() } }

  function drawCanvas() {
    const S = 1080, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d')
    const fd = (typeof document !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--font-display') : '') || 'serif'
    const fb = (typeof document !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--font-body') : '') || 'sans-serif'
    x.fillStyle = tenant.brand_color || '#0E3B2E'; x.fillRect(0, 0, S, S)
    x.save(); x.translate(S / 2, S / 2); x.rotate(Math.PI / 4); x.fillStyle = 'rgba(255,255,255,.045)'; for (let i = -S; i < S; i += 72) x.fillRect(i, -S, 36, S * 2); x.restore()
    const g = x.createRadialGradient(S / 2, 320, 0, S / 2, 320, 520); g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, S, S)
    x.textBaseline = 'top'; x.textAlign = 'left'
    x.fillStyle = '#FFFFFF'; x.font = '400 52px ' + fd; x.fillText(tenant.name || '', 70, 64, S - 140)
    x.fillStyle = '#F5B841'; x.fillRect(72, 136, 110, 8)
    x.fillStyle = 'rgba(255,255,255,.72)'; x.font = '600 30px ' + fb; x.fillText('@' + (tenant.slug || ''), 72, 166)
    x.textAlign = 'center'; x.font = '400 120px sans-serif'; x.fillText(cfg.emoji, S / 2, 235)
    x.font = '700 40px ' + fb; const lw = x.measureText(cfg.label).width + 100, lx = S / 2 - lw / 2, ly = 410
    roundRect(x, lx, ly, lw, 84, 42); x.fillStyle = cfg.bg.charAt(0) === '#' ? cfg.bg : 'rgba(246,238,221,.16)'; x.fill()
    x.fillStyle = cfg.fg; x.fillText(cfg.label, S / 2, ly + 22)
    let size = 56; x.font = '700 ' + size + 'px ' + fb; let lines = wrap(x, cfg.main, S - 200)
    while (lines.length > 3 && size > 38) { size -= 4; x.font = '700 ' + size + 'px ' + fb; lines = wrap(x, cfg.main, S - 200) }
    x.fillStyle = '#FFFFFF'; let y = 555; const lh = size * 1.3; lines.forEach((L) => { x.fillText(L, S / 2, y); y += lh })
    if (cfg.sub) { x.fillStyle = '#F5B841'; x.font = '700 36px ' + fb; x.fillText(cfg.sub, S / 2, y + 22) }
    x.textAlign = 'left'; x.fillStyle = 'rgba(255,255,255,.55)'; x.font = '600 28px ' + fb; x.fillText('★ clientescore.com.br', 70, S - 92)
    return cv
  }
  function blobOf(cv) { return new Promise((res) => cv.toBlob(res, 'image/png')) }
  function download(blob, name) { const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(u), 2000) }

  function fireConfetti() {
    const c = confRef.current; if (!c || typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const cols = ['#F5B841', '#FFCE63', '#3ECF8E', '#EDE9DD', '#FFF3D6']
    for (let i = 0; i < 60; i++) { const p = document.createElement('i'); const s = 6 + Math.random() * 7; p.style.cssText = 'left:' + (Math.random() * 100) + '%;background:' + cols[(Math.random() * cols.length) | 0] + ';width:' + s + 'px;height:' + (s * (Math.random() > .5 ? 1 : .5)) + 'px;animation-duration:' + (2.2 + Math.random() * 1.6) + 's;animation-delay:' + (Math.random() * .5) + 's;--dx:' + ((Math.random() - .5) * 160) + 'px;--rot:' + (Math.random() * 720 - 360) + 'deg;'; c.appendChild(p); setTimeout(() => p.remove(), 4400) }
  }

  async function onPublish() {
    if (!supa.current) return
    setBusy(true)
    try {
      const cv = drawCanvas(); const blob = await blobOf(cv)
      const file = new File([blob], 'com-' + Date.now() + '.png', { type: 'image/png' })
      const path = 'comunicados/com-' + Date.now() + '.png'
      const up = await supa.current.storage.from('artes').upload(path, file, { contentType: 'image/png', upsert: true })
      if (up.error) throw up.error
      const base = String(process.env.NEXT_PUBLIC_SUPABASE_URL).replace(/\/$/, '')
      const url = base + '/storage/v1/object/public/artes/' + path
      const ins = await supa.current.from('comunicados').insert({ tenant_id: tenant.id, template: tpl, content: cfg.main, extra: { sub: cfg.sub, emoji: cfg.emoji }, image_url: url, message, status: 'published' }).select().single()
      if (ins.error) throw ins.error
      notify('✅ Publicado e salvo! Arte no Storage.', 'ok'); fireConfetti(); router.refresh()
    } catch (e) {
      notify('❌ ' + (e && e.message ? e.message : 'não foi possível publicar'), 'error')
    } finally { setBusy(false) }
  }
  async function onShare() {
    await copy(message)
    const blob = await blobOf(drawCanvas()); const file = new File([blob], 'comunicado.png', { type: 'image/png' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], text: message, title: 'Comunicado' }); notify('✅ Compartilhado! Mensagem copiada.', 'ok'); return } catch (e) { if (e.name === 'AbortError') { notify('Mensagem copiada! 👍'); return } } }
    download(blob, 'comunicado-' + tenant.slug + '.png'); notify('📲 Arte baixada e mensagem copiada! Cole no Status/Stories.', 'ok')
  }
  function onDownload() { download(blobOf(drawCanvas()).then ? null : null, ''); blobOf(drawCanvas()).then((b) => { download(b, 'comunicado-' + tenant.slug + '.png'); notify('⬇️ Arte baixada!', 'ok') }) }

  return (
    <div className={styles.comGrid}>
      <section className={styles.comCard} aria-label="Criar comunicado">
        <h3 className={styles.comCardH}>📣 Novo comunicado</h3>
        <div className={styles.tpls2} role="group" aria-label="Modelo">
          {Object.keys(TPL).map((k) => (
            <button key={k} type="button" className={styles.tpl2 + (tpl === k ? ' ' + styles.tpl2On : '')} onClick={() => setTpl(k)}><span className={styles.tpl2E}>{TPL[k].emoji}</span>{TPL[k].label}</button>
          ))}
        </div>

        {!!T.txt && (
          <div className={styles.field2}>
            <label className={styles.fLabel2} htmlFor="cText">{tpl === 'fechado' ? 'Aviso (opcional)' : 'Texto'}</label>
            <textarea id="cText" className={styles.fIn2} maxLength={120} value={text} onChange={(e) => setText(e.target.value)} placeholder={tpl === 'fechado' ? 'Ex.: Voltamos amanhã às 9h' : 'Ex.: Corte + barba por R$ 45 até sexta!'} />
          </div>
        )}
        {!!T.times && (
          <div className={styles.timeRow2}>
            <div className={styles.field2}><label className={styles.fLabel2} htmlFor="cAbre">Abre às</label><input id="cAbre" className={styles.fIn2} type="time" value={abre} onChange={(e) => setAbre(e.target.value)} /></div>
            <div className={styles.field2}><label className={styles.fLabel2} htmlFor="cFecha">Fecha às</label><input id="cFecha" className={styles.fIn2} type="time" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
          </div>
        )}
        {!!T.date && (
          <div className={styles.field2}><label className={styles.fLabel2} htmlFor="cDate">Válido até (opcional)</label><input id="cDate" className={styles.fIn2} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        )}

        <div className={styles.msgBox2}><span className={styles.msgBoxL}>Mensagem pronta pra enviar</span><p>{message}</p></div>

        <div className={styles.comActions}>
          <button type="button" className={styles.btnWa2} onClick={onShare}>📲 Compartilhar</button>
          <button type="button" className={styles.btnGhostC} onClick={onDownload}>⬇️ Baixar arte</button>
          <button type="button" className={styles.btnGhostC} onClick={async () => { await copy(message); notify('📋 Mensagem copiada!', 'ok') }}>📋 Copiar</button>
          <button type="button" className={styles.btnPrimaryC} onClick={onPublish} disabled={busy}>{busy ? 'Publicando…' : '✅ Publicar'}</button>
        </div>
      </section>

      <section className={styles.previewCol2} aria-label="Prévia da arte">
        <div className={styles.art2} style={{ background: tenant.brand_color }}>
          <div className={styles.artBrand2}><b className={styles.artBrandName2}>{tenant.name}</b><span className={styles.artBrandHandle2}>@{tenant.slug}</span></div>
          <div key={cfg.emoji} className={styles.artEmoji2}>{cfg.emoji}</div>
          <div className={styles.artLabel2} style={{ background: cfg.bg, color: cfg.fg }}>{cfg.label}</div>
          <div className={styles.artMain2}>{cfg.main}</div>
          <div className={styles.artSub2}>{cfg.sub}</div>
          <div className={styles.artFoot2}>★ clientescore.com.br</div>
        </div>
        <p className={styles.previewCap2}>Preview <b>ao vivo</b> — muda enquanto você digita ✨</p>
      </section>

      <section className={styles.hist2} aria-label="Histórico">
        <h3 className={styles.histH}>Comunicados publicados</h3>
        {(!history || history.length === 0) ? (
          <div className={styles.comEmpty2}><span className={styles.e}>📭</span><p>Nenhum comunicado ainda. Crie o primeiro ao lado — a arte entra aqui com a miniatura real.</p></div>
        ) : (
          history.map((c, i) => {
            const ex = c.extra || {}
            return (
              <div key={c.id} className={styles.histRow2} data-comreveal style={{ transitionDelay: (i * 40) + 'ms' }}>
                <div className={styles.histThumb2}>{c.image_url ? <img src={c.image_url} alt="" /> : <span>{ex.emoji || '📣'}</span>}</div>
                <div className={styles.histInfo2}>
                  <div className={styles.histTop2}><span className={styles.histTag2 + ' ' + (styles['histTag_' + (c.template || 'livre')] || '')}>{(TPL[c.template] || {}).label || 'NOVIDADE'}</span><span className={styles.histWhen2}>{timeAgo(c.created_at)}</span></div>
                  <div className={styles.histText2}>{c.content || c.message || ''}</div>
                </div>
                <span className={styles.histStatus2}>✅ Publicado</span>
              </div>
            )
          })
        )}
      </section>

      {toast ? <div className={styles.comToast2 + ' ' + (toast.type === 'error' ? styles.comToastErr : styles.comToastOk)}>{toast.msg}</div> : null}
      <div className={styles.comConfetti} ref={confRef} />
    </div>
  )
}