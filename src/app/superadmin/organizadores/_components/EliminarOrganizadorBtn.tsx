'use client';

import { useState, useTransition } from 'react';
import { deleteOrganizador } from '../_actions';

const C = {
  border: '#222D3F',
  text: '#EAF0FB', muted: '#7A90A8',
  red: '#F87171', redDim: 'rgba(248,113,113,0.12)',
  bg: '#0D1117', bgModal: '#161B22',
};

interface Props {
  organizadorId: string;
  nombre: string;
  email: string;
}

export function EliminarOrganizadorBtn({ organizadorId, nombre, email }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteOrganizador(organizadorId);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error desconocido');
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '6px 12px',
          border: `1px solid ${C.red}`,
          borderRadius: '6px',
          backgroundColor: 'transparent',
          color: C.red,
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Eliminar
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div style={{
            backgroundColor: C.bgModal,
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            padding: '28px 32px',
            maxWidth: '440px',
            width: '90%',
          }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '3px', color: C.red, marginBottom: '12px' }}>
              CONFIRMAR ELIMINACIÓN
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', color: C.text, marginBottom: '8px' }}>
              {nombre || email}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: C.muted, lineHeight: 1.6, marginBottom: '20px' }}>
              Se eliminará la cuenta del organizador y perderá acceso a todos sus eventos. Los eventos quedarán reasignados al superadmin. No se puede deshacer.
            </p>

            {error && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: C.red, marginBottom: '16px' }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                style={{
                  padding: '9px 20px',
                  backgroundColor: C.red,
                  color: '#0D1117',
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                {isPending ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                onClick={() => { setOpen(false); setError(null); }}
                disabled={isPending}
                style={{
                  padding: '9px 20px',
                  border: `1px solid ${C.border}`,
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  color: C.muted,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
