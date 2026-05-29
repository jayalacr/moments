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
    .select('id, title, slug, plan, config, subdomain')
    .eq('id', id)
    .single();

  if (!event) redirect('/superadmin');

  return (
    <div style={{ padding: '40px 48px', maxWidth: '760px' }}>
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#2DD4BF', marginBottom: '8px' }}>
          Editando invitación
        </p>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 400,
            color: '#EAF0FB',
            lineHeight: 1.2,
          }}
        >
          {event.title}
        </h1>
      </div>

      <SubdomainForm
        eventId={event.id}
        currentSubdomain={event.subdomain ?? event.slug}
      />

      <div style={{ margin: '40px 0', height: '1px', backgroundColor: '#222D3F' }} />

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
