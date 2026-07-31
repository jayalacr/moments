'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  Cormorant_Garamond, Playfair_Display, EB_Garamond, Cinzel, Pinyon_Script,
  Jost, Raleway, Montserrat, Lora, Great_Vibes, Special_Elite,
} from 'next/font/google';
import { Play, Pause, Hotel, Car, UserX, ChevronDown, Check, Gift, Shirt, Info, Flower2 } from 'lucide-react';
import type { PhotoEntry } from '@/lib/imageLayout';
import ContentProtection from '@/components/templates/shared/ContentProtection';
import { getCapabilities } from '@/lib/plans';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

// ---------------------------------------------------------------------------
// Fonts — el theme genérico de /admin ofrece 5 display / 4 body; los cargamos
// todos para que la selección del organizador realmente cambie algo. Encima,
// dos acentos propios de Jardín (no seleccionables desde admin): Special Elite
// (máquina de escribir, para las "etiquetas de espécimen") y Great Vibes,
// reservada a un único momento — la firma del pie de página.
// ---------------------------------------------------------------------------
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '600'], style: ['normal', 'italic'], variable: '--font-cormorant' });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], variable: '--font-playfair' });
const ebGaramond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-eb-garamond' });
const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-cinzel' });
const pinyon = Pinyon_Script({ subsets: ['latin'], weight: ['400'], variable: '--font-pinyon' });
const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-jost' });
const raleway = Raleway({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-raleway' });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-montserrat' });
const lora = Lora({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--font-lora' });
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: ['400'], variable: '--font-great-vibes' });
const specialElite = Special_Elite({ subsets: ['latin'], weight: ['400'], variable: '--font-special-elite' });

const FONT_VARIABLES = [cormorant, playfair, ebGaramond, cinzel, pinyon, jost, raleway, montserrat, lora, greatVibes, specialElite]
  .map(f => f.variable).join(' ');

