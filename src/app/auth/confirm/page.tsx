'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthConfirmPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleConfirm() {
      const supabase = createClient();
      const hash = window.location.hash.substring(1); // quitar el #

      if (!hash) {
        setError('El enlace ha expirado o es inválido. Solicita una nueva invitación.');
        return;
      }

      // Extraer access_token y refresh_token del hash de la URL
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken || !refreshToken) {
        setError('El enlace ha expirado o es inválido. Solicita una nueva invitación.');
        return;
      }

      // Establecer la sesión manualmente con los tokens
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        setError('Error al verificar la invitación. Solicita una nueva.');
        return;
      }

      // Sesión establecida — redirigir a setup-password
      router.replace('/setup-password');
    }

    handleConfirm();
  }, [router]);

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0D1117',
      padding: '24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '380px' }}>
        {error ? (
          <>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '14px',
              color: '#F87171', marginBottom: '16px',
            }}>
              {error}
            </p>
            <a
              href="/login"
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '12px',
                color: '#2DD4BF', textDecoration: 'underline',
              }}
            >
              Ir al login
            </a>
          </>
        ) : (
          <>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px',
              letterSpacing: '3px', color: '#7A90A8',
              textTransform: 'uppercase', marginBottom: '12px',
            }}>
              moments
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '14px',
              color: '#EAF0FB',
            }}>
              Verificando invitación...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
