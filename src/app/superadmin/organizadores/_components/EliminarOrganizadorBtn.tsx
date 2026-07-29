'use client';

import { useState, useTransition } from 'react';
import { deleteOrganizador } from '../_actions';

const C = {
  border: '#EDE5D8',
  text: '#1C1611', muted: '#9C8E82',
  red: '#C0392B', redDim: 'rgba(192,57,43,0.1)',
  card: '#FFFFFF',
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
          fontSize: '10px',
          letterSpacing: '1px',
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
            backgroundColor: 'rgba(28,22,17,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 50,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div style={{
            backgroundColor: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: '14px',
            padding: '28px 32px',
            maxWidth: '440px',
            width: '90%',
          }}>
            <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: C.red, marginBottom: '12px' }}>
              Confirmar eliminación
            </p>
            <p style={{ fontSize: '15px', color: C.text, marginBottom: '8px' }}>
              {nombre || email}
            </p>
            <p style={{ fontSize: '12px', color: C.muted, lineHeight: 1.6, marginBottom: '20px' }}>
              Se eliminará la cuenta del usuario y perderá acceso a todos los eventos asignados. Los eventos quedarán reasignados al superadmin. No se puede deshacer.
            </p>

            {error && (
              <p style={{ fontSize: '11px', color: C.red, marginBottom: '16px' }}>
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
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  fontWeight: 500,
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
