'use client';

import { Cormorant_Garamond, Playfair_Display, EB_Garamond, Jost, Raleway, Montserrat } from 'next/font/google';
import { useEffect } from 'react';
import React from 'react';

// Fuentes
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '600'], variable: '--font-cormorant' });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'], variable: '--font-playfair' });
const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-jost' });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-montserrat' });

const DISPLAY_FONT_VAR: Record<string, string> = {
  cormorant:     'var(--font-cormorant)',
  playfair:      'var(--font-playfair)',
};
const BODY_FONT_VAR: Record<string, string> = {
  jost:       'var(--font-jost)',
  montserrat: 'var(--font-montserrat)',
};

// ---------------------------------------------------------------------------
// Mock data para Boda en la Playa (Essential)
// ---------------------------------------------------------------------------
const BEACH_CONFIG = {
  heroLabel: 'Nuestra Boda en el Mar',
  couple: { person1: 'Marina', person2: 'Sebastián' },
  fullNames: { person1: 'Marina Soler Valdés', person2: 'Sebastián Ríos Luna' },
  date: { day: '15', month: 'Mayo', year: '2026' },
  location: 'Playa del Secreto, Riviera Maya',
  images: [
    'https://images.unsplash.com/photo-1544124499-58912cbddaad?w=1600&q=85', // Hero: Beach wedding
    'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=1600&q=85', // Wide: Couple on sand
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=85', // Center: Details
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=85', // Duo 1
    'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200&q=85', // Duo 2
  ],
  quote: {
    text: 'El amor es como el mar, se ve el principio pero no el final.',
    reference: '— Anónimo',
  },
  parents: {
    person1: 'Ricardo Soler &\nElena Valdés',
    person2: 'Mauricio Ríos &\nClara Luna',
  },
  itinerary: [
    { time: '17:30', name: 'Ceremonia de Arena', venue: 'Playa Principal', address: 'Km 25 Carretera Cancún-Tulum' },
    { time: '18:30', name: 'Cóctel Tropical', venue: 'Terraza de las Palmeras' },
    { time: '20:00', name: 'Cena Bajo las Estrellas', venue: 'Beach Club El Secreto' },
  ],
  dressCode: {
    label: 'Playa Formal (Guayabera)',
    women: 'Vestidos largos o midi en telas frescas (lino, seda). Colores claros o tropicales sugeridos.',
    men: 'Guayabera de lino blanca o azul claro, pantalón de lino beige. No se requiere corbata.',
    swatches: [
      { color: '#F2E8D5', name: 'Arena' },
      { color: '#A2DED0', name: 'Turquesa' },
      { color: '#FFFFFF', name: 'Blanco' },
      { color: '#E5C1B3', name: 'Coral' },
    ],
  },
  notes: [
    'El evento será sobre la arena, se recomienda calzado cómodo.',
    'Contaremos con estación de hidratación y abanicos.',
    'Sugerimos el uso de bloqueador solar biodegradable.',
  ],
  gifts: {
    bank: 'Santander',
    holder: 'Marina Soler',
    account: '5678 1234 9012 3456',
    clabe: '014 180 56781234901 2',
    giftListUrl: 'https://www.amazon.com.mx/wedding/share/marina-y-sebastian',
    giftListLabel: 'Amazon Wedding',
  },
  whatsapp: { 
    number: '525512345678', 
    message: '¡Hola! Confirmo mi asistencia a la boda de Marina y Sebastián.' 
  },
  noChildren: true,
  rsvpDeadline: '15 de abril de 2026',
  theme: {
    accentColor: '#0077BE', // Ocean Blue
    backgroundColor: '#F9F7F2', // Soft Sand
    textColor: '#2C3E50', // Deep Navy
    displayFont: 'playfair',
    bodyFont: 'montserrat',
  },
};

