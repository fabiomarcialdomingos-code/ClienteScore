import { createClient } from '@/lib/supabase/server'
import ComunicadosComposer from './ComunicadosComposer'
import styles from './app.module.css'

export const dynamic = 'force-dynamic'

export default async function ComunicadosSection({ tenant }) {
  const supabase = await createClient()
  let list = []
  let optIn = 0
  let dbOk = true
  try {
    const [comRes, custRes] = await Promise.all([
      supabase.from('comunicados').select('*').eq('tenant_id', tenant.id).order('created_at', { ascending: false }),
      supabase.from('customers').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id).eq('opt_in', true),
    ])
    list = comRes.data || []
    optIn = custRes.count || 0
  } catch (e) {
    dbOk = false // tabela ainda não existe? o /app NÃO cai; o composer avisa.
  }

  const pub = list.filter((c) => c.status === 'published')

  return (
    <section id="comunicados" className={styles.comSection} aria-label="Comunicados">
      <div className={styles.comHead}>
        <h2 className={styles.comTitle}>Comunicados <span className={styles.comBeta}>arte pronta</span></h2>
        <p className={styles.comSub}>Promoção, horário, aberto ou fechado — escolha o modelo e a arte sai pronta com a sua marca. Publique no seu canal em 1 toque; o histórico fica salvo.</p>
      </div>

      <div className={styles.comStatline}>
        <div className={styles.comStat}><b>{optIn}</b><span>clientes c/ opt-in</span></div>
        <div className={styles.comStat}><b>{pub.length}</b><span>comunicados publicados</span></div>
        <div className={styles.comStat}><b style={{ color: 'var(--green)' }}>✓</b><span>100% LGPD</span></div>
      </div>

      {!dbOk ? (
        <div className={styles.comEmpty2}><span className={styles.e}>🛠️</span><p>Rode o SQL dos comunicados no Supabase (o <code>create table public.comunicados</code>) e recarregue — a gaveta ainda não existe.</p></div>
      ) : (
        <ComunicadosComposer
          tenant={{ id: tenant.id, name: tenant.name, slug: tenant.slug, brand_color: tenant.brand_color }}
          history={pub}
        />
      )}
    </section>
  )
}