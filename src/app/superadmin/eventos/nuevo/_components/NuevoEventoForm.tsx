'use client';

import { useTransition } from 'react';
import { createEvent } from '@/app/superadmin/_actions';

interface Organizer {
  id: string;
  full_name: string | null;
  email: string;
}

const C = {
  bg: '#07090F',
  sidebar: '#0B0F1A',
  border: '#141C2E',
  borderBright: '#1E2D45',
  accent: '#2DD4BF',
  accentDim: 'rgba(45,212,191,0.1)',
  text: '#C8D4E8',
  muted: '#3D5070',
  mutedMid: '#536480',
};

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  backgroundColor: C.sidebar,
  border: `1px solid ${C.borderBright}`,
  borderRadius: '6px',
  color: C.text,
  fontSize: '13px',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23536480'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: '36px',
  cursor: 'pointer',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: '9px',
  letterSpacing: '2px',
  color: C.muted,
  marginBottom: '8px',
  textTransform: 'uppercase',
};

export default function NuevoEventoForm({ organizers }: { organizers: Organizer[] }) {
  const [isPending, startTransition] = useTransition();

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const slugInput = document.getElementById('slug') as HTMLInputElement;
    if (slugInput) slugInput.value = generateSlug(e.target.value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => createEvent(formData));
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`
        input:focus, select:focus { border-color: ${C.accent} !important; }
        input::placeholder { color: ${C.muted}; }
      `}</style>

      {/* Título */}
      <div>
        <label htmlFor="title" style={labelStyle}>Título del evento</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Boda Sofía & Mateo"
          onChange={handleTitleChange}
          style={inputStyle}
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" style={labelStyle}>Slug (url pública)</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: '12px', color: C.muted, pointerEvents: 'none' }}>
            /boda/
          </span>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            placeholder="sofia-mateo"
            pattern="[a-z0-9-]+"
            title="Solo minúsculas, números y guiones"
            style={{ ...inputStyle, paddingLeft: '56px' }}
          />
        </div>
        <p style={{ marginTop: '6px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.muted }}>
          Solo minúsculas, números y guiones
        </p>
      </div>

      {/* Tipo + Plan */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label htmlFor="event_type" style={labelStyle}>Tipo de evento</label>
          <select id="event_type" name="event_type" required style={selectStyle}>
            <option value="">Seleccionar...</option>
            <option value="boda">Boda</option>
            <option value="xv">XV Años</option>
            <option value="bautizo">Bautizo</option>
            <option value="graduacion">Graduación</option>
          </select>
        </div>

        <div>
          <label htmlFor="plan" style={labelStyle}>Plan</label>
          <select id="plan" name="plan" required style={selectStyle}>
            <option value="">Seleccionar...</option>
            <option value="essential">Essential</option>
            <option value="plus">Plus</option>
            <option value="deluxe">Deluxe</option>
          </select>
        </div>
      </div>

      {/* Organizador */}
      <div>
        <label htmlFor="owner_id" style={labelStyle}>Organizador</label>
        <select id="owner_id" name="owner_id" required style={selectStyle}>
          <option value="">Seleccionar organizador...</option>
          {organizers.map(org => (
            <option key={org.id} value={org.id}>
              {org.full_name ? `${org.full_name} — ` : ''}{org.email}
            </option>
          ))}
        </select>
        {organizers.length === 0 && (
          <p style={{ marginTop: '6px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#F87171' }}>
            // No hay organizadores. Invita uno primero desde Supabase Auth.
          </p>
        )}
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '11px 24px',
            backgroundColor: isPending ? C.accentDim : C.accent,
            color: isPending ? C.mutedMid : '#07090F',
            border: 'none',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            cursor: isPending ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {isPending ? 'creando...' : '$ create event'}
        </button>

        <a
          href="/superadmin"
          style={{
            padding: '11px 20px',
            backgroundColor: 'transparent',
            border: `1px solid ${C.borderBright}`,
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: C.mutedMid,
            textDecoration: 'none',
            letterSpacing: '0.05em',
          }}
        >
          cancelar
        </a>
      </div>
    </form>
  );
}
