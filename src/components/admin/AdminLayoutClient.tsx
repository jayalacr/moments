'use client';

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { usePathname } from 'next/navigation';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  profile: any;
  events: any[];
}

export default function AdminLayoutClient({ children, profile, events }: AdminLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const pathname = usePathname();

  const isPreview = pathname?.includes('/preview');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: '100%', overflow: 'hidden' }}>
      {/* Desktop Toggle Button (when hidden) */}
      {!isPreview && isSidebarHidden && (
        <button
          onClick={() => setIsSidebarHidden(false)}
          className="sidebar-toggle-desktop"
          title="Mostrar menú"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile Header */}
      {!isPreview && (
        <div className="admin-mobile-header" suppressHydrationWarning>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#1C1611',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
            }}
          >
            <Menu size={24} />
          </button>
          <p
            style={{
              fontFamily: 'var(--font-montserrat)',
              fontSize: '20px',
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#B28735',
              margin: 0,
            }}
          >
            moments
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        <AdminSidebar 
          profile={profile} 
          events={events} 
          isOpen={isMobileMenuOpen} 
          isHidden={isSidebarHidden}
          onToggleCollapse={() => setIsSidebarHidden(!isSidebarHidden)}
          onClose={() => setIsMobileMenuOpen(false)} 
        />
        <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s ease' }}>
          {children}
        </main>
      </div>

      <style>{`
        .sidebar-toggle-desktop {
          position: fixed;
          left: 20px;
          top: 20px;
          z-index: 60;
          background: #FFFFFF;
          border: 1px solid #EDE5D8;
          border-radius: 8px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #1C1611;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: all 0.2s;
        }
        .sidebar-toggle-desktop:hover {
          background: #F8F3EC;
          border-color: #C9A87C;
          transform: scale(1.05);
        }
        @media (max-width: 768px) {
          .sidebar-toggle-desktop { display: none; }
        }
        .admin-mobile-header {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: #FFFFFF;
          border-bottom: 1px solid #EDE5D8;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        @media (max-width: 768px) {
          .admin-mobile-header {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}
