'use client';

import { Cormorant_Garamond, Jost, Montserrat } from 'next/font/google';
import React, { useEffect, useState, useRef } from 'react';
import type { ImageBlock, PhotoEntry } from '@/lib/imageLayout';

// ---------------------------------------------------------------------------
// Config type
// ---------------------------------------------------------------------------
export interface PlusConfig {
  heroLabel?: string;
  couple?: { person1?: string; person2?: string };
  fullNames?: { person1?: string; person2?: string };
  date?: { day?: string; month?: string; year?: string };
  location?: string;
  targetDate?: string;
  quote?: { text?: string; reference?: string };
  parents?: { person1?: string; person2?: string };
  images?: string[];
  itinerary?: Array<{
    time: string;
    name: string;
    venue: string;
    address?: string;
    mapsUrl?: string;
    image?: string;
    imageObjectPosition?: string;
    imageScale?: number;
  }>;
  dressCode?: {
    label?: string;
    women?: string;
    men?: string;
    swatches?: Array<{ color: string; name: string }>;
    avoid?: Array<{ color: string; name: string }>;
  };
  notes?: string[];
  destination?: {
    hotels?: Array<{
      name: string;
      category?: string;
      address?: string;
      note?: string;
      phone?: string;
    }>;
    transport?: {
      info?: string;
      schedule?: Array<{ time: string; detail: string }>;
      contact?: string;
    };
  };
  gifts?: {
    bank?: string;
    holder?: string;
    account?: string;
    clabe?: string;
    giftListUrl?: string;
    giftListLabel?: string;
    giftTypes?: string[];
    envelopeMessage?: string;
  };
  noChildren?: boolean;
  noChildrenMessage?: string;
  rsvp?: {
    maxPlusOnes?: number;
    deadline?: string;
    dietaryOptions?: string[];
  };
  sections?: {
    quote?: boolean;
    parents?: boolean;
    dressCode?: boolean;
    notes?: boolean;
    gifts?: boolean;
    destination?: boolean;
    itinerary?: boolean;
  };
  theme?: {
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  imageLayout?: ImageBlock[];  // @deprecated — usar photos
  photos?: PhotoEntry[];
}

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-montserrat',
});

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const EVENT = {
  heroLabel: 'Matrimonio',
  couple: { person1: 'Valentina', person2: 'Sebastián' },
  fullNames: { person1: 'Valentina Ríos Castillo', person2: 'Sebastián Mora Vega' },
  date: { day: '01', month: 'Agosto', year: '2026' },
  location: 'Cartagena, Colombia',
  targetDate: '2026-08-01T17:00:00',
  quote: {
    text: 'El amor es paciente, es bondadoso; el amor no tiene envidia.',
    reference: '1 Corintios 13:4',
  },
  parents: {
    person1: 'Andrés Ríos &\nMaría Castillo de Ríos',
    person2: 'Carlos Mora &\nLucia Vega de Mora',
  },
  images: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80',
    'https://images.unsplash.com/photo-1529636798458-92182e662485?w=1200&q=80',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80',
    'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200&q=80',
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1200&q=80',
  ],
  itinerary: [
    {
      time: '17:00',
      name: 'Ceremonia Civil',
      venue: 'Hotel Santa Clara',
      address: 'Calle del Torno 39-29, Centro Histórico, Cartagena',
      mapColor: '#C9A87C',
      image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&q=80',
    },
    {
      time: '19:00',
      name: 'Coctel',
      venue: 'Terraza del Baluarte',
      address: 'Av. Blas de Lezo, Cartagena de Indias',
      mapColor: '#8B9D77',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80',
    },
    {
      time: '21:00',
      name: 'Cena y Fiesta',
      venue: 'Casa de la Cerveza',
      address: 'Plaza de los Coches, Cartagena de Indias',
      mapColor: '#7B9AB2',
      image: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80',
    },
  ],
  dressCode: {
    label: 'Cocktail',
    women: 'Vestido cocktail o midi. Paleta de colores cálidos o neutros. Tacón o sandalia elegante.',
    men: 'Traje o blazer con pantalón de vestir. Sin corbata obligatoria. Zapato formal.',
    swatches: [
      { color: '#F2E8D9', name: 'Arena' },
      { color: '#C9A87C', name: 'Dorado' },
      { color: '#6B8FA3', name: 'Azul Mar' },
      { color: '#9DB88A', name: 'Oliva' },
      { color: '#E8C8A0', name: 'Melocotón' },
    ],
    avoid: [
      { color: '#FFFFFF', name: 'Blanco' },
    ],
  },
  notes: [
    'Evento para adultos — no se permiten niños.',
    'El evento es en exteriores; se recomienda tacón bajo o cuña.',
    'Llegada puntual a las 16:45 h. Las puertas cierran al iniciar la ceremonia.',
  ],
  destination: {
    hotels: [
      {
        name: 'Hotel Santa Clara',
        category: 'Recomendado · 5 estrellas',
        address: 'Calle del Torno 39-29, Centro Histórico',
        note: 'Tarifa especial con código VALYSEB',
        phone: '+57 5 664 6070',
      },
      {
        name: 'Sofitel Legend',
        category: '5 estrellas · Frente al mar',
        address: 'Av. del Lago 1, Cartagena',
        note: 'Disponibilidad limitada',
        phone: '+57 5 650 4444',
      },
      {
        name: 'Casa San Agustín',
        category: 'Boutique · Patrimonio',
        address: 'Calle de la Universidad 36-44',
        note: 'Check-in desde las 3pm',
        phone: '+57 5 681 0200',
      },
    ],
    transport: {
      info: 'Contratamos transfer desde el aeropuerto Rafael Núñez hasta los hoteles principales el día 13 y 14 de junio.',
      schedule: [
        { time: '10:00 – 16:00', detail: 'Transfers continuos desde el aeropuerto' },
        { time: '16:30', detail: 'Último transfer antes de la ceremonia' },
      ],
      contact: 'coordinacion@valentinaysebastian.com',
    },
  },
  gifts: {
    bank: 'Bancolombia',
    holder: 'Valentina Ríos Castillo',
    account: '695-123456-78',
    clabe: 'COL 695 0000 1234 5678',
    giftListUrl: 'https://novios.com.co/lista/valentinaySebastian',
    giftListLabel: 'Novios.com.co',
  },
  noChildren: true,
  rsvp: {
    maxPlusOnes: 2,
    deadline: '15 de mayo de 2026',
    dietaryOptions: ['Sin restricción', 'Vegetariano', 'Vegano', 'Sin gluten', 'Sin mariscos', 'Alérgico a nueces'],
  },
  whatsapp: {
    number: '573001234567',
    message: 'Hola, confirmo mi asistencia a la boda de Valentina & Sebastián el 14 de junio. 💛',
  },
};

