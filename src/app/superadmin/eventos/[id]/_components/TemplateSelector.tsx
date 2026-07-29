'use client';

import { useState, useTransition } from 'react';
import { updateTemplateType } from '@/app/superadmin/_actions';
import { TEMPLATES } from '@/lib/templates';

const C = {
  border: '#EDE5D8',
  borderBright: '#D8CBB8',
  accent: '#C9A87C',
  accentDim: 'rgba(201,168,124,0.12)',
  text: '#1C1611',
  muted: '#9C8E82',
  mutedMid: '#7A6F63',
  green: '#5A7A5A',
  greenDim: 'rgba(90,122,90,0.12)',
  sidebar: '#FFFFFF',
};

interface Props {
  eventId: string;
  currentType: string | null;
  eventSlug: string;
  eventType: string;
}

export default function TemplateSelector({ eventId, currentType, eventSlug, eventType }: Props) {
  const [selected, setSelected] = useState(currentType ?? '');
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const entries = Object.entries(TEMPLATES).filter(([, e]) => !e.hidden);

  function handleSave() {
    startTransition(async () => {
      await updateTemplateType(eventId, selected);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Template actual */}
      <div style={{ padding: '14px 16px', border: `1px solid ${C.border}`, borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.015)' }}>
        <p style={{ fontSize: '9px', color: C.muted, letterSpacing: '2px', marginBottom: '8px' }}>
          TEMPLATE ASIGNADO
        </p>
        {currentType ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.green }} />
            <span style={{ fontSize: '12px', color: C.text }}>{currentType}</span>
            {TEMPLATES[currentType] && (
              <span style={{ fontSize: '10px', color: C.muted }}>
                — {TEMPLATES[currentType].label}
              </span>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.muted }} />
            <span style={{ fontSize: '12px', color: C.muted }}>
              Sin template — la invitación no es visible aún
            </span>
          </div>
        )}
      </div>

      {/* Lista de templates disponibles */}
      <div>
        <p style={{ fontSize: '9px', color: C.muted, letterSpacing: '2px', marginBottom: '10px' }}>
          TEMPLATES DISPONIBLES
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {entries.map(([key, entry]) => {
            const isSelected = selected === key;
            return (
              <button
                key={key}
                onClick={() => setSelected(isSelected ? '' : key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  border: `1px solid ${isSelected ? C.accent : C.border}`,
                  borderRadius: '8px',
                  backgroundColor: isSelected ? C.accentDim : C.sidebar,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '12px', color: isSelected ? C.accent : C.text }}>
                    {key}
                  </span>
                  <span style={{ fontSize: '10px', color: C.muted }}>
                    {entry.label}
                  </span>
                </div>
              </button>
            );
          })}

          {entries.length === 0 && (
            <p style={{ fontSize: '11px', color: C.muted, padding: '12px 0' }}>
              // No hay templates registrados en src/lib/templates.ts
            </p>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '4px' }}>
        <button
          onClick={handleSave}
          disabled={isPending || selected === (currentType ?? '')}
          style={{
            padding: '10px 20px',
            backgroundColor: isPending ? C.accentDim : C.accent,
            color: '#F8F3EC',
            border: 'none',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            cursor: (isPending || selected === (currentType ?? '')) ? 'not-allowed' : 'pointer',
            opacity: (isPending || selected === (currentType ?? '')) ? 0.5 : 1,
          }}
        >
          {isPending ? 'guardando...' : 'Asignar template'}
        </button>

        {saved && (
          <span style={{ fontSize: '11px', color: C.green }}>
            ✓ Guardado
          </span>
        )}

        {selected && (
          <a
            href={`/${eventType}/${eventSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '11px',
              color: C.mutedMid,
              textDecoration: 'none',
              marginLeft: 'auto',
            }}
          >
            ↗ Ver invitación
          </a>
        )}
      </div>

      {/* Tip */}
      <div style={{ padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.01)' }}>
        <p style={{ fontSize: '10px', color: C.muted, lineHeight: 1.7 }}>
          // Para agregar un nuevo template:<br />
          // 1. Crea el componente en <span style={{ color: C.accent }}>src/components/templates/</span><br />
          // 2. Regístralo en <span style={{ color: C.accent }}>src/lib/templates.ts</span><br />
          // 3. Commit + push → Vercel despliega automáticamente
        </p>
      </div>
    </div>
  );
}
