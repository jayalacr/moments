import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import NuevoEventoForm from './_components/NuevoEventoForm';

const C = {
  muted: '#7A90A8',
  mutedMid: '#9DB2C8',
  accent: '#2DD4BF',
  text: '#EAF0FB',
  border: '#222D3F',
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

  return (
    <div style={{ padding: '32px 40px', maxWidth: '560px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
        <Link
          href="/superadmin"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.muted, textDecoration: 'none', letterSpacing: '1px' }}
        >
          /eventos
        </Link>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.muted }}>/</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.accent, letterSpacing: '1px' }}>nuevo</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 400, color: C.text, letterSpacing: '-0.01em', marginBottom: '8px' }}>
          Nuevo evento
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: C.mutedMid }}>
          // El evento se crea en estado <span style={{ color: C.accent }}>draft</span> — publica cuando esté listo
        </p>
      </div>

      {/* Separador */}
      <div style={{ height: '1px', backgroundColor: C.border, marginBottom: '28px' }} />

      <NuevoEventoForm organizers={organizers ?? []} />
    </div>
  );
}
