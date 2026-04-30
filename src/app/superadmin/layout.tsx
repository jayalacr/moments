'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { JetBrains_Mono, DM_Sans } from 'next/font/google';
import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';
import { Menu, X } from 'lucide-react';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={`${mono.variable} ${sans.variable}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        backgroundColor: C.bg,
        fontFamily: 'var(--font-sans)',
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

        .sa-mobile-header {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background-color: ${C.sidebar};
          border-bottom: 1px solid ${C.border};
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .sa-sidebar-wrapper {
          display: flex;
          flex: 1;
          position: relative;
        }

        .sa-sidebar {
          width: 210px;
          flex-shrink: 0;
          background-color: ${C.sidebar};
          border-right: 1px solid ${C.border};
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .sa-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 45;
          opacity: 0;
          transition: opacity 0.3s;
        }

        @media (max-width: 768px) {
          .sa-mobile-header { display: flex; }
          .sa-backdrop { display: block; pointer-events: none; }
          .sa-backdrop.visible { opacity: 1; pointer-events: auto; }
          .sa-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100dvh;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .sa-sidebar.open { transform: translateX(0); }
        }
      `}</style>

      {/* Mobile Header */}
      <header className="sa-mobile-header">
        <button
          onClick={() => setSidebarOpen(true)}
          style={{ background: 'transparent', border: 'none', color: C.text, padding: '4px', cursor: 'pointer', display: 'flex' }}
        >
          <Menu size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '13px', fontWeight: 600, color: C.accent, letterSpacing: '0.05em' }}>
            moments
          </p>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '2px', textTransform: 'uppercase' }}>
            superadmin
          </span>
        </div>
      </header>

      <div className="sa-sidebar-wrapper">
        <div className={"sa-backdrop " + (sidebarOpen ? "visible" : "")} onClick={() => setSidebarOpen(false)} />

        {/* ── Sidebar ── */}
        <aside className={"sa-sidebar " + (sidebarOpen ? "open" : "")}>
          {/* Brand */}
          <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid ' + C.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '13px', fontWeight: 600, color: C.accent, letterSpacing: '0.10em', marginBottom: '2px' }}>
                moments
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.accent, boxShadow: '0 0 6px ' + C.accent }} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '3px', textTransform: 'uppercase' }}>
                  superadmin
                </p>
              </div>
            </div>
            <button
              className="mobile-close-btn"
              onClick={() => setSidebarOpen(false)}
              style={{ background: 'transparent', border: 'none', color: C.muted, padding: '4px', cursor: 'pointer' }}
            >
              <X size={18} />
              <style>{'@media (min-width: 769px) { .mobile-close-btn { display: none !important; } }'}</style>
            </button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '2px', padding: '0 12px', marginBottom: '8px' }}>
              SISTEMA
            </p>

            <Link href="/superadmin" className={`sa-nav-item${pathname === '/superadmin' || pathname.startsWith('/superadmin/eventos') ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon">▣</span>
              Eventos
            </Link>

            <Link href="/superadmin/organizadores" className={`sa-nav-item${pathname.startsWith('/superadmin/organizadores') ? ' active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon">◈</span>
              Usuarios
            </Link>

            <div style={{ margin: '16px 0 8px', borderTop: '1px solid ' + C.border }} />

            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.muted, letterSpacing: '2px', padding: '0 12px', marginBottom: '8px' }}>
              ACCIONES
            </p>

            <Link href="/superadmin/eventos/nuevo" className="sa-nav-item" onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon" style={{ color: C.accent }}>+</span>
              Nuevo evento
            </Link>
          </nav>

          {/* Footer */}
          <div style={{ padding: '16px 12px', borderTop: '1px solid ' + C.border }}>
            <LogoutButton
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '9px 12px',
                backgroundColor: 'transparent',
                border: '1px solid ' + C.border,
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
        <main style={{ flex: 1, overflow: 'auto', color: C.text, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
