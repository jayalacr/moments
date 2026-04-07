import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Si viene de una invitación → ir a setup-password
      if (type === 'invite') {
        return NextResponse.redirect(new URL('/setup-password', origin))
      }
      // Login normal → dejar que el middleware redirija según rol
      return NextResponse.redirect(new URL('/admin', origin))
    }
  }

  return NextResponse.redirect(new URL('/login?error=invalid_link', origin))
}
