import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { toggleEventStatus } from './_actions';

export const metadata: Metadata = { title: 'Superadmin | Eventos' };

const C = {
  bg: '#F8F3EC',
  card: '#FFFFFF',
  border: '#EDE5D8',
  accent: '#C9A87C',
  accentLight: 'rgba(201,168,124,0.12)',
  text: '#1C1611',
  muted: '#9C8E82',
  mutedLight: '#C5B9B0',
  green: '#5A7A5A',
  greenBg: 'rgba(90,122,90,0.1)',
  amber: '#8B6914',
  amberBg: 'rgba(139,105,20,0.1)',
  red: '#C0392B',
  redBg: 'rgba(192,57,41,0.1)',
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Publicado',  color: C.green,  bg: C.greenBg },
  draft:     { label: 'Borrador',   color: C.muted,  bg: 'rgba(0,0,0,0.05)' },
  setup:     { label: 'En edición', color: C.accent, bg: C.accentLight },
  paused:    { label: 'Pausado',    color: C.amber,  bg: C.amberBg },
  finished:  { label: 'Finalizado', color: C.mutedLight, bg: 'rgba(0,0,0,0.05)' },
};

const PAYMENT_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: 'Pendiente', color: C.red,    bg: C.redBg },
  partial:  { label: 'Parcial',   color: C.amber,  bg: C.amberBg },
  paid:     { label: 'Pagado',    color: C.green,  bg: C.greenBg },
  refunded: { label: 'Reembolso', color: C.mutedLight, bg: 'rgba(0,0,0,0.05)' },
  expired:  { label: 'Expirado',  color: C.muted,  bg: 'rgba(0,0,0,0.05)' },
};

const PLAN_MAP: Record<string, { label: string }> = {
  essential: { label: 'Essential' },
  plus:      { label: 'Plus' },
  deluxe:    { label: 'Deluxe' },
};

