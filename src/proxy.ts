import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

const DEV_TUNNEL_DOMAINS = ['devtunnels.ms', 'ngrok.io', 'ngrok-free.app', 'loca.lt']
const SYSTEM_SUBDOMAINS = new Set(['www', 'admin', 'superadmin', 'api'])
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'moments-mx.com'

function isTunnelHost(host: string): boolean {
  return DEV_TUNNEL_DOMAINS.some(d => host.endsWith(d))
}

async function handleSubdomain(request: NextRequest, subdomain: string): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname

  // Skip non-page routes
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/superadmin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth')
  ) {
    return null
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: event } = await supabase
    .from('events')
    .select('event_type')
    .eq('subdomain', subdomain)
    .eq('status', 'published')
    .single()

  const url = request.nextUrl.clone()

  if (!event) {
    url.pathname = '/'
    return NextResponse.rewrite(url)
  }

  if (pathname === '/' || pathname === '') {
    url.pathname = `/${event.event_type}/${subdomain}`
    return NextResponse.rewrite(url)
  }

  return null
}

export default async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const host = hostname.replace(/:.*$/, '')

  // Fix CSRF para Server Actions desde dev tunnels.
  const xfh = request.headers.get('x-forwarded-host')
  if (xfh && isTunnelHost(xfh) && request.headers.has('next-action')) {
    const headers = new Headers(request.headers)
    headers.delete('x-forwarded-host')
    return NextResponse.next({ request: { headers } })
  }

  // Subdomain handling — runs before auth checks
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const subdomain = host.slice(0, host.length - ROOT_DOMAIN.length - 1)
    if (subdomain && !SYSTEM_SUBDOMAINS.has(subdomain)) {
      const response = await handleSubdomain(request, subdomain)
      if (response) return response
    }
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
    // Necesario para interceptar Server Actions desde dev tunnels y subdominios
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
