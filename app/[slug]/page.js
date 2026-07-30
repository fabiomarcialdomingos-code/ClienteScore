import { notFound } from 'next/navigation'
import { get_branding } from '@/lib/branding'
import ReviewClient from './ReviewClient'

// busca o negócio em tempo real (não cachear no build) — cache fino ajusta no deploy
export const dynamic = 'force-dynamic'

function shade(hex, p) {
  const n = parseInt(hex.slice(1), 16)
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const c = (v) => Math.max(0, Math.min(255, Math.round(v * (1 + p))))
  return '#' + ((1 << 24) + (c(r) << 16) + (c(g) << 8) + c(b)).toString(16).slice(1)
}

const SEGTAG = {
  barbearia: 'Barbearia clássica', estetica: 'Clínica de estética', petshop: 'O favorito do seu pet',
  consultorio: 'Consultório odontológico', restaurante: 'Restaurante de bairro', salao: 'Salão de beleza',
  servicos: 'Serviços locais', academia: 'Academia', outro: 'Negócio local',
}

// metadata também lê pelo ÚNICO ponto (get_branding) — sem consulta duplicada
export async function generateMetadata({ params }) {
  const { slug } = await params
  const data = await get_branding(slug)
  return {
    title: data ? `Avalie ${data.name} · ClienteScore` : 'Avalie · ClienteScore',
    description: data
      ? `Deixe sua avaliação da ${data.name} em segundos. Sua opinião vira o melhor marketing dela.`
      : 'Deixe sua avaliação em segundos.',
  }
}

export default async function ReviewPage({ params, searchParams }) {
  const { slug } = await params
  const sp = await searchParams

  // leitura pública da marca — allowlist de colunas, filtrado por slug (sem vazamento cruzado)
  const tenant = await get_branding(slug)
  if (!tenant) notFound()

  // a cor da marca vira variável CSS — o mesmo CSS serve qualquer negócio
  const brandStyle = {
    '--green': tenant.brand_color,
    '--green-deep': shade(tenant.brand_color, -0.55),
    '--green-soft': shade(tenant.brand_color, -0.2),
  }

  return (
    <div style={brandStyle}>
      <div className="df-stripes" />
      <div className="df-glow" />
      <ReviewClient
        tenant={{
          id: tenant.id,
          slug: tenant.slug,
          name: tenant.name,
          segment: tenant.segment,
          logo_url: tenant.logo_url,
          gmb_link: tenant.gmb_link,
        }}
        tag={SEGTAG[tenant.segment] || 'Negócio local'}
        invitationToken={sp.i || null}
      />
    </div>
  )
}