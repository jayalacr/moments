'use client';

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

interface Event { id: string; title: string; plan: string; }
interface Profile { full_name: string | null; email: string | null; }

const C = {
  bg: '#F8F3EC',
  logo: '#B28735',
  text: '#1C1611',
  border: '#EDE5D8',
};

export default function AdminShell({
  profile,
  events,
  children,
}: {
  profile: Profile | null;
  events: Event[];
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', backgroundColor: C.bg, fontFamily: 'var(--font-jost)' }}>
      <style>{`
        .admin-mobile-header {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 60;
          height: 56px;
          background: white;
          border-bottom: 1px solid ${C.border};
          align-items: center;
          padding: 0 20px;
          gap: 16px;
        }
        @media (max-width: 768px) {
          .admin-mobile-header { display: flex; }
          .admin-main { padding-top: 56px; }
        }
      `}</style>

      {/* Mobile top bar */}
      <header className="admin-mobile-header">
        <button
          onClick={() => setSidebarOpen(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.text, padding: 4, display: 'flex', alignItems: 'center' }}
        >
          <Menu size={22} />
        </button>
        <p style={{ fontFamily: 'var(--font-montserrat)', fontSize: '20px', fontWeight: 300, fontStyle: 'italic', color: C.logo, margin: 0 }}>
          moments
        </p>
      </header>

      <AdminSidebar
        profile={profile}
        events={events}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="admin-main" style={{ flex: 1, overflow: 'auto', color: C.text }}>
        {children}
      </main>
    </div>
  );
}
