import { Cormorant_Garamond, Jost } from 'next/font/google';
import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';
import { createClient } from '@/lib/supabase/server';

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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user?.id ?? '')
    .single();

  const { data: event } = await supabase
    .from('events')
    .select('plan')
    .eq('owner_id', user?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const showGuests = event?.plan === 'plus' || event?.plan === 'deluxe';

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
        {/* Brand */}
        <div style={{ padding: '28px 20px 24px', borderBottom: `1px solid ${C.border}` }}>
          <p
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '22px',
              fontWeight: 300,
              fontStyle: 'italic',
              color: C.text,
              letterSpacing: '0.05em',
              lineHeight: 1,
            }}
          >
            Moments
          </p>
          <p style={{ marginTop: '6px', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: C.accent }}>
            Mi panel
          </p>
          {event?.plan && (
            <div style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '100px', backgroundColor: event.plan === 'deluxe' ? '#1C1611' : event.plan === 'plus' ? '#FDFBF7' : '#F5F1EC', border: `1px solid ${event.plan === 'deluxe' ? '#1C1611' : C.border}` }}>
              <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: event.plan === 'deluxe' ? '#C9A87C' : C.accent }}>
                Plan {event.plan}
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <Link href="/admin" className="admin-nav-link active">
            <span className="dot" />
            Mi evento
          </Link>
          {showGuests && (
            <Link href="/admin/invitados" className="admin-nav-link">
              <span className="dot" />
              Invitados & RSVP
            </Link>
          )}
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