const TYPE_MAP: Record<string, string> = {
  boda: 'Boda', xv: 'XV Años', bautizo: 'Bautizo', graduacion: 'Graduación',
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
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch organizer profiles separately to avoid PostgREST FK ambiguity
  // (event_organizers creates a second path events→profiles via junction table)
  const ownerIds = [...new Set((events ?? []).map(e => e.owner_id).filter(Boolean))];
  const { data: orgProfiles } = ownerIds.length
    ? await supabase.from('profiles').select('id, full_name, email').in('id', ownerIds)
    : { data: [] };
  const profileMap = Object.fromEntries((orgProfiles ?? []).map(p => [p.id, p]));

  const total = events?.length ?? 0;
  const live = events?.filter(e => e.status === 'published').length ?? 0;
  const draft = events?.filter(e => e.status === 'draft').length ?? 0;

  return (
    <div className="sa-page-container">
      <style>{`
        .sa-page-container {
          padding: 40px 48px;
          width: 100%;
          box-sizing: border-box;
        }
        .sa-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 32px;
          gap: 16px;
        }
        .sa-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 32px;
        }
        .sa-table-wrapper {
          border: 1px solid ${C.border};
          border-radius: 12px;
          overflow-x: auto;
          background: ${C.card};
        }
        @media (max-width: 768px) {
          .sa-page-container { padding: 24px 20px; }
          .sa-header { flex-direction: column; }
          .sa-stats-grid { grid-template-columns: repeat(3, 1fr); }
          .sa-table-wrapper { display: none; }
          .sa-cards-list { display: flex !important; }
        }
        @media (min-width: 769px) {
          .sa-cards-list { display: none !important; }
        }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .live-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .toggle-btn {
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 11px;
          letter-spacing: 0.05em;
          cursor: pointer;
          border: 1px solid ${C.border};
          background: transparent;
          color: ${C.muted};
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .toggle-btn:hover { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentLight}; }
        .toggle-btn.pause:hover { border-color: ${C.amber}; color: ${C.amber}; background: ${C.amberBg}; }
        .new-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px;
          background: #1C1611;
          border: 1px solid #1C1611;
          border-radius: 8px;
          color: #F8F3EC;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-decoration: none;
          transition: opacity 0.15s;
          white-space: nowrap;
        }
        .new-btn:hover { opacity: 0.85; }
        tr.event-row { transition: background 0.12s; }
        tr.event-row:hover td { background: rgba(0,0,0,0.015); }
      `}</style>

      {/* Header */}
      <div className="sa-header">
        <div>
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: C.accent, marginBottom: '8px' }}>
            Superadmin
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
            Todos los eventos
          </h1>
        </div>
        <Link href="/superadmin/eventos/nuevo" className="new-btn">
          <span>+</span> Nuevo evento
        </Link>
      </div>

      {/* Stats */}
      <div className="sa-stats-grid">
        {[
          { label: 'Total de eventos', value: total, color: C.text },
          { label: 'Publicados', value: live, color: C.green },
          { label: 'En borrador', value: draft, color: C.muted },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              padding: '18px 20px',
              backgroundColor: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: '12px',
            }}
          >
            <p style={{ fontSize: '11px', color: C.muted, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
              {stat.label}
            </p>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '30px', fontStyle: 'italic', color: stat.color, lineHeight: 1 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="sa-table-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {['Evento', 'Tipo', 'Plan', 'Organizador', 'Estado', 'Pago', 'Creado', ''].map(h => (
                <th
                  key={h}
                  style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: C.muted,
                    fontWeight: 600,
                    backgroundColor: '#FDFCFB',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!events?.length && (
              <tr>
                <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', fontSize: '13px', color: C.muted, fontStyle: 'italic' }}>
                  Aún no hay eventos.
                </td>
              </tr>
            )}
            {events?.map((event, i) => {
              const status = STATUS_MAP[event.status] ?? STATUS_MAP.draft;
              const plan = PLAN_MAP[event.plan] ?? PLAN_MAP.essential;
              const payment = PAYMENT_MAP[event.payment_status ?? 'pending'] ?? PAYMENT_MAP.pending;
              const org = profileMap[event.owner_id] as { full_name?: string; email?: string } | undefined;
              const createdAt = new Date(event.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' });

              return (
                <tr
                  key={event.id}
                  className="event-row"
                  style={{ borderTop: i > 0 ? `1px solid ${C.border}` : undefined }}
                >
                  {/* Evento */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <p style={{ fontSize: '13.5px', color: C.text, fontWeight: 500, marginBottom: '2px' }}>
                      {event.title}
                    </p>
                    <p style={{ fontSize: '11px', color: C.mutedLight }}>
                      /{event.slug}
                    </p>
                  </td>

                  {/* Tipo */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '12px', color: C.muted }}>
                      {TYPE_MAP[event.event_type] ?? event.event_type}
                    </span>
                  </td>

                  {/* Plan */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
                      padding: '3px 10px', borderRadius: '100px',
                      backgroundColor: event.plan === 'deluxe' ? '#1C1611' : event.plan === 'plus' ? '#FDFBF7' : '#F5F1EC',
                      border: `1px solid ${event.plan === 'deluxe' ? '#1C1611' : C.border}`,
                      color: event.plan === 'deluxe' ? '#C9A87C' : C.accent,
                    }}>
                      {plan.label}
                    </span>
                  </td>

                  {/* Organizador */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <p style={{ fontSize: '12px', color: C.text }}>
                      {org?.full_name || '—'}
                    </p>
                    <p style={{ fontSize: '11px', color: C.mutedLight }}>
                      {org?.email}
                    </p>
                  </td>

                  {/* Estado */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', backgroundColor: status.bg }}>
                      <span
                        className={event.status === 'published' ? 'live-dot' : ''}
                        style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: status.color, flexShrink: 0 }}
                      />
                      <span style={{ fontSize: '10px', color: status.color, letterSpacing: '0.02em', fontWeight: 500 }}>
                        {status.label}
                      </span>
                    </span>
                  </td>

                  {/* Pago */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', backgroundColor: payment.bg }}>
                      <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: payment.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '10px', color: payment.color, letterSpacing: '0.02em', fontWeight: 500 }}>
                        {payment.label}
                      </span>
                    </span>
                  </td>

                  {/* Creado */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '11.5px', color: C.muted }}>
                      {createdAt}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Link
                        href={`/superadmin/eventos/${event.id}`}
                        style={{ fontSize: '11px', color: C.accent, textDecoration: 'none', padding: '5px 12px', border: `1px solid ${C.border}`, borderRadius: '6px' }}
                      >
                        Editar
                      </Link>
                      {(event.status === 'published' || event.status === 'paused' || event.status === 'draft' || event.status === 'setup') && (
                        <form action={toggleEventStatus.bind(null, event.id, event.status)}>
                          <button
                            type="submit"
                            className={`toggle-btn${event.status === 'published' ? ' pause' : ''}`}
                          >
                            {event.status === 'published' ? 'Pausar' : 'Publicar'}
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

      {/* Card list — visible only on mobile */}
      <div className="sa-cards-list" style={{ display: 'none', flexDirection: 'column', gap: '8px' }}>
        {!events?.length && (
          <p style={{ fontSize: '13px', color: C.muted, textAlign: 'center', padding: '32px 0', fontStyle: 'italic' }}>
            Aún no hay eventos.
          </p>
        )}
        {events?.map(event => {
          const status = STATUS_MAP[event.status] ?? STATUS_MAP.draft;
          const plan = PLAN_MAP[event.plan] ?? PLAN_MAP.essential;
          const payment = PAYMENT_MAP[event.payment_status ?? 'pending'] ?? PAYMENT_MAP.pending;
          const org = profileMap[event.owner_id] as { full_name?: string; email?: string } | undefined;
          const createdAt = new Date(event.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' });
          return (
            <div
              key={event.id}
              style={{
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: C.card,
              }}
            >
              {/* Fila superior: título + slug */}
              <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '14px', color: C.text, fontWeight: 500, margin: '0 0 2px' }}>
                  {event.title}
                </p>
                <p style={{ fontSize: '11px', color: C.mutedLight, margin: 0 }}>
                  /{event.slug} · {TYPE_MAP[event.event_type] ?? event.event_type} · {createdAt}
                </p>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '20px', backgroundColor: status.bg }}>
                  <span
                    className={event.status === 'published' ? 'live-dot' : ''}
                    style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: status.color, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '10px', color: status.color }}>{status.label}</span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '20px', backgroundColor: payment.bg }}>
                  <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: payment.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', color: payment.color }}>{payment.label}</span>
                </span>
                <span style={{ padding: '3px 8px', borderRadius: '20px', backgroundColor: '#F5F1EC' }}>
                  <span style={{ fontSize: '10px', color: C.accent, letterSpacing: '1px' }}>{plan.label}</span>
                </span>
              </div>

              {/* Organizador */}
              {org && (
                <p style={{ fontSize: '11px', color: C.muted, marginBottom: '12px' }}>
                  {org.full_name || org.email}
                </p>
              )}

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  href={`/superadmin/eventos/${event.id}`}
                  style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: C.accent, textDecoration: 'none', padding: '8px 10px', border: `1px solid ${C.border}`, borderRadius: '6px' }}
                >
                  Editar
                </Link>
                {(event.status === 'published' || event.status === 'paused' || event.status === 'draft' || event.status === 'setup') && (
                  <form action={toggleEventStatus.bind(null, event.id, event.status)} style={{ flex: 1 }}>
                    <button
                      type="submit"
                      className={`toggle-btn${event.status === 'published' ? ' pause' : ''}`}
                      style={{ width: '100%' }}
                    >
                      {event.status === 'published' ? 'Pausar' : 'Publicar'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p style={{ marginTop: '20px', fontSize: '11px', color: C.mutedLight, textAlign: 'right' }}>
        {total} evento{total !== 1 ? 's' : ''} en total
      </p>
    </div>
  );
}
