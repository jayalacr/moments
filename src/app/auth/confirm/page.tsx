'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthConfirmPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // El cliente de Supabase detecta automáticamente los tokens en el hash de la URL
    // y los intercambia por una sesión, disparando onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        router.replace('/setup-password');
      }
    });

    // Fallback: si después de 5 segundos no pasa nada, mostrar error
    const timeout = setTimeout(() => {
      setError('El enlace ha expirado o es inválido. Solicita una nueva invitación.');
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
