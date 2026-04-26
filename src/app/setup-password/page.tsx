'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Jost } from 'next/font/google';

const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'] });

export default function SetupPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError('Ocurrió un error. Intenta de nuevo.');
      setLoading(false);
      return;
    }

    // Enviar email de bienvenida (sin bloquear el flujo si falla)
    fetch('/api/welcome-email', { method: 'POST' }).catch(() => {});

    router.push('/admin');
  }

  return (
    <div
      className={jost.className}
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F3EC',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#C9A87C', textTransform: 'uppercase', marginBottom: '8px' }}>
            moments
          </p>
          <h1 style={{ fontSize: '22px', fontWeight: 300, color: '#1C1611', letterSpacing: '1px' }}>
            Crea tu contraseña
          </h1>
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#7A6A5A', lineHeight: 1.6 }}>
            Elige una contraseña para acceder a tu panel.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#7A6A5A' }}>
              Contraseña
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                padding: '12px 14px',
                border: '1px solid #DDD5C8',
                borderRadius: '6px',
                backgroundColor: '#fff',
                fontSize: '15px',
                color: '#1C1611',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#7A6A5A' }}>
              Confirmar contraseña
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{
                padding: '12px 14px',
                border: '1px solid #DDD5C8',
                borderRadius: '6px',
                backgroundColor: '#fff',
                fontSize: '15px',
                color: '#1C1611',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: '#C0392B', textAlign: 'center' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '14px',
              backgroundColor: '#1C1611',
              color: '#F8F3EC',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Guardando...' : 'Guardar y entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
