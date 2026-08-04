'use client'
import { useActionState, useState } from 'react'
import { createTenant } from '@/lib/tenant-actions'
import styles from '../../styles/onboarding.module.css'

const COLORS = [
  ['Verde Fígaro', '#0E3B2E'], ['Vinho', '#5A1320'], ['Azul Noite', '#14304A'], ['Roxo', '#2A1A40'],
  ['Grafite', '#1C1C22'], ['Teal', '#0E3B3B'], ['Cobre', '#7A3410'], ['Rosa', '#5A1430'],
]
const SEG = [
  ['barbearia', '💈 Barbearia', 'Barbearia clássica'], ['estetica', '✨ Estética', 'Clínica de estética'],
  ['petshop', '🐾 Pet Shop', 'O favorito do seu pet'], ['consultorio', '🦷 Consultório', 'Consultório'],
  ['restaurante', '🍕 Restaurante', 'Restaurante de bairro'], ['salao', '💅 Salão', 'Salão de beleza'],
  ['servicos', '🔧 Serviços', 'Serviços locais'], ['academia', '🏋️ Academia', 'Academia'],
  ['outro', '🏪 Outro', 'Negócio local'],
]

function slugify(s) {
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
}

// máscara de digitação do zap do dono — mesma lógica da vitrine (feedback ao vivo)
function maskPhone(v) {
  v = String(v || '').replace(/\D/g, '').slice(0, 11)
  if (!v.length) return ''
  if (v.length <= 2) return '(' + v
  if (v.length <= 6) return '(' + v.slice(0, 2) + ') ' + v.slice(2)
  if (v.length <= 10) return '(' + v.slice(0, 2) + ') ' + v.slice(2, 6) + '-' + v.slice(6)
  return '(' + v.slice(0, 2) + ') ' + v.slice(2, 7) + '-' + v.slice(7)
}