const DISPLAY_FONT_CSS: Record<string, string> = {
  cormorant: "'Cormorant Garamond'",
  playfair: "'Playfair Display'",
  'eb-garamond': "'EB Garamond'",
  cinzel: "'Cinzel'",
  pinyon: "'Pinyon Script'",
};
const BODY_FONT_CSS: Record<string, string> = {
  jost: "'Jost'",
  raleway: "'Raleway'",
  montserrat: "'Montserrat'",
  lora: "'Lora'",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ItineraryItem {
  time?: string;
  name?: string;
  venue?: string;
  address?: string;
  mapsUrl?: string;
  image?: string;
}
export interface Swatch { color: string; name: string; }
export interface HotelEntry { name: string; category: string; address: string; note: string; phone: string; }

export interface JardinConfig {
  theme?: {
    accentColor?: string;
    displayFont?: 'cormorant' | 'playfair' | 'eb-garamond' | 'cinzel' | 'pinyon';
    bodyFont?: 'jost' | 'raleway' | 'montserrat' | 'lora';
  };
  couple?: { person1?: string; person2?: string };
  fullNames?: { person1?: string; person2?: string };
  date?: { day?: string; month?: string; year?: string };
  location?: string;
  targetDate?: string;
  quote?: { text?: string; reference?: string };
  parents?: { person1?: string; person2?: string };
  photos?: PhotoEntry[];
  itinerary?: ItineraryItem[];
  dressCode?: { label?: string; women?: string; men?: string; swatches?: Swatch[]; avoid?: Swatch[] };
  notes?: string[];
  gifts?: { bank?: string; holder?: string; account?: string; clabe?: string; giftListUrl?: string; giftListLabel?: string; giftTypes?: string[]; envelopeMessage?: string };
  music?: { url?: string; title?: string; artist?: string };
  destination?: {
    hotels?: HotelEntry[];
    transport?: { info?: string; schedule?: Array<{ time: string; detail: string }>; contact?: string };
  };
  noChildren?: boolean;
  noChildrenMessage?: string;
  rsvpDeadline?: string;
  heroLabel?: string;
  monogram?: string;
  whatsapp?: { number?: string; message?: string };
  rsvp?: { maxPlusOnes?: number; deadline?: string };
  dietary?: { enabled?: boolean; options?: string[] };
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
  config: JardinConfig;
  plan?: import('@/lib/plans').EventPlan;
  eventId?: string;
  guestToken?: string;
  maxCompanions?: number;
  companionNames?: string[];
  guestName?: string;
  hasExistingRsvp?: boolean;
  invalidToken?: boolean;
}

// ---------------------------------------------------------------------------
// Styles — identidad "Jardín": cuaderno de campo de un botánico. Papel cálido,
// tinta sepia, fotos "pegadas" con washi tape y borde blanco de polaroid,
// etiquetas de espécimen en máquina de escribir. Nada de dorado/script por
// todas partes — la caligrafía se reserva a un solo momento (la firma).
// Paleta y estilo: "Nature Distilled" (terracota / arena / arcilla / oliva),
// via ui-ux-pro-max --design-system.
// ---------------------------------------------------------------------------
const css = `
  :root {
    --paper:       #F5F0E1;
    --paper-deep:  #EBE1C8;
    --paper-card:  #FBF8EF;
    --ink:         #3B3226;
    --olive:       #3E4A28;
    --olive-deep:  #2B341C;
    --terracotta:  #C67B5C;
    --clay:        #B5651D;
    --sage:        #8B9574;
    --sage-light:  #B7C09E;
    --tape:        rgba(198,138,90,0.5);
    --font-display: 'EB Garamond';
    --font-body: 'Raleway';
    --font-script: 'Great Vibes';
    --font-mono: 'Special Elite';
  }

  .jd-root { background: var(--paper); color: var(--ink); font-family: var(--font-body), sans-serif; overflow-x: hidden; }
  .jd-heading { font-family: var(--font-display), serif; letter-spacing: -0.005em; }
  .jd-script { font-family: var(--font-script), cursive; }

  /* ── Etiqueta de espécimen: el motivo que se repite en toda la página ── */
  .jd-tag { display: inline-flex; align-items: center; gap: 0.4rem; font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--clay); border: 1px dashed rgba(181,101,29,0.5); border-radius: 3px; padding: 0.3rem 0.7rem; background: rgba(255,255,255,0.4); }

  .jd-section { padding: 5rem 1.5rem; }
  @media (min-width: 768px) { .jd-section { padding: 6.5rem 4rem; } }
  .jd-section--paper-deep { background: var(--paper-deep); }
  .jd-section--olive { background: var(--olive); color: var(--paper); }
  .jd-section--olive .jd-tag { color: var(--sage-light); border-color: rgba(183,192,158,0.4); background: rgba(255,255,255,0.06); }
  .jd-footer .jd-tag { color: var(--terracotta); border-color: rgba(214,140,69,0.6); background: rgba(255,255,255,0.08); }

  .jd-heading-block { text-align: center; margin-bottom: 3rem; display: flex; flex-direction: column; align-items: center; gap: 0.9rem; }
  .jd-heading-block h2 { font-size: clamp(1.9rem, 4vw, 2.6rem); font-style: italic; }
  .jd-heading-block--offset { text-align: left; align-items: flex-start; margin-bottom: 2.75rem; max-width: 480px; }

  /* ── Hero: foto "pegada" con washi tape, no split-screen ── */
  .jd-hero { position: relative; min-height: 100svh; background: var(--paper); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2.75rem; padding: 6rem 1.5rem 4rem; overflow: hidden; text-align: center; }
  .jd-hero-noise { position: absolute; inset: 0; opacity: 0.5; pointer-events: none; }
  .jd-hero-frame { position: relative; width: min(84vw, 380px); background: #fff; padding: 12px; box-shadow: 0 30px 70px rgba(59,50,38,0.25), 0 1px 0 rgba(0,0,0,0.04); }
  @media (min-width: 640px) { .jd-hero-frame { width: min(60vw, 420px); } }
  .jd-hero-tape { position: absolute; top: -16px; left: 50%; translate: -50% 0; rotate: -4deg; width: 100px; height: 34px; background: var(--tape); box-shadow: 0 2px 6px rgba(0,0,0,0.12); }
  .jd-hero-photo-wrap { position: relative; overflow: hidden; aspect-ratio: 4 / 5; }
  .jd-hero-img { width: 100%; height: 100%; object-fit: cover; }
  .jd-hero-caption { margin-top: 10px; text-align: center; font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--terracotta); }
  .jd-hero-names { font-family: var(--font-display), serif; font-style: italic; font-weight: 500; font-size: clamp(2.5rem, 8vw, 4.2rem); line-height: 1.05; color: var(--ink); }
  .jd-hero-amp { display: block; color: var(--clay); font-size: 0.6em; margin: 0.15em 0; }
  .jd-hero-meta { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1.4rem; font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); opacity: 0.75; }

  /* ── Loader: sello que se estampa ── */
  .jd-loader { position: fixed; inset: 0; background: var(--olive-deep); z-index: 999; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.1rem; transition: opacity 0.6s ease, transform 0.6s ease; }
  .jd-loader--out { opacity: 0; transform: scale(1.03); pointer-events: none; }
  .jd-loader-mono { font-family: var(--font-display), serif; font-style: italic; color: var(--paper); font-size: clamp(2.8rem, 8vw, 4.2rem); animation: jdFadeUp 0.8s ease 0.1s both; }
  .jd-loader-line { width: 0; height: 1px; background: var(--terracotta); animation: jdLineGrow 1.1s cubic-bezier(0.16,1,0.3,1) 0.45s forwards; }
  @keyframes jdLineGrow { to { width: 64px; } }
  .jd-loader-date { color: rgba(245,240,225,0.7); font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; animation: jdFadeUp 0.8s ease 0.7s both; }
  @keyframes jdFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  /* ── Music toggle ── */
  .jd-music { position: fixed; bottom: 1.75rem; right: 1.75rem; z-index: 100; display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem 1.1rem; border-radius: 4px; background: var(--olive); color: var(--paper); border: 1px dashed rgba(245,240,225,0.3); cursor: pointer; font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.05em; box-shadow: 0 10px 30px rgba(46,54,32,0.25); }
  .jd-music-bars { display: flex; align-items: flex-end; gap: 2px; height: 12px; }
  .jd-music-bars span { width: 2px; background: var(--sage-light); border-radius: 1px; animation: jdBar 0.9s ease-in-out infinite alternate; }
  .jd-music-bars span:nth-child(2) { animation-delay: 0.2s; }
  .jd-music-bars span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes jdBar { from { height: 3px; } to { height: 12px; } }

  /* ── Countdown: un solo "boleto de campo" perforado, no fichas sueltas ── */
  .jd-countdown { display: flex; justify-content: center; }
  .jd-cd-ticket { position: relative; display: flex; flex-wrap: nowrap; max-width: 100%; background: var(--paper-card); border: 1px dashed rgba(139,149,116,0.55); border-radius: 6px; padding: 1.1rem 0.9rem 1rem; box-shadow: 0 16px 34px rgba(59,50,38,0.12); rotate: -1.25deg; }
  @media (min-width: 640px) { .jd-cd-ticket { padding: 1.5rem 1.5rem 1.35rem; } }
  .jd-cd-ticket::before, .jd-cd-ticket::after { content: ''; position: absolute; top: 50%; width: 22px; height: 22px; background: var(--paper-deep); border-radius: 50%; transform: translateY(-50%); }
  .jd-cd-ticket::before { left: -11px; }
  .jd-cd-ticket::after { right: -11px; }
  .jd-cd-tape { position: absolute; top: -13px; left: 50%; translate: -50% 0; rotate: -3deg; width: 84px; height: 26px; background: var(--tape); box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
  .jd-cd-unit { position: relative; display: flex; flex-direction: column; align-items: center; padding: 0 0.5rem; }
  @media (min-width: 640px) { .jd-cd-unit { padding: 0 1.35rem; } }
  .jd-cd-unit + .jd-cd-unit::before { content: ''; position: absolute; left: 0; top: 8%; bottom: 8%; border-left: 1px dashed rgba(139,149,116,0.45); }
  .jd-cd-num { font-family: var(--font-display), serif; font-style: italic; font-size: 1.25rem; color: var(--ink); white-space: nowrap; }
  @media (min-width: 640px) { .jd-cd-num { font-size: 2.1rem; } }
  .jd-cd-lbl { font-family: var(--font-mono), monospace; font-size: 8px; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.6; margin-top: 0.3rem; white-space: nowrap; }

  /* ── Cita: pull-quote a ancho completo sobre foto ── */
  .jd-quote-bleed { position: relative; min-height: 62svh; display: flex; align-items: center; background-size: cover; background-position: center; }
  .jd-quote-bleed-tint { position: absolute; inset: 0; background: linear-gradient(115deg, rgba(43,52,28,0.85) 0%, rgba(43,52,28,0.45) 55%, rgba(43,52,28,0.15) 100%); }
  .jd-quote-bleed-content { position: relative; z-index: 2; max-width: 560px; margin: 0 8% 0 6%; color: var(--paper); padding: 2rem 0; }
  .jd-quote-mark { display: block; font-family: var(--font-display), serif; font-style: italic; font-size: 4.5rem; color: var(--terracotta); opacity: 0.85; line-height: 1; margin-bottom: -1.25rem; }
  .jd-quote-bleed-content p.txt { font-family: var(--font-display), serif; font-style: italic; font-size: clamp(1.3rem, 3vw, 1.9rem); line-height: 1.55; }
  .jd-quote-bleed-content .jd-tag { margin-top: 1.25rem; color: var(--paper); border-color: rgba(245,240,225,0.55); background: rgba(0,0,0,0.28); }

  /* ── Padres ── */
  .jd-itinerary-section { position: relative; }
  .jd-parents-section { max-width: 720px; margin: 0 auto; display: grid; gap: 2.5rem; text-align: center; }
  @media (min-width: 640px) { .jd-parents-section { grid-template-columns: 1fr auto 1fr; align-items: center; gap: 1.5rem; } }
  .jd-parents-block .role { margin-bottom: 0.75rem; }
  .jd-parents-block .names { display: flex; flex-direction: column; gap: 0.3rem; font-size: 15px; line-height: 1.5; opacity: 0.9; }
  .jd-parents-block .names .amp { font-family: var(--font-display), serif; font-style: italic; color: var(--sage-light); font-size: 1rem; }
  .jd-parents-divider { width: 1px; height: 64px; background: var(--sage-light); opacity: 0.35; margin: 0 auto; }
  @media (max-width: 639px) { .jd-parents-divider { width: 40px; height: 1px; } }

  /* ── Itinerario ── */
  .jd-timeline { max-width: 640px; margin: 0 auto; position: relative; padding-left: 2rem; padding-top: 1rem; display: flex; flex-direction: column; gap: 0; }
  .jd-timeline::before { content: ''; position: absolute; left: 7px; top: 1.4rem; bottom: 0.4rem; width: 1px; background: repeating-linear-gradient(to bottom, var(--sage) 0 6px, transparent 6px 12px); }
  .jd-tl-item { position: relative; padding-bottom: 3rem; }
  .jd-tl-item:last-child { padding-bottom: 0; }
  .jd-tl-item:nth-child(even) { padding-left: 1.5rem; }
  .jd-tl-dot { position: absolute; left: -2rem; top: 1.2rem; width: 15px; height: 15px; border-radius: 50%; background: var(--sage); border: 3px solid var(--paper); box-shadow: 0 0 0 1px rgba(139,149,116,0.4); }
  .jd-tl-photo { width: var(--tl-photo, 140px); max-width: 100%; aspect-ratio: 4 / 3; overflow: hidden; margin: 0 auto 0.85rem; background: #fff; padding: 6px 6px 6px; box-shadow: 0 14px 28px rgba(59,50,38,0.15); }
  .jd-tl-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .jd-tl-time { font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--clay); }
  .jd-tl-name { font-family: var(--font-display), serif; font-style: italic; font-size: var(--tl-name-size, 1.5rem); margin: 0.2rem 0; }
  .jd-tl-venue { font-size: 13px; opacity: 0.75; }
  .jd-tl-link { display: inline-block; margin-top: 0.6rem; font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--terracotta); text-decoration: none; border-bottom: 1px solid var(--terracotta); }
  @media (min-width: 900px) {
    .jd-timeline { flex-direction: row; flex-wrap: wrap; justify-content: center; max-width: 100%; padding-left: 0; padding-bottom: 1rem; }
    .jd-timeline::before { left: 0; right: 0; top: 1.4rem; bottom: auto; height: 1px; width: auto; background: repeating-linear-gradient(to right, var(--sage) 0 6px, transparent 6px 12px); }
    .jd-tl-item { flex: 0 1 var(--tl-item-basis, 220px); padding: 3rem 1.25rem 0; padding-bottom: 0; text-align: center; }
    .jd-tl-item:nth-child(even) { padding-left: 1.25rem; }
    .jd-tl-dot { left: 50%; top: 1rem; transform: translateX(-50%); }
  }

  /* ── Fotos dispersas: mismo tratamiento "pegado" del hero, en miniatura ── */
  .jd-photo-breakout { width: 100vw; position: relative; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; aspect-ratio: 21 / 9; overflow: hidden; margin-bottom: 3rem; }
  .jd-photo-breakout img { width: 100%; height: 100%; object-fit: cover; }
  .jd-photos-wrap { max-width: 860px; margin: 0 auto; padding: 0 1.5rem 5rem; display: flex; flex-direction: column; gap: 3.5rem; align-items: center; }
  .jd-photo-card { position: relative; background: #fff; padding: 10px 10px 34px; box-shadow: 0 22px 44px rgba(59,50,38,0.18); }
  .jd-photo-card img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; display: block; }
  .jd-photo-card .jd-photo-tape { position: absolute; top: -14px; width: 80px; height: 28px; background: var(--tape); }
  .jd-photo-card .jd-photo-tape--l { left: -14px; rotate: -18deg; }
  .jd-photo-card .jd-photo-tape--r { right: -14px; rotate: 18deg; }

  /* ── Hoteles: tarjetas uniformes ── */
  .jd-hotels-grid { max-width: 760px; margin: 0 auto; display: grid; gap: 1.25rem; }
  @media (min-width: 640px) { .jd-hotels-grid { grid-template-columns: 1fr 1fr; } }
  .jd-hotel-card { border-radius: 6px; padding: 1.75rem; background: var(--paper-card); border: 1px dashed rgba(139,149,116,0.4); box-shadow: 0 14px 32px rgba(59,50,38,0.07); display: flex; flex-direction: column; gap: 0.4rem; text-align: left; }
  .jd-hotel-card .name { font-size: 1.2rem; font-style: italic; }
  .jd-transport-card { max-width: 640px; margin: 2.75rem auto 0; text-align: center; border-radius: 6px; padding: 2.25rem 1.75rem; background: var(--paper-card); border: 1px dashed rgba(139,149,116,0.4); box-shadow: 0 14px 32px rgba(59,50,38,0.07); }
  .jd-transport-schedule { display: flex; flex-direction: column; gap: 0.9rem; max-width: 320px; margin: 0 auto; }
  .jd-transport-row { display: grid; grid-template-columns: 64px auto 1fr; align-items: center; gap: 0.75rem; text-align: left; }
  .jd-transport-time { font-family: var(--font-mono), monospace; font-size: 12px; color: var(--clay); text-align: right; }
  .jd-transport-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--terracotta); justify-self: center; }
  .jd-transport-detail { font-size: 13px; opacity: 0.75; }

  /* ── Detalles: tarjetas independientes del mismo tamaño ── */
  .jd-details-cards { display: flex; flex-wrap: wrap; justify-content: center; align-items: stretch; gap: 1.5rem; max-width: 1180px; margin: 0 auto; }
  .jd-detail-card { display: flex; flex-direction: column; flex: 1 1 320px; max-width: 380px; background: var(--paper-card); border: 1px dashed rgba(139,149,116,0.4); border-radius: 6px; padding: 1.75rem; box-shadow: 0 14px 32px rgba(59,50,38,0.07); text-align: left; }
  .jd-detail-head { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
  .jd-detail-icon { width: 34px; height: 34px; border-radius: 4px; background: rgba(139,149,116,0.16); display: flex; align-items: center; justify-content: center; color: var(--sage); flex-shrink: 0; }
  .jd-detail-head h3 { font-family: var(--font-display), serif; font-style: italic; font-size: 1.1rem; }
  .jd-dress-label { display: inline-block; padding: 0.45rem 1.25rem; border: 1px dashed var(--sage); border-radius: 3px; font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1.5rem; }
  .jd-dress-cols { display: grid; gap: 1.5rem; margin-bottom: 1.75rem; }
  @media (min-width: 420px) { .jd-dress-cols { grid-template-columns: 1fr 1fr; } }
  .jd-dress-cols h4 { font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--terracotta); margin-bottom: 0.5rem; }
  .jd-swatches { display: flex; gap: 1.25rem; flex-wrap: wrap; }
  .jd-swatches-label { font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--terracotta); margin-bottom: 0.75rem; }
  .jd-swatch { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
  .jd-swatch-dot { width: 38px; height: 38px; border-radius: 50%; box-shadow: 0 6px 16px rgba(59,50,38,0.15); }
  .jd-swatch span { font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.05em; text-transform: uppercase; opacity: 0.65; }
  .jd-swatch--avoid .jd-swatch-dot { position: relative; opacity: 0.55; box-shadow: none; border: 1px solid rgba(199,123,88,0.4); }
  .jd-swatch-x { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
  .jd-gift-block { padding-top: 1.1rem; margin-top: 1.1rem; border-top: 1px dashed rgba(139,149,116,0.35); display: flex; flex-direction: column; gap: 0.6rem; }
  .jd-gift-block:first-child { padding-top: 0; margin-top: 0; border-top: none; }
  .jd-gift-row { display: flex; flex-direction: column; gap: 0.1rem; }
  .jd-gift-row span.lbl { font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.5; }
  .jd-gift-row span.val { font-size: 13px; }
  .jd-gift-link { align-self: flex-start; font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--terracotta); text-decoration: none; border-bottom: 1px solid var(--terracotta); }
  .jd-notes { display: flex; flex-direction: column; gap: 1rem; }
  .jd-note { display: flex; gap: 0.85rem; align-items: flex-start; }
  .jd-note-mark { color: var(--terracotta); font-family: var(--font-mono), monospace; font-size: 11px; flex-shrink: 0; margin-top: 2px; }

  /* ── RSVP fusionado con el footer ── */
  .jd-footer { background: var(--olive-deep); color: var(--paper); text-align: center; padding: 4rem 1.5rem 3.5rem; }
  .jd-rsvp-divider { display: flex; align-items: center; justify-content: center; gap: 1rem; max-width: 300px; margin: 0 auto 2rem; }
  .jd-rsvp-divider-line { flex: 1; height: 1px; background-image: repeating-linear-gradient(to right, rgba(245,240,225,0.4) 0 5px, transparent 5px 10px); }
  .jd-rsvp-seal { flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%; border: 1px dashed rgba(198,123,92,0.7); display: flex; align-items: center; justify-content: center; color: var(--terracotta); font-family: var(--font-display), serif; font-style: italic; font-size: 19px; }
  .jd-footer .jd-heading-block h2 { color: var(--paper); }
  .jd-footer-blurb { max-width: 420px; margin: -0.75rem auto 2.5rem; font-size: 14px; opacity: 0.75; line-height: 1.7; }
  .jd-btn { display: inline-block; background: var(--clay); color: var(--paper); padding: 1.05rem 2.75rem; border-radius: 3px; font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; border: 1px dashed rgba(245,240,225,0.4); cursor: pointer; text-decoration: none; box-shadow: 0 14px 30px rgba(0,0,0,0.3); transition: transform 0.25s ease, background 0.25s ease; }
  .jd-btn:hover { background: var(--terracotta); transform: translateY(-2px); }
  .jd-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .jd-rsvp-done { display: inline-flex; align-items: center; gap: 0.6rem; background: rgba(139,149,116,0.16); border: 1px dashed rgba(183,192,158,0.5); color: var(--sage-light); padding: 0.85rem 1.75rem; border-radius: 3px; font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; }
  .jd-rsvp-edit { display: block; margin-top: 0.9rem; font-family: var(--font-mono), monospace; font-size: 10px; text-decoration: underline; opacity: 0.65; cursor: pointer; background: none; border: none; color: var(--paper); }
  .jd-footer-divider { width: 60px; height: 1px; background: rgba(245,240,225,0.2); margin: 3.5rem auto 2.25rem; }
  .jd-footer-mono { font-family: var(--font-display), serif; font-style: italic; font-size: 2.2rem; color: var(--terracotta); opacity: 0.9; margin-bottom: 0.4rem; }
  .jd-footer-names { font-family: var(--font-display), serif; font-style: italic; font-size: 1.2rem; }
  .jd-footer-date { font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.55; margin-top: 0.5rem; }
  .jd-footer-powered { font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.1em; opacity: 0.4; margin-top: 1.75rem; }
  .jd-footer-brand { color: var(--sage-light); }

  /* ── Modal RSVP ── */
  .jd-modal-backdrop { position: fixed; inset: 0; background: rgba(43,52,28,0.75); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .jd-modal { background: var(--paper-card); border-radius: 8px; width: 100%; max-width: 420px; max-height: 90svh; overflow-y: auto; position: relative; color: var(--ink); }
  .jd-modal-close { position: absolute; top: 1rem; right: 1rem; width: 32px; height: 32px; border-radius: 50%; border: 1px dashed rgba(139,149,116,0.4); background: transparent; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .jd-modal-body { padding: 2rem; display: flex; flex-direction: column; gap: 1.25rem; }
  .jd-modal-title { font-family: var(--font-display), serif; font-style: italic; font-size: 1.6rem; text-align: center; }
  .jd-guest-card { display: flex; align-items: center; gap: 1rem; background: var(--paper-deep); border-radius: 6px; padding: 1rem 1.25rem; }
  .jd-guest-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--sage); color: white; display: flex; align-items: center; justify-content: center; font-family: var(--font-display), serif; font-style: italic; font-size: 1.3rem; flex-shrink: 0; }
  .jd-choice { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .jd-choice-yes { padding: 0.85rem; border-radius: 4px; background: var(--sage); color: white; border: none; font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer; }
  .jd-choice-no { padding: 0.85rem; border-radius: 4px; background: transparent; border: 1px dashed rgba(139,149,116,0.5); font-family: var(--font-mono), monospace; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; cursor: pointer; }
  .jd-attendees { background: var(--paper-deep); border-radius: 6px; padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.55rem; }
  .jd-attendee-row { display: flex; align-items: center; gap: 0.65rem; font-size: 13px; }
  .jd-attendee-check { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid rgba(139,149,116,0.5); display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; }
  .jd-attendee-check.on { background: rgba(139,149,116,0.2); border-color: var(--sage); color: var(--sage); }
  .jd-input { width: 100%; padding: 0.7rem 1rem; border: 1px solid rgba(139,149,116,0.4); border-radius: 4px; font-family: var(--font-body), sans-serif; font-size: 13px; outline: none; }
  .jd-input:focus { border-color: var(--sage); }
  .jd-stepper { display: flex; align-items: center; justify-content: center; gap: 1.25rem; margin: 0.5rem 0 0.75rem; }
  .jd-stepper button { width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--sage); background: transparent; color: var(--sage); font-size: 16px; cursor: pointer; }
  .jd-stepper button:disabled { opacity: 0.35; cursor: not-allowed; }
  .jd-submit { width: 100%; padding: 0.9rem; border-radius: 4px; background: var(--olive-deep); color: white; border: none; font-family: var(--font-mono), monospace; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
  .jd-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .jd-linklike { background: none; border: none; font-size: 11px; text-decoration: underline; opacity: 0.55; cursor: pointer; }
  .jd-demo-flag { text-align: center; font-family: var(--font-mono), monospace; font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--sage); border: 1px dashed rgba(139,149,116,0.5); border-radius: 4px; padding: 0.65rem; }
  .jd-error { color: #B5453A; font-size: 12px; text-align: center; }

  /* ── Dietary ── */
  .jd-dietary-person { font-family: var(--font-mono), monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--terracotta); text-align: center; margin-bottom: 0.3rem; }
  .jd-dietary-summary { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 1rem; border: 1px dashed rgba(139,149,116,0.4); border-radius: 4px; background: var(--paper-card); font-size: 12px; cursor: pointer; list-style: none; }
  .jd-dietary-summary::-webkit-details-marker { display: none; }
  .jd-dietary-options { border: 1px dashed rgba(139,149,116,0.3); border-radius: 4px; padding: 0.5rem; margin-top: 0.3rem; display: flex; flex-direction: column; gap: 2px; background: var(--paper-deep); }
  .jd-dietary-option { display: flex; align-items: center; gap: 10px; padding: 6px 8px; font-size: 13px; cursor: pointer; }

  /* ── Textura de papel ── */
  .jd-grain { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 50; opacity: 0.05; mix-blend-mode: multiply; }
  .jd-blob { position: absolute; width: 320px; height: 320px; pointer-events: none; mix-blend-mode: multiply; z-index: 0; }
`;

// ---------------------------------------------------------------------------
// Theme override — accentColor + displayFont/bodyFont realmente conectados
// ---------------------------------------------------------------------------
function buildThemeCSS(theme?: JardinConfig['theme']): string {
  const lines: string[] = [];
  if (theme?.accentColor) {
    lines.push(`--sage: ${theme.accentColor};`);
    lines.push(`--sage-light: color-mix(in oklab, ${theme.accentColor} 45%, white);`);
  }
  if (theme?.displayFont && DISPLAY_FONT_CSS[theme.displayFont]) {
    lines.push(`--font-display: ${DISPLAY_FONT_CSS[theme.displayFont]};`);
  }
  if (theme?.bodyFont && BODY_FONT_CSS[theme.bodyFont]) {
    lines.push(`--font-body: ${BODY_FONT_CSS[theme.bodyFont]};`);
  }
  if (!lines.length) return '';
  return `:root { ${lines.join(' ')} }`;
}

// ---------------------------------------------------------------------------
// Transiciones entre secciones: sangrado por degradado, sin separadores
// decorativos. Un solo divisor (RsvpDivider) reservado para el encabezado
// del RSVP.
// ---------------------------------------------------------------------------
const BG: Record<'paper' | 'paper-deep' | 'olive', string> = { paper: 'var(--paper)', 'paper-deep': 'var(--paper-deep)', olive: 'var(--olive-deep)' };

const BleedGradient = ({ from, to, height = 110 }: { from: 'paper' | 'paper-deep' | 'olive'; to: 'paper' | 'paper-deep' | 'olive'; height?: number }) => (
  <div aria-hidden="true" style={{ height, background: `linear-gradient(to bottom, ${BG[from]}, ${BG[to]})` }} />
);

// Divisor de cierre: línea punteada + sello circular con "&", en el mismo
// lenguaje visual que el resto (bordes dashed, serif itálica) — marca el
// cierre de la invitación antes del RSVP.
const RsvpDivider = () => (
  <div className="jd-rsvp-divider" aria-hidden="true">
    <span className="jd-rsvp-divider-line" />
    <span className="jd-rsvp-seal"><Flower2 size={16} strokeWidth={1.5} /></span>
    <span className="jd-rsvp-divider-line" />
  </div>
);

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } },
};

