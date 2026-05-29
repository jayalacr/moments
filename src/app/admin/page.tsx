import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Mis Eventos' };

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
  published: { label: 'Publicado',   color: '#5A7A5A',  bg: 'rgba(90,122,90,0.1)' },
  draft:     { label: 'Borrador',    color: C.muted,    bg: 'rgba(0,0,0,0.05)' },
  setup:     { label: 'En edición',  color: C.accent,   bg: C.accentLight },
  paused:    { label: 'Pausado',     color: '#8B6914',  bg: 'rgba(139,105,20,0.1)' },
  finished:  { label: 'Finalizado',  color: C.mutedLight, bg: 'rgba(0,0,0,0.05)' },
};

const PLAN_LABELS: Record<string, string> = {
  essential: 'Essential',
  plus: 'Plus',
  deluxe: 'Deluxe',
};

const TYPE_LABELS: Record<string, string> = {
  boda: 'Boda',
  xv: 'XV Años',
  bautizo: 'Bautizo',
  graduacion: 'Graduación',
};

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let events: any[] | null = null;

  if (profile?.role === 'superadmin') {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    events = data;
  } else {
    const { data: orgEntries } = await supabase
      .from('event_organizers')
      .select('event_id')
      .eq('profile_id', user.id);

    const eventIds = orgEntries?.map(e => e.event_id) ?? [];

    if (eventIds.length) {
      const { data } = await supabase
        .from('events')
        .select('*')
        .in('id', eventIds)
        .order('created_at', { ascending: false });
      events = data;
    }
  }

  // Wedding planner va directo al panel de invitados de su primer evento asignado
  if (profile?.role === 'wedding-planner' && events && events.length > 0) {
    redirect(`/admin/eventos/${events[0].id}/invitados`);
  }

  return (
    <div className="admin-dashboard-container">
      <style>{`
        .admin-dashboard-container {
          padding: 40px 48px;
          max-width: 860px;
        }
        @media (max-width: 768px) {
          .admin-dashboard-container {
            padding: 24px 20px;
          }
        }
        .event-card {
          display: block;
          background: #fff;
          border: 1px solid ${C.border};
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .event-card:hover {
          border-color: ${C.accent};
          box-shadow: 0 4px 20px rgba(201,168,124,0.15);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Cabecera */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: C.accent, marginBottom: '8px' }}>
          Mis eventos
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
          Panel de organizador
        </h1>
      </div>

      {!events || events.length === 0 ? (
        <div
          style={{
            padding: '48px 40px',
            border: `1px dashed ${C.border}`,
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '20px',
              fontStyle: 'italic',
              color: C.mutedLight,
              marginBottom: '12px',
            }}
          >
            Aún no tienes eventos asignados
          </p>
          <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.6 }}>
            El administrador creará tu invitación y te notificará cuando esté lista.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {events.map(event => {
            const s = STATUS_LABELS[event.status] ?? STATUS_LABELS.draft;
            return (
              <Link key={event.id} href={`/admin/eventos/${event.id}`} className="event-card">
                {/* Franja decorativa */}
                <div style={{ height: '3px', background: `linear-gradient(90deg, ${C.accent}, #E8D5C4)` }} />

                <div style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {/* Info principal */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', backgroundColor: s.bg, fontSize: '10px', color: s.color, letterSpacing: '0.5px', fontWeight: 500 }}>
                        {s.label}
                      </span>
                      <span style={{ fontSize: '11px', color: C.muted, letterSpacing: '1px' }}>
                        {TYPE_LABELS[event.event_type] ?? event.event_type}
                      </span>
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: C.border, display: 'inline-block' }} />
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          padding: '3px 10px',
                          borderRadius: '100px',
                          backgroundColor: event.plan === 'deluxe' ? '#1C1611' : event.plan === 'plus' ? '#FDFBF7' : '#F5F1EC',
                          border: `1px solid ${event.plan === 'deluxe' ? '#1C1611' : C.border}`,
                          color: event.plan === 'deluxe' ? '#C9A87C' : C.accent,
                        }}
                      >
                        {PLAN_LABELS[event.plan] ?? event.plan}
                      </span>
                    </div>

                    <p
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        fontSize: '22px',
                        fontWeight: 300,
                        fontStyle: 'italic',
                        color: C.text,
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {event.title}
                    </p>

                    <p style={{ fontSize: '12px', color: C.mutedLight, marginTop: '6px' }}>
                      Creado el {new Date(event.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Flecha */}
                  <div style={{ color: C.accent, fontSize: '20px', flexShrink: 0 }}>→</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
