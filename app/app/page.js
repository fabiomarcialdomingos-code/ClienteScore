import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoLink from './LogoLink'
import ArtEngineClient from './ArtEngineClient'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/auth-actions'
import CountUp from './CountUp'
import PostsQueue from './PostsQueue'
import BeltSection from './BeltSection'
import ComunicadosSection from './ComunicadosSection'
import styles from './app.module.css'

export const metadata = { title: 'Meu painel · ClienteScore', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

function calcularMetricas(reviews, totalOptIns) {
  if (!reviews || reviews.length === 0) {
    return {
      total: 0, notaMedia: 0, nps: 0, promotores: 0, pctRecomendam: 0, pctNaoRecomendam: 0,
      estrelas: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }, maxEstrelas: 0,
      novosDesdeOntem: 0, reviews30Dias: 0, criticosMes: 0, optIns: totalOptIns || 0
    }
  }

  const agora = new Date()
  const ontem = new Date(agora.getTime() - 24 * 60 * 60 * 1000)
  const trintaDias = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000)

  const total = reviews.length
  let soma = 0, promotores = 0, detratores = 0, novosDesdeOntem = 0, reviews30Dias = 0, criticosMes = 0
  const estrelas = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

  reviews.forEach(r => {
    soma += r.rating
    estrelas[r.rating] = (estrelas[r.rating] || 0) + 1
    if (r.rating >= 4) promotores++
    if (r.rating <= 2) detratores++

    const dataReview = new Date(r.created_at)
    if (dataReview >= ontem) novosDesdeOntem++
    if (dataReview >= trintaDias) {
      reviews30Dias++
      if (r.rating < 4) criticosMes++
    }
  })

  return { 
    total, notaMedia: soma / total, nps: Math.round(((promotores - detratores) / total) * 100), 
    promotores, pctRecomendam: Math.round((promotores / total) * 100), pctNaoRecomendam: Math.round((detratores / total) * 100), 
    estrelas, maxEstrelas: Math.max(...Object.values(estrelas)), novosDesdeOntem, reviews30Dias, criticosMes, optIns: totalOptIns || 0
  }
}

function DashboardSkeleton() {
  return (
    <div style={{ padding: '40px 20px', opacity: 0.6, animation: 'pulse 1.5s infinite' }}>
      <div style={{ height: 40, width: 200, background: 'var(--gray-200)', borderRadius: 8 }} />
      <div style={{ height: 120, background: 'var(--gray-200)', borderRadius: 8, marginTop: 16 }} />
    </div>
  )
}

