import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditarForm from '@/app/admin/editar/_components/EditarForm';

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function EditarPage({ params }: Props) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: event } = await supabase
    .from('events')
    .select('id, title, slug, plan, config')
    .eq('id', eventId)
    .eq('owner_id', user.id)
    .single();

  if (!event) redirect('/admin');

  return (
    <div className="admin-page-container">
      <style>{`
        .admin-page-container {
          padding: 40px 48px;
          max-width: 760px;
        }
        @media (max-width: 768px) {
          .admin-page-container {
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
