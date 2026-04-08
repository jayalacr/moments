import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditarForm from './_components/EditarForm';

export default async function EditarPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: event } = await supabase
    .from('events')
    .select('id, title, slug, config')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!event) redirect('/admin');

  return (
    <div style={{ padding: '40px 48px', maxWidth: '760px' }}>
      {/* Header */}
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

      <EditarForm eventId={event.id} eventSlug={event.slug} initialConfig={event.config ?? {}} />
    </div>
  );
}
