import { Cormorant_Garamond, Jost } from 'next/font/google';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { waLink } from '@/lib/contact';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500'], style: ['normal', 'italic'], variable: '--font-cormorant' });
const jost = Jost({ subsets: ['latin'], weight: ['300', '400'], variable: '--font-jost' });

export const metadata = {
  title: 'Términos y Condiciones',
  robots: { index: false, follow: false },
};

const h2: React.CSSProperties = { fontFamily: 'var(--font-cormorant)', fontSize: '20px', fontWeight: 500, marginTop: '36px', marginBottom: '10px', color: '#1C1611' };
const p: React.CSSProperties = { fontSize: '14px', lineHeight: 1.8, color: '#5C5248', marginBottom: '12px' };

export default function TerminosPage() {
  const contactWaHref = waLink('Hola, tengo una duda sobre los términos y condiciones de Moments.');

  return (
    <div className={`${cormorant.variable} ${jost.variable}`} style={{ fontFamily: 'var(--font-jost), system-ui, sans-serif', background: '#FAF7F2', color: '#1C1611', minHeight: '100dvh' }}>
      <SiteHeader />
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 24px 96px' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 400, marginBottom: '8px' }}>
          Términos y Condiciones
        </h1>
        <p style={{ ...p, color: '#9B8B78', marginBottom: '28px' }}>Última actualización: julio de 2026.</p>

        <div style={{ border: '1px solid #E6DDD2', borderRadius: '10px', padding: '16px 20px', background: '#FFFFFF', marginBottom: '32px' }}>
          <p style={{ ...p, marginBottom: 0, fontSize: '12.5px' }}>
            <strong>Borrador pendiente de revisión legal.</strong> Recomendado que alguien con conocimiento legal lo revise antes de considerarlo definitivo.
          </p>
        </div>

        <p style={p}>
          Estos términos rigen el uso de la plataforma Moments, operada por code4u. Al contratar un plan,
          aceptas lo siguiente.
        </p>

        <h2 style={h2}>1. El servicio</h2>
        <p style={p}>
          Moments crea y aloja una invitación digital personalizada para tu evento (boda, XV años, bautizo o
          graduación), con las funciones correspondientes a tu plan: Essential, Plus o Deluxe. Los precios y
          funciones vigentes de cada plan se muestran en <span style={{ fontStyle: 'italic' }}>/planes</span>{' '}
          y en tu cotización.
        </p>

        <h2 style={h2}>2. Tiempo de entrega</h2>
        <p style={p}>
          Tras compartirnos tus datos y confirmar tu pago, la primera versión de tu invitación está lista en
          3 a 5 días hábiles. Puedes revisarla desde tu panel de organizador antes de que se publique.
        </p>

        <h2 style={h2}>3. Vigencia y publicación</h2>
        <p style={p}>
          Todos los planes incluyen 2 meses de publicación contados hacia atrás desde la fecha de tu evento
          (es decir, puedes publicar tu invitación hasta 2 meses antes de la boda sin costo adicional). Si
          necesitas publicarla con más anticipación, puedes contratar meses adicionales.
        </p>
        <p style={p}>
          Tu invitación deja de estar disponible públicamente en la fecha de tu evento. Los datos se
          conservan 30 días adicionales por si deseas reactivarla; después de ese plazo pueden eliminarse de
          forma permanente.
        </p>

        <h2 style={h2}>4. Pago</h2>
        <p style={p}>
          El pago se realiza por transferencia bancaria. Para iniciar el diseño de tu invitación se requiere
          un anticipo del 50% del total; el 50% restante se liquida antes de publicarla. Los datos de la
          cuenta se comparten directamente por WhatsApp al confirmar tu plan.
        </p>

        <h2 style={h2}>5. Cambios y correcciones</h2>
        <p style={p}>
          Puedes editar el contenido de tu invitación (nombres, fotos, itinerario, y demás información)
          cuantas veces quieras desde tu panel de organizador, sin costo adicional, mientras la invitación
          esté vigente.
        </p>

        <h2 style={h2}>6. Cancelaciones y reembolsos</h2>
        <p style={p}>
          Si solicitas la cancelación antes de que te entreguemos la primera versión de tu invitación, te
          reembolsamos el 100% de tu pago. Una vez entregada la primera versión, el servicio se considera
          realizado y no aplica reembolso, ya que el trabajo de diseño ya se llevó a cabo.
        </p>

        <h2 style={h2}>7. Propiedad de la información</h2>
        <p style={p}>
          El diseño de las plantillas es propiedad de Moments. El contenido que cargas (fotos, textos, datos
          de tus invitados) es tuyo — lo usamos únicamente para operar tu invitación y no lo reutilizamos con
          otros fines.
        </p>

        <h2 style={h2}>8. Responsabilidad del organizador</h2>
        <p style={p}>
          Eres responsable de la veracidad de la información que publicas en tu invitación, incluyendo datos
          de invitados y datos bancarios de mesa de regalos, y de contar con el consentimiento de tus
          invitados para tratar sus datos dentro de la plataforma.
        </p>

        <h2 style={h2}>9. Ley aplicable</h2>
        <p style={p}>
          Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier controversia se
          resolverá ante los tribunales de Monterrey, Nuevo León.
        </p>

        <h2 style={h2}>10. Contacto</h2>
        <p style={p}>
          Para dudas sobre estos términos,{' '}
          {contactWaHref ? <a href={contactWaHref} target="_blank" rel="noopener noreferrer" style={{ color: '#B8965A' }}>escríbenos por WhatsApp</a> : 'escríbenos por WhatsApp'}.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
