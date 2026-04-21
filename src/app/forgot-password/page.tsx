'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Jost } from 'next/font/google';
import Link from 'next/link';

const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'] });

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (resetError) {
      setError('Ocurrió un error. Intenta de nuevo.');
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
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
          <p style={{ fontSize: '11px', letterSpacing: '4px', color: '#B28735', marginBottom: '8px' }}>
            moments
          </p>
          <h1 style={{ fontSize: '22px', fontWeight: 300, color: '#1C1611', letterSpacing: '1px' }}>
            Recuperar acceso
          </h1>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '32px' }}>✉️</p>
            <p style={{ fontSize: '15px', color: '#1C1611', fontWeight: 400 }}>
              Revisa tu correo
            </p>
            <p style={{ fontSize: '13px', color: '#7A6A5A', lineHeight: 1.7 }}>
              Te enviamos un enlace para restablecer tu contraseña a <strong>{email}</strong>.
            </p>
            <Link href="/login" style={{ marginTop: '8px', fontSize: '12px', color: '#C9A87C', textDecoration: 'none', letterSpacing: '1px' }}>
              ← Volver al login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: '#7A6A5A', lineHeight: 1.6, marginBottom: '4px' }}>
              Escribe tu correo y te enviaremos un enlace para crear una nueva contraseña.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#7A6A5A' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ padding: '12px 14px', border: '1px solid #DDD5C8', borderRadius: '6px', backgroundColor: '#fff', fontSize: '15px', color: '#1C1611', outline: 'none' }}
              />
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: '#C0392B', textAlign: 'center' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px', padding: '14px',
                backgroundColor: '#1C1611', color: '#F8F3EC',
                border: 'none', borderRadius: '6px',
                fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>

            <Link href="/login" style={{ textAlign: 'center', fontSize: '12px', color: '#C9A87C', textDecoration: 'none' }}>
              ← Volver al login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
