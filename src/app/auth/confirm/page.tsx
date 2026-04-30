'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken  = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const type         = params.get('type');
    const errorCode    = params.get('error');

    if (errorCode) {
      router.replace('/login?error=invalid_link');
      return;
    }

    if (!accessToken || !refreshToken) {
      setStatus('error');
      return;
    }

    const supabase = createClient();

    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          router.replace('/login?error=invalid_link');
          return;
        }

        if (type === 'invite') {
          router.replace('/setup-password');
        } else if (type === 'recovery') {
          router.replace('/reset-password');
        } else {
          router.replace('/admin');
        }
      });
  }, [router]);

  if (status === 'error') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', fontFamily: 'sans-serif', color: '#9C8E82' }}>
        Link inválido o expirado.{' '}
        <a href="/login" style={{ color: '#C9A87C', marginLeft: '4px' }}>Ir al inicio</a>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', fontFamily: 'sans-serif', color: '#9C8E82' }}>
      Verificando…
    </div>
  );
}
