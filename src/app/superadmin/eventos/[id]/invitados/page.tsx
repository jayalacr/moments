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

const C = {
  bg: '#0D1117',
  muted: '#7A90A8',
  accent: '#2DD4BF',
  text: '#EAF0FB',
};

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
          padding: 32px 40px;
          width: 100%;
          max-width: 1200px;
          box-sizing: border-box;
          background-color: ${C.bg};
          min-height: 100vh;
          color: ${C.text};
        }
        @media (max-width: 768px) {
          .sa-invitados-container {
            padding: 20px 16px;
          }
        }
      `}</style>
      <div style={{ marginBottom: '28px' }}>
        <Link
          href={`/superadmin/eventos/${id}`}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.muted, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}
        >
          ← volver al evento
        </Link>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: C.accent, marginBottom: '8px' }}>
          Gestión de asistentes
        </p>
        <h1 style={{ fontSize: '20px', fontWeight: 400, color: C.text, lineHeight: 1.2 }}>
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