async function DashboardContent({ user, initial, first }) {
  const supabase = await createClient()

  let { data: tenants } = await supabase.from('tenants').select('*').eq('owner_id', user.id)
  if (!tenants || tenants.length === 0) {
    const { data: claimed } = await supabase.rpc('claim_orphan_tenant', { p_slug: 'figaro' })
    if (claimed) tenants = [claimed]
  }

  const tenant = (tenants || []).find((t) => t && t.slug) || null
  let queue = [], ultimasAvaliacoes = [], metricas = calcularMetricas([], 0)

  if (tenant) {
    // [ENG] Ajuste na query: trazemos dados extras (text, customer_name, phone) limitados aos 3 últimos para o feed
    const [postsFila, reviewsAll, countFeedbacks, reviewsFeed] = await Promise.all([
      supabase.from('posts').select('*, reviews()').eq('tenant_id', tenant.id).neq('status', 'published').order('created_at', { ascending: false }),
      supabase.from('reviews').select('rating, created_at').eq('tenant_id', tenant.id),
      supabase.from('feedbacks').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
      supabase.from('reviews').select('id, rating, text, customer_name, phone, created_at').eq('tenant_id', tenant.id).order('created_at', { ascending: false }).limit(3)
    ])

    queue = postsFila.data || []
    ultimasAvaliacoes = reviewsFeed.data || []
    metricas = calcularMetricas(reviewsAll.data || [], countFeedbacks.count || 0)
  }

  if (!tenant) {
    return (
      <div className={styles.empty}>
        <span className={styles.e}></span>
        <h4>Nenhuma página criada ainda</h4>
        <Link className={styles.btnA} href="/onboarding" style={{ marginTop: 18, display: 'inline-block' }}>Criar minha página →</Link>
      </div>
    )
  }

  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent('https://clientescore.com.br/' + tenant.slug)}&color=f5b841&bgcolor=0d1424`

  return (
    <>
      <div className={styles.greet} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>{first ? `Fala, ${first}!` : 'Olá!'} <span className={styles.wave}>👋</span></h1>
          <p>Visão geral de desempenho em <b>{tenant.name}</b></p>
        </div>
        
        {/* [UX/UI] Acesso rápido ao QR Code e Link - Saiu do rodapé, foi pro topo */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: 14, opacity: 0.8 }}>clientescore.com.br/{tenant.slug}</span>
          <a href={`/${tenant.slug}`} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', background: 'var(--brand)', color: '#000', borderRadius: 20, fontSize: 12, fontWeight: 'bold', textDecoration: 'none' }}>Ver Página</a>
          <a href={qr} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 20, fontSize: 12, textDecoration: 'none' }}>⬇ QR Code</a>
        </div>
      </div>

      {/* [CRO] ESTADO ZERO GAMIFICADO - Ativação do Lojista */}
      {metricas.total === 0 ? (
        <section style={{ padding: '40px', background: 'rgba(62, 207, 142, 0.05)', border: '1px dashed rgba(62, 207, 142, 0.4)', borderRadius: 12, textAlign: 'center', marginTop: 24, marginBottom: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
          <h2 style={{ marginBottom: 8 }}>Sua página está no ar! Vamos conseguir a 1ª avaliação?</h2>
          <p style={{ opacity: 0.8, maxWidth: 500, margin: '0 auto 24px' }}>Para ver suas métricas brilharem aqui, você precisa de dados. Siga os 3 passos para ativar seu painel:</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 8, width: 200, textAlign: 'left' }}>
              <b style={{ color: 'var(--brand)' }}>1.</b> Baixe o QR Code acima
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 8, width: 200, textAlign: 'left' }}>
              <b style={{ color: 'var(--brand)' }}>2.</b> Imprima ou deixe no balcão
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: 8, width: 200, textAlign: 'left' }}>
              <b style={{ color: 'var(--brand)' }}>3.</b> Peça para o próximo cliente testar
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* PLACAR PRINCIPAL */}
          <section className={styles.metrics} aria-label="Seu placar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 24 }}>
            {/* ... (Mesmo grid de 4 cards aprovados anteriormente) ... */}
            <div className={styles.m} style={{ padding: '20px' }}>
              <span className={styles.n}><CountUp value={metricas.total} /></span>
              <span className={styles.l}>avaliações no total</span>
              <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>↑ {metricas.novosDesdeOntem} desde ontem</div>
            </div>
            <div className={styles.m} style={{ padding: '20px' }}>
              <span className={styles.n}>{metricas.notaMedia.toFixed(1)}<span style={{ fontSize: '0.6em' }}>★</span></span>
              <span className={styles.l}>nota média</span>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>No último mês</div>
            </div>
            <div className={styles.m} style={{ padding: '20px' }}>
              <span className={styles.n}>{metricas.promotores}/{metricas.total}</span>
              <span className={styles.l}>recomendam (4-5★)</span>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>{metricas.pctRecomendam}% dos respondentes</div>
            </div>
            <div className={styles.m} style={{ padding: '20px' }}>
              <span className={styles.n}><CountUp value={metricas.optIns} /></span>
              <span className={styles.l}>clientes com opt-in</span>
              <div style={{ fontSize: 12, color: 'var(--brand)', marginTop: 8 }}>Base de contatos</div>
            </div>
          </section>

          {/* ALERTA CRÍTICO COM ÂNCORA FUNCIONAL */}
          {metricas.criticosMes > 0 && (
            <div style={{ padding: '16px 20px', borderRadius: 8, marginTop: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <span style={{ fontSize: 20 }}>🔴</span> 
              <div><b>Atenção:</b> {metricas.criticosMes} feedbacks críticos (≤ 3★) nos últimos 30 dias. <a href="#feed-recentes" style={{ color: '#ef4444', fontWeight: 600, textDecoration: 'underline' }}>Ver no histórico abaixo ↓</a></div>
            </div>
          )}

          {/* DISTRIBUIÇÃO + NOVO FEED RECENTES (Lado a Lado) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 40, marginTop: metricas.criticosMes > 0 ? 0 : 24 }}>
            
            <section className={styles.card} style={{ margin: 0 }}>
              <h3>📊 Detalhamento de Notas</h3>
              <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div><div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase' }}>Score NPS</div><div style={{ fontSize: 32, fontWeight: 800 }}>{metricas.nps}</div></div>
                  <div style={{ textAlign: 'right', fontSize: 14, color: 'var(--red)' }}>{metricas.pctNaoRecomendam}% Detratores</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[5, 4, 3, 2, 1].map(star => {
                  const pct = metricas.maxEstrelas > 0 ? (metricas.estrelas[star] / metricas.maxEstrelas) * 100 : 0;
                  return (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
                      <span style={{ width: 40, fontWeight: 600 }}>{star} ★</span>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: 12, borderRadius: 10, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: star >= 4 ? 'var(--brand)' : star === 3 ? '#fbbf24' : '#ef4444' }} /></div>
                      <span style={{ width: 30, textAlign: 'right', opacity: 0.8 }}>{metricas.estrelas[star]}</span>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* [UX] NOVO COMPONENTE: FEED DE AVALIAÇÕES RECENTES */}
            <section id="feed-recentes" className={styles.card} style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>🗣️ Últimos Feedbacks</h3>
                <Link href="/avaliacoes" style={{ fontSize: 12, color: 'var(--brand)', textDecoration: 'none' }}>Ver todos →</Link>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ultimasAvaliacoes.map(rev => (
                  <div key={rev.id} style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, borderLeft: `4px solid ${rev.rating >= 4 ? 'var(--brand)' : rev.rating === 3 ? '#fbbf24' : '#ef4444'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <strong style={{ fontSize: 13 }}>{rev.customer_name || 'Anônimo'}</strong>
                      <span style={{ fontSize: 12 }}>{rev.rating}★</span>
                    </div>
                    {rev.text && <p style={{ fontSize: 13, opacity: 0.8, margin: '4px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{rev.text}"</p>}
                    
                    {/* [AÇÃO] Ação de Retenção: Se for detrator e tiver telefone, cria atalho pro Zap */}
                    {rev.rating <= 3 && rev.phone && (
                      <a href={`https://wa.me/55${rev.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 8, fontSize: 11, padding: '4px 8px', background: '#25D366', color: '#000', borderRadius: 4, textDecoration: 'none', fontWeight: 'bold' }}>
                        Tentar reverter no WhatsApp
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>
        </>
      )}

      {/* COMPONENTES SECUNDÁRIOS */}
      <BeltSection tenant={tenant} labels={{ step4: "Na fila de envio" }} showEmptyActions={true} />
      
      <section id="fila" className={styles.queue} aria-label="Fila de posts" style={{ marginTop: 40 }}>
        <div className={styles.queueHead}>
          <h2 className={styles.queueTitle}>Fila de Posts (Instagram)</h2>
          <span className={styles.queuePill}>{queue.length} na fila</span>
        </div>
        <PostsQueue posts={queue} tenant={{ slug: tenant.slug, name: tenant.name, brand_color: tenant.brand_color }} requireText={true} />
      </section>

      <ComunicadosSection tenant={tenant} />
      <ArtEngineClient tenantId={tenant.id} tenant={{ slug: tenant.slug, name: tenant.name, brand_color: tenant.brand_color }} />
    </>
  )
}

export default async function AppPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const meta = user.user_metadata || {}
  const first = (meta.name || '').split(' ')[0] || (user.email ? user.email.split('@')[0] : '')
  const initial = (first[0] || '?').toUpperCase()

  return (
    <div className={styles.root}>
      <div className={styles.dots} />
      <div className={styles.glow} />
      <header className={styles.topbar}>
        <LogoLink />
        
        {/* [UX/UI] Menu de Navegação Básico (Antes só havia o botão Sair) */}
        <nav style={{ marginLeft: 32, display: 'flex', gap: 16 }}>
          <Link href="/dashboard" style={{ color: 'var(--brand)', textDecoration: 'none', fontSize: 14, fontWeight: 'bold' }}>Painel</Link>
          <Link href="/avaliacoes" style={{ color: 'var(--gray-400)', textDecoration: 'none', fontSize: 14 }}>Avaliações</Link>
          <Link href="/configuracoes" style={{ color: 'var(--gray-400)', textDecoration: 'none', fontSize: 14 }}>Ajustes</Link>
        </nav>

        <div className={styles.spacer} />
        
        <form action={logout}>
          <button type="submit" className={styles.logout}>Sair</button>
        </form>
        <div className={styles.avatar} title="Minha Conta">{initial}</div>
      </header>

      <main className={styles.shell}>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent user={user} initial={initial} first={first} />
        </Suspense>
      </main>
    </div>
  )
}