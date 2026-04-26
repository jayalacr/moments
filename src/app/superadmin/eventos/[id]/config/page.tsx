import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import EditarForm from '@/app/admin/editar/_components/EditarForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventoConfigPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'superadmin') redirect('/admin');

  const { data: event } = await supabase
    .from('events')
    .select('id, title, slug, plan, config')
    .eq('id', id)
    .single();

  if (!event) redirect('/superadmin');

  return (
    <div style={{ padding: '32px 40px', maxWidth: '760px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <Link href="/superadmin" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#7A90A8', textDecoration: 'none' }}>
          /eventos
        </Link>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#7A90A8' }}>/</span>
        <Link href={`/superadmin/eventos/${id}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#7A90A8', textDecoration: 'none' }}>
          {event.slug}
        </Link>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#7A90A8' }}>/</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#2DD4BF' }}>config</span>
      </div>

      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '3px', color: '#7A90A8', marginBottom: '8px' }}>
          EDITANDO CONTENIDO
        </p>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 400, color: '#EAF0FB' }}>
          {event.title}
        </h1>
      </div>

      <EditarForm
        eventId={event.id}
        eventSlug={event.slug}
        initialConfig={event.config ?? {}}
        plan={event.plan as 'essential' | 'plus' | 'deluxe'}
        theme="dark"
      />
    </div>
  );
}
