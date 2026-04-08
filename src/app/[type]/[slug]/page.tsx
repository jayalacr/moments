import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { TEMPLATES } from '@/lib/templates';
import { Jost } from 'next/font/google';

const jost = Jost({ subsets: ['latin'], weight: ['300', '400'] });

interface Props {
  params: Promise<{ type: string; slug: string }>;
}

export async function generateMetadata({ params }: Props) {
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

export default async function InvitacionPage({ params }: Props) {
  const { type, slug } = await params;
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

  const Template = entry.component;

  return <Template config={event.config ?? {}} />;
}
