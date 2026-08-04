'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// usada DIRETO como action={...} → o form entrega 1 papel só (formData)
export async function addAppointment(formData) {
  const supabase = await createClient()
  const tenantId = String(formData.get('tenantId') || '')
  const name = String(formData.get('name') || '').trim()
  const phone = String(formData.get('phone') || '').replace(/\D/g, '')
  const custIdRaw = String(formData.get('customerId') || '')
  if (!tenantId || !name) return { ok: false, error: 'Informe o nome do cliente.' }

  // se não veio do cadastro, cria/liga o customer pelo whatsapp
  let customerId = custIdRaw || null
  if (!customerId && phone) {
    const { data: up } = await supabase
      .from('customers')
      .upsert({ tenant_id: tenantId, name, whatsapp: phone, opt_in: true, source: 'agenda' }, { onConflict: 'tenant_id,whatsapp' })
      .select('id')
      .single()
    customerId = up ? up.id : null
  }

  const { error } = await supabase.from('appointments').insert({
    tenant_id: tenantId,
    customer_id: customerId || null,
    customer_name: name,
    whatsapp: phone || null,
    scheduled_at: new Date().toISOString(),
    status: 'scheduled',
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/app')
  return { ok: true }
}

// chamadas "na mão" pelo tick / pelo botão → recebem o id direto
export async function serveTick(id) {
  const supabase = await createClient()
  const { data: appt } = await supabase.from('appointments').select('tenant_id, served_at').eq('id', id).maybeSingle()
  if (!appt || appt.served_at) { revalidatePath('/app'); return { ok: true } }
  const { data: tenant } = await supabase.from('tenants').select('invite_delay_min').eq('id', appt.tenant_id).maybeSingle()
  const delayMin = (tenant && tenant.invite_delay_min) || 60
  const fire = new Date(Date.now() + delayMin * 60000).toISOString()
  const { error } = await supabase
    .from('appointments')
    .update({ served_at: new Date().toISOString(), invite_fire_at: fire, status: 'served' })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/app')
  return { ok: true }
}

export async function sendInvite(id) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('appointments')
    .update({ invite_sent_at: new Date().toISOString(), status: 'invited', invite_channel: 'one_tap' })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/app')
  return { ok: true }
}

// usadas DIRETO como action={...} → 1 papel só
export async function setDelay(formData) {
  const supabase = await createClient()
  const tenantId = String(formData.get('tenantId') || '')
  const minutes = parseInt(String(formData.get('minutes') || '60'), 10)
  if (!tenantId || !minutes) return { ok: false }
  await supabase.rpc('set_invite_prefs', { p_tenant: tenantId, p_delay: minutes, p_paused: null })
  revalidatePath('/app')
  return { ok: true }
}

export async function togglePause(formData) {
  const supabase = await createClient()
  const tenantId = String(formData.get('tenantId') || '')
  const paused = String(formData.get('paused') || 'false') === 'true'
  if (!tenantId) return { ok: false }
  await supabase.rpc('set_invite_prefs', { p_tenant: tenantId, p_delay: null, p_paused: paused })
  revalidatePath('/app')
  return { ok: true }
}