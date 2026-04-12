'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Cormorant_Garamond, Jost } from 'next/font/google';

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
  couple: { person1: 'Isabella', person2: 'Alejandro' },
  initials: { person1: 'I', person2: 'A' },
  fullNames: { person1: 'Isabella Montoya Reyes', person2: 'Alejandro Vargas León' },
  date: { day: '22', month: 'Noviembre', year: '2026', iso: '20261122' },
  time: { start: '17:00', end: '23:59', isoStart: '20261122T170000', isoEnd: '20261123T000000' },
  location: 'Valle de Guadalupe, Baja California',
  targetDate: '2026-11-22T17:00:00',
  quote: {
    text: 'Dos almas con un solo pensamiento, dos corazones que laten como uno.',
    reference: '— John Keats',
  },
  parents: {
    person1: 'Eduardo Montoya &\nLuciana Reyes de Montoya',
    person2: 'Rodrigo Vargas &\nSofia León de Vargas',
  },
  // Fotos distribuidas a lo largo de la invitación
  photos: {
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
  },
  itinerary: [
    {
      time: '16:30',
      name: 'Recepción de Invitados',
      venue: 'Viñedo Monte Xanic',
      address: 'Km 56 Carretera Ensenada-Tecate, Valle de Guadalupe',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    },
    {
      time: '17:00',
      name: 'Ceremonia',
      venue: 'Jardín La Lomita',
      address: 'Rancho La Lomita, Valle de Guadalupe, BC',
      image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&q=80',
    },
    {
      time: '19:00',
      name: 'Coctel al Atardecer',
      venue: 'Terraza Encuentro Guadalupe',
      address: 'Km 75 Carretera Tecate-Ensenada, Valle de Guadalupe',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80',
    },
    {
      time: '21:00',
      name: 'Cena & Celebración',
      venue: 'Salón Bajo las Estrellas',
      address: 'Hacienda El Mogor, Valle de Guadalupe',
      image: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80',
    },
  ],
  dressCode: {
    label: 'Black Tie Optional',
    description: 'Celebramos entre viñedos. Te pedimos vestimenta elegante adaptada al campo.',
    women: 'Vestido largo o midi en tonos tierra, vino o verde oliva. Tacón bajo o cuña recomendado por el terreno.',
    men: 'Traje oscuro o guayabera de lino en tonos oscuros. Moño o corbata opcional. Zapato cerrado.',
    swatches: [
      { color: '#2C2416', name: 'Noche' },
      { color: '#8B6914', name: 'Ámbar' },
      { color: '#6B4A2A', name: 'Terracota' },
      { color: '#3D5A4A', name: 'Bosque' },
      { color: '#C4A882', name: 'Champagne' },
    ],
    avoid: [
      { color: '#FFFFFF', name: 'Blanco' },
      { color: '#F5F5DC', name: 'Crema' },
    ],
  },
  notes: [
    'Evento para adultos — no se permiten niños.',
    'El terreno del viñedo es irregular; se recomienda tacón bajo o cuña.',
    'Temperatura fresca en la noche — se sugiere traer un chal o saco ligero.',
    'Estacionamiento gratuito en el predio con servicio de valet parking.',
  ],
  gifts: {
    bank: 'BBVA México',
    holder: 'Isabella Montoya Reyes',
    account: '4152 3312 0098 7654',
    clabe: '012 210 04152331200 9',
    giftListUrl: 'https://mesaderegalos.liverpool.com.mx/misregalos/99887',
    giftListLabel: 'Liverpool',
  },
  music: {
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    title: 'Perfect',
    artist: 'Ed Sheeran',
  },
  destination: {
    hotels: [
      {
        name: 'Viñedo Monte Xanic',
        category: 'Recomendado · Boutique',
        address: 'Km 56 Carretera Ensenada-Tecate, Valle de Guadalupe',
        note: 'Tarifa especial con código ISAALEX26',
        phone: '+52 646 155 2080',
      },
      {
        name: 'Adobe Guadalupe',
        category: 'Hacienda · 5 estrellas',
        address: 'Parcela A-1, Ejido Francisco Zarco, Valle de Guadalupe',
        note: 'Disponibilidad limitada — reservar anticipado',
        phone: '+52 646 155 2094',
      },
      {
        name: 'Finca La Carrodilla',
        category: 'Viñedo · Bed & Breakfast',
        address: 'Ejido El Porvenir, Valle de Guadalupe',
        note: 'Check-in desde las 3pm',
        phone: '+52 646 688 3019',
      },
    ],
    transport: {
      info: 'Contratamos transfer desde el aeropuerto de Ensenada y Tijuana hasta los viñedos del Valle de Guadalupe los días 21 y 22 de noviembre.',
      schedule: [
        { time: '10:00 – 15:00', detail: 'Transfers desde aeropuerto Ensenada' },
        { time: '15:30', detail: 'Último transfer antes de la recepción' },
      ],
      contact: 'coordinacion@isabellayalejandro.com',
    },
  },
  noChildren: true,
  rsvp: {
    deadline: '1 de octubre de 2026',
    // Token mock — en producción viene de ?id=TOKEN en la URL
    mockGuest: { name: 'María González', maxGuests: 2 },
  },
};

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
export default function WeddingDarkTemplate() {
  const countdown = useCountdown(EVENT.targetDate);
  const [loading, setLoading] = useState(true);
  const [loaderOut, setLoaderOut] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [guestConfirmed, setGuestConfirmed] = useState<null | boolean>(null);
  const [companionNames, setCompanionNames] = useState<string[]>([]);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const axisRef = useRef<HTMLDivElement>(null);
  const itineraryRef = useRef<HTMLDivElement>(null);

  // Loader
  useEffect(() => {
    const t1 = setTimeout(() => setLoaderOut(true), 2200);
    const t2 = setTimeout(() => setLoading(false), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

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
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add('axis-grow');
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  // Guest data from URL token (demo: uses mock)
  const guest = EVENT.rsvp.mockGuest;

  // Music toggle
  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (audio && EVENT.music.url) {
      if (playing) { audio.pause(); }
      else { audio.play().catch(() => {}); }
    }
    setPlaying((p) => !p);
  }, [playing]);

  // Google Calendar URL
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Boda de ${EVENT.couple.person1} & ${EVENT.couple.person2}`)}&dates=${EVENT.time.isoStart}/${EVENT.time.isoEnd}&details=${encodeURIComponent(`Celebración de matrimonio. Dress code: ${EVENT.dressCode.label}`)}&location=${encodeURIComponent(EVENT.location)}`;

  if (loading) {
    return (
      <div className={`${cormorant.variable} ${jost.variable}`}>
        <style>{css}</style>
        <div className={`loader ${loaderOut ? 'loader--out' : ''}`}>
          <div className="loader-monogram">
            <span className="loader-initial">{EVENT.initials.person1}</span>
            <span className="loader-amp">&</span>
            <span className="loader-initial">{EVENT.initials.person2}</span>
          </div>
          <div className="loader-line" />
          <p className="loader-date label">
            {EVENT.date.day} · {EVENT.date.month} · {EVENT.date.year}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${cormorant.variable} ${jost.variable} dlx-root`}>
      <style>{css}</style>

      {/* Audio */}
      <audio ref={audioRef} src={EVENT.music.url || undefined} loop preload="none" />

      {/* ── MUSIC PLAYER ── */}
      <button className={`music-pill ${playing ? 'music-pill--playing' : ''}`} onClick={toggleMusic} aria-label="Música">
        {playing ? <PauseIcon /> : <PlayIcon />}
        <span className="music-pill-text">
          {playing ? `${EVENT.music.title} · ${EVENT.music.artist}` : 'Música'}
        </span>
        {playing && <span className="music-pill-wave"><span/><span/><span/><span/></span>}
      </button>

      {/* ── HERO ── */}
      <section className="dlx-hero">
        <div className="dlx-hero-bg" style={{ backgroundImage: `url(${EVENT.photos.hero})` }} />
        <div className="dlx-hero-overlay" />
        <div className="dlx-hero-content">
          <p className="label gold hero-label reveal">Matrimonio</p>
          <h1 className="dlx-hero-names reveal">
            <span>{EVENT.couple.person1}</span>
            <span className="dlx-hero-amp">&</span>
            <span>{EVENT.couple.person2}</span>
          </h1>
          <div className="dlx-hero-meta reveal">
            <span className="label gold">{EVENT.date.day} · {EVENT.date.month} · {EVENT.date.year}</span>
            <span className="dlx-meta-dot" />
            <span className="label muted">{EVENT.location}</span>
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

      {/* ── CITA ── */}
      <section className="section dlx-dark">
        <div className="quote-mark reveal">"</div>
        <p className="quote-text reveal">{EVENT.quote.text}</p>
        <p className="label muted reveal" style={{ marginTop: '1rem' }}>{EVENT.quote.reference}</p>
      </section>

      {/* ── FOTOS TRÍO ── */}
      <div className="photo-trio">
        {EVENT.photos.trio.map((src, i) => (
          <div key={i} className={`photo-trio-item reveal delay-${i + 1}`}>
            <img src={src} alt="" className="photo-trio-img" />
          </div>
        ))}
      </div>

      {/* ── NOMBRES Y PADRES ── */}
      <section className="section">
        <p className="label muted reveal" style={{ marginBottom: '2.5rem' }}>Con la bendición de nuestras familias</p>
        <div className="parents-grid">
          <div className="slide-left delay-1 text-center">
            <p className="display-name">{EVENT.fullNames.person1}</p>
            <div className="name-sep"><span className="sep-line short" /></div>
            <p className="label muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
              Hija de<br />{EVENT.parents.person1}
            </p>
          </div>
          <div className="parents-monogram reveal">
            <span>{EVENT.initials.person1}</span>
            <span className="pm-amp">&</span>
            <span>{EVENT.initials.person2}</span>
          </div>
          <div className="slide-right delay-1 text-center">
            <p className="display-name">{EVENT.fullNames.person2}</p>
            <div className="name-sep"><span className="sep-line short" /></div>
            <p className="label muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
              Hijo de<br />{EVENT.parents.person2}
            </p>
          </div>
        </div>
      </section>

      {/* ── FOTO WIDE ── */}
      <div className="photo-wide reveal">
        <img src={EVENT.photos.wide} alt="" className="photo-wide-img" />
        <div className="photo-wide-overlay" />
      </div>

      {/* ── ITINERARIO ── */}
      <section className="section section--itinerary" ref={itineraryRef}>
        <h2 className="section-heading reveal">Programa del Día</h2>
        <div className="dlx-itinerary">
          <div className="dlx-axis" ref={axisRef} />
          {EVENT.itinerary.map((item, i) => {
            const [h, m] = item.time.split(':');
            const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(item.address)}`;
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
                  <div className="dlx-iaddress">
                    <PinIcon /><span>{item.address}</span>
                  </div>
                  <div className="dlx-maps-wrap">
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="dlx-maps-btn">
                      <MapsIcon /> Ver en Google Maps
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Ornament />

      {/* ── DESTINO ── */}
      <section className="section section--wide">
        <h2 className="section-heading reveal">Boda Destino</h2>
        <p className="label muted reveal" style={{ marginBottom: '3rem' }}>
          Te ayudamos a organizar tu estadía en el Valle de Guadalupe
        </p>

        <p className="label gold reveal" style={{ marginBottom: '1.5rem' }}>Hospedaje</p>
        <div className="destination-grid reveal">
          {EVENT.destination.hotels.map((hotel, i) => (
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

        <p className="label gold reveal" style={{ margin: '3.5rem 0 1.5rem' }}>Transporte</p>
        <div className="transport-card reveal">
          <div className="transport-header">
            <CarIcon />
            <p className="dest-card-name" style={{ margin: 0 }}>Transfer aeropuerto → viñedo</p>
          </div>
          <p className="transport-info">{EVENT.destination.transport.info}</p>
          <div className="transport-schedule">
            {EVENT.destination.transport.schedule.map((s, i) => (
              <div key={i} className="transport-row">
                <span className="transport-time">{s.time}</span>
                <span className="transport-detail">{s.detail}</span>
              </div>
            ))}
          </div>
          <div className="transport-contact">
            <EnvelopeIcon />
            <a href={`mailto:${EVENT.destination.transport.contact}`} className="dest-card-phone">
              {EVENT.destination.transport.contact}
            </a>
          </div>
        </div>
      </section>

      {/* ── FOTOS DÚO ── */}
      <div className="photo-duo">
        {EVENT.photos.duo.map((src, i) => (
          <div key={i} className={`photo-duo-item ${i === 0 ? 'slide-left' : 'slide-right'}`}>
            <img src={src} alt="" className="photo-duo-img" />
          </div>
        ))}
      </div>

      {/* ── DRESS CODE ── */}
      <section className="section section--tinted">
        <h2 className="section-heading reveal">Dress Code</h2>
        <p className="label gold reveal" style={{ marginBottom: '0.75rem' }}>{EVENT.dressCode.label}</p>
        <p className="label muted reveal" style={{ marginBottom: '2rem', maxWidth: '360px', lineHeight: '1.8', textTransform: 'none', letterSpacing: '0' }}>
          {EVENT.dressCode.description}
        </p>

        <div className="dresscode-gender reveal">
          <div className="dc-gender-block">
            <div className="dc-gender-icon"><WomenIcon /></div>
            <p className="label muted dc-gender-label">Ellas</p>
            <p className="dc-gender-text">{EVENT.dressCode.women}</p>
          </div>
          <div className="dc-gender-divider" />
          <div className="dc-gender-block">
            <div className="dc-gender-icon"><MenIcon /></div>
            <p className="label muted dc-gender-label">Ellos</p>
            <p className="dc-gender-text">{EVENT.dressCode.men}</p>
          </div>
        </div>

        <div className="swatches reveal" style={{ marginTop: '2rem' }}>
          {EVENT.dressCode.swatches.map((s, i) => (
            <div key={i} className="swatch-item">
              <div className="swatch-circle" style={{ backgroundColor: s.color }} />
              <span className="label muted">{s.name}</span>
            </div>
          ))}
        </div>
        {EVENT.dressCode.avoid.length > 0 && (
          <div className="reveal" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p className="label muted" style={{ marginBottom: '1rem' }}>Por favor evita</p>
            <div className="swatches" style={{ justifyContent: 'center' }}>
              {EVENT.dressCode.avoid.map((s, i) => (
                <div key={i} className="swatch-item">
                  <div className="swatch-circle swatch-avoid" style={{ backgroundColor: s.color }} />
                  <span className="label muted">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <Ornament />

      {/* ── INDICACIONES ── */}
      {EVENT.notes.length > 0 && (
        <section className="section">
          <h2 className="section-heading reveal">Toma nota</h2>
          <div className="notes-list">
            {EVENT.notes.map((note, i) => (
              <div key={i} className={`note-item reveal delay-${i + 1}`}>
                <span className="note-dot" />
                <p className="note-text">{note}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Ornament />

      {/* ── REGALOS ── */}
      <section className="section">
        <div className="reveal" style={{ marginBottom: '1.25rem' }}><EnvelopeIcon /></div>
        <h2 className="section-heading reveal">Mesa de Regalos</h2>
        <p className="label muted reveal" style={{ maxWidth: '360px', lineHeight: '1.9', marginBottom: '2.5rem' }}>
          Tu presencia es el mejor regalo. Si deseas obsequiarnos algo, aquí encontrarás nuestras opciones.
        </p>
        <div className="gifts-grid">
          <div className="gift-card reveal">
            <p className="label" style={{ letterSpacing: '0.2em', marginBottom: '1.25rem', color: '#9B8B78' }}>Transferencia Bancaria</p>
            {[
              { label: 'Banco', value: EVENT.gifts.bank },
              { label: 'Nombre', value: EVENT.gifts.holder },
              { label: 'No. de cuenta', value: EVENT.gifts.account },
              { label: 'CLABE', value: EVENT.gifts.clabe },
            ].map(({ label, value }) => (
              <div key={label} className="gift-row">
                <span className="gift-label">{label}</span>
                <span className="gift-value">{value}</span>
              </div>
            ))}
          </div>
          {EVENT.gifts.giftListUrl && (
            <div className="gift-card gift-card--list reveal delay-1">
              <GiftIcon />
              <p className="label" style={{ letterSpacing: '0.2em', margin: '1.25rem 0 0.5rem', color: '#9B8B78' }}>Mesa de Regalos</p>
              <p className="gift-value" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>{EVENT.gifts.giftListLabel}</p>
              <a href={EVENT.gifts.giftListUrl} target="_blank" rel="noopener noreferrer" className="btn-outline btn-outline--sm">
                Ver mesa de regalos →
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── FOTO CINEMÁTICA ── */}
      <div className="photo-cinematic reveal">
        <img src={EVENT.photos.cinematic} alt="" className="photo-cinematic-img" />
        <div className="photo-cinematic-overlay">
          <p className="dlx-cinematic-quote">
            {EVENT.couple.person1} &amp; {EVENT.couple.person2}
          </p>
          <p className="label gold">{EVENT.date.day} · {EVENT.date.month} · {EVENT.date.year}</p>
        </div>
      </div>

      {/* ── NO NIÑOS ── */}
      {EVENT.noChildren && (
        <section className="section">
          <div className="no-children-block reveal">
            <NoChildrenIcon />
            <div>
              <p className="no-children-title">Evento solo para adultos</p>
              <p className="no-children-desc">Con todo nuestro cariño, les pedimos que esta celebración sea exclusiva para adultos. Agradecemos su comprensión.</p>
            </div>
          </div>
        </section>
      )}

      <Ornament />

      {/* ── RSVP ── */}
      <section className="section">
        <h2 className="section-heading reveal">¿Nos acompañas?</h2>
        <p className="label muted reveal" style={{ marginBottom: '1rem' }}>
          Confirma antes del <strong style={{ color: 'var(--gold)' }}>{EVENT.rsvp.deadline}</strong>
        </p>
        <div className="dlx-rsvp-actions reveal">
          <button className="btn-rsvp" onClick={() => setModalOpen(true)}>
            Confirmar asistencia
          </button>
          <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="btn-calendar">
            <CalendarIcon />
            Agendar en Google Calendar
          </a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <p className="footer-monogram">{EVENT.initials.person1} &amp; {EVENT.initials.person2}</p>
        <p className="footer-names">{EVENT.couple.person1} &amp; {EVENT.couple.person2}</p>
        <p className="label muted" style={{ marginTop: '0.5rem' }}>
          {EVENT.date.day} · {EVENT.date.month} · {EVENT.date.year} · {EVENT.location}
        </p>
      </footer>

      {/* ── MODAL RSVP (pre-cargado) ── */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal">
            <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Cerrar">×</button>
            {rsvpDone ? (
              <div className="modal-success">
                <div className="modal-success-icon">✓</div>
                <h3 className="modal-title">¡Hasta pronto!</h3>
                <p className="label muted" style={{ textAlign: 'center', lineHeight: '1.8' }}>
                  Tu confirmación fue registrada. Estamos emocionados de celebrar contigo.
                </p>
              </div>
            ) : (
              <div className="modal-form">
                <div className="modal-header">
                  <p className="label gold" style={{ marginBottom: '0.5rem' }}>Confirmación de Asistencia</p>
                  <h3 className="modal-title">{EVENT.couple.person1} &amp; {EVENT.couple.person2}</h3>
                  <p className="label muted">{EVENT.date.day} · {EVENT.date.month} · {EVENT.date.year}</p>
                </div>

                {/* Datos pre-cargados del invitado */}
                <div className="modal-guest-card">
                  <div className="mgc-avatar">
                    {guest.name.charAt(0)}
                  </div>
                  <div>
                    <p className="mgc-name">{guest.name}</p>
                    <p className="label muted">{guest.maxGuests} {guest.maxGuests === 1 ? 'lugar' : 'lugares'} reservados</p>
                  </div>
                </div>

                <p className="label muted" style={{ textAlign: 'center', lineHeight: '1.8' }}>
                  Tu invitación fue personalizada. Solo confirma o declina tu asistencia.
                </p>

                {guestConfirmed === null ? (
                  <div className="rsvp-choice">
                    <button
                      className="rsvp-yes"
                      onClick={() => {
                        setGuestConfirmed(true);
                        const companions = guest.maxGuests - 1;
                        setCompanionNames(companions > 0 ? Array(companions).fill('') : []);
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

                    {/* Quién asistirá */}
                    <div className="attendees-list">
                      <p className="label muted" style={{ marginBottom: '0.75rem' }}>Asistentes confirmados</p>
                      <div className="attendee-row attendee-row--main">
                        <div className="attendee-num">✓</div>
                        <span className="attendee-name">{guest.name}</span>
                        <span className="label muted">Titular</span>
                      </div>
                      {companionNames.map((name, i) => (
                        <div key={i} className="attendee-row">
                          <div className="attendee-num">{i + 1}</div>
                          <input
                            className="form-input attendee-input"
                            type="text"
                            placeholder={`Nombre del acompañante ${i + 1}`}
                            value={name}
                            onChange={(e) => {
                              const updated = [...companionNames];
                              updated[i] = e.target.value;
                              setCompanionNames(updated);
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <button className="btn-submit" onClick={() => setRsvpDone(true)}>
                      Confirmar asistencia
                    </button>
                    <button className="rsvp-change" onClick={() => { setGuestConfirmed(null); setCompanionNames([]); }}>
                      Cambiar respuesta
                    </button>
                  </div>
                ) : (
                  <div className="rsvp-confirmed">
                    <p className="rsvp-confirmed-text" style={{ color: '#9B8B78' }}>
                      Lamentamos no poder verte, gracias por avisarnos.
                    </p>
                    <button className="btn-submit" onClick={() => setRsvpDone(true)}>
                      Enviar respuesta
                    </button>
                    <button className="rsvp-change" onClick={() => setGuestConfirmed(null)}>
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
    <svg width="48" height="48" viewBox="0 24 48 48" fill="none" style={{ flexShrink: 0 }}>
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
    --dark:     #0B0C10; /* Darker background */
    --muted:    #221C16; /* Muted brown-black */
    --muted-fg: #A8A29E;
  }

  .dlx-root { background: var(--dark); color: var(--ivory); }

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

  /* ── Music pill ── */
  .music-pill {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 50;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem 0.6rem 0.75rem;
    border-radius: 100px;
    background: rgba(20,16,12,0.85);
    border: 1px solid rgba(184,150,90,0.4);
    color: var(--ivory);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    letter-spacing: 0.1em;
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: border-color 0.2s, background 0.2s;
    max-width: 240px;
  }
  .music-pill:hover { border-color: var(--gold); background: rgba(20,16,12,0.95); }
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
    transform: scale(1.04);
    animation: heroZoom 12s ease-in-out infinite alternate;
  }
  @keyframes heroZoom {
    from { transform: scale(1.04); }
    to   { transform: scale(1.08); }
  }
  .dlx-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(20,16,12,0.45) 0%, rgba(20,16,12,0.25) 40%, rgba(20,16,12,0.65) 100%);
    z-index: 1;
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
    background: var(--muted);
    border: 1px solid rgba(184,150,90,0.2);
    border-radius: 14px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    text-align: left;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }
  .dest-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.4); transform: translateY(-3px); }
  .dest-card-icon { margin-bottom: 0.5rem; }
  .dest-card-name {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.15rem;
    font-weight: 400;
    color: var(--ivory);
    margin: 0;
  }
  .dest-card-category { margin: 0; }
  .dest-card-divider { height: 1px; background: rgba(184,150,90,0.2); margin: 0.75rem 0; }
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
    color: var(--ivory);
    text-decoration: none;
    letter-spacing: 0.03em;
    transition: color 0.2s;
  }
  .dest-card-phone:hover { color: var(--gold); }
  .transport-card {
    width: 100%;
    background: var(--muted);
    border: 1px solid rgba(184,150,90,0.2);
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
    border-bottom: 1px solid rgba(184,150,90,0.1);
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
    color: var(--ivory);
  }
  .transport-contact { display: flex; align-items: center; gap: 0.75rem; }

  .dlx-dark {
    background: #050510;
    max-width: 100%;
    width: 100%;
    color: var(--ivory);
    padding-left: 2rem;
    padding-right: 2rem;
  }
  .section-heading {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(2.25rem, 5.5vw, 3.5rem);
    font-weight: 300;
    font-style: italic;
    margin: 0 0 1rem;
    color: var(--ivory);
  }

  /* ── Ornament ── */
  .ornament { display: flex; align-items: center; gap: 1rem; padding: 0 3rem; max-width: 480px; margin: 0 auto; }

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

  /* ── Photo layouts ── */
  .photo-trio {
    display: grid;
    grid-template-columns: 1.2fr 0.9fr 1fr;
    gap: 4px;
    width: 100%;
    height: 480px;
  }
  @media (max-width: 600px) { .photo-trio { grid-template-columns: 1fr; height: auto; gap: 3px; } }
  .photo-trio-item { overflow: hidden; height: 100%; }
  @media (max-width: 600px) { .photo-trio-item { height: 260px; } }
  .photo-trio-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; display: block; }
  .photo-trio-item:hover .photo-trio-img { transform: scale(1.04); }

  .photo-wide { width: 100%; height: 480px; overflow: hidden; position: relative; }
  @media (max-width: 600px) { .photo-wide { height: 280px; } }
  .photo-wide-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .photo-wide-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, rgba(20,16,12,0.3) 0%, transparent 40%, transparent 60%, rgba(20,16,12,0.3) 100%);
  }

  .photo-duo { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; width: 100%; }
  .photo-duo-item { height: 440px; overflow: hidden; }
  @media (max-width: 600px) { .photo-duo-item { height: 240px; } }
  .photo-duo-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; display: block; }
  .photo-duo-item:hover .photo-duo-img { transform: scale(1.04); }

  .photo-cinematic { position: relative; width: 100%; height: 380px; overflow: hidden; }
  @media (max-width: 600px) { .photo-cinematic { height: 240px; } }
  .photo-cinematic-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .photo-cinematic-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.55);
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
  .display-name { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.25rem; font-weight: 400; color: var(--ivory); margin: 0; }
  .name-sep { display: flex; justify-content: center; margin: 0.75rem 0; }

  /* ── Itinerary Deluxe ── */
  .dlx-itinerary {
    position: relative;
    width: 100%;
    max-width: 600px;
    padding-left: 2rem;
    margin-top: 2rem;
  }

  /* Línea vertical que crece al hacer scroll */
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
    background: var(--dark);
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
  .dlx-iname { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.3rem; font-weight: 400; color: var(--ivory); margin: 0 0 0.2rem; }
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

  /* ── Section tinted ── */
  .section--tinted {
    background: #1A1A22;
    width: 100%;
    max-width: 100%;
    padding-left: max(2rem, calc((100vw - 680px) / 2));
    padding-right: max(2rem, calc((100vw - 680px) / 2));
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
  .dc-gender-divider { width: 1px; background: rgba(184,150,90,0.2); align-self: stretch; }
  .dc-gender-text { font-family: var(--font-jost), system-ui, sans-serif; font-size: 13px; color: var(--muted-fg); line-height: 1.8; margin: 0; }

  /* ── No children ── */
  .no-children-block { display: flex; align-items: flex-start; gap: 1.25rem; background: var(--muted); border: 1px solid rgba(184,150,90,0.2); border-left: 3px solid var(--gold); border-radius: 12px; padding: 1.5rem 1.75rem; max-width: 480px; text-align: left; }
  .no-children-title { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.15rem; font-weight: 400; color: var(--ivory); margin: 0 0 0.4rem; }
  .no-children-desc { font-family: var(--font-jost), system-ui, sans-serif; font-size: 13px; color: var(--muted-fg); line-height: 1.8; margin: 0; }

  /* ── Notes ── */
  .notes-list { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; max-width: 480px; text-align: left; }
  .note-item { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.875rem 1.25rem; background: var(--muted); border: 1px solid rgba(184,150,90,0.2); border-radius: 10px; }
  .note-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); flex-shrink: 0; margin-top: 5px; }
  .note-text { font-family: var(--font-jost), system-ui, sans-serif; font-size: 13px; color: var(--ivory); line-height: 1.7; margin: 0; }

  /* ── Swatches ── */
  .swatches { display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center; }
  .swatch-item { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  .swatch-item:hover { transform: translateY(-8px); }
  .swatch-circle { width: 52px; height: 52px; border-radius: 50%; border: 1px solid rgba(184,150,90,0.3); }
  .swatch-avoid { border-color: #d4a5a5; opacity: 0.7; }

  /* ── Gifts ── */
  .gifts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; width: 100%; max-width: 640px; }
  @media (max-width: 600px) { .gifts-grid { grid-template-columns: 1fr; } }
  .gift-card { width: 100%; background: var(--muted); border: 1px solid rgba(184,150,90,0.2); border-radius: 16px; padding: 2rem; text-align: left; }
  .gift-card--list { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2rem 1.5rem; }
  .gift-row { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; padding: 0.5rem 0; border-bottom: 1px solid rgba(184,150,90,0.1); }
  .gift-row:last-child { border-bottom: none; }
  .gift-label { font-family: var(--font-jost), system-ui, sans-serif; font-size: 13px; color: var(--muted-fg); flex-shrink: 0; }
  .gift-value { font-family: var(--font-jost), system-ui, sans-serif; font-size: 14px; font-weight: 500; color: var(--ivory); text-align: right; }
  .btn-outline {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.875rem 2.25rem; border-radius: 100px;
    border: 1px solid var(--gold); color: var(--gold);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
    text-decoration: none; transition: background 0.2s, color 0.2s; cursor: pointer; background: transparent;
  }
  .btn-outline:hover { background: var(--gold); color: var(--dark); }
  .btn-outline--sm { padding: 0.625rem 1.5rem; font-size: 10px; }

  /* ── RSVP actions ── */
  .dlx-rsvp-actions { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  .btn-rsvp {
    display: inline-flex; align-items: center; gap: 0.75rem;
    padding: 1.1rem 3rem; border-radius: 100px;
    background: var(--ivory); color: var(--dark);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
    border: 1px solid var(--ivory); cursor: pointer;
    transition: background 0.25s, color 0.25s, transform 0.2s, box-shadow 0.2s;
  }
  .btn-rsvp:hover { background: var(--gold); border-color: var(--gold); transform: translateY(-2px); box-shadow: 0 10px 28px rgba(184,150,90,0.35); }
  .btn-calendar {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.75rem 1.75rem; border-radius: 100px;
    border: 1px solid rgba(184,150,90,0.3); color: var(--muted-fg);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
  }
  .btn-calendar:hover { border-color: var(--gold); color: var(--gold); }

  /* ── Footer ── */
  .footer { text-align: center; padding: 3rem 2rem 4rem; border-top: 1px solid rgba(184,150,90,0.2); background: #05050A; }
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
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(6px);
    z-index: 100;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.25s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: var(--dark);
    border-radius: 20px;
    width: 100%; max-width: 420px;
    max-height: 90svh; overflow-y: auto;
    position: relative;
    animation: slideUp 0.35s cubic-bezier(0.16,1,0.3,1);
    border: 1px solid rgba(184,150,90,0.2);
    color: var(--ivory);
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
  .modal-close {
    position: absolute; top: 1rem; right: 1rem;
    width: 32px; height: 32px; border-radius: 50%;
    border: 1px solid rgba(184,150,90,0.2); background: transparent;
    color: var(--muted-fg); font-size: 1.25rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s; line-height: 1;
  }
  .modal-close:hover { background: rgba(184,150,90,0.1); }
  .modal-form { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
  .modal-header { text-align: center; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(184,150,90,0.1); }
  .modal-title { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.75rem; font-style: italic; font-weight: 300; color: var(--ivory); margin: 0.25rem 0; }
  .modal-success { padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  .modal-success-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(184,150,90,0.1); border: 1px solid var(--gold); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--gold); }

  /* Guest card */
  .modal-guest-card {
    display: flex; align-items: center; gap: 1rem;
    background: var(--muted); border: 1px solid rgba(184,150,90,0.2);
    border-radius: 12px; padding: 1rem 1.25rem;
  }
  .mgc-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    background: var(--ivory); color: var(--dark);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.5rem; font-style: italic; font-weight: 300;
  }
  .mgc-name { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.25rem; font-weight: 400; color: var(--ivory); margin: 0; }

  /* RSVP specifics */
  .rsvp-choice { display: flex; gap: 0.75rem; }
  .rsvp-yes, .rsvp-no {
    flex: 1; padding: 1rem; border-radius: 12px; border: 1px solid rgba(184,150,90,0.2);
    background: var(--muted); color: var(--ivory); font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; cursor: pointer; transition: all 0.2s;
  }
  .rsvp-yes:hover { background: var(--gold); border-color: var(--gold); color: var(--dark); }
  .rsvp-no:hover { background: #d4a5a5; border-color: #d4a5a5; color: var(--dark); }

  .rsvp-confirmed-text { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.5rem; font-style: italic; text-align: center; color: var(--gold); margin: 0; }
  .attendees-list { background: rgba(0,0,0,0.2); border-radius: 12px; padding: 1.25rem; border: 1px solid rgba(184,150,90,0.05); }
  .attendee-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid rgba(184,150,90,0.1); }
  .attendee-row:last-child { border-bottom: none; }
  .attendee-num { width: 20px; height: 20px; border-radius: 50%; background: var(--gold); color: var(--dark); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; }
  .attendee-name { font-family: var(--font-jost), system-ui, sans-serif; font-size: 13px; color: var(--ivory); flex: 1; }
  .attendee-input { background: transparent; border: none; border-bottom: 1px solid rgba(184,150,90,0.3); color: var(--ivory); padding: 0.25rem 0; font-family: var(--font-jost), system-ui, sans-serif; font-size: 13px; width: 100%; outline: none; transition: border-color 0.2s; }
  .attendee-input:focus { border-color: var(--gold); }
  .btn-submit { width: 100%; padding: 1rem; border-radius: 12px; background: var(--gold); color: var(--dark); border: none; font-family: var(--font-jost), system-ui, sans-serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s; }
  .btn-submit:hover { opacity: 0.9; }
  .rsvp-change { background: transparent; border: none; color: var(--muted-fg); font-size: 11px; text-decoration: underline; cursor: pointer; margin-top: 0.5rem; }
`;
