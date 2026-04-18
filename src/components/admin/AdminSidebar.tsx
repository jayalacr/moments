'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, Calendar, Users, LayoutDashboard, Eye, Edit3, LogOut, Sparkles } from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';

const C = {
  bg: '#F8F3EC',
  sidebar: '#FFFFFF',
  border: '#EDE5D8',
  accent: '#C9A87C',
  text: '#1C1611',
  muted: '#9C8E82',
  accentLight: 'rgba(201,168,124,0.10)',
};

interface Event {
  id: string;
  title: string;
  plan: string;
}

interface AdminSidebarProps {
  profile: { full_name: string | null; email: string | null } | null;
  events: Event[];
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ profile, events, isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isEventsExpanded, setIsEventsExpanded] = useState(true);
  const [expandedEventIds, setExpandedEventIds] = useState<string[]>([]);
  
  // Detect active event from URL
  const eventMatch = pathname.match(/\/admin\/eventos\/([^\/]+)/);
  const activeEventId = eventMatch ? eventMatch[1] : null;

  // Auto-expand active event on mount/navigation
  useEffect(() => {
    if (activeEventId && !expandedEventIds.includes(activeEventId)) {
      setExpandedEventIds(prev => [...prev, activeEventId]);
    }
  }, [activeEventId]);

  const toggleEventExpand = (eventId: string) => {
    setExpandedEventIds(prev => 
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const isActive = (path: string) => pathname === path;
  const isParentActive = (path: string) => pathname.startsWith(path);

  // Hide sidebar on preview pages
  if (pathname.includes('/preview')) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`sidebar-backdrop${isOpen ? ' visible' : ''}`}
        onClick={onClose}
      />

      <aside
        className={`admin-sidebar${isOpen ? ' open' : ''}`}
        style={{
          width: '260px',
          flexShrink: 0,
          backgroundColor: C.sidebar,
          borderRight: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
      <style>{`
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 400;
          text-decoration: none;
          color: ${C.muted};
          letter-spacing: 0.02em;
          transition: all 0.2s ease;
          cursor: pointer;
          user-select: none;
        }
        .nav-item:hover {
          color: ${C.text};
          background: rgba(0,0,0,0.02);
        }
        .nav-item.active {
          color: ${C.text};
          background: ${C.accentLight};
          font-weight: 500;
        }
        .nav-item.sub {
          padding-left: 36px;
          font-size: 13px;
          margin-top: 2px;
        }
        .nav-item.sub .dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: ${C.muted}; transition: all 0.2s;
        }
        .nav-item.sub.active .dot {
          background: ${C.accent};
          transform: scale(1.5);
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          margin-top: 12px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: ${C.muted};
          font-weight: 600;
        }
        .collapse-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .collapse-btn:hover {
          background: rgba(0,0,0,0.05);
        }

        /* Mobile off-canvas */
        .sidebar-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 54;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        @media (max-width: 768px) {
          .sidebar-backdrop { display: block; pointer-events: none; }
          .sidebar-backdrop.visible { opacity: 1; pointer-events: auto; }
          .admin-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            height: 100dvh !important;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 55 !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.12);
          }
          .admin-sidebar.open { transform: translateX(0); }
        }
      `}</style>

      {/* Brand */}
      <div style={{ padding: '28px 24px 24px', borderBottom: `1px solid ${C.border}` }}>
        <p
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: '24px',
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
          Panel de Control
        </p>
      </div>

      {/* Nav Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        
        {/* Main Section */}
        <div className="section-header">
          Principal
        </div>
        
        <Link 
          href="/admin" 
          className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
        >
          <Calendar size={18} />
          <span>Mis eventos</span>
          <div 
            className="collapse-btn" 
            style={{ marginLeft: 'auto' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsEventsExpanded(!isEventsExpanded);
            }}
          >
            {isEventsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        </Link>

        {/* Events List (Collapsible) */}
        {isEventsExpanded && (
          <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {events.map(event => (
              <div key={event.id}>
                <Link
                  href={`/admin/eventos/${event.id}`}
                  className={`nav-item sub ${activeEventId === event.id ? 'active' : ''}`}
                >
                  <span className="dot" />
                  <span style={{ 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    maxWidth: '140px'
                  }}>
                    {event.title}
                  </span>
                  <div 
                    className="collapse-btn" 
                    style={{ marginLeft: 'auto' }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleEventExpand(event.id);
                    }}
                  >
                    {expandedEventIds.includes(event.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </div>
                </Link>

                {/* Event Sub-menu (Collapsible per event) */}
                {expandedEventIds.includes(event.id) && (
                  <div style={{ marginLeft: '44px', borderLeft: `1px solid ${C.border}`, paddingLeft: '8px', marginTop: '4px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <Link 
                      href={`/admin/eventos/${event.id}`} 
                      className={`nav-item ${isActive(`/admin/eventos/${event.id}`) ? 'active' : ''}`}
                      style={{ padding: '6px 10px', fontSize: '12px', background: 'transparent' }}
                    >
                      <LayoutDashboard size={14} />
                      Resumen
                    </Link>
                    <Link 
                      href={`/admin/eventos/${event.id}/editar`} 
                      className={`nav-item ${isParentActive(`/admin/eventos/${event.id}/editar`) ? 'active' : ''}`}
                      style={{ padding: '6px 10px', fontSize: '12px', background: 'transparent' }}
                    >
                      <Edit3 size={14} />
                      Configurar
                    </Link>
                    {(event.plan === 'plus' || event.plan === 'deluxe') && (
                      <Link 
                        href={`/admin/eventos/${event.id}/invitados`} 
                        className={`nav-item ${isParentActive(`/admin/eventos/${event.id}/invitados`) ? 'active' : ''}`}
                        style={{ padding: '6px 10px', fontSize: '12px', background: 'transparent' }}
                      >
                        <Users size={14} />
                        Invitados
                      </Link>
                    )}
                    <Link 
                      href={`/admin/eventos/${event.id}/preview`} 
                      className={`nav-item ${isParentActive(`/admin/eventos/${event.id}/preview`) ? 'active' : ''}`}
                      style={{ padding: '6px 10px', fontSize: '12px', background: 'transparent' }}
                    >
                      <Eye size={14} />
                      Vista previa
                    </Link>
                  </div>
                )}
              </div>
            ))}
            {events.length === 0 && (
              <p style={{ padding: '10px 40px', fontSize: '12px', color: C.muted, fontStyle: 'italic' }}>
                Sin eventos
              </p>
            )}
          </div>
        )}

      </div>

      {/* Footer Profile */}
      <div style={{ padding: '16px 20px', borderTop: `1px solid ${C.border}`, backgroundColor: '#FDFCFB' }}>
        {profile && (
          <div style={{ marginBottom: '14px' }}>
            <p style={{ fontSize: '13.5px', color: C.text, fontWeight: 500 }}>
              {profile.full_name || 'Organizador'}
            </p>
            <p style={{ fontSize: '11px', color: C.muted, marginTop: '2px', wordBreak: 'break-all' }}>
              {profile.email}
            </p>
          </div>
        )}
        <LogoutButton
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px 14px',
            backgroundColor: 'transparent',
            border: `1px solid ${C.border}`,
            borderRadius: '10px',
            color: C.text,
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: 'var(--font-jost)',
            letterSpacing: '0.02em',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <LogOut size={14} />
          Cerrar sesión
        </LogoutButton>
      </div>
    </aside>
    </>
  );
}
