import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OnboardingForm from '../../components/features/OnboardingForm'
import styles from '../../styles/onboarding.module.css'

export const metadata = { title: 'Criar minha página · ClienteScore' }
export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // só considera "já dono de página" quem tem negócio COM endereço (pula oco)
  const { data: tenants } = await supabase.from('tenants').select('id,slug').eq('owner_id', user.id)
  if ((tenants || []).some((t) => t && t.slug)) redirect('/app')

  return (
    <div className={styles.root}>
      <div className={styles.dots} />
      <div className={styles.glow} />
      <div className={styles.shell}>
        <div className={styles.top}>
          <a className={styles.logo} href="/"><span className={styles.logoMark}>★</span><span>Cliente<span className={styles.amber}>Score</span></span></a>
          <span className={styles.crumb}>› criar minha página</span>
        </div>
        <OnboardingForm />
      </div>
    </div>
  )
}