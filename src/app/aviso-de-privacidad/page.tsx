import { Cormorant_Garamond, Jost } from 'next/font/google';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500'], style: ['normal', 'italic'], variable: '--font-cormorant' });
const jost = Jost({ subsets: ['latin'], weight: ['300', '400'], variable: '--font-jost' });

export const metadata = {
  title: 'Aviso de Privacidad',
  robots: { index: false, follow: false },
};

const h2: React.CSSProperties = { fontFamily: 'var(--font-cormorant)', fontSize: '20px', fontWeight: 500, marginTop: '36px', marginBottom: '10px', color: '#1C1611' };
const p: React.CSSProperties = { fontSize: '14px', lineHeight: 1.8, color: '#5C5248', marginBottom: '12px' };
const li: React.CSSProperties = { fontSize: '14px', lineHeight: 1.8, color: '#5C5248', marginBottom: '6px' };
const placeholder: React.CSSProperties = { color: '#B8965A', fontStyle: 'italic' };

export default function AvisoDePrivacidadPage() {
  return (
    <div className={`${cormorant.variable} ${jost.variable}`} style={{ fontFamily: 'var(--font-jost), system-ui, sans-serif', background: '#FAF7F2', color: '#1C1611', minHeight: '100dvh' }}>
      <SiteHeader />
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 24px 96px' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 400, marginBottom: '8px' }}>
          Aviso de Privacidad
        </h1>
        <p style={{ ...p, color: '#9B8B78', marginBottom: '28px' }}>Última actualización: julio de 2026.</p>

        <div style={{ border: '1px solid #E6DDD2', borderRadius: '10px', padding: '16px 20px', background: '#FFFFFF', marginBottom: '32px' }}>
          <p style={{ ...p, marginBottom: 0, fontSize: '12.5px' }}>
            <strong>Borrador pendiente de revisión legal.</strong> Los campos marcados en{' '}
            <span style={placeholder}>cursiva dorada</span> deben completarse antes de publicar esta página de forma definitiva.
          </p>
        </div>

        <p style={p}>
          <span style={placeholder}>[Razón social / nombre legal]</span>, operadora de la plataforma Moments
          (en adelante, &ldquo;Moments&rdquo;, &ldquo;nosotros&rdquo;), con domicilio en{' '}
          <span style={placeholder}>[domicilio fiscal]</span>, es responsable del tratamiento de tus datos
          personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los
          Particulares (LFPDPPP).
        </p>

        <h2 style={h2}>¿Qué datos personales recabamos?</h2>
        <p style={p}>Dependiendo de tu relación con Moments, podemos recabar:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
          <li style={li}><strong>Organizadores:</strong> nombre, correo electrónico y número de teléfono, al crear tu cuenta o al ser invitado como colaborador.</li>
          <li style={li}><strong>Invitados:</strong> nombre y, si el organizador lo captura, número de teléfono, para el envío y seguimiento de invitaciones.</li>
          <li style={li}><strong>Confirmaciones (RSVP):</strong> nombre de quien confirma, número de acompañantes, y mensajes opcionales dirigidos a los organizadores.</li>
          <li style={li}><strong>Datos bancarios de mesa de regalos:</strong> cuando el organizador decide publicarlos en su invitación (banco, titular, cuenta, CLABE), estos datos los captura y controla directamente el organizador — Moments los almacena pero no los genera ni los verifica.</li>
        </ul>

        <h2 style={h2}>¿Para qué usamos tus datos?</h2>
        <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
          <li style={li}>Crear y administrar tu invitación digital y tu panel de organizador.</li>
          <li style={li}>Enviar la invitación a tus invitados y darles seguimiento a sus confirmaciones.</li>
          <li style={li}>Enviarte correos transaccionales (bienvenida, avisos de expiración de tu invitación, restablecimiento de contraseña).</li>
          <li style={li}>Dar soporte por WhatsApp cuando nos contactas.</li>
          <li style={li}>Medir el uso del sitio de forma agregada y anónima (ver sección de analítica).</li>
        </ul>

        <h2 style={h2}>¿Con quién compartimos tus datos?</h2>
        <p style={p}>
          No vendemos ni rentamos tus datos personales. Para operar la plataforma, utilizamos a los
          siguientes encargados del tratamiento, que procesan datos en nuestro nombre bajo sus propias
          políticas de seguridad:
        </p>
        <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
          <li style={li}><strong>Supabase</strong> — base de datos y autenticación.</li>
          <li style={li}><strong>Cloudinary</strong> — almacenamiento y optimización de fotografías.</li>
          <li style={li}><strong>Resend</strong> — envío de correos transaccionales.</li>
          <li style={li}><strong>Vercel</strong> — hospedaje de la aplicación y analítica agregada de uso (Vercel Analytics), sin cookies de rastreo publicitario.</li>
        </ul>

        <h2 style={h2}>¿Cuánto tiempo conservamos tus datos?</h2>
        <p style={p}>
          Tu invitación permanece activa hasta la fecha de tu evento. A partir de esa fecha, la invitación
          deja de estar disponible públicamente; los datos se conservan por 30 días adicionales por si deseas
          reactivarla, y después pueden eliminarse de nuestra base de datos y de las imágenes almacenadas en
          Cloudinary.
        </p>

        <h2 style={h2}>Tus derechos ARCO</h2>
        <p style={p}>
          Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales
          (derechos ARCO), así como a revocar tu consentimiento. Para ejercerlos, escríbenos a{' '}
          <span style={placeholder}>[correo de contacto para privacidad]</span>.
        </p>

        <h2 style={h2}>Cambios a este aviso</h2>
        <p style={p}>
          Podemos actualizar este aviso de privacidad. Publicaremos cualquier cambio en esta misma página
          con su fecha de actualización correspondiente.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
