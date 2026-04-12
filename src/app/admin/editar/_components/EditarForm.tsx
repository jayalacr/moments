'use client';

import { useState, useTransition, useEffect } from 'react';
import { updateEventConfig } from '@/app/admin/_actions';
import ImageUpload from '@/components/ui/ImageUpload';
import ImageLayoutEditor from './ImageLayoutEditor';
import type { ImageBlock } from '@/lib/imageLayout';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ItineraryItem { time: string; name: string; venue: string; address: string; mapsUrl?: string; image?: string; }
interface Swatch { color: string; name: string; }
interface Hotel { name: string; category: string; address: string; note: string; phone: string; }
interface TransportRow { time: string; detail: string; }

interface EventConfig {
  heroLabel: string;
  couple: { person1: string; person2: string };
  fullNames: { person1: string; person2: string };
  date: { day: string; month: string; year: string };
  location: string;
  targetDate: string;
  images: string[];
  quote: { text: string; reference: string };
  parents: { person1: string; person2: string };
  itinerary: ItineraryItem[];
  dressCode: { label: string; women: string; men: string; swatches: Swatch[]; avoid: Swatch[] };
  notes: string[];
  gifts: { bank: string; holder: string; account: string; clabe: string; giftListUrl: string; giftListLabel: string };
  destination: {
    hotels: Hotel[];
    transport: { info: string; schedule: TransportRow[]; contact: string };
  };
  whatsapp: { number: string; message: string };
  noChildren: boolean;
  noChildrenMessage: string;
  rsvpDeadline: string;
  rsvp: { maxPlusOnes: number; deadline: string; dietaryOptions: string[] };
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
  };
  imageLayout: ImageBlock[];
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------
const DEFAULT: EventConfig = {
  heroLabel: '',
  couple: { person1: '', person2: '' },
  fullNames: { person1: '', person2: '' },
  date: { day: '', month: '', year: '' },
  location: '',
  targetDate: '',
  images: ['', '', '', '', ''],
  quote: { text: '', reference: '' },
  parents: { person1: '', person2: '' },
  itinerary: [{ time: '', name: '', venue: '', address: '' }],
  dressCode: { label: '', women: '', men: '', swatches: [{ color: '#C9A87C', name: '' }], avoid: [{ color: '#FFFFFF', name: 'Blanco' }] },
  notes: [''],
  gifts: { bank: '', holder: '', account: '', clabe: '', giftListUrl: '', giftListLabel: '' },
  destination: {
    hotels: [],
    transport: { info: '', schedule: [], contact: '' },
  },
  whatsapp: { number: '', message: '' },
  noChildren: false,
  noChildrenMessage: '',
  rsvpDeadline: '',
  rsvp: { maxPlusOnes: 2, deadline: '', dietaryOptions: ['Sin restricción', 'Vegetariano', 'Vegano', 'Sin gluten', 'Sin mariscos'] },
  sections: {
    quote: false,
    parents: false,
    dressCode: false,
    notes: false,
    gifts: false,
    destination: false,
  },
  theme: {
    accentColor: '#B8965A',
    backgroundColor: '#F8F3EC',
    textColor: '#1C1611',
    displayFont: 'cormorant',
    bodyFont: 'jost',
  },
  imageLayout: [],
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
};
const DISPLAY_FONT_LABEL: Record<string, string> = {
  cormorant:     'Cormorant Garamond',
  playfair:      'Playfair Display',
  'eb-garamond': 'EB Garamond',
};
const BODY_FONT_FAMILY: Record<string, string> = {
  jost:       "'Jost', system-ui, sans-serif",
  raleway:    "'Raleway', system-ui, sans-serif",
  montserrat: "'Montserrat', system-ui, sans-serif",
};
const BODY_FONT_LABEL: Record<string, string> = {
  jost:       'Jost',
  raleway:    'Raleway',
  montserrat: 'Montserrat',
};

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=Playfair+Display:ital,wght@0,400;1,400&family=EB+Garamond:ital,wght@0,400;1,400&family=Jost:wght@300&family=Raleway:wght@300&family=Montserrat:wght@300&display=swap';

