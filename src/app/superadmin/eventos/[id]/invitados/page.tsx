import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getGuestsForEvent } from './_actions';
import InvitadosClient from './_components/InvitadosClient';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('events').select('title').eq('id', id).single();
  return { title: `Invitados | ${data?.title ?? 'Evento'}` };
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SuperadminInvitadosPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'superadmin') redirect('/admin');

  const { guests, event, whatsappTemplate, rsvps, guestsWithRsvp, stats, maxCapacity } = await getGuestsForEvent(id);

  if (!event) redirect('/superadmin');

  return (
    <div className="sa-invitados-container">
      <style>{`
        .sa-invitados-container {
          padding: 40px 48px;
          width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .sa-invitados-container { padding: 24px 20px; }
        }
      `}</style>
      <div style={{ marginBottom: '36px' }}>
        <Link
          href={`/superadmin/eventos/${id}`}
          style={{ fontSize: '11px', color: '#9C8E82', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}
        >
          ← volver al evento
        </Link>
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