export default function WeddingBeachTemplate({ config = {} }: { config?: any }) {
  const c = { ...BEACH_CONFIG, ...config };
  const t = c.theme;

  const accentColor      = t.accentColor;
  const backgroundColor  = t.backgroundColor;
  const textColor        = t.textColor;
  const displayFontVar   = DISPLAY_FONT_VAR[t.displayFont as string] || 'var(--font-playfair)';
  const bodyFontVar      = BODY_FONT_VAR[t.bodyFont as string] || 'var(--font-montserrat)';

  const allFontVars = [
    cormorant.variable, playfair.variable, jost.variable, montserrat.variable,
  ].join(' ');

  const rootStyle = {
    backgroundColor,
    color: textColor,
    '--ivory':        backgroundColor,
    '--charcoal':     textColor,
    '--gold':         accentColor,
    '--font-display': displayFontVar,
    '--font-body':    bodyFontVar,
  } as React.CSSProperties;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.15 }
    );
    document.querySelectorAll('.reveal, .reveal--image, .reveal--slide-left').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const waUrl = `https://wa.me/${c.whatsapp.number}?text=${encodeURIComponent(c.whatsapp.message)}`;

  return (
    <div className={`${allFontVars} essential-root`} style={rootStyle}>
      <style>{css}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url(${c.images[0]})` }} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-label">{c.heroLabel}</p>
          <h1 className="hero-names">
            <span>{c.couple.person1}</span>
            <span className="hero-amp">&</span>
            <span>{c.couple.person2}</span>
          </h1>
          <div className="hero-divider-line" />
          <div className="hero-meta">
            <span>{c.date.day} · {c.date.month} · {c.date.year}</span>
            <span className="hero-meta-dot" />
            <span>{c.location}</span>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span className="scroll-label">Desliza</span>
          <div className="scroll-bar"><div className="scroll-thumb" /></div>
        </div>
      </section>

      {/* ── CITA ── */}
      <section className="section section--left reveal">
        <div className="quote-mark">"</div>
        <p className="quote-text">{c.quote.text}</p>
        <p className="label muted">{c.quote.reference}</p>
      </section>

      <Ornament />

      {/* ── NOMBRES Y PADRES ── */}
      <section className="section">
        <div className="parents-header reveal">
          <span className="sep-line" />
          <p className="label muted">Con la bendición de nuestras familias</p>
          <span className="sep-line" />
        </div>
        <div className="parents-grid">
          <div className="reveal delay-1 text-center">
            <p className="display-name">{c.fullNames.person1}</p>
            <p className="label muted" style={{ whiteSpace: 'pre-line' }}>Hija de<br />{c.parents.person1}</p>
          </div>
          <div className="parents-symbol reveal">🐚</div>
          <div className="reveal delay-1 text-center">
            <p className="display-name">{c.fullNames.person2}</p>
            <p className="label muted" style={{ whiteSpace: 'pre-line' }}>Hijo de<br />{c.parents.person2}</p>
          </div>
        </div>
      </section>

      {/* ── FOTO WIDE ── */}
      <div className="photo-full reveal--image">
        <img src={c.images[1]} alt="" className="photo-img" />
      </div>

      <Ornament />

      {/* ── ITINERARIO ── */}
      <section className="section section--wide">
        <h2 className="section-heading reveal">Programa del Día</h2>
        <div className="itinerary">
          {c.itinerary.map((item: any, i: number) => (
            <div key={i} className={`itinerary-item reveal--slide-left delay-${i + 1}`}>
              <div className="itinerary-timeline">
                <div className="itinerary-dot" />
              </div>
              <div className="itinerary-card">
                <p className="itinerary-time">{item.time}</p>
                <p className="itinerary-name">{item.name}</p>
                <p className="itinerary-venue">{item.venue}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOTO CENTER ── */}
      <div className="photo-center reveal--image">
        <img src={c.images[2]} alt="" className="photo-img" />
      </div>

      <Ornament />

      {/* ── DRESS CODE ── */}
      <section className="section section--wide">
        <h2 className="section-heading reveal">Dress Code</h2>
        <p className="dresscode-label reveal">{c.dressCode.label}</p>
        <div className="dresscode-gender reveal">
          <div className="dc-gender-block">
            <p className="label muted">Ellas</p>
            <p className="dc-gender-text">{c.dressCode.women}</p>
          </div>
          <div className="dc-gender-divider" />
          <div className="dc-gender-block">
            <p className="label muted">Ellos</p>
            <p className="dc-gender-text">{c.dressCode.men}</p>
          </div>
        </div>
        <div className="swatches reveal">
          {c.dressCode.swatches.map((s: any, i: number) => (
            <div key={i} className="swatch-item">
              <div className="swatch-circle" style={{ backgroundColor: s.color }} />
              <span className="label muted">{s.name}</span>
            </div>
          ))}
        </div>
      </section>

      <Ornament />

      {/* ── REGALOS ── */}
      <section className="section">
        <h2 className="section-heading reveal">Mesa de Regalos</h2>
        <div className="gifts-grid">
          <div className="gift-card reveal">
            <p className="gift-card-title">Transferencia</p>
            <p className="gift-value">{c.gifts.bank}</p>
            <p className="gift-value">{c.gifts.clabe}</p>
            <p className="gift-value">{c.gifts.holder}</p>
          </div>
          <div className="gift-card reveal delay-1">
             <a href={c.gifts.giftListUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
                {c.gifts.giftListLabel} →
             </a>
          </div>
        </div>
      </section>

      {/* ── RSVP ── */}
      <section className="section rsvp-section">
        <h2 className="section-heading reveal">¿Nos acompañas?</h2>
        <p className="reveal">Confirma antes del <strong>{c.rsvpDeadline}</strong></p>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp reveal">
          Confirmar por WhatsApp
        </a>
      </section>

      <footer className="footer">
        <p>{c.couple.person1} & {c.couple.person2}</p>
        <p className="label muted">{c.location}</p>
      </footer>
    </div>
  );
}

const css = `
  .essential-root {
    font-family: var(--font-body);
    overflow-x: hidden;
  }
  .label { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; }
  .muted { opacity: 0.6; }
  .reveal { opacity: 0; transform: translateY(20px); transition: all 0.8s ease; }
  .reveal.is-visible { opacity: 1; transform: translateY(0); }
  .reveal--image { opacity: 0; transform: scale(0.95); transition: all 1s ease; }
  .reveal--image.is-visible { opacity: 1; transform: scale(1); }

  .hero { height: 100vh; position: relative; display: flex; align-items: center; justify-content: center; color: white; text-align: center; }
  .hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 0; }
  .hero-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.3); z-index: 1; }
  .hero-content { position: relative; z-index: 2; padding: 2rem; }
  .hero-label { font-size: 1.2rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); margin-bottom: 1rem; }
  .hero-names { font-family: var(--font-display); font-size: clamp(3rem, 10vw, 6rem); font-style: italic; line-height: 1; }
  .hero-amp { color: var(--gold); font-size: 0.6em; display: block; margin: 0.2em 0; }
  .hero-divider-line { width: 60px; height: 1px; background: var(--gold); margin: 2rem auto; }
  .hero-meta { display: flex; gap: 1rem; justify-content: center; align-items: center; font-size: 0.9rem; letter-spacing: 0.1em; }
  .hero-meta-dot { width: 4px; height: 4px; background: var(--gold); border-radius: 50%; }

  .section { padding: 80px 20px; text-align: center; max-width: 800px; margin: 0 auto; }
  .section--left { text-align: left; }
  .section--wide { max-width: 1000px; }
  .section-heading { font-family: var(--font-display); font-size: 2.5rem; color: var(--gold); margin-bottom: 3rem; font-style: italic; }

  .quote-mark { font-family: var(--font-display); font-size: 4rem; color: var(--gold); opacity: 0.3; line-height: 1; }
  .quote-text { font-family: var(--font-display); font-size: 1.8rem; font-style: italic; margin: 1rem 0; line-height: 1.4; }

  .parents-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 3rem; }
  .sep-line { height: 1px; background: var(--gold); flex: 1; opacity: 0.3; }
  .parents-grid { display: grid; grid-template-columns: 1fr auto 1fr; gap: 2rem; align-items: center; }
  @media (max-width: 600px) { .parents-grid { grid-template-columns: 1fr; } .parents-symbol { display: none; } }
  .display-name { font-family: var(--font-display); font-size: 1.4rem; color: var(--charcoal); margin-bottom: 0.5rem; }

  .photo-full { width: 100%; height: 500px; overflow: hidden; }
  .photo-center { max-width: 800px; margin: 0 auto; height: 400px; overflow: hidden; border-radius: 8px; }
  .photo-img { width: 100%; height: 100%; object-fit: cover; }

  .itinerary { display: flex; flex-direction: column; gap: 2rem; max-width: 500px; margin: 0 auto; text-align: left; }
  .itinerary-item { display: flex; gap: 1.5rem; }
  .itinerary-dot { width: 10px; height: 10px; background: var(--gold); border-radius: 50%; margin-top: 6px; }
  .itinerary-time { font-weight: 600; color: var(--gold); font-size: 1.1rem; }
  .itinerary-name { font-family: var(--font-display); font-size: 1.3rem; margin: 0.2rem 0; }
  .itinerary-venue { opacity: 0.6; font-size: 0.9rem; }

  .dresscode-gender { display: grid; grid-template-columns: 1fr auto 1fr; gap: 2rem; text-align: left; margin-top: 2rem; }
  @media (max-width: 600px) { .dresscode-gender { grid-template-columns: 1fr; } .dc-gender-divider { display: none; } }
  .dc-gender-divider { width: 1px; background: var(--gold); opacity: 0.2; }
  .dc-gender-text { font-size: 0.95rem; line-height: 1.6; margin-top: 0.5rem; }
  .swatches { display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; }
  .swatch-circle { width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); }

  .gifts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  @media (max-width: 600px) { .gifts-grid { grid-template-columns: 1fr; } }
  .gift-card { background: white; padding: 2rem; border-radius: 12px; border: 1px solid rgba(0,0,0,0.05); }
  .gift-card-title { font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1rem; color: var(--gold); }
  .gift-value { font-size: 0.9rem; margin: 0.3rem 0; }

  .btn-outline { display: inline-block; padding: 0.8rem 1.5rem; border: 1px solid var(--gold); color: var(--gold); text-decoration: none; border-radius: 30px; transition: all 0.3s; }
  .btn-outline:hover { background: var(--gold); color: white; }
  .btn-whatsapp { display: inline-block; padding: 1rem 2.5rem; background: var(--gold); color: white; text-decoration: none; border-radius: 40px; font-weight: 600; margin-top: 2rem; }

  .footer { padding: 60px 20px; border-top: 1px solid rgba(0,0,0,0.05); font-family: var(--font-display); font-style: italic; }
  .ornament { display: flex; align-items: center; gap: 1rem; padding: 20px 0; max-width: 400px; margin: 0 auto; }
`;

function Ornament() {
  return (
    <div className="ornament">
      <span className="sep-line" />
      <span style={{ color: 'var(--gold)' }}>✦</span>
      <span className="sep-line" />
    </div>
  );
}
