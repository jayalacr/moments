import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { toggleEventStatus, setEventDraft } from '@/app/superadmin/_actions';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('events').select('title').eq('id', id).single();
  return { title: data?.title ?? 'Evento' };
}
import TemplateSelector from './_components/TemplateSelector';
import PlanChanger from './_components/PlanChanger';
import PricingEditor from './_components/PricingEditor';
import OrganizersEditor from './_components/OrganizersEditor';
import type { DesignType, Plan } from '@/lib/pricing';
import type { OrganizerRow } from './_components/OrganizersEditor';

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
  amber: '#8B6914',
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  published: { label: 'Publicado',  color: C.green },
  draft:     { label: 'Borrador',   color: C.muted },
  setup:     { label: 'En edición', color: C.accent },
  paused:    { label: 'Pausado',    color: C.amber },
  finished:  { label: 'Finalizado', color: C.mutedLight },
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
    .select('*')
    .eq('id', id)
    .single();

  if (!event) redirect('/superadmin');

  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', event.owner_id)
    .single();

  const { data: organizerRows } = await supabase
    .from('event_organizers')
    .select('role, profiles(id, full_name, email)')
    .eq('event_id', id);

  const organizers: OrganizerRow[] = (organizerRows ?? []).map(row => {
    const p = row.profiles as unknown as { id: string; full_name: string | null; email: string } | null;
    return {
      profileId: p?.id ?? '',
      fullName: p?.full_name ?? null,
      email: p?.email ?? '',
      role: row.role as 'owner' | 'collaborator',
    };
  }).filter(o => o.profileId);

  const status = STATUS_MAP[event.status] ?? STATUS_MAP.draft;

  return (
    <div className="sa-detail-container">
      <style>{`
        .sa-detail-container {
          padding: 40px 48px;
          width: 100%;
          box-sizing: border-box;
        }
        .sa-header-flex {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 32px;
          gap: 16px;
        }
        .sa-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 32px;
        }
        @media (max-width: 768px) {
          .sa-detail-container { padding: 24px 20px; }
          .sa-header-flex { flex-direction: column; }
          .sa-header-actions { flex-wrap: wrap; width: 100%; }
          .sa-header-actions form { flex: 1; }
          .sa-header-actions form button { width: 100%; }
          .sa-info-grid { grid-template-columns: 1fr; }
        }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .live-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .toggle-btn {
          padding: 9px 18px; border-radius: 8px;
          font-size: 12px;
          cursor: pointer; transition: background 0.15s, border-color 0.15s;
          border: 1px solid ${C.border}; background: transparent; color: ${C.muted};
        }
        .toggle-btn:hover { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentLight}; }
        .ghost-link {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 18px; border-radius: 8px;
          font-size: 12px;
          border: 1px solid ${C.border}; color: ${C.text};
          text-decoration: none; transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .ghost-link:hover { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentLight}; }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <Link href="/superadmin" style={{ fontSize: '11px', color: C.muted, textDecoration: 'none' }}>
          Eventos
        </Link>
        <span style={{ fontSize: '11px', color: C.mutedLight }}>/</span>
        <span style={{ fontSize: '11px', color: C.accent }}>{event.slug}</span>
      </div>

      {/* Header */}
      <div className="sa-header-flex">
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '28px',
              fontWeight: 300,
              fontStyle: 'italic',
              color: C.text,
              marginBottom: '8px',
            }}
          >
            {event.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className={event.status === 'published' ? 'live-dot' : ''}
              style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: status.color }}
            />
            <span style={{ fontSize: '12px', color: status.color, fontWeight: 500 }}>
              {status.label}
            </span>
            <span style={{ fontSize: '11px', color: C.mutedLight }}>·</span>
            <span style={{ fontSize: '12px', color: C.muted, textTransform: 'capitalize' }}>
              {event.plan} · {event.event_type}
            </span>
          </div>
        </div>

        <div className="sa-header-actions" style={{ display: 'flex', gap: '8px' }}>
          {(event.status === 'published' || event.status === 'paused' || event.status === 'draft' || event.status === 'setup') && (
            <form action={toggleEventStatus.bind(null, event.id, event.status)}>
              <button type="submit" className="toggle-btn">
                {event.status === 'published' ? 'Pausar' : 'Publicar'}
              </button>
            </form>
          )}
          {event.status !== 'draft' && (
            <form action={setEventDraft.bind(null, event.id)}>
              <button type="submit" className="toggle-btn">
                → Borrador
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Info del evento */}
      <div className="sa-info-grid">
        {[
          { label: 'Slug', value: `/${event.event_type}/${event.slug}` },
          { label: 'Organizador', value: ownerProfile?.full_name || ownerProfile?.email || '—' },
          { label: 'Creado', value: new Date(event.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) },
          { label: 'Actualizado', value: new Date(event.updated_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) },
        ].map(item => (
          <div key={item.label} style={{ padding: '14px 16px', border: `1px solid ${C.border}`, borderRadius: '10px', backgroundColor: C.card }}>
            <p style={{ fontSize: '10px', color: C.muted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
              {item.label}
            </p>
            <p style={{ fontSize: '13px', color: C.text, wordBreak: 'break-all' }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Separador */}
      <div style={{ height: '1px', backgroundColor: C.border, marginBottom: '28px' }} />

      {/* Editar contenido */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', color: C.muted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Contenido
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href={`/superadmin/eventos/${event.id}/config`} className="ghost-link">
            Editar datos →
          </Link>
          <Link href={`/superadmin/eventos/${event.id}/editar`} className="ghost-link">
            Editar invitación →
          </Link>
          {(event.plan === 'plus' || event.plan === 'deluxe') && (
            <Link href={`/superadmin/eventos/${event.id}/invitados`} className="ghost-link">
              Invitados & RSVP →
            </Link>
          )}
          {event.template_type && (
            <Link href={`/superadmin/eventos/${event.id}/preview`} target="_blank" className="ghost-link">
              Vista previa ↗
            </Link>
          )}
        </div>
      </div>

      {/* Separador */}
      <div style={{ height: '1px', backgroundColor: C.border, marginBottom: '28px' }} />

      {/* Template selector */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ fontSize: '11px', color: C.muted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
          Template
        </p>
        <TemplateSelector
          eventId={event.id}
          currentType={event.template_type ?? null}
          eventSlug={event.slug}
          eventType={event.event_type}
        />
      </div>

      {/* Separador */}
      <div style={{ height: '1px', backgroundColor: C.border, marginTop: '28px', marginBottom: '28px' }} />

      {/* Organizadores */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ fontSize: '11px', color: C.muted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
          Organizadores
        </p>
        <OrganizersEditor eventId={event.id} initialOrganizers={organizers} />
      </div>

      {/* Separador */}
      <div style={{ height: '1px', backgroundColor: C.border, marginTop: '28px', marginBottom: '28px' }} />

      {/* Cambiar plan */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ fontSize: '11px', color: C.muted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
          Plan
        </p>
        <PlanChanger
          eventId={event.id}
          currentPlan={event.plan as 'essential' | 'plus' | 'deluxe'}
          currentTemplateType={event.template_type ?? null}
        />
      </div>

      {/* Separador */}
      <div style={{ height: '1px', backgroundColor: C.border, marginTop: '28px', marginBottom: '28px' }} />

      {/* Costeo */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ fontSize: '11px', color: C.muted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
          Costeo
        </p>
        <PricingEditor
          eventId={event.id}
          plan={event.plan as Plan}
          initial={{
            designType: (event.design_type as DesignType) ?? 'template',
            extensionMonths: (event as { extension_months?: number }).extension_months ?? 0,
            customDesignFeeMxn: event.custom_design_fee_mxn ?? 0,
            paymentStatus: (event.payment_status as 'pending' | 'partial' | 'paid' | 'refunded' | 'expired') ?? 'pending',
            paymentNotes: event.payment_notes ?? null,
          }}
        />
      </div>
    </div>
  );
}
