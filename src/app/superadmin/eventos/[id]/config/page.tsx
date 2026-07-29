import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import EditarForm from '@/app/admin/editar/_components/EditarForm';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('events').select('title').eq('id', id).single();
  return { title: `Configuración | ${data?.title ?? 'Evento'}` };
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
    .select('id, title, slug, plan, config, rsvp_deadline')
    .eq('id', id)
    .single();

  if (!event) redirect('/superadmin');

  return (
    <div className="sa-config-container">
      <style>{`
        .sa-config-container {
          padding: 40px 48px;
          width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .sa-config-container { padding: 24px 20px; }
        }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <Link href="/superadmin" style={{ fontSize: '11px', color: '#9C8E82', textDecoration: 'none' }}>
          Eventos
        </Link>
        <span style={{ fontSize: '11px', color: '#C5B9B0' }}>/</span>
        <Link href={`/superadmin/eventos/${id}`} style={{ fontSize: '11px', color: '#9C8E82', textDecoration: 'none' }}>
          {event.slug}
        </Link>
        <span style={{ fontSize: '11px', color: '#C5B9B0' }}>/</span>
        <span style={{ fontSize: '11px', color: '#C9A87C' }}>Datos</span>
      </div>

      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A87C', marginBottom: '8px' }}>
          Editando contenido
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '32px',
            fontWeight: 300,
            fontStyle: 'italic',
            color: '#1C1611',
            lineHeight: 1.1,
          }}
        >
          {event.title}
        </h1>
      </div>

      <EditarForm
        eventId={event.id}
        eventSlug={event.slug}
        initialConfig={event.config ?? {}}
        initialRsvpDeadline={event.rsvp_deadline}
        plan={event.plan as 'essential' | 'plus' | 'deluxe'}
      />
    </div>
  );
}
