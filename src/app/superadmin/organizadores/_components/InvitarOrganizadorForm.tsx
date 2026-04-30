'use client';

import { useState, useTransition } from 'react';
import { inviteOrganizador } from '../_actions';

const C = {
  border: '#222D3F', borderBright: '#2D3F57',
  accent: '#2DD4BF', accentDim: 'rgba(45,212,191,0.1)',
  text: '#EAF0FB', muted: '#7A90A8',
  bg: '#0D1117',
};

export function InvitarOrganizadorForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        await inviteOrganizador(formData);
        setSuccess(true);
        form.reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al invitar');
      }
    });
  }

  return (
    <div style={{
      padding: '24px',
      border: `1px solid ${C.border}`,
      borderRadius: '10px',
      marginBottom: '32px',
    }}>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '9px',
        letterSpacing: '3px', color: C.accent,
        marginBottom: '16px', textTransform: 'uppercase',
      }}>
        Invitar usuario
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          name="name"
          placeholder="Nombre completo"
          required
          style={{
            padding: '10px 14px',
            border: `1px solid ${C.border}`,
            borderRadius: '6px',
            backgroundColor: C.bg,
            color: C.text,
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <input
          name="email"
          type="email"
          placeholder="correo@ejemplo.com"
          required
          style={{
            padding: '10px 14px',
            border: `1px solid ${C.border}`,
            borderRadius: '6px',
            backgroundColor: C.bg,
            color: C.text,
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <select
          name="role"
          defaultValue="organizador"
          style={{
            padding: '10px 14px',
            border: `1px solid ${C.border}`,
            borderRadius: '6px',
            backgroundColor: C.bg,
            color: C.text,
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            outline: 'none',
          }}
        >
          <option value="organizador">Organizador</option>
          <option value="wedding-planner">Wedding Planner</option>
        </select>

        {error && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#F87171' }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#4ADE80' }}>
            Invitación enviada correctamente.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '10px 20px',
            backgroundColor: C.accent,
            color: C.bg,
            border: 'none',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontWeight: 700,
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.6 : 1,
            alignSelf: 'flex-start',
          }}
        >
          {isPending ? 'Enviando...' : 'Enviar invitación'}
        </button>
      </form>
    </div>
  );
}
