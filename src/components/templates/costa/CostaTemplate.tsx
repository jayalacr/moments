'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Cormorant_Garamond, Jost, Fraunces } from 'next/font/google';
import { Play, Pause, Hotel, Car, UserX, ChevronDown, Check, Gift, Shirt, Info } from 'lucide-react';
import type { PhotoEntry } from '@/lib/imageLayout';
import ContentProtection from '@/components/templates/shared/ContentProtection';
import { getCapabilities } from '@/lib/plans';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '600'], style: ['normal', 'italic'], variable: '--font-cormorant' });
const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-jost' });
const fraunces = Fraunces({ subsets: ['latin'], style: ['normal', 'italic'], axes: ['SOFT', 'WONK', 'opsz'], variable: '--font-fraunces' });

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

export interface CostaConfig {
  theme?: {
    accentColor?: string;
    displayFont?: 'cormorant' | 'cinzel';
    bodyFont?: 'jost';
  };
  couple?: { person1?: string; person2?: string };
  fullNames?: { person1?: string; person2?: string };
  date?: { day?: string; month?: string; year?: string };
  location?: string;
  targetDate?: string;
  quote?: { text?: string; reference?: string };
  parents?: { person1?: string; person2?: string };
  godparents?: { person1?: string; person2?: string };
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
  config: CostaConfig;
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
// Styles — identidad "Costa": arena, laguna turquesa, coral, champán
// Cada sección varía de composición (no todas son "eyebrow + bloque centrado")
// ---------------------------------------------------------------------------
const css = `
  :root {
    --foam:       #FFFCF7;
    --sand:       #F4EADA;
    --wet-sand:   #E3D3BC;
    --lagoon:     #1F9B9B;
    --shallow:    #7FCFC8;
    --coral:      #E2725B;
    --coral-soft: #F2A38C;
    --deep:       #0B2A31;
    --ink:        #14343B;
    --champagne:  #C2A26B;
    --font-cormorant: 'Cormorant Garamond';
    --font-fraunces: 'Fraunces';
    --font-jost: 'Jost';
  }

  .cs-root { background: var(--foam); color: var(--ink); font-family: var(--font-jost), sans-serif; overflow-x: hidden; }
  .cs-display { font-family: var(--font-cormorant), serif; }
  .cs-heading { font-family: var(--font-fraunces), serif; letter-spacing: -0.01em; font-variation-settings: 'SOFT' 60, 'WONK' 1, 'opsz' 48; }
  .cs-eyebrow { font-family: var(--font-jost), sans-serif; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--champagne); }

  .cs-section { padding: 5rem 1.5rem; }
  @media (min-width: 768px) { .cs-section { padding: 7rem 4rem; } }
  .cs-section--sand { background: var(--sand); }
  .cs-section--deep { background: var(--deep); color: var(--foam); }

  .cs-heading-block { text-align: center; margin-bottom: 3.5rem; }
  .cs-heading-block h2 { font-size: clamp(1.9rem, 4vw, 2.6rem); margin-top: 0.75rem; }
  .cs-heading-rule { width: 34px; height: 1px; background: var(--champagne); opacity: 0.55; margin: 1.1rem auto 0; }
  .cs-heading-block--offset { text-align: left; margin-bottom: 3rem; max-width: 480px; padding-left: 1.25rem; border-left: 2px solid var(--champagne); }
  .cs-heading-block--offset h2 { margin-top: 0.4rem; }

  /* ── Hero: pantalla dividida, no foto full-bleed con texto encima ── */
  .cs-hero { position: relative; display: flex; flex-direction: column; min-height: 100svh; overflow: hidden; }
  @media (min-width: 900px) { .cs-hero { flex-direction: row; } }
  .cs-hero-photo { position: relative; flex: 1; min-height: 46svh; overflow: hidden; }
  @media (min-width: 900px) { .cs-hero-photo { flex: 0 0 58%; min-height: 100svh; } }
  .cs-hero-img-wrap { position: absolute; inset: -10% 0; }
  .cs-hero-img { width: 100%; height: 120%; object-fit: cover; }
  .cs-hero-panel { flex: 1; background: var(--deep); color: var(--foam); display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 1.1rem; padding: 3rem 2rem; text-align: left; }
  @media (min-width: 900px) { .cs-hero-panel { flex: 0 0 42%; padding: 3rem 3.5rem; } }
  .cs-hero-label { font-family: var(--font-jost), sans-serif; font-size: 13px; letter-spacing: 0.4em; text-transform: uppercase; opacity: 0.8; }
  .cs-hero-names { font-family: var(--font-cormorant), serif; font-weight: 300; font-style: italic; font-size: clamp(2.9rem, 8.5vw, 5rem); line-height: 1.05; }
  .cs-hero-amp { display: block; font-family: var(--font-cormorant), serif; color: var(--champagne); font-style: normal; }
  .cs-hero-rule { width: 46px; height: 1px; background: var(--champagne); opacity: 0.6; }
  .cs-hero-meta { display: flex; flex-direction: column; gap: 0.4rem; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.8; }

  /* ── Loader: monograma + línea de horizonte que se dibuja ── */
  .cs-loader { position: fixed; inset: 0; background: var(--deep); z-index: 999; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.25rem; transition: opacity 0.6s ease, transform 0.6s ease; }
  .cs-loader--out { opacity: 0; transform: scale(1.03); pointer-events: none; }
  .cs-loader-mono { font-family: var(--font-cormorant), serif; font-style: italic; color: var(--foam); font-size: clamp(2.2rem, 6vw, 3.2rem); animation: csFadeUp 0.8s ease 0.1s both; }
  .cs-loader-line { width: 0; height: 1px; background: var(--champagne); animation: csLineGrow 1.1s cubic-bezier(0.16,1,0.3,1) 0.45s forwards; }
  @keyframes csLineGrow { to { width: 64px; } }
  .cs-loader-date { color: rgba(255,255,255,0.65); font-size: 13px; letter-spacing: 0.25em; text-transform: uppercase; animation: csFadeUp 0.8s ease 0.7s both; }
  @keyframes csFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  /* ── Music toggle ── */
  .cs-music { position: fixed; bottom: 1.75rem; right: 1.75rem; z-index: 100; display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem 1.1rem; border-radius: 100px; background: var(--deep); color: var(--foam); border: 1px solid rgba(255,255,255,0.15); cursor: pointer; font-size: 11px; letter-spacing: 0.1em; box-shadow: 0 10px 30px rgba(14,43,51,0.25); }
  .cs-music-bars { display: flex; align-items: flex-end; gap: 2px; height: 12px; }
  .cs-music-bars span { width: 2px; background: var(--lagoon); border-radius: 2px; animation: csBar 0.9s ease-in-out infinite alternate; }
  .cs-music-bars span:nth-child(2) { animation-delay: 0.2s; }
  .cs-music-bars span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes csBar { from { height: 3px; } to { height: 12px; } }

  /* ── Countdown: fichas tipo arco, no círculos ── */
  .cs-countdown { display: flex; justify-content: center; align-items: flex-end; gap: 0.4rem; flex-wrap: nowrap; }
  @media (min-width: 480px) { .cs-countdown { gap: 0.85rem; } }
  .cs-cd-pill { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 62px; padding: 0.9rem 0.35rem 0.7rem; border-radius: 32px 32px 8px 8px; background: var(--foam); border: 1px solid rgba(185,151,91,0.35); border-top: 2px solid var(--champagne); box-shadow: 0 12px 30px rgba(14,43,51,0.07); }
  @media (min-width: 480px) { .cs-cd-pill { width: 78px; padding: 1.35rem 0.5rem 1rem; border-radius: 40px 40px 8px 8px; } }
  @media (min-width: 768px) { .cs-cd-pill { width: 98px; padding: 1.75rem 0.5rem 1.25rem; } }
  .cs-cd-num { font-family: var(--font-fraunces), serif; font-size: 1.15rem; color: var(--ink); white-space: nowrap; }
  @media (min-width: 480px) { .cs-cd-num { font-size: 1.6rem; } }
  @media (min-width: 768px) { .cs-cd-num { font-size: 2.1rem; } }
  .cs-cd-lbl { font-size: 7px; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.5; margin-top: 0.25rem; white-space: nowrap; }
  @media (min-width: 480px) { .cs-cd-lbl { font-size: 8px; letter-spacing: 0.2em; margin-top: 0.3rem; } }

  /* ── Cita: pull-quote a ancho completo sobre foto, no tarjeta aislada ── */
  .cs-quote-bleed { position: relative; min-height: 68svh; display: flex; align-items: center; background-size: cover; background-position: center; }
  .cs-quote-bleed-tint { position: absolute; inset: 0; background: linear-gradient(115deg, rgba(14,43,51,0.82) 0%, rgba(14,43,51,0.4) 55%, rgba(14,43,51,0.15) 100%); }
  .cs-quote-bleed-content { position: relative; z-index: 2; max-width: 560px; margin: 0 8% 0 6%; color: var(--foam); padding: 2rem 0; }
  .cs-quote-mark { display: block; font-family: var(--font-cormorant), serif; font-style: italic; font-size: 5rem; color: var(--champagne); opacity: 0.6; line-height: 1; transform: rotate(-6deg); margin-bottom: -1.5rem; }
  .cs-quote-bleed-content p.txt { font-family: var(--font-cormorant), serif; font-style: italic; font-size: clamp(1.4rem, 3vw, 2rem); line-height: 1.5; }
  .cs-quote-bleed-content .cs-eyebrow { color: var(--champagne); margin-top: 1.25rem; display: block; }

  /* ── Sección de padres: bloque propio, ya no una nota escondida ── */
  .cs-itinerary-section { position: relative; }
  .cs-parents-section { max-width: 720px; margin: 0 auto; display: grid; gap: 2.5rem; text-align: center; }
  @media (min-width: 640px) { .cs-parents-section { grid-template-columns: 1fr auto 1fr; align-items: center; gap: 1.5rem; } }
  .cs-parents-block .role { font-family: var(--font-cormorant), serif; font-style: italic; font-size: 1.3rem; color: var(--coral); margin-bottom: 0.65rem; }
  .cs-parents-block .names { display: flex; flex-direction: column; gap: 0.3rem; font-size: 15px; line-height: 1.5; opacity: 0.85; }
  .cs-parents-block .names .amp { font-family: var(--font-cormorant), serif; font-style: italic; color: var(--champagne); font-size: 0.85rem; }
  .cs-parents-divider { width: 1px; height: 64px; background: var(--champagne); opacity: 0.4; margin: 0 auto; }
  @media (max-width: 639px) { .cs-parents-divider { width: 40px; height: 1px; } }

  /* ── Itinerario: vertical en móvil, recorrido horizontal en escritorio ── */
  .cs-timeline { max-width: 640px; margin: 0 auto; position: relative; padding-left: 2rem; padding-top: 1rem; display: flex; flex-direction: column; gap: 0; }
  .cs-timeline::before { content: ''; position: absolute; left: 7px; top: 1.4rem; bottom: 0.4rem; width: 1px; background: repeating-linear-gradient(to bottom, var(--lagoon) 0 6px, transparent 6px 12px); }
  .cs-tl-item { position: relative; padding-bottom: 3rem; }
  .cs-tl-item:last-child { padding-bottom: 0; }
  .cs-tl-item:nth-child(even) { padding-left: 1.5rem; }
  .cs-tl-dot { position: absolute; left: -2rem; top: 1.2rem; width: 15px; height: 15px; border-radius: 50%; background: var(--lagoon); border: 3px solid var(--foam); box-shadow: 0 0 0 1px rgba(42,172,166,0.4); }
  .cs-tl-photo { width: var(--tl-photo, 140px); max-width: 100%; aspect-ratio: 4 / 3; border-radius: 14px; overflow: hidden; margin: 0 auto 0.85rem; box-shadow: 0 14px 28px rgba(14,43,51,0.1); }
  .cs-tl-photo img { width: 100%; height: 100%; object-fit: cover; }
  .cs-tl-time { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--lagoon); }
  .cs-tl-name { font-family: var(--font-cormorant), serif; font-size: var(--tl-name-size, 1.5rem); margin: 0.2rem 0; }
  .cs-tl-venue { font-size: 13px; opacity: 0.75; }
  .cs-tl-link { display: inline-block; margin-top: 0.6rem; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--coral); text-decoration: none; border-bottom: 1px solid var(--coral); }
  @media (min-width: 900px) {
    .cs-timeline { flex-direction: row; flex-wrap: wrap; justify-content: center; max-width: 100%; padding-left: 0; padding-bottom: 1rem; }
    .cs-timeline::before { left: 0; right: 0; top: 1.4rem; bottom: auto; height: 1px; width: auto; background: repeating-linear-gradient(to right, var(--lagoon) 0 6px, transparent 6px 12px); }
    .cs-tl-item { flex: 0 1 var(--tl-item-basis, 220px); padding: 3rem 1.25rem 0; padding-bottom: 0; text-align: center; }
    .cs-tl-item:nth-child(even) { padding-left: 1.25rem; }
    .cs-tl-dot { left: 50%; top: 1rem; transform: translateX(-50%); }
  }

  /* ── Fotos: una rompe el contenedor (breakout), el resto dispersas ── */
  .cs-photo-breakout { width: 100vw; position: relative; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; aspect-ratio: 21 / 9; overflow: hidden; margin-bottom: 3rem; }
  .cs-photo-breakout img { width: 100%; height: 100%; object-fit: cover; }
  .cs-photos-wrap { max-width: 900px; margin: 0 auto; padding: 0 1.5rem 5rem; display: flex; flex-direction: column; gap: 3rem; }
  .cs-photo { position: relative; aspect-ratio: 16 / 10; overflow: hidden; }
  .cs-photo img { width: 100%; height: 100%; object-fit: cover; }
  .cs-photo--arch { border-radius: 999px 999px 8px 8px / 45% 45% 2% 2%; box-shadow: 0 20px 40px rgba(14,43,51,0.12); }
  .cs-photo--oval { border-radius: 50%; aspect-ratio: 4 / 3; box-shadow: 0 20px 40px rgba(14,43,51,0.12); }
  .cs-photo--bleed { border-radius: 0; margin-inline: -8vw; }
  .cs-photo--tint::after { content: ''; position: absolute; inset: 0; background: var(--lagoon); mix-blend-mode: multiply; opacity: 0.35; }

  /* ── Hoteles: tarjetas uniformes, misma forma para todas ── */
  .cs-hotels-grid { max-width: 760px; margin: 0 auto; display: grid; gap: 1.25rem; }
  @media (min-width: 640px) { .cs-hotels-grid { grid-template-columns: 1fr 1fr; } }
  .cs-hotel-card { border-radius: 18px; padding: 1.75rem; background: var(--foam); border: 1px solid rgba(42,172,166,0.2); box-shadow: 0 14px 32px rgba(14,43,51,0.06); display: flex; flex-direction: column; gap: 0.4rem; text-align: left; }
  .cs-hotel-card .name { font-size: 1.2rem; }
  .cs-hotel-card .badge { display: inline-flex; align-self: flex-start; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--lagoon); background: rgba(42,172,166,0.1); border-radius: 100px; padding: 0.25rem 0.65rem; margin-bottom: 0.5rem; }
  .cs-transport-card { max-width: 640px; margin: 2.75rem auto 0; text-align: center; border-radius: 18px; padding: 2.25rem 1.75rem; background: var(--foam); border: 1px solid rgba(42,172,166,0.2); box-shadow: 0 14px 32px rgba(14,43,51,0.06); }
  .cs-transport-schedule { display: flex; flex-direction: column; gap: 0.9rem; max-width: 320px; margin: 0 auto; }
  .cs-transport-row { display: grid; grid-template-columns: 64px auto 1fr; align-items: center; gap: 0.75rem; text-align: left; }
  .cs-transport-time { font-family: var(--font-fraunces), serif; font-size: 13px; color: var(--lagoon); text-align: right; }
  .cs-transport-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--coral); justify-self: center; }
  .cs-transport-detail { font-size: 13px; opacity: 0.75; }

  /* ── Detalles: tres tarjetas independientes del mismo tamaño, no una mezcla ── */
  .cs-details-cards { display: flex; flex-wrap: wrap; justify-content: center; align-items: stretch; gap: 1.5rem; max-width: 1180px; margin: 0 auto; }
  .cs-detail-card { display: flex; flex-direction: column; flex: 1 1 320px; max-width: 380px; background: var(--foam); border: 1px solid rgba(42,172,166,0.2); border-radius: 18px; padding: 1.75rem; box-shadow: 0 14px 32px rgba(14,43,51,0.06); text-align: left; }
  .cs-detail-head { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
  .cs-detail-icon { width: 34px; height: 34px; border-radius: 10px; background: rgba(42,172,166,0.12); display: flex; align-items: center; justify-content: center; color: var(--lagoon); flex-shrink: 0; }
  .cs-detail-head h3 { font-family: var(--font-fraunces), serif; font-size: 1.05rem; }
  .cs-dress-label { display: inline-block; padding: 0.5rem 1.5rem; border: 1px solid var(--lagoon); border-radius: 100px; font-family: var(--font-fraunces), serif; font-size: 0.85rem; letter-spacing: 0.15em; margin-bottom: 1.5rem; }
  .cs-dress-cols { display: grid; gap: 1.5rem; margin-bottom: 1.75rem; }
  @media (min-width: 420px) { .cs-dress-cols { grid-template-columns: 1fr 1fr; } }
  .cs-dress-cols h4 { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--coral); margin-bottom: 0.5rem; }
  .cs-swatches { display: flex; gap: 1.25rem; flex-wrap: wrap; }
  .cs-swatches-label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--coral); margin-bottom: 0.75rem; }
  .cs-swatch { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
  .cs-swatch-dot { width: 40px; height: 40px; border-radius: 50%; box-shadow: 0 6px 16px rgba(14,43,51,0.12); }
  .cs-swatch span { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.6; }
  .cs-swatch--avoid .cs-swatch-dot { position: relative; opacity: 0.55; box-shadow: none; border: 1px solid rgba(226,114,91,0.4); }
  .cs-swatch-x { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
  .cs-gift-block { padding-top: 1.1rem; margin-top: 1.1rem; border-top: 1px dashed rgba(42,172,166,0.25); display: flex; flex-direction: column; gap: 0.6rem; }
  .cs-gift-block:first-child { padding-top: 0; margin-top: 0; border-top: none; }
  .cs-gift-row { display: flex; flex-direction: column; gap: 0.1rem; }
  .cs-gift-row span.lbl { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.5; }
  .cs-gift-row span.val { font-size: 13px; }
  .cs-gift-link { align-self: flex-start; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--coral); text-decoration: none; border-bottom: 1px solid var(--coral); }
  .cs-notes { display: flex; flex-direction: column; gap: 1rem; }
  .cs-note { display: flex; gap: 0.85rem; align-items: flex-start; }
  .cs-note-mark { color: var(--coral); font-family: var(--font-cormorant), serif; font-style: italic; font-size: 1.05rem; flex-shrink: 0; }

  /* ── RSVP fusionado con el footer: un solo cierre ── */
  .cs-footer { background: var(--deep); color: var(--foam); text-align: center; padding: 6rem 1.5rem 3.5rem; }
  .cs-footer .cs-heading-block h2 { color: var(--foam); }
  .cs-footer-blurb { max-width: 420px; margin: -2rem auto 2.5rem; font-size: 14px; opacity: 0.7; line-height: 1.7; }
  .cs-btn { display: inline-block; background: var(--champagne); color: var(--deep); padding: 1.1rem 3rem; border-radius: 100px; font-family: var(--font-jost), sans-serif; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; border: 1px solid var(--champagne); cursor: pointer; text-decoration: none; box-shadow: 0 14px 30px rgba(0,0,0,0.25); transition: transform 0.25s ease, background 0.25s ease; }
  .cs-btn:hover { background: var(--foam); transform: translateY(-2px); }
  .cs-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .cs-rsvp-done { display: inline-flex; align-items: center; gap: 0.6rem; background: rgba(185,151,91,0.12); border: 1px solid rgba(185,151,91,0.35); color: var(--champagne); padding: 0.85rem 1.75rem; border-radius: 100px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; }
  .cs-rsvp-edit { display: block; margin-top: 0.9rem; font-size: 11px; text-decoration: underline; opacity: 0.6; cursor: pointer; background: none; border: none; color: var(--foam); }
  .cs-footer-divider { width: 60px; height: 1px; background: rgba(255,255,255,0.15); margin: 3.5rem auto 2.25rem; }
  .cs-footer-mono { font-family: var(--font-cormorant), serif; font-style: italic; font-size: 2rem; color: var(--coral); opacity: 0.7; margin-bottom: 0.4rem; }
  .cs-footer-names { font-family: var(--font-cormorant), serif; font-size: 1.2rem; }
  .cs-footer-date { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.5; margin-top: 0.5rem; }
  .cs-footer-powered { font-size: 9px; letter-spacing: 0.2em; opacity: 0.35; margin-top: 1.75rem; }
  .cs-footer-brand { color: var(--lagoon); }

  /* ── Modal RSVP ── */
  .cs-modal-backdrop { position: fixed; inset: 0; background: rgba(14,43,51,0.7); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .cs-modal { background: var(--foam); border-radius: 24px; width: 100%; max-width: 420px; max-height: 90svh; overflow-y: auto; position: relative; color: var(--ink); }
  .cs-modal-close { position: absolute; top: 1rem; right: 1rem; width: 32px; height: 32px; border-radius: 50%; border: 1px solid rgba(42,172,166,0.3); background: transparent; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .cs-modal-body { padding: 2rem; display: flex; flex-direction: column; gap: 1.25rem; }
  .cs-modal-title { font-family: var(--font-cormorant), serif; font-style: italic; font-size: 1.6rem; text-align: center; }
  .cs-guest-card { display: flex; align-items: center; gap: 1rem; background: var(--sand); border-radius: 14px; padding: 1rem 1.25rem; }
  .cs-guest-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--lagoon); color: white; display: flex; align-items: center; justify-content: center; font-family: var(--font-cormorant), serif; font-style: italic; font-size: 1.3rem; flex-shrink: 0; }
  .cs-choice { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .cs-choice-yes { padding: 0.85rem; border-radius: 12px; background: var(--lagoon); color: white; border: none; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; }
  .cs-choice-no { padding: 0.85rem; border-radius: 12px; background: transparent; border: 1px solid rgba(42,172,166,0.3); font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; }
  .cs-attendees { background: var(--sand); border-radius: 14px; padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.55rem; }
  .cs-attendee-row { display: flex; align-items: center; gap: 0.65rem; font-size: 13px; }
  .cs-attendee-check { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid rgba(42,172,166,0.4); display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; }
  .cs-attendee-check.on { background: rgba(42,172,166,0.15); border-color: var(--lagoon); color: var(--lagoon); }
  .cs-input { width: 100%; padding: 0.7rem 1rem; border: 1px solid rgba(42,172,166,0.3); border-radius: 10px; font-family: var(--font-jost), sans-serif; font-size: 13px; outline: none; }
  .cs-input:focus { border-color: var(--lagoon); }
  .cs-stepper { display: flex; align-items: center; justify-content: center; gap: 1.25rem; margin: 0.5rem 0 0.75rem; }
  .cs-stepper button { width: 30px; height: 30px; border-radius: 50%; border: 1px solid var(--lagoon); background: transparent; color: var(--lagoon); font-size: 16px; cursor: pointer; }
  .cs-stepper button:disabled { opacity: 0.35; cursor: not-allowed; }
  .cs-submit { width: 100%; padding: 0.9rem; border-radius: 100px; background: var(--deep); color: white; border: none; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; }
  .cs-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  .cs-linklike { background: none; border: none; font-size: 11px; text-decoration: underline; opacity: 0.55; cursor: pointer; }
  .cs-demo-flag { text-align: center; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--lagoon); border: 1px solid rgba(42,172,166,0.3); border-radius: 8px; padding: 0.65rem; }
  .cs-error { color: #B5453A; font-size: 12px; text-align: center; }

  /* ── Dietary ── */
  .cs-dietary-person { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--coral); text-align: center; margin-bottom: 0.3rem; }
  .cs-dietary-summary { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 1rem; border: 1px solid rgba(42,172,166,0.3); border-radius: 10px; background: var(--foam); font-size: 12px; cursor: pointer; list-style: none; }
  .cs-dietary-summary::-webkit-details-marker { display: none; }
  .cs-dietary-options { border: 1px solid rgba(42,172,166,0.2); border-radius: 10px; padding: 0.5rem; margin-top: 0.3rem; display: flex; flex-direction: column; gap: 2px; background: var(--sand); }
  .cs-dietary-option { display: flex; align-items: center; gap: 10px; padding: 6px 8px; font-size: 13px; cursor: pointer; }

  /* ── Texturas: grano global + manchas de acuarela ── */
  .cs-grain { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 50; opacity: 0.045; mix-blend-mode: multiply; }
  .cs-watercolor-blob { position: absolute; width: 320px; height: 320px; pointer-events: none; mix-blend-mode: multiply; z-index: 0; }
`;

// ---------------------------------------------------------------------------
// Theme override
// ---------------------------------------------------------------------------
function buildThemeCSS(theme?: CostaConfig['theme']): string {
  if (!theme?.accentColor) return '';
  return `:root {
    --lagoon: ${theme.accentColor};
    --shallow: color-mix(in oklab, ${theme.accentColor} 45%, white);
  }`;
}

// ---------------------------------------------------------------------------
// Transiciones entre secciones: sangrado por degradado, sin separadores
// decorativos. La entrada al RSVP usa un degradado más alto y difuminado.
// ---------------------------------------------------------------------------
const BG: Record<'sand' | 'foam' | 'deep', string> = { sand: 'var(--sand)', foam: 'var(--foam)', deep: 'var(--deep)' };

const BleedGradient = ({ from, to, height = 110 }: { from: 'sand' | 'foam' | 'deep'; to: 'sand' | 'foam' | 'deep'; height?: number }) => (
  <div aria-hidden="true" style={{ height, background: `linear-gradient(to bottom, ${BG[from]}, ${BG[to]})` }} />
);

const InvasionBadge = ({ label, deep = false }: { label: React.ReactNode; deep?: boolean }) => (
  <div style={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'center', marginTop: -28, marginBottom: -28 }} aria-hidden="true">
    <div style={{
      width: 56, height: 56, borderRadius: '50%',
      background: deep ? 'var(--coral)' : 'var(--champagne)',
      color: 'var(--deep)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', fontSize: '1.3rem',
      boxShadow: '0 12px 30px rgba(11,42,49,0.28)',
    }}>
      {label}
    </div>
  </div>
);

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } },
};

