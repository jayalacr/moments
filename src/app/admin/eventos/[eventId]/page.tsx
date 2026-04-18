import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const C = {
  bg: '#F8F3EC',
  border: '#EDE5D8',
  accent: '#C9A87C',
  accentLight: 'rgba(201,168,124,0.12)',
  text: '#1C1611',
  muted: '#9C8E82',
  mutedLight: '#C5B9B0',
};

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Publicado',  color: '#5A7A5A',    bg: 'rgba(90,122,90,0.1)' },
  draft:     { label: 'Borrador',   color: C.muted,      bg: 'rgba(0,0,0,0.05)' },
  setup:     { label: 'En edición', color: C.accent,     bg: C.accentLight },
  paused:    { label: 'Pausado',    color: '#8B6914',    bg: 'rgba(139,105,20,0.1)' },
  finished:  { label: 'Finalizado', color: C.mutedLight, bg: 'rgba(0,0,0,0.05)' },
};

const PLAN_LABELS: Record<string, string> = { essential: 'Essential', plus: 'Plus', deluxe: 'Deluxe' };
const TYPE_LABELS: Record<string, string> = { boda: 'Boda', xv: 'XV Años', bautizo: 'Bautizo', graduacion: 'Graduación' };

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function EventoPage({ params }: Props) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('owner_id', user.id)
    .single();

  if (!event) redirect('/admin');

  const s = STATUS_LABELS[event.status] ?? STATUS_LABELS.draft;

  return (
    <div style={{ padding: '40px 48px', maxWidth: '760px' }}>
      <style>{`
        .admin-cta {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px;
          background: ${C.text};
          color: ${C.bg};
          border-radius: 8px;
          font-size: 12px;
          font-family: var(--font-jost);
          letter-spacing: 3px;
          text-transform: uppercase;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .admin-cta:hover { opacity: 0.85; }
        .admin-cta-sec {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px;
          background: transparent;
          color: ${C.text};
          border: 1px solid ${C.border};
          border-radius: 8px;
          font-size: 12px;
          font-family: var(--font-jost);
          letter-spacing: 3px;
          text-transform: uppercase;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .admin-cta-sec:hover { border-color: ${C.accent}; background: ${C.accentLight}; }
      `}</style>

      {/* Cabecera */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: C.accent, marginBottom: '8px' }}>
          Resumen del evento
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '36px',
            fontWeight: 300,
            fontStyle: 'italic',
            color: C.text,
            lineHeight: 1.1,
          }}
        >
          {event.title}
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Card principal */}
        <div
          style={{
            backgroundColor: '#fff',
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div style={{ height: '3px', background: `linear-gradient(90deg, ${C.accent}, #E8D5C4)` }} />

          <div style={{ padding: '28px 32px' }}>
            {/* Meta info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: s.bg, fontSize: '11px', color: s.color, letterSpacing: '0.5px' }}>
                {s.label}
              </span>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: C.border }} />
              <span style={{ fontSize: '12px', color: C.muted, letterSpacing: '1px' }}>
                {TYPE_LABELS[event.event_type] ?? event.event_type}
              </span>
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: C.border }} />
              <span style={{ fontSize: '12px', color: C.accent, letterSpacing: '1px' }}>
                Plan {PLAN_LABELS[event.plan] ?? event.plan}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: C.border }} />
              <span style={{ color: C.accent, fontSize: '14px' }}>✦</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: C.border }} />
            </div>

            {/* Detalles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'URL pública', value: `/${event.event_type}/${event.slug}` },
                { label: 'Tipo de evento', value: TYPE_LABELS[event.event_type] ?? event.event_type },
                { label: 'Plan', value: `Moments ${PLAN_LABELS[event.plan]}` },
                { label: 'Creado', value: new Date(event.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) },
              ].map(item => (
                <div key={item.label}>
                  <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.mutedLight, marginBottom: '4px' }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: '13px', color: C.text }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href={`/admin/eventos/${event.id}/editar`} className="admin-cta">
                Editar invitación
              </Link>
              <Link
                href={event.status === 'published' ? `/${event.event_type}/${event.slug}` : `/admin/eventos/${event.id}/preview`}
                target="_blank"
                className="admin-cta-sec"
              >
                {event.status === 'published' ? 'Ver invitación ↗' : 'Vista previa ↗'}
              </Link>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: C.accentLight,
            borderRadius: '8px',
            border: `1px solid rgba(201,168,124,0.25)`,
          }}
        >
          <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.6 }}>
            <span style={{ color: C.accent, fontWeight: 500 }}>Tip: </span>
            Cualquier cambio que guardes se reflejará en tiempo real en tu invitación pública.
          </p>
        </div>
      </div>
    </div>
  );
}
