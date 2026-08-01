// lib/branding.js
// Leitura PÚBLICA da marca de um negócio, pelo slug.
// ÚNICO ponto por onde a vitrine /slug enxerga o tenant.
//
// Por que existe (#6 do cinturão, lido do código):
//  - o page.js fazia select('') → puxava a linha inteira. Aqui listamos
//    SÓ o que a vitrine usa (allowlist). Se amanhã alguém pôr coluna
//    sensível na tabela, a vitrine NÃO vaza — o filtro tá aqui, não no ''.
//  - tira a duplicação (a mesma consulta aparecia 2x no page.js).
//
// Não é server action (sem 'use server'): é helper de leitura, chamado por
// server component / generateMetadata. Usa o mesmo cliente anon que o
// page.js já usa (a leitura é pública via RLS).
import { supabase } from '@/lib/supabase'

const PUBLIC_COLUMNS = 'id, slug, name, segment, logo_url, gmb_link, brand_color, whatsapp'

export async function get_branding(slug) {
  if (!slug || typeof slug !== 'string') return null

  const { data, error } = await supabase
    .from('tenant_branding')
    .select(PUBLIC_COLUMNS)
    .eq('slug', slug.trim().toLowerCase())
    .maybeSingle()

  if (error) throw error   // não engole erro: propaga igual o page.js fazia hoje
  return data || null
}