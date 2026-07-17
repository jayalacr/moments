'use client';

import React, { useEffect, useState, useRef } from 'react';
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
// Styles — identidad "Costa": arena, laguna turquesa, coral, sin texturas de papel
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
  .cs-section--deep .cs-eyebrow { color: var(--champagne); }

  .cs-heading-block { text-align: center; margin-bottom: 3.5rem; }
  .cs-heading-block h2 { font-size: clamp(1.9rem, 4vw, 2.6rem); margin-top: 0.75rem; }
  .cs-heading-rule { width: 34px; height: 1px; background: var(--champagne); opacity: 0.55; margin: 1.1rem auto 0; }

  /* ── Curva de transición entre secciones (rompe la rigidez rectangular) ── */
  .cs-curve { display: block; width: 100%; line-height: 0; margin-bottom: -1px; }
  .cs-curve svg { display: block; width: 100%; height: 38px; }
  @media (min-width: 768px) { .cs-curve svg { height: 56px; } }

  /* ── Curva de la orilla bajo el hero (más pronunciada, doble cresta) ── */
  .cs-hero-curve { display: block; width: 100%; line-height: 0; margin-top: -1px; }
  .cs-hero-curve svg { display: block; width: 100%; height: 64px; }
  @media (min-width: 768px) { .cs-hero-curve svg { height: 96px; } }

  /* ── Hero ── */
  .cs-hero { position: relative; min-height: 100svh; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; }
  .cs-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .cs-hero-tint { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(14,43,51,0.15) 0%, rgba(14,43,51,0.05) 45%, rgba(14,43,51,0.75) 100%); }
  .cs-hero-content { position: relative; z-index: 2; text-align: center; color: var(--foam); padding: 0 1.5rem 6rem; display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
  .cs-hero-label { font-family: var(--font-jost), sans-serif; font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; opacity: 0.8; }
  .cs-hero-names { font-family: var(--font-cormorant), serif; font-weight: 300; font-style: italic; font-size: clamp(3rem, 9vw, 6.5rem); line-height: 1; }
  .cs-hero-amp { font-family: var(--font-cormorant), serif; color: var(--champagne); font-style: normal; padding: 0 0.4rem; }
  .cs-hero-rule { width: 46px; height: 1px; background: var(--champagne); opacity: 0.6; margin: 0.35rem 0; }
  .cs-hero-meta { display: flex; align-items: center; gap: 0.75rem; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.85; }
  .cs-hero-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--champagne); }

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

  /* ── Music toggle (identidad propia: cápsula flotante estilo boya) ── */
  .cs-music { position: fixed; bottom: 1.75rem; right: 1.75rem; z-index: 100; display: flex; align-items: center; gap: 0.6rem; padding: 0.7rem 1.1rem; border-radius: 100px; background: var(--deep); color: var(--foam); border: 1px solid rgba(255,255,255,0.15); cursor: pointer; font-size: 11px; letter-spacing: 0.1em; box-shadow: 0 10px 30px rgba(14,43,51,0.25); }
  .cs-music-bars { display: flex; align-items: flex-end; gap: 2px; height: 12px; }
  .cs-music-bars span { width: 2px; background: var(--lagoon); border-radius: 2px; animation: csBar 0.9s ease-in-out infinite alternate; }
  .cs-music-bars span:nth-child(2) { animation-delay: 0.2s; }
  .cs-music-bars span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes csBar { from { height: 3px; } to { height: 12px; } }

  /* ── Countdown: perlas en zigzag, como boyas sobre el oleaje ── */
  .cs-countdown { display: flex; justify-content: center; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
  .cs-cd-pill { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 84px; height: 84px; border-radius: 50%; background: var(--foam); border: 1px solid rgba(185,151,91,0.35); box-shadow: 0 12px 30px rgba(14,43,51,0.06); }
  @media (min-width: 768px) { .cs-cd-pill { width: 108px; height: 108px; } }
  .cs-cd-num { font-family: var(--font-cinzel), serif; font-size: 1.5rem; color: var(--ink); }
  @media (min-width: 768px) { .cs-cd-num { font-size: 2rem; } }
  .cs-cd-lbl { font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.5; margin-top: 0.2rem; }

  /* ── Cita ── */
  .cs-quote { max-width: 620px; margin: 0 auto; text-align: center; position: relative; }
  .cs-quote-mark { display: block; font-family: var(--font-cormorant), serif; font-style: italic; font-size: 5rem; color: var(--champagne); opacity: 0.35; line-height: 1; transform: rotate(-6deg); margin-bottom: -1.5rem; }
  .cs-quote p { font-family: var(--font-cormorant), serif; font-style: italic; font-size: clamp(1.3rem, 2.6vw, 1.7rem); line-height: 1.6; }

  /* ── Padres: columnas desfasadas, no alineadas en la misma línea ── */
  .cs-parents { display: grid; gap: 3rem; max-width: 760px; margin: 0 auto; }
  @media (min-width: 640px) { .cs-parents { grid-template-columns: 1fr auto 1fr; align-items: center; } }
  .cs-parents-side { text-align: center; }
  .cs-parents-side p.role { font-family: var(--font-cormorant), serif; font-style: italic; font-size: 1.6rem; color: var(--coral); margin-bottom: 0.6rem; }
  .cs-parents-side p.names { font-family: var(--font-jost), sans-serif; letter-spacing: 0.04em; }
  .cs-parents-divider { display: flex; justify-content: center; opacity: 0.4; }
  @media (min-width: 640px) {
    .cs-parents-side:nth-child(1) { margin-top: -1.25rem; }
    .cs-parents-side:nth-child(3) { margin-top: 1.25rem; }
  }

  /* ── Itinerario: costa/orilla con puntos, texto en zigzag ── */
  .cs-timeline { max-width: 640px; margin: 0 auto; position: relative; padding-left: 2rem; }
  .cs-timeline::before { content: ''; position: absolute; left: 7px; top: 0.4rem; bottom: 0.4rem; width: 1px; background: repeating-linear-gradient(to bottom, var(--lagoon) 0 6px, transparent 6px 12px); }
  .cs-tl-item { position: relative; padding-bottom: 3rem; transition: padding-left 0.2s ease; }
  .cs-tl-item:last-child { padding-bottom: 0; }
  .cs-tl-item:nth-child(even) { padding-left: 1.75rem; }
  @media (min-width: 640px) { .cs-tl-item:nth-child(even) { padding-left: 3rem; } }
  .cs-tl-dot { position: absolute; left: -2rem; top: 0.2rem; width: 15px; height: 15px; border-radius: 50%; background: var(--lagoon); border: 3px solid var(--foam); box-shadow: 0 0 0 1px rgba(42,172,166,0.4); }
  .cs-tl-time { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--lagoon); }
  .cs-tl-name { font-family: var(--font-cormorant), serif; font-size: 1.5rem; margin: 0.2rem 0; }
  .cs-tl-venue { font-size: 13px; opacity: 0.75; }
  .cs-tl-link { display: inline-block; margin-top: 0.6rem; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--coral); text-decoration: none; border-bottom: 1px solid var(--coral); }

  /* ── Bloques de fotos: dispersas, no apiladas ── */
  .cs-photos-wrap { max-width: 900px; margin: 0 auto; padding: 0 1.5rem 5rem; display: flex; flex-direction: column; gap: 3rem; }
  .cs-photo { aspect-ratio: 16 / 10; overflow: hidden; border-radius: 10px; box-shadow: 0 20px 40px rgba(14,43,51,0.12); }
  .cs-photo img { width: 100%; height: 100%; object-fit: cover; }
  .cs-photo.reveal { transform: translateY(24px) rotate(var(--tilt, 0deg)); }
  .cs-photo.reveal.visible { transform: translateY(0) rotate(var(--tilt, 0deg)); }

  /* ── Dress code ── */
  .cs-dress-card { max-width: 640px; margin: 0 auto; text-align: center; }
  .cs-dress-label { display: inline-block; padding: 0.5rem 1.5rem; border: 1px solid var(--lagoon); border-radius: 100px; font-family: var(--font-cinzel), serif; font-size: 0.9rem; letter-spacing: 0.15em; margin-bottom: 2.5rem; }
  .cs-dress-cols { display: grid; gap: 2rem; text-align: left; margin-bottom: 2.5rem; }
  @media (min-width: 640px) { .cs-dress-cols { grid-template-columns: 1fr 1fr; } }
  .cs-dress-cols h4 { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--coral); margin-bottom: 0.5rem; }
  .cs-swatches { display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; }
  .cs-swatch { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
  .cs-swatch-dot { width: 44px; height: 44px; border-radius: 50%; box-shadow: 0 6px 16px rgba(14,43,51,0.12); }
  .cs-swatch span { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.6; }

  /* ── No niños ── */
  .cs-adults { max-width: 460px; margin: 0 auto; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; }

  /* ── Regalos ── */
  .cs-gifts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; max-width: 720px; margin: 0 auto; }
  .cs-gift-card { background: var(--foam); border: 1px solid rgba(42,172,166,0.2); border-radius: 18px; padding: 1.75rem; display: flex; flex-direction: column; gap: 0.9rem; }
  .cs-gift-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(42,172,166,0.12); display: flex; align-items: center; justify-content: center; color: var(--lagoon); }
  .cs-gift-row { display: flex; flex-direction: column; gap: 0.1rem; }
  .cs-gift-row span.lbl { font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.5; }
  .cs-gift-row span.val { font-size: 13px; }
  .cs-gift-link { align-self: flex-start; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--coral); text-decoration: none; border-bottom: 1px solid var(--coral); }

  /* ── Notas ── */
  .cs-notes { max-width: 520px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem; }
  .cs-note { display: flex; gap: 1rem; align-items: flex-start; }
  .cs-note-mark { color: var(--coral); font-family: var(--font-cormorant), serif; font-style: italic; font-size: 1.1rem; flex-shrink: 0; }

  /* ── RSVP ── */
  .cs-rsvp { text-align: center; }
  .cs-btn { display: inline-block; background: var(--deep); color: white; padding: 1.1rem 3rem; border-radius: 100px; font-family: var(--font-jost), sans-serif; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; border: 1px solid var(--deep); cursor: pointer; text-decoration: none; box-shadow: 0 14px 30px rgba(14,43,51,0.18); transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease; }
  .cs-btn:hover { background: var(--ink); border-color: var(--champagne); transform: translateY(-2px); }
  .cs-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .cs-rsvp-done { display: inline-flex; align-items: center; gap: 0.6rem; background: rgba(42,172,166,0.1); border: 1px solid rgba(42,172,166,0.3); color: var(--lagoon); padding: 0.85rem 1.75rem; border-radius: 100px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; }
  .cs-rsvp-edit { display: block; margin-top: 0.9rem; font-size: 11px; text-decoration: underline; opacity: 0.6; cursor: pointer; background: none; border: none; }

  /* ── Footer ── */
  .cs-footer { background: var(--deep); color: var(--foam); text-align: center; padding: 3rem 1.5rem 3.5rem; }
  .cs-footer-mono { font-family: var(--font-cormorant), serif; font-style: italic; font-size: 2.2rem; color: var(--coral); opacity: 0.7; margin-bottom: 0.4rem; }
  .cs-footer-names { font-family: var(--font-cormorant), serif; font-size: 1.3rem; }
  .cs-footer-date { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.5; margin-top: 0.5rem; }
  .cs-footer-powered { font-size: 9px; letter-spacing: 0.2em; opacity: 0.35; margin-top: 1.75rem; }
  .cs-footer-brand { color: var(--lagoon); }

  /* ── Modal RSVP ── */
  .cs-modal-backdrop { position: fixed; inset: 0; background: rgba(14,43,51,0.7); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .cs-modal { background: var(--foam); border-radius: 24px; width: 100%; max-width: 420px; max-height: 90svh; overflow-y: auto; position: relative; }
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

  /* ── Reveal ── */
  .reveal { opacity: 0; transform: translateY(24px); transition: all 1s cubic-bezier(0.16,1,0.3,1); }
  .reveal.visible { opacity: 1; transform: translateY(0); }
`;

// ---------------------------------------------------------------------------
// Theme override
// ---------------------------------------------------------------------------
function buildThemeCSS(theme?: CostaConfig['theme']): string {
  if (!theme?.accentColor) return '';
  return `:root { --lagoon: ${theme.accentColor}; }`;
}

// ---------------------------------------------------------------------------
// Curvas orgánicas — identidad de "Costa": cada sección rompe con una línea
// de orilla en vez de un corte recto (nunca la misma curva dos veces seguidas)
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
  <div className="cs-heading-block reveal">
    {eyebrow && <p className="cs-eyebrow">{eyebrow}</p>}
    <h2 className="cs-heading">{title}</h2>
    <span className="cs-heading-rule" />
  </div>
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

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [isLoaded]);

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

  function renderBlocks(afterSection: string) {
    const blocks = allowedBlockPhotos.filter(p => p.afterSection === afterSection);
    if (!blocks.length) return null;
    return (
      <div className="cs-photos-wrap">
        {blocks.map((p, i) => {
          const odd = i % 2 === 1;
          return (
            <div
              key={i}
              className="cs-photo reveal"
              style={{
                width: i === 0 ? '100%' : odd ? '64%' : '78%',
                marginLeft: odd ? 'auto' : undefined,
                ['--tilt' as string]: i === 0 ? '0deg' : odd ? '1.3deg' : '-1deg',
              } as React.CSSProperties}
            >
              <img src={p.url} alt="Costa" style={{ objectPosition: p.objectPosition || 'center' }} />
            </div>
          );
        })}
      </div>
    );
  }

  const themeCSS = buildThemeCSS(config.theme);

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

          {/* ── HERO ── */}
          <section className="cs-hero">
            <img src={heroPhoto} alt="Hero" className="cs-hero-img" />
            <div className="cs-hero-tint" />
            <div className="cs-hero-content">
              <span className="cs-hero-label">{config.heroLabel || 'Boda frente al mar'}</span>
              <h1 className="cs-hero-names">
                {config.couple?.person1}<span className="cs-hero-amp">&</span>{config.couple?.person2}
              </h1>
              <span className="cs-hero-rule" />
              <div className="cs-hero-meta">
                <span>{config.date?.day} · {config.date?.month} · {config.date?.year}</span>
                <span className="cs-hero-dot" />
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
                  <div key={i} className="cs-cd-pill reveal" style={{ transitionDelay: `${i * 120}ms`, marginTop: i % 2 === 1 ? 22 : 0 }}>
                    <span className="cs-cd-num">{String(u.v).padStart(2, '0')}</span>
                    <span className="cs-cd-lbl">{u.l}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── CITA ── */}
          {config.sections?.quote !== false && config.quote?.text && (
            <Section bg="foam" style={{ paddingTop: caps.countdown ? '0' : undefined }}>
              <SectionHeading eyebrow="Nuestra historia" title="Un mensaje especial" />
              <div className="cs-quote reveal">
                <span className="cs-quote-mark" aria-hidden="true">&ldquo;</span>
                <p>{config.quote.text}</p>
                {config.quote.reference && <p className="cs-eyebrow" style={{ marginTop: '1.25rem' }}>— {config.quote.reference}</p>}
              </div>
            </Section>
          )}

          {/* ── PADRES ── */}
          {config.sections?.parents !== false && (
            <Section bg="deep" flip>
              <SectionHeading eyebrow="Con la bendición de" title="Nuestras familias" />
              <div className="cs-parents reveal">
                <div className="cs-parents-side">
                  <p className="role">Ella</p>
                  <p className="names">{config.parents?.person1 || 'Sus padres'}</p>
                </div>
                <div className="cs-parents-divider"><Sailboat size={22} /></div>
                <div className="cs-parents-side">
                  <p className="role">Él</p>
                  <p className="names">{config.parents?.person2 || 'Sus padres'}</p>
                </div>
              </div>
            </Section>
          )}

          {renderBlocks('parents')}

          {/* ── ITINERARIO ── */}
          {config.sections?.itinerary !== false && !!config.itinerary?.length && (
            <Section bg="sand" flip>
              <SectionHeading eyebrow="El gran día" title="Itinerario" />
              <div className="cs-timeline reveal">
                {config.itinerary.map((item, idx) => (
                  <div key={idx} className="cs-tl-item">
                    <span className="cs-tl-dot" />
                    <p className="cs-tl-time">{item.time}</p>
                    <h3 className="cs-tl-name">{item.name}</h3>
                    <p className="cs-tl-venue">{item.venue}{item.address ? ` · ${item.address}` : ''}</p>
                    {item.mapsUrl && <a href={item.mapsUrl} target="_blank" rel="noopener noreferrer" className="cs-tl-link">Ver ubicación</a>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {renderBlocks('itinerary')}

          {/* ── DESTINO ── */}
          {config.sections?.destination !== false && config.destination && (config.destination.hotels?.length || config.destination.transport?.info) && (
            <Section bg="foam">
              <SectionHeading eyebrow="Viaje" title="Hospedaje y transporte" />
              <div className="reveal" style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {!!config.destination.hotels?.length && (
                  <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    {config.destination.hotels.map((h, i) => (
                      <div key={i} style={{ border: '1px solid rgba(42,172,166,0.2)', borderRadius: 16, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', transform: i % 2 === 1 ? 'translateY(14px)' : undefined }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <p className="cs-display" style={{ fontSize: '1.15rem' }}>{h.name}</p>
                          <Hotel size={16} style={{ color: 'var(--lagoon)', flexShrink: 0, marginTop: 2 }} />
                        </div>
                        {h.category && <p className="cs-eyebrow" style={{ fontSize: 9 }}>{h.category}</p>}
                        {h.address && <p style={{ fontSize: 12, opacity: 0.7 }}>{h.address}</p>}
                        {h.note && <p style={{ fontSize: 12, opacity: 0.6, fontStyle: 'italic' }}>{h.note}</p>}
                        {h.phone && <a href={`tel:${h.phone.replace(/\s/g, '')}`} className="cs-eyebrow" style={{ fontSize: 9, marginTop: 4 }}>{h.phone}</a>}
                      </div>
                    ))}
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

          {/* ── DRESS CODE ── */}
          {config.sections?.dressCode !== false && config.dressCode && (
            <Section bg="sand">
              <SectionHeading eyebrow="Importante" title="Código de vestimenta" />
              <div className="cs-dress-card reveal">
                <span className="cs-dress-label">{config.dressCode.label}</span>
                <div className="cs-dress-cols">
                  <div><h4>Ellas</h4><p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>{config.dressCode.women}</p></div>
                  <div style={{ marginTop: '1.5rem' }}><h4>Ellos</h4><p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>{config.dressCode.men}</p></div>
                </div>
                {!!config.dressCode.swatches?.length && (
                  <div className="cs-swatches">
                    {config.dressCode.swatches.map((s, i) => (
                      <div key={i} className="cs-swatch" style={{ marginTop: i % 2 === 1 ? 10 : 0 }}>
                        <div className="cs-swatch-dot" style={{ backgroundColor: s.color }} />
                        <span>{s.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* ── NO NIÑOS ── */}
          {config.noChildren && (
            <Section bg="deep" flip>
              <div className="cs-adults reveal">
                <UserX size={26} style={{ color: 'var(--coral)' }} />
                <p className="cs-heading" style={{ fontSize: 18 }}>Evento para adultos</p>
                <p style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.7 }}>
                  {config.noChildrenMessage || 'Con todo nuestro cariño, les pedimos que esta celebración sea exclusiva para adultos. Agradecemos su comprensión.'}
                </p>
              </div>
            </Section>
          )}

          {/* ── REGALOS ── */}
          {config.sections?.gifts !== false && (() => {
            const gt = config.gifts?.giftTypes ?? [];
            const showTransfer = gt.includes('transfer') || (!gt.length && !!config.gifts?.bank);
            const showList = gt.includes('list') || (!gt.length && !!config.gifts?.giftListUrl);
            const showEnvelope = gt.includes('envelope');
            if (!config.gifts || (!showTransfer && !showList && !showEnvelope)) return null;
            const gifts = config.gifts;
            return (
              <Section bg="foam">
                <SectionHeading eyebrow="Obsequios" title="Mesa de regalos" />
                <div className="cs-gifts-grid reveal">
                  {showTransfer && gifts.bank && (
                    <div className="cs-gift-card">
                      <div className="cs-gift-icon"><Waves size={16} /></div>
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
                    <div className="cs-gift-card" style={{ textAlign: 'center', alignItems: 'center' }}>
                      <div className="cs-gift-icon"><Gift size={16} /></div>
                      <p className="cs-display" style={{ fontSize: '1.2rem', fontStyle: 'italic' }}>Mesa de regalos</p>
                      {gifts.giftListLabel && <p style={{ fontSize: 12, opacity: 0.65 }}>{gifts.giftListLabel}</p>}
                      <a href={gifts.giftListUrl} target="_blank" rel="noopener noreferrer" className="cs-gift-link">Ver lista →</a>
                    </div>
                  )}
                  {showEnvelope && (
                    <div className="cs-gift-card" style={{ textAlign: 'center', alignItems: 'center' }}>
                      <div className="cs-gift-icon"><Gift size={16} /></div>
                      <p className="cs-display" style={{ fontSize: '1.2rem', fontStyle: 'italic' }}>Sobre de regalo</p>
                      <p style={{ fontSize: 12, opacity: 0.65 }}>{gifts.envelopeMessage || 'Con gusto recibimos sobres el día del evento'}</p>
                    </div>
                  )}
                </div>
              </Section>
            );
          })()}

          {/* ── NOTAS ── */}
          {config.sections?.notes !== false && !!config.notes?.filter(n => n?.trim()).length && (
            <Section bg="sand">
              <SectionHeading eyebrow="Importante" title="Notas adicionales" />
              <div className="cs-notes reveal">
                {config.notes.filter(n => n?.trim()).map((note, i) => (
                  <div key={i} className="cs-note" style={{ marginLeft: i % 2 === 1 ? 18 : 0 }}>
                    <span className="cs-note-mark">{String(i + 1).padStart(2, '0')}</span>
                    <p style={{ fontSize: 14, opacity: 0.75, lineHeight: 1.6 }}>{note}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── RSVP ── */}
          <CurveTop fill="var(--foam)" flip />
          <section className="cs-section cs-rsvp">
            <SectionHeading eyebrow="RSVP" title="¿Nos acompañas en la orilla?" />
            <p style={{ maxWidth: 420, margin: '-2rem auto 2.5rem', fontSize: 14, opacity: 0.75, lineHeight: 1.7 }}>
              Será un verdadero honor celebrar este inicio contigo. Por favor confirma tu asistencia.
            </p>
            {!rsvpDone ? (
              caps.rsvpMode === 'whatsapp' && config.whatsapp?.number ? (
                <a href={`https://wa.me/${config.whatsapp.number}?text=${encodeURIComponent(config.whatsapp.message ?? '')}`} target="_blank" rel="noopener noreferrer" className="cs-btn reveal">
                  Confirmar por WhatsApp
                </a>
              ) : (
                <button className="cs-btn reveal" onClick={() => setIsRsvpOpen(true)}>Confirmar asistencia</button>
              )
            ) : (
              <div className="reveal">
                <span className="cs-rsvp-done"><Check size={16} /> {guestConfirmed === false ? 'No asistiré' : '¡Confirmado!'}</span>
                <button className="cs-rsvp-edit" onClick={() => { setRsvpDone(false); setGuestConfirmed(null); setIsRsvpOpen(true); }}>
                  Actualizar respuesta
                </button>
              </div>
            )}
          </section>

          {/* ── FOOTER ── */}
          <CurveTop fill="var(--deep)" />
          <footer className="cs-footer">
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
