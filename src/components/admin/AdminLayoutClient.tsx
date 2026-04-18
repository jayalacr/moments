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
  const pathname = usePathname();

  const isPreview = pathname?.includes('/preview');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {/* Mobile Header */}
      {!isPreview && (
        <div className="admin-mobile-header">
          <p
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '20px',
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#1C1611',
              margin: 0,
            }}
          >
            Moments
          </p>
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
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <AdminSidebar 
          profile={profile} 
          events={events} 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
        <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>

      <style>{`
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
