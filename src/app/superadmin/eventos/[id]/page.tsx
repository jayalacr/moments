import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { toggleEventStatus } from '@/app/superadmin/_actions';
import TemplateUpload from './_components/TemplateUpload';

const C = {
  bg: '#0D1117',
  border: '#222D3F',
  borderBright: '#2D3F57',
  accent: '#2DD4BF',
  accentDim: 'rgba(45,212,191,0.1)',
  text: '#EAF0FB',
  muted: '#7A90A8',
  mutedMid: '#9DB2C8',
  green: '#4ADE80',
  greenDim: 'rgba(74,222,128,0.12)',
  amber: '#FBBF24',
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  published: { label: 'live',      color: C.green },
  draft:     { label: 'draft',     color: C.muted },
  setup:     { label: 'setup',     color: C.accent },
  paused:    { label: 'paused',    color: C.amber },
  finished:  { label: 'finished',  color: C.muted },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventoDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'superadmin') redirect('/admin');

  const { data: event } = await supabase
    .from('events')
    .select('*, profiles(full_name, email)')
    .eq('id', id)
    .single();

  if (!event) redirect('/superadmin');

  const status = STATUS_MAP[event.status] ?? STATUS_MAP.draft;

  return (
    <div style={{ padding: '32px 40px', maxWidth: '680px' }}>
      <style>{`
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .live-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .toggle-btn {
          padding: 9px 18px; border-radius: 6px;
          font-family: var(--font-mono); font-size: 11px;
          cursor: pointer; transition: background 0.15s, border-color 0.15s;
          border: 1px solid ${C.borderBright}; background: transparent; color: ${C.mutedMid};
        }
        .toggle-btn:hover { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentDim}; }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <Link href="/superadmin" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.muted, textDecoration: 'none' }}>
          /eventos
        </Link>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.muted }}>/</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.accent }}>{event.slug}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 400, color: C.text, marginBottom: '6px' }}>
            {event.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className={event.status === 'published' ? 'live-dot' : ''}
              style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: status.color }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: status.color }}>
              {status.label}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.muted }}>·</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: C.muted }}>
              {event.plan} · {event.event_type}
            </span>
          </div>
        </div>

        {(event.status === 'published' || event.status === 'paused' || event.status === 'draft' || event.status === 'setup') && (
          <form action={toggleEventStatus.bind(null, event.id, event.status)}>
            <button type="submit" className="toggle-btn">
              {event.status === 'published' ? 'pause' : 'publish'}
            </button>
          </form>
        )}
      </div>

      {/* Info del evento */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
        {[
          { label: 'slug', value: `/${event.event_type}/${event.slug}` },
          { label: 'organizador', value: (event.profiles as { full_name?: string; email?: string } | null)?.full_name || (event.profiles as { email?: string } | null)?.email || '—' },
          { label: 'creado', value: new Date(event.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) },
          { label: 'actualizado', value: new Date(event.updated_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) },
        ].map(item => (
          <div key={item.label} style={{ padding: '12px 16px', border: `1px solid ${C.border}`, borderRadius: '8px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '2px', marginBottom: '6px' }}>
              {item.label.toUpperCase()}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: C.text }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Separador */}
      <div style={{ height: '1px', backgroundColor: C.border, marginBottom: '28px' }} />

      {/* Template upload */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '2px', marginBottom: '16px' }}>
          TEMPLATE HTML
        </p>
        <TemplateUpload
          eventId={event.id}
          currentUrl={event.template_url ?? null}
          eventSlug={event.slug}
          eventType={event.event_type}
        />
      </div>
    </div>
  );
}
