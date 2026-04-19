'use client';

import { useEffect } from 'react';
import { Cormorant_Garamond, Jost } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400'],
});

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FAF7F2',
      color: '#1C1611',
      textAlign: 'center',
      padding: '24px',
    }}>
      <p style={{
        fontFamily: jost.style.fontFamily,
        fontSize: '11px',
        letterSpacing: '0.4em',
        textTransform: 'uppercase',
        color: '#B8965A',
        marginBottom: '40px'
      }}>
        Moments
      </p>
      
      <div style={{ width: '40px', height: '1px', background: '#D2691E', marginBottom: '40px' }} />
      
      <h1 style={{
        fontFamily: cormorant.style.fontFamily,
        fontSize: '48px',
        fontWeight: 300,
        fontStyle: 'italic',
        lineHeight: 1.1,
        marginBottom: '16px'
      }}>
        Algo salió mal
      </h1>
      
      <p style={{
        fontFamily: jost.style.fontFamily,
        fontSize: '14px',
        fontWeight: 300,
        color: '#9B8B78',
        maxWidth: '300px',
        lineHeight: 1.8,
        marginBottom: '40px'
      }}>
        Hubo un error inesperado. Estamos trabajando para solucionarlo.
      </p>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => reset()}
          style={{
            fontFamily: jost.style.fontFamily,
            fontSize: '12px',
            fontWeight: 400,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            backgroundColor: '#1C1611',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '100px',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease'
          }}
        >
          Reintentar
        </button>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            fontFamily: jost.style.fontFamily,
            fontSize: '12px',
            fontWeight: 400,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#1C1611',
            backgroundColor: 'transparent',
            border: '1px solid #E6DDD2',
            padding: '12px 24px',
            borderRadius: '100px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Inicio
        </button>
      </div>
    </div>
  );
}
