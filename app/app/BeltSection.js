import { createClient } from '@/lib/supabase/server'
import ServiceBelt from './ServiceBelt'
import BeltControls from './BeltControls'
import styles from './app.module.css'

export const dynamic = 'force-dynamic'

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export default async function BeltSection({ tenant }) {
  const supabase = await createClient()
  const today = startOfToday()
  const [apptRes, custRes] = await Promise.all([
    supabase.from('appointments').select('*').eq('tenant_id', tenant.id).gte('created_at', today).order('created_at', { ascending: false }),
    supabase.from('customers').select('id,name,whatsapp').eq('tenant_id', tenant.id).order('name', { ascending: true }).limit(200),
  ])
  const items = apptRes.data || []
  const customers = custRes.data || []
  // cruza: quais tokens já viraram avaliação?
  const tokens = items.map((i) => i.token).filter(Boolean)
  let convertedSet = new Set()
  if (tokens.length) {
    const { data: revs } = await supabase
      .from('reviews')
      .select('invitation_token')
      .eq('tenant_id', tenant.id)
      .in('invitation_token', tokens)
    ;(revs || []).forEach((r) => r.invitation_token && convertedSet.add(r.invitation_token))
  }
  const delay = tenant.invite_delay_min || 60
  const paused = !!tenant.auto_paused
  return (
    <section id="esteira" className={styles.belt} aria-label="Esteira de atendimento">
      <div className={styles.beltHead}>
        <div>
          <h2 className={styles.beltTitle}>Esteira de atendimento <span className={styles.beltBeta}>diferencial</span></h2>
          <p className={styles.beltSub}>Dê o <b>✓</b> quando atender. O resto — o tempo, a mensagem, o lembrete — é com o ClienteScore.</p>
        </div>
      </div>
      <BeltControls tenantId={tenant.id} delay={delay} paused={paused} />
      <ServiceBelt
        items={items.map((i) => ({ ...i, converted: convertedSet.has(i.token) }))}
        customers={customers}
        tenant={{ id: tenant.id, name: tenant.name, slug: tenant.slug, brand_color: tenant.brand_color, paused }}
      />
    </section>
  )
}