'use client';

import React, { useState } from 'react';
import { Monitor, Smartphone, X } from 'lucide-react';
import Link from 'next/link';

interface PreviewClientProps {
  children: React.ReactNode;
  eventId: string;
}

export default function PreviewClient({ children, eventId }: PreviewClientProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#F0F0F0' }}>
      {/* Toolbar */}
      <div style={{
        height: '56px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E5E5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 100,
        flexShrink: 0,
      }}>
        <Link
          href={`/admin/eventos/${eventId}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#666',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <X size={18} />
          Salir de vista previa
        </Link>

        <div style={{
          display: 'flex',
          backgroundColor: '#F5F5F5',
          padding: '4px',
          borderRadius: '8px',
          gap: '4px',
        }}>
          <button
            onClick={() => setViewMode('desktop')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'desktop' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'desktop' ? '#1C1611' : '#999',
              boxShadow: viewMode === 'desktop' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            <Monitor size={16} />
            Desktop
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: viewMode === 'mobile' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'mobile' ? '#1C1611' : '#999',
              boxShadow: viewMode === 'mobile' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            <Smartphone size={16} />
            Móvil
          </button>
        </div>

        <div style={{ width: '140px' }} />
      </div>

      {/* Preview Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        alignItems: viewMode === 'mobile' ? 'flex-start' : 'stretch',
        justifyContent: 'center',
        padding: viewMode === 'mobile' ? '40px 0 60px' : '0',
      }}>
        {viewMode === 'mobile' ? (
          /* Phone frame — iframe gives the template its own 375px viewport
             so @media queries fire correctly, identical to real mobile */
          <div style={{
            width: '375px',
            height: '812px',
            backgroundColor: '#FFFFFF',
            borderRadius: '40px',
            border: '12px solid #1C1611',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {/* Notch */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '150px',
              height: '30px',
              backgroundColor: '#1C1611',
              borderBottomLeftRadius: '18px',
              borderBottomRightRadius: '18px',
              zIndex: 20,
            }} />

            <iframe
              src={`/embed/${eventId}`}
              title="Vista previa móvil"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
              }}
            />
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF', overflow: 'auto' }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
