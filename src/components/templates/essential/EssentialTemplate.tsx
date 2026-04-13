'use client';

import { Cormorant_Garamond, Playfair_Display, EB_Garamond, Jost, Raleway, Montserrat } from 'next/font/google';
import { useEffect } from 'react';
import { cld, T } from '@/lib/cloudinary';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
});
const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-eb-garamond',
});
const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
});
const raleway = Raleway({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-raleway',
});
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-montserrat',
});

const DISPLAY_FONT_VAR: Record<string, string> = {
  cormorant:     'var(--font-cormorant)',
  playfair:      'var(--font-playfair)',
  'eb-garamond': 'var(--font-eb-garamond)',
};
const BODY_FONT_VAR: Record<string, string> = {
  jost:       'var(--font-jost)',
  raleway:    'var(--font-raleway)',
  montserrat: 'var(--font-montserrat)',
};

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
  noChildrenMessage?: string;
  rsvpDeadline?: string;
  sections?: {
    quote?: boolean;
    parents?: boolean;
    dressCode?: boolean;
    notes?: boolean;
    gifts?: boolean;
  };
  theme?: {
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    displayFont?: 'cormorant' | 'playfair' | 'eb-garamond';
    bodyFont?: 'jost' | 'raleway' | 'montserrat';
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function EssentialTemplate({ config = {} }: { config?: EssentialConfig }) {
  const c = config;
  const t = c.theme ?? {};

  const accentColor      = t.accentColor      ?? '#B8965A';
  const backgroundColor  = t.backgroundColor  ?? '#F8F3EC';
  const textColor        = t.textColor        ?? '#1C1611';
  const displayFontVar   = DISPLAY_FONT_VAR[t.displayFont ?? 'cormorant'] ?? 'var(--font-cormorant)';

  // Visibility flags — combine sections toggle with data presence
  const sec           = c.sections ?? {};
  const hasQuote      = sec.quote    === true && !!(c.quote?.text);
  const hasParents    = sec.parents  === true && !!(c.fullNames?.person1 || c.fullNames?.person2 || c.parents?.person1 || c.parents?.person2);
  const hasItinerary  = (c.itinerary?.length ?? 0) > 0;
  const hasDressCode  = sec.dressCode === true;
  const hasNotes      = sec.notes    === true && (c.notes?.filter(Boolean).length ?? 0) > 0;
  const hasGifts      = sec.gifts    === true;
  const bodyFontVar      = BODY_FONT_VAR[t.bodyFont ?? 'jost']            ?? 'var(--font-jost)';

  const allFontVars = [
    cormorant.variable, playfair.variable, ebGaramond.variable,
    jost.variable, raleway.variable, montserrat.variable,
  ].join(' ');

  // Las font vars DEBEN estar en el mismo elemento que el className de next/font
  const rootStyle = {
    '--font-display': displayFontVar,
    '--font-body':    bodyFontVar,
  } as React.CSSProperties;

  // CSS dinámico que sobreescribe los tokens del CSS estático por orden de documento
  // (mismo selector = misma especificidad, pero va después → gana en cascada)
  const dynamicCss = `
    .essential-root {
      --ivory:   ${backgroundColor};
      --charcoal: ${textColor};
      --gold:    ${accentColor};
      background-color: ${backgroundColor};
      color: ${textColor};
    }
  `;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.reveal, .reveal--image, .reveal--slide-left').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const waUrl = `https://wa.me/${c.whatsapp?.number ?? ''}?text=${encodeURIComponent(c.whatsapp?.message ?? '')}`;
  // Nuevo modelo: photos[]. Fallback al modelo antiguo (images[0]).
  const heroEntry = (c as { photos?: { url: string; role: string | null; objectPosition?: string }[] }).photos?.find(p => p.role === 'hero');
  const heroImage: string | null = heroEntry?.url ?? c.images?.[0] ?? null;
  const heroObjectPosition = heroEntry?.objectPosition ?? 'center center';

  return (
    <div className={`${allFontVars} essential-root`} style={rootStyle}>
      <style suppressHydrationWarning>{css}</style>
      <style suppressHydrationWarning>{dynamicCss}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          {heroImage && (
            <picture style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <source media="(max-width: 768px)" srcSet={cld(heroImage, T.heroMobile)} />
              <source media="(min-width: 769px)" srcSet={cld(heroImage, T.heroDesktop)} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cld(heroImage, T.heroDesktop)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: heroObjectPosition }} />
            </picture>
          )}
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-label">{c.heroLabel}</p>
          <h1 className="hero-names">
            <span className="hero-name-1">{c.couple?.person1}</span>
            <span className="hero-amp">&</span>
            <span className="hero-name-2">{c.couple?.person2}</span>
          </h1>
          <div className="hero-divider-line" />
          <div className="hero-meta">
            <span className="hero-meta-text">{c.date?.day} · {c.date?.month} · {c.date?.year}</span>
            <span className="hero-meta-dot" />
            <span className="hero-meta-text hero-meta-location">{c.location}</span>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span className="scroll-label">Desliza</span>
          <div className="scroll-bar"><div className="scroll-thumb" /></div>
        </div>
      </section>

      {/* ── CITA ── */}
      {hasQuote && (
        <>
          <section className="section section--left reveal">
            <div className="quote-mark">"</div>
            <p className="quote-text">{c.quote?.text}</p>
            <div className="quote-attribution">
              <span className="quote-ref">{c.quote?.reference}</span>
            </div>
          </section>
          <Ornament />
        </>
      )}

      {/* ── NOMBRES Y PADRES ── */}
      {hasParents && (
        <section className="section">
          <div className="parents-header reveal">
            <span className="sep-line" />
            <p className="label muted parents-header-label">Con la bendición de nuestras familias</p>
            <span className="sep-line" />
          </div>
          <div className="parents-grid">
            <div className="reveal delay-1 text-center">
              <p className="display-name">{c.fullNames?.person1}</p>
              <div className="name-sep"><span className="sep-line short" /></div>
              <p className="label muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                Hija de<br />{c.parents?.person1}
              </p>
            </div>
            <div className="parents-symbol reveal delay-2">✦</div>
            <div className="reveal delay-2 text-center">
              <p className="display-name">{c.fullNames?.person2}</p>
              <div className="name-sep"><span className="sep-line short" /></div>
              <p className="label muted" style={{ whiteSpace: 'pre-line', lineHeight: '1.8' }}>
                Hijo de<br />{c.parents?.person2}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── FOTO 2 (ancho completo) ── */}
      {c.images?.[1] && (
        <div className="photo-full reveal--image">
          <picture style={{ width: '100%', height: '100%', display: 'block' }}>
            <source media="(max-width: 768px)" srcSet={cld(c.images[1], T.fullMobile)} />
            <source media="(min-width: 769px)" srcSet={cld(c.images[1], T.fullDesktop)} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cld(c.images[1], T.fullDesktop)} alt="Foto de los novios" className="photo-img photo-img--hover" />
          </picture>
          {c.location && (
            <div className="photo-full-caption">
              <span className="sep-line" style={{ maxWidth: '48px', flex: 'none' }} />
              <span className="photo-caption-text">{c.location}</span>
            </div>
          )}
        </div>
      )}

      {(hasParents || !!c.images?.[1]) && <Ornament />}

      {/* ── ITINERARIO ── */}
      {hasItinerary && (
        <section className="section section--wide">
          <h2 className="section-heading section-heading--display reveal">Programa del Día</h2>
          <div className="itinerary">
            {(c.itinerary ?? []).map((item, i) => {
              const [h, m] = item.time.split(':');
              const isLast = i === (c.itinerary?.length ?? 1) - 1;
              return (
                <div key={i} className={`itinerary-item reveal--slide-left delay-${i + 1}`}>
                  <div className="itinerary-timeline">
                    <div className="itinerary-dot" />
                    {!isLast && <div className="itinerary-line" />}
                  </div>
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
      )}

      {/* ── FOTO 3 (ancho pantalla) ── */}
      {c.images?.[2] && (
        <div className="photo-center reveal--image">
          <picture style={{ width: '100%', height: '100%', display: 'block' }}>
            <source srcSet={cld(c.images[2], T.centered)} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cld(c.images[2], T.centered)} alt="Foto de los novios" className="photo-img photo-img--hover" />
          </picture>
        </div>
      )}

      {hasDressCode && <Ornament />}

      {/* ── DRESS CODE ── */}
      {hasDressCode && (
        <section className="section section--wide">
          <h2 className="section-heading section-heading--display reveal">Dress Code</h2>
          <p className="dresscode-label reveal">{c.dressCode?.label}</p>

          <div className="dresscode-gender reveal">
            <div className="dc-gender-block">
              <div className="dc-gender-icon"><WomenIcon /></div>
              <p className="dc-gender-label-text">Ellas</p>
              <p className="dc-gender-text">{c.dressCode?.women}</p>
            </div>
            <div className="dc-gender-divider" />
            <div className="dc-gender-block">
              <div className="dc-gender-icon"><MenIcon /></div>
              <p className="dc-gender-label-text">Ellos</p>
              <p className="dc-gender-text">{c.dressCode?.men}</p>
            </div>
          </div>

          <div className="swatches reveal" style={{ marginTop: '2.5rem' }}>
            {(c.dressCode?.swatches ?? []).map((s, i) => (
              <div key={i} className="swatch-item">
                <div className="swatch-circle" style={{ backgroundColor: s.color }} />
                <span className="label muted">{s.name}</span>
              </div>
            ))}
          </div>

          {(c.dressCode?.avoid?.length ?? 0) > 0 && (
            <div className="reveal" style={{ marginTop: '2rem', textAlign: 'center' }}>
              <p className="label muted" style={{ marginBottom: '1.25rem' }}>Por favor evita</p>
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
      )}

      {hasDressCode && <Ornament />}

      {/* ── INDICACIONES ── */}
      {hasNotes && (
        <section className="section section--left">
          <h2 className="section-heading reveal">Toma nota</h2>
          <div className="notes-list">
            {c.notes!.filter(Boolean).map((note, i) => (
              <div key={i} className={`note-item reveal delay-${i + 1}`}>
                <span className="note-counter">{String(i + 1).padStart(2, '0')}</span>
                <p className="note-text">{note}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── FOTOS 4 y 5 (dúo) ── */}
      {(c.images?.[3] || c.images?.[4]) && (
        <div className="photo-duo reveal--image">
          {c.images?.[3] && (
            <div className="photo-duo-item photo-duo-item--large">
              <picture style={{ width: '100%', height: '100%', display: 'block' }}>
                <source srcSet={cld(c.images[3], T.duo)} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cld(c.images[3], T.duo)} alt="Foto de los novios" className="photo-img photo-img--hover" />
              </picture>
            </div>
          )}
          {c.images?.[4] && (
            <div className="photo-duo-item photo-duo-item--small">
              <picture style={{ width: '100%', height: '100%', display: 'block' }}>
                <source srcSet={cld(c.images[4], T.duo)} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cld(c.images[4], T.duo)} alt="Foto de los novios" className="photo-img photo-img--hover" />
              </picture>
            </div>
          )}
        </div>
      )}

      {hasGifts && <Ornament />}

      {/* ── REGALOS ── */}
      {hasGifts && (
        <section className="section">
          <h2 className="section-heading section-heading--display reveal">Mesa de Regalos</h2>
          <p className="label muted reveal" style={{ maxWidth: '360px', lineHeight: '1.9', marginBottom: '2.5rem' }}>
            Tu presencia es el mejor regalo. Si deseas obsequiarnos algo, aquí encontrarás nuestras opciones.
          </p>

          <div className="gifts-grid">
            {(c.gifts?.bank || c.gifts?.holder || c.gifts?.account || c.gifts?.clabe) && (
              <div className="gift-card reveal">
                <p className="gift-card-title">Transferencia Bancaria</p>
                {[
                  { label: 'Banco', value: c.gifts?.bank },
                  { label: 'Nombre', value: c.gifts?.holder },
                  { label: 'No. de cuenta', value: c.gifts?.account },
                  { label: 'CLABE', value: c.gifts?.clabe },
                ].filter(({ value }) => value).map(({ label, value }) => (
                  <div key={label} className="gift-row">
                    <span className="gift-label">{label}</span>
                    <span className="gift-value">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {c.gifts?.giftListUrl && (
              <div className="gift-card gift-card--list reveal delay-1">
                <GiftIcon />
                <p className="gift-card-title" style={{ marginTop: '1.25rem', textAlign: 'center' }}>Mesa de Regalos</p>
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
      )}

      {c.noChildren && <Ornament />}

      {/* ── NO NIÑOS ── */}
      {c.noChildren && (
        <section className="section">
          <div className="no-children-block reveal">
            <NoChildrenIcon />
            <div>
              <p className="no-children-title">Evento solo para adultos</p>
              <p className="no-children-desc">
                {c.noChildrenMessage || 'Con todo nuestro cariño, les pedimos que esta celebración sea exclusiva para adultos. Agradecemos su comprensión.'}
              </p>
            </div>
          </div>
        </section>
      )}

      <Ornament />

      {/* ── RSVP ── */}
      <section className="section section--left rsvp-section">
        <h2 className="section-heading--display rsvp-heading reveal">
          ¿Nos<br />acompañas?
        </h2>
        {c.rsvpDeadline && (
          <div className="rsvp-deadline reveal delay-1">
            <span className="label muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Confirma antes del</span>
            <strong className="rsvp-date">{c.rsvpDeadline}</strong>
          </div>
        )}
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp reveal delay-2">
          <WhatsAppIcon />
          <span>Confirmar asistencia</span>
        </a>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <p className="label muted footer-year">{c.date?.year}</p>
        <p className="footer-names">
          {c.couple?.person1} <span className="footer-amp">&</span> {c.couple?.person2}
        </p>
        <p className="label muted" style={{ marginTop: '0.75rem' }}>
          {c.date?.day} · {c.date?.month} · {c.date?.year} · {c.location}
        </p>
        <p className="footer-powered">
          Creado con <span className="footer-brand">Moments</span>
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
      <svg width="16" height="16" viewBox="0 0 16 16">
        <rect x="8" y="0" width="8" height="8" transform="rotate(45 8 0)" fill="var(--gold, #B8965A)" opacity="0.65" />
      </svg>
      <span className="sep-line" />
    </div>
  );
}

function WomenIcon() {
  return (
    <svg width="30" height="40" viewBox="0 0 30 40" fill="none">
      <path d="M11 1 L9 7" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M19 1 L21 7" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M9 7 Q15 5 21 7" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M9 7 L8 17" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M21 7 L22 17" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M8 17 L22 17" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M8 17 L2 39" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M22 17 L28 39" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M2 39 L28 39" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function MenIcon() {
  return (
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
      <path d="M16 3 L8 9 L5 7 L4 39 L16 39" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M16 3 L24 9 L27 7 L28 39 L16 39" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M8 9 L13 19 L16 13" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M24 9 L19 19 L16 13" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M15 19 L14 27 L16 30 L18 27 L17 19 Z" stroke="var(--gold, #B8965A)" strokeWidth="1.1" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function NoChildrenIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="24" cy="24" r="22" stroke="var(--gold, #B8965A)" strokeWidth="1.4" />
      <circle cx="24" cy="16" r="5" stroke="var(--gold, #B8965A)" strokeWidth="1.4" />
      <path d="M13 36c0-6.075 4.925-11 11-11s11 4.925 11 11" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="8" x2="40" y2="40" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
      <path d="M12 2C8.686 2 6 4.686 6 8c0 4.418 6 12 6 12s6-7.582 6-12c0-3.314-2.686-6-6-6z" stroke="var(--gold, #B8965A)" strokeWidth="1.6" />
      <circle cx="12" cy="8" r="2" stroke="var(--gold, #B8965A)" strokeWidth="1.6" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="5" y="17" width="30" height="18" rx="2" stroke="var(--gold, #B8965A)" strokeWidth="1.4" />
      <rect x="10" y="11" width="20" height="7" rx="1.5" stroke="var(--gold, #B8965A)" strokeWidth="1.4" />
      <path d="M20 11v24" stroke="var(--gold, #B8965A)" strokeWidth="1.4" />
      <path d="M20 11c0 0-4-6 0-6s4 6 0 6" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M20 11c0 0 4-6 0-6" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinecap="round" />
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
  /* ---------- Tokens — definidos en .essential-root para que el inline style los sobreescriba sin conflicto ---------- */
  .essential-root {
    --ivory:      #F8F3EC;
    --charcoal:   #1C1611;
    --gold:       #B8965A;
    --muted:      color-mix(in srgb, var(--ivory) 85%, var(--charcoal));
    --muted-fg:   color-mix(in srgb, var(--ivory) 45%, var(--charcoal));
    --tinted:     color-mix(in srgb, var(--ivory) 93%, var(--charcoal));
    --cream-deep: color-mix(in srgb, var(--ivory) 80%, var(--charcoal));
    --gold-light: color-mix(in srgb, var(--gold) 30%, white);
    --gold-dim:   color-mix(in srgb, var(--gold) 12%, var(--ivory));
    --section-gap: clamp(3rem, 5vw, 4.5rem);
    background-image:
      radial-gradient(circle, color-mix(in srgb, var(--gold) 14%, transparent) 0.7px, transparent 0.7px);
    background-size: 28px 28px;
  }

  /* ---------- Shared helpers ---------- */
  .label {
    font-family: var(--font-body);
    font-size: 11px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 400;
  }
  .gold  { color: var(--gold); }
  .muted { color: var(--muted-fg); }
  .text-center { text-align: center; }

  .sep-line {
    display: block;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    flex: 1;
  }
  .sep-line.short { max-width: 48px; flex: none; }

  /* ---------- Scroll reveal ---------- */
  .reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1),
                transform 0.75s cubic-bezier(0.16,1,0.3,1);
  }
  .reveal.is-visible { opacity: 1; transform: translateY(0); }

  .reveal--image {
    opacity: 0;
    transform: translateY(40px) scale(0.98);
    transition: opacity 1.1s cubic-bezier(0.16,1,0.3,1),
                transform 1.1s cubic-bezier(0.16,1,0.3,1);
  }
  .reveal--image.is-visible { opacity: 1; transform: translateY(0) scale(1); }

  .reveal--slide-left {
    opacity: 0;
    transform: translateX(-32px);
    transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1),
                transform 0.8s cubic-bezier(0.16,1,0.3,1);
  }
  .reveal--slide-left.is-visible { opacity: 1; transform: translateX(0); }

  .delay-1 { transition-delay: 0.1s; }
  .delay-2 { transition-delay: 0.2s; }
  .delay-3 { transition-delay: 0.3s; }
  .delay-4 { transition-delay: 0.4s; }
  .delay-5 { transition-delay: 0.5s; }

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
    background-color: #14100c;
    z-index: 0;
    overflow: hidden;
    animation: heroZoom 14s ease-in-out infinite alternate;
  }
  @keyframes heroZoom {
    from { transform: scale(1.04); }
    to   { transform: scale(1.09); }
  }
  .hero-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to bottom, rgba(20,14,10,0.3) 0%, rgba(20,14,10,0.08) 35%, rgba(20,14,10,0.82) 100%),
      radial-gradient(ellipse 80% 80% at center, transparent 40%, rgba(20,14,10,0.45) 100%);
    z-index: 1;
  }

  /* Animated gold line — sweeps in on load */
  .hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: var(--gold);
    transform-origin: left;
    animation: heroLine 0.7s cubic-bezier(0.16,1,0.3,1) 0s both;
    z-index: 3;
  }
  @keyframes heroLine {
    from { transform: scaleX(0); opacity: 0; }
    to   { transform: scaleX(1); opacity: 1; }
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
    gap: 1.5rem;
  }

  /* 5-phase staggered hero animations */
  .hero-label {
    font-family: var(--font-body);
    font-size: clamp(13px, 1.8vw, 16px);
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--gold);
    margin: 0;
    font-style: italic;
    opacity: 0;
    animation: heroFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s both;
  }
  .hero-names {
    font-family: var(--font-display);
    font-size: clamp(56px, 13vw, 140px);
    font-weight: 300;
    font-style: italic;
    letter-spacing: -0.025em;
    line-height: 0.95;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.05em;
  }
  .hero-name-1 {
    opacity: 0;
    animation: heroFadeUp 1.4s cubic-bezier(0.16,1,0.3,1) 0.7s both;
  }
  .hero-amp {
    font-size: 0.35em;
    color: var(--gold);
    line-height: 1.3;
    opacity: 0;
    animation: heroFadeUp 1.4s cubic-bezier(0.16,1,0.3,1) 0.75s both;
  }
  .hero-name-2 {
    opacity: 0;
    animation: heroFadeUp 1.4s cubic-bezier(0.16,1,0.3,1) 0.8s both;
  }
  .hero-divider-line {
    width: 40px;
    height: 1px;
    background: var(--gold);
    opacity: 0;
    animation: heroFadeUp 0.8s ease 1.1s both;
  }
  .hero-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
    opacity: 0;
    animation: heroFadeUp 0.9s cubic-bezier(0.16,1,0.3,1) 1.1s both;
  }
  .hero-meta-text {
    font-family: var(--font-body);
    font-size: 11px;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.75);
  }
  .hero-meta-dot {
    width: 3px; height: 3px;
    border-radius: 50%;
    background: var(--gold);
    opacity: 0.6;
    flex-shrink: 0;
  }

  @keyframes heroFadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Scroll indicator */
  .hero-scroll-indicator {
    position: absolute;
    bottom: 2.5rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    z-index: 2;
    opacity: 0;
    animation: heroFadeUp 1s ease 1.6s both;
  }
  .scroll-label {
    font-family: var(--font-body);
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
  }
  .scroll-bar {
    width: 1px;
    height: 48px;
    background: rgba(255,255,255,0.15);
    overflow: hidden;
  }
  .scroll-thumb {
    width: 100%;
    height: 50%;
    background: rgba(255,255,255,0.5);
    animation: scrollDown 1.6s ease-in-out infinite;
  }
  @keyframes scrollDown {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(200%); }
  }

  /* ---------- Sections ---------- */
  .section {
    max-width: 680px;
    margin: 0 auto;
    padding: var(--section-gap) 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .section--left {
    align-items: flex-start;
    text-align: left;
  }
  .section--wide {
    max-width: 860px;
  }
  .section--tinted {
    /* kept for legacy — background removed for unified single-color design */
  }

  /* ---------- Section headings ---------- */
  .section-heading {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 300;
    font-style: italic;
    letter-spacing: -0.02em;
    line-height: 0.95;
    margin: 0 0 1.25rem;
    color: var(--charcoal);
  }
  .section-heading--display {
    font-family: var(--font-display);
    font-size: clamp(3.5rem, 9vw, 7.5rem);
    font-weight: 300;
    font-style: italic;
    letter-spacing: -0.03em;
    line-height: 0.92;
    margin: 0 0 1.5rem;
    color: var(--charcoal);
  }

  /* ---------- Ornament ---------- */
  .ornament {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 2.5rem 3rem;
    max-width: 360px;
    margin: 0 auto;
  }
  .ornament .sep-line { max-width: 120px; }

  /* ---------- Quote ---------- */
  .quote-mark {
    font-family: var(--font-display);
    font-size: clamp(8rem, 18vw, 14rem);
    line-height: 0.7;
    color: var(--gold);
    opacity: 0.25;
    margin-bottom: -1rem;
    margin-top: -2rem;
    user-select: none;
  }
  .quote-text {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 4vw, 2.25rem);
    font-style: italic;
    font-weight: 300;
    line-height: 1.45;
    color: var(--charcoal);
    margin: 0 0 2rem;
  }
  .quote-attribution {
    display: flex;
    align-items: center;
    border-left: 2px solid var(--gold);
    padding-left: 1.25rem;
  }
  .quote-ref {
    font-family: var(--font-body);
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted-fg);
  }

  /* ---------- Parents ---------- */
  .parents-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
    margin-bottom: 3.5rem;
  }
  .parents-header-label {
    white-space: nowrap;
    flex-shrink: 0;
  }
  .parents-grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 2rem;
    width: 100%;
    align-items: start;
  }
  .parents-symbol {
    font-family: serif;
    color: var(--gold);
    font-size: 1.25rem;
    flex-shrink: 0;
    padding: 0 0.5rem;
    align-self: center;
  }
  .display-name {
    font-family: var(--font-display);
    font-size: clamp(1.2rem, 3vw, 1.75rem);
    font-weight: 400;
    font-style: italic;
    color: var(--charcoal);
    margin: 0;
  }
  .name-sep { display: flex; justify-content: center; margin: 0.75rem 0; }
  @media (max-width: 600px) {
    .parents-grid { grid-template-columns: 1fr; }
    .parents-symbol { display: none; }
  }

  /* ---------- Itinerary ---------- */
  .itinerary {
    width: 100%;
    max-width: 580px;
    display: flex;
    flex-direction: column;
  }
  .itinerary-item {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    text-align: left;
  }
  .itinerary-timeline {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    padding-top: 1.5rem;
  }
  .itinerary-dot {
    width: 10px; height: 10px;
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
    min-height: 2.5rem;
    background: linear-gradient(to bottom, var(--gold), transparent);
    margin-top: 4px;
    opacity: 0.35;
  }
  .itinerary-card {
    flex: 1;
    background: transparent;
    border: 1px solid var(--muted);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 1rem;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }
  .itinerary-card:hover {
    box-shadow: 0 8px 32px rgba(28,22,17,0.1);
    transform: translateY(-2px);
  }
  .itinerary-card-header {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--muted);
  }
  .itinerary-time { flex-shrink: 0; line-height: 1; }
  .time-h {
    font-family: var(--font-display);
    font-size: 2.75rem;
    font-weight: 300;
    color: var(--gold);
    line-height: 1;
  }
  .time-m {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 300;
    color: var(--gold);
  }
  .itinerary-name {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 400;
    color: var(--charcoal);
    margin: 0;
  }
  .itinerary-card-body { padding: 0.875rem 1.25rem; }
  .itinerary-venue {
    font-family: var(--font-body);
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
    font-family: var(--font-body);
    font-size: 12px;
    color: var(--muted-fg);
    line-height: 1.5;
  }

  /* ---------- Photos ---------- */
  .photo-img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }
  .photo-img--hover {
    overflow: hidden;
    position: relative;
    cursor: default;
    transition: box-shadow 0.4s ease;
    width: 100%; height: 100%;
    display: block;
  }
  .photo-img--hover::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(184,150,90,0.15) 0%, transparent 60%);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }
  .photo-img--hover:hover { box-shadow: 0 20px 60px rgba(28,22,17,0.22); }
  .photo-img--hover:hover::after { opacity: 1; }
  .photo-img--hover img {
    transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94);
  }
  .photo-img--hover:hover img { transform: scale(1.04); }

  /* Foto 2 */
  .photo-full {
    width: 100%;
    height: clamp(380px, 55vw, 640px);
    overflow: hidden;
    position: relative;
  }
  .photo-full-caption {
    position: absolute;
    bottom: 0; right: 0;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    opacity: 0.7;
  }
  .photo-caption-text {
    font-family: var(--font-body);
    font-size: 9px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #fff;
  }
  @media (max-width: 600px) {
    .photo-full { height: clamp(240px, 55vw, 360px); }
  }

  /* Foto 3 */
  .photo-center {
    width: 100%;
    height: clamp(440px, 65vw, 720px);
    overflow: hidden;
    position: relative;
  }
  .photo-center::before,
  .photo-center::after {
    content: '';
    position: absolute;
    top: 50%; transform: translateY(-50%);
    width: 1px; height: 80px;
    background: var(--gold);
    opacity: 0.45;
    z-index: 2;
  }
  .photo-center::before { left: 1.5rem; }
  .photo-center::after  { right: 1.5rem; }
  @media (max-width: 600px) {
    .photo-center { height: clamp(300px, 65vw, 440px); }
  }

  /* Fotos dúo */
  .photo-duo {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2px;
    width: 100%;
  }
  .photo-duo-item {
    height: clamp(240px, 38vw, 480px);
    overflow: hidden;
  }
  @media (max-width: 600px) {
    .photo-duo-item { height: clamp(160px, 40vw, 240px); }
  }

  /* ---------- Dress code ---------- */
  .dresscode-label {
    font-family: var(--font-display);
    font-size: clamp(1.25rem, 3.5vw, 1.875rem);
    font-style: italic;
    color: var(--gold);
    margin: 0 0 2rem;
    font-weight: 300;
  }
  .dresscode-gender {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 1.5rem;
    width: 100%;
    max-width: 540px;
    align-items: start;
    text-align: left;
  }
  .dc-gender-block { display: flex; flex-direction: column; align-items: flex-start; }
  .dc-gender-icon  { margin-bottom: 0.75rem; }
  .dc-gender-label-text {
    font-family: var(--font-display);
    font-size: 1.1rem;
    font-style: italic;
    color: var(--gold);
    margin: 0 0 0.4rem;
    font-weight: 300;
  }
  .dc-gender-divider { width: 1px; background: var(--muted); align-self: stretch; }
  .dc-gender-text {
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--muted-fg);
    line-height: 1.8;
    margin: 0;
  }
  @media (max-width: 560px) {
    .dresscode-gender {
      grid-template-columns: 1fr;
      gap: 0; max-width: 340px; text-align: center;
    }
    .dc-gender-block { align-items: center; padding: 1.5rem 0; }
    .dc-gender-block:first-child { padding-top: 0; }
    .dc-gender-divider { width: 60%; height: 1px; margin: 0 auto; align-self: auto; }
  }

  /* ---------- Swatches ---------- */
  .swatches {
    display: flex;
    gap: 1.75rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .swatch-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .swatch-item:hover { transform: translateY(-8px); }
  .swatch-circle {
    width: 64px; height: 64px;
    border-radius: 50%;
    border: 1px solid var(--muted);
    box-shadow: 0 4px 16px rgba(28,22,17,0.1);
  }
  .swatch-avoid { border-color: #d4a5a5; opacity: 0.65; }

  /* ---------- Notes ---------- */
  .notes-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 540px;
  }
  .note-item {
    display: flex;
    align-items: baseline;
    gap: 1.25rem;
    padding: 1.25rem 0;
    border-top: 1px solid var(--muted);
  }
  .note-item:last-child { border-bottom: 1px solid var(--muted); }
  .note-counter {
    font-family: var(--font-display);
    font-size: 3rem;
    font-weight: 300;
    font-style: italic;
    color: var(--charcoal);
    opacity: 0.12;
    line-height: 1;
    flex-shrink: 0;
    user-select: none;
  }
  .note-text {
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--charcoal);
    line-height: 1.75;
    margin: 0;
  }

  /* ---------- No children ---------- */
  .no-children-block {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    background: var(--gold-dim);
    border: 1px solid color-mix(in srgb, var(--gold) 20%, transparent);
    border-radius: 12px;
    padding: 1.5rem 1.75rem;
    max-width: 480px;
    text-align: left;
  }
  .no-children-title {
    font-family: var(--font-display);
    font-size: 1.15rem;
    font-weight: 400;
    color: var(--charcoal);
    margin: 0 0 0.4rem;
  }
  .no-children-desc {
    font-family: var(--font-body);
    font-size: 12px;
    color: var(--muted-fg);
    line-height: 1.8;
    margin: 0;
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
    background: transparent;
    border: 1px solid var(--muted);
    border-top: 2px solid var(--gold);
    border-radius: 4px;
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
  .gift-card-title {
    font-family: var(--font-body);
    font-size: 9px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted-fg);
    margin: 0 0 1.25rem;
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
    font-family: var(--font-body);
    font-size: 12px;
    color: var(--muted-fg);
    flex-shrink: 0;
  }
  .gift-value {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    color: var(--charcoal);
    text-align: right;
  }

  /* ---------- RSVP ---------- */
  .rsvp-section {
    padding-left: max(2rem, calc((100vw - 680px) / 2));
    padding-right: max(2rem, calc((100vw - 680px) / 2));
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  .rsvp-heading {
    color: var(--charcoal);
    margin-bottom: 2rem;
    font-size: clamp(4rem, 12vw, 10rem);
  }
  .rsvp-deadline {
    margin-bottom: 2.5rem;
  }
  .rsvp-date {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-style: italic;
    font-weight: 300;
    color: var(--charcoal);
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
    font-family: var(--font-body);
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-decoration: none;
    transition: background 0.2s, color 0.2s;
  }
  .btn-outline:hover { background: var(--gold); color: #fff; }
  .btn-outline--sm { padding: 0.625rem 1.5rem; font-size: 10px; }

  .btn-whatsapp {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.875rem;
    padding: 1.1rem 2.5rem;
    width: 100%;
    max-width: 440px;
    background: #25D366;
    color: #fff;
    font-family: var(--font-body);
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    text-decoration: none;
    overflow: hidden;
    border-radius: 4px;
    transition: box-shadow 0.3s ease, transform 0.2s ease;
  }
  .btn-whatsapp::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.15);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
  }
  .btn-whatsapp:hover::before { transform: scaleX(1); }
  .btn-whatsapp:hover {
    box-shadow: 0 12px 36px rgba(37,211,102,0.3);
    transform: translateY(-2px);
  }
  .btn-whatsapp span { position: relative; z-index: 1; }

  /* ---------- Footer ---------- */
  .footer {
    text-align: center;
    padding: calc(var(--section-gap) * 1.2) 2rem calc(var(--section-gap) * 0.8);
    border-top: 1px solid transparent;
    border-image: linear-gradient(90deg, transparent, var(--gold) 30%, var(--gold) 70%, transparent) 1;
  }
  .footer-year {
    display: block;
    margin-bottom: 0.75rem;
  }
  .footer-names {
    font-family: var(--font-display);
    font-size: clamp(1.5rem, 4vw, 2.75rem);
    font-style: italic;
    font-weight: 300;
    letter-spacing: -0.02em;
    color: var(--charcoal);
    margin: 0;
    line-height: 1;
  }
  .footer-amp {
    color: var(--gold);
  }
  .footer-powered {
    font-family: var(--font-body);
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--muted-fg);
    opacity: 0.5;
    margin-top: 2rem;
  }
  .footer-brand {
    color: var(--gold);
    opacity: 1;
  }

  /* ---------- Mobile adjustments ---------- */
  @media (max-width: 480px) {
    :root { --section-gap: 2.5rem; }
    .hero-meta { flex-direction: column; gap: 0.4rem; }
    .hero-meta-dot { display: none; }
    .section {
      padding: 2.5rem 1.25rem;
      max-width: 100%;
    }
    .section--left { padding-left: 1.25rem; padding-right: 1.25rem; }
    .section--wide { max-width: 100%; padding-left: 1.25rem; padding-right: 1.25rem; }
    .section-heading--display { font-size: clamp(2.5rem, 10vw, 4rem); }
    .rsvp-heading { font-size: clamp(3rem, 13vw, 5rem); }
    .quote-mark { font-size: clamp(5rem, 18vw, 8rem); margin-top: -1rem; }
    .quote-text { font-size: clamp(1.2rem, 5vw, 1.6rem); }
    .dresscode-gender { max-width: 100%; }
    .rsvp-section { padding-left: 1.25rem; padding-right: 1.25rem; }
    .ornament { padding: 1.5rem 2rem; }
    .parents-header { gap: 0.75rem; }
    .hero-scroll-indicator { bottom: 1.75rem; }
    .gifts-grid { grid-template-columns: 1fr; }
    .swatches { gap: 1.25rem; }
    .swatch-circle { width: 52px; height: 52px; }
    .footer-names { font-size: clamp(1.25rem, 7vw, 1.75rem); }
    .itinerary { max-width: 100%; }
    .notes-list { max-width: 100%; }
  }
`;