// Catálogo de reveals — antes todo usaba fadeUp; ahora cada arquetipo tiene el suyo.
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
  bg = 'foam',
  edge,
  className = '',
  style,
  children,
}: {
  bg?: 'sand' | 'foam' | 'deep';
  edge?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => (
  <>
    {edge}
    <section className={`cs-section ${bg !== 'foam' ? `cs-section--${bg}` : ''} ${className}`.trim()} style={style}>
      {children}
    </section>
  </>
);

const SectionHeading = ({ eyebrow, title, variant = 'centered' }: { eyebrow?: string; title: string; variant?: 'centered' | 'offset' }) => (
  <motion.div
    className={`cs-heading-block${variant === 'offset' ? ' cs-heading-block--offset' : ''}`}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: '-80px' }}
    variants={variant === 'offset' ? slideIn(true) : fadeUp}
  >
    {eyebrow && <p className="cs-eyebrow">{eyebrow}</p>}
    <h2 className="cs-heading">{title}</h2>
    {variant === 'centered' && <span className="cs-heading-rule" />}
  </motion.div>
);

const GrainOverlay = () => (
  <svg className="cs-grain" aria-hidden="true" focusable="false">
    <filter id="cs-grain-filter">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#cs-grain-filter)" />
  </svg>
);

