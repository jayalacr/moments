'use client';

import { useState, useTransition, useEffect, useRef, createContext, useContext } from 'react';
import { updateEventConfig } from '@/app/admin/_actions';
import ImageUpload from '@/components/ui/ImageUpload';
import { uploadImage } from '@/components/ui/ImageUpload';
import AudioUpload from '@/components/ui/AudioUpload';
import ImageLayoutEditor from './ImageLayoutEditor';
import type { PhotoEntry } from '@/lib/imageLayout';
import { PhotoPositionerModal } from './PhotoPositionerModal';
import { cld, T } from '@/lib/cloudinary';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ItineraryItem { time: string; name: string; venue: string; address: string; mapsUrl?: string; image?: string; imageObjectPosition?: string; imageScale?: number; }
interface Swatch { color: string; name: string; }
interface Hotel { name: string; category: string; address: string; note: string; phone: string; }
interface TransportRow { time: string; detail: string; }

interface EventConfig {
  heroLabel: string;
  monogram?: string;
  couple: { person1: string; person2: string };
  fullNames: { person1: string; person2: string };
  date: { day: string; month: string; year: string };
  location: string;
  targetDate: string;
  photos: PhotoEntry[];
  quote: { text: string; reference: string };
  parents: { person1: string; person2: string };
  itinerary: ItineraryItem[];
  dressCode: { label: string; description: string; women: string; men: string; swatches: Swatch[]; avoid: Swatch[] };
  notes: string[];
  gifts: { bank: string; holder: string; account: string; clabe: string; giftListUrl: string; giftListLabel: string; giftTypes: string[]; envelopeMessage: string };
  destination: {
    hotels: Hotel[];
    transport: { info: string; schedule: TransportRow[]; contact: string };
  };
  music: { url: string; title: string; artist: string };
  whatsapp: { number: string; message: string };
  noChildren: boolean;
  noChildrenMessage: string;
  rsvpDeadline: string;
  rsvp: { maxPlusOnes: number; deadline: string };
  dietary: { enabled: boolean; options: string[] };
  theme: {
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    displayFont: 'cormorant' | 'playfair' | 'eb-garamond';
    bodyFont: 'jost' | 'raleway' | 'montserrat';
  };
  sections: {
    quote: boolean;
    parents: boolean;
    dressCode: boolean;
    notes: boolean;
    gifts: boolean;
    destination: boolean;
    itinerary: boolean;
  };
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------
const DEFAULT: EventConfig = {
  heroLabel: '',
  monogram: '',
  couple: { person1: '', person2: '' },
  fullNames: { person1: '', person2: '' },
  date: { day: '', month: '', year: '' },
  location: '',
  targetDate: '',
  photos: [],
  quote: { text: '', reference: '' },
  parents: { person1: '', person2: '' },
  itinerary: [{ time: '', name: '', venue: '', address: '' }],
  dressCode: { label: '', description: '', women: '', men: '', swatches: [], avoid: [] },
  notes: [''],
  gifts: { bank: '', holder: '', account: '', clabe: '', giftListUrl: '', giftListLabel: '', giftTypes: [], envelopeMessage: '' },
  destination: {
    hotels: [],
    transport: { info: '', schedule: [], contact: '' },
  },
  music: { url: '', title: '', artist: '' },
  whatsapp: { number: '', message: '' },
  noChildren: false,
  noChildrenMessage: '',
  rsvpDeadline: '',
  rsvp: { maxPlusOnes: 2, deadline: '' },
  dietary: { enabled: false, options: ['Vegetariano', 'Vegano', 'Sin gluten', 'Sin lácteos', 'Sin mariscos', 'Otro'] },
  sections: {
    quote: false,
    parents: false,
    dressCode: false,
    notes: false,
    gifts: false,
    destination: false,
    itinerary: true,
  },
  theme: {
    accentColor: '#B8965A',
    backgroundColor: '#F8F3EC',
    textColor: '#1C1611',
    displayFont: 'cormorant',
    bodyFont: 'jost',
  },
};

// ---------------------------------------------------------------------------
// Color palettes
// ---------------------------------------------------------------------------
type Colors = typeof LIGHT;
const LIGHT = {
  border:      '#EDE5D8',
  accent:      '#C9A87C',
  accentLight: 'rgba(201,168,124,0.10)',
  text:        '#1C1611',
  muted:       '#9C8E82',
  mutedLight:  '#C5B9B0',
  bg:          '#F8F3EC',
  card:        '#FFFFFF',
  font:        'var(--font-jost), system-ui',
  monoFont:    'var(--font-jost), system-ui',
  isDark:      false,
};
const DARK = {
  border:      '#222D3F',
  accent:      '#2DD4BF',
  accentLight: 'rgba(45,212,191,0.10)',
  text:        '#EAF0FB',
  muted:       '#7A90A8',
  mutedLight:  '#4A6080',
  bg:          '#0D1117',
  card:        '#161B22',
  font:        'var(--font-mono), system-ui',
  monoFont:    'var(--font-mono), system-ui',
  isDark:      true,
};

// ---------------------------------------------------------------------------
// Font preview maps
// ---------------------------------------------------------------------------
const DISPLAY_FONT_FAMILY: Record<string, string> = {
  cormorant:     "'Cormorant Garamond', Georgia, serif",
  playfair:      "'Playfair Display', Georgia, serif",
  'eb-garamond': "'EB Garamond', Georgia, serif",
  cinzel:        "'Cinzel', Georgia, serif",
  pinyon:        "'Pinyon Script', cursive",
};
const DISPLAY_FONT_LABEL: Record<string, string> = {
  cormorant:     'Cormorant Garamond',
  playfair:      'Playfair Display',
  'eb-garamond': 'EB Garamond',
  cinzel:        'Cinzel',
  pinyon:        'Pinyon Script',
};
const BODY_FONT_FAMILY: Record<string, string> = {
  jost:       "'Jost', system-ui, sans-serif",
  raleway:    "'Raleway', system-ui, sans-serif",
  montserrat: "'Montserrat', system-ui, sans-serif",
  lora:       "'Lora', Georgia, serif",
};
const BODY_FONT_LABEL: Record<string, string> = {
  jost:       'Jost',
  raleway:    'Raleway',
  montserrat: 'Montserrat',
  lora:       'Lora',
};

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Playfair+Display:ital,wght@0,400;1,400&family=EB+Garamond:ital,wght@0,400;1,400&family=Cinzel:wght@400&family=Pinyon+Script:wght@400&family=Jost:wght@300&family=Raleway:wght@300&family=Montserrat:wght@300&family=Lora:ital,wght@0,400;1,400&display=swap';

// ---------------------------------------------------------------------------
// Mobile context — avoids prop-drilling through every sub-component
// ---------------------------------------------------------------------------
const MobileCtx = createContext(false);
const useMobile = () => useContext(MobileCtx);

// ---------------------------------------------------------------------------
// Style factories (depend on colors + viewport)
// ---------------------------------------------------------------------------
function makeStyles(C: Colors, isMobile = false) {
  const input: React.CSSProperties = {
    width: '100%',
    padding: isMobile ? '13px 14px' : '10px 12px',
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
    backgroundColor: C.card,
    // 16px minimum on mobile prevents iOS auto-zoom on focus
    fontSize: isMobile ? '16px' : '14px',
    color: C.text,
    fontFamily: C.font,
    outline: 'none',
    boxSizing: 'border-box',
  };
  return {
    input,
    textarea: { ...input, resize: 'vertical' as const, minHeight: '88px', lineHeight: '1.6' },
    lbl: {
      display: 'block',
      fontSize: '11px',
      letterSpacing: '1.5px',
      textTransform: 'uppercase' as const,
      color: C.muted,
      marginBottom: '7px',
      fontFamily: C.font,
    } as React.CSSProperties,
    addBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: isMobile ? '11px 18px' : '7px 14px',
      border: `1px dashed ${C.border}`,
      borderRadius: '8px',
      backgroundColor: 'transparent',
      // accent instead of muted so the button is actually visible
      color: C.accent,
      fontSize: isMobile ? '14px' : '12px',
      cursor: 'pointer',
      fontFamily: C.font,
      minHeight: isMobile ? '44px' : 'auto',
    } as React.CSSProperties,
    removeBtn: {
      padding: isMobile ? '9px 16px' : '4px 10px',
      border: `1px solid ${C.border}`,
      borderRadius: '6px',
      backgroundColor: 'transparent',
      color: C.mutedLight,
      fontSize: isMobile ? '13px' : '11px',
      cursor: 'pointer',
      fontFamily: C.font,
      flexShrink: 0,
      minHeight: isMobile ? '44px' : 'auto',
    } as React.CSSProperties,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Section({
  title, C, children, visible, onVisibilityChange, summary, defaultOpen = false,
}: {
  title: string;
  C: Colors;
  children: React.ReactNode;
  visible?: boolean;
  onVisibilityChange?: (v: boolean) => void;
  summary?: string;
  defaultOpen?: boolean;
}) {
  const isMobile = useMobile();
  const [expanded, setExpanded] = useState(defaultOpen);
  const hasToggle = onVisibilityChange !== undefined;
  return (
    <div style={{
      borderBottom: `1px solid ${C.border}`,
      // Left accent bar: colored when section is toggled visible, subtle when not
      borderLeft: hasToggle
        ? `3px solid ${visible ? C.accent : C.border}`
        : '3px solid transparent',
      paddingLeft: hasToggle ? '14px' : '3px',
      transition: 'border-color 0.25s',
    }}>
      {/* Header colapsable */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: isMobile ? '18px 0' : '14px 0',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer', userSelect: 'none', gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <span style={{
            color: expanded ? C.accent : C.mutedLight,
            fontSize: C.isDark ? '16px' : '14px',
            fontFamily: C.monoFont,
            flexShrink: 0,
          }}>
            {C.isDark ? '_' : '✦'}
          </span>
          <h2 style={{
            fontFamily: C.isDark ? C.monoFont : 'var(--font-cormorant)',
            fontSize: C.isDark ? '13px' : isMobile ? '20px' : '18px',
            fontWeight: 400,
            fontStyle: C.isDark ? 'normal' : 'italic',
            letterSpacing: C.isDark ? '2px' : '0',
            color: C.text,
            textTransform: C.isDark ? 'uppercase' : 'none',
            margin: 0, flexShrink: 0,
          }}>{title}</h2>
          {!expanded && summary && (
            <span style={{
              fontSize: '12px', color: C.mutedLight,
              fontFamily: C.font,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {summary}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {hasToggle && (
            <label
              style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', userSelect: 'none' }}
              onClick={e => e.stopPropagation()}
            >
              <span style={{
                fontSize: '11px', letterSpacing: '1px',
                textTransform: 'uppercase', fontFamily: C.font,
                color: visible ? C.accent : C.mutedLight,
              }}>
                {visible ? 'Visible' : 'Oculto'}
              </span>
              {/* Toggle: 40×22 (was 32×18) for easier tap on mobile */}
              <span
                onClick={e => { e.stopPropagation(); onVisibilityChange!(!visible); }}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  width: '40px', height: '22px',
                  borderRadius: '11px',
                  backgroundColor: visible ? C.accent : C.border,
                  padding: '2px', cursor: 'pointer',
                  transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <span style={{
                  display: 'block',
                  width: '18px', height: '18px',
                  borderRadius: '50%',
                  backgroundColor: C.card,
                  transform: visible ? 'translateX(18px)' : 'translateX(0)',
                  transition: 'transform 0.2s', flexShrink: 0,
                }} />
              </span>
            </label>
          )}
          <span style={{
            fontSize: '16px', color: C.mutedLight,
            display: 'inline-block',
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}>▾</span>
        </div>
      </div>
      {/* Contenido colapsable */}
      {expanded && (
        <div style={{
          paddingBottom: '28px',
          display: 'flex', flexDirection: 'column', gap: '16px',
          opacity: hasToggle && !visible ? 0.45 : 1,
          pointerEvents: hasToggle && !visible ? 'none' : undefined,
          transition: 'opacity 0.2s',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

/** Item colapsable para listas (itinerario, hoteles) */
function CollapsibleItem({ summary, C, onRemove, canRemove = true, children }: {
  summary: string; C: Colors; onRemove: () => void; canRemove?: boolean; children: React.ReactNode;
}) {
  const isMobile = useMobile();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: '10px', backgroundColor: C.card, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: isMobile ? '14px' : '10px 14px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer', userSelect: 'none', gap: '8px',
        }}
      >
        <span style={{ fontSize: isMobile ? '15px' : '13px', color: C.text, fontFamily: C.font, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summary}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {canRemove && (
            <button
              style={{
                padding: isMobile ? '8px 14px' : '3px 10px',
                border: `1px solid ${C.border}`, borderRadius: '6px',
                backgroundColor: 'transparent', color: C.mutedLight,
                fontSize: isMobile ? '13px' : '11px',
                cursor: 'pointer', fontFamily: C.font,
                minHeight: isMobile ? '40px' : 'auto',
              }}
              onClick={e => { e.stopPropagation(); onRemove(); }}
            >Eliminar</button>
          )}
          <span style={{ fontSize: '16px', color: C.mutedLight, display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
        </div>
      </div>
      {open && <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>{children}</div>}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  const isMobile = useMobile();
  const count = Array.isArray(children) ? children.filter(Boolean).length : 1;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : `repeat(${count}, 1fr)`,
      gap: '12px',
    }}>
      {children}
    </div>
  );
}

function Field({ label, C, children }: { label: string; C: Colors; children: React.ReactNode }) {
  return (
    <div>
      <span style={{
        display: 'block', fontSize: '11px', letterSpacing: '1.5px',
        textTransform: 'uppercase', color: C.muted,
        marginBottom: '7px', fontFamily: C.font,
      }}>
        {label}
      </span>
      {children}
    </div>
  );
}

// Color picker + hex input — reusable in the Diseño section
function ColorField({ label, value, onChange, placeholder, C, S }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  C: Colors;
  S: ReturnType<typeof makeStyles>;
}) {
  return (
    <Field label={label} C={C}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Swatch — 48×48 so it's easy to tap on mobile */}
        <label style={{
          display: 'block', flexShrink: 0,
          width: '48px', height: '48px',
          borderRadius: '8px',
          border: `2px solid ${C.border}`,
          backgroundColor: value || '#ccc',
          cursor: 'pointer', overflow: 'hidden',
          position: 'relative',
        }}>
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              opacity: 0, cursor: 'pointer',
            }}
          />
        </label>
        <input
          style={{ ...S.input, flex: 1 }}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </Field>
  );
}

// ---------------------------------------------------------------------------
// PhotosModal — carga de fotos sin asignación de roles
// ---------------------------------------------------------------------------
function PhotosModal({
  photos, onChange, C, S, eventSlug, photoLimit, onClose,
}: {
  photos: PhotoEntry[];
  onChange: (photos: PhotoEntry[]) => void;
  C: Colors;
  S: ReturnType<typeof makeStyles>;
  eventSlug: string;
  photoLimit: number | null;
  onClose: () => void;
}) {
  const isMobile = useMobile();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState('');

  const filled   = photos.length;
  const atLimit  = photoLimit !== null && filled >= photoLimit;

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;

    const slots = photoLimit !== null ? photoLimit - filled : Infinity;
    const toUpload = files.slice(0, slots);

    if (files.length > toUpload.length) {
      setError(`Solo puedes subir ${slots} foto${slots !== 1 ? 's' : ''} más (límite de plan).`);
    } else {
      setError('');
    }
    if (!toUpload.length) return;

    setPending(p => p + toUpload.length);
    try {
      const urls = await Promise.all(toUpload.map(f => uploadImage(f, `moments/${eventSlug}`)));
      onChange([...photos, ...urls.map(url => ({ url, role: null as null }))]);
    } catch {
      setError('Error al subir una o más fotos.');
    } finally {
      setPending(p => p - toUpload.length);
    }
  }

  function removePhoto(idx: number) {
    onChange(photos.filter((_, i) => i !== idx));
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 16px', overflowY: 'auto' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '560px', backgroundColor: C.bg, borderRadius: '14px', border: `1px solid ${C.border}`, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: C.isDark ? C.monoFont : 'var(--font-cormorant)', fontSize: C.isDark ? '13px' : '22px', fontWeight: 400, fontStyle: C.isDark ? 'normal' : 'italic', letterSpacing: C.isDark ? '2px' : '0', color: C.text, textTransform: C.isDark ? 'uppercase' : 'none', margin: 0 }}>
            Fotos
          </h2>
          <button onClick={onClose} style={{ padding: isMobile ? '10px 18px' : '4px 12px', border: `1px solid ${C.border}`, borderRadius: '8px', backgroundColor: 'transparent', color: C.muted, fontSize: isMobile ? '14px' : '12px', cursor: 'pointer', fontFamily: C.font }}>
            Cerrar
          </button>
        </div>

        {/* Counter */}
        {photoLimit !== null ? (
          <span style={{ fontSize: '12px', fontFamily: C.font, color: atLimit ? '#C0392B' : C.muted, marginTop: '-12px' }}>
            {filled} / {photoLimit} fotos{atLimit ? ' · Límite alcanzado' : ''}
          </span>
        ) : filled > 0 ? (
          <span style={{ fontSize: '12px', fontFamily: C.font, color: C.muted, marginTop: '-12px' }}>
            {filled} foto{filled !== 1 ? 's' : ''}
          </span>
        ) : null}

        {/* Thumbnail grid — 3 cols on mobile, 4 on desktop */}
        {filled > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: '8px' }}>
            {photos.map((p, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cld(p.url, T.thumb)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <button type="button" onClick={() => removePhoto(i)}
                  style={{ position: 'absolute', top: '4px', right: '4px', width: '26px', height: '26px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                >×</button>
              </div>
            ))}
          </div>
        )}

        {/* Drop zone */}
        {!atLimit && (
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            style={{ border: `1px dashed ${C.border}`, borderRadius: '10px', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', backgroundColor: C.card }}
          >
            {pending > 0 ? (
              <span style={{ fontSize: '14px', color: C.muted, fontFamily: C.font }}>Subiendo {pending} foto{pending !== 1 ? 's' : ''}…</span>
            ) : (
              <>
                <span style={{ fontSize: '14px', color: C.text, fontFamily: C.font }}>Arrastra fotos aquí o toca para seleccionar</span>
                <span style={{ fontSize: '12px', color: C.mutedLight, fontFamily: C.font, textAlign: 'center' }}>JPG, PNG, WebP · puedes seleccionar varias a la vez</span>
              </>
            )}
          </div>
        )}

        {error && <span style={{ fontSize: '13px', color: '#C0392B', fontFamily: C.font }}>{error}</span>}

        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
          onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function EditarForm({
  eventId,
  eventSlug,
  initialConfig,
  plan = 'essential',
  theme = 'light',
}: {
  eventId: string;
  eventSlug: string;
  initialConfig: Partial<EventConfig>;
  plan?: 'essential' | 'plus' | 'deluxe';
  theme?: 'light' | 'dark';
}) {
  const isPlus = plan === 'plus' || plan === 'deluxe';
  const isDeluxe = plan === 'deluxe';
  const C = theme === 'dark' ? DARK : LIGHT;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const S = makeStyles(C, isMobile);

  // Límite total de fotos por plan (hero incluida)
  const photoLimit: number | null = isDeluxe ? 15 : (isPlus ? 11 : 6);

  const [cfg, setCfg] = useState<EventConfig>(() => ({
    ...DEFAULT,
    ...initialConfig,
    couple:      { ...DEFAULT.couple,    ...initialConfig.couple },
    fullNames:   { ...DEFAULT.fullNames, ...initialConfig.fullNames },
    date:        { ...DEFAULT.date,      ...initialConfig.date },
    quote:       { ...DEFAULT.quote,     ...initialConfig.quote },
    parents:     { ...DEFAULT.parents,   ...initialConfig.parents },
    dressCode:   { ...DEFAULT.dressCode, ...initialConfig.dressCode },
    music:       { ...DEFAULT.music,       ...(initialConfig as Partial<EventConfig>).music },
    gifts:       { ...DEFAULT.gifts,     ...initialConfig.gifts },
    destination: {
      hotels:    (initialConfig as Partial<EventConfig>).destination?.hotels    ?? DEFAULT.destination.hotels,
      transport: { ...DEFAULT.destination.transport, ...(initialConfig as Partial<EventConfig>).destination?.transport },
    },
    whatsapp:    { ...DEFAULT.whatsapp,  ...initialConfig.whatsapp },
    rsvp:        { ...DEFAULT.rsvp,      ...(initialConfig as Partial<EventConfig>).rsvp },
    photos: (() => {
      // Si ya tiene el nuevo formato, usarlo directamente
      const ic = initialConfig as Partial<EventConfig> & { photos?: PhotoEntry[]; images?: string[]; imageLayout?: { afterSection: string; layout: string; imageIndexes?: number[] }[] };
      if (ic.photos?.length) return ic.photos;
      // Migrar formato antiguo (images[] + imageLayout[])
      const imgs = ic.images ?? [];
      const layout = ic.imageLayout ?? [];
      const usedIdx = new Set<number>(layout.flatMap(b => b.imageIndexes ?? []));
      const result: PhotoEntry[] = [];
      if (imgs[0]) result.push({ url: imgs[0], role: 'hero' });
      for (const block of layout) {
        (block.imageIndexes ?? []).forEach((idx, order) => {
          if (imgs[idx]) result.push({ url: imgs[idx], role: 'block', afterSection: block.afterSection, layout: block.layout as PhotoEntry['layout'], blockGroup: 0, orderInBlock: order });
        });
      }
      imgs.forEach((url: string, i: number) => {
        if (i > 0 && url && !usedIdx.has(i)) result.push({ url, role: null });
      });
      return result;
    })(),
    itinerary: initialConfig.itinerary?.length ? initialConfig.itinerary : DEFAULT.itinerary,
    notes:     initialConfig.notes?.length    ? initialConfig.notes      : DEFAULT.notes,
    theme:     { ...DEFAULT.theme, ...initialConfig.theme },
    sections:  { ...DEFAULT.sections, ...(initialConfig as Partial<EventConfig>).sections },
  }));

  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [photosOpen, setPhotosOpen] = useState(false);
  const [repositioningItinIdx, setRepositioningItinIdx] = useState<number | null>(null);

  useEffect(() => {
    const existing = document.getElementById('editarform-gfonts');
    if (existing) return;
    const link = document.createElement('link');
    link.id = 'editarform-gfonts';
    link.rel = 'stylesheet';
    link.href = GOOGLE_FONTS_URL;
    document.head.appendChild(link);
  }, []);

  function set<K extends keyof EventConfig>(key: K, value: EventConfig[K]) {
    setCfg(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      await updateEventConfig(eventId, JSON.stringify(cfg));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <MobileCtx.Provider value={isMobile}>
      <div style={{ fontFamily: C.font, backgroundColor: C.bg }}>

        {/* ── Itinerary photo repositioner modal ── */}
        {repositioningItinIdx !== null && cfg.itinerary[repositioningItinIdx]?.image && (
          <PhotoPositionerModal
            url={cfg.itinerary[repositioningItinIdx].image!}
            objectPosition={cfg.itinerary[repositioningItinIdx].imageObjectPosition}
            scale={cfg.itinerary[repositioningItinIdx].imageScale}
            label={`Ajustar: ${cfg.itinerary[repositioningItinIdx].name || 'foto del lugar'}`}
            aspectRatio={isDeluxe ? "16/7" : "4/3"}
            onConfirm={(pos, s) => {
              const it = [...cfg.itinerary];
              it[repositioningItinIdx] = { ...it[repositioningItinIdx], imageObjectPosition: pos, imageScale: s };
              set('itinerary', it);
            }}
            onClose={() => setRepositioningItinIdx(null)}
            C={C}
            variant="itinerary"
          />
        )}

        {/* ── Save bar ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          backgroundColor: C.bg, borderBottom: `1px solid ${C.border}`,
          padding: isMobile ? '14px 0' : '12px 0',
          marginBottom: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '12px',
        }}>
          <p style={{ fontSize: '11px', color: saved ? C.accent : C.muted, letterSpacing: '1px', fontFamily: C.font, transition: 'color 0.3s', flexShrink: 0 }}>
            {saved ? '✓ cambios guardados' : 'guardar manualmente'}
          </p>
          <button
            onClick={handleSave}
            disabled={isPending}
            style={{
              padding: isMobile ? '12px 28px' : '10px 24px',
              backgroundColor: saved
                ? '#2D6A4F'
                : isPending ? C.accentLight : C.accent,
              color: saved
                ? '#fff'
                : isPending ? C.muted : C.isDark ? '#0D1117' : '#F8F3EC',
              border: 'none', borderRadius: '8px',
              fontSize: isMobile ? '13px' : '11px',
              letterSpacing: '2px', textTransform: 'uppercase',
              cursor: isPending ? 'not-allowed' : 'pointer',
              fontFamily: C.font, fontWeight: C.isDark ? 700 : 400,
              transition: 'background 0.3s',
              minHeight: isMobile ? '48px' : 'auto',
              flexShrink: 0,
            }}
          >
            {isPending ? 'guardando...' : saved ? '✓ guardado' : 'guardar'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* ── 1. Portada ── */}
          <Section title="Portada" C={C} defaultOpen={true}
            summary={cfg.couple.person1 && cfg.couple.person2 ? `${cfg.couple.person1} & ${cfg.couple.person2}` : cfg.couple.person1 || cfg.couple.person2 || '—'}
          >
            <Field label="Frase de introducción (aparece encima de los nombres)" C={C}>
              <input style={S.input} value={cfg.heroLabel} onChange={e => set('heroLabel', e.target.value)} placeholder="Nuestro gran día" />
            </Field>
            {isDeluxe && (
              <Field label="Monograma del loader (2-3 letras)" C={C}>
                <input
                  style={{ ...S.input, width: '120px', textTransform: 'uppercase', letterSpacing: '2px' }}
                  value={cfg.monogram || ''}
                  onChange={e => set('monogram', e.target.value.toUpperCase().slice(0, 3))}
                  placeholder="V&S"
                  maxLength={3}
                />
                <p style={{ fontSize: '11px', color: C.muted, marginTop: '4px' }}>
                  Se muestra en la animación inicial de carga.
                </p>
              </Field>
            )}
            <Row>
              <Field label="Nombre corto — persona 1" C={C}>
                <input style={S.input} value={cfg.couple.person1} onChange={e => set('couple', { ...cfg.couple, person1: e.target.value })} placeholder="Sofía" />
              </Field>
              <Field label="Nombre corto — persona 2" C={C}>
                <input style={S.input} value={cfg.couple.person2} onChange={e => set('couple', { ...cfg.couple, person2: e.target.value })} placeholder="Mateo" />
              </Field>
            </Row>
            <Row>
              <Field label="Nombre completo — persona 1" C={C}>
                <input style={S.input} value={cfg.fullNames.person1} onChange={e => set('fullNames', { ...cfg.fullNames, person1: e.target.value })} placeholder="Sofía Herrera López" />
              </Field>
              <Field label="Nombre completo — persona 2" C={C}>
                <input style={S.input} value={cfg.fullNames.person2} onChange={e => set('fullNames', { ...cfg.fullNames, person2: e.target.value })} placeholder="Mateo Mendoza Ruiz" />
              </Field>
            </Row>
            <Row>
              <Field label="Día" C={C}>
                <input style={S.input} value={cfg.date.day} onChange={e => set('date', { ...cfg.date, day: e.target.value })} placeholder="18" maxLength={2} />
              </Field>
              <Field label="Mes" C={C}>
                <input style={S.input} value={cfg.date.month} onChange={e => set('date', { ...cfg.date, month: e.target.value })} placeholder="Octubre" />
              </Field>
              <Field label="Año" C={C}>
                <input style={S.input} value={cfg.date.year} onChange={e => set('date', { ...cfg.date, year: e.target.value })} placeholder="2025" maxLength={4} />
              </Field>
            </Row>
            <Field label="Ciudad / Lugar del evento" C={C}>
              <input style={S.input} value={cfg.location} onChange={e => set('location', e.target.value)} placeholder="Ciudad de México" />
            </Field>
            {isPlus && (
              <Field label="Fecha y hora exacta del evento (para cuenta regresiva)" C={C}>
                <input
                  style={S.input}
                  type="datetime-local"
                  value={cfg.targetDate}
                  onChange={e => set('targetDate', e.target.value)}
                />
                <p style={{ fontSize: '11px', color: C.muted, marginTop: '4px' }}>
                  Formato: AAAA-MM-DDTHH:MM (ej. 2026-08-01T17:00)
                </p>
              </Field>
            )}
          </Section>

          {/* ── 2. Fotos ── */}
          {(() => {
            const total = cfg.photos.length;
            const atLimit = photoLimit !== null && total >= photoLimit;
            return (
              <Section title="Fotos" C={C}
                summary={total > 0 ? `${total} foto${total !== 1 ? 's' : ''}` : '—'}
              >
                {/* Thumbnail strip */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {cfg.photos.map((p, i) => p.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={cld(p.url, T.thumb)} alt=""
                      style={{ width: isMobile ? '64px' : '56px', height: isMobile ? '64px' : '56px', objectFit: 'cover', borderRadius: '6px', border: `1px solid ${C.border}` }} />
                  ) : null)}
                  {total === 0 && (
                    <span style={{ fontSize: '13px', color: C.mutedLight, fontFamily: C.font }}>Sin fotos aún</span>
                  )}
                </div>
                {photoLimit !== null && (
                  <span style={{ fontSize: '12px', fontFamily: C.font, color: atLimit ? '#C0392B' : C.muted }}>
                    {total} / {photoLimit} fotos{atLimit ? ' · Límite alcanzado' : ''}
                  </span>
                )}
                <button type="button" onClick={() => setPhotosOpen(true)}
                  style={{
                    padding: isMobile ? '12px 24px' : '9px 20px',
                    border: `1px solid ${C.border}`, borderRadius: '8px',
                    backgroundColor: 'transparent', color: C.text,
                    fontSize: isMobile ? '14px' : '12px',
                    letterSpacing: '1px', cursor: 'pointer',
                    fontFamily: C.font, alignSelf: 'flex-start',
                    minHeight: isMobile ? '48px' : 'auto',
                  }}
                >
                  Gestionar fotos
                </button>
              </Section>
            );
          })()}

          {/* ── Layout de Fotos ── */}
          {(() => {
            const heroOk  = cfg.photos.some(p => p.role === 'hero');
            const blocks  = cfg.photos.filter(p => p.role === 'block').length;
            const summary = heroOk
              ? `Portada ✓${blocks > 0 ? ` · ${blocks} en bloques` : ''}`
              : `Sin portada${blocks > 0 ? ` · ${blocks} en bloques` : ''}`;
            return (
              <Section title="Layout de Fotos" C={C} summary={summary}>
                <ImageLayoutEditor
                  photos={cfg.photos}
                  onChange={photos => set('photos', photos)}
                  activeSections={{
                    hero:        true,
                    quote:       cfg.sections.quote       ?? false,
                    parents:     cfg.sections.parents     ?? false,
                    itinerary:   cfg.itinerary.some(i => i.name.trim() !== ''),
                    destination: cfg.sections.destination ?? false,
                    dressCode:   cfg.sections.dressCode   ?? false,
                    notes:       cfg.sections.notes       ?? false,
                    gifts:       cfg.sections.gifts       ?? false,
                    noChildren:  cfg.noChildren           ?? false,
                  }}
                  C={C}
                />
              </Section>
            );
          })()}

          {/* ── 3. Cita ── */}
          <Section title="Cita o frase" C={C}
            visible={cfg.sections.quote}
            onVisibilityChange={v => set('sections', { ...cfg.sections, quote: v })}
            summary={cfg.quote.text ? `${cfg.quote.text.slice(0, 45)}${cfg.quote.text.length > 45 ? '…' : ''}` : '—'}
          >
            <Field label="Texto" C={C}>
              <textarea style={S.textarea} value={cfg.quote.text} onChange={e => set('quote', { ...cfg.quote, text: e.target.value })} placeholder="Lo que Dios unió, que no lo separe el hombre." />
            </Field>
            <Field label="Referencia" C={C}>
              <input style={S.input} value={cfg.quote.reference} onChange={e => set('quote', { ...cfg.quote, reference: e.target.value })} placeholder="Marcos 10:9" />
            </Field>
          </Section>

          {/* ── 4. Padres ── */}
          {(() => {
            const splitParts = (s: string) => {
              const parts = s.split('\n').map(l => l.replace(/\s*&\s*$/, '').trim()).filter(Boolean);
              return { dad: parts[0] ?? '', mom: parts[1] ?? '' };
            };
            const joinParts = (dad: string, mom: string) =>
              mom.trim() ? `${dad.trim()}\n${mom.trim()}` : dad.trim();
            const p1 = splitParts(cfg.parents.person1);
            const p2 = splitParts(cfg.parents.person2);
            return (
              <Section title="Padres" C={C}
                visible={cfg.sections.parents}
                onVisibilityChange={v => set('sections', { ...cfg.sections, parents: v })}
                summary={p1.dad || p2.dad ? `${p1.dad || '—'} · ${p2.dad || '—'}` : '—'}
              >
                <Field label={`Papá de ${cfg.couple.person1 || 'persona 1'}`} C={C}>
                  <input style={S.input} value={p1.dad} onChange={e => set('parents', { ...cfg.parents, person1: joinParts(e.target.value, p1.mom) })} placeholder="Roberto Herrera" />
                </Field>
                <Field label={`Mamá de ${cfg.couple.person1 || 'persona 1'}`} C={C}>
                  <input style={S.input} value={p1.mom} onChange={e => set('parents', { ...cfg.parents, person1: joinParts(p1.dad, e.target.value) })} placeholder="Carmen López de Herrera" />
                </Field>
                <Field label={`Papá de ${cfg.couple.person2 || 'persona 2'}`} C={C}>
                  <input style={S.input} value={p2.dad} onChange={e => set('parents', { ...cfg.parents, person2: joinParts(e.target.value, p2.mom) })} placeholder="Jorge Mendoza" />
                </Field>
                <Field label={`Mamá de ${cfg.couple.person2 || 'persona 2'}`} C={C}>
                  <input style={S.input} value={p2.mom} onChange={e => set('parents', { ...cfg.parents, person2: joinParts(p2.dad, e.target.value) })} placeholder="Patricia Ruiz de Mendoza" />
                </Field>
              </Section>
            );
          })()}

          {/* ── 5. Itinerario ── */}
          <Section title="Itinerario" C={C}
            visible={cfg.sections.itinerary}
            onVisibilityChange={v => set('sections', { ...cfg.sections, itinerary: v })}
            summary={(() => { const n = cfg.itinerary.filter(i => i.name.trim()).length; return n > 0 ? `${n} evento${n !== 1 ? 's' : ''}` : '—'; })()}
          >
            {cfg.itinerary.map((item, i) => (
              <CollapsibleItem
                key={i}
                summary={`${item.time ? `${item.time} · ` : ''}${item.name || 'Nuevo evento'}`}
                C={C}
                canRemove={cfg.itinerary.length > 1}
                onRemove={() => set('itinerary', cfg.itinerary.filter((_, j) => j !== i))}
              >
                <Row>
                  <Field label="Hora" C={C}>
                    <input style={S.input} value={item.time} onChange={e => { const it = [...cfg.itinerary]; it[i] = { ...it[i], time: e.target.value }; set('itinerary', it); }} placeholder="16:00" />
                  </Field>
                  <Field label="Nombre del evento" C={C}>
                    <input style={S.input} value={item.name} onChange={e => { const it = [...cfg.itinerary]; it[i] = { ...it[i], name: e.target.value }; set('itinerary', it); }} placeholder="Ceremonia Religiosa" />
                  </Field>
                </Row>
                <Field label="Lugar / Venue" C={C}>
                  <input style={S.input} value={item.venue} onChange={e => { const it = [...cfg.itinerary]; it[i] = { ...it[i], venue: e.target.value }; set('itinerary', it); }} placeholder="Parroquia de San Francisco de Asís" />
                </Field>
                <Field label="Dirección" C={C}>
                  <input style={S.input} value={item.address} onChange={e => { const it = [...cfg.itinerary]; it[i] = { ...it[i], address: e.target.value }; set('itinerary', it); }} placeholder="Av. Francisco I. Madero 12, Centro Histórico, CDMX" />
                </Field>
                {isPlus && (
                  <Field label="URL de Google Maps (opcional)" C={C}>
                    <input
                      style={S.input}
                      type="url"
                      value={item.mapsUrl ?? ''}
                      onChange={e => { const it = [...cfg.itinerary]; it[i] = { ...it[i], mapsUrl: e.target.value }; set('itinerary', it); }}
                      placeholder="https://maps.app.goo.gl/..."
                    />
                    <p style={{ fontSize: '11px', color: C.muted, marginTop: '4px' }}>
                      Si se deja vacío, se genera automáticamente desde la dirección.
                    </p>
                  </Field>
                )}
                {isPlus && (
                  <Field label="Foto del lugar (opcional)" C={C}>
                    <ImageUpload
                      folder={`moments/${eventSlug}`}
                      value={item.image ?? ''}
                      onChange={url => { const it = [...cfg.itinerary]; it[i] = { ...it[i], image: url }; set('itinerary', it); }}
                    />
                    {item.image && (
                      <button
                        type="button"
                        onClick={() => setRepositioningItinIdx(i)}
                        style={{
                          marginTop: '8px',
                          padding: isMobile ? '10px 16px' : '5px 12px',
                          border: `1px solid ${C.border}`, borderRadius: '6px',
                          background: 'transparent', color: C.muted,
                          fontSize: isMobile ? '13px' : '11px',
                          cursor: 'pointer', fontFamily: C.font,
                          minHeight: isMobile ? '44px' : 'auto',
                        }}
                      >✥ Reposicionar foto</button>
                    )}
                  </Field>
                )}
              </CollapsibleItem>
            ))}
            <button style={S.addBtn} onClick={() => set('itinerary', [...cfg.itinerary, { time: '', name: '', venue: '', address: '' }])}>
              + Agregar evento
            </button>
          </Section>

          {/* ── 6. Dress Code ── */}
          <Section title="Dress Code" C={C}
            visible={cfg.sections.dressCode}
            onVisibilityChange={v => set('sections', { ...cfg.sections, dressCode: v })}
            summary={cfg.dressCode.label || '—'}
          >
            <Field label="Etiqueta (ej: Formal, Cocktail)" C={C}>
              <input style={S.input} value={cfg.dressCode.label} onChange={e => set('dressCode', { ...cfg.dressCode, label: e.target.value })} placeholder="Formal" />
            </Field>
            {isDeluxe && (
              <Field label="Descripción del dress code" C={C}>
                <textarea style={S.textarea} value={cfg.dressCode.description} onChange={e => set('dressCode', { ...cfg.dressCode, description: e.target.value })} placeholder="Celebramos entre viñedos. Te pedimos vestimenta elegante adaptada al campo." />
              </Field>
            )}
            <Field label="Indicaciones para damas" C={C}>
              <textarea style={S.textarea} value={cfg.dressCode.women} onChange={e => set('dressCode', { ...cfg.dressCode, women: e.target.value })} placeholder="Vestido largo o midi en tonos de la paleta..." />
            </Field>
            <Field label="Indicaciones para caballeros" C={C}>
              <textarea style={S.textarea} value={cfg.dressCode.men} onChange={e => set('dressCode', { ...cfg.dressCode, men: e.target.value })} placeholder="Traje oscuro o guayabera formal..." />
            </Field>

            <div>
              <span style={S.lbl}>Paleta de colores</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cfg.dressCode.swatches.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* 56×44 swatch — easier to tap on mobile */}
                    <label style={{
                      display: 'block', flexShrink: 0,
                      width: '56px', height: '44px',
                      borderRadius: '8px',
                      border: `2px solid ${C.border}`,
                      backgroundColor: s.color,
                      cursor: 'pointer', overflow: 'hidden',
                      position: 'relative',
                    }}>
                      <input
                        type="color"
                        value={s.color}
                        onChange={e => { const sw = [...cfg.dressCode.swatches]; sw[i] = { ...sw[i], color: e.target.value }; set('dressCode', { ...cfg.dressCode, swatches: sw }); }}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                    </label>
                    <input style={{ ...S.input, flex: 1 }} value={s.name} onChange={e => { const sw = [...cfg.dressCode.swatches]; sw[i] = { ...sw[i], name: e.target.value }; set('dressCode', { ...cfg.dressCode, swatches: sw }); }} placeholder="Champagne" />
                    <button style={S.removeBtn} onClick={() => set('dressCode', { ...cfg.dressCode, swatches: cfg.dressCode.swatches.filter((_, j) => j !== i) })}>×</button>
                  </div>
                ))}
                <button style={S.addBtn} onClick={() => set('dressCode', { ...cfg.dressCode, swatches: [...cfg.dressCode.swatches, { color: '#C9A87C', name: '' }] })}>+ Color</button>
              </div>
            </div>

            <div>
              <span style={S.lbl}>Colores a evitar</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cfg.dressCode.avoid.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{
                      display: 'block', flexShrink: 0,
                      width: '56px', height: '44px',
                      borderRadius: '8px',
                      border: `2px solid ${C.border}`,
                      backgroundColor: s.color,
                      cursor: 'pointer', overflow: 'hidden',
                      position: 'relative',
                    }}>
                      <input
                        type="color"
                        value={s.color}
                        onChange={e => { const av = [...cfg.dressCode.avoid]; av[i] = { ...av[i], color: e.target.value }; set('dressCode', { ...cfg.dressCode, avoid: av }); }}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                    </label>
                    <input style={{ ...S.input, flex: 1 }} value={s.name} onChange={e => { const av = [...cfg.dressCode.avoid]; av[i] = { ...av[i], name: e.target.value }; set('dressCode', { ...cfg.dressCode, avoid: av }); }} placeholder="Blanco" />
                    <button style={S.removeBtn} onClick={() => set('dressCode', { ...cfg.dressCode, avoid: cfg.dressCode.avoid.filter((_, j) => j !== i) })}>×</button>
                  </div>
                ))}
                <button style={S.addBtn} onClick={() => set('dressCode', { ...cfg.dressCode, avoid: [...cfg.dressCode.avoid, { color: '#FFFFFF', name: '' }] })}>+ Color a evitar</button>
              </div>
            </div>
          </Section>

          {/* ── 7. Notas ── */}
          <Section title="Notas adicionales" C={C}
            visible={cfg.sections.notes}
            onVisibilityChange={v => set('sections', { ...cfg.sections, notes: v })}
            summary={(() => { const n = cfg.notes.filter(x => x.trim()).length; return n > 0 ? `${n} nota${n !== 1 ? 's' : ''}` : '—'; })()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cfg.notes.map((note, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input style={{ ...S.input, flex: 1 }} value={note} onChange={e => { const n = [...cfg.notes]; n[i] = e.target.value; set('notes', n); }} placeholder="Evento para adultos — no se permiten niños." />
                  {cfg.notes.length > 1 && (
                    <button style={S.removeBtn} onClick={() => set('notes', cfg.notes.filter((_, j) => j !== i))}>×</button>
                  )}
                </div>
              ))}
              <button style={S.addBtn} onClick={() => set('notes', [...cfg.notes, ''])}>+ Nota</button>
            </div>
          </Section>

          {/* ── 8. Regalos ── */}
          {(() => {
            const giftTypes: string[] = cfg.gifts.giftTypes ?? [];
            const toggle = (type: string) => {
              const next = giftTypes.includes(type)
                ? giftTypes.filter(t => t !== type)
                : [...giftTypes, type];
              set('gifts', { ...cfg.gifts, giftTypes: next });
            };
            const hasTransfer = giftTypes.includes('transfer');
            const hasList    = giftTypes.includes('list');
            const summary = giftTypes.length
              ? giftTypes.map(t => t === 'transfer' ? 'Transferencia' : t === 'list' ? 'Mesa de regalos' : 'Sobres').join(' · ')
              : '—';
            return (
              <Section title="Regalos" C={C}
                visible={cfg.sections.gifts}
                onVisibilityChange={v => set('sections', { ...cfg.sections, gifts: v })}
                summary={summary}
              >
                {/* Selector de tipos */}
                <div>
                  <span style={S.lbl}>¿Qué opciones de regalo ofrecer?</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                    {[
                      { key: 'transfer', label: 'Transferencia bancaria' },
                      { key: 'list',     label: 'Mesa de regalos' },
                      { key: 'envelope', label: 'Sobres' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggle(key)}
                        style={{
                          padding: isMobile ? '10px 18px' : '6px 14px',
                          borderRadius: '100px',
                          border: `1px solid ${giftTypes.includes(key) ? C.accent : C.border}`,
                          background: giftTypes.includes(key) ? C.accentLight : 'transparent',
                          color: giftTypes.includes(key) ? C.accent : C.muted,
                          fontSize: isMobile ? '14px' : '12px',
                          cursor: 'pointer',
                          fontFamily: C.font,
                          letterSpacing: '0.03em',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          minHeight: isMobile ? '44px' : 'auto',
                        }}
                      >
                        {giftTypes.includes(key) && <span style={{ fontSize: '11px' }}>✓</span>}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campos de transferencia */}
                {hasTransfer && (
                  <>
                    <Row>
                      <Field label="Banco" C={C}><input style={S.input} value={cfg.gifts.bank} onChange={e => set('gifts', { ...cfg.gifts, bank: e.target.value })} placeholder="BBVA" /></Field>
                      <Field label="Titular" C={C}><input style={S.input} value={cfg.gifts.holder} onChange={e => set('gifts', { ...cfg.gifts, holder: e.target.value })} placeholder="Sofía Herrera López" /></Field>
                    </Row>
                    <Row>
                      <Field label="Número de cuenta" C={C}><input style={S.input} value={cfg.gifts.account} onChange={e => set('gifts', { ...cfg.gifts, account: e.target.value })} placeholder="4152 3140 7823 9012" /></Field>
                      <Field label="CLABE interbancaria" C={C}><input style={S.input} value={cfg.gifts.clabe} onChange={e => set('gifts', { ...cfg.gifts, clabe: e.target.value })} placeholder="012 180 00412345678 9" /></Field>
                    </Row>
                  </>
                )}

                {/* Campos de mesa de regalos */}
                {hasList && (
                  <Row>
                    <Field label="Nombre (ej: Liverpool)" C={C}><input style={S.input} value={cfg.gifts.giftListLabel} onChange={e => set('gifts', { ...cfg.gifts, giftListLabel: e.target.value })} placeholder="Liverpool" /></Field>
                    <Field label="Link mesa de regalos" C={C}><input style={S.input} type="url" value={cfg.gifts.giftListUrl} onChange={e => set('gifts', { ...cfg.gifts, giftListUrl: e.target.value })} placeholder="https://mesaderegalos.liverpool.com.mx/..." /></Field>
                  </Row>
                )}

                {/* Mensaje de sobre */}
                {giftTypes.includes('envelope') && (
                  <Field label="Mensaje para sobres" C={C}>
                    <input
                      style={S.input}
                      value={cfg.gifts.envelopeMessage}
                      onChange={e => set('gifts', { ...cfg.gifts, envelopeMessage: e.target.value })}
                      placeholder="Con gusto recibimos sobres el día del evento"
                    />
                  </Field>
                )}
              </Section>
            );
          })()}

          {/* ── Plus: Boda Destino ── */}
          {isPlus && (
            <Section title="Boda Destino (hospedaje y transporte)" C={C}
              visible={cfg.sections.destination}
              onVisibilityChange={v => set('sections', { ...cfg.sections, destination: v })}
              summary={(() => { const n = cfg.destination.hotels.length; return n > 0 ? `${n} hotel${n !== 1 ? 'es' : ''}` : '—'; })()}
            >
              <p style={{ fontSize: '13px', color: C.muted, marginTop: '-8px' }}>
                Agrega hoteles recomendados y detalles de transporte para tus invitados.
              </p>

              {/* Hoteles */}
              <div>
                <span style={S.lbl}>Hoteles recomendados</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {cfg.destination.hotels.map((h, i) => (
                    <CollapsibleItem
                      key={i}
                      summary={`${h.name || 'Nuevo hotel'}${h.category ? ` · ${h.category}` : ''}`}
                      C={C}
                      onRemove={() => set('destination', { ...cfg.destination, hotels: cfg.destination.hotels.filter((_, j) => j !== i) })}
                    >
                      <Row>
                        <Field label="Nombre del hotel" C={C}>
                          <input style={S.input} value={h.name} onChange={e => { const hs = [...cfg.destination.hotels]; hs[i] = { ...hs[i], name: e.target.value }; set('destination', { ...cfg.destination, hotels: hs }); }} placeholder="Hotel Santa Clara" />
                        </Field>
                        <Field label="Categoría" C={C}>
                          <input style={S.input} value={h.category} onChange={e => { const hs = [...cfg.destination.hotels]; hs[i] = { ...hs[i], category: e.target.value }; set('destination', { ...cfg.destination, hotels: hs }); }} placeholder="5 estrellas" />
                        </Field>
                      </Row>
                      <Field label="Dirección" C={C}>
                        <input style={S.input} value={h.address} onChange={e => { const hs = [...cfg.destination.hotels]; hs[i] = { ...hs[i], address: e.target.value }; set('destination', { ...cfg.destination, hotels: hs }); }} placeholder="Calle del Torno 39-29, Centro" />
                      </Field>
                      <Row>
                        <Field label="Nota (código, tarifa, etc.)" C={C}>
                          <input style={S.input} value={h.note} onChange={e => { const hs = [...cfg.destination.hotels]; hs[i] = { ...hs[i], note: e.target.value }; set('destination', { ...cfg.destination, hotels: hs }); }} placeholder="Tarifa especial con código BODAXYZ" />
                        </Field>
                        <Field label="Teléfono" C={C}>
                          <input style={S.input} value={h.phone} onChange={e => { const hs = [...cfg.destination.hotels]; hs[i] = { ...hs[i], phone: e.target.value }; set('destination', { ...cfg.destination, hotels: hs }); }} placeholder="+52 55 1234 5678" />
                        </Field>
                      </Row>
                    </CollapsibleItem>
                  ))}
                  <button style={S.addBtn} onClick={() => set('destination', { ...cfg.destination, hotels: [...cfg.destination.hotels, { name: '', category: '', address: '', note: '', phone: '' }] })}>
                    + Agregar hotel
                  </button>
                </div>
              </div>

              {/* Transporte */}
              <div>
                <span style={S.lbl}>Transporte</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Field label="Descripción general del transporte" C={C}>
                    <textarea style={S.textarea} value={cfg.destination.transport.info} onChange={e => set('destination', { ...cfg.destination, transport: { ...cfg.destination.transport, info: e.target.value } })} placeholder="Contratamos transfer desde el aeropuerto hasta los hoteles el día del evento." />
                  </Field>
                  <div>
                    <span style={S.lbl}>Horarios de transporte</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {cfg.destination.transport.schedule.map((s, i) => (
                        // Stack vertically on mobile so the narrow time input doesn't get squished
                        <div key={i} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '8px', alignItems: isMobile ? 'stretch' : 'center' }}>
                          <input style={{ ...S.input, width: isMobile ? '100%' : '140px', flexShrink: 0 }} value={s.time} onChange={e => { const sc = [...cfg.destination.transport.schedule]; sc[i] = { ...sc[i], time: e.target.value }; set('destination', { ...cfg.destination, transport: { ...cfg.destination.transport, schedule: sc } }); }} placeholder="10:00 – 14:00" />
                          <input style={{ ...S.input, flex: 1 }} value={s.detail} onChange={e => { const sc = [...cfg.destination.transport.schedule]; sc[i] = { ...sc[i], detail: e.target.value }; set('destination', { ...cfg.destination, transport: { ...cfg.destination.transport, schedule: sc } }); }} placeholder="Transfers continuos desde el aeropuerto" />
                          <button style={{ ...S.removeBtn, alignSelf: isMobile ? 'flex-end' : 'auto' }} onClick={() => set('destination', { ...cfg.destination, transport: { ...cfg.destination.transport, schedule: cfg.destination.transport.schedule.filter((_, j) => j !== i) } })}>× Eliminar</button>
                        </div>
                      ))}
                      <button style={S.addBtn} onClick={() => set('destination', { ...cfg.destination, transport: { ...cfg.destination.transport, schedule: [...cfg.destination.transport.schedule, { time: '', detail: '' }] } })}>
                        + Horario
                      </button>
                    </div>
                  </div>
                  <Field label="Correo de contacto para transporte" C={C}>
                    <input style={S.input} type="email" value={cfg.destination.transport.contact} onChange={e => set('destination', { ...cfg.destination, transport: { ...cfg.destination.transport, contact: e.target.value } })} placeholder="coordinacion@boda.com" />
                  </Field>
                </div>
              </div>
            </Section>
          )}

          {/* ── Deluxe: Música ── */}
          {isDeluxe && (
            <Section title="Música de fondo" C={C}
              summary={cfg.music.title ? `${cfg.music.title}${cfg.music.artist ? ` · ${cfg.music.artist}` : ''}` : '—'}
            >
              <AudioUpload
                value={cfg.music.url}
                onChange={url => set('music', { ...cfg.music, url })}
                title={cfg.music.title}
                artist={cfg.music.artist}
                onTitleChange={title => set('music', { ...cfg.music, title })}
                onArtistChange={artist => set('music', { ...cfg.music, artist })}
              />
            </Section>
          )}

          {/* ── 0. Diseño ── */}
          <Section title="Diseño" C={C}
            summary={`${DISPLAY_FONT_LABEL[cfg.theme.displayFont] ?? '—'} · ${cfg.theme.accentColor}`}
          >
            <Row>
              <Field label="Tipografía display (títulos)" C={C}>
                <select
                  style={S.input}
                  value={cfg.theme.displayFont}
                  onChange={e => set('theme', { ...cfg.theme, displayFont: e.target.value as EventConfig['theme']['displayFont'] })}
                >
                  <option value="cormorant">Cormorant Garamond</option>
                  <option value="playfair">Playfair Display</option>
                  <option value="eb-garamond">EB Garamond</option>
                  <option value="cinzel">Cinzel</option>
                  <option value="pinyon">Pinyon Script</option>
                </select>
                <p style={{
                  marginTop: '8px',
                  fontFamily: DISPLAY_FONT_FAMILY[cfg.theme.displayFont],
                  fontSize: '22px',
                  fontStyle: 'italic',
                  fontWeight: 400,
                  color: C.muted,
                  lineHeight: 1.2,
                }}>
                  {DISPLAY_FONT_LABEL[cfg.theme.displayFont]}
                </p>
              </Field>
              <Field label="Tipografía cuerpo (texto)" C={C}>
                <select
                  style={S.input}
                  value={cfg.theme.bodyFont}
                  onChange={e => set('theme', { ...cfg.theme, bodyFont: e.target.value as EventConfig['theme']['bodyFont'] })}
                >
                  <option value="jost">Jost</option>
                  <option value="raleway">Raleway</option>
                  <option value="montserrat">Montserrat</option>
                  <option value="lora">Lora</option>
                </select>
                <p style={{
                  marginTop: '8px',
                  fontFamily: BODY_FONT_FAMILY[cfg.theme.bodyFont],
                  fontSize: '13px',
                  fontWeight: 300,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: C.muted,
                }}>
                  {BODY_FONT_LABEL[cfg.theme.bodyFont]}
                </p>
              </Field>
            </Row>
            <Row>
              <ColorField
                label="Color de fondo"
                value={cfg.theme.backgroundColor}
                onChange={v => set('theme', { ...cfg.theme, backgroundColor: v })}
                placeholder="#F8F3EC"
                C={C} S={S}
              />
              <ColorField
                label="Color de texto"
                value={cfg.theme.textColor}
                onChange={v => set('theme', { ...cfg.theme, textColor: v })}
                placeholder="#1C1611"
                C={C} S={S}
              />
            </Row>
            <ColorField
              label="Color de acento"
              value={cfg.theme.accentColor}
              onChange={v => set('theme', { ...cfg.theme, accentColor: v })}
              placeholder="#B8965A"
              C={C} S={S}
            />
          </Section>

          {/* ── 9. Confirmación ── */}
          <Section title="Confirmación de asistencia" C={C}
            summary={!isPlus
              ? (cfg.whatsapp.number ? `WhatsApp · ${cfg.whatsapp.number}` : 'WhatsApp')
              : (cfg.rsvp.deadline ? `RSVP · ${cfg.rsvp.deadline}` : 'RSVP')}
          >
            {!isPlus ? (
              /* Essential: WhatsApp */
              <>
                <Row>
                  <Field label="Número de WhatsApp (con código de país, sin +)" C={C}>
                    <input style={S.input} value={cfg.whatsapp.number} onChange={e => set('whatsapp', { ...cfg.whatsapp, number: e.target.value })} placeholder="5215512345678" />
                  </Field>
                  <Field label="Fecha límite de confirmación" C={C}>
                    <input style={S.input} value={cfg.rsvpDeadline} onChange={e => set('rsvpDeadline', e.target.value)} placeholder="30 de septiembre" />
                  </Field>
                </Row>
                <Field label="Mensaje pre-escrito de WhatsApp" C={C}>
                  <textarea style={S.textarea} value={cfg.whatsapp.message} onChange={e => set('whatsapp', { ...cfg.whatsapp, message: e.target.value })} placeholder="Hola, confirmo mi asistencia a la boda de Sofía & Mateo el 18 de octubre. 🤍" />
                </Field>
              </>
            ) : (
              /* Plus / Deluxe: RSVP modal */
              <>
                <Field label="Fecha límite de confirmación" C={C}>
                  <input style={S.input} value={cfg.rsvp.deadline} onChange={e => set('rsvp', { ...cfg.rsvp, deadline: e.target.value })} placeholder="15 de mayo de 2026" />
                </Field>
                {isDeluxe && (
                  <div style={{ padding: '12px 16px', backgroundColor: C.accentLight, borderRadius: '8px', border: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: '13px', color: C.accent, margin: 0, lineHeight: '1.6', fontFamily: C.font }}>
                      <strong>Plan Deluxe:</strong> La gestión de cupos individuales se realiza en la sección de <a href={`/admin/invitados`} style={{ color: C.accent, fontWeight: 700 }}>Invitados</a>.
                    </p>
                  </div>
                )}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '12px' }}>
                    <input
                      type="checkbox"
                      checked={cfg.dietary.enabled}
                      onChange={e => set('dietary', { ...cfg.dietary, enabled: e.target.checked })}
                      style={{ width: isMobile ? '20px' : '16px', height: isMobile ? '20px' : '16px', accentColor: C.accent, cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span style={{ fontSize: isMobile ? '15px' : '14px', color: C.text }}>Mostrar sección de restricciones alimentarias</span>
                  </label>
                  {cfg.dietary.enabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {cfg.dietary.options.map((opt, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            style={{ ...S.input, flex: 1 }}
                            value={opt}
                            onChange={e => { const d = [...cfg.dietary.options]; d[i] = e.target.value; set('dietary', { ...cfg.dietary, options: d }); }}
                            placeholder="Vegetariano"
                          />
                          {cfg.dietary.options.length > 1 && (
                            <button style={S.removeBtn} onClick={() => set('dietary', { ...cfg.dietary, options: cfg.dietary.options.filter((_, j) => j !== i) })}>×</button>
                          )}
                        </div>
                      ))}
                      <button style={S.addBtn} onClick={() => set('dietary', { ...cfg.dietary, options: [...cfg.dietary.options, ''] })}>+ Opción</button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* No niños — aplica a todos los planes */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={cfg.noChildren}
                onChange={e => set('noChildren', e.target.checked)}
                style={{ width: isMobile ? '20px' : '16px', height: isMobile ? '20px' : '16px', accentColor: C.accent, cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{ fontSize: isMobile ? '15px' : '14px', color: C.text }}>Evento para adultos (mostrar aviso de &quot;no niños&quot;)</span>
            </label>
            {cfg.noChildren && (
              <Field label="Mensaje personalizado (opcional)" C={C}>
                <textarea
                  style={S.textarea}
                  value={cfg.noChildrenMessage}
                  onChange={e => set('noChildrenMessage', e.target.value)}
                  placeholder="Con todo nuestro cariño, les pedimos que esta celebración sea exclusiva para adultos. Agradecemos su comprensión."
                />
              </Field>
            )}
          </Section>

        </div>

        {/* ── Modal: Gestionar fotos ── */}
        {photosOpen && <PhotosModal
          photos={cfg.photos}
          onChange={photos => set('photos', photos)}
          C={C}
          S={S}
          eventSlug={eventSlug}
          photoLimit={photoLimit}
          onClose={() => setPhotosOpen(false)}
        />}
      </div>
    </MobileCtx.Provider>
  );
}
