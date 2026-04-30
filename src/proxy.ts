import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const DEV_TUNNEL_DOMAINS = ['devtunnels.ms', 'ngrok.io', 'ngrok-free.app', 'loca.lt']

function isTunnelHost(host: string): boolean {
  return DEV_TUNNEL_DOMAINS.some(d => host.endsWith(d))
}

export default async function proxy(request: NextRequest) {
  // Fix CSRF para Server Actions desde dev tunnels.
  // El tunnel reescribe origin → localhost:3000 pero mantiene x-forwarded-host → tunnel.domain.
  // Next.js compara ambos y falla. Solución: eliminar x-forwarded-host para que
  // Next.js use el header `host` (localhost:3000), que sí coincide con el origin reescrito.
  const xfh = request.headers.get('x-forwarded-host')
  if (xfh && isTunnelHost(xfh) && request.headers.has('next-action')) {
    const headers = new Headers(request.headers)
    headers.delete('x-forwarded-host')
    return NextResponse.next({ request: { headers } })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // No hay sesión → proteger /admin y /superadmin
  if (!user) {
    if (path.startsWith('/admin') || path.startsWith('/superadmin')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return supabaseResponse
  }

  // Hay sesión → obtener rol
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  // Si ya tiene sesión y va a /login → redirigir al panel correspondiente
  if (path === '/login') {
    const dest = role === 'superadmin' ? '/superadmin' : '/admin'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // Organizador intentando acceder a /superadmin → redirigir a /admin
  if (path.startsWith('/superadmin') && role !== 'superadmin') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/superadmin/:path*',
    '/login',
    // Necesario para interceptar Server Actions desde dev tunnels
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
