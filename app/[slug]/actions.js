'use server'
import { supabase } from '@/lib/supabase'

// ── disparo do opt-in (card #4) ───────────────────────────────────────
// Nome EXATO do template aprovado na Meta (sem espaço, minúsculo, como foi criado).
// Se o log reclamar de "template not found / not approved", troque este valor
// pelo nome que aparece aprovado no seu Gerenciador do WhatsApp.
const TEMPLATE_OPTIN = 'registro_contato_confirmado'
// Versão da Graph API. v21.0 é estável; suba (v22.0, v23.0…) se a Meta pedir.
const META_API_VERSION = 'v21.0'

// Normaliza o número pro formato que a Meta exige (internacional, sem '+').
// O cliente brasileiro digita DDD+número; aqui garantimos o '55' na frente.
function toIntlPhone(phone) {
  const d = String(phone || '').replace(/\D/g, '')
  if (!d) return null
  return d.startsWith('55') ? d : '55' + d
}

// Registra/atualiza o cliente em `customers` (opt-in + número).
// Best-effort: se falhar, loga e NÃO afeta o retorno do review.
async function tryUpsertCustomer({ tenantId, name, phone, source }) {
  try {
    const to = toIntlPhone(phone)
    if (!to) return
    const { error } = await supabase.rpc('upsert_customer', {
      p_tenant_id: tenantId,
      p_name: name ? String(name).trim() || null : null,
      p_whatsapp: to,
      p_opt_in: true,
      p_source: source,
    })
    if (error) console.error('[wa] erro no upsert_customer:', error.message)
  } catch (e) {
    console.error('[wa] exceção no upsert_customer:', e && e.message ? e.message : e)
  }
}

// Envia o template de confirmação do canal (card #4) pro número do cliente.
// Best-effort: qualquer falha (token, phone id, template, rede) vira log,
// nunca exceção — o review já está salvo quando chegamos aqui.
async function trySendOptinConfirmation({ slug, tenantName, customerName, phone }) {
  try {
    const token = process.env.META_ACCESS_TOKEN
    if (!token) { console.error('[wa] META_ACCESS_TOKEN não configurado — pulando disparo do opt-in'); return }
    const to = toIntlPhone(phone)
    if (!to) { console.error('[wa] phone inválido — pulando disparo do opt-in'); return }

    const { data: phoneId, error: rpcErr } = await supabase.rpc('get_tenant_wa_phone', { p_slug: slug })
    if (rpcErr) { console.error('[wa] erro ao ler wa_phone_number_id:', rpcErr.message); return }
    if (!phoneId) { console.error('[wa] tenant sem wa_phone_number_id — pulando disparo (slug=' + slug + ')'); return }

    const body = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: TEMPLATE_OPTIN,
        language: { code: 'pt_BR' },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: customerName ? String(customerName).trim() || 'Cliente' : 'Cliente' },
            { type: 'text', text: tenantName || '' },
          ],
        }],
      },
    }

    const res = await fetch('https://graph.facebook.com/' + META_API_VERSION + '/' + phoneId + '/messages', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.error('[wa] Meta respondeu ' + res.status + ':', txt)
      return
    }
    console.log('[wa] opt-in confirmation enviada para ' + to)
  } catch (e) {
    console.error('[wa] exceção no disparo do opt-in:', e && e.message ? e.message : e)
  }
}

// ── server actions ────────────────────────────────────────────────────
export async function saveReview({ slug, rating, text, name, consent, optin, phone, invitationToken }) {
  const { data: tenant } = await supabase
    .from('tenant_branding')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle()
  if (!tenant) return { ok: false, error: 'Negócio não encontrado.' }

  // 1) o review grava PRIMEIRO — é o dado principal e o único que o cliente vê
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

  // 2) efeitos colaterais do opt-in — NUNCA quebram o retorno acima
  if (optin && phone) {
    await tryUpsertCustomer({ tenantId: tenant.id, name, phone, source: 'review_form' })
    await trySendOptinConfirmation({ slug, tenantName: tenant.name, customerName: name, phone })
  }

  return { ok: true }
}

export async function saveFeedback({ slug, rating, text, name, phone }) {
  const { data: tenant } = await supabase
    .from('tenant_branding')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
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