import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

const C = {
  bg: '#0D1117', border: '#222D3F', borderBright: '#2D3F57',
  accent: '#2DD4BF', accentDim: 'rgba(45,212,191,0.1)',
  text: '#EAF0FB', muted: '#7A90A8', mutedMid: '#9DB2C8',
  green: '#4ADE80', greenDim: 'rgba(74,222,128,0.12)',
};

export default async function OrganizadoresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'superadmin') redirect('/admin');

  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, email, created_at')
    .eq('role', 'organizador')
    .order('created_at', { ascending: false });

  const organizadores = profiles ?? [];

  return (
    <div style={{ padding: '32px 40px', maxWidth: '680px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '3px', color: C.muted, marginBottom: '8px' }}>
            SISTEMA
          </p>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 400, color: C.text }}>
            Organizadores
          </h1>
          <p style={{ marginTop: '4px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: C.muted }}>
            {organizadores.length} registrado{organizadores.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/superadmin/organizadores/nuevo"
          style={{
            padding: '9px 18px', backgroundColor: C.accent,
            color: '#0D1117', borderRadius: '6px',
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            letterSpacing: '2px', textTransform: 'uppercase',
            fontWeight: 700, textDecoration: 'none',
          }}
        >
          + Invitar
        </Link>
      </div>

      {/* Lista */}
      {organizadores.length === 0 ? (
        <div style={{ padding: '40px', border: `1px dashed ${C.border}`, borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: C.muted }}>
            No hay organizadores aún.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {organizadores.map(org => (
            <div
              key={org.id}
              style={{
                padding: '16px 20px',
                border: `1px solid ${C.border}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: C.text, marginBottom: '2px' }}>
                  {org.full_name || '—'}
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: C.muted }}>
                  {org.email}
                </p>
              </div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.muted, flexShrink: 0 }}>
                {new Date(org.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
