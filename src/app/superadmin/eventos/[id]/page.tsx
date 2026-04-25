import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { toggleEventStatus, setEventDraft } from '@/app/superadmin/_actions';
import TemplateSelector from './_components/TemplateSelector';
import PlanChanger from './_components/PlanChanger';
import PricingEditor from './_components/PricingEditor';
import OrganizersEditor from './_components/OrganizersEditor';
import type { DesignType, ExtensionKey, Plan } from '@/lib/pricing';
import type { OrganizerRow } from './_components/OrganizersEditor';

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
          padding: 32px 40px;
          max-width: 680px;
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
          .sa-detail-container {
            padding: 20px 16px;
          }
          .sa-header-flex {
            flex-direction: column;
          }
          .sa-info-grid {
            grid-template-columns: 1fr;
          }
        }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .live-dot { animation: pulse-dot 2s ease-in-out infinite; }
        .toggle-btn {
          padding: 9px 18px; border-radius: 6px;
          font-family: var(--font-mono); font-size: 11px;
          cursor: pointer; transition: background 0.15s, border-color 0.15s;
          border: 1px solid ${C.borderBright}; background: transparent; color: ${C.mutedMid};
        }
        .toggle-btn:hover { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentDim}; }
        .ghost-link {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 18px; border-radius: 6px;
          font-family: var(--font-mono); font-size: 11px;
          border: 1px solid ${C.borderBright}; color: ${C.mutedMid};
          text-decoration: none; transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .ghost-link:hover { border-color: ${C.accent}; color: ${C.accent}; background: ${C.accentDim}; }
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
      <div className="sa-header-flex">
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

        <div style={{ display: 'flex', gap: '8px' }}>
          {(event.status === 'published' || event.status === 'paused' || event.status === 'draft' || event.status === 'setup') && (
            <form action={toggleEventStatus.bind(null, event.id, event.status)}>
              <button type="submit" className="toggle-btn">
                {event.status === 'published' ? 'pause' : 'publish'}
              </button>
            </form>
          )}
          {event.status !== 'draft' && (
            <form action={setEventDraft.bind(null, event.id)}>
              <button type="submit" className="toggle-btn">
                → draft
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Info del evento */}
      <div className="sa-info-grid">
        {[
          { label: 'slug', value: `/${event.event_type}/${event.slug}` },
          { label: 'organizador', value: ownerProfile?.full_name || ownerProfile?.email || '—' },
          { label: 'creado', value: new Date(event.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) },
          { label: 'actualizado', value: new Date(event.updated_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) },
        ].map(item => (
          <div key={item.label} style={{ padding: '12px 16px', border: `1px solid ${C.border}`, borderRadius: '8px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '2px', marginBottom: '6px' }}>
              {item.label.toUpperCase()}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: C.text, wordBreak: 'break-all' }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Separador */}
      <div style={{ height: '1px', backgroundColor: C.border, marginBottom: '28px' }} />

      {/* Editar contenido */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '2px', marginBottom: '12px' }}>
          CONTENIDO
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href={`/superadmin/eventos/${event.id}/config`} className="ghost-link">
            editar datos →
          </Link>
          <Link href={`/superadmin/eventos/${event.id}/editar`} className="ghost-link">
            editar invitación →
          </Link>
          {(event.plan === 'plus' || event.plan === 'deluxe') && (
            <Link href={`/superadmin/eventos/${event.id}/invitados`} className="ghost-link">
              invitados & rsvp →
            </Link>
          )}
          {event.template_type && (
            <Link href={`/superadmin/eventos/${event.id}/preview`} target="_blank" className="ghost-link">
              vista previa ↗
            </Link>
          )}
        </div>
      </div>

      {/* Separador */}
      <div style={{ height: '1px', backgroundColor: C.border, marginBottom: '28px' }} />

      {/* Template selector */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '2px', marginBottom: '16px' }}>
          TEMPLATE
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
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '2px', marginBottom: '16px' }}>
          ORGANIZADORES
        </p>
        <OrganizersEditor eventId={event.id} initialOrganizers={organizers} />
      </div>

      {/* Separador */}
      <div style={{ height: '1px', backgroundColor: C.border, marginTop: '28px', marginBottom: '28px' }} />

      {/* Cambiar plan */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '2px', marginBottom: '16px' }}>
          PLAN
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
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '2px', marginBottom: '16px' }}>
          COSTEO
        </p>
        <PricingEditor
          eventId={event.id}
          plan={event.plan as Plan}
          initial={{
            designType: (event.design_type as DesignType) ?? 'template',
            extensionKey: (event.extension_key as ExtensionKey) ?? 'none',
            customDesignFeeMxn: event.custom_design_fee_mxn ?? 0,
            paymentStatus: (event.payment_status as 'pending' | 'partial' | 'paid' | 'refunded' | 'expired') ?? 'pending',
            paymentNotes: event.payment_notes ?? null,
          }}
        />
      </div>
    </div>
  );
}
