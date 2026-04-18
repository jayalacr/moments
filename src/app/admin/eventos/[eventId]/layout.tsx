import { Cormorant_Garamond, Jost } from 'next/font/google';
import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
});

const C = {
  bg: '#F8F3EC',
  sidebar: '#FFFFFF',
  border: '#EDE5D8',
  accent: '#C9A87C',
  text: '#1C1611',
  muted: '#9C8E82',
};

interface Props {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}

export default async function EventoLayout({ children, params }: Props) {
  const { eventId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single();

  const { data: event } = await supabase
    .from('events')
    .select('id, title, plan')
    .eq('id', eventId)
    .eq('owner_id', user.id)
    .single();

  if (!event) redirect('/admin');

  const showGuests = event.plan === 'plus' || event.plan === 'deluxe';

  return (
    <div
      className={`${cormorant.variable} ${jost.variable}`}
      style={{
        display: 'flex',
        minHeight: '100dvh',
        backgroundColor: C.bg,
        fontFamily: 'var(--font-jost)',
      }}
    >
      <style>{`
        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 400;
          text-decoration: none;
          color: ${C.muted};
          letter-spacing: 0.03em;
          transition: color 0.2s, background 0.2s;
        }
        .admin-nav-link:hover { color: ${C.text}; background: rgba(0,0,0,0.03); }
        .admin-nav-link.active { color: ${C.text}; background: rgba(201,168,124,0.10); }
        .admin-nav-link .dot {
          width: 5px; height: 5px; border-radius: 50%;
          border: 1.5px solid currentColor; flex-shrink: 0;
        }
        .admin-nav-link.active .dot { background: ${C.accent}; border-color: ${C.accent}; }
        .back-link {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; letter-spacing: 1px; text-transform: uppercase;
          color: ${C.muted}; text-decoration: none;
          transition: color 0.2s;
        }
        .back-link:hover { color: ${C.accent}; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside
        style={{
          width: '220px',
          flexShrink: 0,
          backgroundColor: C.sidebar,
          borderRight: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Brand + back */}
        <div style={{ padding: '28px 20px 24px', borderBottom: `1px solid ${C.border}` }}>
          <Link href="/admin" className="back-link" style={{ marginBottom: '16px', display: 'flex' }}>
            ← Mis eventos
          </Link>
          <p
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '16px',
              fontWeight: 400,
              fontStyle: 'italic',
              color: C.text,
              letterSpacing: '0.03em',
              lineHeight: 1.3,
              marginTop: '12px',
              marginBottom: '8px',
            }}
          >
            {event.title}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '100px', backgroundColor: event.plan === 'deluxe' ? '#1C1611' : '#F5F1EC', border: `1px solid ${event.plan === 'deluxe' ? '#1C1611' : C.border}` }}>
            <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: event.plan === 'deluxe' ? '#C9A87C' : C.accent }}>
              Plan {event.plan}
            </span>
          </div>
        </div>

        {/* Nav contextual */}
        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <Link href={`/admin/eventos/${eventId}`} className="admin-nav-link">
            <span className="dot" />
            Resumen
          </Link>
          <Link href={`/admin/eventos/${eventId}/editar`} className="admin-nav-link">
            <span className="dot" />
            Editar invitación
          </Link>
          {showGuests && (
            <Link href={`/admin/eventos/${eventId}/invitados`} className="admin-nav-link">
              <span className="dot" />
              Invitados & RSVP
            </Link>
          )}
          <Link href={`/admin/eventos/${eventId}/preview`} className="admin-nav-link">
            <span className="dot" />
            Vista previa
          </Link>
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}` }}>
          {profile && (
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '13px', color: C.text, fontWeight: 400 }}>
                {profile.full_name || 'Organizador'}
              </p>
              <p style={{ fontSize: '11px', color: C.muted, marginTop: '2px' }}>
                {profile.email}
              </p>
            </div>
          )}
          <LogoutButton
            style={{
              display: 'block',
              width: '100%',
              padding: '9px 14px',
              backgroundColor: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: '8px',
              color: C.muted,
              fontSize: '12px',
              fontFamily: 'var(--font-jost)',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            Cerrar sesión
          </LogoutButton>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: 'auto', color: C.text }}>
        {children}
      </main>
    </div>
  );
}
