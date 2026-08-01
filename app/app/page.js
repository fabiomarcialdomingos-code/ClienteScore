import { redirect } from 'next/navigation'
import Link from 'next/link' // P0-UX: links internos mesma-aba como <Link> = sem reload branco (mata a "câmera-lenta" do logo)
import ArtEngineClient from './ArtEngineClient'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/auth-actions'
import CountUp from './CountUp'
import PostsQueue from './PostsQueue'
import BeltSection from './BeltSection'
import ComunicadosSection from './ComunicadosSection'
import styles from './app.module.css'

export const metadata = { title: 'Meu painel · ClienteScore' }
// nome CORRETO da diretiva (era "dynamic_route", que o Next ignora → risco de cachear o placar entre donos)
export const dynamic = 'force-dynamic'

export default async function AppPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const meta = user.user_metadata || {}
  const first = (meta.name || '').split(' ')[0] || (user.email ? user.email.split('@')[0] : '')
  const initial = (first[0] || '?').toUpperCase()

  let { data: tenants } = await supabase.from('tenants').select('*').eq('owner_id', user.id)
  if (!tenants || tenants.length === 0) {
    const { data: claimed } = await supabase.rpc('claim_orphan_tenant', { p_slug: 'figaro' })
    if (claimed) tenants = [claimed]
  }
  // BLINDAGEM: só confia em negócio que TEM endereço (pula fantasmas sem slug)
  const tenant = (tenants || []).find((t) => t && t.slug) || null

  let counts = { reviews: 0, posts: 0, feedbacks: 0 }
  let queue = []
  if (tenant) {
    const [r, p, f, postsAll] = await Promise.all([
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
      supabase.from('feedbacks').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
      supabase.from('posts').select('*, reviews(*)').eq('tenant_id', tenant.id).order('created_at', { ascending: false }),
    ])
    counts = { reviews: r.count || 0, posts: p.count || 0, feedbacks: f.count || 0 }
    queue = (postsAll.data || []).filter((x) => x.status !== 'published')
  }

  const qr = tenant
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent('https://clientescore.com.br/' + tenant.slug)}&color=f5b841&bgcolor=0d1424`
    : ''

  return (
    <div className={styles.root}>
      <div className={styles.dots} />
      <div className={styles.glow} />
      <header className={styles.topbar}>
        <Link className={styles.logo} href="/app"><span className={styles.logoMark}>★</span><span>Cliente<span className={styles.amber}>Score</span></span></Link>
        <div className={styles.spacer} />
        {tenant ? <span className={styles.pill}>💈 {tenant.name}</span> : null}
        <form action={logout}>
          <button type="submit" className={styles.logout}>Sair</button>
        </form>
        <div className={styles.avatar}>{initial}</div>
      </header>
      <main className={styles.shell}>
        <div className={styles.greet}>
          <h1>{first ? `Fala, ${first}! ` : 'Olá! '}<span className={styles.wave}>👋</span><span className={styles.liveTag}><span className={styles.ld} />ao vivo</span></h1>
          <p>{tenant ? <>Este é o seu placar real, puxado do banco com a sua sessão. Cada elogio que entra <b>soma aqui</b>.</> : 'Você ainda não tem uma página. Crie a primeira em 1 minuto — o espelho te mostra como ela fica antes mesmo de existir.'}</p>
        </div>
        {!tenant ? (
          <div className={styles.empty}>
            <span className={styles.e}>🏪</span>
            <h4>Nenhuma página criada ainda</h4>
            <p>Quando você criar sua página, ela aparece aqui com o QR Code e o placar ao vivo.</p>
            <Link className={styles.btnA} href="/onboarding" style={{ marginTop: 18, display: 'inline-block' }}>Criar minha página →</Link>
          </div>
        ) : (
          <>
            <section className={styles.metrics} aria-label="Seu placar">
              <div className={styles.m}><span className={styles.n}><CountUp value={counts.reviews} /></span><span className={styles.l}>avaliações recebidas</span></div>
              <div className={styles.m}><span className={styles.n}><CountUp value={counts.posts} /></span><span className={styles.l}>posts gerados</span></div>
              <div className={styles.m}><span className={styles.n}><CountUp value={counts.feedbacks} /></span><span className={styles.l}>feedbacks privados</span></div>
            </section>
            <div className={styles.cols}>
              <section className={styles.card} aria-label="Sua página pública">
                <h3>🔗 Sua página de avaliação</h3>
                <div className={styles.pageRow}>
                  <img className={styles.qr} src={qr} alt={'QR Code da página ' + tenant.name} />
                  <div className={styles.pageInfo}>
                    <div className={styles.pageLink}>clientescore.com.br/{tenant.slug}</div>
                    <p className={styles.pageNote}>Imprima o QR, cole na mesa ou mande no WhatsApp. Cada estrela vira score.</p>
                    <div className={styles.btnRow}>
                      <a className={styles.btnA} href={`/${tenant.slug}`} target="_blank" rel="noopener">Abrir minha página →</a>
                      <a className={styles.btnB} href={`/${tenant.slug}?i=teste`} target="_blank" rel="noopener">Simular avaliação</a>
                    </div>
                  </div>
                </div>
              </section>
              <section className={styles.card} aria-label="Sua central">
                <h3>🧩 Sua central <small>— atalhos</small></h3>
                <div className={styles.soon}>
                  <a className={styles.soonItem} href="#comunicados" style={{ textDecoration: 'none' }}>
                    <span className={styles.ic}>📣</span>
                    <div><div className={styles.t}>Comunicados</div><div className={styles.d}>Promo, horário e status com arte pronta.</div></div>
                    <span className={styles.tag} style={{ background: 'rgba(62,207,142,.14)', color: 'var(--green)' }}>ativo ✓</span>
                  </a>
                </div>
              </section>
            </div>
            <section id="fila" className={styles.queue} aria-label="Fila de posts">
              <div className={styles.queueHead}>
                <h2 className={styles.queueTitle}>Fila de Posts</h2>
                <span className={styles.queuePill}>{queue.length} na fila</span>
              </div>
              <PostsQueue posts={queue} tenant={{ slug: tenant.slug, name: tenant.name, brand_color: tenant.brand_color }} />
            </section>
            <BeltSection tenant={tenant} />
            <ComunicadosSection tenant={tenant} />
            <ArtEngineClient tenantId={tenant.id} tenant={{ slug: tenant.slug, name: tenant.name, brand_color: tenant.brand_color }} />
          </>
        )}
      </main>
    </div>
  )
}