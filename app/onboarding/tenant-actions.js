'use server'
import { createClient } from '@/lib/supabase/server'

// usada com useActionState → recebe 2 papéis (prev, formData). NÃO trocar pra 1 só.
export async function createTenant(_prev, formData) {
  const name = String(formData.get('name') || '').trim()
  const slug = String(formData.get('slug') || '').trim().toLowerCase()
  const segment = String(formData.get('segment') || 'outro')
  const color = String(formData.get('color') || '#0E3B2E')

  // P4: zap do dono (obrigatório). Vem mascarado do form; aqui só os dígitos.
  const waRaw = String(formData.get('whatsapp') || '').replace(/\D/g, '')
  // canônico com 55: o botão "falar com o gerente" monta wa.me/55… — sem 55 o link quebra.
  const whatsapp = waRaw.length >= 10 && waRaw.length <= 11 ? '55' + waRaw : ''

  if (name.length < 2) return { error: 'Dê um nome pro seu negócio.' }
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug) || slug.length < 3)
    return { error: 'Endereço inválido. Use só letras minúsculas, números e -.' }
  if (!whatsapp) return { error: 'Informe o WhatsApp do negócio com DDD (só os números).' }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('create_my_tenant', {
    p_name: name, p_slug: slug, p_segment: segment, p_brand_color: color, p_whatsapp: whatsapp,
  })
  if (error) return { error: error.message }
  if (!data) return { error: 'Esse endereço já está em uso. Escolha outro.' }
  return { ok: true, slug, name, color }   // sem redirect: o cliente mostra a tela de "nasceu"
}