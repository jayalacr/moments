import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getGuestsForEvent } from './_actions';
import InvitadosClient from './_components/InvitadosClient';

interface Props {
  params: Promise<{ eventId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { eventId } = await params;
  const { event } = await getGuestsForEvent(eventId);
  return { title: `Invitados | ${event?.slug ?? 'Evento'}` };
}

export default async function InvitadosPage({ params }: Props) {
  const { eventId } = await params;
  const { guests, event, whatsappTemplate, rsvps, guestsWithRsvp, stats, maxCapacity } = await getGuestsForEvent(eventId);

  if (!event) redirect('/admin');

  return (
    <div className="admin-invitados-container">
      <style>{`
        .admin-invitados-container {
          padding: 40px 48px;
          width: 100%;
          max-width: 1200px;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .admin-invitados-container {
            padding: 24px 20px;
          }
        }
      `}</style>
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A87C', marginBottom: '8px' }}>
          Gestión de asistentes
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '32px',
            fontWeight: 300,
            fontStyle: 'italic',
            color: '#1C1611',
            lineHeight: 1.1,
          }}
        >
          Invitados & Confirmaciones
        </h1>
      </div>

      <InvitadosClient
        initialGuests={guests}
        event={event}
        initialWhatsappTemplate={whatsappTemplate}
        initialRsvps={rsvps}
        initialGuestsWithRsvp={guestsWithRsvp}
        initialStats={stats}
        initialMaxCapacity={maxCapacity}
      />
    </div>
  );
}
