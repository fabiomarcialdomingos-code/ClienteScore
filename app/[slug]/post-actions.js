'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function markPublished(id) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('posts')
    .update({ status: 'published', published_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/app')
  return { ok: true }
}

export async function markScheduled(id, when) {
  if (!when) return { ok: false, error: 'Escolha uma data e hora.' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('posts')
    .update({ status: 'scheduled', scheduled_for: new Date(when).toISOString() })
    .eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/app')
  return { ok: true }
}