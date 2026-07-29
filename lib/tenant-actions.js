'use server'

import { createClient } from '@/lib/supabase/server'

// usada com useActionState → recebe 2 papéis (prev, formData). NÃO trocar pra 1 só.
export async function createTenant(_prev, formData) {
  const name = String(formData.get('name') || '').trim()
  const slug = String(formData.get('slug') || '').trim().toLowerCase()
  const segment = String(formData.get('segment') || 'outro')
  const color = String(formData.get('color') || '#0E3B2E')

  if (name.length < 2) return { error: 'Dê um nome pro seu negócio.' }
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug) || slug.length < 3)
    return { error: 'Endereço inválido. Use só letras minúsculas, números e -.' }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('create_my_tenant', {
    p_name: name, p_slug: slug, p_segment: segment, p_brand_color: color,
  })

  if (error) return { error: error.message }
  if (!data) return { error: 'Esse endereço já está em uso. Escolha outro.' }
  return { ok: true, slug, name, color }   // sem redirect: o cliente mostra a tela de "nasceu"
}