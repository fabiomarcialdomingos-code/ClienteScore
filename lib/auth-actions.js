'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// traduz o "supababês" dos erros pra gente
function friendly(msg) {
  const m = (msg || '').toLowerCase()
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (m.includes('user already registered')) return 'Já existe uma conta com este e-mail.'
  if (m.includes('password should be at least')) return 'A senha precisa de pelo menos 6 caracteres.'
  if (m.includes('rate limit')) return 'Muitas tentativas. Espere um pouco e tente de novo.'
  return msg || 'Não foi possível completar. Tente de novo.'
}

export async function login(_prev, formData) {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  if (!email || !password) return { error: 'Preencha e-mail e senha.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: friendly(error.message) }

  redirect('/app')
}

export async function signup(_prev, formData) {
  const name = String(formData.get('name') || '').trim()
  const business = String(formData.get('business') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  if (!name || !business || !email) return { error: 'Preencha nome, negócio e e-mail.' }
  if (password.length < 6) return { error: 'A senha precisa de pelo menos 6 caracteres.' }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, business } },
  })
  if (error) return { error: friendly(error.message) }

  // se o Supabase pedir confirmação de e-mail, não há sessão ainda
  if (!data.session) return { needConfirm: true }

  redirect('/app')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}