// ---------------------------------------------------------------------------
// DuoBlock — dos imágenes lado a lado (colapsa en mobile)
// ---------------------------------------------------------------------------
function DuoBlock({ src1, src2, pos1, pos2, scale1, scale2 }: { src1: string; src2: string; pos1?: string; pos2?: string; scale1?: number; scale2?: number }) {
  return (
    <div className="duo-block reveal">
      <div className="duo-block-item slide-left">
        <img src={src1} alt="" className="duo-block-img" style={{ objectPosition: pos1 ?? 'center center', transform: `scale(${scale1 ?? 1})`, transformOrigin: pos1 ?? 'center center' }} />
      </div>
      <div className="duo-block-item slide-right">
        <img src={src2} alt="" className="duo-block-img" style={{ objectPosition: pos2 ?? 'center center', transform: `scale(${scale2 ?? 1})`, transformOrigin: pos2 ?? 'center center' }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TrioBlock — tres imágenes (3 columnas en desktop, grid en mobile)
// ---------------------------------------------------------------------------
function TrioBlock({
  src1, src2, src3,
  pos1, pos2, pos3,
  scale1, scale2, scale3
}: {
  src1: string; src2: string; src3: string;
  pos1?: string; pos2?: string; pos3?: string;
  scale1?: number; scale2?: number; scale3?: number;
}) {
  return (
    <div className="trio-block reveal">
      <div className="trio-block-item slide-up">
        <img src={src1} alt="" className="trio-block-img" style={{ objectPosition: pos1 ?? 'center center', transform: `scale(${scale1 ?? 1})`, transformOrigin: pos1 ?? 'center center' }} />
      </div>
      <div className="trio-block-item slide-up delay-1">
        <img src={src2} alt="" className="trio-block-img" style={{ objectPosition: pos2 ?? 'center center', transform: `scale(${scale2 ?? 1})`, transformOrigin: pos2 ?? 'center center' }} />
      </div>
      <div className="trio-block-item slide-up delay-2">
        <img src={src3} alt="" className="trio-block-img" style={{ objectPosition: pos3 ?? 'center center', transform: `scale(${scale3 ?? 1})`, transformOrigin: pos3 ?? 'center center' }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CarouselBlock — carrusel inline para bloques de imageLayout
// ---------------------------------------------------------------------------
function CarouselBlock({ srcs, positions, scales }: { srcs: string[]; positions?: string[]; scales?: number[] }) {
  const [idx, setIdx] = useState(0);
  const total = srcs.length;
  const touchStartX = useRef<number | null>(null);

  const prev = () => setIdx(i => (i - 1 + total) % total);
  const next = () => setIdx(i => (i + 1) % total);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  if (total === 0) return null;

  return (
    <div className="carousel" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="carousel-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {srcs.map((src, i) => (
          <div key={i} className="carousel-slide">
            <img src={src} alt={`Foto ${i + 1}`} className="carousel-img" style={{ objectPosition: positions?.[i] ?? 'center center', transform: `scale(${scales?.[i] ?? 1})`, transformOrigin: positions?.[i] ?? 'center center' }} />
          </div>
        ))}
      </div>
      {total > 1 && (
        <>
          <button className="carousel-btn carousel-btn--prev" onClick={prev} aria-label="Anterior">
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M9 1L1 8.5L9 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="carousel-btn carousel-btn--next" onClick={next} aria-label="Siguiente">
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none"><path d="M1 1L9 8.5L1 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="carousel-dots">
            {srcs.map((_, i) => (
              <button key={i} className={`carousel-dot${i === idx ? ' carousel-dot--active' : ''}`}
                onClick={() => setIdx(i)} aria-label={`Foto ${i + 1}`} />
            ))}
          </div>
          <div className="carousel-counter">
            <span className="label gold">{idx + 1} / {total}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Countdown hook
// ---------------------------------------------------------------------------
function useCountdown(targetDate: string) {
  const calc = () => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    setTime(calc());
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function PlusTemplate({
  config = {},
  eventId,
  guestToken,
  maxCompanions: maxCompanionsProp,
  guestName,
  hasExistingRsvp = false,
}: {
  config?: PlusConfig;
  eventId?: string;
  guestToken?: string;
  maxCompanions?: number;
  companionNames?: string[];
  guestName?: string;
  hasExistingRsvp?: boolean;
}) {
  // Merge config over mock defaults
  const E = {
    heroLabel:  config.heroLabel  ?? EVENT.heroLabel,
    couple:     { ...EVENT.couple,    ...config.couple    },
    fullNames:  { ...EVENT.fullNames, ...config.fullNames },
    date:       { ...EVENT.date,      ...config.date      },
    location:   config.location   ?? EVENT.location,
    targetDate: config.targetDate ?? EVENT.targetDate,
    quote:      { ...EVENT.quote,     ...config.quote     },
    parents:    { ...EVENT.parents,   ...config.parents   },
    images:     config.images?.length ? config.images : EVENT.images,
    itinerary:  config.itinerary?.length ? config.itinerary : EVENT.itinerary,
    dressCode:  {
      ...EVENT.dressCode,
      ...config.dressCode,
      swatches: config.dressCode?.swatches ?? EVENT.dressCode.swatches,
      avoid:    config.dressCode?.avoid    ?? EVENT.dressCode.avoid,
    },
    notes:       config.notes       ?? EVENT.notes,
    destination: {
      hotels:    config.destination?.hotels    ?? EVENT.destination.hotels,
      transport: { ...EVENT.destination.transport, ...config.destination?.transport },
    },
    gifts:         { ...EVENT.gifts, ...config.gifts },
    noChildren:    config.noChildren    ?? EVENT.noChildren,
    noChildrenMessage: config.noChildrenMessage,
    rsvp:          { ...EVENT.rsvp, ...config.rsvp },
    sections:      config.sections    ?? {},
    theme:         config.theme       ?? {},
    imageLayout:   config.imageLayout ?? [],
    photos:        config.photos      ?? [],
  };

  const accentColor      = E.theme.accentColor      ?? '#B8965A';
  const backgroundColor  = E.theme.backgroundColor  ?? '#F8F3EC';
  const textColor        = E.theme.textColor        ?? '#1C1611';

  // Priorizar siempre el valor que viene configurado (deluxe con token o plus con link inteligente)
  const effectiveMaxCompanions = maxCompanionsProp ?? 0;

  const countdown = useCountdown(E.targetDate);
  const [modalOpen, setModalOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState(guestName ?? '');
  const [companionInputs, setCompanionInputs] = useState<string[]>([]);
  const [dietary, setDietary] = useState(E.rsvp.dietaryOptions?.[0] ?? 'Sin restricción');
  const [dietaryMap, setDietaryMap] = useState<Record<string, string[]>>({});
  const [rsvpSent, setRsvpSent] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'confirmed' | 'declined' | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const axisRef = useRef<HTMLDivElement>(null);

  function handleCompanionCountChange(n: number) {
    const count = Math.max(0, Math.min(effectiveMaxCompanions, n));
    setCompanionInputs(prev =>
      count > prev.length
        ? [...prev, ...Array(count - prev.length).fill('')]
        : prev.slice(0, count)
    );
  }

  function handleCompanionName(index: number, value: string) {
    setCompanionInputs(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal, .slide-left, .slide-right, .slide-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Itinerary axis growing line
  useEffect(() => {
    const el = axisRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('axis-grow'); },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /** Renderiza los bloques de imagen para una posición de sección */
  function renderBlocks(afterSection: string) {
    // Nuevo modelo: photos[]
    if (E.photos.length > 0) {
      const sp = E.photos.filter(p => p.role === 'block' && p.afterSection === afterSection);
      if (sp.length === 0) return null;
      const map = new Map<number, typeof sp>();
      for (const p of sp) {
        const g = p.blockGroup ?? 0;
        map.set(g, [...(map.get(g) ?? []), p]);
      }
      return Array.from(map.entries())
        .sort(([a], [b]) => a - b)
        .map(([g, ps]) => {
          const sorted = ps.sort((a, b) => (a.orderInBlock ?? 0) - (b.orderInBlock ?? 0));
          const srcs      = sorted.map(p => p.url).filter(Boolean);
          const positions = sorted.map(p => p.objectPosition ?? 'center center');
          const scales    = sorted.map(p => p.scale ?? 1);
          if (!srcs.length) return null;
          if (ps[0].layout === 'full') return <div key={g} className="photo-block reveal"><img src={srcs[0]} alt="" className="photo-block-img" style={{ objectPosition: positions[0], transform: `scale(${scales[0]})`, transformOrigin: positions[0] }} /></div>;
          if (ps[0].layout === 'duo')  return <DuoBlock key={g} src1={srcs[0]} src2={srcs[1] ?? srcs[0]} pos1={positions[0]} pos2={positions[1]} scale1={scales[0]} scale2={scales[1]} />;
          if (ps[0].layout === 'trio') return <TrioBlock key={g} src1={srcs[0]} src2={srcs[1] ?? srcs[0]} src3={srcs[2] ?? srcs[0]} pos1={positions[0]} pos2={positions[1]} pos3={positions[2]} scale1={scales[0]} scale2={scales[1]} scale3={scales[2]} />;
          return <CarouselBlock key={g} srcs={srcs} positions={positions} scales={scales} />;
        });
    }

    // Modelo antiguo: imageLayout[] (fallback)
    const blocks = E.imageLayout.filter(b => b.afterSection === afterSection);
    if (blocks.length === 0) return null;
    return blocks.map((block, i) => {
      const srcs = (block.imageIndexes ?? [])
        .map(idx => E.images[idx])
        .filter((s): s is string => !!s && s.trim() !== '');
      if (srcs.length === 0) return null;
      if (block.layout === 'full') return <div key={i} className="photo-block"><img src={srcs[0]} alt="" className="photo-block-img" /></div>;
      if (block.layout === 'duo')  return <DuoBlock key={i} src1={srcs[0]} src2={srcs[1] ?? srcs[0]} />;
      return <CarouselBlock key={i} srcs={srcs} />;
    });
  }

  const submitRsvp = async (status: 'confirmed' | 'declined') => {
    setRsvpLoading(true);
    setRsvpError(null);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(guestToken ? { token: guestToken } : { eventId }),
          name: rsvpName.trim(),
          seats: status === 'declined' ? 0 : 1 + companionInputs.filter(n => n.trim() !== '').length,
          companionNames: status === 'declined' ? [] : companionInputs.filter(n => n.trim() !== ''),
          dietary: status === 'declined' ? '' : (dietaryMap[rsvpName || 'Tú']?.join(', ') || ''),
          dietaryPerPerson: status === 'declined' ? {} : dietaryMap,
          status,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRsvpError(data.error ?? 'Ocurrió un error. Intenta de nuevo.');
        return;
      }
      setRsvpStatus(status);
      setRsvpSent(true);
    } catch {
      setRsvpError('Sin conexión. Verifica tu internet e intenta de nuevo.');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRsvp('confirmed');
  };

  // Nuevo modelo: photos[]. Fallback al modelo antiguo (images[0]).
  const heroEntry = E.photos.find(p => p.role === 'hero');
  const heroImage: string | null = heroEntry?.url ?? E.images[0] ?? null;
  const heroBgPosition = heroEntry?.objectPosition ?? 'center center';

  return (
    <div 
      className={`${cormorant.variable} ${jost.variable} ${montserrat.variable} plus-root`}
      style={{
        '--ivory': backgroundColor,
        '--charcoal': textColor,
        '--gold': accentColor,
        backgroundColor: backgroundColor,
        color: textColor,
      } as React.CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {/* CSS Dinámico para asegurar que los tokens se sobreescriban en cascada */}
      <style>{`
        .plus-root {
          --ivory: ${backgroundColor};
          --charcoal: ${textColor} !important;
          --gold: ${accentColor};
        }
        .btn-rsvp { background-color: ${textColor} !important; color: ${backgroundColor} !important; border-color: ${textColor} !important; }
        .btn-rsvp:hover { background-color: ${accentColor} !important; border-color: ${accentColor} !important; color: #fff !important; }
        .section--tinted, .section--tinted-wide, .note-item, .dest-card, .gift-card, .form-input, .counter-btn, .dietary-btn, .footer {
           background-color: color-mix(in srgb, ${backgroundColor} 94%, ${textColor}) !important;
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundPosition: heroBgPosition } : undefined} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="label gold hero-label">{E.heroLabel}</p>
          <h1 className="hero-names">
            <span>{E.couple.person1}</span>
            <span className="hero-amp">&</span>
            <span>{E.couple.person2}</span>
          </h1>
          <div className="hero-meta">
            <span className="label gold">{E.date.day} · {E.date.month} · {E.date.year}</span>
            <span className="hero-meta-dot" />
            <span className="label muted">{E.location}</span>
          </div>

          {/* Countdown */}
          <div className="countdown">
            {[
              { value: countdown.days, label: 'Días' },
              { value: countdown.hours, label: 'Horas' },
              { value: countdown.minutes, label: 'Min' },
              { value: countdown.seconds, label: 'Seg' },
            ].map(({ value, label }, i) => (
              <React.Fragment key={label}>
                <div className="countdown-unit">
                  <span className="countdown-value">{String(value).padStart(2, '0')}</span>
                  <span className="countdown-label">{label}</span>
                </div>
                {i < 3 && <span className="countdown-sep">:</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span className="label muted" style={{ fontSize: '10px' }}>Desliza</span>
          <div className="scroll-bar"><div className="scroll-thumb" /></div>
        </div>
      </section>

      {renderBlocks('hero')}

      {/* ── CITA ── */}
      {E.sections.quote === true && (
        <section className="section reveal">
          <div className="quote-mark">"</div>
          <p className="quote-text">{E.quote.text}</p>
          <div className="inline-sep">
            <span className="sep-line short" />
            <span className="label muted">{E.quote.reference}</span>
            <span className="sep-line short" />
          </div>
        </section>
      )}

      {renderBlocks('quote')}

      <Ornament />

      {/* ── NOMBRES Y PADRES ── */}
      {E.sections.parents === true && (
        <section className="section">
          <p className="label muted reveal" style={{ marginBottom: '2.5rem' }}>Con la bendición de nuestras familias</p>
          <div className="parents-grid">
            <div className="reveal delay-1 text-center">
              <p className="display-name">{E.fullNames.person1}</p>
              <div className="name-sep"><span className="sep-line short" /></div>
              <p className="label muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                Hija de<br />{E.parents.person1}
              </p>
            </div>
            <div className="parents-divider" />
            <div className="reveal delay-2 text-center">
              <p className="display-name">{E.fullNames.person2}</p>
              <div className="name-sep"><span className="sep-line short" /></div>
              <p className="label muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                Hijo de<br />{E.parents.person2}
              </p>
            </div>
          </div>
        </section>
      )}

      {renderBlocks('parents')}

      <Ornament />

      {/* ── ITINERARIO ── */}
      {E.sections.itinerary === true && (
        <section className="section section--itinerary section--tinted-wide" style={{ maxWidth: '100%', width: '100%' }}>
          <h2 className="section-heading reveal">Programa del Día</h2>
          <div className="dlx-itinerary">
            <div className="dlx-axis" ref={axisRef} />
            {E.itinerary.map((item, i) => {
              const [h, m] = item.time.split(':');
              const manualUrl = (item as { mapsUrl?: string }).mapsUrl?.trim();
              const mapsUrl = manualUrl
                || (item.address ? `https://maps.google.com/?q=${encodeURIComponent(item.address)}` : null);
              return (
                <div key={i} className={`dlx-irow slide-up delay-${i + 1}`}>
                  <div className="dlx-irow-time">
                    <span className="time-h">{h}</span>
                    <span className="time-m">:{m}</span>
                  </div>
                  <div className="dlx-irow-node">
                    <div className="dlx-inode" />
                  </div>
                  <div className="dlx-icard">
                    {item.image && (
                      <div className="dlx-iimg-wrap">
                        <img src={item.image} alt={item.venue} className="dlx-iimg" style={{ objectPosition: (item as { imageObjectPosition?: string }).imageObjectPosition ?? 'center center', transform: `scale(${(item as { imageScale?: number }).imageScale ?? 1})`, transformOrigin: (item as { imageObjectPosition?: string }).imageObjectPosition ?? 'center center' }} />
                      </div>
                    )}
                    <p className="dlx-ivenue">{item.venue}</p>
                    <p className="dlx-iname">{item.name}</p>
                    {item.address && (
                      <>
                        <div className="dlx-iaddress">
                          <PinIcon /><span>{item.address}</span>
                        </div>
                        <div className="dlx-maps-wrap">
                          <a href={mapsUrl || '#'} target="_blank" rel="noopener noreferrer" className="dlx-maps-btn">
                            <MapsIcon /> ¿Cómo llegar?
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {renderBlocks('itinerary')}

      {E.sections.destination === true && <Ornament />}

      {/* ── DESTINO ── */}
      {E.sections.destination === true && (
        <section className="section section--wide">
          <h2 className="section-heading reveal">Boda Destino</h2>
          <p className="label muted reveal" style={{ marginBottom: '3rem' }}>
            Te ayudamos a organizar tu estadía en Cartagena
          </p>

          {/* Hoteles */}
          <p className="label gold reveal" style={{ marginBottom: '1.5rem' }}>Hospedaje</p>
          <div className="destination-grid reveal">
            {E.destination.hotels.map((hotel, i) => (
              <div key={i} className={`dest-card delay-${i + 1}`}>
                <div className="dest-card-icon"><HotelIcon /></div>
                <p className="dest-card-name">{hotel.name}</p>
                <p className="label muted dest-card-category">{hotel.category}</p>
                <div className="dest-card-divider" />
                <div className="dest-card-address">
                  <PinIcon />
                  <span>{hotel.address}</span>
                </div>
                <p className="dest-card-note">{hotel.note}</p>
                <a href={`tel:${hotel.phone}`} className="dest-card-phone">{hotel.phone}</a>
              </div>
            ))}
          </div>

          {/* Transporte */}
          <p className="label gold reveal" style={{ margin: '3.5rem 0 1.5rem' }}>Transporte</p>
          <div className="transport-card reveal">
            <div className="transport-header">
              <CarIcon />
              <p className="dest-card-name" style={{ margin: 0 }}>Transfer aeropuerto → hotel</p>
            </div>
            <p className="transport-info">{E.destination.transport.info}</p>
            <div className="transport-schedule">
              {(E.destination.transport.schedule ?? []).map((s, i) => (
                <div key={i} className="transport-row">
                  <span className="transport-time">{s.time}</span>
                  <span className="transport-detail">{s.detail}</span>
                </div>
              ))}
            </div>
            {E.destination.transport.contact && (
              <div className="transport-contact">
                <EnvelopeIcon />
                <a href={`mailto:${E.destination.transport.contact}`} className="dest-card-phone">
                  {E.destination.transport.contact}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {renderBlocks('destination')}

      {E.sections.dressCode === true && <Ornament />}

      {/* ── DRESS CODE ── */}
      {E.sections.dressCode === true && (
      <section className="section section--tinted">
        <h2 className="section-heading reveal">Dress Code</h2>
        <p className="label gold reveal" style={{ marginBottom: '2rem' }}>{E.dressCode.label}</p>

        <div className="dresscode-gender reveal">
          <div className="dc-gender-block">
            <div className="dc-gender-icon"><WomenIcon /></div>
            <p className="label muted dc-gender-label">Ellas</p>
            <p className="dc-gender-text">{E.dressCode.women}</p>
          </div>
          <div className="dc-gender-divider" />
          <div className="dc-gender-block">
            <div className="dc-gender-icon"><MenIcon /></div>
            <p className="label muted dc-gender-label">Ellos</p>
            <p className="dc-gender-text">{E.dressCode.men}</p>
          </div>
        </div>

        <div className="swatches reveal" style={{ marginTop: '2rem' }}>
          {E.dressCode.swatches.map((s, i) => (
            <div key={i} className="swatch-item">
              <div className="swatch-circle" style={{ backgroundColor: s.color }} />
              <span className="label muted">{s.name}</span>
            </div>
          ))}
        </div>
        {E.dressCode.avoid.length > 0 && (
          <div className="reveal" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p className="label muted" style={{ marginBottom: '1rem' }}>Por favor evita</p>
            <div className="swatches" style={{ justifyContent: 'center' }}>
              {E.dressCode.avoid.map((s, i) => (
                <div key={i} className="swatch-item">
                  <div className="swatch-circle swatch-avoid" style={{ backgroundColor: s.color }} />
                  <span className="label muted">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      )}

      {renderBlocks('dressCode')}

      {E.sections.notes === true && <Ornament />}

      {/* ── INDICACIONES ── */}
      {E.sections.notes === true && E.notes.filter(Boolean).length > 0 && (
        <section className="section">
          <h2 className="section-heading reveal">Toma nota</h2>
          <div className="notes-list">
            {E.notes.filter(Boolean).map((note, i) => (
              <div key={i} className={`note-item reveal delay-${i + 1}`}>
                <span className="note-dot" />
                <p className="note-text">{note}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {renderBlocks('notes')}

      {E.sections.gifts === true && <Ornament />}

      {/* ── REGALOS ── */}
      {E.sections.gifts === true && (() => {
        const gt = (E.gifts as { giftTypes?: string[] }).giftTypes ?? [];
        const showTransfer = gt.includes('transfer') || (!gt.length && !!(E.gifts.bank || E.gifts.holder || E.gifts.account || E.gifts.clabe));
        const showList     = gt.includes('list')     || (!gt.length && !!E.gifts.giftListUrl);
        const showEnvelope = gt.includes('envelope');
        if (!showTransfer && !showList && !showEnvelope) return null;
        return (
          <section className="section">
            <h2 className="section-heading reveal">Mesa de Regalos</h2>
            <p className="label muted reveal" style={{ maxWidth: '360px', lineHeight: '1.9', marginBottom: '2rem' }}>
              Tu presencia es el mejor regalo. Si deseas obsequiarnos algo, aquí encontrarás las opciones disponibles.
            </p>
            <div className="gifts-grid">
              {showTransfer && (E.gifts.bank || E.gifts.holder || E.gifts.account || E.gifts.clabe) && (
                <div className="gift-card reveal">
                  <p className="label" style={{ letterSpacing: '0.18em', marginBottom: '1rem', color: '#9B8B78' }}>
                    Transferencia
                  </p>
                  {[
                    { label: 'Banco',   value: E.gifts.bank },
                    { label: 'Nombre',  value: E.gifts.holder },
                    { label: 'Cuenta',  value: E.gifts.account },
                    { label: 'CLABE',   value: E.gifts.clabe },
                  ].filter(({ value }) => value).map(({ label, value }) => (
                    <div key={label} className="gift-row">
                      <span className="gift-label">{label}</span>
                      <span className="gift-value">{value}</span>
                    </div>
                  ))}
                </div>
              )}
              {showList && E.gifts.giftListUrl && (
                <div className="gift-card gift-card--list reveal delay-1">
                  <GiftIcon />
                  <p className="label" style={{ letterSpacing: '0.18em', margin: '1rem 0 0.4rem', color: '#9B8B78' }}>
                    Mesa de Regalos
                  </p>
                  {E.gifts.giftListLabel && (
                    <p className="gift-value" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                      {E.gifts.giftListLabel}
                    </p>
                  )}
                  <a href={E.gifts.giftListUrl} target="_blank" rel="noopener noreferrer" className="btn-outline btn-outline--sm">
                    Ver mesa →
                  </a>
                </div>
              )}
              {showEnvelope && (
                <div className="gift-card gift-card--envelope reveal delay-2">
                  <EnvelopeSmallIcon />
                  <p className="label" style={{ letterSpacing: '0.18em', margin: '1rem 0 0.4rem', color: '#9B8B78' }}>Sobre de Regalo</p>
                  <p className="gift-envelope-note">
                    {(E.gifts as { envelopeMessage?: string }).envelopeMessage || 'Con gusto recibimos sobres el día del evento'}
                  </p>
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {renderBlocks('gifts')}

      {E.noChildren && <Ornament />}

      {/* ── NO NIÑOS ── */}
      {E.noChildren && (
        <section className="section">
          <div className="no-children-block reveal">
            <NoChildrenIcon />
            <div>
              <p className="no-children-title">Evento solo para adultos</p>
              <p className="no-children-desc">
                {E.noChildrenMessage || 'Con todo nuestro cariño, les pedimos que esta celebración sea exclusiva para adultos. Agradecemos su comprensión.'}
              </p>
            </div>
          </div>
        </section>
      )}

      {renderBlocks('noChildren')}

      <Ornament />

      {/* ── RSVP ── */}
      <section className="section">
        <h2 className="section-heading reveal">¿Nos acompañas?</h2>
        {E.rsvp.deadline && (
          <p className="label muted reveal" style={{ marginBottom: '2.5rem' }}>
            Confirma tu asistencia antes del{' '}
            <strong style={{ color: '#1C1611' }}>{E.rsvp.deadline}</strong>
          </p>
        )}
        <button className="btn-rsvp reveal" onClick={() => setModalOpen(true)}>
          Confirmar asistencia
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <p className="footer-names">{E.couple.person1} &amp; {E.couple.person2}</p>
        <p className="label muted" style={{ marginTop: '0.5rem' }}>
          {E.date.day} · {E.date.month} · {E.date.year} · {E.location}
        </p>
        <p className="footer-powered">
          powered by <span className="footer-brand">moments</span>
        </p>
      </footer>

      {/* ── MODAL RSVP ── */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal">
            <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Cerrar">×</button>

            {rsvpSent ? (
              <div className="modal-success">
                <div className="modal-success-icon">{rsvpStatus === 'declined' ? '✕' : '✓'}</div>
                <h3 className="modal-title">
                  {rsvpStatus === 'declined' ? 'Gracias por avisarnos' : '¡Nos vemos pronto!'}
                </h3>
                <p className="label muted" style={{ textAlign: 'center', lineHeight: '1.8' }}>
                  {rsvpStatus === 'declined'
                    ? 'Lamentamos que no puedas acompañarnos. Tu respuesta fue registrada.'
                    : 'Tu confirmación fue recibida. Estamos emocionados de celebrar contigo.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="modal-form">
                <div className="modal-header">
                  <p className="label gold" style={{ marginBottom: '0.5rem' }}>Confirmación</p>
                  <h3 className="modal-title">{E.couple.person1} &amp; {E.couple.person2}</h3>
                  <p className="label muted">{E.date.day} · {E.date.month} · {E.date.year}</p>
                </div>

                {/* Nombre */}
                <div className="form-field">
                  <label className="form-label">Tu nombre completo</label>
                  <input
                    className="form-input"
                    type="text"
                    required
                    placeholder="Ej. Juan García"
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    readOnly={!!guestName || !!guestToken}
                    style={(guestName || guestToken) ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}
                  />
                </div>

                {/* Acompañantes */}
                {effectiveMaxCompanions > 0 && (
                  <div className="form-field">
                    <label className="form-label">
                      Acompañantes
                      <span className="form-label-hint"> (máx. {effectiveMaxCompanions})</span>
                    </label>
                    <div className="counter">
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => handleCompanionCountChange(companionInputs.length - 1)}
                        disabled={companionInputs.length === 0}
                      >−</button>
                      <span className="counter-value">{companionInputs.length}</span>
                      <button
                        type="button"
                        className="counter-btn"
                        onClick={() => handleCompanionCountChange(companionInputs.length + 1)}
                        disabled={companionInputs.length === effectiveMaxCompanions}
                      >+</button>
                    </div>

                    {companionInputs.length > 0 && (
                      <div className="companions-list">
                        {companionInputs.map((name, i) => (
                          <div key={i} className="companion-field">
                            <span className="companion-num">{i + 1}</span>
                            <input
                              className="form-input companion-input"
                              type="text"
                              placeholder={`Nombre del acompañante ${i + 1}`}
                              value={name}
                              onChange={(e) => handleCompanionName(i, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Restricción alimentaria por Persona */}
                {(E.rsvp.dietaryOptions?.length ?? 0) > 0 && (() => {
                  const allNames = [rsvpName || 'Tú', ...companionInputs.filter(n => n.trim() !== '')];
                  return (
                    <div className="dlx-dietary-wrap" style={{ marginTop: '1.5rem' }}>
                      <p className="label gold" style={{ marginBottom: '1rem' }}>Restricción alimentaria</p>
                      {allNames.map(person => (
                        <div key={person} style={{ marginBottom: '1rem' }}>
                          <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--charcoal)', marginBottom: '0.5rem', textAlign: 'left' }}>
                            {person}
                          </p>
                          <div className="dietary-details-container">
                            <details className="dietary-details">
                              <summary className="dietary-summary">
                                <span style={{ 
                                  whiteSpace: 'nowrap', 
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis',
                                  maxWidth: '200px'
                                }}>
                                  {dietaryMap[person]?.length ? dietaryMap[person].join(', ') : 'Seleccionar restricciones'}
                                </span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                              </summary>
                              <div className="dietary-options">
                                {E.rsvp.dietaryOptions!.map((opt) => {
                                  const isSelected = dietaryMap[person]?.includes(opt);
                                  return (
                                    <label key={opt} className="dietary-option-label">
                                      <input 
                                        type="checkbox" 
                                        className="dietary-checkbox"
                                        checked={isSelected || false}
                                        onChange={(e) => {
                                          setDietaryMap(prev => {
                                            const current = prev[person] || [];
                                            const updated = e.target.checked 
                                              ? [...current, opt]
                                              : current.filter(x => x !== opt);
                                            return { ...prev, [person]: updated };
                                          });
                                        }}
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </details>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {rsvpError && (
                  <p className="label muted" style={{ color: '#c0392b', textAlign: 'center', marginBottom: '0.5rem' }}>
                    {rsvpError}
                  </p>
                )}

                <button type="submit" className="btn-submit" disabled={!rsvpName.trim() || rsvpLoading}>
                  {rsvpLoading ? 'Enviando…' : (hasExistingRsvp ? 'Actualizar mi respuesta' : 'Confirmar mi asistencia')}
                </button>

                <button
                  type="button"
                  className="btn-decline"
                  onClick={() => submitRsvp('declined')}
                  disabled={rsvpLoading}
                >
                  No podré asistir
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Ornament() {
  return (
    <div className="ornament">
      <span className="sep-line" />
      <svg width="12" height="12" viewBox="0 0 12 12">
        <rect x="6" y="0" width="6" height="6" transform="rotate(45 6 0)" fill="#B8965A" opacity="0.7" />
      </svg>
      <span className="sep-line" />
    </div>
  );
}

function MapsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6z" fill="currentColor" opacity="0.9" />
      <circle cx="12" cy="8" r="2.5" fill="white" />
    </svg>
  );
}

function WomenIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L9 7v3l-6 11h18l-6-11V7l-3-5z" />
      <path d="M9 10h6" />
    </svg>
  );
}
function MenIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2h16v20H4V2z" />
      <path d="M4 2l8 10 8-10" />
      <path d="M12 12v10" />
      <path d="M11 5l1 1 1-1-1-1-1 1z" />
    </svg>
  );
}

function NoChildrenIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="24" cy="24" r="22" stroke="#B8965A" strokeWidth="1.4" />
      <circle cx="24" cy="16" r="5" stroke="#B8965A" strokeWidth="1.4" />
      <path d="M13 36c0-6.075 4.925-11 11-11s11 4.925 11 11" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="8" x2="40" y2="40" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
      <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6z" stroke="#B8965A" strokeWidth="1.6" />
      <circle cx="12" cy="8" r="2" stroke="#B8965A" strokeWidth="1.6" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d={direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HotelIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="1.5" stroke="#B8965A" strokeWidth="1.3" />
      <path d="M7 21V7" stroke="#B8965A" strokeWidth="1.3" />
      <rect x="10" y="11" width="3" height="3" rx="0.5" stroke="#B8965A" strokeWidth="1.1" />
      <rect x="15" y="11" width="3" height="3" rx="0.5" stroke="#B8965A" strokeWidth="1.1" />
      <rect x="10" y="16" width="3" height="5" rx="0.5" stroke="#B8965A" strokeWidth="1.1" />
      <path d="M5 7V4a1 1 0 011-1h11a1 1 0 011 1v3" stroke="#B8965A" strokeWidth="1.3" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M5 11l1.5-4.5h11L19 11" stroke="#B8965A" strokeWidth="1.3" strokeLinecap="round" />
      <rect x="2" y="11" width="20" height="7" rx="2" stroke="#B8965A" strokeWidth="1.3" />
      <circle cx="7" cy="18" r="2" stroke="#B8965A" strokeWidth="1.3" />
      <circle cx="17" cy="18" r="2" stroke="#B8965A" strokeWidth="1.3" />
      <path d="M2 14h20" stroke="#B8965A" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect x="3" y="9" width="38" height="26" rx="2.5" stroke="#B8965A" strokeWidth="1.4" />
      <path d="M3 13l19 13 19-13" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function EnvelopeSmallIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 44 44" fill="none">
      <rect x="3" y="9" width="38" height="26" rx="2.5" stroke="#B8965A" strokeWidth="1.4" />
      <path d="M3 13l19 13 19-13" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="17" width="30" height="18" rx="2" stroke="#B8965A" strokeWidth="1.4" />
      <rect x="10" y="11" width="20" height="7" rx="1.5" stroke="#B8965A" strokeWidth="1.4" />
      <path d="M20 11v24" stroke="#B8965A" strokeWidth="1.4" />
      <path d="M20 11c0 0-4-6 0-6s4 6 0 6" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M20 11c0 0 4-6 0-6" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const css = `
  :root {
    --ivory:    #F8F3EC;
    --charcoal: #1C1611;
    --gold:     #B8965A;
    --taupe:    #8B7355;
    --muted:    #E6DDD2;
    --muted-fg: #9B8B78;
  }

  .plus-root { background-color: var(--ivory); color: var(--charcoal); }

  .label {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 400;
  }
  .gold   { color: var(--gold); }
  .muted  { color: var(--muted-fg); }
  .text-center { text-align: center; }

  .sep-line {
    display: block;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    flex: 1;
  }
  .sep-line.short { max-width: 48px; }

  .reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1);
  }
  .reveal.is-visible { opacity: 1; transform: translateY(0); }
  .delay-1 { transition-delay: 0.1s; }
  .delay-2 { transition-delay: 0.2s; }
  .delay-3 { transition-delay: 0.3s; }

  /* ── Hero ── */
  .hero {
    position: relative;
    min-height: 100svh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    overflow: hidden;
    color: #fff;
  }
  .hero-bg {
    position: absolute;
    inset: 0;
    background-color: #14100c;
    background-size: cover;
    background-position: center;
    z-index: 0;
    transform: scale(1.04);
    animation: heroZoom 12s ease-in-out infinite alternate;
  }
  @keyframes heroZoom {
    from { transform: scale(1.04); }
    to   { transform: scale(1.08); }
  }
  .hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(20,14,10,0.45) 0%, rgba(20,14,10,0.25) 40%, rgba(20,14,10,0.65) 100%);
    z-index: 1;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: var(--gold);
    z-index: 3;
  }
  .hero::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    z-index: 3;
  }
  .hero-content {
    position: relative;
    z-index: 2;
    padding: 2rem 2rem 9rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    animation: heroFadeIn 1.2s cubic-bezier(0.16,1,0.3,1) both;
  }
  .hero-label { margin: 0; }
  .hero-names {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(56px, 12vw, 130px);
    font-weight: 300;
    font-style: italic;
    letter-spacing: -0.02em;
    line-height: 1;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    animation: heroFadeIn 1.2s cubic-bezier(0.16,1,0.3,1) 0.15s both;
  }
  .hero-amp {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 0.8em;
    height: 0.8em;
    border: 1px solid var(--gold);
    border-radius: 50%;
    font-size: 0.4em;
    font-family: var(--font-playfair), serif;
    font-style: italic;
    font-weight: 300;
    color: var(--gold);
    margin: 0 0.5rem;
    opacity: 0.7;
    line-height: 1;
  }
  .hero-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    animation: heroFadeIn 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s both;
  }
  .hero-meta-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--gold);
    opacity: 0.6;
    flex-shrink: 0;
  }
  .hero-scroll-indicator {
    position: absolute;
    bottom: 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    z-index: 2;
    animation: heroFadeIn 1s ease 1.4s both;
  }
  .scroll-bar { width: 1px; height: 48px; background: rgba(255,255,255,0.15); overflow: hidden; border-radius: 1px; }
  .scroll-thumb { width: 100%; height: 50%; background: rgba(255,255,255,0.5); animation: scrollDown 1.6s ease-in-out infinite; }

  /* Countdown */
  .countdown {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: heroFadeIn 1.2s cubic-bezier(0.16,1,0.3,1) 0.6s both;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(184,150,90,0.3);
    border-radius: 14px;
    padding: 1rem 1.5rem;
    backdrop-filter: blur(8px);
  }
  .countdown-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .countdown-value {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(2rem, 5vw, 2.75rem);
    font-weight: 300;
    color: #fff;
    line-height: 1;
    min-width: 2.5ch;
    text-align: center;
  }
  .countdown-label {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.45);
    margin-top: 0.3rem;
  }
  .countdown-sep {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 2rem;
    color: var(--gold);
    opacity: 0.5;
    margin: 0 0.1rem;
    padding-bottom: 1.25rem;
    align-self: flex-end;
  }

  @keyframes heroFadeIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scrollDown {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(200%); }
  }

  /* ── Sections ── */
  .section {
    max-width: 680px;
    margin: 0 auto;
    padding: 5rem 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .section--wide { max-width: 900px; }
  .section-heading {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(2.25rem, 5.5vw, 3.5rem);
    font-weight: 300;
    font-style: italic;
    margin: 0 0 1rem;
    color: var(--charcoal);
  }

  /* ── Ornament ── */
  .ornament {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0 3rem;
    max-width: 480px;
    margin: 0 auto;
  }

  /* ── Quote ── */
  .quote-mark {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 5rem;
    line-height: 1;
    color: var(--gold);
    opacity: 0.35;
    margin-bottom: 0.5rem;
  }
  .quote-text {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(1.3rem, 3vw, 1.75rem);
    font-style: italic;
    font-weight: 300;
    line-height: 1.6;
    color: var(--charcoal);
    margin: 0 0 1.5rem;
  }
  .inline-sep { display: flex; align-items: center; gap: 1rem; }

  /* ── Parents ── */
  .parents-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 2rem;
    width: 100%;
    align-items: start;
  }
  @media (max-width: 600px) {
    .parents-grid { grid-template-columns: 1fr; }
    .parents-divider { display: none; }
  }
  .parents-divider { width: 1px; background: var(--muted); align-self: stretch; }
  .display-name {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.25rem;
    font-weight: 400;
    color: var(--charcoal);
    margin: 0;
  }
  .name-sep { display: flex; justify-content: center; margin: 0.75rem 0; }

  /* ── Carousel ── */
  .carousel {
    position: relative;
    width: 100%;
    overflow: hidden;
    height: 560px;
    background: var(--charcoal);
  }
  @media (max-width: 600px) { .carousel { height: 360px; } }
  .carousel-track {
    display: flex;
    height: 100%;
    transition: transform 0.6s cubic-bezier(0.77,0,0.175,1);
  }
  .carousel-slide {
    min-width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .carousel-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  .carousel-slide:hover .carousel-img { transform: scale(1.03); }
  .carousel-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(248,243,236,0.12);
    border: 1px solid rgba(184,150,90,0.4);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    backdrop-filter: blur(4px);
    z-index: 2;
  }
  .carousel-btn:hover { background: rgba(184,150,90,0.25); border-color: var(--gold); }
  .carousel-btn--prev { left: 1.25rem; }
  .carousel-btn--next { right: 1.25rem; }
  .carousel-dots {
    position: absolute;
    bottom: 1.25rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    z-index: 2;
  }
  .carousel-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.35);
    border: none;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    padding: 0;
  }
  .carousel-dot--active { background: var(--gold); transform: scale(1.4); }
  .carousel-counter {
    position: absolute;
    bottom: 1.25rem;
    right: 1.5rem;
    z-index: 2;
  }

  /* ── Bloques de imagen del layout ── */

  /* Full width */
  .photo-block {
    width: 100%;
    overflow: hidden;
    max-height: 600px;
    background: var(--charcoal);
  }
  .photo-block {
    width: 100%;
    aspect-ratio: 21 / 9;
    overflow: hidden;
    background: var(--ivory);
  }
  .photo-block-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  .photo-block:hover .photo-block-img { transform: scale(1.02); }
  @media (max-width: 600px) { .photo-block { aspect-ratio: 4 / 3; } }

  /* Duo — dos imágenes lado a lado */
  .duo-block {
    display: flex;
    width: 100%;
    aspect-ratio: 2 / 1;
    gap: 3px;
    background: var(--ivory);
    overflow: hidden;
  }
  .duo-block-item {
    flex: 1;
    overflow: hidden;
  }
  .duo-block-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  .duo-block-item:hover .duo-block-img { transform: scale(1.03); }
  @media (max-width: 600px) {
    .duo-block { flex-direction: column; aspect-ratio: auto; gap: 2px; }
    .duo-block-item { aspect-ratio: 4 / 3; }
  }

  /* Trio — tres imágenes estilo retrato */
  .trio-block {
    display: flex;
    width: 100%;
    aspect-ratio: 12 / 5; /* 3 x (4/5) ratio approximately */
    gap: 4px;
    background: var(--ivory);
    overflow: hidden;
  }
  .trio-block-item {
    flex: 1;
    aspect-ratio: 4 / 5;
    overflow: hidden;
  }
  .trio-block-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  .trio-block-item:hover .trio-block-img { transform: scale(1.04); }
  @media (max-width: 600px) {
    .trio-block { flex-direction: column; aspect-ratio: auto; gap: 3px; }
    .trio-block-item { aspect-ratio: 4 / 3; }
  }

  /* ── Slide animations ── */
  .slide-left {
    opacity: 0;
    transform: translateX(-40px);
    transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
  }
  .slide-right {
    opacity: 0;
    transform: translateX(40px);
    transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
  }
  .slide-left.is-visible,
  .slide-right.is-visible { opacity: 1; transform: translateX(0); }
  .slide-up {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
  }
  .slide-up.is-visible { opacity: 1; transform: translateY(0); }

  /* ── Itinerary (Modern Editorial) ── */
  .section--itinerary { max-width: 760px; }

  .dlx-itinerary {
    position: relative;
    width: 100%;
    max-width: 580px;
    margin: 3rem auto 0;
    position: relative;
  }
  .dlx-axis {
    position: absolute;
    left: 165px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: color-mix(in srgb, var(--gold) 20%, transparent);
    z-index: 1;
  }
  .dlx-axis::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 0;
    background: var(--gold);
    transition: height 2s cubic-bezier(0.16,1,0.3,1);
  }
  .dlx-axis.axis-grow::before { height: 100%; }
  
  .dlx-irow {
    display: grid;
    grid-template-columns: 140px 50px 1fr;
    gap: 0;
    align-items: start;
    margin-bottom: 3.5rem;
    position: relative;
    z-index: 2;
  }
  .dlx-irow-time { 
    text-align: right; 
    padding-top: 0.8rem; 
    padding-right: 0.8rem; 
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1;
  }
  
  /* Media query will handle single line if needed, but for editorial look, 
     let's try to put them side-by-side now as requested. */
  .dlx-irow-time {
    display: block;
    white-space: nowrap;
  }

  .time-h { 
    font-family: var(--font-cormorant), Georgia, serif; 
    font-size: 2.2rem; 
    font-weight: 300; 
    color: var(--gold); 
    display: inline;
  }
  .time-m { 
    font-family: var(--font-cormorant), Georgia, serif; 
    font-size: 1.2rem; 
    font-weight: 300; 
    color: var(--gold); 
    opacity: 0.8;
    display: inline;
    margin-left: 1px;
  }
  
  .dlx-irow-node { display: flex; flex-direction: column; align-items: center; padding-top: 1.25rem; }
  .dlx-inode {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--ivory);
    border: 1px solid var(--gold);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--gold) 15%, transparent);
    flex-shrink: 0;
    z-index: 2;
  }

  .dlx-icard {
    background: #fff;
    border: 1px solid color-mix(in srgb, var(--gold) 10%, var(--ivory));
    border-radius: 12px;
    padding: 1.25rem;
    transition: transform 0.4s ease, box-shadow 0.4s ease;
    text-align: left;
    box-shadow: 0 8px 30px rgba(28,22,17,0.03);
  }
  .dlx-irow:hover .dlx-icard {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(28,22,17,0.06);
  }

  .dlx-iimg-wrap {
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 1.25rem;
    background: var(--ivory);
  }
  .dlx-iimg { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s ease; display: block; }
  .dlx-irow:hover .dlx-iimg { transform: scale(1.04); }

  .dlx-iname { 
    font-family: var(--font-cormorant), Georgia, serif; 
    font-size: 1.6rem; 
    font-style: italic;
    font-weight: 400; 
    color: var(--charcoal); 
    margin: 0 0 0.5rem; 
    line-height: 1.2;
  }
  .dlx-ivenue { 
    font-family: var(--font-jost), system-ui, sans-serif; 
    font-size: 11px; 
    font-weight: 600; 
    color: var(--gold); 
    margin: 0 0 0.75rem; 
    letter-spacing: 0.12em; 
    text-transform: uppercase;
  }
  .dlx-iaddress {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
  .dlx-iaddress span { 
    font-family: var(--font-jost), system-ui, sans-serif; 
    font-size: 12px; 
    color: var(--muted-fg); 
    line-height: 1.6; 
  }
  .dlx-maps-wrap { display: flex; justify-content: flex-start; }
  .dlx-maps-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.25rem;
    border-radius: 100px;
    background: var(--charcoal);
    color: var(--ivory) !important;
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    text-decoration: none;
    transition: all 0.3s ease;
  }
  .dlx-maps-btn:hover { 
    background: var(--gold); 
    transform: translateX(4px);
  }

  @media (max-width: 480px) {
    .dlx-itinerary { padding-left: 1.5rem; }
    .dlx-irow { grid-template-columns: 60px 30px 1fr; }
    .time-h { font-size: 1.8rem; }
    .dlx-icard { padding: 1rem; }
    .dlx-iname { font-size: 1.35rem; }
  }

  /* ── Destination ── */
  .destination-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    width: 100%;
  }
  @media (max-width: 768px) { .destination-grid { grid-template-columns: 1fr; } }
  @media (min-width: 769px) and (max-width: 900px) { .destination-grid { grid-template-columns: 1fr 1fr; } }
  .dest-card {
    background: #F0E9DF;
    border: 1px solid var(--muted);
    border-radius: 14px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    text-align: left;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }
  .dest-card:hover { box-shadow: 0 8px 24px rgba(28,22,17,0.1); transform: translateY(-3px); }
  .dest-card-icon { margin-bottom: 0.5rem; }
  .dest-card-name {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.15rem;
    font-weight: 400;
    color: var(--charcoal);
    margin: 0;
  }
  .dest-card-category { margin: 0; }
  .dest-card-divider { height: 1px; background: var(--muted); margin: 0.75rem 0; }
  .dest-card-address {
    display: flex;
    align-items: flex-start;
    gap: 0.35rem;
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    color: var(--muted-fg);
    line-height: 1.5;
  }
  .dest-card-note {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    color: var(--gold);
    margin: 0.25rem 0 0;
  }
  .dest-card-phone {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: var(--charcoal);
    text-decoration: none;
    margin-top: 0.25rem;
    transition: color 0.2s;
  }
  .dest-card-phone:hover { color: var(--gold); }
  .transport-card {
    width: 100%;
    background: #F0E9DF;
    border: 1px solid var(--muted);
    border-radius: 14px;
    padding: 1.75rem;
    text-align: left;
  }
  .transport-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
  .transport-info {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 13px;
    color: var(--muted-fg);
    line-height: 1.7;
    margin: 0 0 1.25rem;
  }
  .transport-schedule { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
  .transport-row {
    display: flex;
    gap: 1rem;
    align-items: baseline;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--muted);
  }
  .transport-row:last-child { border-bottom: none; }
  .transport-time {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.1rem;
    color: var(--gold);
    flex-shrink: 0;
    min-width: 120px;
  }
  .transport-detail {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px;
    color: var(--charcoal);
  }
  .transport-contact { display: flex; align-items: center; gap: 0.75rem; }

  /* ── Section tinted ── */
  .section--tinted {
    background: #EDE5DA;
    width: 100%;
    max-width: 100%;
    padding-left: max(2rem, calc((100vw - 680px) / 2));
    padding-right: max(2rem, calc((100vw - 680px) / 2));
  }
  .section--tinted-wide {
    background: #EDE5DA;
    width: 100%;
    max-width: 100%;
    padding-left: max(2rem, calc((100vw - 900px) / 2));
    padding-right: max(2rem, calc((100vw - 900px) / 2));
  }

  /* ── Ornament ── */
  .ornament {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1rem 3rem;
    max-width: 480px;
    margin: 0 auto;
  }

  /* ── Dress code gender ── */
  .dresscode-gender {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1.5rem;
    width: 100%;
    max-width: 520px;
    align-items: start;
    text-align: left;
  }
  @media (max-width: 560px) {
    .dresscode-gender { grid-template-columns: 1fr; }
    .dc-gender-divider { display: none; }
  }
  .dc-gender-block { display: flex; flex-direction: column; align-items: flex-start; }
  .dc-gender-icon { margin-bottom: 0.5rem; }
  .dc-gender-label { margin-bottom: 0.4rem !important; }
  .dc-gender-divider { width: 1px; background: var(--muted); align-self: stretch; }
  .dc-gender-text { font-family: var(--font-jost), system-ui, sans-serif; font-size: 13px; color: var(--muted-fg); line-height: 1.8; margin: 0; }

  /* ── No children ── */
  .no-children-block { display: flex; align-items: flex-start; gap: 1.25rem; background: #F0E9DF; border: 1px solid var(--muted); border-left: 3px solid var(--gold); border-radius: 12px; padding: 1.5rem 1.75rem; max-width: 480px; text-align: left; }
  .no-children-title { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.15rem; font-weight: 400; color: var(--charcoal); margin: 0 0 0.4rem; }
  .no-children-desc { font-family: var(--font-jost), system-ui, sans-serif; font-size: 13px; color: var(--muted-fg); line-height: 1.8; margin: 0; }

  /* ── Notes ── */
  .notes-list { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; max-width: 480px; text-align: left; }
  .note-item { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.875rem 1.25rem; background: #F0E9DF; border: 1px solid var(--muted); border-radius: 10px; }
  .note-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); flex-shrink: 0; margin-top: 5px; }
  .note-text { font-family: var(--font-jost), system-ui, sans-serif; font-size: 13px; color: var(--charcoal); line-height: 1.7; margin: 0; }

  /* ── Swatches ── */
  .swatches { display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center; }
  .swatch-item { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  .swatch-item:hover { transform: translateY(-8px); }
  .swatch-circle { width: 52px; height: 52px; border-radius: 50%; border: 1px solid var(--muted); }
  .swatch-avoid { border-color: #d4a5a5; opacity: 0.7; }

  /* ── Gifts ── */
  .gifts-grid {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    width: 100%;
    max-width: 420px;
  }
  .gift-card {
    width: 100%;
    background: color-mix(in srgb, var(--ivory) 94%, var(--gold));
    border: 1px solid var(--muted);
    border-radius: 14px;
    padding: 1.25rem 1.5rem;
    text-align: left;
    box-sizing: border-box;
  }
  .gift-card--list {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 1.5rem 1rem;
  }
  .gift-card--envelope {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; padding: 1.5rem 1rem; gap: 0;
  }
  .gift-envelope-note {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px;
    color: var(--muted-fg);
    line-height: 1.6;
    max-width: 140px;
    text-align: center;
  }
  .gift-row { display: flex; justify-content: space-between; align-items: baseline; gap: 0.75rem; padding: 0.45rem 0; border-bottom: 1px solid var(--muted); }
  .gift-row:last-child { border-bottom: none; }
  .gift-label { font-family: var(--font-jost), system-ui, sans-serif; font-size: 11px; color: var(--muted-fg); flex-shrink: 0; }
  .gift-value { font-family: var(--font-jost), system-ui, sans-serif; font-size: 12px; font-weight: 500; color: var(--charcoal); text-align: right; }

  /* ── Buttons ── */
  .btn-outline {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 2.25rem;
    border-radius: 100px;
    border: 1px solid var(--gold);
    color: var(--gold);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-decoration: none;
    transition: background 0.2s, color 0.2s;
    cursor: pointer;
    background: transparent;
  }
  .btn-outline:hover { background: var(--gold); color: #fff; }
  .btn-outline--sm { padding: 0.625rem 1.5rem; font-size: 10px; }

  .btn-rsvp {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.1rem 3rem;
    border-radius: 100px;
    background: var(--charcoal);
    color: var(--ivory);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    border: 1px solid var(--charcoal);
    cursor: pointer;
    transition: background 0.25s, color 0.25s, transform 0.2s, box-shadow 0.2s;
  }
  .btn-rsvp:hover {
    background: var(--gold);
    border-color: var(--gold);
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(184,150,90,0.35);
  }

  /* ── Footer ── */
  .footer { text-align: center; padding: 3rem 2rem; border-top: 1px solid var(--muted); background: #F0E9DF; }
  .footer-names { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.5rem; font-style: italic; font-weight: 300; color: var(--charcoal); margin: 0; }
  .footer-powered { font-family: var(--font-jost), sans-serif; font-size: 9px; letter-spacing: 0.2em; text-transform: none; color: var(--charcoal); opacity: 0.4; margin-top: 2rem; }
  .footer-brand { font-family: var(--font-montserrat), 'Montserrat', sans-serif; font-weight: 500; letter-spacing: 0.05em; opacity: 1; }

  /* ── Modal ── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(28,22,17,0.65);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.25s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: var(--ivory);
    border-radius: 20px;
    width: 100%;
    max-width: 460px;
    max-height: 90svh;
    overflow-y: auto;
    position: relative;
    animation: slideUp 0.35s cubic-bezier(0.16,1,0.3,1);
    border: 1px solid var(--muted);
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--muted);
    background: transparent;
    color: var(--muted-fg);
    font-size: 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    line-height: 1;
  }
  .modal-close:hover { background: var(--muted); }
  .modal-form { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
  .modal-header { text-align: center; padding-bottom: 0.5rem; border-bottom: 1px solid var(--muted); }
  .modal-title {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.75rem;
    font-style: italic;
    font-weight: 300;
    color: var(--charcoal);
    margin: 0.25rem 0;
  }
  .modal-success { padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  .modal-success-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #EDE5D8;
    border: 1px solid var(--gold);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: var(--gold);
  }

  /* Form */
  .form-field { display: flex; flex-direction: column; gap: 0.5rem; }
  .form-label {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted-fg);
  }
  .form-label-hint { text-transform: none; letter-spacing: 0; font-size: 11px; color: var(--gold); }
  .form-input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 1px solid var(--muted);
    border-radius: 10px;
    background: #F0E9DF;
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 14px;
    color: var(--charcoal);
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }
  .form-input:focus { border-color: var(--gold); }
  .form-input::placeholder { color: var(--muted-fg); }

  /* Counter */
  .counter { display: flex; align-items: center; gap: 1rem; }
  .counter-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid var(--muted);
    background: #F0E9DF;
    color: var(--charcoal);
    font-size: 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s, background 0.2s;
    line-height: 1;
  }
  .counter-btn:hover:not(:disabled) { border-color: var(--gold); background: var(--muted); }
  .counter-btn:disabled { opacity: 0.35; cursor: not-allowed; }

  .companions-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.75rem;
    animation: fadeIn 0.25s ease;
  }
  .companion-field {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }
  .companion-num {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--muted);
    border: 1px solid var(--gold);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 10px;
    color: var(--gold);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .companion-input { margin: 0; }
  .counter-value {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 2rem;
    font-weight: 300;
    color: var(--charcoal);
    min-width: 2ch;
    text-align: center;
  }

  /* Dietary */
  .dietary-details-container { margin-top: 0.5rem; }
  .dietary-details { position: relative; width: 100%; text-align: left; margin-bottom: 0.5rem; }
  .dietary-summary {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.7rem 1rem; border: 1px solid var(--muted); border-radius: 8px;
    background: rgba(255,255,255,0.5); color: var(--charcoal); font-family: var(--font-jost), system-ui, sans-serif; font-size: 13px;
    cursor: pointer; list-style: none; transition: border-color 0.2s;
  }
  .dietary-summary:hover { border-color: var(--gold); }
  .dietary-summary::-webkit-details-marker { display: none; }
  .dietary-options {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0;
    background: var(--ivory); border: 1px solid var(--muted); border-radius: 8px;
    padding: 0.5rem; z-index: 10; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px;
  }
  .dietary-option-label {
    display: flex; align-items: center; gap: 10px; padding: 8px;
    cursor: pointer; font-family: var(--font-jost), system-ui, sans-serif; font-size: 13px; color: var(--charcoal);
    border-radius: 6px; transition: background 0.2s;
  }
  .dietary-option-label:hover { background: rgba(0,0,0,0.03); }
  .dietary-checkbox { accent-color: var(--gold); width: 14px; height: 14px; }

  /* Submit */
  .btn-submit {
    width: 100%;
    padding: 1rem;
    border-radius: 100px;
    background: var(--charcoal);
    color: var(--ivory);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    margin-top: 0.5rem;
  }
  .btn-submit:hover:not(:disabled) { background: var(--gold); transform: translateY(-1px); }
  .btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-decline {
    width: 100%;
    padding: 0.75rem;
    background: transparent;
    border: none;
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted-fg);
    cursor: pointer;
    margin-top: 0.25rem;
    transition: color 0.2s;
  }
  .btn-decline:hover:not(:disabled) { color: var(--charcoal); }
  .btn-decline:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── Mobile centering ── */
  @media (max-width: 768px) {
    .section { padding: 3rem 1.5rem; }
    .section--wide { padding-left: 1.5rem; padding-right: 1.5rem; }
    .destination-grid { grid-template-columns: 1fr; }
    .duo-block { flex-direction: column; aspect-ratio: auto; gap: 2px; }
    .duo-block-item { aspect-ratio: 4 / 3; }
    .trio-block { flex-direction: column; aspect-ratio: auto; gap: 3px; }
    .trio-block-item { aspect-ratio: 4 / 3; }
  }
  @media (max-width: 480px) {
    .hero-meta { flex-direction: column; gap: 0.4rem; }
    .hero-meta-dot { display: none; }
    .section { padding: 3rem 1.25rem; }
    .dresscode-gender { grid-template-columns: 1fr; }
    .dc-gender-divider { width: 80%; height: 1px; margin: 0.5rem auto; }
    .dlx-itinerary { padding-left: 1.25rem; }
    .dlx-irow { grid-template-columns: 50px 16px 1fr; }
  }
`;
