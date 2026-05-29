import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { Users, CheckCircle2, Trophy, ExternalLink, Settings, Sparkles } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ eventId: string }> }): Promise<Metadata> {
  const { eventId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('events').select('title').eq('id', eventId).single();
  return { title: data?.title ?? 'Evento' };
}
import PlusLinkGenerator from './_components/PlusLinkGenerator';
import { getInvitationUrl } from '@/lib/invitation';

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'wedding-planner') {
    redirect(`/admin/eventos/${eventId}/invitados`);
  }

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (!event) redirect('/admin');

  const isEssential = event.plan === 'essential';

  // Stats only apply to Plus/Deluxe (Essential uses WhatsApp RSVP)
  let registeredCount = 0;
  let confirmedSeats = 0;
  let maxCapacity = 0;

  if (!isEssential) {
    const { count } = await supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', event.id);
    registeredCount = count ?? 0;

    const { data: rsvps } = await supabase
      .from('rsvps')
      .select('seats')
      .eq('event_id', event.id)
      .eq('status', 'confirmed');
    confirmedSeats = rsvps?.reduce((acc, r) => acc + (r.seats || 0), 0) ?? 0;

    const config = (event.config as any) ?? {};
    maxCapacity = config.rsvp?.maxCapacity || 0;
  }

  const s = STATUS_LABELS[event.status] ?? STATUS_LABELS.draft;

  return (
    <div className="event-page" style={{ padding: '40px 48px', maxWidth: '1000px', margin: '0 auto' }}>
      <style>{`
        @media (max-width: 768px) {
          .event-page { padding: 20px 20px !important; }
          .event-header { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
          .event-header-actions { flex-wrap: wrap; }
          .event-info-grid { grid-template-columns: 1fr !important; }
          .event-main-grid { grid-template-columns: 1fr !important; }
          .event-title { font-size: clamp(2rem, 9vw, 3rem) !important; }
        }

        .admin-cta {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 28px;
          background: ${C.text};
          color: white;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-jost);
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .admin-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
        
        .admin-cta-sec {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 28px;
          background: white;
          color: ${C.text};
          border: 1px solid ${C.border};
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-jost);
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: all 0.2s;
        }
        .admin-cta-sec:hover { border-color: ${C.accent}; background: ${C.bg}; }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid ${C.border};
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .stat-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: ${C.accentLight}; color: ${C.accent};
        }
      `}</style>

      {/* Cabecera con Badge de Estado */}
      <div className="event-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: s.bg, fontSize: '11px', color: s.color, letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase' }}>
              {s.label}
            </span>
            <span style={{ fontSize: '12px', color: C.muted, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500 }}>
              {TYPE_LABELS[event.event_type] ?? event.event_type}
            </span>
          </div>
          <h1
            className="event-title"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '48px',
              fontWeight: 300,
              fontStyle: 'italic',
              color: C.text,
              lineHeight: 1,
              margin: 0,
            }}
          >
            {event.title}
          </h1>
        </div>

        <div className="event-header-actions" style={{ display: 'flex', gap: '12px' }}>
          <Link
            href={event.status === 'published' ? getInvitationUrl(event) : `/admin/eventos/${event.id}/preview`}
            target="_blank"
            className="admin-cta-sec"
          >
            <ExternalLink size={16} />
            Ver Invitación
          </Link>
          <Link href={`/admin/eventos/${event.id}/editar`} className="admin-cta">
            <Settings size={16} />
            Configurar
          </Link>
        </div>
      </div>

      {/* Grid de Métricas — solo Plus/Deluxe */}
      {!isEssential && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          <div className="stat-card">
            <div className="stat-icon"><Trophy size={20} /></div>
            <div>
              <p style={{ fontSize: '12px', color: C.muted, fontWeight: 500, margin: 0 }}>Cupo Total</p>
              <p style={{ fontSize: '28px', color: C.text, fontWeight: 600, margin: '4px 0 0' }}>{maxCapacity || '∞'}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Users size={20} /></div>
            <div>
              <p style={{ fontSize: '12px', color: C.muted, fontWeight: 500, margin: 0 }}>Invitados Registrados</p>
              <p style={{ fontSize: '28px', color: C.text, fontWeight: 600, margin: '4px 0 0' }}>{registeredCount || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#E8F5E9', color: '#2E7D32' }}><CheckCircle2 size={20} /></div>
            <div>
              <p style={{ fontSize: '12px', color: C.muted, fontWeight: 500, margin: 0 }}>Confirmaciones</p>
              <p style={{ fontSize: '28px', color: C.text, fontWeight: 600, margin: '4px 0 0' }}>{confirmedSeats || 0}</p>
            </div>
          </div>
        </div>
      )}

      <div className="event-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        {/* Detalles del Evento */}
        <div
          style={{
            backgroundColor: '#fff',
            border: `1px solid ${C.border}`,
            borderRadius: '20px',
            padding: '32px',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '24px', fontWeight: 300, fontStyle: 'italic', marginBottom: '24px' }}>
            Información general
          </h3>
          
          <div className="event-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {[
              { label: 'URL pública', value: getInvitationUrl(event) },
              { label: 'Plan contratado', value: `${PLAN_LABELS[event.plan]}` },
              { label: 'Fecha de creación', value: new Date(event.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) },
              { label: 'ID del evento', value: event.id.slice(0, 8) + '...' },
            ].map(item => (
              <div key={item.label}>
                <p style={{ fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: C.mutedLight, fontWeight: 600, marginBottom: '6px' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '14px', color: C.text, margin: 0 }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${C.bg}` }}>
             <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.6, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: C.accent }} />
                <span>Tu invitación está siendo visualizada por tus invitados. Cualquier cambio se actualiza al instante.</span>
             </p>
          </div>
        </div>

        {/* Acciones Rápidas / Sugerencias */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
           <div style={{ padding: '24px', background: C.text, borderRadius: '20px', color: 'white' }}>
              <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: C.accent, fontWeight: 600, marginBottom: '12px' }}>
                Próximos pasos
              </p>
              {isEssential ? (
                <>
                  <p style={{ fontSize: '16px', fontWeight: 300, lineHeight: 1.4, margin: '0 0 20px' }}>
                    ¿Lista la invitación? Comparte el link con tus invitados y recibe sus confirmaciones por WhatsApp.
                  </p>
                  <Link
                    href={event.status === 'published' ? getInvitationUrl(event) : `/admin/eventos/${event.id}/preview`}
                    target="_blank"
                    style={{ display: 'block', padding: '12px', background: C.accent, color: 'white', borderRadius: '10px', textAlign: 'center', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Ver invitación
                  </Link>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '16px', fontWeight: 300, lineHeight: 1.4, margin: '0 0 20px' }}>
                    ¿Ya terminaste de configurar los detalles? Comienza a enviar las invitaciones.
                  </p>
                  <Link href={`/admin/eventos/${event.id}/invitados`} style={{ display: 'block', padding: '12px', background: C.accent, color: 'white', borderRadius: '10px', textAlign: 'center', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                    Ir a Invitados
                  </Link>
                </>
              )}
           </div>
           
           <div style={{ padding: '24px', background: 'white', border: `1px solid ${C.border}`, borderRadius: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: C.text, marginBottom: '8px' }}>¿Necesitas ayuda?</p>
              <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.5, margin: 0 }}>
                Para cualquier duda o sugerencia, contacta al administrador del sitio.
              </p>
           </div>

           {event.plan === 'plus' && (
             <PlusLinkGenerator baseUrl={getInvitationUrl(event)} />
           )}
        </div>
      </div>
    </div>
  );
}
