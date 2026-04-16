'use client';

import { useState, useTransition } from 'react';
import type { RsvpRow, RsvpStats, GuestWithRsvp } from '../_actions';
import { saveMaxCapacity, updateGuestCompanions } from '../_actions';

const C = {
  bg: '#F8F3EC',
  border: '#EDE5D8',
  accent: '#C9A87C',
  accentLight: 'rgba(201,168,124,0.12)',
  text: '#1C1611',
  muted: '#9C8E82',
  mutedLight: '#C5B9B0',
  confirmed: '#5A7A5A',
  confirmedBg: 'rgba(90,122,90,0.1)',
  declined: '#9C6060',
  declinedBg: 'rgba(156,96,96,0.1)',
  pendingBg: 'rgba(201,168,124,0.15)',
  warning: '#8B6914',
  warningBg: 'rgba(139,105,20,0.1)',
  danger: '#9C3A3A',
  dangerBg: 'rgba(156,58,58,0.1)',
};

type Filter = 'all' | 'confirmed' | 'declined' | 'pending';

const STATUS_META = {
  confirmed: { label: 'Confirmado', color: C.confirmed, bg: C.confirmedBg },
  declined:  { label: 'Declinó',    color: C.declined,  bg: C.declinedBg },
  pending:   { label: 'Pendiente',  color: C.accent,    bg: C.pendingBg },
};