const WatercolorBlob = ({ id, seed, fill, opacity = 0.16, style }: { id: string; seed: number; fill: string; opacity?: number; style?: React.CSSProperties }) => (
  <svg className="cs-watercolor-blob" aria-hidden="true" focusable="false" style={{ opacity, ...style }}>
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
export default function CostaTemplate({
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
  const heroParallaxY = useTransform(heroProgress, [0, 1], ['0%', '18%']);
  const heroPanelParallaxY = useTransform(heroProgress, [0, 1], ['0%', '7%']);

  useEffect(() => {
    const t1 = setTimeout(() => setLoaderOut(true), 1600);
    const t2 = setTimeout(() => setIsLoaded(true), 2200);
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

  const heroPhoto = config.photos?.find(p => p.role === 'hero')?.url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85';
  const allowedBlockPhotos = (config.photos?.filter(p => p.role === 'block') || []).slice(0, caps.maxPhotos - 1);
  const quoteBgPhoto = allowedBlockPhotos[0]?.url || heroPhoto;

  function renderBlocks(afterSection: string) {
    const blocks = allowedBlockPhotos.filter(p => p.afterSection === afterSection);
    if (!blocks.length) return null;
    const [first, ...rest] = blocks;
    return (
      <>
        <motion.div
          className="cs-photo-breakout"
          initial={{ opacity: 0, scale: 1.04 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <img src={first.url} alt="Costa" style={{ objectPosition: first.objectPosition || 'center' }} />
        </motion.div>
        {!!rest.length && (
          <div className="cs-photos-wrap">
            {rest.map((p, i) => {
              const odd = i % 2 === 1;
              const shape = ['arch', 'oval', 'bleed'][i % 3];
              const width = shape === 'bleed' ? undefined : odd ? '64%' : '78%';
              return (
                <motion.div
                  key={i}
                  className={`cs-photo cs-photo--${shape}${i === 0 ? ' cs-photo--tint' : ''}`}
                  style={{ width, marginLeft: shape !== 'bleed' && odd ? 'auto' : undefined, rotate: shape === 'bleed' ? 0 : (odd ? 1.3 : -1) }}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-60px' }}
                  variants={maskReveal}
                >
                  <img src={p.url} alt="Costa" style={{ objectPosition: p.objectPosition || 'center' }} />
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
  const preDetailsBg: 'sand' | 'foam' | 'deep' = hasDestination ? 'foam' : showItinerary ? 'sand' : showParentsNote ? 'deep' : 'sand';
  const preFooterBg: 'sand' | 'foam' | 'deep' = hasDetails ? 'sand' : preDetailsBg;

  const formatParents = (s?: string) => (s || 'Sus padres').split('&').map(p => p.trim()).filter(Boolean);

  const itineraryCount = config.itinerary?.length ?? 0;
  const timelineVars = {
    '--tl-photo': itineraryCount <= 3 ? '160px' : itineraryCount === 4 ? '130px' : '105px',
    '--tl-name-size': itineraryCount <= 3 ? '1.65rem' : itineraryCount === 4 ? '1.4rem' : '1.2rem',
    '--tl-item-basis': itineraryCount <= 3 ? '240px' : itineraryCount === 4 ? '200px' : '170px',
  } as React.CSSProperties;

  return (
    <div className="flex-1 flex flex-col">
      <ContentProtection enabled={true}>
        <div className={`cs-root ${cormorant.variable} ${jost.variable} ${fraunces.variable}`}>
          <style dangerouslySetInnerHTML={{ __html: css }} />
          {themeCSS && <style dangerouslySetInnerHTML={{ __html: themeCSS }} />}
          <GrainOverlay />

          {caps.loader && !isLoaded && (
            <div className={`cs-loader ${loaderOut ? 'cs-loader--out' : ''}`}>
              <p className="cs-loader-mono">{config.monogram || `${config.couple?.person1?.[0] ?? ''} & ${config.couple?.person2?.[0] ?? ''}`}</p>
              <span className="cs-loader-line" />
              <p className="cs-loader-date">{config.date?.day} · {config.date?.month} · {config.date?.year}</p>
            </div>
          )}

          {caps.music && audioSrc && (
            <audio ref={audioRef} src={audioSrc} loop preload="auto" crossOrigin="anonymous"
              onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
          )}
          {caps.music && config.music?.url && (
            <button className="cs-music" onClick={toggleMusic} aria-label="Reproducir música">
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              {isPlaying && <span className="cs-music-bars"><span/><span/><span/></span>}
            </button>
          )}

          {/* ── HERO: pantalla dividida con parallax ── */}
          <section className="cs-hero" ref={heroRef as React.RefObject<HTMLElement>}>
            <div className="cs-hero-photo">
              <motion.div className="cs-hero-img-wrap" style={{ y: heroParallaxY }}>
                <img src={heroPhoto} alt="Hero" className="cs-hero-img" />
              </motion.div>
            </div>
            <motion.div className="cs-hero-panel" style={{ y: heroPanelParallaxY }}>
              <span className="cs-hero-label">{config.heroLabel || 'Boda frente al mar'}</span>
              <h1 className="cs-hero-names">
                {config.couple?.person1}<span className="cs-hero-amp">&amp; {config.couple?.person2}</span>
              </h1>
              <span className="cs-hero-rule" />
              <div className="cs-hero-meta">
                <span>{config.date?.day} · {config.date?.month} · {config.date?.year}</span>
                <span>{config.location}</span>
              </div>
            </motion.div>
          </section>
          <InvasionBadge label={config.monogram || `${config.couple?.person1?.[0] ?? ''}&${config.couple?.person2?.[0] ?? ''}`} />

          {/* ── COUNTDOWN ── */}
          {caps.countdown && (
            <Section bg="sand" style={{ position: 'relative', overflow: 'hidden' }}>
              <WatercolorBlob id="cs-wc-countdown" seed={7} fill="var(--shallow)" opacity={0.18} style={{ top: '-4rem', left: '50%', transform: 'translateX(-50%)' }} />
              <SectionHeading eyebrow="Cada ola nos acerca" title="Cuenta Regresiva" variant="offset" />
              <div className="cs-countdown">
                {[
                  { v: timeLeft.days, l: 'Días' },
                  { v: timeLeft.hours, l: 'Horas' },
                  { v: timeLeft.minutes, l: 'Min' },
                  { v: timeLeft.seconds, l: 'Seg' },
                ].map((u, i) => (
                  <motion.div
                    key={i}
                    className="cs-cd-pill"
                    style={{ marginTop: i % 2 === 1 ? 22 : 0 }}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-40px' }}
                    variants={staggerItem}
                  >
                    <span className="cs-cd-num">{String(u.v).padStart(2, '0')}</span>
                    <span className="cs-cd-lbl">{u.l}</span>
                  </motion.div>
                ))}
              </div>
            </Section>
          )}

          {/* ── CITA: pull-quote a ancho completo sobre foto ── */}
          {config.sections?.quote !== false && config.quote?.text && (
            <section className="cs-quote-bleed" style={{ backgroundImage: `url(${quoteBgPhoto})` }}>
              <div className="cs-quote-bleed-tint" />
              <motion.div
                className="cs-quote-bleed-content"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="cs-quote-mark" aria-hidden="true">&ldquo;</span>
                <p className="txt">{config.quote.text}</p>
                {config.quote.reference && <span className="cs-eyebrow">— {config.quote.reference}</span>}
              </motion.div>
            </section>
          )}

          {/* ── PADRES: sección propia, ya no una nota escondida sobre el itinerario ── */}
          {showParentsNote && (
            <Section bg="deep">
              <SectionHeading eyebrow="Con la bendición de" title="Nuestras familias" />
              <motion.div
                className="cs-parents-section"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                variants={staggerChildren}
              >
                <motion.div className="cs-parents-block" variants={staggerItem}>
                  <p className="role">Ella</p>
                  <div className="names">
                    {formatParents(config.parents?.person1).map((n, i, arr) => (
                      <React.Fragment key={i}>
                        <span>{n}</span>
                        {i < arr.length - 1 && <span className="amp">&amp;</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
                <motion.div className="cs-parents-divider" variants={staggerItem} />
                <motion.div className="cs-parents-block" variants={staggerItem}>
                  <p className="role">Él</p>
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
            <Section bg="sand" className="cs-itinerary-section">
              <SectionHeading eyebrow="El gran día" title="Itinerario" variant="offset" />
              <motion.div
                className="cs-timeline"
                style={timelineVars}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                variants={staggerChildren}
              >
                {config.itinerary!.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="cs-tl-item"
                    variants={staggerItem}
                  >
                    <span className="cs-tl-dot" />
                    {item.image && (
                      <div className="cs-tl-photo"><img src={item.image} alt={item.name || 'Itinerario'} /></div>
                    )}
                    <p className="cs-tl-time">{item.time}</p>
                    <h3 className="cs-tl-name">{item.name}</h3>
                    <p className="cs-tl-venue">{item.venue}{item.address ? ` · ${item.address}` : ''}</p>
                    {item.mapsUrl && <a href={item.mapsUrl} target="_blank" rel="noopener noreferrer" className="cs-tl-link">Ver ubicación</a>}
                  </motion.div>
                ))}
              </motion.div>
            </Section>
          )}

          {renderBlocks('itinerary')}

          {/* ── DESTINO: collage de hoteles, no grid parejo ── */}
          {config.sections?.destination !== false && config.destination && (config.destination.hotels?.length || config.destination.transport?.info) && (
            <Section bg="foam" edge={<BleedGradient from="sand" to="foam" />} style={{ position: 'relative', overflow: 'hidden' }}>
              <WatercolorBlob id="cs-wc-destination" seed={19} fill="var(--coral-soft)" opacity={0.14} style={{ top: '30%', right: '-6rem' }} />
              <SectionHeading eyebrow="Viaje" title="Hospedaje y transporte" variant="offset" />
              <div style={{ maxWidth: 760, margin: '0 auto' }}>
                {!!config.destination.hotels?.length && (
                  <motion.div className="cs-hotels-grid" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={staggerChildren}>
                    {config.destination.hotels.map((h, i) => (
                      <motion.div key={i} className="cs-hotel-card" variants={staggerItem}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          {i === 0 ? <span className="badge">Sede del evento</span> : <span />}
                          <Hotel size={16} style={{ color: 'var(--lagoon)', flexShrink: 0 }} />
                        </div>
                        <p className="cs-display name">{h.name}</p>
                        {h.category && <p className="cs-eyebrow" style={{ fontSize: 9 }}>{h.category}</p>}
                        {h.address && <p style={{ fontSize: 13, opacity: 0.7 }}>{h.address}</p>}
                        {h.note && <p style={{ fontSize: 12, opacity: 0.6, fontStyle: 'italic' }}>{h.note}</p>}
                        {h.phone && <a href={`tel:${h.phone.replace(/\s/g, '')}`} className="cs-eyebrow" style={{ fontSize: 9, marginTop: 4, display: 'inline-block' }}>{h.phone}</a>}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                {config.destination.transport?.info && (
                  <div className="cs-transport-card">
                    <Car size={22} style={{ color: 'var(--coral)', marginBottom: '0.75rem' }} />
                    <p style={{ fontSize: 14, opacity: 0.75, maxWidth: 480, margin: '0 auto 1.25rem' }}>{config.destination.transport.info}</p>
                    {!!config.destination.transport.schedule?.length && (
                      <motion.div className="cs-transport-schedule" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={staggerChildren}>
                        {config.destination.transport.schedule.map((s, i) => (
                          <motion.div key={i} className="cs-transport-row" variants={staggerItem}>
                            <span className="cs-transport-time">{s.time}</span>
                            <span className="cs-transport-dot" />
                            <span className="cs-transport-detail">{s.detail}</span>
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
            <Section bg="sand" edge={preDetailsBg !== 'sand' ? <BleedGradient from={preDetailsBg} to="sand" /> : undefined} style={{ position: 'relative', overflow: 'hidden' }}>
              <WatercolorBlob id="cs-wc-details" seed={31} fill="var(--shallow)" opacity={0.15} style={{ bottom: '-5rem', left: '-4rem' }} />
              <SectionHeading eyebrow="Importante" title="Detalles para el gran día" variant="offset" />
              <div className="cs-details-cards">
                {hasDressCode && (
                  <div className="cs-detail-card">
                    <div className="cs-detail-head">
                      <div className="cs-detail-icon"><Shirt size={16} /></div>
                      <h3>Código de vestimenta</h3>
                    </div>
                    <span className="cs-dress-label">{config.dressCode!.label}</span>
                    <div className="cs-dress-cols">
                      <div><h4>Ellas</h4><p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>{config.dressCode!.women}</p></div>
                      <div><h4>Ellos</h4><p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>{config.dressCode!.men}</p></div>
                    </div>
                    {!!config.dressCode!.swatches?.length && (
                      <div>
                        <p className="cs-swatches-label">Colores sugeridos</p>
                        <motion.div className="cs-swatches" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={staggerChildren}>
                          {config.dressCode!.swatches!.map((s, i) => (
                            <motion.div key={i} className="cs-swatch" variants={staggerItem}>
                              <div className="cs-swatch-dot" style={{ backgroundColor: s.color }} />
                              <span>{s.name}</span>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    )}
                    {!!config.dressCode!.avoid?.length && (
                      <div style={{ marginTop: '1.5rem' }}>
                        <p className="cs-swatches-label">Por favor evita</p>
                        <motion.div className="cs-swatches" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={staggerChildren}>
                          {config.dressCode!.avoid!.map((s, i) => (
                            <motion.div key={i} className="cs-swatch cs-swatch--avoid" variants={staggerItem}>
                              <div className="cs-swatch-dot" style={{ backgroundColor: s.color }}>
                                <span className="cs-swatch-x">
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
                    <div className="cs-detail-card">
                      <div className="cs-detail-head">
                        <div className="cs-detail-icon"><Gift size={16} /></div>
                        <h3>Regalos</h3>
                      </div>
                      {showTransfer && gifts.bank && (
                        <div className="cs-gift-block">
                          {[
                            { label: 'Banco', value: gifts.bank },
                            { label: 'Nombre', value: gifts.holder },
                            { label: 'Cuenta', value: gifts.account },
                            { label: 'CLABE', value: gifts.clabe },
                          ].filter(r => r.value).map(r => (
                            <div key={r.label} className="cs-gift-row">
                              <span className="lbl">{r.label}</span>
                              <span className="val">{r.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {showList && gifts.giftListUrl && (
                        <div className="cs-gift-block">
                          <p className="cs-display" style={{ fontSize: '1.05rem', fontStyle: 'italic' }}>Mesa de regalos</p>
                          {gifts.giftListLabel && <p style={{ fontSize: 12, opacity: 0.65 }}>{gifts.giftListLabel}</p>}
                          <a href={gifts.giftListUrl} target="_blank" rel="noopener noreferrer" className="cs-gift-link">Ver lista →</a>
                        </div>
                      )}
                      {showEnvelope && (
                        <div className="cs-gift-block">
                          <p className="cs-display" style={{ fontSize: '1.05rem', fontStyle: 'italic' }}>Sobre de regalo</p>
                          <p style={{ fontSize: 12, opacity: 0.65 }}>{gifts.envelopeMessage || 'Con gusto recibimos sobres el día del evento'}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {hasNotes && (
                  <div className="cs-detail-card">
                    <div className="cs-detail-head">
                      <div className="cs-detail-icon"><Info size={16} /></div>
                      <h3>Recomendaciones</h3>
                    </div>
                    <div className="cs-notes">
                      {config.notes!.filter(n => n?.trim()).map((note, i) => (
                        <div key={i} className="cs-note">
                          <span className="cs-note-mark">{String(i + 1).padStart(2, '0')}</span>
                          <p style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.6 }}>{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {config.noChildren && (
                  <div className="cs-detail-card" style={{ alignItems: 'center', textAlign: 'center' }}>
                    <div className="cs-detail-head" style={{ flexDirection: 'column' }}>
                      <div className="cs-detail-icon"><UserX size={16} /></div>
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

          {/* ── RSVP fusionado con el footer: entra con un degradado difuminado ── */}
          <div aria-hidden="true" style={{
            height: 340,
            background: `linear-gradient(to bottom, ${BG[preFooterBg]} 0%, ${BG[preFooterBg]} 12%, color-mix(in oklab, ${BG[preFooterBg]} 55%, var(--deep)) 55%, var(--deep) 90%, var(--deep) 100%)`,
          }} />
          <footer className="cs-footer">
            <SectionHeading eyebrow="RSVP" title="Confirma tu asistencia" />
            <p className="cs-footer-blurb">
              Será un verdadero honor celebrar este inicio contigo. Por favor confirma tu asistencia.
            </p>
            {!rsvpDone ? (
              caps.rsvpMode === 'whatsapp' && config.whatsapp?.number ? (
                <a href={`https://wa.me/${config.whatsapp.number}?text=${encodeURIComponent(config.whatsapp.message ?? '')}`} target="_blank" rel="noopener noreferrer" className="cs-btn">
                  Confirmar por WhatsApp
                </a>
              ) : (
                <button className="cs-btn" onClick={() => setIsRsvpOpen(true)}>Confirmar asistencia</button>
              )
            ) : (
              <div>
                <span className="cs-rsvp-done"><Check size={16} /> {guestConfirmed === false ? 'No asistiré' : '¡Confirmado!'}</span>
                <button className="cs-rsvp-edit" onClick={() => { setRsvpDone(false); setGuestConfirmed(null); setIsRsvpOpen(true); }}>
                  Actualizar respuesta
                </button>
              </div>
            )}

            <div className="cs-footer-divider" />
            <p className="cs-footer-mono">{config.couple?.person1?.[0]} &amp; {config.couple?.person2?.[0]}</p>
            <p className="cs-footer-names">{config.couple?.person1} &amp; {config.couple?.person2}</p>
            <p className="cs-footer-date">{config.date?.day} · {config.date?.month} · {config.date?.year}{config.location ? ` · ${config.location}` : ''}</p>
            <p className="cs-footer-powered">powered by <span className="cs-footer-brand">moments</span></p>
          </footer>

          {/* ── MODAL RSVP ── */}
          {isRsvpOpen && (caps.rsvpMode === 'modalManual' || hasToken || isDemo) && (
            <div className="cs-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setIsRsvpOpen(false); }}>
              <div className="cs-modal" ref={modalRef}>
                <button className="cs-modal-close" onClick={() => setIsRsvpOpen(false)} aria-label="Cerrar">×</button>

                {rsvpDone ? (
                  <div className="cs-modal-body" style={{ alignItems: 'center', textAlign: 'center', padding: '3rem 2rem' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(42,172,166,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={22} style={{ color: 'var(--lagoon)' }} />
                    </div>
                    <h3 className="cs-modal-title">{guestConfirmed === false ? 'Respuesta registrada' : '¡Nos vemos en la playa!'}</h3>
                    <p style={{ fontSize: 13, opacity: 0.65, lineHeight: 1.7 }}>
                      {guestConfirmed === false ? 'Lamentamos no poder verte. Gracias por avisarnos.' : 'Tu confirmación fue registrada. Estamos felices de celebrar contigo.'}
                    </p>
                  </div>
                ) : (
                  <div className="cs-modal-body">
                    <div style={{ textAlign: 'center' }}>
                      <p className="cs-eyebrow" style={{ marginBottom: '0.75rem' }}>Confirmación de asistencia</p>
                      <h3 className="cs-modal-title">¡Hola {displayName}!</h3>
                      <p style={{ fontSize: 13, opacity: 0.6, marginTop: '0.5rem' }}>Nos encantaría que nos acompañaras en nuestro gran día.</p>
                    </div>

                    <div className="cs-guest-card">
                      <div className="cs-guest-avatar">{displayName.charAt(0)}</div>
                      <div style={{ textAlign: 'left' }}>
                        <p className="cs-eyebrow" style={{ fontSize: 9 }}>Invitado</p>
                        <p style={{ fontSize: 15 }}>{displayName}</p>
                        <p style={{ fontSize: 11, opacity: 0.55 }}>{totalSeats} {totalSeats === 1 ? 'lugar' : 'lugares'} reservados</p>
                      </div>
                    </div>

                    {submitError && <p className="cs-error">{submitError}</p>}

                    {guestConfirmed === null ? (
                      <div className="cs-choice">
                        <button className="cs-choice-yes" onClick={() => {
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
                        <button className="cs-choice-no" onClick={() => setGuestConfirmed(false)}>No podré ir</button>
                      </div>
                    ) : guestConfirmed ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ textAlign: 'center', fontSize: 15, fontStyle: 'italic' }} className="cs-display">¡Perfecto! Te esperamos.</p>

                        <div className="cs-attendees">
                          <p className="cs-eyebrow" style={{ fontSize: 9, marginBottom: 4 }}>¿Quiénes asistirán?</p>
                          <div className="cs-attendee-row">
                            <span className="cs-attendee-check on"><Check size={12} /></span>
                            <span style={{ flex: 1 }}>{displayName}</span>
                            <span className="cs-eyebrow" style={{ fontSize: 9 }}>Titular</span>
                          </div>

                          {isPlus ? (
                            effectiveMaxCompanions > 0 && (
                              <>
                                <div className="cs-stepper">
                                  <button type="button" disabled={attendeeNames.length === 0}
                                    onClick={() => { setAttendeeNames(p => p.slice(0, -1)); setAttendeeChecked(p => p.slice(0, -1)); }}>−</button>
                                  <span style={{ fontSize: 14 }}>{attendeeNames.length}</span>
                                  <button type="button" disabled={attendeeNames.length >= effectiveMaxCompanions}
                                    onClick={() => { setAttendeeNames(p => [...p, '']); setAttendeeChecked(p => [...p, true]); }}>+</button>
                                </div>
                                {attendeeNames.map((name, i) => (
                                  <input key={i} type="text" className="cs-input" value={name} placeholder={`Nombre del acompañante ${i + 1}`}
                                    onChange={(e) => { const next = [...attendeeNames]; next[i] = e.target.value; setAttendeeNames(next); }} />
                                ))}
                              </>
                            )
                          ) : (
                            attendeeNames.map((name, i) => {
                              const attending = attendeeChecked[i] ?? true;
                              return (
                                <div key={i} className="cs-attendee-row">
                                  <span className={`cs-attendee-check${attending ? ' on' : ''}`} onClick={() => { const u = [...attendeeChecked]; u[i] = !u[i]; setAttendeeChecked(u); }}>
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
                                  <p className="cs-dietary-person">{personName}</p>
                                  <details>
                                    <summary className="cs-dietary-summary">
                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {dietaryMap[personName]?.length ? dietaryMap[personName].join(', ') : 'Restricciones alimentarias'}
                                      </span>
                                      <ChevronDown size={13} />
                                    </summary>
                                    <div className="cs-dietary-options">
                                      {dietary.options!.map(opt => (
                                        <label key={opt} className="cs-dietary-option">
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
                          <p className="cs-demo-flag">Vista previa · Los datos no se guardan</p>
                        ) : (
                          <button className="cs-submit" onClick={handleSubmitRsvp} disabled={submitting}>{submitting ? 'Guardando…' : 'Confirmar asistencia'}</button>
                        )}
                        <button className="cs-linklike" onClick={() => { setGuestConfirmed(null); setAttendeeNames([]); setAttendeeChecked([]); setSubmitError(''); }}>Cambiar respuesta</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <p style={{ fontSize: 14, opacity: 0.7, textAlign: 'center' }}>Lamentamos no poder verte, gracias por avisarnos.</p>
                        {isDemo ? (
                          <p className="cs-demo-flag" style={{ width: '100%' }}>Vista previa · Los datos no se guardan</p>
                        ) : (
                          <button className="cs-submit" onClick={handleSubmitRsvp} disabled={submitting}>{submitting ? 'Guardando…' : 'Enviar respuesta'}</button>
                        )}
                        <button className="cs-linklike" onClick={() => { setGuestConfirmed(null); setSubmitError(''); }}>Cambiar respuesta</button>
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
