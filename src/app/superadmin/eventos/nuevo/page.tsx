import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import NuevoEventoForm from './_components/NuevoEventoForm';

export const metadata: Metadata = { title: 'Nuevo Evento' };

const C = {
  muted: '#9C8E82',
  mutedLight: '#C5B9B0',
  accent: '#C9A87C',
  text: '#1C1611',
  border: '#EDE5D8',
};

export default async function NuevoEventoPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'superadmin') redirect('/admin');

  const { data: organizers } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'organizador')
    .order('full_name');

  const { data: me } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', user.id)
    .single();

  return (
    <div style={{ padding: '40px 48px', maxWidth: '600px', boxSizing: 'border-box' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <Link href="/superadmin" style={{ fontSize: '11px', color: C.muted, textDecoration: 'none' }}>
          Eventos
        </Link>
        <span style={{ fontSize: '11px', color: C.mutedLight }}>/</span>
        <span style={{ fontSize: '11px', color: C.accent }}>Nuevo</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '32px',
            fontWeight: 300,
            fontStyle: 'italic',
            color: C.text,
            lineHeight: 1.1,
            marginBottom: '8px',
          }}
        >
          Nuevo evento
        </h1>
        <p style={{ fontSize: '12px', color: C.muted }}>
          El evento se crea en estado <span style={{ color: C.accent }}>borrador</span> — publica cuando esté listo.
        </p>
      </div>

      {/* Separador */}
      <div style={{ height: '1px', backgroundColor: C.border, marginBottom: '28px' }} />

      <NuevoEventoForm organizers={organizers ?? []} me={me} />
    </div>
  );
}
