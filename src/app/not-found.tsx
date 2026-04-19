import Link from 'next/link';
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

export default function NotFound() {
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
      
      <div style={{ width: '1px', height: '60px', background: 'linear-gradient(to bottom, transparent, #B8965A)', marginBottom: '40px' }} />
      
      <h1 style={{
        fontFamily: cormorant.style.fontFamily,
        fontSize: '48px',
        fontWeight: 300,
        fontStyle: 'italic',
        lineHeight: 1.1,
        marginBottom: '16px'
      }}>
        Página no encontrada
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
        Parece que el enlace que sigues no existe o ha sido movido.
      </p>
      
      <Link 
        href="/"
        style={{
          fontFamily: jost.style.fontFamily,
          fontSize: '12px',
          fontWeight: 400,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#1C1611',
          textDecoration: 'none',
          padding: '12px 24px',
          border: '1px solid #E6DDD2',
          borderRadius: '100px',
          transition: 'all 0.2s ease'
        }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
