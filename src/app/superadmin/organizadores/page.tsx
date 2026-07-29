import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Organizadores' };
import { EliminarOrganizadorBtn } from './_components/EliminarOrganizadorBtn';
import { InvitarOrganizadorForm } from './_components/InvitarOrganizadorForm';

const C = {
  card: '#FFFFFF', border: '#EDE5D8',
  accent: '#C9A87C', accentDim: 'rgba(201,168,124,0.12)',
  text: '#1C1611', muted: '#9C8E82',
  gold: '#8B6914', goldDim: 'rgba(139,105,20,0.1)',
};

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  organizador:       { label: 'Organizador',     color: C.accent, bg: C.accentDim },
  'wedding-planner':  { label: 'Wedding Planner', color: C.gold,   bg: C.goldDim },
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
    <div style={{ padding: '40px 48px', maxWidth: '680px', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: C.accent, marginBottom: '8px' }}>
          Sistema
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '32px',
            fontWeight: 300,
            fontStyle: 'italic',
            color: C.text,
            lineHeight: 1.1,
          }}
        >
          Organizadores
        </h1>
        <p style={{ marginTop: '8px', fontSize: '12px', color: C.muted }}>
          {usuarios.length} registrado{usuarios.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Formulario de invitación */}
      <InvitarOrganizadorForm />

      {/* Lista */}
      {usuarios.length === 0 ? (
        <div style={{ padding: '40px', border: `1px dashed ${C.border}`, borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: C.muted }}>
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
                  borderRadius: '10px',
                  backgroundColor: C.card,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <p style={{ fontSize: '13px', color: C.text, margin: 0 }}>
                      {u.full_name || '—'}
                    </p>
                    <span style={{
                      padding: '2px 8px', borderRadius: '20px',
                      fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase',
                      fontWeight: 600, flexShrink: 0,
                      color: badge.color, backgroundColor: badge.bg,
                    }}>
                      {badge.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: C.muted, margin: 0 }}>
                    {u.email}
                  </p>
                </div>
                <p style={{ fontSize: '11px', color: C.muted, flexShrink: 0 }}>
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
