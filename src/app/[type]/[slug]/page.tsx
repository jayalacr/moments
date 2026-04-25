import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { TEMPLATES } from '@/lib/templates';
import { Jost } from 'next/font/google';
import { decodePasses } from '@/lib/rsvp-utils';

export const revalidate = 86400;

const jost = Jost({ subsets: ['latin'], weight: ['300', '400'] });

interface Props {
  params: Promise<{ type: string; slug: string }>;
  searchParams: Promise<{ id?: string; p?: string }>;
}

export async function generateMetadata({ params }: Pick<Props, 'params'>) {
  const { type, slug } = await params;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from('events')
    .select('title, config')
    .eq('event_type', type)
    .eq('slug', slug)
    .single();

  if (!event) return { title: 'Invitación — Moments' };

  const config = event.config || {};
  // Extraer imagen para el preview (Open Graph)
  // Intentar con el nuevo modelo de photos primero, luego con images[]
  const photos = config.photos as any[];
  const heroUrl = photos?.find(p => p.role === 'hero')?.url 
               || config.images?.[0] 
               || 'https://moments.events/og-default.jpg'; // Fallback a una imagen de marca

  const title = event.title;
  const description = `Estás invitado a celebrar con nosotros. Mira los detalles de: ${title}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{ url: heroUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [heroUrl],
    },
  };
}

export default async function InvitacionPage({ params, searchParams }: Props) {
  const { type, slug } = await params;
  const { id: guestToken, p: passesCode } = await searchParams;
  const supabase = createAdminClient();

  const { data: event } = await supabase
    .from('events')
    .select('id, title, template_type, config, status, payment_status, expires_at')
    .eq('event_type', type)
    .eq('slug', slug)
    .single();

  if (!event) notFound();

  const NotReady = ({ message }: { message: string }) => (
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
      <p style={{ fontSize: '18px', letterSpacing: '4px', color: '#C9A87C', marginBottom: '32px' }}>
        moments
      </p>
      <div style={{ width: '40px', height: '1px', background: '#C9A87C', margin: '0 auto 32px' }} />
      <h1 style={{ fontSize: '26px', fontWeight: 300, color: '#1C1611', letterSpacing: '1px', marginBottom: '16px' }}>
        {event.title}
      </h1>
      <p style={{ fontSize: '13px', color: '#9C8E82', lineHeight: 1.8, maxWidth: '280px' }}>
        {message}
      </p>
    </div>
  );

  if (event.status !== 'published') {
    return <NotReady message={'Esta invitación está siendo preparada.\nPronto estará lista.'} />;
  }

  if (event.payment_status !== 'paid') {
    return <NotReady message={'Esta invitación está en preparación.\nPronto estará disponible.'} />;
  }

  if (event.expires_at && new Date() > new Date(event.expires_at)) {
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
        <p style={{ fontSize: '18px', letterSpacing: '4px', color: '#C9A87C', marginBottom: '32px' }}>
          moments
        </p>
        <div style={{ width: '40px', height: '1px', background: '#C9A87C', margin: '0 auto 32px' }} />
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(22px, 5vw, 32px)',
            fontWeight: 300,
            color: '#1C1611',
            letterSpacing: '1px',
            marginBottom: '16px',
            lineHeight: 1.3,
            maxWidth: '320px',
          }}
        >
          Esta invitación ya no está disponible
        </h1>
        <div style={{ width: '24px', height: '1px', background: '#C9A87C', margin: '0 auto 24px' }} />
        <p style={{ fontSize: '13px', color: '#9C8E82', lineHeight: 1.8, marginBottom: '40px' }}>
          ¿Quieres crear la tuya?
        </p>
        <a
          href="http://localhost:3000/planes"
          style={{
            display: 'inline-block',
            padding: '12px 32px',
            border: '1px solid #C9A87C',
            color: '#C9A87C',
            fontSize: '13px',
            letterSpacing: '3px',
            textDecoration: 'none',
          }}
        >
          Visita moments.mx
        </a>
      </div>
    );
  }

  const entry = event.template_type ? TEMPLATES[event.template_type] : null;

  if (!entry) notFound();

  // Si hay token, resolver datos del invitado server-side
  let maxCompanions: number = 0;
  let companionNames: string[] | undefined;
  let guestName: string | undefined;
  let hasExistingRsvp = false;
  let invalidToken = false;

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
    } else {
      invalidToken = true;
    }
  } else if (passesCode) {
    const decoded = decodePasses(passesCode);
    if (decoded !== null) {
      maxCompanions = decoded;
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
      invalidToken={invalidToken}
    />
  );
}
