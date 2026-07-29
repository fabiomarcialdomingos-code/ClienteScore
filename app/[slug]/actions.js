'use server'

import { supabase } from '@/lib/supabase'

export async function saveReview({ slug, rating, text, name, consent, optin, phone, invitationToken }) {
  const { data: tenant } = await supabase.from('tenant_branding').select('id').eq('slug', slug).maybeSingle()
  if (!tenant) return { ok: false, error: 'Negócio não encontrado.' }

  const { error } = await supabase.from('reviews').insert({
    tenant_id: tenant.id,
    rating: Number(rating),
    text: String(text || '').trim(),
    customer_name: name ? String(name).trim() : null,
    consent: !!consent,
    opt_in: !!optin,
    whatsapp: phone ? String(phone).replace(/\D/g, '') : null,
    invitation_token: invitationToken || null,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function saveFeedback({ slug, rating, text, name, phone }) {
  const { data: tenant } = await supabase.from('tenant_branding').select('id').eq('slug', slug).maybeSingle()
  if (!tenant) return { ok: false, error: 'Negócio não encontrado.' }

  const { error } = await supabase.from('feedbacks').insert({
    tenant_id: tenant.id,
    rating: Number(rating),
    text: String(text || '').trim(),
    customer_name: name ? String(name).trim() : null,
    whatsapp: phone ? String(phone).replace(/\D/g, '') : null,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}