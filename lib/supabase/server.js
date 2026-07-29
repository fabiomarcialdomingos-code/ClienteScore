import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cliente "com cookie": só o servidor usa. Ele lê a sessão do dono
// direto do cookie — por isso server components e server actions
// sabem QUEM está logado (e o RLS deixa esse dono ler só os dados dele).
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (e) {
            // em server component o cookie não pode ser escrito; tudo bem,
            // o middleware cuida do refresh nas rotas protegidas.
          }
        },
      },
    }
  )
}