import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { toggleEventStatus } from './_actions';

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
  amberDim: 'rgba(251,191,36,0.12)',
  red: '#F87171',
  redDim: 'rgba(248,113,113,0.12)',
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; glow?: string }> = {
  published: { label: 'live', color: C.green, bg: C.greenDim, glow: C.green },
  draft:     { label: 'draft', color: C.mutedMid, bg: 'rgba(255,255,255,0.04)', glow: undefined },
  setup:     { label: 'setup', color: C.accent, bg: C.accentDim, glow: undefined },
  paused:    { label: 'paused', color: C.amber, bg: C.amberDim, glow: undefined },
  finished:  { label: 'finished', color: C.muted, bg: 'rgba(255,255,255,0.04)', glow: undefined },
};

const PLAN_MAP: Record<string, { label: string; color: string }> = {
  essential: { label: 'ESSENTIAL', color: C.mutedMid },
  plus:      { label: 'PLUS', color: C.accent },
  deluxe:    { label: 'DELUXE', color: '#A78BFA' },
};

const TYPE_MAP: Record<string, string> = {
  boda: 'boda', xv: 'xv años', bautizo: 'bautizo', graduacion: 'graduación',
};

export default async function SuperadminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'superadmin') redirect('/admin');

  const { data: events } = await supabase
    .from('events')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });

  const total = events?.length ?? 0;
  const live = events?.filter(e => e.status === 'published').length ?? 0;
  const draft = events?.filter(e => e.status === 'draft').length ?? 0;

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>
      <style>{`
        @keyframes pulse-dot { 0%,100% { opacity:1; box-shadow: 0 0 6px ${C.green}; } 50% { opacity:0.5; box-shadow: 0 0 2px ${C.green}; } }
        .live-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .toggle-btn {
          padding: 5px 12px;
          border-radius: 4px;
          font-size: 11px;
          font-family: var(--font-mono);
          letter-spacing: 0.05em;
          cursor: pointer;
          border: 1px solid ${C.borderBright};
          background: transparent;
          color: ${C.mutedMid};
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .toggle-btn:hover { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentDim}; }
        .toggle-btn.pause:hover { border-color: ${C.amber}; color: ${C.amber}; background: ${C.amberDim}; }
        .new-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 18px;
          background: ${C.accentDim};
          border: 1px solid ${C.accent};
          border-radius: 6px;
          color: ${C.accent};
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.08em;
          text-decoration: none;
          transition: background 0.15s;
        }
        .new-btn:hover { background: rgba(45,212,191,0.2); }
        tr.event-row { transition: background 0.12s; }
        tr.event-row:hover td { background: rgba(255,255,255,0.02); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.muted, letterSpacing: '3px', marginBottom: '6px' }}>
            /superadmin/eventos
          </p>
          <h1 style={{ fontSize: '20px', fontWeight: 400, color: C.text, letterSpacing: '-0.01em' }}>
            Eventos
          </h1>
        </div>
        <Link href="/superadmin/eventos/nuevo" className="new-btn">
          <span>+</span> Nuevo evento
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {[
          { label: 'total_events', value: String(total).padStart(2, '0'), color: C.text },
          { label: 'live_now', value: String(live).padStart(2, '0'), color: C.green },
          { label: 'in_draft', value: String(draft).padStart(2, '0'), color: C.mutedMid },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              padding: '16px 20px',
              backgroundColor: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: '8px',
            }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '2px', marginBottom: '8px' }}>
              {stat.label}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {['evento', 'tipo', 'plan', 'organizador', 'estado', 'creado', ''].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    letterSpacing: '2px',
                    color: C.muted,
                    fontWeight: 400,
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!events?.length && (
              <tr>
                <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '12px', color: C.muted }}>
                  // no events yet — create one
                </td>
              </tr>
            )}
            {events?.map((event, i) => {
              const status = STATUS_MAP[event.status] ?? STATUS_MAP.draft;
              const plan = PLAN_MAP[event.plan] ?? PLAN_MAP.essential;
              const org = (event.profiles as { full_name?: string; email?: string } | null);
              const createdAt = new Date(event.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' });

              return (
                <tr
                  key={event.id}
                  className="event-row"
                  style={{ borderTop: i > 0 ? `1px solid ${C.border}` : undefined }}
                >
                  {/* Evento */}
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ fontSize: '13px', color: C.text, fontWeight: 400, marginBottom: '2px' }}>
                      {event.title}
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.muted }}>
                      /{event.slug}
                    </p>
                  </td>

                  {/* Tipo */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: C.mutedMid }}>
                      {TYPE_MAP[event.event_type] ?? event.event_type}
                    </span>
                  </td>

                  {/* Plan */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: plan.color, letterSpacing: '1px' }}>
                      {plan.label}
                    </span>
                  </td>

                  {/* Organizador */}
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ fontSize: '12px', color: C.text }}>
                      {org?.full_name || '—'}
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.muted }}>
                      {org?.email}
                    </p>
                  </td>

                  {/* Estado */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '4px', backgroundColor: status.bg }}>
                      <span
                        className={event.status === 'published' ? 'live-dot' : ''}
                        style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: status.color, flexShrink: 0 }}
                      />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: status.color, letterSpacing: '0.05em' }}>
                        {status.label}
                      </span>
                    </span>
                  </td>

                  {/* Creado */}
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: C.mutedMid }}>
                      {createdAt}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Link
                        href={`/superadmin/eventos/${event.id}`}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: C.accent, textDecoration: 'none', padding: '5px 10px', border: `1px solid ${C.borderBright}`, borderRadius: '4px' }}
                      >
                        editar
                      </Link>
                      {(event.status === 'published' || event.status === 'paused' || event.status === 'draft' || event.status === 'setup') && (
                        <form action={toggleEventStatus.bind(null, event.id, event.status)}>
                          <button
                            type="submit"
                            className={`toggle-btn${event.status === 'published' ? ' pause' : ''}`}
                          >
                            {event.status === 'published' ? 'pause' : 'publish'}
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <p style={{ marginTop: '20px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.muted, textAlign: 'right' }}>
        {total} record{total !== 1 ? 's' : ''} · moments/superadmin v0.1
      </p>
    </div>
  );
}