// ---------------------------------------------------------------------------
// Style factories (depend on colors)
// ---------------------------------------------------------------------------
function makeStyles(C: Colors) {
  const input: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    border: `1px solid ${C.border}`, borderRadius: '8px',
    backgroundColor: C.card, fontSize: '14px',
    color: C.text, fontFamily: C.font,
    outline: 'none', boxSizing: 'border-box',
  };
  return {
    input,
    textarea: { ...input, resize: 'vertical' as const, minHeight: '80px', lineHeight: '1.6' },
    lbl: {
      display: 'block', fontSize: '10px', letterSpacing: '2px',
      textTransform: 'uppercase' as const, color: C.muted,
      marginBottom: '6px', fontFamily: C.font,
    } as React.CSSProperties,
    addBtn: {
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '7px 14px', border: `1px dashed ${C.border}`,
      borderRadius: '8px', backgroundColor: 'transparent',
      color: C.muted, fontSize: '12px', cursor: 'pointer', fontFamily: C.font,
    } as React.CSSProperties,
    removeBtn: {
      padding: '4px 10px', border: `1px solid ${C.border}`,
      borderRadius: '6px', backgroundColor: 'transparent',
      color: C.mutedLight, fontSize: '11px', cursor: 'pointer',
      fontFamily: C.font, flexShrink: 0,
    } as React.CSSProperties,
  };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Section({
  title, C, children, visible, onVisibilityChange,
}: {
  title: string;
  C: Colors;
  children: React.ReactNode;
  visible?: boolean;
  onVisibilityChange?: (v: boolean) => void;
}) {
  const hasToggle = onVisibilityChange !== undefined;
  return (
    <div style={{ paddingBottom: '32px', borderBottom: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: C.accent, fontSize: C.isDark ? '16px' : '14px', fontFamily: C.monoFont }}>
            {C.isDark ? '_' : '✦'}
          </span>
          <h2 style={{
            fontFamily: C.isDark ? C.monoFont : 'var(--font-cormorant)',
            fontSize: C.isDark ? '13px' : '20px',
            fontWeight: 400,
            fontStyle: C.isDark ? 'normal' : 'italic',
            letterSpacing: C.isDark ? '2px' : '0',
            color: C.text,
            textTransform: C.isDark ? 'uppercase' : 'none',
          }}>
            {title}
          </h2>
        </div>
        {hasToggle && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
            <span style={{
              fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase',
              fontFamily: C.font, color: visible ? C.accent : C.mutedLight,
            }}>
              {visible ? 'Visible' : 'Oculto'}
            </span>
            <span
              onClick={() => onVisibilityChange(!visible)}
              style={{
                display: 'inline-flex', alignItems: 'center',
                width: '36px', height: '20px', borderRadius: '10px',
                backgroundColor: visible ? C.accent : C.border,
                padding: '2px', cursor: 'pointer',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <span style={{
                display: 'block', width: '16px', height: '16px', borderRadius: '50%',
                backgroundColor: C.card,
                transform: visible ? 'translateX(16px)' : 'translateX(0)',
                transition: 'transform 0.2s',
                flexShrink: 0,
              }} />
            </span>
          </label>
        )}
      </div>
      <div style={{ opacity: hasToggle && !visible ? 0.45 : 1, pointerEvents: hasToggle && !visible ? 'none' : undefined, transition: 'opacity 0.2s' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Array.isArray(children) ? children.filter(Boolean).length : 1}, 1fr)`, gap: '12px' }}>
      {children}
    </div>
  );
}

function Field({ label, C, children }: { label: string; C: Colors; children: React.ReactNode }) {
  return (
    <div>
      <span style={{
        display: 'block', fontSize: '10px', letterSpacing: '2px',
        textTransform: 'uppercase', color: C.muted,
        marginBottom: '6px', fontFamily: C.font,
      }}>
        {label}
      </span>
      {children}
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
  const S = makeStyles(C);

  // galleryMax = límite de imágenes de galería (sin contar el hero)
  // null = ilimitado (Deluxe)
  const galleryMax: number | null = isDeluxe ? null : (isPlus ? 10 : 5);
  const totalSlots = galleryMax !== null ? galleryMax + 1 : null; // +1 por el hero

  const [cfg, setCfg] = useState<EventConfig>(() => ({
    ...DEFAULT,
    ...initialConfig,
    couple:      { ...DEFAULT.couple,    ...initialConfig.couple },
    fullNames:   { ...DEFAULT.fullNames, ...initialConfig.fullNames },
    date:        { ...DEFAULT.date,      ...initialConfig.date },
    quote:       { ...DEFAULT.quote,     ...initialConfig.quote },
    parents:     { ...DEFAULT.parents,   ...initialConfig.parents },
    dressCode:   { ...DEFAULT.dressCode, ...initialConfig.dressCode },
    gifts:       { ...DEFAULT.gifts,     ...initialConfig.gifts },
    destination: {
      hotels:    (initialConfig as Partial<EventConfig>).destination?.hotels    ?? DEFAULT.destination.hotels,
      transport: { ...DEFAULT.destination.transport, ...(initialConfig as Partial<EventConfig>).destination?.transport },
    },
    whatsapp:    { ...DEFAULT.whatsapp,  ...initialConfig.whatsapp },
    rsvp:        { ...DEFAULT.rsvp,      ...(initialConfig as Partial<EventConfig>).rsvp },
    images: (() => {
      const src = initialConfig.images ?? [];
      if (isDeluxe) {
        // Deluxe: conservar todas las imágenes existentes; mínimo el slot del hero
        return src.length >= 1 ? src : [''];
      }
      return [...src, ...Array(totalSlots!).fill('')].slice(0, totalSlots!);
    })(),
    itinerary: initialConfig.itinerary?.length ? initialConfig.itinerary : DEFAULT.itinerary,
    notes:     initialConfig.notes?.length    ? initialConfig.notes      : DEFAULT.notes,
    theme:        { ...DEFAULT.theme, ...initialConfig.theme },
    sections:     { ...DEFAULT.sections, ...(initialConfig as Partial<EventConfig>).sections },
    imageLayout:  (initialConfig as Partial<EventConfig>).imageLayout ?? [],
  }));

  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Contador de imágenes de galería (excluye el hero en índice 0)
  const galleryFilled = cfg.images.filter((url, i) => i > 0 && url !== '').length;
  const atGalleryLimit = galleryMax !== null && galleryFilled >= galleryMax;

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
      await updateEventConfig(eventId, cfg as unknown as Record<string, unknown>);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div style={{ fontFamily: C.font, backgroundColor: C.bg }}>

      {/* ── Save bar ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        backgroundColor: C.bg, borderBottom: `1px solid ${C.border}`,
        padding: '12px 0', marginBottom: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <p style={{ fontSize: '11px', color: C.muted, letterSpacing: '1px', fontFamily: C.font }}>
          {saved ? '✓ cambios guardados' : 'los cambios se guardan manualmente'}
        </p>
        <button
          onClick={handleSave}
          disabled={isPending}
          style={{
            padding: '10px 24px',
            backgroundColor: isPending ? C.accentLight : C.accent,
            color: isPending ? C.muted : C.isDark ? '#0D1117' : '#F8F3EC',
            border: 'none', borderRadius: '8px',
            fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase',
            cursor: isPending ? 'not-allowed' : 'pointer',
            fontFamily: C.font, fontWeight: C.isDark ? 700 : 400,
            transition: 'background 0.2s',
          }}
        >
          {isPending ? 'guardando...' : 'guardar'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* ── 1. Portada ── */}
        <Section title="Portada" C={C}>
          <Field label="Frase de introducción (aparece encima de los nombres)" C={C}>
            <input style={S.input} value={cfg.heroLabel} onChange={e => set('heroLabel', e.target.value)} placeholder="Nuestro gran día" />
          </Field>
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
        <Section title="Fotos" C={C}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '-8px' }}>
            <p style={{ fontSize: '13px', color: C.muted, margin: 0 }}>
              {isDeluxe
                ? 'Imágenes para el carrusel. La primera es la portada principal (hero). Sin límite.'
                : isPlus
                  ? 'Hasta 10 imágenes adicionales para el carrusel (el hero no cuenta).'
                  : 'Hasta 5 imágenes adicionales (el hero no cuenta).'}
            </p>
            {galleryMax !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '12px',
                  fontFamily: C.font,
                  color: atGalleryLimit ? '#C0392B' : C.muted,
                  fontWeight: atGalleryLimit ? 600 : 400,
                }}>
                  {galleryFilled} / {galleryMax} imágenes
                </span>
                {atGalleryLimit && (
                  <span style={{ fontSize: '12px', color: '#C0392B', fontFamily: C.font }}>
                    · Alcanzaste el límite de imágenes de tu plan
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Hero — siempre en índice 0, no cuenta en el límite */}
          <ImageUpload
            label="Portada (hero — ancho completo)"
            folder={`moments/${eventSlug}`}
            value={cfg.images[0] ?? ''}
            onChange={url => {
              const imgs = [...cfg.images];
              imgs[0] = url;
              set('images', imgs);
            }}
          />

          {/* Galería */}
          {(isDeluxe
            ? Array.from({ length: cfg.images.length - 1 }, (_, relIdx) => relIdx)
            : Array.from({ length: galleryMax! }, (_, relIdx) => relIdx)
          ).map(relIdx => {
            const idx = relIdx + 1;
            const isEmpty = !cfg.images[idx];
            return (
              <ImageUpload
                key={idx}
                label={`Imagen ${idx + 1}`}
                folder={`moments/${eventSlug}`}
                value={cfg.images[idx] ?? ''}
                disabled={atGalleryLimit && isEmpty}
                onChange={url => {
                  const imgs = [...cfg.images];
                  imgs[idx] = url;
                  set('images', imgs);
                }}
              />
            );
          })}

          {/* Deluxe: botón para agregar más imágenes */}
          {isDeluxe && (
            <button
              type="button"
              style={S.addBtn}
              onClick={() => set('images', [...cfg.images, ''])}
            >
              + Agregar imagen
            </button>
          )}
        </Section>

        {/* ── Layout de Fotos (Plus / Deluxe) ── */}
        {isPlus && (
          <Section title="Layout de Fotos" C={C}>
            <p style={{ fontSize: '13px', color: C.muted, marginTop: '-8px', margin: '0 0 4px' }}>
              Posiciona tus imágenes entre las secciones. Arrastra los bloques para reordenarlos.
            </p>
            <ImageLayoutEditor
              images={cfg.images}
              layout={cfg.imageLayout}
              onChange={layout => set('imageLayout', layout)}
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
        )}

        {/* ── 3. Cita ── */}
        <Section title="Cita o frase" C={C}
          visible={cfg.sections.quote}
          onVisibilityChange={v => set('sections', { ...cfg.sections, quote: v })}
        >
          <Field label="Texto" C={C}>
            <textarea style={S.textarea} value={cfg.quote.text} onChange={e => set('quote', { ...cfg.quote, text: e.target.value })} placeholder="Lo que Dios unió, que no lo separe el hombre." />
          </Field>
          <Field label="Referencia" C={C}>
            <input style={S.input} value={cfg.quote.reference} onChange={e => set('quote', { ...cfg.quote, reference: e.target.value })} placeholder="Marcos 10:9" />
          </Field>
        </Section>

        {/* ── 4. Padres ── */}
        <Section title="Padres" C={C}
          visible={cfg.sections.parents}
          onVisibilityChange={v => set('sections', { ...cfg.sections, parents: v })}
        >
          <Field label="Padres — persona 1 (usa \n para nueva línea)" C={C}>
            <textarea style={{ ...S.textarea, minHeight: '64px' }} value={cfg.parents.person1} onChange={e => set('parents', { ...cfg.parents, person1: e.target.value })} placeholder={'Roberto Herrera &\nCarmen López de Herrera'} />
          </Field>
          <Field label="Padres — persona 2 (usa \n para nueva línea)" C={C}>
            <textarea style={{ ...S.textarea, minHeight: '64px' }} value={cfg.parents.person2} onChange={e => set('parents', { ...cfg.parents, person2: e.target.value })} placeholder={'Jorge Mendoza &\nPatricia Ruiz de Mendoza'} />
          </Field>
        </Section>

        {/* ── 5. Itinerario ── */}
        <Section title="Itinerario" C={C}>
          {cfg.itinerary.map((item, i) => (
            <div key={i} style={{ padding: '16px', border: `1px solid ${C.border}`, borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: C.card }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: C.mutedLight, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: C.font }}>Evento {i + 1}</span>
                {cfg.itinerary.length > 1 && (
                  <button style={S.removeBtn} onClick={() => set('itinerary', cfg.itinerary.filter((_, j) => j !== i))}>Eliminar</button>
                )}
              </div>
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
                <ImageUpload
                  label="Foto del lugar (opcional)"
                  folder={`moments/${eventSlug}`}
                  value={item.image ?? ''}
                  onChange={url => { const it = [...cfg.itinerary]; it[i] = { ...it[i], image: url }; set('itinerary', it); }}
                />
              )}
            </div>
          ))}
          <button style={S.addBtn} onClick={() => set('itinerary', [...cfg.itinerary, { time: '', name: '', venue: '', address: '' }])}>
            + Agregar evento
          </button>
        </Section>

        {/* ── 6. Dress Code ── */}
        <Section title="Dress Code" C={C}
          visible={cfg.sections.dressCode}
          onVisibilityChange={v => set('sections', { ...cfg.sections, dressCode: v })}
        >
          <Field label="Etiqueta (ej: Formal, Cocktail)" C={C}>
            <input style={S.input} value={cfg.dressCode.label} onChange={e => set('dressCode', { ...cfg.dressCode, label: e.target.value })} placeholder="Formal" />
          </Field>
          <Field label="Indicaciones para damas" C={C}>
            <textarea style={S.textarea} value={cfg.dressCode.women} onChange={e => set('dressCode', { ...cfg.dressCode, women: e.target.value })} placeholder="Vestido largo o midi en tonos de la paleta..." />
          </Field>
          <Field label="Indicaciones para caballeros" C={C}>
            <textarea style={S.textarea} value={cfg.dressCode.men} onChange={e => set('dressCode', { ...cfg.dressCode, men: e.target.value })} placeholder="Traje oscuro o guayabera formal..." />
          </Field>

          <div>
            <span style={S.lbl}>Paleta de colores</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cfg.dressCode.swatches.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="color" style={{ ...S.input, width: '48px', padding: '2px 4px', flexShrink: 0 }} value={s.color} onChange={e => { const sw = [...cfg.dressCode.swatches]; sw[i] = { ...sw[i], color: e.target.value }; set('dressCode', { ...cfg.dressCode, swatches: sw }); }} />
                  <input style={{ ...S.input, flex: 1 }} value={s.name} onChange={e => { const sw = [...cfg.dressCode.swatches]; sw[i] = { ...sw[i], name: e.target.value }; set('dressCode', { ...cfg.dressCode, swatches: sw }); }} placeholder="Champagne" />
                  {cfg.dressCode.swatches.length > 1 && (
                    <button style={S.removeBtn} onClick={() => set('dressCode', { ...cfg.dressCode, swatches: cfg.dressCode.swatches.filter((_, j) => j !== i) })}>×</button>
                  )}
                </div>
              ))}
              <button style={S.addBtn} onClick={() => set('dressCode', { ...cfg.dressCode, swatches: [...cfg.dressCode.swatches, { color: '#C9A87C', name: '' }] })}>+ Color</button>
            </div>
          </div>

          <div>
            <span style={S.lbl}>Colores a evitar</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cfg.dressCode.avoid.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="color" style={{ ...S.input, width: '48px', padding: '2px 4px', flexShrink: 0 }} value={s.color} onChange={e => { const av = [...cfg.dressCode.avoid]; av[i] = { ...av[i], color: e.target.value }; set('dressCode', { ...cfg.dressCode, avoid: av }); }} />
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
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
        <Section title="Regalos" C={C}
          visible={cfg.sections.gifts}
          onVisibilityChange={v => set('sections', { ...cfg.sections, gifts: v })}
        >
          <Row>
            <Field label="Banco" C={C}><input style={S.input} value={cfg.gifts.bank} onChange={e => set('gifts', { ...cfg.gifts, bank: e.target.value })} placeholder="BBVA" /></Field>
            <Field label="Titular" C={C}><input style={S.input} value={cfg.gifts.holder} onChange={e => set('gifts', { ...cfg.gifts, holder: e.target.value })} placeholder="Sofía Herrera López" /></Field>
          </Row>
          <Row>
            <Field label="Número de cuenta" C={C}><input style={S.input} value={cfg.gifts.account} onChange={e => set('gifts', { ...cfg.gifts, account: e.target.value })} placeholder="4152 3140 7823 9012" /></Field>
            <Field label="CLABE interbancaria" C={C}><input style={S.input} value={cfg.gifts.clabe} onChange={e => set('gifts', { ...cfg.gifts, clabe: e.target.value })} placeholder="012 180 00412345678 9" /></Field>
          </Row>
          <Row>
            <Field label="Nombre mesa de regalos (ej: Liverpool)" C={C}><input style={S.input} value={cfg.gifts.giftListLabel} onChange={e => set('gifts', { ...cfg.gifts, giftListLabel: e.target.value })} placeholder="Liverpool" /></Field>
            <Field label="Link mesa de regalos" C={C}><input style={S.input} type="url" value={cfg.gifts.giftListUrl} onChange={e => set('gifts', { ...cfg.gifts, giftListUrl: e.target.value })} placeholder="https://mesaderegalos.liverpool.com.mx/..." /></Field>
          </Row>
        </Section>

        {/* ── Plus: Boda Destino ── */}
        {isPlus && (
          <Section title="Boda Destino (hospedaje y transporte)" C={C}
            visible={cfg.sections.destination}
            onVisibilityChange={v => set('sections', { ...cfg.sections, destination: v })}
          >
            <p style={{ fontSize: '13px', color: C.muted, marginTop: '-8px' }}>
              Agrega hoteles recomendados y detalles de transporte para tus invitados.
            </p>

            {/* Hoteles */}
            <div>
              <span style={S.lbl}>Hoteles recomendados</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cfg.destination.hotels.map((h, i) => (
                  <div key={i} style={{ padding: '16px', border: `1px solid ${C.border}`, borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: C.card }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: C.mutedLight, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: C.font }}>Hotel {i + 1}</span>
                      <button style={S.removeBtn} onClick={() => set('destination', { ...cfg.destination, hotels: cfg.destination.hotels.filter((_, j) => j !== i) })}>Eliminar</button>
                    </div>
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
                  </div>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {cfg.destination.transport.schedule.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input style={{ ...S.input, width: '140px', flexShrink: 0 }} value={s.time} onChange={e => { const sc = [...cfg.destination.transport.schedule]; sc[i] = { ...sc[i], time: e.target.value }; set('destination', { ...cfg.destination, transport: { ...cfg.destination.transport, schedule: sc } }); }} placeholder="10:00 – 14:00" />
                        <input style={{ ...S.input, flex: 1 }} value={s.detail} onChange={e => { const sc = [...cfg.destination.transport.schedule]; sc[i] = { ...sc[i], detail: e.target.value }; set('destination', { ...cfg.destination, transport: { ...cfg.destination.transport, schedule: sc } }); }} placeholder="Transfers continuos desde el aeropuerto" />
                        <button style={S.removeBtn} onClick={() => set('destination', { ...cfg.destination, transport: { ...cfg.destination.transport, schedule: cfg.destination.transport.schedule.filter((_, j) => j !== i) } })}>×</button>
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

        {/* ── 0. Diseño ── */}
        <Section title="Diseño" C={C}>
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
            <Field label="Color de fondo" C={C}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="color"
                  value={cfg.theme.backgroundColor}
                  onChange={e => set('theme', { ...cfg.theme, backgroundColor: e.target.value })}
                  style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '2px', backgroundColor: 'transparent' }}
                />
                <input
                  style={{ ...S.input, flex: 1 }}
                  value={cfg.theme.backgroundColor}
                  onChange={e => set('theme', { ...cfg.theme, backgroundColor: e.target.value })}
                  placeholder="#F8F3EC"
                />
              </div>
            </Field>
            <Field label="Color de texto" C={C}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="color"
                  value={cfg.theme.textColor}
                  onChange={e => set('theme', { ...cfg.theme, textColor: e.target.value })}
                  style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '2px', backgroundColor: 'transparent' }}
                />
                <input
                  style={{ ...S.input, flex: 1 }}
                  value={cfg.theme.textColor}
                  onChange={e => set('theme', { ...cfg.theme, textColor: e.target.value })}
                  placeholder="#1C1611"
                />
              </div>
            </Field>
          </Row>
          <Field label="Color de acento" C={C}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="color"
                value={cfg.theme.accentColor}
                onChange={e => set('theme', { ...cfg.theme, accentColor: e.target.value })}
                style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '2px', backgroundColor: 'transparent' }}
              />
              <input
                style={{ ...S.input, flex: 1 }}
                value={cfg.theme.accentColor}
                onChange={e => set('theme', { ...cfg.theme, accentColor: e.target.value })}
                placeholder="#B8965A"
              />
            </div>
          </Field>
        </Section>

        {/* ── 9. Confirmación ── */}
        <Section title="Confirmación de asistencia" C={C}>
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
              <Row>
                <Field label="Fecha límite de confirmación" C={C}>
                  <input style={S.input} value={cfg.rsvp.deadline} onChange={e => set('rsvp', { ...cfg.rsvp, deadline: e.target.value })} placeholder="15 de mayo de 2026" />
                </Field>
                <Field label="Máximo de acompañantes por invitación" C={C}>
                  <input
                    style={S.input}
                    type="number"
                    min={0}
                    max={20}
                    value={cfg.rsvp.maxPlusOnes}
                    onChange={e => set('rsvp', { ...cfg.rsvp, maxPlusOnes: Math.max(0, parseInt(e.target.value) || 0) })}
                  />
                  <p style={{ fontSize: '11px', color: C.muted, marginTop: '4px' }}>
                    Número de personas adicionales que puede traer cada invitado (0 = solo el titular).
                  </p>
                </Field>
              </Row>
              <div>
                <span style={S.lbl}>Opciones de restricción alimentaria</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cfg.rsvp.dietaryOptions.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input style={{ ...S.input, flex: 1 }} value={opt} onChange={e => { const d = [...cfg.rsvp.dietaryOptions]; d[i] = e.target.value; set('rsvp', { ...cfg.rsvp, dietaryOptions: d }); }} placeholder="Vegetariano" />
                      {cfg.rsvp.dietaryOptions.length > 1 && (
                        <button style={S.removeBtn} onClick={() => set('rsvp', { ...cfg.rsvp, dietaryOptions: cfg.rsvp.dietaryOptions.filter((_, j) => j !== i) })}>×</button>
                      )}
                    </div>
                  ))}
                  <button style={S.addBtn} onClick={() => set('rsvp', { ...cfg.rsvp, dietaryOptions: [...cfg.rsvp.dietaryOptions, ''] })}>+ Opción</button>
                </div>
              </div>
            </>
          )}

          {/* No niños — aplica a todos los planes */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={cfg.noChildren}
              onChange={e => set('noChildren', e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: C.accent, cursor: 'pointer', flexShrink: 0 }}
            />
            <span style={{ fontSize: '14px', color: C.text }}>Evento para adultos (mostrar aviso de &quot;no niños&quot;)</span>
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
    </div>
  );
}
