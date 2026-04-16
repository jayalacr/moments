'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import type { PhotoEntry } from '@/lib/imageLayout';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ItineraryItem { time?: string; name?: string; venue?: string; address?: string; image?: string; }
interface Swatch { color: string; name: string; }
interface Hotel { name: string; category: string; address: string; note: string; phone: string; }

interface DeluxeConfig {
  couple?: { person1?: string; person2?: string };
  fullNames?: { person1?: string; person2?: string };
  date?: { day?: string; month?: string; year?: string };
  location?: string;
  targetDate?: string;
  quote?: { text?: string; reference?: string };
  parents?: { person1?: string; person2?: string };
  photos?: PhotoEntry[];
  itinerary?: ItineraryItem[];
  dressCode?: { label?: string; description?: string; women?: string; men?: string; swatches?: Swatch[]; avoid?: Swatch[] };
  notes?: string[];
  gifts?: { bank?: string; holder?: string; account?: string; clabe?: string; giftListUrl?: string; giftListLabel?: string; giftTypes?: string[]; envelopeMessage?: string };
  music?: { url?: string; title?: string; artist?: string };
  destination?: {
    hotels?: Hotel[];
    transport?: { info?: string; schedule?: Array<{ time: string; detail: string }>; contact?: string };
  };
  noChildren?: boolean;
  noChildrenMessage?: string;
  rsvpDeadline?: string;
  heroLabel?: string;
  whatsapp?: { number?: string; message?: string };
  rsvp?: {
    maxPlusOnes?: number;
    deadline?: string;
    dietaryOptions?: string[];
  };
  sections?: {
    quote?: boolean;
    parents?: boolean;
    itinerary?: boolean;
    dressCode?: boolean;
    notes?: boolean;
    gifts?: boolean;
    destination?: boolean;
  };
}

interface Props {
  config: DeluxeConfig;
  eventId?: string;
  guestToken?: string;
  maxCompanions?: number;
  companionNames?: string[];
  guestName?: string;
  hasExistingRsvp?: boolean;
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
// Default photos (fallback when no config provided)
// ---------------------------------------------------------------------------
const DEFAULT_PHOTOS = {
  hero: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85',
  trio: [
    'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
  ],
  wide: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&q=85',
  duo: [
    'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=900&q=80',
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900&q=80',
  ],
  cinematic: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1600&q=85',
};

// ---------------------------------------------------------------------------
// DeluxeCarouselBlock — carrusel interactivo con navegación
// ---------------------------------------------------------------------------
function DeluxeCarouselBlock({ srcs, positions, scales }: { srcs: string[]; positions?: string[]; scales?: number[] }) {
  const [idx, setIdx] = useState(0);
  const total = srcs.length;
  const touchStartX = useRef<number | null>(null);

  const prev = () => setIdx(i => (i - 1 + total) % total);
  const next = () => setIdx(i => (i + 1) % total);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { if (diff > 0) next(); else prev(); }
    touchStartX.current = null;
  };

  if (total === 0) return null;

