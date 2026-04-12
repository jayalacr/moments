import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { TEMPLATES } from '@/lib/templates';
import { Jost } from 'next/font/google';

// Siempre renderizar desde el servidor con datos frescos de Supabase
export const dynamic = 'force-dynamic';

const jost = Jost({ subsets: ['latin'], weight: ['300', '400'] });

interface Props {
  params: Promise<{ type: string; slug: string }>;
  searchParams: Promise<{ id?: string }>;
}

export async function generateMetadata({ params }: Pick<Props, 'params'>) {
  const { type, slug } = await params;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from('events')
    .select('title')
    .eq('event_type', type)
    .eq('slug', slug)
    .single();

  if (!event) return { title: 'Invitación — Moments' };
  return { title: event.title, description: `Estás invitado — ${event.title}` };
}

export default async function InvitacionPage({ params, searchParams }: Props) {
  const { type, slug } = await params;
  const { id: guestToken } = await searchParams;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from('events')
    .select('id, title, template_type, config, status')
    .eq('event_type', type)
    .eq('slug', slug)
    .single();

  if (!event) notFound();

  if (event.status !== 'published') {
    return (
      <div
        className={jost.className}
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8F3EC',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#C9A87C', textTransform: 'uppercase', marginBottom: '32px' }}>
          Moments
        </p>
        <div style={{ width: '40px', height: '1px', background: '#C9A87C', margin: '0 auto 32px' }} />
        <h1 style={{ fontSize: '26px', fontWeight: 300, color: '#1C1611', letterSpacing: '1px', marginBottom: '16px' }}>
          {event.title}
        </h1>
        <p style={{ fontSize: '13px', color: '#9C8E82', lineHeight: 1.8, maxWidth: '280px' }}>
          Esta invitación está siendo preparada.<br />Pronto estará lista.
        </p>
      </div>
    );
  }

  const entry = event.template_type ? TEMPLATES[event.template_type] : null;

  if (!entry) notFound();

  // Si hay token, resolver datos del invitado server-side
  let maxCompanions: number | undefined;
  let companionNames: string[] | undefined;
  let guestName: string | undefined;
  let hasExistingRsvp = false;

  if (guestToken) {
    const { data: guest } = await supabase
      .from('guests')
      .select('id, name, max_companions, companion_names')
      .eq('token', guestToken)
      .eq('event_id', event.id)
      .single();

    if (guest) {
      maxCompanions = guest.max_companions;
      companionNames = guest.companion_names ?? [];
      guestName = guest.name ?? undefined;

      const { data: existingRsvp } = await supabase
        .from('rsvps')
        .select('id')
        .eq('guest_id', guest.id)
        .maybeSingle();

      hasExistingRsvp = !!existingRsvp;
    }
  }

  const Template = entry.component;

  return (
    <Template
      config={event.config ?? {}}
      eventId={event.id}
      guestToken={guestToken}
      maxCompanions={maxCompanions}
      companionNames={companionNames}
      guestName={guestName}
      hasExistingRsvp={hasExistingRsvp}
    />
  );
}