const maskReveal = {
  hidden: { clipPath: 'inset(100% 0 0 0)' },
  show: { clipPath: 'inset(0% 0 0 0)', transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as const } },
};
const slideIn = (fromLeft = true) => ({
  hidden: { opacity: 0, x: fromLeft ? -36 : 36 },
  show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } },
});
const staggerChildren = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

const Section = ({
  bg = 'paper',
  edge,
  className = '',
  style,
  children,
}: {
  bg?: 'paper' | 'paper-deep' | 'olive';
  edge?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => (
  <>
    {edge}
    <section className={`jd-section ${bg !== 'paper' ? `jd-section--${bg}` : ''} ${className}`.trim()} style={style}>
      {children}
    </section>
  </>
);

const SectionHeading = ({ eyebrow, title, variant = 'centered' }: { eyebrow?: string; title: string; variant?: 'centered' | 'offset' }) => (
  <motion.div
    className={`jd-heading-block${variant === 'offset' ? ' jd-heading-block--offset' : ''}`}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: '-80px' }}
    variants={variant === 'offset' ? slideIn(true) : fadeUp}
  >
    {eyebrow && <span className="jd-tag">{eyebrow}</span>}
    <h2 className="jd-heading">{title}</h2>
  </motion.div>
);

const GrainOverlay = () => (
  <svg className="jd-grain" aria-hidden="true" focusable="false">
    <filter id="jd-grain-filter">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#jd-grain-filter)" />
  </svg>
);