  return (
    <div className="dlx-carousel reveal" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="dlx-carousel-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {srcs.map((src, i) => (
          <div key={i} className="dlx-carousel-slide">
            <img
              src={src}
              alt={`Foto ${i + 1}`}
              className="dlx-carousel-img"
              style={{
                objectPosition: positions?.[i] ?? 'center center',
                transform: `scale(${scales?.[i] ?? 1})`,
                transformOrigin: positions?.[i] ?? 'center center',
              }}
            />
          </div>
        ))}
      </div>
      {total > 1 && (
        <>
          <button className="dlx-carousel-btn dlx-carousel-btn--prev" onClick={prev} aria-label="Anterior">
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
              <path d="M9 1L1 8.5L9 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="dlx-carousel-btn dlx-carousel-btn--next" onClick={next} aria-label="Siguiente">
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
              <path d="M1 1L9 8.5L1 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="dlx-carousel-dots">
            {srcs.map((_, i) => (
              <button
                key={i}
                className={`dlx-carousel-dot${i === idx ? ' dlx-carousel-dot--active' : ''}`}
                onClick={() => setIdx(i)}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
          <div className="dlx-carousel-counter">
            <span className="label gold">{idx + 1} / {total}</span>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hooks
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
export default function DeluxeTemplate({
  config,
  eventId,
  guestToken,
  maxCompanions = 0,
  companionNames: initialCompanionNames = [],
  guestName,
  hasExistingRsvp = false,
}: Props) {
  // ── Build data from config with defaults ────────────────────────────────
  const cfg = (config ?? {}) as DeluxeConfig;

  const couple = {
    person1: cfg.couple?.person1 || 'Persona 1',
    person2: cfg.couple?.person2 || 'Persona 2',
  };
  const initials = {
    person1: couple.person1.charAt(0),
    person2: couple.person2.charAt(0),
  };
  const fullNames = {
    person1: cfg.fullNames?.person1 || couple.person1,
    person2: cfg.fullNames?.person2 || couple.person2,
  };
  const date = {
    day:   cfg.date?.day   || '',
    month: cfg.date?.month || '',
    year:  cfg.date?.year  || '',
  };
  const location = cfg.location || '';
  const targetDate = cfg.targetDate || '';
  const heroLabel = cfg.heroLabel || 'Matrimonio';
  const noChildrenMessage = cfg.noChildrenMessage || 'Con todo nuestro cariño, les pedimos que esta celebración sea exclusiva para adultos. Agradecemos su comprensión.';
  const quote = {
    text:      cfg.quote?.text      || '',
    reference: cfg.quote?.reference || '',
  };
  const parents = {
    person1: cfg.parents?.person1 || '',
    person2: cfg.parents?.person2 || '',
  };
  // Hero photo
  const allPhotos = cfg.photos ?? [];
  const heroEntry = allPhotos.find(p => p.role === 'hero');
  const heroUrl   = heroEntry?.url || DEFAULT_PHOTOS.hero;

  /** Renderiza los bloques de imagen para una posición de sección */
  function renderBlocks(afterSection: string) {
    const sp = allPhotos.filter(p => p.role === 'block' && p.afterSection === afterSection);
    if (sp.length === 0) return null;
    const map = new Map<number, typeof sp>();
    for (const p of sp) {
      const g = p.blockGroup ?? 0;
      map.set(g, [...(map.get(g) ?? []), p]);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([g, ps]) => {
        const sorted    = ps.sort((a, b) => (a.orderInBlock ?? 0) - (b.orderInBlock ?? 0));
        const srcs      = sorted.map(p => p.url).filter(Boolean);
        const positions = sorted.map(p => p.objectPosition ?? 'center center');
        const scales    = sorted.map(p => p.scale ?? 1);
        if (!srcs.length) return null;

        if (ps[0].layout === 'full') {
          return (
            <div key={g} className="photo-block reveal">
              <img src={srcs[0]} alt="" className="photo-block-img"
                style={{ objectPosition: positions[0], transform: `scale(${scales[0]})`, transformOrigin: positions[0] }} />
            </div>
          );
        }
        if (ps[0].layout === 'duo') {
          return (
            <div key={g} className="duo-block reveal">
              <div className="duo-block-item slide-left">
                <img src={srcs[0]} alt="" className="duo-block-img"
                  style={{ objectPosition: positions[0], transform: `scale(${scales[0]})`, transformOrigin: positions[0] }} />
              </div>
              <div className="duo-block-item slide-right">
                <img src={srcs[1] ?? srcs[0]} alt="" className="duo-block-img"
                  style={{ objectPosition: positions[1] ?? positions[0], transform: `scale(${scales[1] ?? scales[1]})`, transformOrigin: positions[1] ?? positions[0] }} />
              </div>
            </div>
          );
        }
        if (ps[0].layout === 'trio') {
          return (
            <div key={g} className="trio-block reveal">
              <div className="trio-block-item slide-up">
                <img src={srcs[0]} alt="" className="trio-block-img"
                  style={{ objectPosition: positions[0], transform: `scale(${scales[0]})`, transformOrigin: positions[0] }} />
              </div>
              <div className="trio-block-item slide-up delay-1">
                <img src={srcs[1] ?? srcs[0]} alt="" className="trio-block-img"
                  style={{ objectPosition: positions[1] ?? positions[0], transform: `scale(${scales[1] ?? scales[0]})`, transformOrigin: positions[1] ?? positions[0] }} />
              </div>
              <div className="trio-block-item slide-up delay-2">
                <img src={srcs[2] ?? srcs[0]} alt="" className="trio-block-img"
                  style={{ objectPosition: positions[2] ?? positions[0], transform: `scale(${scales[2] ?? scales[0]})`, transformOrigin: positions[2] ?? positions[0] }} />
              </div>
            </div>
          );
        }
        // carousel
        return <DeluxeCarouselBlock key={g} srcs={srcs} positions={positions} scales={scales} />;
      });
  }
  const itinerary = cfg.itinerary ?? [];
  const dressCode = {
    label:       cfg.dressCode?.label       || '',
    description: cfg.dressCode?.description || '',
    women:       cfg.dressCode?.women       || '',
    men:         cfg.dressCode?.men         || '',
    swatches:    cfg.dressCode?.swatches    ?? [],
    avoid:       cfg.dressCode?.avoid       ?? [],
  };
  const notes       = cfg.notes  ?? [];
  const gifts       = cfg.gifts  ?? {};
  const music       = { url: cfg.music?.url || '', title: cfg.music?.title || '', artist: cfg.music?.artist || '' };
  const destination = cfg.destination ?? {};
  const noChildren  = cfg.noChildren ?? false;
  const rsvpDeadline = cfg.rsvpDeadline || '';
  const showDestination = cfg.sections?.destination !== false && (
    (destination.hotels && destination.hotels.length > 0) ||
    destination.transport?.info
  );

  // Google Calendar URL
  const firstItineraryTime = itinerary[0]?.time ?? '17:00';
  const [startH, startM] = firstItineraryTime.split(':');
  const dateStr = `${date.year}${String(date.month).padStart(2, '0')}${String(date.day).padStart(2, '0')}`;
  const isoStart = targetDate
    ? targetDate.replace(/[-:]/g, '').replace('T', 'T').slice(0, 15)
    : `${dateStr}T${startH}${startM}00`;
  const isoEnd = targetDate
    ? (() => { const d = new Date(targetDate); d.setHours(d.getHours() + 6); return d.toISOString().replace(/[-:]/g, '').slice(0, 15); })()
    : `${dateStr}T230000`;
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Boda de ${couple.person1} & ${couple.person2}`)}&dates=${isoStart}/${isoEnd}&details=${encodeURIComponent(`Celebración de matrimonio. Dress code: ${dressCode.label}`)}&location=${encodeURIComponent(location)}`;

  // ── State ────────────────────────────────────────────────────────────────
  const countdown = useCountdown(targetDate);
  const [loading, setLoading] = useState(true);
  const [loaderOut, setLoaderOut] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [guestConfirmed, setGuestConfirmed] = useState<null | boolean>(null);
  const [attendeeNames, setAttendeeNames] = useState<string[]>([]);
  const [dietary, setDietary] = useState(cfg.rsvp?.dietaryOptions?.[0] ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const axisRef = useRef<HTMLDivElement>(null);
  const itineraryRef = useRef<HTMLDivElement>(null);
  const [musicMinimized, setMusicMinimized] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const hasToken = !!guestToken;
  const displayName = guestName || couple.person1;
  const totalSeats = 1 + maxCompanions;

  // Loader
  useEffect(() => {
    const t1 = setTimeout(() => setLoaderOut(true), 2200);
    const t2 = setTimeout(() => setLoading(false), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Music Auto-minimize
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => setMusicMinimized(true), 4000);
    return () => clearTimeout(timer);
  }, [loading]);

  // Active Section Tracker (for minimal nav)
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id || 'hero');
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('section[id]').forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [loading]);

  // Scroll reveal
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal, .slide-left, .slide-right, .slide-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  // Itinerary axis growing line
  useEffect(() => {
    if (loading) return;
    const el = axisRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('axis-grow'); },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  // Music toggle
  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (audio && music.url) {
      if (playing) { audio.pause(); }
      else { audio.play().catch(() => {}); }
    }
    setPlaying((p) => !p);
  }, [playing, music.url]);

  // RSVP submit
  async function handleSubmitRsvp() {
    if (!hasToken || !eventId) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: guestToken,
          eventId,
          name: displayName,
          seats: guestConfirmed ? 1 + attendeeNames.filter(Boolean).length : 0,
          companionNames: guestConfirmed ? attendeeNames.filter(Boolean) : [],
          dietary: guestConfirmed ? dietary : undefined,
          status: guestConfirmed ? 'confirmed' : 'declined',
        }),
      });
      const json = await res.json();
      if (!res.ok) { setSubmitError(json.error || 'Error al guardar'); return; }
      setRsvpDone(true);
    } catch {
      setSubmitError('Error de conexión. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={`${cormorant.variable} ${jost.variable}`}>
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div className={`loader ${loaderOut ? 'loader--out' : ''}`}>
          <div className="loader-monogram">
            <span className="loader-initial">{initials.person1}</span>
            <span className="loader-amp">&</span>
            <span className="loader-initial">{initials.person2}</span>
          </div>
          <div className="loader-line" />
          <p className="loader-date label">
            {date.day} · {date.month} · {date.year}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${cormorant.variable} ${jost.variable} dlx-root`}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Audio */}
      {music.url && <audio ref={audioRef} src={music.url} loop preload="none" />}

      {/* ── MUSIC PLAYER ── */}
      {music.url && (
        <button 
          className={`music-pill ${playing ? 'music-pill--playing' : ''} ${musicMinimized ? 'music-pill--minimized' : ''}`} 
          onClick={() => {
            if (musicMinimized) setMusicMinimized(false);
            else toggleMusic();
          }}
          aria-label="Música"
        >
          <div className="music-pill-icon">
            {playing ? <PauseIcon /> : <PlayIcon />}
          </div>
          <span className="music-pill-text">
            {playing ? `${music.title || 'Música'} · ${music.artist || ''}` : 'Música'}
          </span>
          {playing && <span className="music-pill-wave"><span/><span/><span/><span/></span>}
        </button>
      )}

      {/* ── MINIMAL NAV ── */}
      <nav className={`dlx-min-nav ${loading ? '' : 'is-active'}`}>
        <a href="#itinerary" className={activeSection === 'itinerary' ? 'active' : ''}><span className="nav-dot" /><span className="nav-label">Programa</span></a>
        <a href="#destination" className={activeSection === 'destination' ? 'active' : ''}><span className="nav-dot" /><span className="nav-label">Mapa</span></a>
        <a href="#gifts" className={activeSection === 'gifts' ? 'active' : ''}><span className="nav-dot" /><span className="nav-label">Regalos</span></a>
        <a href="#rsvp" className={activeSection === 'rsvp' ? 'active' : ''}><span className="nav-dot" /><span className="nav-label">RSVP</span></a>
      </nav>

      {/* ── HERO ── */}
      <section className="dlx-hero" id="hero">
        <div className="dlx-hero-bg" style={{ backgroundImage: `url(${heroUrl})` }} />
        <div className="dlx-hero-glow" />
        <div className="dlx-hero-overlay" />
        <div className="dlx-hero-content">
          <p className="label gold hero-label reveal">{heroLabel}</p>
          <h1 className="dlx-hero-names reveal">
            <span>{couple.person1}</span>
            <span className="dlx-hero-amp">&</span>
            <span>{couple.person2}</span>
          </h1>
          <div className="dlx-hero-meta reveal">
            <span className="label gold">{date.day} · {date.month} · {date.year}</span>
            <span className="dlx-meta-dot" />
            <span className="label muted">{location}</span>
          </div>
          {/* Countdown */}
          <div className="dlx-countdown reveal">
            {[
              { value: countdown.days, label: 'Días' },
              { value: countdown.hours, label: 'Horas' },
              { value: countdown.minutes, label: 'Min' },
              { value: countdown.seconds, label: 'Seg' },
            ].map(({ value, label }, i) => (
              <React.Fragment key={label}>
                <div className="dlx-cd-unit">
                  <span className="dlx-cd-value">{String(value).padStart(2, '0')}</span>
                  <span className="dlx-cd-label">{label}</span>
                </div>
                {i < 3 && <span className="dlx-cd-sep">:</span>}
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
      {cfg.sections?.quote !== false && quote.text && (
        <section className="section dlx-dark">
          <div className="quote-mark reveal">"</div>
          <p className="quote-text reveal">{quote.text}</p>
          {quote.reference && <p className="label muted reveal" style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.6)' }}>{quote.reference}</p>}
        </section>
      )}

      {renderBlocks('quote')}

      {/* ── NOMBRES Y PADRES ── */}
      {cfg.sections?.parents !== false && (
        <section className="section">
          <p className="label muted reveal" style={{ marginBottom: '2.5rem' }}>Con la bendición de nuestras familias</p>
          <div className="parents-grid">
            <div className="slide-left delay-1 text-center">
              <p className="display-name">{fullNames.person1}</p>
              <div className="name-sep"><span className="sep-line short" /></div>
              {parents.person1 && (
                <p className="label muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                  {parents.person1}
                </p>
              )}
            </div>
            <div className="parents-monogram reveal">
              <span>{initials.person1}</span>
              <span className="pm-amp">&</span>
              <span>{initials.person2}</span>
            </div>
            <div className="slide-right delay-1 text-center">
              <p className="display-name">{fullNames.person2}</p>
              <div className="name-sep"><span className="sep-line short" /></div>
              {parents.person2 && (
                <p className="label muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                  {parents.person2}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {renderBlocks('parents')}

      {/* ── ITINERARIO ── */}
      {cfg.sections?.itinerary !== false && itinerary.length > 0 && (
        <section className="section section--itinerary" ref={itineraryRef} id="itinerary">
          <h2 className="section-heading reveal">Programa del Día</h2>
          <div className="dlx-itinerary">
            {itinerary.map((item, i) => {
              const [h, m] = (item.time || '00:00').split(':');
              const mapsUrl = item.address ? `https://maps.google.com/?q=${encodeURIComponent(item.address)}` : '';
              const isLast = i === itinerary.length - 1;
              return (
                <React.Fragment key={i}>
                  <div className={`dlx-irow slide-up delay-${i + 1}`}>
                    {/* Hora centrada */}
                    <div className="dlx-irow-time">
                      <span className="time-h">{h}</span>
                      <span className="time-m">:{m}</span>
                    </div>
                    {/* Nodo central */}
                    <div className="dlx-irow-node">
                      <div className="dlx-inode" />
                    </div>
                    {/* Tarjeta de contenido */}
                    <div className="dlx-irow-content">
                      {item.image && (
                        <div className="dlx-iimg-wrap">
                          <img src={item.image} alt={item.venue} className="dlx-iimg" />
                        </div>
                      )}
                      <div className="dlx-icard-body">
                        <p className="dlx-iname">{item.name}</p>
                        {item.venue && <p className="dlx-ivenue">{item.venue}</p>}
                        {item.address && (
                          <div className="dlx-iaddress">
                            <PinIcon /><span>{item.address}</span>
                          </div>
                        )}
                        {mapsUrl && (
                          <div className="dlx-maps-wrap">
                            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="dlx-maps-btn">
                              <MapsIcon /> Ver en Google Maps
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Conector entre items */}
                  {!isLast && <div className="dlx-iconnector" />}
                </React.Fragment>
              );
            })}
          </div>
        </section>
      )}

      {renderBlocks('itinerary')}

      {/* Solo mostramos ornamento si la siguiente sección (Destino) está activa */}
      {cfg.sections?.destination !== false && showDestination && <Ornament />}

      {/* ── DESTINO ── */}
      {cfg.sections?.destination !== false && showDestination && (
        <section className="section section--wide" id="destination">
          <h2 className="section-heading reveal">Boda Destino</h2>
          <p className="label muted reveal" style={{ marginBottom: '3rem' }}>
            Te ayudamos a organizar tu estadía
          </p>

          {destination.hotels && destination.hotels.length > 0 && (
            <>
              <p className="label gold reveal" style={{ marginBottom: '1.5rem' }}>Hospedaje</p>
              <div className="destination-grid reveal">
                {destination.hotels.map((hotel, i) => (
                  <div key={i} className={`dest-card delay-${i + 1}`}>
                    <div className="dest-card-icon"><HotelIcon /></div>
                    <p className="dest-card-name">{hotel.name}</p>
                    <p className="label muted dest-card-category">{hotel.category}</p>
                    <div className="dest-card-divider" />
                    <div className="dest-card-address"><PinIcon /><span>{hotel.address}</span></div>
                    {hotel.note && <p className="dest-card-note">{hotel.note}</p>}
                    {hotel.phone && <a href={`tel:${hotel.phone}`} className="dest-card-phone">{hotel.phone}</a>}
                  </div>
                ))}
              </div>
            </>
          )}

          {destination.transport?.info && (
            <>
              <p className="label gold reveal" style={{ margin: '3.5rem 0 1.5rem' }}>Transporte</p>
              <div className="transport-card reveal">
                <div className="transport-header">
                  <CarIcon />
                  <p className="dest-card-name" style={{ margin: 0 }}>Información de transporte</p>
                </div>
                <p className="transport-info">{destination.transport.info}</p>
                {destination.transport.schedule && destination.transport.schedule.length > 0 && (
                  <div className="transport-schedule">
                    {destination.transport.schedule.map((s, i) => (
                      <div key={i} className="transport-row">
                        <span className="transport-time">{s.time}</span>
                        <span className="transport-detail">{s.detail}</span>
                      </div>
                    ))}
                  </div>
                )}
                {destination.transport.contact && (
                  <div className="transport-contact">
                    <EnvelopeIcon />
                    <a href={`mailto:${destination.transport.contact}`} className="dest-card-phone">
                      {destination.transport.contact}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {renderBlocks('destination')}

      {/* ── DRESS CODE ── */}
      {cfg.sections?.dressCode !== false && dressCode.label && (
        <section className="section section--contrast">
          <h2 className="section-heading reveal">Dress Code</h2>
          <p className="label gold reveal" style={{ marginBottom: '0.75rem' }}>{dressCode.label}</p>
          {dressCode.description && (
            <p className="label muted reveal" style={{ marginBottom: '2rem', maxWidth: '360px', lineHeight: '1.8', textTransform: 'none', letterSpacing: '0' }}>
              {dressCode.description}
            </p>
          )}

          {(dressCode.women || dressCode.men) && (
            <div className="dresscode-gender reveal">
              <div className="dc-gender-block">
                <div className="dc-gender-icon"><WomenIcon /></div>
                <p className="label muted dc-gender-label">Ellas</p>
                <p className="dc-gender-text">{dressCode.women}</p>
              </div>
              <div className="dc-gender-divider" />
              <div className="dc-gender-block">
                <div className="dc-gender-icon"><MenIcon /></div>
                <p className="label muted dc-gender-label">Ellos</p>
                <p className="dc-gender-text">{dressCode.men}</p>
              </div>
            </div>
          )}

          {dressCode.swatches.length > 0 && (
            <div className="swatches reveal" style={{ marginTop: '2rem' }}>
              {dressCode.swatches.map((s, i) => (
                <div key={i} className="swatch-item">
                  <div className="swatch-circle" style={{ backgroundColor: s.color }} />
                  <span className="label muted">{s.name}</span>
                </div>
              ))}
            </div>
          )}
          {dressCode.avoid.length > 0 && (
            <div className="reveal" style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p className="label muted" style={{ marginBottom: '1rem' }}>Por favor evita</p>
              <div className="swatches" style={{ justifyContent: 'center' }}>
                {dressCode.avoid.map((s, i) => (
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

      {/* Ornamento condicional antes de Notas */}
      {cfg.sections?.notes !== false && notes.length > 0 && <Ornament />}

      {/* ── INDICACIONES ── */}
      {cfg.sections?.notes !== false && notes.length > 0 && (
        <section className="section">
          <h2 className="section-heading reveal">Toma nota</h2>
          <div className="notes-list">
            {notes.map((note, i) => (
              <div key={i} className={`note-item reveal delay-${i + 1}`}>
                <span className="note-dot" />
                <p className="note-text">{note}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {renderBlocks('notes')}

      {/* Ornamento condicional antes de Regalos */}
      {cfg.sections?.gifts !== false && (() => {
        const gt = gifts.giftTypes ?? [];
        return gt.length > 0 || gifts.bank || gifts.giftListUrl;
      })() && <Ornament />}

      {/* ── REGALOS ── */}
      {cfg.sections?.gifts !== false && (() => {
        const gt = gifts.giftTypes ?? [];
        const showTransfer = gt.includes('transfer') || (!gt.length && !!gifts.bank);
        const showList     = gt.includes('list')     || (!gt.length && !!gifts.giftListUrl);
        const showEnvelope = gt.includes('envelope');
        if (!showTransfer && !showList && !showEnvelope) return null;
        return (
          <section className="section" id="gifts">
            <h2 className="section-heading reveal">Mesa de Regalos</h2>
            <p className="label muted reveal" style={{ maxWidth: '340px', lineHeight: '1.9', marginBottom: '2rem' }}>
              Tu presencia es el mejor regalo. Si deseas obsequiarnos algo, aquí encontrarás las opciones disponibles.
            </p>
            <div className="gifts-grid">
              {showTransfer && gifts.bank && (
                <div className="gift-card reveal">
                  <p className="label" style={{ letterSpacing: '0.18em', marginBottom: '1rem', color: '#9B8B78' }}>Transferencia</p>
                  {[
                    { label: 'Banco',   value: gifts.bank },
                    { label: 'Nombre',  value: gifts.holder },
                    { label: 'Cuenta',  value: gifts.account },
                    { label: 'CLABE',   value: gifts.clabe },
                  ].filter(r => r.value).map(({ label, value }) => (
                    <div key={label} className="gift-row">
                      <span className="gift-label">{label}</span>
                      <span className="gift-value">{value}</span>
                    </div>
                  ))}
                </div>
              )}
              {showList && gifts.giftListUrl && (
                <div className="gift-card gift-card--list reveal delay-1">
                  <GiftIcon />
                  <p className="label" style={{ letterSpacing: '0.18em', margin: '1rem 0 0.4rem', color: '#9B8B78' }}>Mesa de Regalos</p>
                  {gifts.giftListLabel && <p className="gift-value" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>{gifts.giftListLabel}</p>}
                  <a href={gifts.giftListUrl} target="_blank" rel="noopener noreferrer" className="btn-outline btn-outline--sm">
                    Ver mesa →
                  </a>
                </div>
              )}
              {showEnvelope && (
                <div className="gift-card gift-card--envelope reveal delay-2">
                  <EnvelopeSmallIcon />
                  <p className="label" style={{ letterSpacing: '0.18em', margin: '1rem 0 0.4rem', color: '#9B8B78' }}>Sobre de Regalo</p>
                  <p className="gift-envelope-note">
                    {gifts.envelopeMessage || 'Con gusto recibimos sobres el día del evento'}
                  </p>
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {renderBlocks('gifts')}

      {/* Ornamento condicional antes de No Niños */}
      {noChildren && <Ornament />}

      {/* ── NO NIÑOS ── */}
      {noChildren && (
        <section className="section">
          <div className="no-children-block reveal">
            <NoChildrenIcon />
            <div>
              <p className="no-children-title">Evento solo para adultos</p>
              <p className="no-children-desc">{noChildrenMessage}</p>
            </div>
          </div>
        </section>
      )}

      {renderBlocks('noChildren')}

      {/* Ornamento final antes del RSVP */}
      <Ornament />

      {/* ── RSVP ── */}
      <section className="section" id="rsvp">
        <h2 className="section-heading reveal">¿Nos acompañas?</h2>
        {rsvpDeadline && (
          <p className="label muted reveal" style={{ marginBottom: '1.5rem', textTransform: 'none', letterSpacing: '0.05em' }}>
            Nos encantaría contar contigo. Por favor, confírmanos antes del <strong style={{ color: 'var(--gold)' }}>{rsvpDeadline}</strong>
          </p>
        )}
        <div className="dlx-rsvp-actions reveal">
          {hasToken ? (
            <button className="btn-rsvp" onClick={() => setModalOpen(true)}>
              {hasExistingRsvp ? 'Actualizar mi respuesta' : 'Confirmar mi asistencia'}
            </button>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: 'var(--font-jost)',
                fontSize: '12px',
                letterSpacing: '0.05em',
                color: '#9B8B78',
                padding: '1.25rem 2rem',
                border: '1px solid color-mix(in srgb, var(--gold), transparent 80%)',
                borderRadius: '0',
                maxWidth: '400px',
                lineHeight: '1.8'
              }}>
                Para confirmar, por favor utiliza el enlace personal que te enviamos.
              </p>
            </div>
          )}
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="btn-calendar">
            <CalendarIcon />
            Agendar en Google Calendar
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <p className="footer-monogram">{initials.person1} &amp; {initials.person2}</p>
        <p className="footer-names">{couple.person1} &amp; {couple.person2}</p>
        <p className="label muted" style={{ marginTop: '0.5rem' }}>
          {date.day} · {date.month} · {date.year}{location ? ` · ${location}` : ''}
        </p>
      </footer>

      {/* ── MODAL RSVP (pre-cargado) ── */}
      {modalOpen && hasToken && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal">
            <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Cerrar">×</button>
            {rsvpDone ? (
              <div className="modal-success">
                <div className="modal-success-icon">✓</div>
                <h3 className="modal-title">
                  {guestConfirmed ? '¡Hasta pronto!' : 'Respuesta registrada'}
                </h3>
                <p className="label muted" style={{ textAlign: 'center', lineHeight: '1.8' }}>
                  {guestConfirmed
                    ? 'Tu confirmación fue registrada. Estamos emocionados de celebrar contigo.'
                    : 'Lamentamos no poder verte. Gracias por avisarnos.'}
                </p>
              </div>
            ) : (
              <div className="modal-form">
                <div className="modal-header">
                  <p className="label gold" style={{ marginBottom: '0.5rem' }}>Confirmación de Asistencia</p>
                  <h3 className="modal-title">{couple.person1} &amp; {couple.person2}</h3>
                  {date.day && <p className="label muted">{date.day} · {date.month} · {date.year}</p>}
                </div>

                {/* Datos pre-cargados del invitado */}
                <div className="modal-guest-card">
                  <div className="mgc-avatar">{displayName.charAt(0)}</div>
                  <div>
                    <p className="mgc-name">{displayName}</p>
                    <p className="label muted">{totalSeats} {totalSeats === 1 ? 'lugar' : 'lugares'} reservados</p>
                  </div>
                </div>

                {hasExistingRsvp && guestConfirmed === null && (
                  <p className="label muted" style={{ textAlign: 'center', lineHeight: '1.8', color: '#B8965A' }}>
                    Ya tienes una confirmación registrada. Puedes actualizarla.
                  </p>
                )}

                {submitError && (
                  <p style={{ color: '#9C3A3A', fontSize: '12px', textAlign: 'center' }}>{submitError}</p>
                )}

                {guestConfirmed === null ? (
                  <div className="rsvp-choice">
                    <button
                      className="rsvp-yes"
                      onClick={() => {
                        setGuestConfirmed(true);
                        const pre = initialCompanionNames.length > 0
                          ? initialCompanionNames
                          : Array(maxCompanions).fill('');
                        setAttendeeNames(pre);
                      }}
                    >
                      Sí, asistiré
                    </button>
                    <button className="rsvp-no" onClick={() => setGuestConfirmed(false)}>
                      No podré ir
                    </button>
                  </div>
                ) : guestConfirmed ? (
                  <div className="rsvp-confirmed">
                    <p className="rsvp-confirmed-text">¡Perfecto! Te esperamos.</p>

                    <div className="attendees-list">
                      <p className="label muted" style={{ marginBottom: '0.75rem' }}>Asistentes confirmados</p>
                      <div className="attendee-row attendee-row--main">
                        <div className="attendee-num">✓</div>
                        <span className="attendee-name">{displayName}</span>
                        <span className="label muted">Titular</span>
                      </div>
                      {attendeeNames.map((name, i) => (
                        <div key={i} className="attendee-row">
                          <div className="attendee-num">{i + 1}</div>
                          <input
                            className="form-input attendee-input"
                            type="text"
                            placeholder={`Nombre del acompañante ${i + 1}`}
                            value={name}
                            onChange={(e) => {
                              const updated = [...attendeeNames];
                              updated[i] = e.target.value;
                              setAttendeeNames(updated);
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Opciones Dietéticas */}
                    {(cfg.rsvp?.dietaryOptions?.length ?? 0) > 0 && (
                      <div className="dlx-dietary-wrap">
                        <p className="label muted" style={{ marginBottom: '0.75rem', textAlign: 'center' }}>Restricción alimentaria</p>
                        <div className="dietary-grid">
                          {cfg.rsvp!.dietaryOptions!.map((opt) => (
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

                    <button
                      className="btn-submit"
                      onClick={handleSubmitRsvp}
                      disabled={submitting}
                    >
                      {submitting ? 'Guardando…' : 'Confirmar asistencia'}
                    </button>
                    <button className="rsvp-change" onClick={() => { setGuestConfirmed(null); setAttendeeNames([]); setSubmitError(''); }}>
                      Cambiar respuesta
                    </button>
                  </div>
                ) : (
                  <div className="rsvp-confirmed">
                    <p className="rsvp-confirmed-text" style={{ color: '#9B8B78' }}>
                      Lamentamos no poder verte, gracias por avisarnos.
                    </p>
                    <button
                      className="btn-submit"
                      onClick={handleSubmitRsvp}
                      disabled={submitting}
                    >
                      {submitting ? 'Guardando…' : 'Enviar respuesta'}
                    </button>
                    <button className="rsvp-change" onClick={() => { setGuestConfirmed(null); setSubmitError(''); }}>
                      Cambiar respuesta
                    </button>
                  </div>
                )}
              </div>
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
function MapsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6z" fill="currentColor" opacity="0.9" />
      <circle cx="12" cy="8" r="2.5" fill="white" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="16" r="1" fill="currentColor" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
      <circle cx="16" cy="16" r="1" fill="currentColor" />
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
    --dark:     #14100C;
    --muted:    #E6DDD2;
    --muted-fg: #9B8B78;
  }

  .dlx-root { background: var(--ivory); color: var(--charcoal); }

  .label {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 400;
  }
  .gold  { color: var(--gold); }
  .muted { color: var(--muted-fg); }
  .text-center { text-align: center; }

  .sep-line { display: block; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); flex: 1; }
  .sep-line.short { max-width: 48px; }

  /* ── Animations ── */
  .reveal, .slide-left, .slide-right, .slide-up {
    opacity: 0;
    transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
  }
  .reveal    { transform: translateY(24px); }
  .slide-left  { transform: translateX(-40px); }
  .slide-right { transform: translateX(40px); }
  .slide-up  { transform: translateY(32px); }
  .reveal.is-visible, .slide-left.is-visible, .slide-right.is-visible, .slide-up.is-visible {
    opacity: 1; transform: translate(0);
  }
  .delay-1 { transition-delay: 0.1s; }
  .delay-2 { transition-delay: 0.2s; }
  .delay-3 { transition-delay: 0.3s; }
  .delay-4 { transition-delay: 0.4s; }

  /* ── Loader ── */
  .loader {
    position: fixed;
    inset: 0;
    background: var(--dark);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    z-index: 999;
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .loader--out { opacity: 0; transform: scale(1.04); pointer-events: none; }
  .loader-monogram {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: loaderReveal 1s cubic-bezier(0.16,1,0.3,1) 0.3s both;
  }
  .loader-initial {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(64px, 15vw, 120px);
    font-weight: 300;
    font-style: italic;
    color: var(--ivory);
    line-height: 1;
  }
  .loader-amp {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(32px, 7vw, 56px);
    font-weight: 300;
    color: var(--gold);
    margin: 0 0.25rem;
    align-self: flex-start;
    padding-top: 0.5rem;
  }
  .loader-line {
    width: 60px;
    height: 1px;
    background: var(--gold);
    animation: loaderLine 0.8s ease 0.9s both;
    transform-origin: left;
  }
  @keyframes loaderLine { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  .loader-date {
    color: rgba(248,243,236,0.4);
    animation: loaderReveal 0.8s ease 1.1s both;
  }
  @keyframes loaderReveal { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  /* ── Music pill Evolution ── */
  .music-pill {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    border-radius: 100px;
    background: rgba(20,16,12,0.85);
    border: 1px solid rgba(184,150,90,0.3);
    color: var(--ivory);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    letter-spacing: 0.1em;
    cursor: pointer;
    backdrop-filter: blur(16px);
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    max-width: 320px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }
  .music-pill--minimized {
    padding: 0.75rem;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    max-width: 44px;
    background: rgba(184,150,90,0.9);
    border-color: var(--gold);
  }
  .music-pill--minimized .music-pill-text,
  .music-pill--minimized .music-pill-wave { display: none; }
  .music-pill-icon { display: flex; align-items: center; justify-content: center; }
  .music-pill:hover { border-color: var(--gold); transform: scale(1.05); }
  .music-pill--playing { border-color: var(--gold); }
  .music-pill-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .music-pill-wave {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 14px;
    margin-left: 2px;
  }
  .music-pill-wave span {
    display: block;
    width: 2px;
    background: var(--gold);
    border-radius: 2px;
    animation: wave 0.8s ease-in-out infinite alternate;
  }
  .music-pill-wave span:nth-child(1) { height: 4px; animation-delay: 0s; }
  .music-pill-wave span:nth-child(2) { height: 10px; animation-delay: 0.15s; }
  .music-pill-wave span:nth-child(3) { height: 7px; animation-delay: 0.3s; }
  .music-pill-wave span:nth-child(4) { height: 12px; animation-delay: 0.45s; }
  @keyframes wave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }

  /* ── Hero ── */
  .dlx-hero {
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
  .dlx-hero-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-color: var(--dark);
    z-index: 0;
    transform: scale(1.05);
    animation: heroZoom 15s ease-in-out infinite alternate;
  }
  @keyframes heroZoom {
    0% { transform: scale(1.05); }
    100% { transform: scale(1.1); }
  }
  .dlx-hero-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 30%, rgba(184,150,90,0.15) 0%, transparent 60%);
    z-index: 1;
    animation: glowPulse 8s ease-in-out infinite alternate;
  }
  @keyframes glowPulse {
    0% { opacity: 0.3; transform: scale(1); }
    100% { opacity: 0.6; transform: scale(1.1); }
  }
  .dlx-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(20,16,12,0.5) 0%, rgba(20,16,12,0.2) 40%, rgba(20,16,12,0.8) 100%);
    z-index: 2;
  }
  .dlx-hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: var(--gold);
    z-index: 2;
  }
  .dlx-hero::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    z-index: 2;
  }
  .dlx-hero-content {
    position: relative;
    z-index: 2;
    padding: 2rem 2rem 9rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
  }
  .hero-label { animation: loaderReveal 1s ease 0.2s both; }
  .dlx-hero-names {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(56px, 12vw, 130px);
    font-weight: 300;
    font-style: italic;
    letter-spacing: -0.02em;
    line-height: 1;
    margin: 0;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    animation: loaderReveal 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s both;
  }
  .dlx-hero-amp {
    font-size: 0.45em;
    color: var(--gold);
    line-height: 1.1;
  }
  .dlx-hero-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    animation: loaderReveal 1s ease 0.5s both;
  }
  .dlx-meta-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--gold);
    opacity: 0.6;
  }
  .hero-scroll-indicator {
    position: absolute;
    bottom: 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    z-index: 2;
    animation: loaderReveal 1s ease 1.2s both;
  }
  .scroll-bar { width: 1px; height: 48px; background: rgba(255,255,255,0.15); overflow: hidden; border-radius: 1px; }
  .scroll-thumb { width: 100%; height: 50%; background: rgba(255,255,255,0.5); animation: scrollDown 1.6s ease-in-out infinite; }
  @keyframes scrollDown { 0% { transform: translateY(-100%); } 100% { transform: translateY(200%); } }

  /* Countdown Deluxe */
  .dlx-countdown {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(184,150,90,0.3);
    border-radius: 14px;
    padding: 0.875rem 1.25rem;
    backdrop-filter: blur(10px);
    animation: loaderReveal 1s ease 0.7s both;
  }
  .dlx-cd-unit { display: flex; flex-direction: column; align-items: center; }
  .dlx-cd-value {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 300;
    color: #fff;
    line-height: 1;
    min-width: 2.2ch;
    text-align: center;
  }
  .dlx-cd-label {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    margin-top: 0.25rem;
  }
  .dlx-cd-sep {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.75rem;
    color: var(--gold);
    opacity: 0.5;
    padding-bottom: 1.1rem;
    align-self: flex-end;
    margin: 0 0.05rem;
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
  .section--itinerary { max-width: 760px; }
  .section--wide { max-width: 900px; }

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
    gap: 0.35rem;
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
    gap: 0.3rem;
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
    color: var(--charcoal);
    text-decoration: none;
    letter-spacing: 0.03em;
    transition: color 0.2s;
  }
  .dest-card-phone:hover { color: var(--gold); }
  .transport-card {
    width: 100%;
    background: #F0E9DF;
    border: 1px solid var(--muted);
    border-radius: 14px;
    padding: 1.5rem;
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
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--muted);
  }
  .transport-row:last-child { border-bottom: none; }
  .transport-time {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.1rem;
    font-weight: 300;
    color: var(--gold);
    min-width: 120px;
  }
  .transport-detail {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px;
    color: var(--charcoal);
  }
  .transport-contact { display: flex; align-items: center; gap: 0.75rem; }

  .dlx-dark {
    background: var(--dark);
    max-width: 100%;
    width: 100%;
    color: var(--ivory);
    padding-left: 2rem;
    padding-right: 2rem;
  }
  .section-heading {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 300;
    font-style: italic;
    margin: 0 0 1.5rem;
    color: var(--charcoal);
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  /* ── Minimal Nav ── */
  .dlx-min-nav {
    position: fixed;
    left: 2rem;
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    opacity: 0;
    pointer-events: none;
    transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .dlx-min-nav.is-active { opacity: 1; pointer-events: auto; }
  .dlx-min-nav a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
    group;
  }
  .nav-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gold);
    opacity: 0.3;
    transition: all 0.3s ease;
  }
  .nav-label {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(-- gold);
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.3s ease;
  }
  .dlx-min-nav a:hover .nav-dot,
  .dlx-min-nav a.active .nav-dot { opacity: 1; transform: scale(1.4); }
  .dlx-min-nav a:hover .nav-label,
  .dlx-min-nav a.active .nav-label { opacity: 0.6; transform: translateX(0); }

  @media (max-width: 1000px) { .dlx-min-nav { display: none; } }

  /* ── Ornament ── */
  .ornament { display: flex; align-items: center; gap: 1rem; padding: 0 3rem; max-width: 480px; margin: 0 auto; opacity: 0.6; }

  /* ── Quote (dark) ── */
  .quote-mark {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 5rem;
    line-height: 1;
    color: var(--gold);
    opacity: 0.3;
    margin-bottom: 0.5rem;
  }
  .quote-text {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(1.3rem, 3vw, 1.75rem);
    font-style: italic;
    font-weight: 300;
    line-height: 1.6;
    color: var(--ivory);
    margin: 0 0 0.5rem;
    max-width: 560px;
  }

  /* ── Photo blocks (dynamic engine) ── */
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

  .duo-block {
    display: flex;
    width: 100%;
    aspect-ratio: 2 / 1;
    gap: 4px;
    background: var(--ivory);
    overflow: hidden;
  }
  .duo-block-item { flex: 1; overflow: hidden; }
  .duo-block-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  .duo-block-item:hover .duo-block-img { transform: scale(1.04); }
  @media (max-width: 600px) {
    .duo-block { flex-direction: column; aspect-ratio: auto; gap: 3px; }
    .duo-block-item { aspect-ratio: 4 / 3; }
  }

  .trio-block {
    display: flex;
    width: 100%;
    aspect-ratio: 12 / 5;
    gap: 4px;
    background: var(--ivory);
    overflow: hidden;
  }
  .trio-block-item { flex: 1; aspect-ratio: 4 / 5; overflow: hidden; }
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

  /* ── Carousel Deluxe ── */
  .dlx-carousel {
    position: relative;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    background: var(--dark);
  }
  @media (max-width: 600px) { .dlx-carousel { aspect-ratio: 3 / 4; } }
  .dlx-carousel-track {
    display: flex;
    height: 100%;
    transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .dlx-carousel-slide {
    flex: 0 0 100%;
    height: 100%;
    overflow: hidden;
  }
  .dlx-carousel-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .dlx-carousel-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(20, 16, 12, 0.65);
    border: 1px solid rgba(184, 150, 90, 0.45);
    color: var(--ivory);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    transition: background 0.25s, border-color 0.25s, transform 0.25s;
    z-index: 2;
  }
  .dlx-carousel-btn--prev { left: 1.25rem; }
  .dlx-carousel-btn--next { right: 1.25rem; }
  .dlx-carousel-btn:hover { background: rgba(184, 150, 90, 0.75); border-color: var(--gold); transform: translateY(-50%) scale(1.08); }
  .dlx-carousel-dots {
    position: absolute;
    bottom: 1.25rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.45rem;
    z-index: 2;
  }
  .dlx-carousel-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.35);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    padding: 0;
  }
  .dlx-carousel-dot--active {
    background: var(--gold);
    width: 20px;
    border-radius: 3px;
  }
  .dlx-carousel-counter {
    position: absolute;
    top: 1.25rem;
    right: 1.5rem;
    z-index: 2;
    background: rgba(20, 16, 12, 0.5);
    padding: 0.25rem 0.6rem;
    border-radius: 100px;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(184, 150, 90, 0.2);
  }

  /* ── Dietary ── */
  .dlx-dietary-wrap { width: 100%; text-align: center; padding-top: 0.25rem; }
  .dietary-grid { display: flex; flex-wrap: wrap; gap: 0.45rem; justify-content: center; }
  .dietary-btn {
    padding: 0.45rem 0.9rem;
    border-radius: 100px;
    border: 1px solid rgba(184, 150, 90, 0.3);
    background: rgba(184, 150, 90, 0.04);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    color: var(--muted-fg);
    cursor: pointer;
    transition: all 0.2s;
    letter-spacing: 0.06em;
  }
  .dietary-btn:hover { border-color: var(--gold); color: var(--charcoal); background: rgba(184, 150, 90, 0.08); }
  .dietary-btn--active { border-color: var(--gold); background: var(--gold); color: #fff; }
  .photo-cinematic-overlay {
    position: absolute;
    inset: 0;
    background: rgba(20,16,12,0.55);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }
  .dlx-cinematic-quote {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(1.75rem, 5vw, 3.5rem);
    font-style: italic;
    font-weight: 300;
    color: #fff;
    margin: 0;
  }

  /* ── Parents ── */
  .parents-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 2rem; width: 100%; align-items: center; }
  @media (max-width: 600px) { .parents-grid { grid-template-columns: 1fr; } .parents-monogram { display: none; } }
  .parents-monogram {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 2.5rem;
    font-style: italic;
    font-weight: 300;
    color: var(--gold);
    opacity: 0.5;
    line-height: 1;
  }
  .pm-amp { font-size: 1.25rem; opacity: 0.7; }
  .display-name { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.25rem; font-weight: 400; color: var(--charcoal); margin: 0; }
  .name-sep { display: flex; justify-content: center; margin: 0.75rem 0; }

  /* ── Itinerary Deluxe ── */
  /* ── Itinerario (centrado) ── */
  .dlx-itinerary {
    width: 100%;
    max-width: 420px;
    margin: 2rem auto 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .dlx-irow {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Hora */
  .dlx-irow-time {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0;
    padding: 1.5rem 0 0.5rem;
  }
  .time-h { font-family: var(--font-cormorant), Georgia, serif; font-size: 2.25rem; font-weight: 300; color: var(--gold); line-height: 1; }
  .time-m { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.25rem; font-weight: 300; color: var(--gold); }

  /* Nodo */
  .dlx-irow-node { display: flex; flex-direction: column; align-items: center; padding-bottom: 0.5rem; }
  .dlx-inode {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--ivory);
    border: 2px solid var(--gold);
    box-shadow: 0 0 0 4px rgba(184,150,90,0.12);
  }

  /* Tarjeta de contenido */
  .dlx-irow-content {
    width: 100%;
    border: 1px solid var(--muted);
    border-radius: 16px;
    overflow: hidden;
    background: color-mix(in srgb, var(--ivory) 96%, var(--gold));
    text-align: center;
  }
  .dlx-icard-body {
    padding: 1.25rem 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
  }

  /* Conector entre items */
  .dlx-iconnector {
    width: 1px;
    height: 1.75rem;
    background: linear-gradient(to bottom, color-mix(in srgb, var(--gold), transparent 10%), color-mix(in srgb, var(--gold), transparent 80%));
  }

  .dlx-iimg-wrap {
    width: 100%;
    aspect-ratio: 16 / 7;
    overflow: hidden;
    border-radius: 0;
    margin-bottom: 0;
  }
  .dlx-iimg { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); display: block; }
  .dlx-iimg-wrap:hover .dlx-iimg { transform: scale(1.05); }
  .dlx-iname { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.35rem; font-weight: 400; color: var(--charcoal); margin: 0; }
  .dlx-ivenue { font-family: var(--font-jost), system-ui, sans-serif; font-size: 11px; font-weight: 500; color: var(--muted-fg); margin: 0; letter-spacing: 0.08em; text-transform: uppercase; }
  .dlx-iaddress {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 0.3rem;
    margin-top: 0.1rem;
  }
  .dlx-iaddress span { font-family: var(--font-jost), system-ui, sans-serif; font-size: 12px; color: var(--muted-fg); line-height: 1.5; }
  .dlx-maps-wrap { display: flex; justify-content: center; margin-top: 0.5rem; }
  .dlx-maps-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.9rem;
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
  .dlx-maps-btn:hover { background: rgba(184,150,90,0.12); border-color: var(--gold); }

  /* ── Section tinted / Contrast ── */
  .section--tinted {
    background: color-mix(in srgb, var(--ivory) 92%, var(--gold));
    width: 100%;
    max-width: 100%;
    padding-left: max(2rem, calc((100vw - 680px) / 2));
    padding-right: max(2rem, calc((100vw - 680px) / 2));
  }
  .section--contrast {
    background: color-mix(in srgb, var(--ivory) 95%, var(--charcoal));
    width: 100%;
    max-width: 100%;
    padding-left: max(2rem, calc((100vw - 680px) / 2));
    padding-right: max(2rem, calc((100vw - 680px) / 2));
  }
  .label.gold {
    letter-spacing: 0.25em;
    font-weight: 400;
  }
  .label.muted {
    letter-spacing: 0.15em;
    font-weight: 300;
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
  .dc-gender-divider { width: 1px; background: rgba(230,221,210,0.25); align-self: stretch; }
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
    background: color-mix(in srgb, var(--ivory) 95%, var(--gold));
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
  .gift-row { display: flex; justify-content: space-between; align-items: baseline; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid var(--muted); }
  .gift-row:last-child { border-bottom: none; }
  .gift-label { font-family: var(--font-jost), system-ui, sans-serif; font-size: 10px; color: var(--gold); text-transform: uppercase; letter-spacing: 0.1em; flex-shrink: 0; }
  .gift-value { font-family: var(--font-jost), system-ui, sans-serif; font-size: 12px; font-weight: 500; color: var(--charcoal); text-align: right; }
  .btn-outline {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.625rem 1.5rem; border-radius: 100px;
    border: 1px solid var(--gold); color: var(--gold);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase;
    text-decoration: none; transition: background 0.2s, color 0.2s; cursor: pointer; background: transparent;
  }
  .btn-outline:hover { background: var(--gold); color: #fff; }
  .btn-outline--sm { padding: 0.5rem 1.25rem; font-size: 10px; }

  /* ── RSVP actions ── */
  .dlx-rsvp-actions { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  .btn-rsvp {
    display: inline-flex; align-items: center; gap: 0.75rem;
    padding: 1.1rem 3rem; border-radius: 100px;
    background: var(--charcoal); color: var(--ivory);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
    border: 1px solid var(--charcoal); cursor: pointer;
    transition: background 0.25s, color 0.25s, transform 0.2s, box-shadow 0.2s;
  }
  .btn-rsvp:hover { background: var(--gold); border-color: var(--gold); transform: translateY(-2px); box-shadow: 0 10px 28px rgba(184,150,90,0.35); }
  .btn-calendar {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.75rem 1.75rem; border-radius: 100px;
    border: 1px solid var(--muted); color: var(--muted-fg);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
  }
  .btn-calendar:hover { border-color: var(--gold); color: var(--gold); }

  /* ── Footer ── */
  .footer { text-align: center; padding: 3rem 2rem 4rem; border-top: 1px solid var(--muted); background: var(--dark); }
  .footer-monogram {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 3rem;
    font-style: italic;
    font-weight: 300;
    color: var(--gold);
    opacity: 0.5;
    margin: 0 0 0.5rem;
  }
  .footer-names { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.5rem; font-style: italic; font-weight: 300; color: var(--ivory); margin: 0; }

  /* ── Modal ── */
  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(20,16,12,0.75);
    backdrop-filter: blur(6px);
    z-index: 100;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.25s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: var(--ivory);
    border-radius: 20px;
    width: 100%; max-width: 420px;
    max-height: 90svh; overflow-y: auto;
    position: relative;
    animation: slideUp 0.35s cubic-bezier(0.16,1,0.3,1);
    border: 1px solid var(--muted);
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
  .modal-close {
    position: absolute; top: 1rem; right: 1rem;
    width: 32px; height: 32px; border-radius: 50%;
    border: 1px solid var(--muted); background: transparent;
    color: var(--muted-fg); font-size: 1.25rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s; line-height: 1;
  }
  .modal-close:hover { background: var(--muted); }
  .modal-form { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
  .modal-header { text-align: center; padding-bottom: 1rem; border-bottom: 1px solid var(--muted); }
  .modal-title { 
    font-family: var(--font-cormorant), Georgia, serif; 
    font-size: 2rem; 
    font-style: italic; 
    font-weight: 300; 
    color: var(--charcoal); 
    margin: 0.5rem 0; 
    letter-spacing: -0.01em;
  }
  .modal-success { padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  .modal-success-icon { width: 56px; height: 56px; border-radius: 50%; background: #EDE5D8; border: 1px solid var(--gold); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--gold); }

  /* Guest card */
  .modal-guest-card {
    display: flex; align-items: center; gap: 1rem;
    background: #F0E9DF; border: 1px solid var(--muted);
    border-radius: 12px; padding: 1rem 1.25rem;
  }
  .mgc-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    background: var(--charcoal); color: var(--ivory);
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.4rem; font-style: italic;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .mgc-name { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.15rem; font-weight: 400; color: var(--charcoal); margin: 0 0 0.2rem; }

  /* RSVP choice */
  .rsvp-choice { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .rsvp-yes {
    padding: 0.875rem; border-radius: 10px;
    background: var(--charcoal); color: var(--ivory);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
    border: none; cursor: pointer;
    transition: background 0.2s, transform 0.15s;
  }
  .rsvp-yes:hover { background: var(--gold); transform: translateY(-1px); }
  .rsvp-no {
    padding: 0.875rem; border-radius: 10px;
    background: transparent; color: var(--muted-fg);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
    border: 1px solid var(--muted); cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .rsvp-no:hover { border-color: var(--muted-fg); color: var(--charcoal); }
  .rsvp-confirmed { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
  .rsvp-confirmed-text { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.25rem; font-style: italic; color: var(--charcoal); margin: 0; }
  .rsvp-change { background: none; border: none; font-family: var(--font-jost), system-ui, sans-serif; font-size: 11px; color: var(--muted-fg); cursor: pointer; text-decoration: underline; letter-spacing: 0.05em; }

  .attendees-list {
    width: 100%;
    background: #F0E9DF;
    border: 1px solid var(--muted);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
  }
  .attendee-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .attendee-row--main { padding-bottom: 0.5rem; border-bottom: 1px solid var(--muted); margin-bottom: 0.25rem; }
  .attendee-num {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: var(--muted);
    border: 1px solid var(--gold);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 10px; color: var(--gold);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .attendee-name {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 13px; font-weight: 500;
    color: var(--charcoal); flex: 1;
  }
  .attendee-input { margin: 0; flex: 1; padding: 0.5rem 0.75rem; font-size: 13px; }
  .form-input {
    width: 100%; padding: 0.875rem 1rem;
    border: 1px solid var(--muted); border-radius: 10px;
    background: #F0E9DF;
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 14px; color: var(--charcoal);
    outline: none; transition: border-color 0.2s; box-sizing: border-box;
  }
  .form-input:focus { border-color: var(--gold); }
  .form-input::placeholder { color: var(--muted-fg); }
  .btn-submit {
    width: 100%; padding: 1rem; border-radius: 100px;
    background: var(--charcoal); color: var(--ivory);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
    border: none; cursor: pointer;
    transition: background 0.2s, transform 0.2s;
  }
  .btn-submit:hover { background: var(--gold); transform: translateY(-1px); }

  /* ── Reveal Animations defined ── */
  .reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  .slide-left {
    opacity: 0;
    transform: translateX(-40px);
    transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  .slide-right {
    opacity: 0;
    transform: translateX(40px);
    transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  .slide-up {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  .reveal.is-visible,
  .slide-left.is-visible,
  .slide-right.is-visible,
  .slide-up.is-visible {
    opacity: 1;
    transform: translate(0, 0);
  }

  .delay-1 { transition-delay: 0.1s; }
  .delay-2 { transition-delay: 0.2s; }
  .delay-3 { transition-delay: 0.3s; }
  .delay-4 { transition-delay: 0.4s; }

  /* ── Mobile adjustments ── */
  @media (max-width: 480px) {
    .dlx-hero-meta { flex-direction: column; gap: 0.4rem; }
    .dlx-meta-dot { display: none; }
    .section { padding: 5rem 1.5rem; }
    .dresscode-gender { grid-template-columns: 1fr; }
    .dc-gender-divider { width: 80%; height: 1px; margin: 0.5rem auto; }
    .dlx-itinerary { max-width: 100%; padding: 0 1rem; }
    .destination-grid { grid-template-columns: 1fr; }
  }
`;
