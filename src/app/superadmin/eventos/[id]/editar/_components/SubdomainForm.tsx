'use client';

import { useState, useTransition } from 'react';
import { updateSubdomain } from '../_actions';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'moments-mx.com';

const C = {
  bg: '#F8F3EC',
  sidebar: '#FFFFFF',
  border: '#EDE5D8',
  borderBright: '#D8CBB8',
  accent: '#C9A87C',
  accentDim: 'rgba(201,168,124,0.12)',
  text: '#1C1611',
  muted: '#9C8E82',
  mutedMid: '#7A6F63',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  backgroundColor: C.sidebar,
  border: `1px solid ${C.borderBright}`,
  borderRadius: '6px 0 0 6px',
  borderRight: 'none',
  color: C.text,
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
};

interface Props {
  eventId: string;
  currentSubdomain: string;
}

export default function SubdomainForm({ eventId, currentSubdomain }: Props) {
  const [value, setValue] = useState(currentSubdomain);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setValue(val);
    setSaved(false);
    if (val.length > 1 && !/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(val)) {
      setError('Solo letras minúsculas, números y guiones (sin empezar/terminar en guión)');
    } else {
      setError('');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (error || !value) return;
    startTransition(async () => {
      const result = await updateSubdomain(eventId, value);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <div style={{ marginBottom: '0' }}>
      <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: C.muted, marginBottom: '12px' }}>
        Subdominio
      </p>

      <form onSubmit={handleSubmit}>
        <style>{`#subdomain-input:focus { border-color: ${C.accent} !important; }`}</style>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <input
            id="subdomain-input"
            value={value}
            onChange={handleChange}
            placeholder="nombre-evento"
            style={inputStyle}
          />
          <span style={{
            padding: '10px 14px',
            backgroundColor: C.bg,
            border: `1px solid ${C.borderBright}`,
            borderLeft: 'none',
            fontSize: '12px',
            color: C.muted,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
          }}>
            .{ROOT_DOMAIN}
          </span>
          <button
            type="submit"
            disabled={isPending || !!error || !value}
            style={{
              marginLeft: '12px',
              padding: '10px 20px',
              backgroundColor: saved ? 'rgba(201,168,124,0.15)' : C.accent,
              color: saved ? C.accent : '#F8F3EC',
              border: saved ? `1px solid ${C.accent}` : 'none',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor: (isPending || !!error || !value) ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              opacity: (!!error || !value) ? 0.5 : 1,
              transition: 'all 0.15s',
            }}
          >
            {isPending ? 'guardando...' : saved ? '✓ guardado' : 'guardar'}
          </button>
        </div>

        {error && (
          <p style={{ marginTop: '8px', fontSize: '10px', color: '#C0392B' }}>
            {error}
          </p>
        )}
        {!error && (
          <p style={{ marginTop: '8px', fontSize: '10px', color: C.muted }}>
            // Preview: {value || '____'}.{ROOT_DOMAIN}
          </p>
        )}
      </form>
    </div>
  );
}
