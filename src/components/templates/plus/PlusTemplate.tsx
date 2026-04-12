'use client';

import { Cormorant_Garamond, Jost } from 'next/font/google';
import React, { useEffect, useState, useRef } from 'react';
import type { ImageBlock } from '@/lib/imageLayout';

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
  };
  theme?: {
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  imageLayout?: ImageBlock[];
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
function DuoBlock({ src1, src2 }: { src1: string; src2: string }) {
  return (
    <div className="duo-block">
      <div className="duo-block-item">
        <img src={src1} alt="" className="duo-block-img" />
      </div>
      <div className="duo-block-item">
        <img src={src2} alt="" className="duo-block-img" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CarouselBlock — carrusel inline para bloques de imageLayout
// ---------------------------------------------------------------------------
function CarouselBlock({ srcs }: { srcs: string[] }) {
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
            <img src={src} alt={`Foto ${i + 1}`} className="carousel-img" />
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
  };

  const accentColor      = E.theme.accentColor      ?? '#B8965A';
  const backgroundColor  = E.theme.backgroundColor  ?? '#F8F3EC';
  const textColor        = E.theme.textColor        ?? '#1C1611';

  // Si hay token, usar maxCompanions del prop; si no, usar el config global del evento
  const effectiveMaxCompanions = guestToken
    ? (maxCompanionsProp ?? 0)
    : (E.rsvp.maxPlusOnes ?? 0);

  const countdown = useCountdown(E.targetDate);
  const [modalOpen, setModalOpen] = useState(false);
  const [rsvpName, setRsvpName] = useState(guestName ?? '');
  const [companionInputs, setCompanionInputs] = useState<string[]>([]);
  const [dietary, setDietary] = useState(E.rsvp.dietaryOptions?.[0] ?? 'Sin restricción');
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

  /** Renderiza los bloques de imagen configurados para una posición de sección */
  function renderBlocks(afterSection: string) {
    const blocks = E.imageLayout.filter(b => b.afterSection === afterSection);
    if (blocks.length === 0) return null;

    return blocks.map((block, i) => {
      const srcs = (block.imageIndexes ?? [])
        .map(idx => E.images[idx])
        .filter((s): s is string => !!s && s.trim() !== '');

      if (srcs.length === 0) return null;

      if (block.layout === 'full') {
        return (
          <div key={i} className="photo-block">
            <img src={srcs[0]} alt="" className="photo-block-img" />
          </div>
        );
      }
      if (block.layout === 'duo') {
        return <DuoBlock key={i} src1={srcs[0]} src2={srcs[1] ?? srcs[0]} />;
      }
      // carousel
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
          seats: status === 'declined' ? 0 : 1 + companionInputs.length,
          companionNames: status === 'declined' ? [] : companionInputs,
          dietary,
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

  const heroImage = E.images[0] || null;

  return (
    <div 
      className={`${cormorant.variable} ${jost.variable} plus-root`}
      style={{
        '--ivory': backgroundColor,
        '--charcoal': textColor,
        '--gold': accentColor,
        backgroundColor: backgroundColor,
        color: textColor,
      } as React.CSSProperties}
    >
      <style>{css}</style>
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
        <div className="hero-bg" style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined} />
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
      <section className="section reveal">
        <div className="quote-mark">"</div>
        <p className="quote-text">{E.quote.text}</p>
        <div className="inline-sep">
          <span className="sep-line short" />
          <span className="label muted">{E.quote.reference}</span>
          <span className="sep-line short" />
        </div>
      </section>

      {renderBlocks('quote')}

      <Ornament />

      {/* ── NOMBRES Y PADRES ── */}
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

      {renderBlocks('parents')}

      <Ornament />

      {/* ── ITINERARIO ── */}
      <section className="section section--itinerary section--tinted-wide">
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
                <div className="dlx-irow-content">
                  {item.image && (
                    <div className="dlx-iimg-wrap">
                      <img src={item.image} alt={item.venue} className="dlx-iimg" />
                    </div>
                  )}
                  <p className="dlx-iname">{item.name}</p>
                  <p className="dlx-ivenue">{item.venue}</p>
                  {item.address && (
                    <>
                      <div className="dlx-iaddress">
                        <PinIcon /><span>{item.address}</span>
                      </div>
                      {mapsUrl && (
                        <div className="dlx-maps-wrap">
                          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="dlx-maps-btn">
                            <MapsIcon /> Ver en Google Maps
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
      {E.sections.gifts === true && (
        <section className="section">
          <div className="reveal" style={{ marginBottom: '1.25rem' }}><EnvelopeIcon /></div>
          <h2 className="section-heading reveal">Mesa de Regalos</h2>
          <p className="label muted reveal" style={{ maxWidth: '360px', lineHeight: '1.9', marginBottom: '2.5rem' }}>
            Tu presencia es el mejor regalo. Si deseas obsequiarnos algo, aquí encontrarás nuestras opciones.
          </p>
          <div className="gifts-grid">
            {(E.gifts.bank || E.gifts.holder || E.gifts.account || E.gifts.clabe) && (
              <div className="gift-card reveal">
                <p className="label" style={{ letterSpacing: '0.2em', marginBottom: '1.25rem', color: '#9B8B78' }}>
                  Transferencia Bancaria
                </p>
                {[
                  { label: 'Banco', value: E.gifts.bank },
                  { label: 'Nombre', value: E.gifts.holder },
                  { label: 'No. de cuenta', value: E.gifts.account },
                  { label: 'CLABE', value: E.gifts.clabe },
                ].filter(({ value }) => value).map(({ label, value }) => (
                  <div key={label} className="gift-row">
                    <span className="gift-label">{label}</span>
                    <span className="gift-value">{value}</span>
                  </div>
                ))}
              </div>
            )}
            {E.gifts.giftListUrl && (
              <div className="gift-card gift-card--list reveal delay-1">
                <GiftIcon />
                <p className="label" style={{ letterSpacing: '0.2em', margin: '1.25rem 0 0.5rem', color: '#9B8B78' }}>
                  Mesa de Regalos
                </p>
                <p className="gift-value" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                  {E.gifts.giftListLabel}
                </p>
                <a href={E.gifts.giftListUrl} target="_blank" rel="noopener noreferrer" className="btn-outline btn-outline--sm">
                  Ver mesa de regalos →
                </a>
              </div>
            )}
          </div>
        </section>
      )}

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
                {E.noChildrenMessage ?? 'Con todo nuestro cariño, les pedimos que esta celebración sea exclusiva para adultos. Agradecemos su comprensión.'}
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
                    readOnly={!!guestToken}
                    style={guestToken ? { opacity: 0.6, cursor: 'default' } : undefined}
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

                {/* Restricción alimentaria */}
                {(E.rsvp.dietaryOptions?.length ?? 0) > 0 && (
                  <div className="form-field">
                    <label className="form-label">Restricción alimentaria</label>
                    <div className="dietary-grid">
                      {E.rsvp.dietaryOptions!.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          className={`dietary-btn${dietary === opt ? ' dietary-btn--active' : ''}`}
                          onClick={() => setDietary(opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {rsvpError && (
                  <p className="label muted" style={{ color: '#c0392b', textAlign: 'center', marginBottom: '0.5rem' }}>
                    {rsvpError}
                  </p>
                )}

                <button type="submit" className="btn-submit" disabled={!rsvpName.trim() || rsvpLoading}>
                  {rsvpLoading ? 'Enviando…' : 'Confirmar asistencia'}
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
    <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
      <path d="M11 1 L9 7" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M19 1 L21 7" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M9 7 Q15 5 21 7" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M9 7 L8 17" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M21 7 L22 17" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M8 17 L22 17" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M8 17 L2 39" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M22 17 L28 39" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M2 39 L28 39" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function MenIcon() {
  return (
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
      <path d="M16 3 L8 9 L5 7 L4 39 L16 39" stroke="#B8965A" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M16 3 L24 9 L27 7 L28 39 L16 39" stroke="#B8965A" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M8 9 L13 19 L16 13" stroke="#B8965A" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M24 9 L19 19 L16 13" stroke="#B8965A" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M15 19 L14 27 L16 30 L18 27 L17 19 Z" stroke="#B8965A" strokeWidth="1.1" strokeLinejoin="round" fill="none"/>
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
    font-size: 0.45em;
    color: var(--gold);
    line-height: 1.1;
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
  .photo-block-img {
    width: 100%;
    max-height: 600px;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  .photo-block:hover .photo-block-img { transform: scale(1.02); }
  @media (max-width: 600px) { .photo-block, .photo-block-img { max-height: 380px; } }

  /* Duo — dos imágenes lado a lado */
  .duo-block {
    display: flex;
    width: 100%;
    gap: 3px;
    max-height: 520px;
    background: var(--charcoal);
    overflow: hidden;
  }
  .duo-block-item {
    flex: 1;
    overflow: hidden;
    min-width: 0;
  }
  .duo-block-img {
    width: 100%;
    height: 100%;
    max-height: 520px;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  .duo-block-item:hover .duo-block-img { transform: scale(1.03); }
  @media (max-width: 600px) {
    .duo-block { flex-direction: column; max-height: none; gap: 2px; }
    .duo-block-img { max-height: 300px; }
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

  /* ── Itinerary (Deluxe-style) ── */
  .section--itinerary { max-width: 760px; }

  .dlx-itinerary {
    position: relative;
    width: 100%;
    max-width: 600px;
    padding-left: 2rem;
    margin-top: 2rem;
  }
  .dlx-axis {
    position: absolute;
    left: 0;
    top: 0;
    width: 1px;
    height: 0;
    background: linear-gradient(to bottom, var(--gold), rgba(184,150,90,0.2));
    transition: height 2s cubic-bezier(0.16,1,0.3,1);
  }
  .dlx-axis.axis-grow { height: 100%; }
  .dlx-irow {
    display: grid;
    grid-template-columns: 60px 20px 1fr;
    gap: 0 1rem;
    align-items: start;
    margin-bottom: 2.5rem;
    position: relative;
  }
  .dlx-irow-time { text-align: right; padding-top: 0.25rem; }
  .time-h { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.75rem; font-weight: 300; color: var(--gold); line-height: 1; }
  .time-m { font-family: var(--font-cormorant), Georgia, serif; font-size: 1rem; font-weight: 300; color: var(--gold); }
  .dlx-irow-node { display: flex; flex-direction: column; align-items: center; padding-top: 0.5rem; }
  .dlx-inode {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #EDE5DA;
    border: 2px solid var(--gold);
    box-shadow: 0 0 0 3px rgba(184,150,90,0.15);
    flex-shrink: 0;
  }
  .dlx-irow-content { padding-bottom: 0.5rem; text-align: center; }
  .dlx-iimg-wrap {
    width: 100%;
    height: 140px;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }
  .dlx-iimg { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; display: block; }
  .dlx-iimg-wrap:hover .dlx-iimg { transform: scale(1.05); }
  .dlx-iname { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.3rem; font-weight: 400; color: var(--charcoal); margin: 0 0 0.2rem; }
  .dlx-ivenue { font-family: var(--font-jost), system-ui, sans-serif; font-size: 12px; font-weight: 500; color: var(--muted-fg); margin: 0 0 0.35rem; letter-spacing: 0.05em; }
  .dlx-iaddress {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 0.3rem;
    margin-bottom: 0.75rem;
  }
  .dlx-iaddress span { font-family: var(--font-jost), system-ui, sans-serif; font-size: 12px; color: var(--muted-fg); line-height: 1.5; }
  .dlx-maps-wrap { display: flex; justify-content: center; margin-top: 0.25rem; }
  .dlx-maps-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.45rem 1rem;
    border-radius: 100px;
    border: 1px solid rgba(184,150,90,0.5);
    color: var(--gold);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s;
  }
  .dlx-maps-btn:hover { background: rgba(184,150,90,0.15); border-color: var(--gold); }

  /* ── Destination ── */
  .destination-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    width: 100%;
  }
  @media (max-width: 700px) { .destination-grid { grid-template-columns: 1fr; } }
  @media (min-width: 701px) and (max-width: 900px) { .destination-grid { grid-template-columns: 1fr 1fr; } }
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
  .gifts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; width: 100%; max-width: 640px; }
  @media (max-width: 600px) { .gifts-grid { grid-template-columns: 1fr; } }
  .gift-card {
    width: 100%;
    background: #F0E9DF;
    border: 1px solid var(--muted);
    border-radius: 16px;
    padding: 2rem;
    text-align: left;
  }
  .gift-card--list { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2rem 1.5rem; }
  .gift-row { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px solid var(--muted); }
  .gift-row:last-child { border-bottom: none; }
  .gift-label { font-family: var(--font-jost), system-ui, sans-serif; font-size: 13px; color: var(--muted-fg); flex-shrink: 0; }
  .gift-value { font-family: var(--font-jost), system-ui, sans-serif; font-size: 14px; font-weight: 500; color: var(--charcoal); text-align: right; }

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
  .dietary-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .dietary-btn {
    padding: 0.5rem 1rem;
    border-radius: 100px;
    border: 1px solid var(--muted);
    background: #F0E9DF;
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    color: var(--muted-fg);
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.05em;
  }
  .dietary-btn:hover { border-color: var(--gold); color: var(--charcoal); }
  .dietary-btn--active { border-color: var(--gold); background: var(--gold); color: #fff; }

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
  @media (max-width: 480px) {
    .hero-meta { flex-direction: column; gap: 0.4rem; }
    .hero-meta-dot { display: none; }
    .section { padding: 4rem 1.5rem; }
    .dresscode-gender { grid-template-columns: 1fr; }
    .dc-gender-divider { width: 80%; height: 1px; margin: 0.5rem auto; }
    .dlx-itinerary { padding-left: 1.25rem; }
    .dlx-irow { grid-template-columns: 50px 16px 1fr; }
    .destination-grid { grid-template-columns: 1fr; }
  }
`;
