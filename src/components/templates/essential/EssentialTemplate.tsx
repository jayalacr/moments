'use client';

import { Cormorant_Garamond, Jost } from 'next/font/google';
import { useEffect } from 'react';

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
// Mock data — reemplazar con props reales en Sprint 2+
// ---------------------------------------------------------------------------
const EVENT = {
  couple: { person1: 'Sofía', person2: 'Mateo' },
  fullNames: { person1: 'Sofía Herrera López', person2: 'Mateo Mendoza Ruiz' },
  date: { day: '18', month: 'Octubre', year: '2025' },
  location: 'Ciudad de México',
  quote: {
    text: 'Lo que Dios unió, que no lo separe el hombre.',
    reference: 'Marcos 10:9',
  },
  parents: {
    person1: 'Roberto Herrera &\nCarmen López de Herrera',
    person2: 'Jorge Mendoza &\nPatricia Ruiz de Mendoza',
  },
  itinerary: [
    { time: '16:00', name: 'Ceremonia Religiosa', venue: 'Parroquia de San Francisco de Asís' },
    { time: '18:30', name: 'Coctel de Bienvenida', venue: 'Jardín Las Palmas' },
    { time: '20:00', name: 'Recepción', venue: 'Salón Grand Palais' },
  ],
  dressCode: {
    label: 'Formal',
    swatches: [
      { color: '#E8D5C4', name: 'Champagne' },
      { color: '#C9A87C', name: 'Dorado' },
      { color: '#8B9D77', name: 'Salvia' },
      { color: '#7B9AB2', name: 'Acero' },
      { color: '#D4C5B5', name: 'Perla' },
    ],
    avoid: [
      { color: '#FFFFFF', name: 'Blanco' },
      { color: '#F5F5DC', name: 'Crema' },
    ],
  },
  gifts: {
    bank: 'BBVA',
    holder: 'Sofía Herrera López',
    account: '4152 3140 7823 9012',
    clabe: '012 180 00412345678 9',
  },
  whatsapp: {
    number: '5215512345678',
    message: 'Hola, confirmo mi asistencia a la boda de Sofía & Mateo el 18 de octubre. 🤍',
  },
  rsvpDeadline: '30 de septiembre',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function EssentialTemplate() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const waUrl = `https://wa.me/${EVENT.whatsapp.number}?text=${encodeURIComponent(EVENT.whatsapp.message)}`;

  return (
    <div className={`${cormorant.variable} ${jost.variable}`} style={{ backgroundColor: '#F8F3EC', color: '#1C1611' }}>
      <style>{css}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <p className="label gold hero-label">Matrimonio</p>
          <h1 className="hero-names">
            {EVENT.couple.person1}&nbsp;&amp;&nbsp;{EVENT.couple.person2}
          </h1>
          <div className="hero-sep">
            <span className="sep-line" />
            <span className="label gold">
              {EVENT.date.day} · {EVENT.date.month} · {EVENT.date.year}
            </span>
            <span className="sep-line" />
          </div>
          <p className="label muted hero-loc">{EVENT.location}</p>
        </div>
        <div className="hero-scroll-indicator">
          <span className="label muted" style={{ fontSize: '10px' }}>Desliza</span>
          <div className="scroll-bar"><div className="scroll-thumb" /></div>
        </div>
      </section>

      {/* ── CITA ── */}
      <section className="section reveal">
        <div className="quote-mark">"</div>
        <p className="quote-text">{EVENT.quote.text}</p>
        <div className="inline-sep">
          <span className="sep-line short" />
          <span className="label muted">{EVENT.quote.reference}</span>
          <span className="sep-line short" />
        </div>
      </section>

      <Ornament />

      {/* ── NOMBRES Y PADRES ── */}
      <section className="section">
        <p className="label muted reveal" style={{ marginBottom: '2.5rem' }}>Con la bendición de nuestras familias</p>
        <div className="parents-grid">
          <div className="reveal delay-1 text-center">
            <p className="display-name">{EVENT.fullNames.person1}</p>
            <div className="name-sep"><span className="sep-line short" /></div>
            <p className="label muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
              Hija de<br />{EVENT.parents.person1}
            </p>
          </div>
          <div className="parents-divider" />
          <div className="reveal delay-2 text-center">
            <p className="display-name">{EVENT.fullNames.person2}</p>
            <div className="name-sep"><span className="sep-line short" /></div>
            <p className="label muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
              Hijo de<br />{EVENT.parents.person2}
            </p>
          </div>
        </div>
      </section>

      <Ornament />

      {/* ── ITINERARIO ── */}
      <section className="section">
        <h2 className="section-heading reveal">Programa del Día</h2>
        <div className="itinerary">
          {EVENT.itinerary.map((item, i) => {
            const [h, m] = item.time.split(':');
            return (
              <div key={i} className={`itinerary-item reveal delay-${i + 1}`}>
                <div className="itinerary-time">
                  <span className="time-h">{h}</span>
                  <span className="time-m">:{m}</span>
                </div>
                <div className="itinerary-dot" />
                <div className="itinerary-detail">
                  <p className="itinerary-name">{item.name}</p>
                  <p className="label muted">{item.venue}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <Ornament />

      {/* ── DRESS CODE ── */}
      <section className="section">
        <h2 className="section-heading reveal">Dress Code</h2>
        <p className="label gold reveal" style={{ marginBottom: '2.5rem' }}>{EVENT.dressCode.label}</p>
        <div className="swatches reveal">
          {EVENT.dressCode.swatches.map((s, i) => (
            <div key={i} className="swatch-item">
              <div className="swatch-circle" style={{ backgroundColor: s.color }} />
              <span className="label muted">{s.name}</span>
            </div>
          ))}
        </div>

        {EVENT.dressCode.avoid.length > 0 && (
          <div className="reveal" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
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

      {/* ── REGALOS ── */}
      <section className="section">
        <div className="reveal" style={{ marginBottom: '1.25rem' }}>
          <EnvelopeIcon />
        </div>
        <h2 className="section-heading reveal">Mesa de Regalos</h2>
        <p className="label muted reveal" style={{ maxWidth: '360px', lineHeight: '1.9', marginBottom: '2.5rem' }}>
          Tu presencia es el mejor regalo. Si deseas obsequiarnos algo, aquí encontrarás nuestras opciones.
        </p>

        <div className="gift-card reveal">
          <p className="label" style={{ letterSpacing: '0.2em', marginBottom: '1.25rem', color: '#9B8B78' }}>
            Transferencia Bancaria
          </p>
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

        <a href="#" className="btn-outline reveal" style={{ marginTop: '1.5rem' }}>
          Ver Mesa de Regalos →
        </a>
      </section>

      <Ornament />

      {/* ── RSVP ── */}
      <section className="section">
        <h2 className="section-heading reveal">¿Nos acompañas?</h2>
        <p className="label muted reveal" style={{ marginBottom: '2.5rem' }}>
          Confirma tu asistencia antes del <strong style={{ color: '#1C1611' }}>{EVENT.rsvpDeadline}</strong>
        </p>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp reveal">
          <WhatsAppIcon />
          Confirmar por WhatsApp
        </a>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <p className="footer-names">
          {EVENT.couple.person1} &amp; {EVENT.couple.person2}
        </p>
        <p className="label muted" style={{ marginTop: '0.5rem' }}>
          {EVENT.date.day} · {EVENT.date.month} · {EVENT.date.year} · {EVENT.location}
        </p>
      </footer>
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

function EnvelopeIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <rect x="3" y="9" width="38" height="26" rx="2.5" stroke="#B8965A" strokeWidth="1.4" />
      <path d="M3 13l19 13 19-13" stroke="#B8965A" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const css = `
  /* ---------- Tokens ---------- */
  :root {
    --ivory:    #F8F3EC;
    --charcoal: #1C1611;
    --gold:     #B8965A;
    --taupe:    #8B7355;
    --muted:    #E6DDD2;
    --muted-fg: #9B8B78;
  }

  /* ---------- Typography helpers ---------- */
  .font-display { font-family: var(--font-cormorant), Georgia, serif; }
  .font-body    { font-family: var(--font-jost), system-ui, sans-serif; }

  /* ---------- Shared ---------- */
  .label {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    letter-spacing: 0.25em;
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

  /* ---------- Scroll reveal ---------- */
  .reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1),
                transform 0.75s cubic-bezier(0.16,1,0.3,1);
  }
  .reveal.is-visible { opacity: 1; transform: translateY(0); }
  .delay-1 { transition-delay: 0.1s; }
  .delay-2 { transition-delay: 0.2s; }
  .delay-3 { transition-delay: 0.3s; }
  .delay-4 { transition-delay: 0.4s; }

  /* ---------- Hero ---------- */
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
    background:
      radial-gradient(ellipse 80% 60% at 50% 30%, #2a1f18 0%, #14100c 100%);
    z-index: 0;
  }
  .hero-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
    opacity: 0.5;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: var(--gold);
    z-index: 2;
  }
  .hero::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    z-index: 2;
  }
  .hero-content {
    position: relative;
    z-index: 1;
    padding: 2rem;
    animation: heroFadeIn 1.2s cubic-bezier(0.16,1,0.3,1) both;
  }
  .hero-label { margin-bottom: 2rem; animation-delay: 0s; }
  .hero-names {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(52px, 11vw, 112px);
    font-weight: 300;
    font-style: italic;
    letter-spacing: -0.02em;
    line-height: 1;
    margin: 0;
    animation: heroFadeIn 1.2s cubic-bezier(0.16,1,0.3,1) 0.15s both;
  }
  .hero-sep {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    margin: 1.75rem 0;
    animation: heroFadeIn 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s both;
  }
  .hero-loc { animation: heroFadeIn 1.2s cubic-bezier(0.16,1,0.3,1) 0.45s both; opacity: 0.45; }

  .hero-scroll-indicator {
    position: absolute;
    bottom: 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    z-index: 1;
    animation: heroFadeIn 1s ease 1.2s both;
  }
  .scroll-bar {
    width: 1px;
    height: 48px;
    background: rgba(255,255,255,0.15);
    overflow: hidden;
    border-radius: 1px;
  }
  .scroll-thumb {
    width: 100%;
    height: 50%;
    background: rgba(255,255,255,0.5);
    animation: scrollDown 1.6s ease-in-out infinite;
  }

  @keyframes heroFadeIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scrollDown {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(200%); }
  }

  /* ---------- Sections ---------- */
  .section {
    max-width: 680px;
    margin: 0 auto;
    padding: 5rem 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .section-heading {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 300;
    font-style: italic;
    margin: 0 0 1rem;
    color: var(--charcoal);
  }

  /* ---------- Ornament ---------- */
  .ornament {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0 3rem;
    max-width: 480px;
    margin: 0 auto;
  }

  /* ---------- Quote ---------- */
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
  .inline-sep {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  /* ---------- Parents ---------- */
  .parents-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 2rem;
    width: 100%;
    align-items: start;
  }
  @media (max-width: 600px) {
    .parents-grid {
      grid-template-columns: 1fr;
    }
    .parents-divider { display: none; }
  }
  .parents-divider {
    width: 1px;
    background: var(--muted);
    align-self: stretch;
  }
  .display-name {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.25rem;
    font-weight: 400;
    color: var(--charcoal);
    margin: 0;
  }
  .name-sep { display: flex; justify-content: center; margin: 0.75rem 0; }

  /* ---------- Itinerary ---------- */
  .itinerary { width: 100%; }
  .itinerary-item {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem 0;
    border-bottom: 1px solid var(--muted);
    text-align: left;
  }
  .itinerary-item:first-child { border-top: 1px solid var(--muted); }
  .itinerary-time {
    min-width: 64px;
    text-align: right;
    flex-shrink: 0;
  }
  .time-h {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 2.25rem;
    font-weight: 300;
    color: var(--gold);
    line-height: 1;
  }
  .time-m {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.25rem;
    font-weight: 300;
    color: var(--gold);
  }
  .itinerary-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gold);
    flex-shrink: 0;
  }
  .itinerary-name {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.2rem;
    font-weight: 400;
    color: var(--charcoal);
    margin: 0 0 0.25rem;
  }

  /* ---------- Swatches ---------- */
  .swatches {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .swatch-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .swatch-item:hover { transform: translateY(-8px); }
  .swatch-circle {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 1px solid var(--muted);
  }
  .swatch-avoid {
    border-color: #d4a5a5;
    opacity: 0.7;
  }

  /* ---------- Gifts ---------- */
  .gift-card {
    width: 100%;
    max-width: 400px;
    background: #F0E9DF;
    border: 1px solid var(--muted);
    border-radius: 16px;
    padding: 2rem;
    text-align: left;
  }
  .gift-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--muted);
  }
  .gift-row:last-child { border-bottom: none; }
  .gift-label {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px;
    color: var(--muted-fg);
    flex-shrink: 0;
  }
  .gift-value {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: var(--charcoal);
    text-align: right;
  }

  /* ---------- Buttons ---------- */
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
  }
  .btn-outline:hover { background: var(--gold); color: #fff; }

  .btn-whatsapp {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2.5rem;
    border-radius: 100px;
    background: #25D366;
    color: #fff;
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn-whatsapp:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 28px rgba(37,211,102,0.35);
  }

  /* ---------- Footer ---------- */
  .footer {
    text-align: center;
    padding: 3rem 2rem;
    border-top: 1px solid var(--muted);
    background: #F0E9DF;
  }
  .footer-names {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.5rem;
    font-style: italic;
    font-weight: 300;
    color: var(--charcoal);
    margin: 0;
  }
`;
