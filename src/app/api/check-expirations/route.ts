import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendExpirationWarningEmail } from '@/lib/resend';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: events, error } = await supabase
    .from('events')
    .select(`
      id,
      title,
      slug,
      expires_at,
      owner_id,
      profiles!events_owner_id_fkey (
        full_name
      )
    `)
    .eq('status', 'published')
    .is('expiration_notified_at', null)
    .gte('expires_at', now.toISOString())
    .lte('expires_at', in7Days.toISOString());

  if (error) {
    console.error('Error fetching expiring events:', error);
    return NextResponse.json({ error: 'Error al consultar eventos' }, { status: 500 });
  }

  if (!events || events.length === 0) {
    return NextResponse.json({ ok: true, notified: 0 });
  }

  let superadminEmail = process.env.SUPERADMIN_EMAIL;

  if (!superadminEmail) {
    const { data: superadmin } = await supabase
      .from('profiles')
      .select('email')
      .eq('role', 'superadmin')
      .limit(1)
      .single();
    superadminEmail = superadmin?.email;
  }

  if (!superadminEmail) {
    return NextResponse.json({ error: 'No se encontró email del superadmin' }, { status: 500 });
  }

  const results: { id: string; title: string; sent: boolean }[] = [];

  for (const event of events) {
    const profile = Array.isArray(event.profiles) ? event.profiles[0] : event.profiles;
    const organizerName = (profile as { full_name?: string } | null)?.full_name ?? 'Sin nombre';

    try {
      await sendExpirationWarningEmail({
        to: superadminEmail,
        eventTitle: event.title,
        eventSlug: event.slug,
        eventId: event.id,
        expiresAt: new Date(event.expires_at),
        organizerName,
      });

      await supabase
        .from('events')
        .update({ expiration_notified_at: new Date().toISOString() })
        .eq('id', event.id);

      results.push({ id: event.id, title: event.title, sent: true });
    } catch (e) {
      console.error(`Error notifying event ${event.id}:`, e);
      results.push({ id: event.id, title: event.title, sent: false });
    }
  }

  return NextResponse.json({ ok: true, notified: results.filter(r => r.sent).length, results });
}