function CapacityWidget({
  totalSeats,
  maxCapacity,
}: {
  totalSeats: number;
  maxCapacity: number | null;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(maxCapacity?.toString() ?? '');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const pct = maxCapacity && maxCapacity > 0 ? Math.min(totalSeats / maxCapacity, 1) : 0;
  const isOver = maxCapacity !== null && totalSeats > maxCapacity;
  const isNear = !isOver && maxCapacity !== null && pct >= 0.8;

  const barColor = isOver ? C.danger : isNear ? C.warning : C.confirmed;
  const stateColor = isOver ? C.danger : isNear ? C.warning : C.confirmed;
  const stateBg = isOver ? C.dangerBg : isNear ? C.warningBg : C.confirmedBg;

  function handleSave() {
    const num = parseInt(value, 10);
    if (value !== '' && (isNaN(num) || num < 1)) {
      setError('Ingresa un número válido mayor a 0.');
      return;
    }
    setError('');
    startTransition(async () => {
      const res = await saveMaxCapacity(value === '' ? null : num);
      if (res.error) { setError(res.error); return; }
      setEditing(false);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') { setEditing(false); setValue(maxCapacity?.toString() ?? ''); setError(''); }
  }

  return (
    <div
      style={{
        backgroundColor: '#fff',
        border: `1px solid ${C.border}`,
        borderRadius: '12px',
        padding: '24px 28px',
        marginBottom: '32px',
      }}
    >
      {/* Fila principal */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
        {/* Contador */}
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: C.mutedLight, marginBottom: '10px' }}>
            Asistentes confirmados
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '52px',
                fontWeight: 300,
                color: stateColor,
                lineHeight: 1,
              }}
            >
              {totalSeats}
            </span>
            {maxCapacity !== null && (
              <span style={{ fontSize: '22px', fontFamily: 'var(--font-cormorant)', color: C.mutedLight, fontWeight: 300 }}>
                / {maxCapacity}
              </span>
            )}
          </div>
          {maxCapacity !== null && (
            <div style={{ marginTop: '8px' }}>
              {isOver && (
                <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '10px', backgroundColor: C.dangerBg, color: C.danger }}>
                  Cupo excedido
                </span>
              )}
              {isNear && !isOver && (
                <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '10px', backgroundColor: C.warningBg, color: C.warning }}>
                  Cupo casi lleno
                </span>
              )}
              {!isOver && !isNear && totalSeats > 0 && (
                <span style={{ fontSize: '11px', padding: '2px 10px', borderRadius: '10px', backgroundColor: stateBg, color: stateColor }}>
                  {maxCapacity - totalSeats} lugares disponibles
                </span>
              )}
            </div>
          )}
        </div>

        {/* Control de cupo */}
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.mutedLight, marginBottom: '10px' }}>
            Cupo máximo
          </p>
          {editing ? (
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                <input
                  type="number"
                  min={1}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  placeholder="ej. 150"
                  style={{
                    width: '90px',
                    padding: '8px 12px',
                    border: `1px solid ${error ? C.danger : C.accent}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: C.text,
                    fontFamily: 'var(--font-jost)',
                    outline: 'none',
                    backgroundColor: '#fff',
                    textAlign: 'right',
                  }}
                />
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: C.text,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-jost)',
                    cursor: isPending ? 'wait' : 'pointer',
                    letterSpacing: '0.05em',
                    opacity: isPending ? 0.6 : 1,
                  }}
                >
                  {isPending ? '…' : 'Guardar'}
                </button>
                <button
                  onClick={() => { setEditing(false); setValue(maxCapacity?.toString() ?? ''); setError(''); }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'transparent',
                    color: C.muted,
                    border: `1px solid ${C.border}`,
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-jost)',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
              {error && <p style={{ fontSize: '11px', color: C.danger, marginTop: '6px', textAlign: 'right' }}>{error}</p>}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
              {maxCapacity !== null ? (
                <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '28px', fontWeight: 300, color: C.text }}>
                  {maxCapacity}
                </span>
              ) : (
                <span style={{ fontSize: '13px', color: C.mutedLight, fontStyle: 'italic' }}>Sin límite</span>
              )}
              <button
                onClick={() => setEditing(true)}
                title="Editar cupo máximo"
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  color: C.muted,
                  border: `1px solid ${C.border}`,
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-jost)',
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                }}
              >
                {maxCapacity !== null ? 'Editar' : 'Configurar'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Barra de progreso */}
      {maxCapacity !== null && (
        <div style={{ marginTop: '20px' }}>
          <div
            style={{
              height: '6px',
              backgroundColor: C.bg,
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.min(pct * 100, 100)}%`,
                backgroundColor: barColor,
                borderRadius: '3px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <p style={{ fontSize: '11px', color: C.mutedLight, marginTop: '6px' }}>
            {Math.round(pct * 100)}% del cupo utilizado
          </p>
        </div>
      )}

      {/* Prompt inicial si no hay cupo configurado */}
      {maxCapacity === null && !editing && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: C.accentLight,
            borderRadius: '8px',
            border: `1px solid rgba(201,168,124,0.25)`,
          }}
        >
          <p style={{ fontSize: '12px', color: C.muted, lineHeight: 1.6 }}>
            <span style={{ color: C.accent, fontWeight: 500 }}>Tip: </span>
            Configura el cupo máximo para llevar un control de asistencia y recibir alertas cuando el evento esté lleno.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Deluxe: Inline cupo editor
// ---------------------------------------------------------------------------
function InlineCupoEditor({ guestId, current }: { guestId: string; current: number }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(current));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleSave() {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) { setError('Número inválido'); return; }
    setError('');
    startTransition(async () => {
      const res = await updateGuestCompanions(guestId, num);
      if (res.error) { setError(res.error); return; }
      setEditing(false);
    });
  }

  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '13px', color: C.text }}>+{current}</span>
        <button
          onClick={() => setEditing(true)}
          style={{ padding: '2px 8px', border: `1px solid ${C.border}`, borderRadius: '6px', background: 'transparent', color: C.muted, fontSize: '10px', cursor: 'pointer', fontFamily: 'var(--font-jost)' }}
        >
          editar
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      <input
        type="number" min={0} max={20} value={value}
        onChange={e => setValue(e.target.value)}
        autoFocus
        style={{ width: '60px', padding: '4px 8px', border: `1px solid ${C.accent}`, borderRadius: '6px', fontSize: '13px', color: C.text, fontFamily: 'var(--font-jost)', outline: 'none', backgroundColor: '#fff' }}
        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setEditing(false); setValue(String(current)); } }}
      />
      <button onClick={handleSave} disabled={isPending} style={{ padding: '4px 10px', backgroundColor: C.text, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontFamily: 'var(--font-jost)', cursor: isPending ? 'wait' : 'pointer', opacity: isPending ? 0.6 : 1 }}>
        {isPending ? '…' : 'OK'}
      </button>
      <button onClick={() => { setEditing(false); setValue(String(current)); setError(''); }} style={{ padding: '4px 8px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '6px', fontSize: '11px', color: C.muted, cursor: 'pointer', fontFamily: 'var(--font-jost)' }}>
        ×
      </button>
      {error && <span style={{ fontSize: '11px', color: '#9C3A3A', width: '100%' }}>{error}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Deluxe: tabla de invitados con estado y acciones
// ---------------------------------------------------------------------------
function DeluxeGuestTable({
  guests,
  eventSlug,
  eventType,
}: {
  guests: GuestWithRsvp[];
  eventSlug: string;
  eventType: string;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function buildLink(token: string): string {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/${eventType}/${eventSlug}?id=${token}`;
  }

  function buildWhatsAppUrl(guest: GuestWithRsvp): string {
    const link = buildLink(guest.token);
    const msg = `Hola ${guest.name} 👋 Te compartimos tu link personalizado de confirmación para nuestra boda:\n\n${link}\n\nEsperamos contar con tu presencia 🌸`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  }

  async function copyLink(guest: GuestWithRsvp) {
    const link = buildLink(guest.token);
    await navigator.clipboard.writeText(link);
    setCopiedId(guest.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const statusMeta = {
    confirmed: { label: 'Confirmó', color: C.confirmed, bg: C.confirmedBg },
    declined:  { label: 'Declinó',  color: C.declined,  bg: C.declinedBg },
    pending:   { label: 'Pendiente',color: C.accent,    bg: C.pendingBg },
  };

  return (
    <div style={{ backgroundColor: '#fff', border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 110px 80px 1fr 180px', padding: '12px 20px', borderBottom: `1px solid ${C.border}`, backgroundColor: C.bg }}>
        {['Invitado', 'Estado', 'Cupo', 'Acompañantes', 'Acciones'].map(h => (
          <p key={h} style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.mutedLight, margin: 0 }}>{h}</p>
        ))}
      </div>

      {guests.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '18px', fontStyle: 'italic', color: C.mutedLight }}>
            Aún no hay invitados agregados
          </p>
          <p style={{ fontSize: '13px', color: C.muted, marginTop: '8px' }}>
            Agrega invitados desde la sección &quot;Invitados&quot;.
          </p>
        </div>
      ) : guests.map((guest, i) => {
        const status = guest.rsvp?.status ?? 'pending';
        const meta = statusMeta[status];
        const isLast = i === guests.length - 1;
        const confirmedNames = guest.rsvp?.companion_names ?? [];

        return (
          <div
            key={guest.id}
            style={{ display: 'grid', gridTemplateColumns: '1.5fr 110px 80px 1fr 180px', padding: '14px 20px', borderBottom: isLast ? 'none' : `1px solid ${C.border}`, alignItems: 'start', transition: 'background 0.1s' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {/* Nombre */}
            <div>
              <p style={{ fontSize: '14px', color: C.text, margin: 0 }}>{guest.name}</p>
              {guest.rsvp?.seats != null && guest.rsvp.status === 'confirmed' && (
                <p style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>{guest.rsvp.seats} {guest.rsvp.seats === 1 ? 'persona' : 'personas'}</p>
              )}
            </div>

            {/* Estado */}
            <div>
              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '12px', backgroundColor: meta.bg, color: meta.color, fontSize: '11px' }}>
                {meta.label}
              </span>
            </div>

            {/* Cupo (editable inline) */}
            <InlineCupoEditor guestId={guest.id} current={guest.max_companions} />

            {/* Acompañantes confirmados */}
            <div>
              {confirmedNames.length > 0 ? (
                <p style={{ fontSize: '12px', color: C.muted, lineHeight: 1.5, margin: 0 }}>
                  {confirmedNames.join(', ')}
                </p>
              ) : (
                <p style={{ fontSize: '13px', color: C.mutedLight, margin: 0 }}>—</p>
              )}
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <a
                href={buildWhatsAppUrl(guest)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', backgroundColor: 'rgba(37,211,102,0.1)', color: '#128C7E', border: '1px solid rgba(37,211,102,0.25)', fontSize: '11px', fontFamily: 'var(--font-jost)', textDecoration: 'none', cursor: 'pointer', letterSpacing: '0.03em' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Enviar
              </a>
              <button
                onClick={() => copyLink(guest)}
                style={{ padding: '6px 10px', border: `1px solid ${C.border}`, borderRadius: '6px', background: 'transparent', color: copiedId === guest.id ? C.confirmed : C.muted, fontSize: '11px', fontFamily: 'var(--font-jost)', cursor: 'pointer', letterSpacing: '0.03em', borderColor: copiedId === guest.id ? C.confirmed : C.border }}
              >
                {copiedId === guest.id ? '✓' : 'Copiar'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ConfirmacionesClient({
  rsvps,
  guestsWithRsvp,
  stats,
  plan,
  maxCapacity,
  eventSlug,
  eventType,
}: {
  rsvps: RsvpRow[];
  guestsWithRsvp: GuestWithRsvp[];
  stats: RsvpStats;
  plan: string;
  maxCapacity: number | null;
  eventSlug: string;
  eventType: string;
}) {
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? rsvps : rsvps.filter(r => r.status === filter);

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all',       label: 'Todos',       count: rsvps.length },
    { key: 'confirmed', label: 'Confirmados',  count: stats.confirmed },
    { key: 'pending',   label: 'Pendientes',   count: stats.pending },
    { key: 'declined',  label: 'Declinaron',   count: stats.declined },
  ];

  return (
    <div>
      {/* Widget de capacidad */}
      <CapacityWidget totalSeats={stats.totalSeats} maxCapacity={maxCapacity} />

      {/* Tarjetas de estado */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {[
          { label: 'Confirmados', count: stats.confirmed, color: C.confirmed, bg: C.confirmedBg },
          { label: 'Pendientes',  count: stats.pending,   color: C.accent,    bg: C.pendingBg },
          { label: 'Declinaron',  count: stats.declined,  color: C.declined,  bg: C.declinedBg },
        ].map(s => (
          <div
            key={s.label}
            style={{
              flex: 1,
              minWidth: '120px',
              backgroundColor: '#fff',
              border: `1px solid ${C.border}`,
              borderRadius: '10px',
              padding: '16px 20px',
            }}
          >
            <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.mutedLight, marginBottom: '8px' }}>
              {s.label}
            </p>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '30px', fontWeight: 300, color: s.color, lineHeight: 1 }}>
              {s.count}
            </p>
          </div>
        ))}
      </div>

      {/* Deluxe: tabla por invitado */}
      {plan === 'deluxe' && (
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: C.mutedLight, marginBottom: '16px' }}>
            Invitados individuales
          </p>
          <DeluxeGuestTable guests={guestsWithRsvp} eventSlug={eventSlug} eventType={eventType} />
        </div>
      )}

      {/* Filtros (Plus/Deluxe RSVP list) */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              border: `1px solid ${filter === f.key ? C.accent : C.border}`,
              backgroundColor: filter === f.key ? C.accentLight : 'transparent',
              color: filter === f.key ? C.text : C.muted,
              fontSize: '12px',
              letterSpacing: '0.03em',
              cursor: 'pointer',
              fontFamily: 'var(--font-jost)',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
            <span
              style={{
                marginLeft: '6px',
                backgroundColor: filter === f.key ? C.accent : C.border,
                color: filter === f.key ? '#fff' : C.muted,
                borderRadius: '10px',
                padding: '1px 7px',
                fontSize: '10px',
              }}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: '56px 40px',
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
              marginBottom: '8px',
            }}
          >
            {filter === 'all' ? 'Aún no has recibido confirmaciones' : 'Sin resultados para este filtro'}
          </p>
          <p style={{ fontSize: '13px', color: C.muted }}>
            {filter === 'all'
              ? 'Las respuestas de tus invitados aparecerán aquí.'
              : 'Prueba seleccionando otro estado.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#fff',
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Header tabla */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 130px 90px 1fr 120px',
              padding: '12px 24px',
              borderBottom: `1px solid ${C.border}`,
              backgroundColor: C.bg,
            }}
          >
            {['Nombre', 'Estado', 'Asistentes', 'Acompañantes / Dieta', 'Fecha'].map(h => (
              <p
                key={h}
                style={{
                  fontSize: '10px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: C.mutedLight,
                }}
              >
                {h}
              </p>
            ))}
          </div>

          {filtered.map((r, i) => {
            const meta = STATUS_META[r.status];
            const isLast = i === filtered.length - 1;
            const guestName = r.guests?.name;
            const hasCompanions = r.companion_names?.length > 0;
            const date = new Date(r.created_at).toLocaleDateString('es-MX', {
              day: 'numeric',
              month: 'short',
              year: '2-digit',
            });

            return (
              <div
                key={r.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 130px 90px 1fr 120px',
                  padding: '16px 24px',
                  borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
                  alignItems: 'start',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Nombre */}
                <div>
                  <p style={{ fontSize: '14px', color: C.text, fontWeight: 400 }}>{r.name}</p>
                  {plan === 'deluxe' && guestName && guestName !== r.name && (
                    <p style={{ fontSize: '11px', color: C.mutedLight, marginTop: '2px' }}>
                      Invitado: {guestName}
                    </p>
                  )}
                </div>

                {/* Estado */}
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      backgroundColor: meta.bg,
                      color: meta.color,
                      fontSize: '11px',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {meta.label}
                  </span>
                </div>

                {/* Asistentes */}
                <p style={{ fontSize: '13px', color: r.seats > 0 ? C.text : C.mutedLight }}>
                  {r.seats > 0 ? `${r.seats} ${r.seats === 1 ? 'persona' : 'personas'}` : '—'}
                </p>

                {/* Acompañantes / Dieta */}
                <div>
                  {hasCompanions && (
                    <p style={{ fontSize: '12px', color: C.muted, lineHeight: 1.5 }}>
                      {r.companion_names.join(', ')}
                    </p>
                  )}
                  {r.dietary && (
                    <p style={{ fontSize: '11px', color: C.accent, marginTop: hasCompanions ? '4px' : 0 }}>
                      {r.dietary}
                    </p>
                  )}
                  {!hasCompanions && !r.dietary && (
                    <p style={{ fontSize: '13px', color: C.mutedLight }}>—</p>
                  )}
                </div>

                {/* Fecha */}
                <p style={{ fontSize: '12px', color: C.mutedLight }}>{date}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
