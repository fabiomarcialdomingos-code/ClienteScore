import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// O PORTEIRO: roda antes de cada rota listada no matcher (lá embaixo).
// 1) refresca a sessão do cookie; 2) se a rota é da sala (/app) e não
// tem dono logado → manda pro login; 3) se está logado e caiu no
// /login → empurra pra dentro da sala.
export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() é o que força o refresh do cookie (sem ele, o porteiro fica cego)
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (pathname.startsWith('/app') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/app'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

// só vigia estas rotas (o resto — landing e /[slug] — passa direto, sem overhead)
export const config = {
  matcher: ['/login', '/app', '/app/:path*'],
}