export default function OnboardingForm() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [segment, setSegment] = useState('barbearia')
  const [color, setColor] = useState('#0E3B2E')
  const [whatsapp, setWhatsapp] = useState('')
  const [shake, setShake] = useState('')
  const [state, submitAction, pending] = useActionState(createTenant, null)

  const tag = (SEG.find((s) => s[0] === segment) || SEG[SEG.length - 1])[2]
  const onName = (v) => { setName(v); if (!slugTouched) setSlug(slugify(v)) }
  const onSlug = (v) => { setSlugTouched(true); setSlug(slugify(v)) }
  const onWhatsapp = (v) => setWhatsapp(maskPhone(v))

  const validate = (e) => {
    if (name.trim().length < 2) { e.preventDefault(); setShake('name'); setTimeout(() => setShake(''), 500); return }
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug) || slug.length < 3) { e.preventDefault(); setShake('slug'); setTimeout(() => setShake(''), 500); return }
    const wd = whatsapp.replace(/\D/g, '')
    if (wd.length < 10 || wd.length > 11) { e.preventDefault(); setShake('whatsapp'); setTimeout(() => setShake(''), 500); return }
  }

  if (state && state.ok) {
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=340x340&data=${encodeURIComponent('https://clientescore.com.br/' + state.slug)}&color=${state.color.slice(1)}&bgcolor=ffffff`
    return (
      <div className={styles.card}>
        <div className={styles.success}>
          <div className={styles.sucBadge}>★</div>
          <h2 className={styles.sucH}>Sua página nasceu, {state.name.split(' ')[0]}! 🎉</h2>
          <p className={styles.sucP}>Em segundos o QR Code abaixo já funciona. Imprima, cole na mesa ou mande no WhatsApp — cada estrela vira score no seu placar.</p>
          <img className={styles.qr} src={qr} alt={'QR Code da página ' + state.name} />
          <div className={styles.sucUrl}>clientescore.com.br/{state.slug}</div>
          <div className={styles.sucBtns}>
            <a className={styles.btnA} href="/app">Ir pro meu painel →</a>
            <a className={styles.btnGhost} href={`/${state.slug}`} target="_blank" rel="noopener">Ver minha página</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      <div className={styles.col}>
        <span className={styles.eyebrow}>⚡ passo 1 de 1 · leva 1 minuto</span>
        <h1 className={styles.h1}>Crie a página do <em>{name.split(' ')[0] || 'seu negócio'}</em>.</h1>
        <p className={styles.lead}>Escolha o nome, a cor e o segmento. Do lado, você vê a sua página tomando forma em tempo real — é exatamente assim que o seu cliente vai ver.</p>
        <form className={styles.card} action={submitAction} onSubmit={validate} noValidate>
          {state && state.error ? <div className={styles.err}>⚠️ {state.error}</div> : null}
          <div className={styles.step}>
            <span className={styles.stepN}>1</span>
            <div className={styles.stepB}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="obName">Nome do negócio</label>
                <input id="obName" name="name" className={styles.in + (shake === 'name' ? ' ' + styles.shake : '')} value={name} onChange={(e) => onName(e.target.value)} placeholder="Ex.: Confeitaria da Marta" autoComplete="organization" />
              </div>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepN}>2</span>
            <div className={styles.stepB}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="obSlug">Seu endereço</label>
                <div className={styles.slugRow + (shake === 'slug' ? ' ' + styles.shake : '')}>
                  <span className={styles.slugPre}>clientescore.com.br/</span>
                  <input id="obSlug" name="slug" className={styles.slugIn} value={slug} onChange={(e) => onSlug(e.target.value)} placeholder="confeitaria-marta" autoComplete="off" />
                </div>
                <p className={styles.hint}>Gerado do nome — mas você pode editar. Só letras minúsculas, números e -.</p>
              </div>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepN}>3</span>
            <div className={styles.stepB}>
              <div className={styles.field}>
                <label className={styles.label}>Cor da sua marca</label>
                <div className={styles.swatches}>
                  {COLORS.map(([n, hex]) => (
                    <button type="button" key={hex} className={styles.sw + (color === hex ? ' ' + styles.swOn : '')} style={{ background: hex }} onClick={() => setColor(hex)} aria-label={n} title={n} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepN}>4</span>
            <div className={styles.stepB}>
              <div className={styles.field}>
                <p className={styles.segLabel}>Segmento</p>
                <div className={styles.segs}>
                  {SEG.map(([key, lab]) => (
                    <button type="button" key={key} className={styles.seg + (segment === key ? ' ' + styles.segOn : '')} onClick={() => setSegment(key)}>{lab}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepN}>5</span>
            <div className={styles.stepB}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="obWa">WhatsApp do negócio</label>
                <input id="obWa" name="whatsapp" type="tel" inputMode="numeric" className={styles.in + (shake === 'whatsapp' ? ' ' + styles.shake : '')} value={whatsapp} onChange={(e) => onWhatsapp(e.target.value)} placeholder="(11) 98765-4321" autoComplete="off" />
                <p className={styles.hint}>Obrigatório · com DDD. É pra cá que o cliente chama no botão “falar com o gerente”.</p>
              </div>
            </div>
          </div>
          <input type="hidden" name="segment" value={segment} />
          <input type="hidden" name="color" value={color} />
          <div className={styles.actions}>
            <button type="submit" className={styles.btn} disabled={pending}>{pending ? 'Criando sua página…' : 'Criar minha página grátis →'}</button>
          </div>
        </form>
      </div>
      <div className={styles.colPreview}>
        <p className={styles.mirrorLabel}>Preview <b>ao vivo</b> — é a cara da sua página ✨</p>
        <div className={styles.preview}>
          <div className={styles.pvTop} style={{ background: color }}>
            <div className={styles.pvLogo} style={{ color: color }}>★</div>
            <div className={styles.pvName}>{name || 'Seu Negócio'}</div>
            <div className={styles.pvTag}>{tag}</div>
          </div>
          <div className={styles.pvBody}>
            <div className={styles.pvStars}>★★★★★</div>
            <div className={styles.pvQ}>Como foi sua experiência hoje?</div>
          </div>
        </div>
        <p className={styles.pvUrl}>clientescore.com.br/<b>{slug || 'seu-negocio'}</b></p>
      </div>
    </div>
  )
}