import { redirect } from 'next/navigation';
import { getRsvpsForOwnEvent } from './_actions';
import ConfirmacionesClient from './_components/ConfirmacionesClient';

const C = {
  accent: '#C9A87C',
  text: '#1C1611',
  muted: '#9C8E82',
  mutedLight: '#C5B9B0',
  border: '#EDE5D8',
  accentLight: 'rgba(201,168,124,0.12)',
};

export default async function ConfirmacionesPage() {
  const { rsvps, event, stats, maxCapacity } = await getRsvpsForOwnEvent();

  if (!event) redirect('/admin');

  if (event.plan === 'essential') {
    return (
      <div style={{ padding: '40px 48px', maxWidth: '760px' }}>
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: C.accent, marginBottom: '8px' }}>
            Confirmaciones
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '36px',
              fontWeight: 300,
              fontStyle: 'italic',
              color: C.text,
              lineHeight: 1.1,
            }}
          >
            No disponible en tu plan
          </h1>
        </div>
        <div
          style={{
            padding: '32px 36px',
            border: `1px solid ${C.border}`,
            borderRadius: '12px',
            backgroundColor: C.accentLight,
          }}
        >
          <p style={{ fontSize: '14px', color: C.muted, lineHeight: 1.7 }}>
            El panel de confirmaciones está disponible en los planes{' '}
            <span style={{ color: C.text, fontWeight: 500 }}>Plus</span> y{' '}
            <span style={{ color: C.text, fontWeight: 500 }}>Deluxe</span>.
            Consulta con tu administrador para conocer las opciones de actualización.
          </p>
        </div>
      </div>
    );
  }

  const totalRsvps = rsvps.length;

  return (
    <div style={{ padding: '40px 48px', maxWidth: '900px' }}>
      {/* Cabecera */}
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: C.accent, marginBottom: '8px' }}>
          Confirmaciones
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', flexWrap: 'wrap' }}>
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '36px',
              fontWeight: 300,
              fontStyle: 'italic',
              color: C.text,
              lineHeight: 1.1,
            }}
          >
            Respuestas de invitados
          </h1>
          {totalRsvps > 0 && (
            <span style={{ fontSize: '13px', color: C.mutedLight }}>
              {totalRsvps} {totalRsvps === 1 ? 'respuesta' : 'respuestas'}
            </span>
          )}
        </div>
      </div>

      <ConfirmacionesClient rsvps={rsvps} stats={stats} plan={event.plan} maxCapacity={maxCapacity} />
    </div>
  );
}
