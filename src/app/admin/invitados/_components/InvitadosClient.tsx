'use client';

import { useState, useTransition } from 'react';
import { createGuest, updateGuest, deleteGuest, type GuestRow } from '../_actions';

const C = {
  bg: '#F8F3EC',
  border: '#EDE5D8',
  accent: '#C9A87C',
  accentLight: 'rgba(201,168,124,0.12)',
  text: '#1C1611',
  muted: '#9C8E82',
  mutedLight: '#C5B9B0',
  white: '#FFFFFF',
  danger: '#c0392b',
  dangerLight: 'rgba(192,57,43,0.08)',
};

interface Props {
  initialGuests: GuestRow[];
  event: { id: string; slug: string; event_type: string; plan: string };
}

interface FormState {
  name: string;
  max_companions: number;
  companion_names: string[];
}

const EMPTY_FORM: FormState = { name: '', max_companions: 0, companion_names: [] };

function buildInviteUrl(event: Props['event'], token: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/${event.event_type}/${event.slug}?id=${token}`;
}

export default function InvitadosClient({ initialGuests, event }: Props) {
  const [guests, setGuests] = useState<GuestRow[]>(initialGuests);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDeluxe = event.plan === 'deluxe';

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function openEdit(guest: GuestRow) {
    setEditingId(guest.id);
    setForm({
      name: guest.name ?? '',
      max_companions: guest.max_companions,
      companion_names: guest.companion_names ?? [],
    });
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function setCompanionCount(n: number) {
    const count = Math.max(0, n);
    const current = form.companion_names;
    const updated =
      count > current.length
        ? [...current, ...Array(count - current.length).fill('')]
        : current.slice(0, count);
    setForm(f => ({ ...f, max_companions: count, companion_names: updated }));
  }

  function setCompanionName(index: number, value: string) {
    const updated = [...form.companion_names];
    updated[index] = value;
    setForm(f => ({ ...f, companion_names: updated }));
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      setError('El nombre del titular es requerido.');
      return;
    }
    setError(null);

    startTransition(async () => {
      const payload = {
        name: form.name.trim() || undefined,
        max_companions: form.max_companions,
        companion_names: isDeluxe ? form.companion_names : [],
      };

      const result = editingId
        ? await updateGuest(editingId, payload)
        : await createGuest(payload);

      if (result.error) {
        setError(result.error);
        return;
      }

      // Refrescar lista optimistamente hasta que revalidatePath actúe
      window.location.reload();
    });
  }

  function handleDelete(guestId: string) {
    if (!confirm('¿Eliminar este invitado? Se perderá su confirmación si ya respondió.')) return;
    startTransition(async () => {
      const result = await deleteGuest(guestId);
      if (result.error) {
        alert(result.error);
        return;
      }
      setGuests(g => g.filter(x => x.id !== guestId));
    });
  }

  async function copyUrl(token: string) {
    const url = buildInviteUrl(event, token);
    await navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  return (
    <div>
      {/* Acciones superiores */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: C.muted }}>
          {guests.length} invitado{guests.length !== 1 ? 's' : ''}
        </p>
        <button onClick={openCreate} style={btnPrimary}>
          + Agregar invitado
        </button>
      </div>

      {/* Formulario inline */}
      {showForm && (
        <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: C.text, marginBottom: '20px', letterSpacing: '0.02em' }}>
            {editingId ? 'Editar invitado' : 'Nuevo invitado'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Nombre (requerido para ambos planes) */}
            <div>
              <label style={labelStyle}>Nombre del titular</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej. María García"
              />
            </div>

            {/* Máximo de acompañantes */}
            <div>
              <label style={labelStyle}>Máximo de acompañantes</label>
              <input
                style={inputStyle}
                type="number"
                min={0}
                max={20}
                value={form.max_companions}
                onChange={e => setCompanionCount(parseInt(e.target.value) || 0)}
              />
              <p style={{ fontSize: '11px', color: C.mutedLight, marginTop: '4px' }}>
                0 = solo el titular, sin acompañantes
              </p>
            </div>
          </div>

          {/* Nombres de acompañantes (solo Deluxe) */}
          {isDeluxe && form.max_companions > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Nombres de acompañantes</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {form.companion_names.map((name, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: C.accentLight, border: `1px solid ${C.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: C.accent, flexShrink: 0 }}>
                      {i + 1}
                    </span>
                    <input
                      style={{ ...inputStyle, margin: 0, flex: 1 }}
                      value={name}
                      onChange={e => setCompanionName(i, e.target.value)}
                      placeholder={`Acompañante ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p style={{ fontSize: '12px', color: C.danger, marginBottom: '12px' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSubmit} disabled={isPending} style={btnPrimary}>
              {isPending ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear invitado'}
            </button>
            <button onClick={closeForm} style={btnSecondary}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Lista de invitados */}
      {guests.length === 0 ? (
        <div style={{ padding: '48px 40px', border: `1px dashed ${C.border}`, borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '20px', fontStyle: 'italic', color: C.mutedLight, marginBottom: '8px' }}>
            Aún no hay invitados
          </p>
          <p style={{ fontSize: '13px', color: C.muted }}>
            Agrega invitados para generar sus links únicos de confirmación.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {guests.map(guest => (
            <div
              key={guest.id}
              style={{
                backgroundColor: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: '10px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', color: C.text, fontWeight: 400 }}>
                  {guest.name || <span style={{ color: C.mutedLight, fontStyle: 'italic' }}>Sin nombre asignado</span>}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: C.muted }}>
                    {guest.max_companions === 0
                      ? 'Solo titular'
                      : `+ ${guest.max_companions} acompañante${guest.max_companions !== 1 ? 's' : ''}`}
                  </span>
                  {isDeluxe && (guest.companion_names?.length ?? 0) > 0 && (
                    <>
                      <span style={{ color: C.border }}>·</span>
                      <span style={{ fontSize: '11px', color: C.mutedLight }}>
                        {guest.companion_names.filter(Boolean).join(', ')}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* URL */}
              <div style={{ flexShrink: 0, display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => copyUrl(guest.token)}
                  style={{
                    ...btnSecondary,
                    fontSize: '11px',
                    padding: '7px 14px',
                    color: copiedToken === guest.token ? '#5A7A5A' : C.muted,
                    borderColor: copiedToken === guest.token ? '#5A7A5A' : C.border,
                    backgroundColor: copiedToken === guest.token ? 'rgba(90,122,90,0.08)' : 'transparent',
                  }}
                >
                  {copiedToken === guest.token ? '✓ Copiado' : 'Copiar link'}
                </button>
                <button
                  onClick={() => openEdit(guest)}
                  style={{ ...btnSecondary, fontSize: '11px', padding: '7px 12px' }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(guest.id)}
                  style={{
                    ...btnSecondary,
                    fontSize: '11px',
                    padding: '7px 12px',
                    color: C.danger,
                    borderColor: 'transparent',
                    backgroundColor: C.dangerLight,
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '10px 20px',
  background: '#1C1611',
  color: '#F8F3EC',
  borderRadius: '8px',
  fontSize: '12px',
  fontFamily: 'var(--font-jost)',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  border: 'none',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
};

const btnSecondary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '10px 18px',
  background: 'transparent',
  color: '#1C1611',
  border: '1px solid #EDE5D8',
  borderRadius: '8px',
  fontSize: '12px',
  fontFamily: 'var(--font-jost)',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  cursor: 'pointer',
  transition: 'border-color 0.2s, background 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: '#9C8E82',
  marginBottom: '8px',
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #EDE5D8',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#1C1611',
  backgroundColor: '#FFFFFF',
  fontFamily: 'var(--font-jost)',
  outline: 'none',
  boxSizing: 'border-box',
};
