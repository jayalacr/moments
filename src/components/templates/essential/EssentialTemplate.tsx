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
// Types
// ---------------------------------------------------------------------------
export interface EssentialConfig {
  heroLabel?: string;
  couple?: { person1?: string; person2?: string };
  fullNames?: { person1?: string; person2?: string };
  date?: { day?: string; month?: string; year?: string };
  location?: string;
  images?: string[];
  quote?: { text?: string; reference?: string };
  parents?: { person1?: string; person2?: string };
  itinerary?: { time: string; name: string; venue: string; address?: string }[];
  dressCode?: {
    label?: string;
    women?: string;
    men?: string;
    swatches?: { color: string; name: string }[];
    avoid?: { color: string; name: string }[];
  };
  notes?: string[];
  gifts?: {
    bank?: string;
    holder?: string;
    account?: string;
    clabe?: string;
    giftListUrl?: string;
    giftListLabel?: string;
  };
  whatsapp?: { number?: string; message?: string };
  noChildren?: boolean;
  rsvpDeadline?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function EssentialTemplate({ config = {} }: { config?: EssentialConfig }) {
  const c = config;
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

  const waUrl = `https://wa.me/${c.whatsapp?.number ?? ''}?text=${encodeURIComponent(c.whatsapp?.message ?? '')}`;
  const heroImage = c.images?.[0] || null;

  return (
    <div className={`${cormorant.variable} ${jost.variable}`} style={{ backgroundColor: '#F8F3EC', color: '#1C1611' }}>
      <style>{css}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="label gold hero-label">{c.heroLabel}</p>
          <h1 className="hero-names">
            <span>{c.couple?.person1}</span>
            <span className="hero-amp">&</span>
            <span>{c.couple?.person2}</span>
          </h1>
          <div className="hero-meta">
            <span className="label gold">{c.date?.day} · {c.date?.month} · {c.date?.year}</span>
            <span className="hero-meta-dot" />
            <span className="label muted">{c.location}</span>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span className="label muted" style={{ fontSize: '10px' }}>Desliza</span>
          <div className="scroll-bar"><div className="scroll-thumb" /></div>
        </div>
      </section>

      {/* ── CITA ── */}
      <section className="section reveal">
        <div className="quote-mark">"</div>
        <p className="quote-text">{c.quote?.text}</p>
        <div className="inline-sep">
          <span className="sep-line short" />
          <span className="label muted">{c.quote?.reference}</span>
          <span className="sep-line short" />
        </div>
      </section>

      <Ornament />

      {/* ── NOMBRES Y PADRES ── */}
      <section className="section">
        <p className="label muted reveal" style={{ marginBottom: '2.5rem' }}>Con la bendición de nuestras familias</p>
        <div className="parents-grid">
          <div className="reveal delay-1 text-center">
            <p className="display-name">{c.fullNames?.person1}</p>
            <div className="name-sep"><span className="sep-line short" /></div>
            <p className="label muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
              Hija de<br />{c.parents?.person1}
            </p>
          </div>
          <div className="parents-divider" />
          <div className="reveal delay-2 text-center">
            <p className="display-name">{c.fullNames?.person2}</p>
            <div className="name-sep"><span className="sep-line short" /></div>
            <p className="label muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
              Hijo de<br />{c.parents?.person2}
            </p>
          </div>
        </div>
      </section>

      {/* ── FOTO 2 (ancho completo) ── */}
      {c.images?.[1] && (
        <div className="photo-full reveal">
          <img src={c.images[1]} alt="Foto de los novios" className="photo-img photo-img--hover" />
        </div>
      )}

      <Ornament />

      {/* ── ITINERARIO ── */}
      <section className="section section--tinted">
        <h2 className="section-heading reveal">Programa del Día</h2>
        <div className="itinerary">
          {(c.itinerary ?? []).map((item, i) => {
            const [h, m] = item.time.split(':');
            const isLast = i === (c.itinerary?.length ?? 1) - 1;
            return (
              <div key={i} className={`itinerary-item reveal delay-${i + 1}`}>
                {/* Línea de tiempo */}
                <div className="itinerary-timeline">
                  <div className="itinerary-dot" />
                  {!isLast && <div className="itinerary-line" />}
                </div>

                {/* Contenido */}
                <div className="itinerary-card">
                  <div className="itinerary-card-header">
                    <div className="itinerary-time">
                      <span className="time-h">{h}</span>
                      <span className="time-m">:{m}</span>
                    </div>
                    <p className="itinerary-name">{item.name}</p>
                  </div>
                  <div className="itinerary-card-body">
                    <p className="itinerary-venue">{item.venue}</p>
                    {item.address && (
                      <div className="itinerary-address">
                        <PinIcon />
                        <span>{item.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FOTO 3 (ancho pantalla) ── */}
      {c.images?.[2] && (
        <div className="photo-center reveal">
          <div className="photo-img--hover" style={{ width: '100%', height: '100%' }}>
            <img src={c.images[2]} alt="Foto de los novios" className="photo-img" />
          </div>
        </div>
      )}

      <Ornament />

      {/* ── DRESS CODE ── */}
      <section className="section section--tinted">
        <h2 className="section-heading reveal">Dress Code</h2>
        <p className="label gold reveal" style={{ marginBottom: '2rem' }}>{c.dressCode?.label}</p>

        <div className="dresscode-gender reveal">
          <div className="dc-gender-block">
            <div className="dc-gender-icon"><WomenIcon /></div>
            <p className="label muted dc-gender-label">Ellas</p>
            <p className="dc-gender-text">{c.dressCode?.women}</p>
          </div>
          <div className="dc-gender-divider" />
          <div className="dc-gender-block">
            <div className="dc-gender-icon"><MenIcon /></div>
            <p className="label muted dc-gender-label">Ellos</p>
            <p className="dc-gender-text">{c.dressCode?.men}</p>
          </div>
        </div>

        <div className="swatches reveal" style={{ marginTop: '2rem' }}>
          {(c.dressCode?.swatches ?? []).map((s, i) => (
            <div key={i} className="swatch-item">
              <div className="swatch-circle" style={{ backgroundColor: s.color }} />
              <span className="label muted">{s.name}</span>
            </div>
          ))}
        </div>

        {(c.dressCode?.avoid?.length ?? 0) > 0 && (
          <div className="reveal" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <p className="label muted" style={{ marginBottom: '1rem' }}>Por favor evita</p>
            <div className="swatches" style={{ justifyContent: 'center' }}>
              {c.dressCode!.avoid!.map((s, i) => (
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
      {(c.notes?.filter(Boolean).length ?? 0) > 0 && (
        <section className="section">
          <h2 className="section-heading reveal">Toma nota</h2>
          <div className="notes-list">
            {c.notes!.filter(Boolean).map((note, i) => (
              <div key={i} className={`note-item reveal delay-${i + 1}`}>
                <span className="note-dot" />
                <p className="note-text">{note}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── FOTOS 4 y 5 (dúo) ── */}
      {(c.images?.[3] || c.images?.[4]) && (
        <div className="photo-duo reveal">
          {c.images?.[3] && (
            <div className="photo-duo-item">
              <div className="photo-img--hover" style={{ width: '100%', height: '100%' }}>
                <img src={c.images[3]} alt="Foto de los novios" className="photo-img" />
              </div>
            </div>
          )}
          {c.images?.[4] && (
            <div className="photo-duo-item">
              <div className="photo-img--hover" style={{ width: '100%', height: '100%' }}>
                <img src={c.images[4]} alt="Foto de los novios" className="photo-img" />
              </div>
            </div>
          )}
        </div>
      )}

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

        <div className="gifts-grid">
          {/* Tarjeta transferencia bancaria */}
          <div className="gift-card reveal">
            <p className="label" style={{ letterSpacing: '0.2em', marginBottom: '1.25rem', color: '#9B8B78' }}>
              Transferencia Bancaria
            </p>
            {[
              { label: 'Banco', value: c.gifts?.bank },
              { label: 'Nombre', value: c.gifts?.holder },
              { label: 'No. de cuenta', value: c.gifts?.account },
              { label: 'CLABE', value: c.gifts?.clabe },
            ].map(({ label, value }) => (
              <div key={label} className="gift-row">
                <span className="gift-label">{label}</span>
                <span className="gift-value">{value}</span>
              </div>
            ))}
          </div>

          {/* Tarjeta mesa de regalos */}
          {c.gifts?.giftListUrl && (
            <div className="gift-card gift-card--list reveal delay-1">
              <GiftIcon />
              <p className="label" style={{ letterSpacing: '0.2em', margin: '1.25rem 0 0.5rem', color: '#9B8B78' }}>
                Mesa de Regalos
              </p>
              <p className="gift-value" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                {c.gifts.giftListLabel}
              </p>
              <a href={c.gifts.giftListUrl} target="_blank" rel="noopener noreferrer" className="btn-outline btn-outline--sm">
                Ver mesa de regalos →
              </a>
            </div>
          )}
        </div>
      </section>

      <Ornament />

      {/* ── NO NIÑOS ── */}
      {c.noChildren && (
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
        <p className="label muted reveal" style={{ marginBottom: '2.5rem' }}>
          Confirma tu asistencia antes del <strong style={{ color: '#1C1611' }}>{c.rsvpDeadline}</strong>
        </p>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp reveal">
          <WhatsAppIcon />
          Confirmar por WhatsApp
        </a>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <p className="footer-names">
          {c.couple?.person1} &amp; {c.couple?.person2}
        </p>
        <p className="label muted" style={{ marginTop: '0.5rem' }}>
          {c.date?.day} · {c.date?.month} · {c.date?.year} · {c.location}
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
    background-color: var(--dark, #14100c);
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
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    animation: heroFadeIn 1.2s cubic-bezier(0.16,1,0.3,1) both;
  }
  .hero-label { margin: 0; animation-delay: 0s; }
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
    font-size: clamp(2.25rem, 5.5vw, 3.5rem);
    font-weight: 300;
    font-style: italic;
    margin: 0 0 1rem;
    color: var(--charcoal);
  }
  /* Sección con fondo alterno */
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
    padding-left: max(2rem, calc((100vw - 860px) / 2));
    padding-right: max(2rem, calc((100vw - 860px) / 2));
  }

  /* ---------- Ornament ---------- */
  .ornament {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1rem 3rem;
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
  .itinerary {
    width: 100%;
    max-width: 460px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .itinerary-item {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    text-align: left;
  }

  /* Línea de tiempo vertical */
  .itinerary-timeline {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    padding-top: 1.75rem;
  }
  .itinerary-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--gold);
    border: 2px solid var(--ivory);
    outline: 1px solid var(--gold);
    flex-shrink: 0;
    z-index: 1;
  }
  .itinerary-line {
    width: 1px;
    flex: 1;
    min-height: 2rem;
    background: linear-gradient(to bottom, var(--gold), transparent);
    margin-top: 4px;
    opacity: 0.4;
  }

  /* Tarjeta de evento */
  .itinerary-card {
    flex: 1;
    background: #F0E9DF;
    border: 1px solid var(--muted);
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 0.75rem;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }
  .itinerary-card:hover {
    box-shadow: 0 8px 28px rgba(28,22,17,0.1);
    transform: translateY(-2px);
  }
  .itinerary-card-header {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 0.875rem 1.25rem;
    border-bottom: 1px solid var(--muted);
  }
  .itinerary-time {
    flex-shrink: 0;
    line-height: 1;
  }
  .time-h {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 2rem;
    font-weight: 300;
    color: var(--gold);
    line-height: 1;
  }
  .time-m {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.1rem;
    font-weight: 300;
    color: var(--gold);
  }
  .itinerary-name {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.2rem;
    font-weight: 400;
    color: var(--charcoal);
    margin: 0;
  }
  .itinerary-card-body {
    padding: 0.875rem 1.25rem;
  }
  .itinerary-venue {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: var(--charcoal);
    margin: 0 0 0.4rem;
  }
  .itinerary-address {
    display: flex;
    align-items: flex-start;
    gap: 0.35rem;
  }
  .itinerary-address span {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px;
    color: var(--muted-fg);
    line-height: 1.5;
  }

  /* ---------- Dress code gender ---------- */
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
  .dc-gender-text {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 13px;
    color: var(--muted-fg);
    line-height: 1.8;
    margin: 0;
  }

  /* ---------- No children ---------- */
  .no-children-block {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    background: #F0E9DF;
    border: 1px solid var(--muted);
    border-left: 3px solid var(--gold);
    border-radius: 12px;
    padding: 1.5rem 1.75rem;
    max-width: 480px;
    text-align: left;
  }
  .no-children-title {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.15rem;
    font-weight: 400;
    color: var(--charcoal);
    margin: 0 0 0.4rem;
  }
  .no-children-desc {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px;
    color: var(--muted-fg);
    line-height: 1.8;
    margin: 0;
  }

  /* ---------- Notes ---------- */
  .notes-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    max-width: 480px;
    text-align: left;
  }
  .note-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem 1.25rem;
    background: #F0E9DF;
    border: 1px solid var(--muted);
    border-radius: 10px;
  }
  .note-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--gold);
    flex-shrink: 0;
    margin-top: 5px;
  }
  .note-text {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 13px;
    color: var(--charcoal);
    line-height: 1.7;
    margin: 0;
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

  /* ---------- Photos ---------- */
  .photo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Hover animation compartido */
  .photo-img--hover {
    overflow: hidden;
    position: relative;
    cursor: default;
    transition: box-shadow 0.4s ease;
  }
  .photo-img--hover::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(184,150,90,0.18) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }
  .photo-img--hover:hover {
    box-shadow: 0 16px 48px rgba(28,22,17,0.2);
  }
  .photo-img--hover:hover::after { opacity: 1; }
  .photo-img--hover img {
    transition: transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .photo-img--hover:hover img { transform: scale(1.04); }

  /* Foto 2 — ancho completo */
  .photo-full {
    width: 100%;
    height: 520px;
    overflow: hidden;
  }
  .photo-full .photo-img--hover { width: 100%; height: 100%; }
  @media (max-width: 600px) { .photo-full { height: 300px; } }

  /* Foto 3 — centrada (ancho pantalla) */
  .photo-center {
    width: 100%;
    height: 600px;
    overflow: hidden;
  }
  .photo-center .photo-img--hover { width: 100%; height: 100%; }
  @media (max-width: 600px) { .photo-center { height: 400px; } }

  /* Fotos 4 y 5 — dúo ancho pantalla */
  .photo-duo {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    width: 100%;
  }
  .photo-duo-item {
    height: 480px;
    overflow: hidden;
  }
  @media (max-width: 600px) {
    .photo-duo-item { height: 260px; }
  }

  /* ---------- Hero image overlay ---------- */
  .hero-img-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(20,14,10,0.55) 0%,
      rgba(20,14,10,0.35) 50%,
      rgba(20,14,10,0.6) 100%
    );
    z-index: 0;
  }

  /* ---------- Gifts ---------- */
  .gifts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    width: 100%;
    max-width: 640px;
  }
  @media (max-width: 600px) {
    .gifts-grid { grid-template-columns: 1fr; }
  }
  .gift-card {
    width: 100%;
    background: #F0E9DF;
    border: 1px solid var(--muted);
    border-radius: 16px;
    padding: 2rem;
    text-align: left;
  }
  .gift-card--list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem 1.5rem;
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
    font-size: 13px;
    color: var(--muted-fg);
    flex-shrink: 0;
  }
  .gift-value {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 14px;
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
  .btn-outline--sm { padding: 0.625rem 1.5rem; font-size: 10px; }

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

  /* ---------- Mobile ---------- */
  @media (max-width: 480px) {
    .hero-meta { flex-direction: column; gap: 0.4rem; }
    .hero-meta-dot { display: none; }
    .section { padding: 4rem 1.5rem; }
    .dresscode-gender { grid-template-columns: 1fr; }
    .dc-gender-divider { width: 80%; height: 1px; margin: 0.5rem auto; }
    .dc-gender-divider.vertical { width: 80%; height: 1px; }
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
