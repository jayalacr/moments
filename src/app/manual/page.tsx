import { Cormorant_Garamond, Jost } from 'next/font/google';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { waLink } from '@/lib/contact';

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '500'], style: ['normal', 'italic'], variable: '--font-cormorant' });
const jost = Jost({ subsets: ['latin'], weight: ['300', '400'], variable: '--font-jost' });

export const metadata = {
  title: 'Manual de Usuario',
};

const h2: React.CSSProperties = { fontFamily: 'var(--font-cormorant)', fontSize: '22px', fontWeight: 500, marginTop: '40px', marginBottom: '12px', color: '#1C1611' };
const h3: React.CSSProperties = { fontFamily: 'var(--font-jost)', fontSize: '13px', fontWeight: 500, letterSpacing: '0.04em', marginTop: '22px', marginBottom: '8px', color: '#B8965A', textTransform: 'uppercase' };
const p: React.CSSProperties = { fontSize: '14px', lineHeight: 1.8, color: '#5C5248', marginBottom: '12px' };
const li: React.CSSProperties = { fontSize: '14px', lineHeight: 1.8, color: '#5C5248', marginBottom: '6px' };

const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' };
const th: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', borderBottom: '1.5px solid #1C1611', color: '#1C1611', fontWeight: 500 };
const td: React.CSSProperties = { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid #E6DDD2', color: '#5C5248' };

function CompareTable({ rows }: { rows: [string, string, string, string][] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}></th>
            <th style={th}>Essential</th>
            <th style={th}>Plus</th>
            <th style={th}>Deluxe</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, e, pl, d]) => (
            <tr key={label}>
              <td style={{ ...td, color: '#1C1611' }}>{label}</td>
              <td style={td}>{e}</td>
              <td style={td}>{pl}</td>
              <td style={td}>{d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ManualPage() {
  const contactWaHref = waLink('Hola, tengo una duda sobre cómo configurar mi invitación.');

  return (
    <div className={`${cormorant.variable} ${jost.variable}`} style={{ fontFamily: 'var(--font-jost), system-ui, sans-serif', background: '#FAF7F2', color: '#1C1611', minHeight: '100dvh' }}>
      <SiteHeader />
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '64px 24px 96px' }}>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 400, marginBottom: '8px' }}>
          Manual de Usuario
        </h1>
        <p style={{ ...p, color: '#9B8B78', marginBottom: '28px' }}>
          Guía para configurar tu invitación desde el panel de organizador.
        </p>

        <h2 style={h2}>¿Quién puede acceder?</h2>
        <p style={p}>
          <strong>Organizador</strong> — tú. Acceso completo: edita toda la invitación, previsualiza y administra confirmaciones.
        </p>
        <p style={p}>
          <strong>Wedding planner</strong> (opcional) — si contrataste uno, puede tener su propio acceso al mismo evento.
          Su acceso está limitado únicamente a <strong>ver y administrar la lista de invitados</strong> (altas, confirmaciones,
          reenvío de links); no ve ni edita el resto de la configuración de la invitación. Pídenos que lo invitemos con su
          correo y lo asociemos a tu evento.
        </p>

        <h2 style={h2}>Configurando tu invitación</h2>

        <h3 style={h3}>Paso 1 — Datos principales</h3>
        <p style={p}>Nombres de los festejados, padres de familia, fecha y hora del evento, frase o cita de bienvenida y tu foto principal.</p>

        <h3 style={h3}>Paso 2 — Fotos</h3>
        <p style={p}>Sube tu foto principal primero. Según tu plan puedes agregar más fotos para el carrusel. Usa fotos horizontales y de buena resolución.</p>

        <h3 style={h3}>Paso 3 — Itinerario y lugar</h3>
        <p style={p}>Agrega cada momento del evento con hora y dirección, pega el link de Google Maps si tu plan lo incluye, define el dress code y, si aplica, agrega hoteles y transporte para boda destino.</p>

        <h3 style={h3}>Paso 4 — Regalos</h3>
        <p style={p}>Datos de transferencia (banco, cuenta, CLABE), link a tu mesa de regalos externa y opción de sobre de regalo.</p>

        <h3 style={h3}>Paso 5 — Confirmación de invitados (RSVP)</h3>
        <p style={p}>Según tu plan, tus invitados confirman por WhatsApp, por un formulario general, o con su link personalizado precargado. Si tu plan tiene dashboard, ahí ves quién confirmó, quién falta y cuántos acompañantes.</p>

        <h3 style={h3}>Paso 6 — Revisar y publicar</h3>
        <p style={p}>Usa el botón de Vista previa para ver tu invitación como la verán tus invitados. Cuando todo esté listo, publica. Recuerda: la invitación deja de estar disponible ~2 días después de la fecha del evento.</p>

        <h2 style={h2}>Qué incluye cada plan</h2>

        <h3 style={h3}>Presentación</h3>
        <CompareTable rows={[
          ['Frase, cita, nombres y padres', 'Sí', 'Sí', 'Sí'],
          ['Loader animado de entrada', 'No', 'No', 'Animación personalizada'],
          ['Cuenta regresiva', 'No', 'Sí', 'Sí'],
          ['Música de fondo', 'No', 'No', 'Sí'],
        ]} />

        <h3 style={h3}>Fotos</h3>
        <CompareTable rows={[
          ['Imágenes en la invitación', 'Hasta 5 + portada', '5 a 10 + portada', 'Hasta 15, distribuidas a lo largo'],
        ]} />

        <h3 style={h3}>Logística</h3>
        <CompareTable rows={[
          ['Itinerario', 'Estático', 'Animado', 'Animado'],
          ['Ubicaciones', 'Sin mapa', 'Google Maps interactivo', 'Google Maps interactivo'],
          ['Dress code', 'Sí', 'Sí', 'Sí'],
          ['Boda destino (hoteles/transporte)', 'No', 'Sí', 'Sí'],
          ['Agendar en Google Calendar', 'No', 'No', 'Sí'],
        ]} />

        <h3 style={h3}>Regalos</h3>
        <CompareTable rows={[
          ['Datos de transferencia', 'Sí', 'Sí', 'Sí'],
          ['Mesa de regalos (link externo)', 'Sí', 'Sí', 'Sí'],
          ['Sobre de regalo', 'Sí', 'Sí', 'Sí'],
        ]} />

        <h3 style={h3}>Confirmación de asistencia</h3>
        <CompareTable rows={[
          ['Tipo de confirmación', 'Botón a WhatsApp', 'Formulario interno', 'Formulario personalizado (link único)'],
          ['Control de acompañantes', 'No', 'Máximo global', 'Por invitado individual'],
          ['Panel de confirmaciones', 'No', 'Conteo general', 'Dashboard completo'],
        ]} />

        <h3 style={h3}>Panel de administración</h3>
        <CompareTable rows={[
          ['Editar invitación', 'Sí', 'Sí', 'Sí'],
          ['Vista previa en tiempo real', 'Sí', 'Sí', 'Sí'],
          ['Estadísticas de confirmaciones', 'No', 'Totales generales', 'Por invitado individual'],
          ['Gestión de lista de invitados', 'No', 'No', 'Sí'],
        ]} />

        <h2 style={h2}>Dudas frecuentes</h2>
        <p style={p}><strong>¿Puedo editar después de publicar?</strong> Sí, puedes seguir editando tus datos en cualquier momento desde tu panel, sin costo adicional.</p>
        <p style={p}><strong>¿Qué pasa si me equivoco de fecha?</strong> Contáctanos, ese campo no lo debes cambiar tú solo porque afecta cuándo se cierra la invitación.</p>
        <p style={p}><strong>¿Cuánto antes puedo publicar?</strong> Todos los planes incluyen 2 meses de anticipación; si necesitas más, puedes comprar meses adicionales.</p>
        <p style={p}><strong>¿Mi wedding planner puede editar fotos o el itinerario?</strong> No, su acceso es solo para la lista de invitados y confirmaciones.</p>

        <p style={{ ...p, marginTop: '32px' }}>
          ¿Tienes dudas?{' '}
          {contactWaHref ? <a href={contactWaHref} target="_blank" rel="noopener noreferrer" style={{ color: '#B8965A' }}>escríbenos por WhatsApp</a> : 'escríbenos por WhatsApp'}.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
