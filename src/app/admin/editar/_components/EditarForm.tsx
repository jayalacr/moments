'use client';

import { useState, useTransition } from 'react';
import { updateEventConfig } from '@/app/admin/_actions';
import ImageUpload from '@/components/ui/ImageUpload';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ItineraryItem { time: string; name: string; venue: string; address: string; }
interface Swatch { color: string; name: string; }

interface EventConfig {
  heroLabel: string;
  couple: { person1: string; person2: string };
  fullNames: { person1: string; person2: string };
  date: { day: string; month: string; year: string };
  location: string;
  images: string[];
  quote: { text: string; reference: string };
  parents: { person1: string; person2: string };
  itinerary: ItineraryItem[];
  dressCode: { label: string; women: string; men: string; swatches: Swatch[]; avoid: Swatch[] };
  notes: string[];
  gifts: { bank: string; holder: string; account: string; clabe: string; giftListUrl: string; giftListLabel: string };
  whatsapp: { number: string; message: string };
  noChildren: boolean;
  noChildrenMessage: string;
  rsvpDeadline: string;
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
  images: ['', '', '', '', ''],
  quote: { text: '', reference: '' },
  parents: { person1: '', person2: '' },
  itinerary: [{ time: '', name: '', venue: '', address: '' }],
  dressCode: { label: '', women: '', men: '', swatches: [{ color: '#C9A87C', name: '' }], avoid: [{ color: '#FFFFFF', name: 'Blanco' }] },
  notes: [''],
  gifts: { bank: '', holder: '', account: '', clabe: '', giftListUrl: '', giftListLabel: '' },
  whatsapp: { number: '', message: '' },
  noChildren: false,
  noChildrenMessage: '',
  rsvpDeadline: '',
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
function Section({ title, C, children }: { title: string; C: Colors; children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: '32px', borderBottom: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
      {children}
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
  theme = 'light',
}: {
  eventId: string;
  eventSlug: string;
  initialConfig: Partial<EventConfig>;
  theme?: 'light' | 'dark';
}) {
  const C = theme === 'dark' ? DARK : LIGHT;
  const S = makeStyles(C);

  const [cfg, setCfg] = useState<EventConfig>(() => ({
    ...DEFAULT,
    ...initialConfig,
    couple:    { ...DEFAULT.couple,    ...initialConfig.couple },
    fullNames: { ...DEFAULT.fullNames, ...initialConfig.fullNames },
    date:      { ...DEFAULT.date,      ...initialConfig.date },
    quote:     { ...DEFAULT.quote,     ...initialConfig.quote },
    parents:   { ...DEFAULT.parents,   ...initialConfig.parents },
    dressCode: { ...DEFAULT.dressCode, ...initialConfig.dressCode },
    gifts:     { ...DEFAULT.gifts,     ...initialConfig.gifts },
    whatsapp:  { ...DEFAULT.whatsapp,  ...initialConfig.whatsapp },
    images:    initialConfig.images?.length ? [...initialConfig.images, ...Array(5).fill('')].slice(0, 5) : DEFAULT.images,
    itinerary: initialConfig.itinerary?.length ? initialConfig.itinerary : DEFAULT.itinerary,
    notes:     initialConfig.notes?.length    ? initialConfig.notes      : DEFAULT.notes,
  }));

  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

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
        </Section>

        {/* ── 2. Fotos ── */}
        <Section title="Fotos" C={C}>
          <p style={{ fontSize: '13px', color: C.muted, marginTop: '-8px' }}>
            Máximo 5 imágenes. La primera es la portada principal (hero).
          </p>
          {['Portada (hero — ancho completo)', 'Imagen 2 — ancho completo', 'Imagen 3 — centrada', 'Imagen 4 — dúo izquierda', 'Imagen 5 — dúo derecha'].map((lblText, i) => (
            <ImageUpload
              key={i}
              label={lblText}
              folder={`moments/${eventSlug}`}
              value={cfg.images[i] ?? ''}
              onChange={url => {
                const imgs = [...cfg.images];
                imgs[i] = url;
                set('images', imgs);
              }}
            />
          ))}
        </Section>

        {/* ── 3. Cita ── */}
        <Section title="Cita o frase" C={C}>
          <Field label="Texto" C={C}>
            <textarea style={S.textarea} value={cfg.quote.text} onChange={e => set('quote', { ...cfg.quote, text: e.target.value })} placeholder="Lo que Dios unió, que no lo separe el hombre." />
          </Field>
          <Field label="Referencia" C={C}>
            <input style={S.input} value={cfg.quote.reference} onChange={e => set('quote', { ...cfg.quote, reference: e.target.value })} placeholder="Marcos 10:9" />
          </Field>
        </Section>

        {/* ── 4. Padres ── */}
        <Section title="Padres" C={C}>
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
            </div>
          ))}
          <button style={S.addBtn} onClick={() => set('itinerary', [...cfg.itinerary, { time: '', name: '', venue: '', address: '' }])}>
            + Agregar evento
          </button>
        </Section>

        {/* ── 6. Dress Code ── */}
        <Section title="Dress Code" C={C}>
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
        <Section title="Notas adicionales" C={C}>
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
        <Section title="Regalos" C={C}>
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

        {/* ── 9. Confirmación ── */}
        <Section title="Confirmación de asistencia" C={C}>
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
