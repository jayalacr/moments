import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/resend';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  try {
    await sendWelcomeEmail(profile?.email ?? user.email!, profile?.full_name || 'Organizador');
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Error sending welcome email:', e);
    return NextResponse.json({ error: 'Error al enviar email' }, { status: 500 });
  }
}
