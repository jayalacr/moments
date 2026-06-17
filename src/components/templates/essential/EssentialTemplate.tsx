'use client';

import { Cormorant_Garamond, Playfair_Display, EB_Garamond, Jost, Raleway, Montserrat } from 'next/font/google';
import { useEffect } from 'react';
import { cld, T } from '@/lib/cloudinary';
import ContentProtection from '@/components/templates/shared/ContentProtection';
import './essential.css';

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
    giftTypes?: string[];
    envelopeMessage?: string;
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
export default function EssentialTemplate({ config = {} }: { config?: EssentialConfig; plan?: import('@/lib/plans').EventPlan }) {
  const c = config;
  const t = c.theme ?? {};

  const accentColor      = t.accentColor      ?? '#B8965A';
  const backgroundColor  = t.backgroundColor  ?? '#F8F3EC';
  const textColor        = t.textColor        ?? '#1C1611';
  const displayFontVar   = DISPLAY_FONT_VAR[t.displayFont ?? 'cormorant'] ?? 'var(--font-cormorant)';

  const splitParent = (s: string) => {
    const lines = s.split('\n').map(l => l.replace(/\s*&\s*$/, '').trim()).filter(Boolean);
    if (lines.length < 2) return lines;
    const out: string[] = [lines[0]];
    for (let i = 1; i < lines.length; i++) { out.push('&'); out.push(lines[i]); }
    return out;
  };
  const parentLines1 = splitParent(c.parents?.person1 || '');
  const parentLines2 = splitParent(c.parents?.person2 || '');

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

  // Tokens de color + fuentes como CSS custom properties inline → presentes en SSR, sin hydration mismatch
  const rootStyle = {
    '--font-display':  displayFontVar,
    '--font-body':     bodyFontVar,
    '--ivory':         backgroundColor,
    '--charcoal':      textColor,
    '--gold':          accentColor,
    backgroundColor,
    color:             textColor,
  } as React.CSSProperties;

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
  // Nuevo modelo: photos[]. Fallback al modelo antiguo (images[]).
  const photosArr = (c as { photos?: { url: string; role: string | null; objectPosition?: string }[] }).photos;
  const heroEntry = photosArr?.find(p => p.role === 'hero');
  const heroImage: string | null = heroEntry?.url ?? c.images?.[0] ?? null;
  const heroObjectPosition = heroEntry?.objectPosition ?? 'center center';
  // Fotos de galería: tomar del nuevo modelo (todas las no-hero en orden), con fallback a images[]
  const galleryUrls: (string | undefined)[] = photosArr?.length
    ? [undefined, ...photosArr.filter(p => p.role !== 'hero').map(p => p.url)]
    : (c.images ?? []);

  return (
    <ContentProtection>
    <div className={`${allFontVars} essential-root`} style={rootStyle}>
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
              {parentLines1.length > 0 && (
                <>
                  <p className="label muted" style={{ lineHeight: '1.8' }}>Hija de</p>
                  {parentLines1.map((line, i) => (
                    <p key={i} className="label muted" style={{ lineHeight: '1.8' }}>{line}</p>
                  ))}
                </>
              )}
            </div>
            <div className="parents-symbol reveal delay-2">✦</div>
            <div className="reveal delay-2 text-center">
              <p className="display-name">{c.fullNames?.person2}</p>
              <div className="name-sep"><span className="sep-line short" /></div>
              {parentLines2.length > 0 && (
                <>
                  <p className="label muted" style={{ lineHeight: '1.8' }}>Hijo de</p>
                  {parentLines2.map((line, i) => (
                    <p key={i} className="label muted" style={{ lineHeight: '1.8' }}>{line}</p>
                  ))}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── FOTO 2 (ancho completo) ── */}
      {galleryUrls[1] && (
        <div className="photo-full reveal--image">
          <picture style={{ width: '100%', height: '100%', display: 'block' }}>
            <source media="(max-width: 768px)" srcSet={cld(galleryUrls[1], T.fullMobile)} />
            <source media="(min-width: 769px)" srcSet={cld(galleryUrls[1], T.fullDesktop)} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cld(galleryUrls[1], T.fullDesktop)} alt="Foto de los novios" className="photo-img photo-img--hover" />
          </picture>
        </div>
      )}

      {(hasParents || !!galleryUrls[1]) && <Ornament />}

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
      {galleryUrls[2] && (
        <div className="photo-center reveal--image">
          <picture style={{ width: '100%', height: '100%', display: 'block' }}>
            <source srcSet={cld(galleryUrls[2], T.centered)} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cld(galleryUrls[2], T.centered)} alt="Foto de los novios" className="photo-img photo-img--hover" />
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
            <div className="dresscode-avoid reveal">
              <p className="label muted">Por favor evita</p>
              <div className="swatches">
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
      {(galleryUrls[3] || galleryUrls[4]) && (
        <div className="photo-duo reveal--image">
          {galleryUrls[3] && (
            <div className="photo-duo-item photo-duo-item--large">
              <picture style={{ width: '100%', height: '100%', display: 'block' }}>
                <source srcSet={cld(galleryUrls[3], T.duo)} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cld(galleryUrls[3], T.duo)} alt="Foto de los novios" className="photo-img photo-img--hover" />
              </picture>
            </div>
          )}
          {galleryUrls[4] && (
            <div className="photo-duo-item photo-duo-item--small">
              <picture style={{ width: '100%', height: '100%', display: 'block' }}>
                <source srcSet={cld(galleryUrls[4], T.duo)} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cld(galleryUrls[4], T.duo)} alt="Foto de los novios" className="photo-img photo-img--hover" />
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
          <p className="label muted reveal" style={{ maxWidth: '520px', lineHeight: '1.9', marginBottom: '2.5rem' }}>
            Tu presencia es el mejor regalo. Si deseas obsequiarnos algo, aquí encontrarás nuestras opciones.
          </p>

          <div className="gifts-grid">
            {c.gifts?.giftTypes?.includes('transfer') && (c.gifts?.bank || c.gifts?.holder || c.gifts?.account || c.gifts?.clabe) && (
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

            {c.gifts?.giftTypes?.includes('list') && c.gifts?.giftListUrl && (
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

            {c.gifts?.giftTypes?.includes('envelope') && (
              <div className="gift-card gift-card--list reveal delay-2">
                <EnvelopeIcon />
                <p className="gift-card-title" style={{ marginTop: '1.25rem', textAlign: 'center' }}>Sobre de Efectivo</p>
                <p className="gift-value" style={{ textAlign: 'center', marginBottom: '0' }}>
                  {c.gifts.envelopeMessage || 'Si prefieres hacerlo en efectivo, habrá un sobre disponible en el evento'}
                </p>
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
        <p className="footer-names">
          {c.couple?.person1} <span className="footer-amp">&</span> {c.couple?.person2}
        </p>
        <p className="label muted" style={{ marginTop: '0.75rem' }}>
          {c.date?.day} {c.date?.month} {c.date?.year} · {c.location}
        </p>
        <p className="footer-powered">
          powered by <span className="footer-brand">moments</span>
        </p>
      </footer>
    </div>
    </ContentProtection>
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

function EnvelopeIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="10" width="32" height="22" rx="2.5" stroke="var(--gold, #B8965A)" strokeWidth="1.4" />
      <path d="M4 13l16 11 16-11" stroke="var(--gold, #B8965A)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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

