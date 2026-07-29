'use client';

import { useState, useTransition } from 'react';
import { inviteOrganizador } from '../_actions';

const C = {
  border: '#EDE5D8', borderBright: '#D8CBB8',
  accent: '#C9A87C',
  text: '#1C1611', muted: '#9C8E82',
  card: '#FFFFFF',
  red: '#C0392B', green: '#5A7A5A',
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
      borderRadius: '12px',
      backgroundColor: C.card,
      marginBottom: '32px',
    }}>
      <p style={{
        fontSize: '11px',
        letterSpacing: '1.5px', color: C.accent,
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
            border: `1px solid ${C.borderBright}`,
            borderRadius: '6px',
            backgroundColor: '#FDFCFB',
            color: C.text,
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
            border: `1px solid ${C.borderBright}`,
            borderRadius: '6px',
            backgroundColor: '#FDFCFB',
            color: C.text,
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <select
          name="role"
          defaultValue="organizador"
          style={{
            padding: '10px 14px',
            border: `1px solid ${C.borderBright}`,
            borderRadius: '6px',
            backgroundColor: '#FDFCFB',
            color: C.text,
            fontSize: '13px',
            outline: 'none',
          }}
        >
          <option value="organizador">Organizador</option>
          <option value="wedding-planner">Wedding Planner</option>
        </select>

        {error && (
          <p style={{ fontSize: '11px', color: C.red }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{ fontSize: '11px', color: C.green }}>
            Invitación enviada correctamente.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1C1611',
            color: '#F8F3EC',
            border: 'none',
            borderRadius: '6px',
            fontSize: '11px',
            letterSpacing: '0.05em',
            fontWeight: 500,
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
