import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('health_checks')
    .upsert(
      { id: 1, pinged_at: new Date().toISOString() },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Keep-alive ping failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Error al hacer ping' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    pinged_at: new Date().toISOString(),
  });
}
