import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EliminarOrganizadorBtn } from './_components/EliminarOrganizadorBtn';
import { InvitarOrganizadorForm } from './_components/InvitarOrganizadorForm';

const C = {
  bg: '#0D1117', border: '#222D3F', borderBright: '#2D3F57',
  accent: '#2DD4BF', accentDim: 'rgba(45,212,191,0.1)',
  text: '#EAF0FB', muted: '#7A90A8', mutedMid: '#9DB2C8',
  green: '#4ADE80', greenDim: 'rgba(74,222,128,0.12)',
};

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  organizador:     { label: 'Organizador',    color: C.accent,  bg: C.accentDim },
  'wedding-planner': { label: 'Wedding Planner', color: '#F0C060', bg: 'rgba(240,192,96,0.12)' },
};

export default async function UsuariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'superadmin') redirect('/admin');

  const admin = createAdminClient();
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, full_name, email, role, created_at')
    .in('role', ['organizador', 'wedding-planner'])
    .order('created_at', { ascending: false });

  const usuarios = profiles ?? [];

  return (
    <div style={{ padding: '32px 40px', maxWidth: '680px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '3px', color: C.muted, marginBottom: '8px' }}>
          SISTEMA
        </p>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 400, color: C.text }}>
          Usuarios
        </h1>
        <p style={{ marginTop: '4px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: C.muted }}>
          {usuarios.length} registrado{usuarios.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Formulario de invitación */}
      <InvitarOrganizadorForm />

      {/* Lista */}
      {usuarios.length === 0 ? (
        <div style={{ padding: '40px', border: `1px dashed ${C.border}`, borderRadius: '10px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: C.muted }}>
            No hay usuarios aún.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {usuarios.map(u => {
            const badge = ROLE_BADGE[u.role] ?? ROLE_BADGE.organizador;
            return (
              <div
                key={u.id}
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: C.text, margin: 0 }}>
                      {u.full_name || '—'}
                    </p>
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px',
                      fontSize: '9px', fontFamily: 'var(--font-mono)',
                      letterSpacing: '1.5px', textTransform: 'uppercase',
                      fontWeight: 600, flexShrink: 0,
                      color: badge.color, backgroundColor: badge.bg,
                    }}>
                      {badge.label}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: C.muted, margin: 0 }}>
                    {u.email}
                  </p>
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: C.muted, flexShrink: 0 }}>
                  {new Date(u.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <EliminarOrganizadorBtn
                  organizadorId={u.id}
                  nombre={u.full_name ?? ''}
                  email={u.email}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
