import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import EditarForm from '@/app/admin/editar/_components/EditarForm';
import SubdomainForm from './_components/SubdomainForm';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('events').select('title').eq('id', id).single();
  return { title: `Editar | ${data?.title ?? 'Evento'}` };
}

export default async function SuperadminEditarPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'superadmin') redirect('/admin');

  const { data: event } = await supabase
    .from('events')
    .select('id, title, slug, plan, config, subdomain, rsvp_deadline')
    .eq('id', id)
    .single();

  if (!event) redirect('/superadmin');

  return (
    <div className="sa-editar-container">
      <style>{`
        .sa-editar-container {
          padding: 40px 48px;
          width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .sa-editar-container { padding: 24px 20px; }
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

      <SubdomainForm
        eventId={event.id}
        currentSubdomain={event.subdomain ?? event.slug}
      />

      <div style={{ margin: '40px 0', height: '1px', backgroundColor: '#EDE5D8' }} />

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
