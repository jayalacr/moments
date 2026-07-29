import { Cormorant_Garamond, Jost } from 'next/font/google';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500'], style: ['normal', 'italic'], variable: '--font-cormorant' });
const jost = Jost({ subsets: ['latin'], weight: ['300', '400'], variable: '--font-jost' });

export const metadata = {
  title: 'Aviso de Privacidad',
  robots: { index: false, follow: false },
};

export default function AvisoDePrivacidadPage() {
  return (
    <div className={`${cormorant.variable} ${jost.variable}`} style={{ fontFamily: 'var(--font-jost), system-ui, sans-serif', background: '#FAF7F2', color: '#1C1611', minHeight: '100dvh' }}>
      <SiteHeader />
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 24px 96px' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 400, marginBottom: '24px' }}>
          Aviso de Privacidad
        </h1>
        <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#5C5248', border: '1px solid #E6DDD2', borderRadius: '10px', padding: '20px 24px', background: '#FFFFFF' }}>
          Este contenido está pendiente de redacción. Moments trata datos personales de organizadores e
          invitados (nombres, teléfonos, y en algunos casos datos bancarios para mesas de regalo) a través
          de Supabase (base de datos) y Cloudinary (imágenes) como encargados del tratamiento. El aviso de
          privacidad definitivo, conforme a la LFPDPPP, debe redactarse antes del lanzamiento público.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
