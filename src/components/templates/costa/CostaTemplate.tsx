'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Cormorant_Garamond, Jost, Cinzel } from 'next/font/google';
import { Play, Pause, Hotel, Car, UserX, ChevronDown, Check, Waves, Gift, Sailboat } from 'lucide-react';
import type { PhotoEntry } from '@/lib/imageLayout';
import ContentProtection from '@/components/templates/shared/ContentProtection';
import { getCapabilities } from '@/lib/plans';

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '600'], style: ['normal', 'italic'], variable: '--font-cormorant' });
const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-jost' });
const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel' });

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
  dressCode?: { label?: string; women?: string; men?: string; swatches?: Swatch[] };
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
    --sand:      #FBF6EC;
    --foam:      #FFFDFA;
    --lagoon:    #2AACA6;
    --coral:     #E8836B;
    --deep:      #0E2B33;
    --ink:       #123138;
    --champagne: #B9975B;
    --font-cormorant: 'Cormorant Garamond';
    --font-cinzel: 'Cinzel';
    --font-jost: 'Jost';
  }

  .cs-root { background: var(--foam); color: var(--ink); font-family: var(--font-jost), sans-serif; overflow-x: hidden; }
  .cs-display { font-family: var(--font-cormorant), serif; }
  .cs-heading { font-family: var(--font-cinzel), serif; letter-spacing: 0.08em; }
  .cs-eyebrow { font-family: var(--font-jost), sans-serif; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--champagne); }

  .cs-section { padding: 5rem 1.5rem; }
  @media (min-width: 768px) { .cs-section { padding: 7rem 4rem; } }
  .cs-section--sand { background: var(--sand); }
  .cs-section--deep { background: var(--deep); color: var(--foam); }

  .cs-heading-block { text-align: center; margin-bottom: 3.5rem; }
  .cs-heading-block h2 { font-size: clamp(1.9rem, 4vw, 2.6rem); margin-top: 0.75rem; }
  .cs-heading-rule { width: 34px; height: 1px; background: var(--champagne); opacity: 0.55; margin: 1.1rem auto 0; }

  /* ── Curvas orgánicas entre secciones ── */
  .cs-curve { display: block; width: 100%; line-height: 0; margin-bottom: -1px; }
  .cs-curve svg { display: block; width: 100%; height: 38px; }
  @media (min-width: 768px) { .cs-curve svg { height: 56px; } }
  .cs-hero-curve { display: block; width: 100%; line-height: 0; margin-top: -1px; }
  .cs-hero-curve svg { display: block; width: 100%; height: 64px; }
  @media (min-width: 768px) { .cs-hero-curve svg { height: 96px; } }

  /* ── Hero: pantalla dividida, no foto full-bleed con texto encima ── */
  .cs-hero { position: relative; display: flex; flex-direction: column; min-height: 100svh; overflow: hidden; }
  @media (min-width: 900px) { .cs-hero { flex-direction: row; } }
  .cs-hero-photo { position: relative; flex: 1; min-height: 46svh; overflow: hidden; }
  @media (min-width: 900px) { .cs-hero-photo { flex: 0 0 58%; min-height: 100svh; } }
  .cs-hero-img-wrap { position: absolute; inset: -10% 0; }
  .cs-hero-img { width: 100%; height: 120%; object-fit: cover; }
  .cs-hero-panel { flex: 1; background: var(--deep); color: var(--foam); display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 1.1rem; padding: 3rem 2rem; text-align: left; }
  @media (min-width: 900px) { .cs-hero-panel { flex: 0 0 42%; padding: 3rem 3.5rem; } }
  .cs-hero-label { font-family: var(--font-jost), sans-serif; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; opacity: 0.75; }
  .cs-hero-names { font-family: var(--font-cormorant), serif; font-weight: 300; font-style: italic; font-size: clamp(2.4rem, 7vw, 4.2rem); line-height: 1.05; }
  .cs-hero-amp { display: block; font-family: var(--font-cormorant), serif; color: var(--champagne); font-style: normal; }
  .cs-hero-rule { width: 46px; height: 1px; background: var(--champagne); opacity: 0.6; }
  .cs-hero-meta { display: flex; flex-direction: column; gap: 0.35rem; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.75; }

  /* ── Loader: ondas expandiéndose como en el agua ── */
  .cs-loader { position: fixed; inset: 0; background: var(--deep); z-index: 999; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; transition: opacity 0.6s ease, transform 0.6s ease; }
  .cs-loader--out { opacity: 0; transform: scale(1.03); pointer-events: none; }
  .cs-loader-ripple { position: relative; width: 90px; height: 90px; display: flex; align-items: center; justify-content: center; }
  .cs-loader-ripple span { position: absolute; border-radius: 50%; border: 1px solid var(--champagne); animation: csRipple 2.4s cubic-bezier(0.2,0.6,0.4,1) infinite; }
  .cs-loader-ripple span:nth-child(2) { animation-delay: 0.7s; }
  .cs-loader-ripple span:nth-child(3) { animation-delay: 1.4s; }
  .cs-loader-ripple-dot { position: absolute; width: 7px; height: 7px; border-radius: 50%; background: var(--champagne); animation: csFadeUp 0.6s ease 0.2s both; }
  @keyframes csRipple { 0% { width: 8px; height: 8px; opacity: 0.9; } 100% { width: 90px; height: 90px; opacity: 0; } }
  .cs-loader-mono { font-family: var(--font-cormorant), serif; font-style: italic; color: var(--foam); font-size: clamp(1.4rem, 4vw, 2rem); animation: csFadeUp 0.8s ease 0.5s both; }
  .cs-loader-date { color: rgba(255,255,255,0.55); font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; animation: csFadeUp 0.8s ease 0.8s both; }
  @keyframes csFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  /* ── Music toggle ── */
  .cs-music { position: fixed; bottom: 1.75rem; right: 1.75rem; z-index: 100; display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem 1.1rem; border-radius: 100px; background: var(--deep); color: var(--foam); border: 1px solid rgba(255,255,255,0.15); cursor: pointer; font-size: 11px; letter-spacing: 0.1em; box-shadow: 0 10px 30px rgba(14,43,51,0.25); }
  .cs-music-bars { display: flex; align-items: flex-end; gap: 2px; height: 12px; }
  .cs-music-bars span { width: 2px; background: var(--lagoon); border-radius: 2px; animation: csBar 0.9s ease-in-out infinite alternate; }
  .cs-music-bars span:nth-child(2) { animation-delay: 0.2s; }
  .cs-music-bars span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes csBar { from { height: 3px; } to { height: 12px; } }

  /* ── Countdown ── */
  .cs-countdown { display: flex; justify-content: center; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
  .cs-cd-pill { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 84px; height: 84px; border-radius: 50%; background: var(--foam); border: 1px solid rgba(185,151,91,0.35); box-shadow: 0 12px 30px rgba(14,43,51,0.06); }
  @media (min-width: 768px) { .cs-cd-pill { width: 108px; height: 108px; } }
  .cs-cd-num { font-family: var(--font-cinzel), serif; font-size: 1.5rem; color: var(--ink); }
  @media (min-width: 768px) { .cs-cd-num { font-size: 2rem; } }
  .cs-cd-lbl { font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.5; margin-top: 0.2rem; }

  /* ── Cita: pull-quote a ancho completo sobre foto, no tarjeta aislada ── */
  .cs-quote-bleed { position: relative; min-height: 68svh; display: flex; align-items: center; background-size: cover; background-position: center; }
  .cs-quote-bleed-tint { position: absolute; inset: 0; background: linear-gradient(115deg, rgba(14,43,51,0.82) 0%, rgba(14,43,51,0.4) 55%, rgba(14,43,51,0.15) 100%); }
  .cs-quote-bleed-content { position: relative; z-index: 2; max-width: 560px; margin: 0 8% 0 6%; color: var(--foam); padding: 2rem 0; }
  .cs-quote-mark { display: block; font-family: var(--font-cormorant), serif; font-style: italic; font-size: 5rem; color: var(--champagne); opacity: 0.6; line-height: 1; transform: rotate(-6deg); margin-bottom: -1.5rem; }
  .cs-quote-bleed-content p.txt { font-family: var(--font-cormorant), serif; font-style: italic; font-size: clamp(1.4rem, 3vw, 2rem); line-height: 1.5; }
  .cs-quote-bleed-content .cs-eyebrow { color: var(--champagne); margin-top: 1.25rem; display: block; }

  /* ── Sección itinerario: contiene la nota flotante de los padres ── */
  .cs-itinerary-section { position: relative; }
  .cs-parents-note { position: absolute; top: -2.25rem; right: 1.25rem; max-width: 230px; background: var(--foam); border: 1px solid rgba(185,151,91,0.35); border-radius: 16px; padding: 1.25rem 1.5rem; box-shadow: 0 24px 44px rgba(14,43,51,0.14); transform: rotate(-2.2deg); z-index: 3; }
  @media (min-width: 768px) { .cs-parents-note { top: -3rem; right: 4rem; max-width: 300px; padding: 1.5rem 1.75rem; } }
  .cs-parents-note-eyebrow { font-family: var(--font-jost), sans-serif; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--champagne); margin-bottom: 0.6rem; }
  .cs-parents-note-cols { display: flex; gap: 1.25rem; }
  .cs-parents-note-cols .role { font-family: var(--font-cormorant), serif; font-style: italic; font-size: 1.05rem; color: var(--coral); margin-bottom: 0.15rem; }
  .cs-parents-note-cols .names { font-size: 11px; line-height: 1.5; opacity: 0.85; }
  .cs-parents-fallback { max-width: 640px; margin: 0 auto 3.5rem; display: grid; gap: 2rem; text-align: center; }
  @media (min-width: 560px) { .cs-parents-fallback { grid-template-columns: 1fr auto 1fr; align-items: center; } }

  /* ── Itinerario: vertical en móvil, recorrido horizontal en escritorio ── */
  .cs-timeline { max-width: 640px; margin: 0 auto; position: relative; padding-left: 2rem; padding-top: 1rem; display: flex; flex-direction: column; gap: 0; }
  .cs-timeline::before { content: ''; position: absolute; left: 7px; top: 1.4rem; bottom: 0.4rem; width: 1px; background: repeating-linear-gradient(to bottom, var(--lagoon) 0 6px, transparent 6px 12px); }
  .cs-tl-item { position: relative; padding-bottom: 3rem; }
  .cs-tl-item:last-child { padding-bottom: 0; }
  .cs-tl-item:nth-child(even) { padding-left: 1.5rem; }
  .cs-tl-dot { position: absolute; left: -2rem; top: 1.2rem; width: 15px; height: 15px; border-radius: 50%; background: var(--lagoon); border: 3px solid var(--foam); box-shadow: 0 0 0 1px rgba(42,172,166,0.4); }
  .cs-tl-time { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--lagoon); }
  .cs-tl-name { font-family: var(--font-cormorant), serif; font-size: 1.5rem; margin: 0.2rem 0; }
  .cs-tl-venue { font-size: 13px; opacity: 0.75; }
  .cs-tl-link { display: inline-block; margin-top: 0.6rem; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--coral); text-decoration: none; border-bottom: 1px solid var(--coral); }
  @media (min-width: 900px) {
    .cs-timeline { flex-direction: row; max-width: 100%; padding-left: 0; overflow-x: auto; }
    .cs-timeline::before { left: 0; right: 0; top: 1.4rem; bottom: auto; height: 1px; width: auto; background: repeating-linear-gradient(to right, var(--lagoon) 0 6px, transparent 6px 12px); }
    .cs-tl-item { flex: 1; min-width: 200px; padding-bottom: 0; padding-top: 3rem; text-align: center; }
    .cs-tl-item:nth-child(even) { padding-left: 0; padding-top: 5.5rem; }
    .cs-tl-dot { left: 50%; top: 1rem; transform: translateX(-50%); }
  }

  /* ── Fotos: una rompe el contenedor (breakout), el resto dispersas ── */
  .cs-photo-breakout { width: 100vw; position: relative; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; aspect-ratio: 21 / 9; overflow: hidden; margin-bottom: 3rem; }
  .cs-photo-breakout img { width: 100%; height: 100%; object-fit: cover; }
  .cs-photos-wrap { max-width: 900px; margin: 0 auto; padding: 0 1.5rem 5rem; display: flex; flex-direction: column; gap: 3rem; }
  .cs-photo { aspect-ratio: 16 / 10; overflow: hidden; border-radius: 10px; box-shadow: 0 20px 40px rgba(14,43,51,0.12); }
  .cs-photo img { width: 100%; height: 100%; object-fit: cover; }

  /* ── Hoteles: collage tipo revista, no grid parejo ── */
  .cs-hotels { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }
  .cs-hotel-main { border-radius: 18px; padding: 2rem; background: var(--foam); border: 1px solid rgba(42,172,166,0.2); }
  .cs-hotel-main .name { font-size: 1.35rem; }
  .cs-hotel-side-row { display: flex; gap: 1.25rem; flex-wrap: wrap; }
  @media (min-width: 768px) { .cs-hotel-side-row { margin-top: -1.5rem; margin-left: 2.5rem; } }
  .cs-hotel-side { flex: 1; min-width: 190px; border-radius: 14px; padding: 1.25rem; background: var(--foam); border: 1px solid rgba(42,172,166,0.15); }

  /* ── Detalles: dress code + regalos + notas fusionados, columnas asimétricas ── */
  .cs-details-grid { display: grid; gap: 2.75rem; max-width: 920px; margin: 0 auto; }
  @media (min-width: 860px) { .cs-details-grid { grid-template-columns: 1.3fr 1fr; align-items: start; } }
  .cs-dress-label { display: inline-block; padding: 0.5rem 1.5rem; border: 1px solid var(--lagoon); border-radius: 100px; font-family: var(--font-cinzel), serif; font-size: 0.85rem; letter-spacing: 0.15em; margin-bottom: 1.75rem; }
  .cs-dress-cols { display: grid; gap: 1.5rem; text-align: left; margin-bottom: 2rem; }
  @media (min-width: 480px) { .cs-dress-cols { grid-template-columns: 1fr 1fr; } }
  .cs-dress-cols h4 { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--coral); margin-bottom: 0.5rem; }
  .cs-swatches { display: flex; gap: 1.25rem; flex-wrap: wrap; }
  .cs-swatch { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
  .cs-swatch-dot { width: 40px; height: 40px; border-radius: 50%; box-shadow: 0 6px 16px rgba(14,43,51,0.12); }
  .cs-swatch span { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.6; }
  .cs-details-side { display: flex; flex-direction: column; gap: 1.75rem; }
  .cs-gift-card { background: var(--foam); border: 1px solid rgba(42,172,166,0.2); border-radius: 16px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .cs-gift-icon { width: 32px; height: 32px; border-radius: 9px; background: rgba(42,172,166,0.12); display: flex; align-items: center; justify-content: center; color: var(--lagoon); }
  .cs-gift-row { display: flex; flex-direction: column; gap: 0.1rem; }
  .cs-gift-row span.lbl { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.5; }
  .cs-gift-row span.val { font-size: 13px; }
  .cs-gift-link { align-self: flex-start; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--coral); text-decoration: none; border-bottom: 1px solid var(--coral); }
  .cs-notes { display: flex; flex-direction: column; gap: 1rem; }
  .cs-note { display: flex; gap: 0.85rem; align-items: flex-start; }
  .cs-note-mark { color: var(--coral); font-family: var(--font-cormorant), serif; font-style: italic; font-size: 1.05rem; flex-shrink: 0; }

  /* ── No niños ── */
  .cs-adults { max-width: 460px; margin: 0 auto; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; }

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
`;

// ---------------------------------------------------------------------------
// Theme override
// ---------------------------------------------------------------------------
function buildThemeCSS(theme?: CostaConfig['theme']): string {
  if (!theme?.accentColor) return '';
  return `:root { --lagoon: ${theme.accentColor}; }`;
}

// ---------------------------------------------------------------------------
// Curvas orgánicas — nunca la misma dos veces seguidas
// ---------------------------------------------------------------------------
const HeroCurve = ({ fill }: { fill: string }) => (
  <div className="cs-hero-curve" aria-hidden="true">
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ fill }}>
      <path d="M0,55 C160,15 320,85 480,65 C640,45 800,10 960,28 C1120,46 1280,88 1440,50 L1440,100 L0,100 Z" />
    </svg>
  </div>
);

const CurveTop = ({ fill, flip = false }: { fill: string; flip?: boolean }) => (
  <div className="cs-curve" style={{ transform: flip ? 'scaleX(-1)' : undefined }} aria-hidden="true">
    <svg viewBox="0 0 1440 70" preserveAspectRatio="none" style={{ fill }}>
      <path d="M0,70 C220,12 480,0 740,20 C1000,38 1220,60 1440,32 L1440,0 L0,0 Z" />
    </svg>
  </div>
);

const BG: Record<'sand' | 'foam' | 'deep', string> = { sand: 'var(--sand)', foam: 'var(--foam)', deep: 'var(--deep)' };

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } },
};

const Section = ({
  bg = 'foam',
  flip,
  className = '',
  style,
  children,
}: {
  bg?: 'sand' | 'foam' | 'deep';
  flip?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) => (
  <>
    <CurveTop fill={BG[bg]} flip={flip} />
    <section className={`cs-section ${bg !== 'foam' ? `cs-section--${bg}` : ''} ${className}`.trim()} style={style}>
      {children}
    </section>
  </>
);

const SectionHeading = ({ eyebrow, title }: { eyebrow?: string; title: string }) => (
  <motion.div
    className="cs-heading-block"
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, margin: '-80px' }}
    variants={fadeUp}
  >
    {eyebrow && <p className="cs-eyebrow">{eyebrow}</p>}
    <h2 className="cs-heading">{title}</h2>
    <span className="cs-heading-rule" />
  </motion.div>
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
              return (
                <motion.div
                  key={i}
                  className="cs-photo"
                  style={{ width: odd ? '64%' : '78%', marginLeft: odd ? 'auto' : undefined }}
                  initial={{ opacity: 0, x: odd ? 40 : -40, rotate: odd ? 1.3 : -1 }}
                  whileInView={{ opacity: 1, x: 0, rotate: odd ? 1.3 : -1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
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
  const hasDetails = hasDressCode || hasGifts || hasNotes;

  if (!isLoaded && caps.loader) {
    return (
      <div className="flex-1 flex flex-col">
        <ContentProtection enabled={false}>
          <div className={`cs-root ${cormorant.variable} ${jost.variable} ${cinzel.variable}`}>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            {themeCSS && <style dangerouslySetInnerHTML={{ __html: themeCSS }} />}
            <div className={`cs-loader ${loaderOut ? 'cs-loader--out' : ''}`}>
              <div className="cs-loader-ripple">
                <span /><span /><span />
                <div className="cs-loader-ripple-dot" />
              </div>
              <p className="cs-loader-mono">{config.monogram || `${config.couple?.person1?.[0] ?? ''} & ${config.couple?.person2?.[0] ?? ''}`}</p>
              <p className="cs-loader-date">{config.date?.day} · {config.date?.month} · {config.date?.year}</p>
            </div>
          </div>
        </ContentProtection>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <ContentProtection enabled={true}>
        <div className={`cs-root ${cormorant.variable} ${jost.variable} ${cinzel.variable}`}>
          <style dangerouslySetInnerHTML={{ __html: css }} />
          {themeCSS && <style dangerouslySetInnerHTML={{ __html: themeCSS }} />}

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
            <div className="cs-hero-panel">
              <span className="cs-hero-label">{config.heroLabel || 'Boda frente al mar'}</span>
              <h1 className="cs-hero-names">
                {config.couple?.person1}<span className="cs-hero-amp">&amp; {config.couple?.person2}</span>
              </h1>
              <span className="cs-hero-rule" />
              <div className="cs-hero-meta">
                <span>{config.date?.day} · {config.date?.month} · {config.date?.year}</span>
                <span>{config.location}</span>
              </div>
            </div>
          </section>
          <HeroCurve fill={caps.countdown ? 'var(--sand)' : 'var(--foam)'} />

          {/* ── COUNTDOWN ── */}
          {caps.countdown && (
            <Section bg="sand">
              <SectionHeading eyebrow="Cada ola nos acerca" title="Cuenta Regresiva" />
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
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
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

          {/* ── ITINERARIO (con la nota de los padres flotando encima) ── */}
          {showItinerary ? (
            <Section bg="sand" flip className="cs-itinerary-section">
              {showParentsNote && (
                <motion.div
                  className="cs-parents-note"
                  initial={{ opacity: 0, y: -16, rotate: -8 }}
                  whileInView={{ opacity: 1, y: 0, rotate: -2.2 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="cs-parents-note-eyebrow">Con la bendición de</p>
                  <div className="cs-parents-note-cols">
                    <div>
                      <p className="role">Ella</p>
                      <p className="names">{config.parents?.person1 || 'Sus padres'}</p>
                    </div>
                    <div>
                      <p className="role">Él</p>
                      <p className="names">{config.parents?.person2 || 'Sus padres'}</p>
                    </div>
                  </div>
                </motion.div>
              )}
              <SectionHeading eyebrow="El gran día" title="Itinerario" />
              <div className="cs-timeline">
                {config.itinerary!.map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="cs-tl-item"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.8, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className="cs-tl-dot" />
                    <p className="cs-tl-time">{item.time}</p>
                    <h3 className="cs-tl-name">{item.name}</h3>
                    <p className="cs-tl-venue">{item.venue}{item.address ? ` · ${item.address}` : ''}</p>
                    {item.mapsUrl && <a href={item.mapsUrl} target="_blank" rel="noopener noreferrer" className="cs-tl-link">Ver ubicación</a>}
                  </motion.div>
                ))}
              </div>
            </Section>
          ) : (
            showParentsNote && (
              <Section bg="deep" flip>
                <SectionHeading eyebrow="Con la bendición de" title="Nuestras familias" />
                <div className="cs-parents-fallback">
                  <div>
                    <p className="cs-display" style={{ fontStyle: 'italic', fontSize: '1.4rem', color: 'var(--coral)', marginBottom: '0.4rem' }}>Ella</p>
                    <p>{config.parents?.person1 || 'Sus padres'}</p>
                  </div>
                  <Sailboat size={22} style={{ opacity: 0.4 }} />
                  <div>
                    <p className="cs-display" style={{ fontStyle: 'italic', fontSize: '1.4rem', color: 'var(--coral)', marginBottom: '0.4rem' }}>Él</p>
                    <p>{config.parents?.person2 || 'Sus padres'}</p>
                  </div>
                </div>
              </Section>
            )
          )}

          {renderBlocks('itinerary')}

          {/* ── DESTINO: collage de hoteles, no grid parejo ── */}
          {config.sections?.destination !== false && config.destination && (config.destination.hotels?.length || config.destination.transport?.info) && (
            <Section bg="foam">
              <SectionHeading eyebrow="Viaje" title="Hospedaje y transporte" />
              <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
                {!!config.destination.hotels?.length && (
                  <div className="cs-hotels">
                    {config.destination.hotels.map((h, i) => (
                      i === 0 ? (
                        <div key={i} className="cs-hotel-main">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <p className="cs-display name">{h.name}</p>
                            <Hotel size={18} style={{ color: 'var(--lagoon)', flexShrink: 0, marginTop: 2 }} />
                          </div>
                          {h.category && <p className="cs-eyebrow" style={{ fontSize: 9 }}>{h.category}</p>}
                          {h.address && <p style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>{h.address}</p>}
                          {h.note && <p style={{ fontSize: 12, opacity: 0.6, fontStyle: 'italic', marginTop: 4 }}>{h.note}</p>}
                          {h.phone && <a href={`tel:${h.phone.replace(/\s/g, '')}`} className="cs-eyebrow" style={{ fontSize: 9, marginTop: 8, display: 'inline-block' }}>{h.phone}</a>}
                        </div>
                      ) : null
                    ))}
                    {config.destination.hotels.length > 1 && (
                      <div className="cs-hotel-side-row">
                        {config.destination.hotels.slice(1).map((h, i) => (
                          <div key={i} className="cs-hotel-side">
                            <p className="cs-display" style={{ fontSize: '1.05rem' }}>{h.name}</p>
                            {h.category && <p className="cs-eyebrow" style={{ fontSize: 8 }}>{h.category}</p>}
                            {h.address && <p style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>{h.address}</p>}
                            {h.phone && <a href={`tel:${h.phone.replace(/\s/g, '')}`} className="cs-eyebrow" style={{ fontSize: 8, marginTop: 6, display: 'inline-block' }}>{h.phone}</a>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {config.destination.transport?.info && (
                  <div style={{ textAlign: 'center' }}>
                    <Car size={22} style={{ color: 'var(--coral)', marginBottom: '0.75rem' }} />
                    <p style={{ fontSize: 14, opacity: 0.75, maxWidth: 480, margin: '0 auto 1.25rem' }}>{config.destination.transport.info}</p>
                    {!!config.destination.transport.schedule?.length && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        {config.destination.transport.schedule.map((s, i) => (
                          <div key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: 13 }}>
                            <span className="cs-eyebrow" style={{ fontSize: 10, width: 70, textAlign: 'right' }}>{s.time}</span>
                            <span style={{ opacity: 0.7 }}>{s.detail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* ── DETALLES: dress code + regalos + notas fusionados, columnas asimétricas ── */}
          {hasDetails && (
            <Section bg="sand">
              <SectionHeading eyebrow="Importante" title="Detalles para el gran día" />
              <div className="cs-details-grid">
                {hasDressCode && (
                  <div>
                    <span className="cs-dress-label">{config.dressCode!.label}</span>
                    <div className="cs-dress-cols">
                      <div><h4>Ellas</h4><p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>{config.dressCode!.women}</p></div>
                      <div><h4>Ellos</h4><p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>{config.dressCode!.men}</p></div>
                    </div>
                    {!!config.dressCode!.swatches?.length && (
                      <div className="cs-swatches">
                        {config.dressCode!.swatches!.map((s, i) => (
                          <div key={i} className="cs-swatch">
                            <div className="cs-swatch-dot" style={{ backgroundColor: s.color }} />
                            <span>{s.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(hasGifts || hasNotes) && (
                  <div className="cs-details-side">
                    {hasGifts && (() => {
                      const gifts = config.gifts!;
                      return (
                        <>
                          {showTransfer && gifts.bank && (
                            <div className="cs-gift-card">
                              <div className="cs-gift-icon"><Waves size={15} /></div>
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
                            <div className="cs-gift-card">
                              <div className="cs-gift-icon"><Gift size={15} /></div>
                              <p className="cs-display" style={{ fontSize: '1.05rem', fontStyle: 'italic' }}>Mesa de regalos</p>
                              {gifts.giftListLabel && <p style={{ fontSize: 12, opacity: 0.65 }}>{gifts.giftListLabel}</p>}
                              <a href={gifts.giftListUrl} target="_blank" rel="noopener noreferrer" className="cs-gift-link">Ver lista →</a>
                            </div>
                          )}
                          {showEnvelope && (
                            <div className="cs-gift-card">
                              <div className="cs-gift-icon"><Gift size={15} /></div>
                              <p className="cs-display" style={{ fontSize: '1.05rem', fontStyle: 'italic' }}>Sobre de regalo</p>
                              <p style={{ fontSize: 12, opacity: 0.65 }}>{gifts.envelopeMessage || 'Con gusto recibimos sobres el día del evento'}</p>
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {hasNotes && (
                      <div className="cs-notes">
                        {config.notes!.filter(n => n?.trim()).map((note, i) => (
                          <div key={i} className="cs-note">
                            <span className="cs-note-mark">{String(i + 1).padStart(2, '0')}</span>
                            <p style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.6 }}>{note}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* ── NO NIÑOS ── */}
          {config.noChildren && (
            <Section bg="deep" flip>
              <div className="cs-adults">
                <UserX size={26} style={{ color: 'var(--coral)' }} />
                <p className="cs-heading" style={{ fontSize: 18 }}>Evento para adultos</p>
                <p style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.7 }}>
                  {config.noChildrenMessage || 'Con todo nuestro cariño, les pedimos que esta celebración sea exclusiva para adultos. Agradecemos su comprensión.'}
                </p>
              </div>
            </Section>
          )}

          {/* ── RSVP fusionado con el footer: un solo cierre ── */}
          <CurveTop fill="var(--deep)" />
          <footer className="cs-footer">
            <SectionHeading eyebrow="RSVP" title="¿Nos acompañas en la orilla?" />
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
