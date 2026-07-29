'use client';

import { useTransition, useState } from 'react';
import Link from 'next/link';
import { createEvent } from '@/app/superadmin/_actions';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'moments-mx.com';

interface Organizer {
  id: string;
  full_name: string | null;
  email: string;
}

interface Me {
  id: string;
  full_name: string | null;
  email: string;
}

const C = {
  bg: '#F8F3EC',
  card: '#FFFFFF',
  border: '#EDE5D8',
  borderBright: '#D8CBB8',
  accent: '#C9A87C',
  accentDim: 'rgba(201,168,124,0.12)',
  text: '#1C1611',
  muted: '#9C8E82',
  mutedLight: '#C5B9B0',
  red: '#C0392B',
};

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  backgroundColor: C.card,
  border: `1px solid ${C.borderBright}`,
  borderRadius: '6px',
  color: C.text,
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239C8E82'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: '36px',
  cursor: 'pointer',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  letterSpacing: '1.5px',
  color: C.muted,
  marginBottom: '8px',
  textTransform: 'uppercase',
};

export default function NuevoEventoForm({ organizers, me }: { organizers: Organizer[]; me: Me | null }) {
  const [isPending, startTransition] = useTransition();
  const [subdomain, setSubdomain] = useState('');
  const [subdomainError, setSubdomainError] = useState('');

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const generated = generateSlug(e.target.value);
    const slugInput = document.getElementById('slug') as HTMLInputElement;
    if (slugInput) slugInput.value = generated;
    // Auto-fill subdomain only if user hasn't typed one yet
    if (!subdomain) setSubdomain(generated);
  }

  function handleSubdomainChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(val);
    if (val && !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(val) && val.length > 1) {
      setSubdomainError('Solo letras minúsculas, números y guiones (sin empezar/terminar en guión)');
    } else {
      setSubdomainError('');
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (subdomainError) return;
    const formData = new FormData(e.currentTarget);
    startTransition(() => createEvent(formData));
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`
        input:focus, select:focus { border-color: ${C.accent} !important; }
        input::placeholder { color: ${C.mutedLight}; }
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
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: C.muted, pointerEvents: 'none' }}>
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
        <p style={{ marginTop: '6px', fontSize: '11px', color: C.muted }}>
          Solo minúsculas, números y guiones
        </p>
      </div>

      {/* Subdominio */}
      <div>
        <label htmlFor="subdomain" style={labelStyle}>Subdominio</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          <input
            id="subdomain"
            name="subdomain"
            type="text"
            value={subdomain}
            onChange={handleSubdomainChange}
            placeholder="sofia-mateo"
            pattern="[a-z0-9][a-z0-9-]*[a-z0-9]"
            style={{ ...inputStyle, borderRadius: '6px 0 0 6px', borderRight: 'none' }}
          />
          <span style={{
            padding: '10px 14px',
            backgroundColor: C.bg,
            border: `1px solid ${C.borderBright}`,
            borderLeft: 'none',
            borderRadius: '0 6px 6px 0',
            fontSize: '12px',
            color: C.muted,
            whiteSpace: 'nowrap',
          }}>
            .{ROOT_DOMAIN}
          </span>
        </div>
        {subdomainError && (
          <p style={{ marginTop: '6px', fontSize: '11px', color: C.red }}>
            {subdomainError}
          </p>
        )}
        {!subdomainError && (
          <p style={{ marginTop: '6px', fontSize: '11px', color: C.muted }}>
            Se auto-genera desde el slug. Disponible en planes Plus y Deluxe.
          </p>
        )}
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

      {/* Template */}
      <div>
        <label htmlFor="template_type" style={labelStyle}>Template (diseño de la invitación)</label>
        <input
          id="template_type"
          name="template_type"
          type="text"
          placeholder="ej: essential-demo, boda-clasica-dorado"
          style={inputStyle}
        />
        <p style={{ marginTop: '6px', fontSize: '11px', color: C.muted }}>
          Clave del template registrado en src/lib/templates.ts — se puede asignar después.
        </p>
      </div>

      {/* Organizador */}
      <div>
        <label htmlFor="owner_id" style={labelStyle}>Organizador</label>
        <select id="owner_id" name="owner_id" required style={selectStyle}>
          <option value="">Seleccionar organizador...</option>
          {me && (
            <option value={me.id}>
              {me.full_name ? `${me.full_name} — ` : ''}{me.email} (Yo)
            </option>
          )}
          {organizers.map(org => (
            <option key={org.id} value={org.id}>
              {org.full_name ? `${org.full_name} — ` : ''}{org.email}
            </option>
          ))}
        </select>
        {organizers.length === 0 && (
          <p style={{ marginTop: '6px', fontSize: '11px', color: C.red }}>
            No hay organizadores. Invita uno primero desde &ldquo;Organizadores&rdquo;.
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
            backgroundColor: isPending ? C.accentDim : '#1C1611',
            color: isPending ? C.mutedLight : '#F8F3EC',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.05em',
            cursor: isPending ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.15s',
          }}
        >
          {isPending ? 'Creando...' : 'Crear evento'}
        </button>

        <Link
          href="/superadmin"
          style={{
            padding: '11px 20px',
            backgroundColor: 'transparent',
            border: `1px solid ${C.borderBright}`,
            borderRadius: '8px',
            fontSize: '12px',
            color: C.muted,
            textDecoration: 'none',
            letterSpacing: '0.02em',
          }}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
