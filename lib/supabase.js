import { createClient } from '@supabase/supabase-js'

// Cliente "anon": serve pro servidor (ler a marca pública) e pro navegador.
// Quem protege os dados é o RLS, não esta chave — por isso ela pode ficar pública.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)