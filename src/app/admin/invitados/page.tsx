import { redirect } from 'next/navigation';
import { getGuestsForOwnEvent } from './_actions';
import InvitadosClient from './_components/InvitadosClient';

export default async function InvitadosPage() {
  const { guests, event } = await getGuestsForOwnEvent();

  if (!event) redirect('/admin');

  return (
    <div style={{ padding: '40px 48px', maxWidth: '860px' }}>
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#C9A87C', marginBottom: '8px' }}>
          Lista de invitados
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
          Invitados
        </h1>
      </div>

      <InvitadosClient
        initialGuests={guests}
        event={event}
      />
    </div>
  );
}
