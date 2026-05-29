import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditarForm from '@/app/admin/editar/_components/EditarForm';

interface Props {
  params: Promise<{ eventId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('events').select('title').eq('id', eventId).single();
  return { title: `Editar | ${data?.title ?? 'Evento'}` };
}

export default async function EditarPage({ params }: Props) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'wedding-planner') {
    redirect(`/admin/eventos/${eventId}/invitados`);
  }

  const { data: event } = await supabase
    .from('events')
    .select('id, title, slug, plan, config')
    .eq('id', eventId)
    .single();

  if (!event) redirect('/admin');

  return (
    <div className="admin-editar-container">
      <style>{`
        .admin-editar-container {
          padding: 40px 48px;
          max-width: 760px;
        }
        @media (max-width: 768px) {
          .admin-editar-container {
            padding: 24px 20px;
          }
        }
      `}</style>
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A87C', marginBottom: '8px' }}>
          Editando invitación
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
        plan={event.plan as 'essential' | 'plus' | 'deluxe'}
      />
    </div>
  );
}