const LeafyBlob = ({ id, seed, fill, opacity = 0.16, style }: { id: string; seed: number; fill: string; opacity?: number; style?: React.CSSProperties }) => (
  <svg className="jd-blob" aria-hidden="true" focusable="false" style={{ opacity, ...style }}>
    <filter id={id}>
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed={seed} result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="55" xChannelSelector="R" yChannelSelector="G" />
      <feGaussianBlur stdDeviation="6" />
    </filter>
    <ellipse cx="50%" cy="50%" rx="45%" ry="45%" fill={fill} filter={`url(#${id})`} />
  </svg>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function JardinTemplate({
  config,
  plan: planProp,
  eventId,
  guestToken,
  maxCompanions = 0,
  companionNames: initialCompanionNames = [],
  guestName: initialGuestName = '',
  hasExistingRsvp = false,
}: Props) {
  const caps = getCapabilities(planProp);
  const isPlus = planProp === 'plus';
  const [isLoaded, setIsLoaded] = useState(!caps.loader);
  const [loaderOut, setLoaderOut] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  useSmoothScroll(!isRsvpOpen);
  const [rsvpDone, setRsvpDone] = useState(hasExistingRsvp);
  const [guestConfirmed, setGuestConfirmed] = useState<null | boolean>(null);
  const [attendeeNames, setAttendeeNames] = useState<string[]>([]);
  const [attendeeChecked, setAttendeeChecked] = useState<boolean[]>([]);
  const [dietaryMap, setDietaryMap] = useState<Record<string, string[]>>({});
  const dietary = config.dietary ?? { enabled: false, options: [] };
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroPhotoY = useTransform(heroProgress, [0, 1], ['0%', '14%']);

  useEffect(() => {
    const t1 = setTimeout(() => setLoaderOut(true), 1500);
    const t2 = setTimeout(() => setIsLoaded(true), 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (!config.targetDate) return;
    const target = new Date(config.targetDate).getTime();
    const interval = setInterval(() => {
      const diff = target - Date.now();
      if (diff <= 0) { clearInterval(interval); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [config.targetDate]);

  const hasToken = !!guestToken;
  const isDemo = !eventId && !guestToken;
  const effectiveMaxCompanions = isDemo ? (maxCompanions || 2) : maxCompanions;
  const displayName = initialGuestName || (isDemo ? 'Ana García' : config.couple?.person1 || '');
  const totalSeats = 1 + effectiveMaxCompanions;

  useEffect(() => {
    if (isRsvpOpen) {
      modalRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus();
    }
  }, [isRsvpOpen]);

  const rawMusicUrl = config.music?.url || '';
  const audioSrc = rawMusicUrl.includes('drive.google.com')
    ? `/api/audio-proxy?url=${encodeURIComponent(rawMusicUrl)}`
    : rawMusicUrl;

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { try { await audio.play(); setIsPlaying(true); } catch { /* autoplay blocked */ } }
  };

  async function handleSubmitRsvp() {
    if (!hasToken || !eventId) { setRsvpDone(true); return; }
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
          seats: guestConfirmed ? 1 + attendeeNames.filter((_, i) => attendeeChecked[i]).length : 0,
          companionNames: guestConfirmed ? attendeeNames.filter((_, i) => attendeeChecked[i]) : [],
          dietaryPerPerson: guestConfirmed ? dietaryMap : undefined,
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

  const heroPhoto = config.photos?.find(p => p.role === 'hero')?.url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600&q=85';
  const allowedBlockPhotos = (config.photos?.filter(p => p.role === 'block') || []).slice(0, caps.maxPhotos - 1);
  const quoteBgPhoto = allowedBlockPhotos[0]?.url || heroPhoto;

  function renderBlocks(afterSection: string) {
    const blocks = allowedBlockPhotos.filter(p => p.afterSection === afterSection);
    if (!blocks.length) return null;
    const [first, ...rest] = blocks;
    return (
      <>
        <motion.div
          className="jd-photo-breakout"
          initial={{ opacity: 0, scale: 1.04 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src={first.url} alt="Jardín" style={{ objectPosition: first.objectPosition || 'center' }} />
        </motion.div>
        {!!rest.length && (
          <div className="jd-photos-wrap">
            {rest.map((p, i) => {
              const odd = i % 2 === 1;
              return (
                <motion.div
                  key={i}
                  className="jd-photo-card"
                  style={{ width: 'min(88vw, 400px)', rotate: odd ? 2 : -2 }}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-60px' }}
                  variants={maskReveal}
                >
                  <span className={`jd-photo-tape jd-photo-tape--${odd ? 'r' : 'l'}`} aria-hidden="true" />
                  <img src={p.url} alt="Jardín" style={{ objectPosition: p.objectPosition || 'center' }} />
                </motion.div>
              );
            })}
          </div>
        )}
      </>
    );
  }

  const themeCSS = buildThemeCSS(config.theme);
  const showParentsNote = config.sections?.parents !== false;
  const showItinerary = config.sections?.itinerary !== false && !!config.itinerary?.length;

  const gt = config.gifts?.giftTypes ?? [];
  const showTransfer = gt.includes('transfer') || (!gt.length && !!config.gifts?.bank);
  const showList = gt.includes('list') || (!gt.length && !!config.gifts?.giftListUrl);
  const showEnvelope = gt.includes('envelope');
  const hasGifts = config.sections?.gifts !== false && !!config.gifts && (showTransfer || showList || showEnvelope);
  const hasNotes = config.sections?.notes !== false && !!config.notes?.filter(n => n?.trim()).length;
  const hasDressCode = config.sections?.dressCode !== false && !!config.dressCode;
  const hasDetails = hasDressCode || hasGifts || hasNotes || !!config.noChildren;
  const hasDestination = config.sections?.destination !== false && !!config.destination && !!(config.destination.hotels?.length || config.destination.transport?.info);
  const preDetailsBg: 'paper' | 'paper-deep' | 'olive' = hasDestination ? 'paper' : showItinerary ? 'paper-deep' : showParentsNote ? 'olive' : 'paper-deep';
  const preFooterBg: 'paper' | 'paper-deep' | 'olive' = hasDetails ? 'paper-deep' : preDetailsBg;

  const formatParents = (s?: string) => (s || 'Sus padres').split('&').map(p => p.trim()).filter(Boolean);

  const itineraryCount = config.itinerary?.length ?? 0;
  const timelineVars = {
    '--tl-photo': itineraryCount <= 3 ? '160px' : itineraryCount === 4 ? '130px' : '105px',
    '--tl-name-size': itineraryCount <= 3 ? '1.5rem' : itineraryCount === 4 ? '1.3rem' : '1.15rem',
    '--tl-item-basis': itineraryCount <= 3 ? '240px' : itineraryCount === 4 ? '200px' : '170px',
  } as React.CSSProperties;

  return (
    <div className="flex-1 flex flex-col">
      <ContentProtection enabled={true}>
        <div className={`jd-root ${FONT_VARIABLES}`}>
          <style dangerouslySetInnerHTML={{ __html: css }} />
          {themeCSS && <style dangerouslySetInnerHTML={{ __html: themeCSS }} />}
          <GrainOverlay />

          {caps.loader && !isLoaded && (
            <div className={`jd-loader ${loaderOut ? 'jd-loader--out' : ''}`}>
              <p className="jd-loader-mono">{config.monogram || `${config.couple?.person1?.[0] ?? ''} & ${config.couple?.person2?.[0] ?? ''}`}</p>
              <span className="jd-loader-line" />
              <p className="jd-loader-date">{config.date?.day} · {config.date?.month} · {config.date?.year}</p>
            </div>
          )}

          {caps.music && audioSrc && (
            <audio ref={audioRef} src={audioSrc} loop preload="auto" crossOrigin="anonymous"
              onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
          )}
          {caps.music && config.music?.url && (
            <button className="jd-music" onClick={toggleMusic} aria-label="Reproducir música">
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              {isPlaying && <span className="jd-music-bars"><span/><span/><span/></span>}
            </button>
          )}

          {/* ── HERO: foto pegada con washi tape, no split-screen ── */}
          <section className="jd-hero" ref={heroRef as React.RefObject<HTMLElement>}>
            <div className="jd-hero-frame">
              <span className="jd-hero-tape" aria-hidden="true" />
              <div className="jd-hero-photo-wrap">
                <motion.img src={heroPhoto} alt="Hero" className="jd-hero-img" style={{ y: heroPhotoY }} />
              </div>
              <p className="jd-hero-caption">{config.heroLabel || 'Boda de Jardín'}</p>
            </div>
            <div>
              <h1 className="jd-hero-names">
                {config.couple?.person1}<span className="jd-hero-amp">&amp;</span>{config.couple?.person2}
              </h1>
              <div className="jd-hero-meta">
                <span>{config.date?.day} · {config.date?.month} · {config.date?.year}</span>
                <span>{config.location}</span>
              </div>
            </div>
          </section>

          {/* ── COUNTDOWN ── */}
          {caps.countdown && (
            <Section bg="paper-deep">
              <SectionHeading eyebrow="Cuenta regresiva" title="Se acerca el gran día" />
              <div className="jd-countdown">
                <motion.div
                  className="jd-cd-ticket"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={staggerChildren}
                >
                  <span className="jd-cd-tape" aria-hidden="true" />
                  {[
                    { v: timeLeft.days, l: 'Días' },
                    { v: timeLeft.hours, l: 'Horas' },
                    { v: timeLeft.minutes, l: 'Min' },
                    { v: timeLeft.seconds, l: 'Seg' },
                  ].map((u, i) => (
                    <motion.div key={i} className="jd-cd-unit" variants={staggerItem}>
                      <span className="jd-cd-num">{String(u.v).padStart(2, '0')}</span>
                      <span className="jd-cd-lbl">{u.l}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </Section>
          )}

          {/* ── CITA: pull-quote a ancho completo sobre foto ── */}
          {config.sections?.quote !== false && config.quote?.text && (
            <section className="jd-quote-bleed" style={{ backgroundImage: `url(${quoteBgPhoto})` }}>
              <div className="jd-quote-bleed-tint" />
              <motion.div
                className="jd-quote-bleed-content"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="jd-quote-mark" aria-hidden="true">&ldquo;</span>
                <p className="txt">{config.quote.text}</p>
                {config.quote.reference && <span className="jd-tag">{config.quote.reference}</span>}
              </motion.div>
            </section>
          )}

          {/* ── PADRES ── */}
          {showParentsNote && (
            <Section bg="olive">
              <SectionHeading eyebrow="Nuestras raíces" title="Con la bendición de" />
              <motion.div
                className="jd-parents-section"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                variants={staggerChildren}
              >
                <motion.div className="jd-parents-block" variants={staggerItem}>
                  <span className="jd-tag role">Ella</span>
                  <div className="names">
                    {formatParents(config.parents?.person1).map((n, i, arr) => (
                      <React.Fragment key={i}>
                        <span>{n}</span>
                        {i < arr.length - 1 && <span className="amp">&amp;</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
                <motion.div className="jd-parents-divider" variants={staggerItem} />
                <motion.div className="jd-parents-block" variants={staggerItem}>
                  <span className="jd-tag role">Él</span>
                  <div className="names">
                    {formatParents(config.parents?.person2).map((n, i, arr) => (
                      <React.Fragment key={i}>
                        <span>{n}</span>
                        {i < arr.length - 1 && <span className="amp">&amp;</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </Section>
          )}

          {renderBlocks('parents')}

          {/* ── ITINERARIO ── */}
          {showItinerary && (
            <Section bg="paper-deep" className="jd-itinerary-section">
              <SectionHeading eyebrow="El gran día" title="Itinerario" variant="offset" />
              <motion.div
                className="jd-timeline"
                style={timelineVars}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                variants={staggerChildren}
              >
                {config.itinerary!.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="jd-tl-item"
                    variants={staggerItem}
                  >
                    <span className="jd-tl-dot" />
                    {item.image && (
                      <div className="jd-tl-photo"><img src={item.image} alt={item.name || 'Itinerario'} /></div>
                    )}
                    <p className="jd-tl-time">{item.time}</p>
                    <h3 className="jd-tl-name">{item.name}</h3>
                    <p className="jd-tl-venue">{item.venue}{item.address ? ` · ${item.address}` : ''}</p>
                    {item.mapsUrl && <a href={item.mapsUrl} target="_blank" rel="noopener noreferrer" className="jd-tl-link">Ver ubicación</a>}
                  </motion.div>
                ))}
              </motion.div>
            </Section>
          )}

          {renderBlocks('itinerary')}

          {/* ── DESTINO ── */}
          {hasDestination && (
            <Section bg="paper" edge={<BleedGradient from="paper-deep" to="paper" />} style={{ position: 'relative', overflow: 'hidden' }}>
              <LeafyBlob id="jd-wc-destination" seed={19} fill="var(--terracotta)" opacity={0.1} style={{ top: '30%', right: '-6rem' }} />
              <SectionHeading eyebrow="Viaje" title="Hospedaje y transporte" variant="offset" />
              <div style={{ maxWidth: 760, margin: '0 auto' }}>
                {!!config.destination!.hotels?.length && (
                  <motion.div className="jd-hotels-grid" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={staggerChildren}>
                    {config.destination!.hotels!.map((h, i) => (
                      <motion.div key={i} className="jd-hotel-card" variants={staggerItem}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          {i === 0 ? <span className="jd-tag">Sede del evento</span> : <span />}
                          <Hotel size={16} style={{ color: 'var(--sage)', flexShrink: 0 }} />
                        </div>
                        <p className="jd-heading name">{h.name}</p>
                        {h.category && <p style={{ fontSize: 12, opacity: 0.65 }}>{h.category}</p>}
                        {h.address && <p style={{ fontSize: 13, opacity: 0.7 }}>{h.address}</p>}
                        {h.note && <p style={{ fontSize: 12, opacity: 0.6, fontStyle: 'italic' }}>{h.note}</p>}
                        {h.phone && <a href={`tel:${h.phone.replace(/\s/g, '')}`} style={{ fontSize: 12, marginTop: 4, display: 'inline-block' }}>{h.phone}</a>}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                {config.destination!.transport?.info && (
                  <div className="jd-transport-card">
                    <Car size={22} style={{ color: 'var(--terracotta)', marginBottom: '0.75rem' }} />
                    <p style={{ fontSize: 14, opacity: 0.75, maxWidth: 480, margin: '0 auto 1.25rem' }}>{config.destination!.transport!.info}</p>
                    {!!config.destination!.transport!.schedule?.length && (
                      <motion.div className="jd-transport-schedule" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={staggerChildren}>
                        {config.destination!.transport!.schedule!.map((s, i) => (
                          <motion.div key={i} className="jd-transport-row" variants={staggerItem}>
                            <span className="jd-transport-time">{s.time}</span>
                            <span className="jd-transport-dot" />
                            <span className="jd-transport-detail">{s.detail}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* ── DETALLES: dress code, regalos, notas y evento para adultos, todo en tarjetas del mismo tamaño ── */}
          {hasDetails && (
            <Section bg="paper-deep" edge={preDetailsBg !== 'paper-deep' ? <BleedGradient from={preDetailsBg} to="paper-deep" /> : undefined} style={{ position: 'relative', overflow: 'hidden' }}>
              <LeafyBlob id="jd-wc-details" seed={31} fill="var(--sage-light)" opacity={0.14} style={{ bottom: '-5rem', left: '-4rem' }} />
              <SectionHeading eyebrow="Importante" title="Detalles para el gran día" variant="offset" />
              <div className="jd-details-cards">
                {hasDressCode && (
                  <div className="jd-detail-card">
                    <div className="jd-detail-head">
                      <div className="jd-detail-icon"><Shirt size={16} /></div>
                      <h3>Código de vestimenta</h3>
                    </div>
                    <span className="jd-dress-label">{config.dressCode!.label}</span>
                    <div className="jd-dress-cols">
                      <div><h4>Ellas</h4><p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>{config.dressCode!.women}</p></div>
                      <div><h4>Ellos</h4><p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>{config.dressCode!.men}</p></div>
                    </div>
                    {!!config.dressCode!.swatches?.length && (
                      <div>
                        <p className="jd-swatches-label">Colores sugeridos</p>
                        <motion.div className="jd-swatches" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={staggerChildren}>
                          {config.dressCode!.swatches!.map((s, i) => (
                            <motion.div key={i} className="jd-swatch" variants={staggerItem}>
                              <div className="jd-swatch-dot" style={{ backgroundColor: s.color }} />
                              <span>{s.name}</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    )}
                    {!!config.dressCode!.avoid?.length && (
                      <div style={{ marginTop: '1.5rem' }}>
                        <p className="jd-swatches-label">Por favor evita</p>
                        <motion.div className="jd-swatches" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={staggerChildren}>
                          {config.dressCode!.avoid!.map((s, i) => (
                            <motion.div key={i} className="jd-swatch jd-swatch--avoid" variants={staggerItem}>
                              <div className="jd-swatch-dot" style={{ backgroundColor: s.color }}>
                                <span className="jd-swatch-x">
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
                                  </svg>
                                </span>
                              </div>
                              <span>{s.name}</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    )}
                  </div>
                )}

                {hasGifts && (() => {
                  const gifts = config.gifts!;
                  return (
                    <div className="jd-detail-card">
                      <div className="jd-detail-head">
                        <div className="jd-detail-icon"><Gift size={16} /></div>
                        <h3>Regalos</h3>
                      </div>
                      {showTransfer && gifts.bank && (
                        <div className="jd-gift-block">
                          {[
                            { label: 'Banco', value: gifts.bank },
                            { label: 'Nombre', value: gifts.holder },
                            { label: 'Cuenta', value: gifts.account },
                            { label: 'CLABE', value: gifts.clabe },
                          ].filter(r => r.value).map(r => (
                            <div key={r.label} className="jd-gift-row">
                              <span className="lbl">{r.label}</span>
                              <span className="val">{r.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {showList && gifts.giftListUrl && (
                        <div className="jd-gift-block">
                          <p className="jd-heading" style={{ fontSize: '1.05rem', fontStyle: 'italic' }}>Mesa de regalos</p>
                          {gifts.giftListLabel && <p style={{ fontSize: 12, opacity: 0.65 }}>{gifts.giftListLabel}</p>}
                          <a href={gifts.giftListUrl} target="_blank" rel="noopener noreferrer" className="jd-gift-link">Ver lista →</a>
                        </div>
                      )}
                      {showEnvelope && (
                        <div className="jd-gift-block">
                          <p className="jd-heading" style={{ fontSize: '1.05rem', fontStyle: 'italic' }}>Sobre de regalo</p>
                          <p style={{ fontSize: 12, opacity: 0.65 }}>{gifts.envelopeMessage || 'Con gusto recibimos sobres el día del evento'}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {hasNotes && (
                  <div className="jd-detail-card">
                    <div className="jd-detail-head">
                      <div className="jd-detail-icon"><Info size={16} /></div>
                      <h3>Recomendaciones</h3>
                    </div>
                    <div className="jd-notes">
                      {config.notes!.filter(n => n?.trim()).map((note, i) => (
                        <div key={i} className="jd-note">
                          <span className="jd-note-mark">{String(i + 1).padStart(2, '0')}</span>
                          <p style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.6 }}>{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {config.noChildren && (
                  <div className="jd-detail-card" style={{ alignItems: 'center', textAlign: 'center' }}>
                    <div className="jd-detail-head" style={{ flexDirection: 'column' }}>
                      <div className="jd-detail-icon"><UserX size={16} /></div>
                      <h3>Evento para adultos</h3>
                    </div>
                    <p style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.6 }}>
                      {config.noChildrenMessage || 'Con todo nuestro cariño, les pedimos que esta celebración sea exclusiva para adultos. Agradecemos su comprensión.'}
                    </p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* ── RSVP fusionado con el footer: entra con degradado difuminado + la única rama decorativa ── */}
          <div aria-hidden="true" style={{
            height: 340,
            background: `linear-gradient(to bottom, ${BG[preFooterBg]} 0%, ${BG[preFooterBg]} 12%, color-mix(in oklab, ${BG[preFooterBg]} 55%, var(--olive-deep)) 55%, var(--olive-deep) 90%, var(--olive-deep) 100%)`,
          }} />
          <footer className="jd-footer">
            <RsvpDivider />
            <SectionHeading eyebrow="RSVP" title="Confirma tu asistencia" />
            <p className="jd-footer-blurb">
              Será un verdadero honor celebrar este inicio contigo. Por favor confirma tu asistencia.
            </p>
            {!rsvpDone ? (
              caps.rsvpMode === 'whatsapp' && config.whatsapp?.number ? (
                <a href={`https://wa.me/${config.whatsapp.number}?text=${encodeURIComponent(config.whatsapp.message ?? '')}`} target="_blank" rel="noopener noreferrer" className="jd-btn">
                  Confirmar por WhatsApp
                </a>
              ) : (
                <button className="jd-btn" onClick={() => setIsRsvpOpen(true)}>Confirmar asistencia</button>
              )
            ) : (
              <div>
                <span className="jd-rsvp-done"><Check size={16} /> {guestConfirmed === false ? 'No asistiré' : '¡Confirmado!'}</span>
                <button className="jd-rsvp-edit" onClick={() => { setRsvpDone(false); setGuestConfirmed(null); setIsRsvpOpen(true); }}>
                  Actualizar respuesta
                </button>
              </div>
            )}

            <div className="jd-footer-divider" />
            <p className="jd-footer-mono">{config.couple?.person1?.[0]} &amp; {config.couple?.person2?.[0]}</p>
            <p className="jd-footer-names">{config.couple?.person1} &amp; {config.couple?.person2}</p>
            <p className="jd-footer-date">{config.date?.day} · {config.date?.month} · {config.date?.year}{config.location ? ` · ${config.location}` : ''}</p>
            <p className="jd-footer-powered">powered by <span className="jd-footer-brand">moments</span></p>
          </footer>

          {/* ── MODAL RSVP ── */}
          {isRsvpOpen && (caps.rsvpMode === 'modalManual' || hasToken || isDemo) && (
            <div className="jd-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setIsRsvpOpen(false); }}>
              <div className="jd-modal" ref={modalRef}>
                <button className="jd-modal-close" onClick={() => setIsRsvpOpen(false)} aria-label="Cerrar">×</button>

                {rsvpDone ? (
                  <div className="jd-modal-body" style={{ alignItems: 'center', textAlign: 'center', padding: '3rem 2rem' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(139,149,116,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={22} style={{ color: 'var(--sage)' }} />
                    </div>
                    <h3 className="jd-modal-title">{guestConfirmed === false ? 'Respuesta registrada' : '¡Nos vemos en el jardín!'}</h3>
                    <p style={{ fontSize: 13, opacity: 0.65, lineHeight: 1.7 }}>
                      {guestConfirmed === false ? 'Lamentamos no poder verte. Gracias por avisarnos.' : 'Tu confirmación fue registrada. Estamos felices de celebrar contigo.'}
                    </p>
                  </div>
                ) : (
                  <div className="jd-modal-body">
                    <div style={{ textAlign: 'center' }}>
                      <span className="jd-tag" style={{ marginBottom: '0.75rem' }}>Confirmación de asistencia</span>
                      <h3 className="jd-modal-title">¡Hola {displayName}!</h3>
                      <p style={{ fontSize: 13, opacity: 0.6, marginTop: '0.5rem' }}>Nos encantaría que nos acompañaras en nuestro gran día.</p>
                    </div>

                    <div className="jd-guest-card">
                      <div className="jd-guest-avatar">{displayName.charAt(0)}</div>
                      <div style={{ textAlign: 'left' }}>
                        <p className="jd-tag" style={{ fontSize: 8 }}>Invitado</p>
                        <p style={{ fontSize: 15 }}>{displayName}</p>
                        <p style={{ fontSize: 11, opacity: 0.55 }}>{totalSeats} {totalSeats === 1 ? 'lugar' : 'lugares'} reservados</p>
                      </div>
                    </div>

                    {submitError && <p className="jd-error">{submitError}</p>}

                    {guestConfirmed === null ? (
                      <div className="jd-choice">
                        <button className="jd-choice-yes" onClick={() => {
                          setGuestConfirmed(true);
                          if (isPlus) { setAttendeeNames([]); setAttendeeChecked([]); }
                          else {
                            const names = isDemo
                              ? ['Acompañante 1', 'Acompañante 2']
                              : (initialCompanionNames.length > 0 ? initialCompanionNames : Array.from({ length: maxCompanions }, (_, i) => `Acompañante ${i + 1}`));
                            setAttendeeNames(names);
                            setAttendeeChecked(Array(names.length).fill(true));
                          }
                        }}>Sí, asistiré</button>
                        <button className="jd-choice-no" onClick={() => setGuestConfirmed(false)}>No podré ir</button>
                      </div>
                    ) : guestConfirmed ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ textAlign: 'center', fontSize: 15, fontStyle: 'italic' }} className="jd-heading">¡Perfecto! Te esperamos.</p>

                        <div className="jd-attendees">
                          <p className="jd-tag" style={{ fontSize: 8, marginBottom: 4 }}>¿Quiénes asistirán?</p>
                          <div className="jd-attendee-row">
                            <span className="jd-attendee-check on"><Check size={12} /></span>
                            <span style={{ flex: 1 }}>{displayName}</span>
                            <span style={{ fontSize: 9, opacity: 0.6 }}>Titular</span>
                          </div>

                          {isPlus ? (
                            effectiveMaxCompanions > 0 && (
                              <>
                                <div className="jd-stepper">
                                  <button type="button" disabled={attendeeNames.length === 0}
                                    onClick={() => { setAttendeeNames(p => p.slice(0, -1)); setAttendeeChecked(p => p.slice(0, -1)); }}>−</button>
                                  <span style={{ fontSize: 14 }}>{attendeeNames.length}</span>
                                  <button type="button" disabled={attendeeNames.length >= effectiveMaxCompanions}
                                    onClick={() => { setAttendeeNames(p => [...p, '']); setAttendeeChecked(p => [...p, true]); }}>+</button>
                                </div>
                                {attendeeNames.map((name, i) => (
                                  <input key={i} type="text" className="jd-input" value={name} placeholder={`Nombre del acompañante ${i + 1}`}
                                    onChange={(e) => { const next = [...attendeeNames]; next[i] = e.target.value; setAttendeeNames(next); }} />
                                ))}
                              </>
                            )
                          ) : (
                            attendeeNames.map((name, i) => {
                              const attending = attendeeChecked[i] ?? true;
                              return (
                                <div key={i} className="jd-attendee-row">
                                  <span className={`jd-attendee-check${attending ? ' on' : ''}`} onClick={() => { const u = [...attendeeChecked]; u[i] = !u[i]; setAttendeeChecked(u); }}>
                                    {attending && <Check size={12} />}
                                  </span>
                                  <span style={{ flex: 1, opacity: attending ? 1 : 0.4, textDecoration: attending ? 'none' : 'line-through' }}>{name}</span>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {(dietary.enabled && (dietary.options?.length ?? 0) > 0) && (() => {
                          const attendingPeople = [displayName, ...attendeeNames.filter((_, i) => attendeeChecked[i] ?? true)];
                          return (
                            <div>
                              {attendingPeople.map((personName, pi) => (
                                <div key={pi} style={{ marginBottom: '0.75rem' }}>
                                  <p className="jd-dietary-person">{personName}</p>
                                  <details>
                                    <summary className="jd-dietary-summary">
                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {dietaryMap[personName]?.length ? dietaryMap[personName].join(', ') : 'Restricciones alimentarias'}
                                      </span>
                                      <ChevronDown size={13} />
                                    </summary>
                                    <div className="jd-dietary-options">
                                      {dietary.options!.map(opt => (
                                        <label key={opt} className="jd-dietary-option">
                                          <input type="checkbox" checked={dietaryMap[personName]?.includes(opt) || false}
                                            onChange={(e) => setDietaryMap(prev => {
                                              const cur = prev[personName] || [];
                                              return { ...prev, [personName]: e.target.checked ? [...cur, opt] : cur.filter(x => x !== opt) };
                                            })} />
                                          <span>{opt}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </details>
                                </div>
                              ))}
                            </div>
                          );
                        })()}

                        {isDemo ? (
                          <p className="jd-demo-flag">Vista previa · Los datos no se guardan</p>
                        ) : (
                          <button className="jd-submit" onClick={handleSubmitRsvp} disabled={submitting}>{submitting ? 'Guardando…' : 'Confirmar asistencia'}</button>
                        )}
                        <button className="jd-linklike" onClick={() => { setGuestConfirmed(null); setAttendeeNames([]); setAttendeeChecked([]); setSubmitError(''); }}>Cambiar respuesta</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <p style={{ fontSize: 14, opacity: 0.7, textAlign: 'center' }}>Lamentamos no poder verte, gracias por avisarnos.</p>
                        {isDemo ? (
                          <p className="jd-demo-flag" style={{ width: '100%' }}>Vista previa · Los datos no se guardan</p>
                        ) : (
                          <button className="jd-submit" onClick={handleSubmitRsvp} disabled={submitting}>{submitting ? 'Guardando…' : 'Enviar respuesta'}</button>
                        )}
                        <button className="jd-linklike" onClick={() => { setGuestConfirmed(null); setSubmitError(''); }}>Cambiar respuesta</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ContentProtection>
    </div>
  );
}
