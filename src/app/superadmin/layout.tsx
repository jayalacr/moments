import { JetBrains_Mono, DM_Sans } from 'next/font/google';
import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
});

const C = {
  bg: '#0D1117',
  sidebar: '#161B26',
  border: '#222D3F',
  borderBright: '#2D3F57',
  accent: '#2DD4BF',
  accentDim: 'rgba(45,212,191,0.12)',
  text: '#EAF0FB',
  muted: '#7A90A8',
  mutedMid: '#9DB2C8',
};

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${mono.variable} ${sans.variable}`}
      style={{
        display: 'flex',
        minHeight: '100dvh',
        backgroundColor: C.bg,
        fontFamily: 'var(--font-sans)',
        // subtle dot grid
        backgroundImage: `radial-gradient(${C.border} 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
      }}
    >
      <style>{`
        .sa-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 5px;
          font-size: 13px;
          text-decoration: none;
          color: ${C.mutedMid};
          transition: color 0.15s, background 0.15s;
          cursor: pointer;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          font-family: var(--font-sans);
        }
        .sa-nav-item:hover { color: ${C.text}; background: rgba(255,255,255,0.03); }
        .sa-nav-item.active { color: ${C.accent}; background: ${C.accentDim}; }
        .sa-nav-item .nav-icon {
          font-family: var(--font-mono);
          font-size: 11px;
          width: 16px;
          text-align: center;
        }
      `}</style>

      {/* ── Sidebar ── */}
      <aside
        style={{
          width: '210px',
          flexShrink: 0,
          backgroundColor: C.sidebar,
          borderRight: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${C.border}` }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: C.accent, letterSpacing: '0.05em', marginBottom: '2px' }}>
            moments
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.accent, boxShadow: `0 0 6px ${C.accent}` }} />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '3px', textTransform: 'uppercase' }}>
              superadmin
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '2px', padding: '0 12px', marginBottom: '8px' }}>
            SISTEMA
          </p>

          <Link href="/superadmin" className="sa-nav-item active">
            <span className="nav-icon">▣</span>
            Eventos
          </Link>

          <Link href="/superadmin/organizadores" className="sa-nav-item">
            <span className="nav-icon">◈</span>
            Organizadores
          </Link>

          <div style={{ margin: '16px 0 8px', borderTop: `1px solid ${C.border}` }} />

          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '2px', padding: '0 12px', marginBottom: '8px' }}>
            ACCIONES
          </p>

          <Link href="/superadmin/eventos/nuevo" className="sa-nav-item">
            <span className="nav-icon" style={{ color: C.accent }}>+</span>
            Nuevo evento
          </Link>
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 12px', borderTop: `1px solid ${C.border}` }}>
          <LogoutButton
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '9px 12px',
              backgroundColor: 'transparent',
              border: `1px solid ${C.border}`,
              borderRadius: '5px',
              color: C.muted,
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              textAlign: 'left',
              transition: 'border-color 0.15s, color 0.15s',
            }}
          >
            <span style={{ fontSize: '10px' }}>⏻</span> exit session
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
