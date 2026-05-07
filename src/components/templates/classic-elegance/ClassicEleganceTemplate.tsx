'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Cormorant_Garamond, Jost, Playfair_Display, EB_Garamond, Raleway, Montserrat, Pinyon_Script, Cinzel, Lora } from 'next/font/google';
import { MapPin, Play, Pause, CalendarDays, Hotel, Car, Mail, Gift, Flower2, Shirt, UserX, ChevronDown, Check, X, Camera, Music2 } from 'lucide-react';
import type { PhotoEntry } from '@/lib/imageLayout';
import ContentProtection from '@/components/templates/shared/ContentProtection';

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['300', '400', '600'], style: ['normal', 'italic'], variable: '--font-cormorant' });
const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-jost' });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'], variable: '--font-playfair' });
const ebGaramond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--font-eb-garamond' });
const raleway = Raleway({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-raleway' });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-montserrat' });
const pinyon = Pinyon_Script({ subsets: ['latin'], weight: ['400'], variable: '--font-pinyon' });
const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-cinzel' });
const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-lora' });

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
  imageObjectPosition?: string;
  imageScale?: number;
}
export interface Swatch { color: string; name: string; }
export interface HotelEntry { name: string; category: string; address: string; note: string; phone: string; }

export interface ClassicEleganceConfig {
  theme?: {
    accentColor?:     string;
    backgroundColor?: string;
    textColor?:       string;
    displayFont?:     'cormorant' | 'playfair' | 'cinzel' | 'pinyon';
    bodyFont?:        'jost' | 'lora' | 'montserrat';
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
  dressCode?: { label?: string; description?: string; women?: string; men?: string; swatches?: Swatch[]; avoid?: Swatch[] };
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
  rsvp?: {
    maxPlusOnes?: number;
    deadline?: string;
    dietaryOptions?: string[];
  };
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
  config: ClassicEleganceConfig;
  eventId?: string;
  guestToken?: string;
  maxCompanions?: number;
  companionNames?: string[];
  guestName?: string;
  hasExistingRsvp?: boolean;
  invalidToken?: boolean;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const css = `
  :root {
    --sage:     #E5EAE4;
    --beige:    #F5F5F1;
    --gold:     #A68D5B;
    --white:    #FFFFFF;
    --dark:     #2C2C2C;
    --muted:    #D1D1D1;
    --ivory:    var(--beige);
    --charcoal: var(--dark);
  }

  .ce-root { 
    background: var(--beige); 
    color: var(--dark); 
    font-family: var(--font-lora), serif;
    overflow-x: hidden;
  }

  .font-display { font-family: var(--font-pinyon), cursive; }
  .font-heading { font-family: var(--font-cinzel), serif; }
  .font-body { font-family: var(--font-lora), serif; }
  .font-sans { font-family: var(--font-jost), sans-serif; }

  /* ── Deluxe Components Styles ── */
  .label { font-family: var(--font-jost), sans-serif; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--gold); }
  
  /* ── Torn Paper (inline SVG) ── */
  .torn-svg { display: block; width: 100%; pointer-events: none; position: relative; z-index: 10; }
  .torn-svg--top  { margin-top: -139px; }
  .torn-svg--bottom { margin-bottom: -139px; }

  /* ── Sections ── */
  .section-pad { padding: 14rem 2rem; }
  /* Paper grain texture on white sections */
  .bg-white {
    background-color: var(--white);
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='linear' slope='0.03'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)'/%3E%3C/svg%3E");
  }
  .bg-beige { background: var(--beige); }
  .bg-sage { background: var(--sage); }

  /* ── Hero Deluxe Style ── */
  .ce-hero {
    position: relative; min-height: 100svh; display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: var(--white); overflow: hidden;
  }
  .ce-hero-bg { position: absolute; inset: 0; z-index: 0; }
  .ce-hero-img { width: 100%; height: 100%; object-fit: cover; animation: slowZoom 20s infinite alternate ease-in-out; }
  .ce-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(44,44,44,0.4), rgba(44,44,44,0.1), rgba(44,44,44,0.6)); z-index: 1; }
  
  .ce-hero-content { position: relative; z-index: 2; color: white; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
  .ce-hero-names { font-family: var(--font-pinyon), cursive; font-size: clamp(4rem, 10vw, 8rem); line-height: 1; margin: 0; text-shadow: 0 4px 20px rgba(0,0,0,0.2); }
  .ce-hero-amp { font-family: var(--font-cinzel), serif; font-size: 0.3em; color: var(--gold); vertical-align: middle; margin: 0 0.5rem; }
  
  .ce-hero-bottom { position: absolute; bottom: 0; left: 0; right: 0; z-index: 3; }

  /* ── Music Pill ── */
  .music-pill {
    position: fixed; bottom: 2rem; right: 2rem; z-index: 100;
    display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; border-radius: 100px;
    background: rgba(20,16,12,0.85); border: 1px solid rgba(166,141,91,0.3); color: var(--beige);
    font-family: var(--font-jost), sans-serif; font-size: 11px; letter-spacing: 0.1em; cursor: pointer;
    backdrop-filter: blur(16px); transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    max-width: 320px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }
  .music-pill--minimized { padding: 0.75rem; width: 44px; height: 44px; border-radius: 50%; max-width: 44px; background: rgba(166,141,91,0.9); border-color: var(--gold); }
  .music-pill--minimized .music-pill-text, .music-pill--minimized .music-pill-wave { display: none; }
  .music-pill-icon { display: flex; align-items: center; justify-content: center; }
  .music-pill--minimized:hover { background: rgba(200,165,100,0.95); }
  .music-pill:hover { border-color: var(--gold); }
  .music-pill--playing { border-color: var(--gold); }
  .music-pill-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .music-pill-wave { display: flex; align-items: flex-end; gap: 2px; height: 14px; margin-left: 2px; }
  .music-pill-wave span { display: block; width: 2px; background: var(--gold); border-radius: 2px; animation: wave 0.8s ease-in-out infinite alternate; }
  .music-pill-wave span:nth-child(1) { height: 4px; animation-delay: 0s; }
  .music-pill-wave span:nth-child(2) { height: 10px; animation-delay: 0.15s; }
  .music-pill-wave span:nth-child(3) { height: 7px; animation-delay: 0.3s; }
  .music-pill-wave span:nth-child(4) { height: 12px; animation-delay: 0.45s; }
  @keyframes wave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }
  @keyframes scrollDown { 0% { transform: translateY(-100%); } 100% { transform: translateY(200%); } }
  .animate-scrollDown { animation: scrollDown 2s ease-in-out infinite; }

  @keyframes pulse-gold {
    0% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(166, 141, 91, 0)); }
    50% { transform: scale(1.02); filter: drop-shadow(0 0 15px rgba(166, 141, 91, 0.15)); }
    100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(166, 141, 91, 0)); }
  }
  .ce-cd-number { animation: pulse-gold 3s ease-in-out infinite; display: inline-block; }
  
  .ce-cd-card {
    background: var(--white);
    padding: 2rem 1rem;
    border-radius: 12px;
    min-width: 120px;
    box-shadow: 0 15px 45px rgba(0,0,0,0.03);
    border: 1px solid rgba(166, 141, 91, 0.1);
    position: relative;
    overflow: hidden;
  }
  .ce-cd-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
    background: var(--gold); transform: scaleX(0); transition: transform 0.6s ease;
    transform-origin: center;
  }
  .ce-cd-card:hover::after { transform: scaleX(1); }

  /* ── Itinerary Arch (Preserved) ── */
  .ce-arch-container {
    background: var(--white); border-radius: 400px 400px 0 0; max-width: 550px; margin: 0 auto;
    padding: 6rem 2.5rem 4rem; border: 1px solid var(--sage); position: relative; box-shadow: 0 10px 40px rgba(0,0,0,0.02);
    overflow: hidden;
  }
  .ce-arch-line { position: absolute; left: 50%; top: 10rem; bottom: 4rem; width: 1px; background: var(--sage); transform: translateX(-50%); }
  .ce-itinerary-item { position: relative; z-index: 1; margin-bottom: 10rem; display: flex; flex-direction: column; align-items: center; background: var(--white); padding: 1rem 2.5rem; border-radius: 4px; }

  /* ── Photo Blocks ── */
  .photo-block { width: 100%; aspect-ratio: 21 / 9; overflow: hidden; position: relative; }
  .photo-block-img { width: 100%; height: 100%; object-fit: cover; }
  .duo-block { display: flex; width: 100%; aspect-ratio: 2 / 1; gap: 4px; overflow: hidden; }
  .trio-block { display: flex; width: 100%; aspect-ratio: 12 / 5; gap: 4px; overflow: hidden; }
  
  /* ── RSVP Deluxe ── */
  .rsvp-section { padding: 8rem 2rem; background: var(--white); text-align: center; }
  .ce-btn-primary { 
    background: var(--gold); color: white; padding: 1.25rem 3.5rem; font-family: var(--font-cinzel), serif;
    letter-spacing: 0.25em; text-transform: uppercase; border: none; cursor: pointer; transition: all 0.4s ease;
    box-shadow: 0 10px 30px rgba(166, 141, 91, 0.2);
  }
  .ce-btn-primary:hover { background: var(--dark); transform: translateY(-3px); }

  /* ── Reveal ── */
  .reveal { opacity: 0; transform: translateY(30px); transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1); }
  .reveal.visible { opacity: 1; transform: translateY(0); }

  /* ── Gifts Deluxe Style ── */
  .gifts-grid-v2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1.25rem; width: 100%; max-width: 720px; }
  .gifts-grid-v2 .gift-card-v2:last-child:nth-child(3) { grid-column: 1 / -1; justify-self: center; width: 100%; max-width: 320px; }
  @media (max-width: 560px) {
    .gifts-grid-v2 { grid-template-columns: 1fr; max-width: 380px; }
    .gifts-grid-v2 .gift-card-v2:last-child:nth-child(3) { grid-column: auto; justify-self: auto; max-width: 100%; }
  }
  .gift-card-v2 { border-radius: 20px; overflow: hidden; position: relative; transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease; cursor: default; }
  .gift-card-v2:hover { transform: translateY(-5px); box-shadow: 0 20px 48px rgba(28,22,17,0.13); }
  .gift-card-v2--transfer { background: color-mix(in srgb, var(--beige) 94%, var(--gold) 6%); border: 1px solid rgba(166,141,91,0.22); padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; }
  .gift-card-v2--transfer::after { content: ''; position: absolute; top: -50px; right: -50px; width: 160px; height: 160px; border-radius: 50%; background: radial-gradient(circle, rgba(166,141,91,0.09) 0%, transparent 70%); pointer-events: none; }
  .gct-header { display: flex; align-items: center; justify-content: space-between; }
  .gct-badge { font-family: var(--font-jost), sans-serif; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--gold); opacity: 0.7; }
  .gct-icon-wrap { width: 34px; height: 34px; border-radius: 10px; background: rgba(166,141,91,0.1); border: 1px solid rgba(166,141,91,0.25); display: flex; align-items: center; justify-content: center; }
  .gct-rows { display: flex; flex-direction: column; gap: 0.75rem; }
  .gct-row { display: flex; flex-direction: column; gap: 0.1rem; }
  .gct-row-label { font-family: var(--font-jost), sans-serif; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(166,141,91,0.55); }
  .gct-row-value { font-family: var(--font-jost), sans-serif; font-size: 13px; font-weight: 400; color: var(--dark); letter-spacing: 0.01em; }
  .gct-row-value--mono { font-size: 12px; letter-spacing: 0.12em; opacity: 0.85; }
  .gct-divider { height: 1px; background: rgba(166,141,91,0.12); margin: 0; }
  .gift-card-v2--list { background: var(--beige); border: 1px solid var(--muted); padding: 2rem 1.75rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; text-align: center; }
  .gcl-icon-ring { width: 52px; height: 52px; border-radius: 50%; background: color-mix(in srgb, var(--beige) 82%, var(--gold)); border: 1px solid rgba(166,141,91,0.3); display: flex; align-items: center; justify-content: center; margin-bottom: 0.25rem; }
  .gcl-title { font-family: var(--font-lora), serif; font-size: 1.3rem; font-style: italic; font-weight: 400; color: var(--dark); margin: 0; }
  .gcl-subtitle { font-family: var(--font-jost), sans-serif; font-size: 12px; color: rgba(44,44,44,0.5); line-height: 1.7; max-width: 180px; margin: 0.1rem 0 0.75rem; }
  .gift-card-v2--envelope { background: var(--beige); border: 1px solid var(--muted); padding: 2rem 1.75rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; text-align: center; }
  .gce-icon-ring { width: 52px; height: 52px; border-radius: 50%; background: rgba(166,141,91,0.1); border: 1px solid rgba(166,141,91,0.3); display: flex; align-items: center; justify-content: center; margin-bottom: 0.25rem; }
  .gce-note { font-family: var(--font-lora), serif; font-size: 1.05rem; font-style: italic; color: rgba(44,44,44,0.5); line-height: 1.65; max-width: 200px; margin: 0.1rem 0 0; }
  .ce-btn-outline { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1.25rem; border-radius: 100px; border: 1px solid var(--gold); color: var(--gold); font-family: var(--font-jost), sans-serif; font-size: 11px; letter-spacing: 0.1em; text-decoration: none; transition: background 0.2s, color 0.2s; }
  .ce-btn-outline:hover { background: var(--gold); color: white; }

  /* ── Loader ── */
  .ce-loader { position: fixed; inset: 0; background: var(--dark); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; z-index: 999; transition: opacity 0.6s ease, transform 0.6s ease; }
  .ce-loader--out { opacity: 0; transform: scale(1.04); pointer-events: none; }
  .ce-loader-monogram { display: flex; align-items: center; gap: 0.5rem; animation: ceLoaderReveal 1s cubic-bezier(0.16,1,0.3,1) 0.3s both; }
  .ce-loader-initial { font-family: var(--font-lora), serif; font-size: clamp(64px, 15vw, 120px); font-weight: 300; font-style: italic; color: white; line-height: 1; }
  .ce-loader-amp { font-family: var(--font-lora), serif; font-size: clamp(32px, 7vw, 56px); font-weight: 300; color: var(--gold); margin: 0 0.25rem; align-self: flex-start; padding-top: 0.5rem; }
  .ce-loader-line { width: 60px; height: 1px; background: var(--gold); animation: ceLoaderLine 0.8s ease 0.9s both; transform-origin: left; }
  @keyframes ceLoaderLine { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  .ce-loader-date { color: rgba(255,255,255,0.4); animation: ceLoaderReveal 0.8s ease 1.1s both; }
  @keyframes ceLoaderReveal { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  /* ── Modal Deluxe Style ── */
  .ce-modal-backdrop { position: fixed; inset: 0; background: rgba(20,16,12,0.75); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: ceFadeIn 0.25s ease; }
  @keyframes ceFadeIn { from { opacity: 0; } to { opacity: 1; } }
  .ce-modal { background: rgba(245,245,241,0.97); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.45); border-radius: 20px; width: 100%; max-width: 420px; max-height: 90svh; overflow-y: auto; position: relative; animation: ceSlideUp 0.35s cubic-bezier(0.16,1,0.3,1); }
  @keyframes ceSlideUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
  .ce-modal-close { position: absolute; top: 1rem; right: 1rem; width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--muted); background: transparent; color: var(--dark); font-size: 1.25rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; line-height: 1; }
  .ce-modal-close:hover { background: var(--sage); }
  .ce-modal-form { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
  .ce-modal-header { text-align: center; padding-bottom: 1rem; border-bottom: 1px solid var(--sage); }
  .ce-modal-title { font-family: var(--font-lora), serif; font-size: 1.75rem; font-style: italic; font-weight: 300; color: var(--dark); margin: 0.5rem 0; }
  .ce-modal-success { padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  .ce-modal-success-icon { width: 56px; height: 56px; border-radius: 50%; background: var(--sage); border: 1px solid var(--gold); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--gold); }
  .ce-input { width: 100%; padding: 0.75rem 1rem; border: 1px solid var(--sage); background: white; font-family: var(--font-jost), sans-serif; font-size: 14px; color: var(--dark); border-radius: 8px; outline: none; transition: border-color 0.2s; resize: vertical; display: block; }
  .ce-input:focus { border-color: var(--gold); }
  .ce-rsvp-choice { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .ce-rsvp-yes { padding: 0.875rem; border-radius: 10px; background: var(--dark); color: white; font-family: var(--font-jost), sans-serif; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; border: none; cursor: pointer; transition: background 0.2s, transform 0.15s; }
  .ce-rsvp-yes:hover { background: var(--gold); transform: translateY(-1px); }
  .ce-rsvp-yes:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .ce-rsvp-no { padding: 0.875rem; border-radius: 10px; background: transparent; color: rgba(44,44,44,0.5); font-family: var(--font-jost), sans-serif; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; border: 1px solid var(--muted); cursor: pointer; transition: border-color 0.2s, color 0.2s; }
  .ce-rsvp-no:hover { border-color: rgba(44,44,44,0.5); color: var(--dark); }

  /* Guest card */
  .modal-guest-card { display: flex; align-items: center; gap: 1rem; background: var(--sage); border: 1px solid var(--muted); border-radius: 12px; padding: 1rem 1.25rem; }
  .mgc-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--dark); color: white; font-family: var(--font-lora), serif; font-size: 1.4rem; font-style: italic; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .mgc-name { font-family: var(--font-lora), serif; font-size: 1.15rem; font-weight: 400; color: var(--dark); margin: 0 0 0.2rem; }

  /* Attendees list */
  .attendees-list { width: 100%; background: var(--sage); border: 1px solid var(--muted); border-radius: 12px; padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.5rem; text-align: left; }
  .attendee-row { display: flex; align-items: center; gap: 0.75rem; }
  .attendee-row--main { padding-bottom: 0.5rem; border-bottom: 1px solid var(--muted); margin-bottom: 0.25rem; }
  .attendee-num { width: 22px; height: 22px; border-radius: 50%; background: var(--muted); border: 1px solid var(--gold); font-family: var(--font-jost), sans-serif; font-size: 10px; color: var(--gold); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .attendee-name { font-family: var(--font-jost), sans-serif; font-size: 13px; font-weight: 500; color: var(--dark); flex: 1; transition: color 0.2s, opacity 0.2s; }
  .attendee-name--muted { color: rgba(44,44,44,0.4); text-decoration: line-through; opacity: 0.55; }
  .attendee-check-label { display: flex; align-items: center; cursor: pointer; flex-shrink: 0; }
  .attendee-check-label input[type="checkbox"] { display: none; }
  .attendee-check-box { width: 22px; height: 22px; border-radius: 50%; background: var(--muted); border: 1.5px solid rgba(44,44,44,0.3); display: flex; align-items: center; justify-content: center; transition: background 0.2s, border-color 0.2s; flex-shrink: 0; }
  .attendee-check-label input[type="checkbox"]:checked + .attendee-check-box { background: rgba(166,141,91,0.15); border-color: var(--gold); }
  .attendee-check-label input[type="checkbox"]:checked + .attendee-check-box::after { content: '✓'; font-size: 11px; color: var(--gold); line-height: 1; }
  .attendee-badge { font-family: var(--font-jost), sans-serif; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 600; padding: 0.18rem 0.55rem; border-radius: 100px; flex-shrink: 0; transition: background 0.2s, color 0.2s, border-color 0.2s; }
  .attendee-badge--yes { background: rgba(74,160,90,0.12); color: #3d8b52; border: 1px solid rgba(74,160,90,0.28); }
  .attendee-badge--no { background: rgba(0,0,0,0.04); color: rgba(44,44,44,0.4); border: 1px solid rgba(0,0,0,0.1); }

  /* Dietary dropdowns */
  .dlx-dietary-wrap { width: 100%; text-align: center; padding-top: 0.25rem; }
  .dietary-details-container { position: relative; }
  .dietary-details { position: relative; width: 100%; text-align: left; margin-bottom: 0.5rem; }
  .dietary-summary { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 1rem; border: 1px solid rgba(166,141,91,0.3); border-radius: 8px; background: rgba(255,255,255,0.6); color: var(--dark); font-family: var(--font-jost), sans-serif; font-size: 12px; cursor: pointer; list-style: none; transition: border-color 0.2s; }
  .dietary-summary:hover { border-color: var(--gold); }
  .dietary-summary::-webkit-details-marker { display: none; }
  .dietary-options { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--beige); border: 1px solid rgba(166,141,91,0.2); border-radius: 8px; padding: 0.5rem; z-index: 10; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; }
  .dietary-option-label { display: flex; align-items: center; gap: 10px; padding: 8px; cursor: pointer; font-family: var(--font-jost), sans-serif; font-size: 13px; color: var(--dark); border-radius: 6px; transition: background 0.2s; }
  .dietary-option-label:hover { background: rgba(166,141,91,0.08); }
  .dietary-checkbox { accent-color: var(--gold); width: 14px; height: 14px; }

  /* Submit button */
  .btn-submit { width: 100%; padding: 1rem; border-radius: 100px; background: var(--dark); color: white; font-family: var(--font-jost), sans-serif; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; border: none; cursor: pointer; transition: background 0.2s, transform 0.2s; }
  .btn-submit:hover { background: var(--gold); transform: translateY(-1px); }
  .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .rsvp-change { background: none; border: none; font-family: var(--font-jost), sans-serif; font-size: 11px; color: rgba(44,44,44,0.4); cursor: pointer; text-decoration: underline; letter-spacing: 0.05em; }

  /* ── Footer Deluxe Style ── */
  .ce-footer { text-align: center; padding: 3rem 2rem 4rem; border-top: 1px solid rgba(255,255,255,0.08); background: var(--dark); }
  .ce-footer-monogram { font-family: var(--font-lora), serif; font-size: 3rem; font-style: italic; font-weight: 300; color: var(--gold); opacity: 0.5; margin: 0 0 0.5rem; }
  .ce-footer-names { font-family: var(--font-lora), serif; font-size: 1.5rem; font-style: italic; font-weight: 300; color: white; margin: 0; }
  .ce-footer-date { font-family: var(--font-jost), sans-serif; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-top: 0.5rem; }
  .ce-footer-powered { font-family: var(--font-jost), sans-serif; font-size: 9px; letter-spacing: 0.2em; color: rgba(255,255,255,0.35); margin-top: 2rem; }
  .ce-footer-brand { font-family: var(--font-montserrat), 'Montserrat', sans-serif; font-size: 1.1em; font-weight: 400; font-style: normal; color: #b28375; letter-spacing: 0.05em; opacity: 1; }
`;

// ---------------------------------------------------------------------------
// Torn Paper Path Generator
// ---------------------------------------------------------------------------
function buildTornPath(seed: number): string {
  const W = 1440, H = 140, base = 85;
  let s = seed;
  const rand = () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
  let pts = `M0,${H} L0,${base}`;
  let x = 0, y = base;
  let nextBig = 150 + rand() * 300; // Much more distance between major changes
  while (x < W) {
    const step = 10 + Math.floor(rand() * 20); // Larger steps for smoother look
    x = Math.min(x + step, W);
    let dy: number;
    if (x >= nextBig && x < W - 200) {
      // Very soft wave instead of spike
      dy = (rand() > 0.5 ? 1 : -1) * (5 + rand() * 8); 
      nextBig = x + 250 + rand() * 400;
    } else {
      // Minimal jitter for fine fiber feel
      dy = (rand() - 0.5) * 3;
    }
    y = Math.max(base - 12, Math.min(base + 12, y + dy));
    pts += ` L${Math.round(x)},${Math.round(y)}`;
  }
  return pts + ` L${W},${H} Z`;
}

const TORN_FILL_PATH   = buildTornPath(17);
const TORN_FIBER_PATH  = buildTornPath(43);

// ---------------------------------------------------------------------------
// Helper Components
// ---------------------------------------------------------------------------
const TornEdge = ({ position, color = 'var(--white)' }: { position: 'top' | 'bottom'; color?: string }) => {
  const isTop = position === 'top';
  return (
    <div
      className={`torn-svg torn-svg--${position}`}
      style={{
        filter: isTop 
          ? 'drop-shadow(0 -4px 6px rgba(0,0,0,0.06)) drop-shadow(0 -12px 25px rgba(0,0,0,0.1))'
          : 'drop-shadow(0 4px 6px rgba(0,0,0,0.06)) drop-shadow(0 12px 25px rgba(0,0,0,0.1))',
        transform: isTop ? 'none' : 'rotate(180deg)',
        height: 140,
      }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="140"
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        style={{ display: 'block', color }}
      >
        <defs>
          <filter id={`paper-noise-${position}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
        </defs>
        
        {/* Sub-shadow layer for depth */}
        <path d={TORN_FILL_PATH} fill="black" opacity="0.04" transform="translate(0, 3)" />
        
        {/* Main torn fill */}
        <path d={TORN_FILL_PATH} fill="currentColor" />

        {/* Fiber texture overlay */}
        <path d={TORN_FIBER_PATH} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.15" />
        
        {/* Highlight edge */}
        <path d={TORN_FILL_PATH} fill="none" stroke="white" strokeWidth="0.5" opacity="0.4" />
        
        {/* Grain overlay for paper feel */}
        <rect width="100%" height="140" filter={`url(#paper-noise-${position})`} opacity="0.06" />
      </svg>
    </div>
  );
};

const SectionHeading = ({ eyebrow, title, light = false }: { eyebrow?: string; title: string; light?: boolean }) => (
  <div className="text-center mb-16 reveal">
    {eyebrow && <p className="label mb-4" style={{ color: light ? 'rgba(255,255,255,0.6)' : 'var(--gold)' }}>{eyebrow}</p>}
    <h2 className="font-heading text-4xl" style={{ color: light ? 'var(--white)' : 'var(--dark)' }}>{title}</h2>
  </div>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function ClassicEleganceTemplate({ 
  config, 
  eventId, 
  guestToken, 
  maxCompanions = 0, 
  companionNames: initialCompanionNames = [], 
  guestName: initialGuestName = '', 
  hasExistingRsvp = false, 
  invalidToken = false 
}: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loaderOut, setLoaderOut] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicMinimized, setMusicMinimized] = useState(false);
  const [showSongName, setShowSongName] = useState(false);
  const showSongNameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(hasExistingRsvp);
  const [guestConfirmed, setGuestConfirmed] = useState<null | boolean>(null);
  const [attendeeNames, setAttendeeNames] = useState<string[]>([]);
  const [attendeeChecked, setAttendeeChecked] = useState<boolean[]>([]);
  const [dietaryMap, setDietaryMap] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Music: auto-minimize pill after 4s of inactivity
  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => setMusicMinimized(true), 4000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [isLoaded]);

  // Initial Load + Loader
  useEffect(() => {
    const t1 = setTimeout(() => setLoaderOut(true), 2000);
    const t2 = setTimeout(() => setIsLoaded(true), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Countdown Logic
  useEffect(() => {
    if (!config.targetDate) return;
    const target = new Date(config.targetDate).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = target - now;
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

  // Modal focus
  useEffect(() => {
    if (isRsvpOpen) {
      const first = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }
  }, [isRsvpOpen]);

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setMusicMinimized(true);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
        setMusicMinimized(false);
      } catch { /* autoplay blocked */ }
    }
    if (showSongNameTimerRef.current) clearTimeout(showSongNameTimerRef.current);
    setShowSongName(true);
    showSongNameTimerRef.current = setTimeout(() => setShowSongName(false), 3000);
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

  const rawMusicUrl = config.music?.url || '';
  const audioSrc = rawMusicUrl.includes('drive.google.com')
    ? `/api/audio-proxy?url=${encodeURIComponent(rawMusicUrl)}`
    : rawMusicUrl;

  const heroPhoto = config.photos?.find(p => p.role === 'hero')?.url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85';

  /** Renderiza los bloques de imagen con estilo Deluxe */
  function renderBlocks(afterSection: string) {
    const blocks = config.photos?.filter(p => p.role === 'block' && p.afterSection === afterSection) || [];
    if (!blocks.length) return null;

    // Agrupar por layout si es necesario (simplificado para Classic Elegance)
    return (
      <div className="w-full relative overflow-hidden bg-beige">
        <TornEdge position="top" color="var(--white)" />
        <div className="flex flex-col gap-1">
          {blocks.map((p, i) => {
            if (p.layout === 'duo' && i % 2 === 0 && blocks[i+1]?.layout === 'duo') {
              // Manejar duo (par de imágenes)
              return (
                <div key={i} className="duo-block reveal">
                  <div className="flex-1 overflow-hidden">
                    <img src={p.url} alt="Gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <img src={blocks[i+1].url} alt="Gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
              );
            }
            if (p.layout === 'duo' && i % 2 !== 0) return null; // Saltar el segundo del duo

            return (
              <div key={i} className="photo-block reveal">
                <img src={p.url} alt="Gallery" className="photo-block-img hover:scale-105 transition-transform duration-1000" style={{ objectPosition: p.objectPosition || 'center center' }} />
              </div>
            );
          })}
        </div>
        <TornEdge position="bottom" color="var(--white)" />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex-1 flex flex-col">
      <ContentProtection enabled={true}>
        <div className="ce-root">
          <style dangerouslySetInnerHTML={{ __html: css }} />
          <div className={`ce-loader ${loaderOut ? 'ce-loader--out' : ''}`}>
            <div className="ce-loader-monogram">
              {config.monogram ? (
                <span className="ce-loader-initial">{config.monogram}</span>
              ) : (
                <>
                  <span className="ce-loader-initial">{config.couple?.person1?.[0]}</span>
                  <span className="ce-loader-amp">&amp;</span>
                  <span className="ce-loader-initial">{config.couple?.person2?.[0]}</span>
                </>
              )}
            </div>
            <div className="ce-loader-line" />
            <p className="ce-loader-date label">
              {config.date?.day} · {config.date?.month} · {config.date?.year}
            </p>
          </div>
        </div>
      </ContentProtection>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
    <ContentProtection enabled={true}>
      <div className="ce-root">
        <style dangerouslySetInnerHTML={{ __html: css }} />
        {audioSrc && (
          <audio 
            ref={audioRef} 
            src={audioSrc} 
            loop 
            preload="auto" 
            crossOrigin="anonymous"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}

        {/* ── MUSIC PILL ── */}
        {config.music?.url && (
          <button
            className={`music-pill ${isPlaying ? 'music-pill--playing' : ''} ${musicMinimized ? 'music-pill--minimized' : ''}`}
            onClick={toggleMusic}
            aria-label="Play"
          >
            <div className="music-pill-icon">
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </div>
            {showSongName && (
              <span className="music-pill-text">
                {isPlaying
                  ? [config.music.title, config.music.artist].filter(Boolean).join(' · ') || 'Reproduciendo'
                  : 'Reproducir'}
              </span>
            )}
            {isPlaying && <span className="music-pill-wave"><span/><span/><span/><span/></span>}
          </button>
        )}

        {/* ── HERO DELUXE ── */}
        <section className="ce-hero">
          <div className="ce-hero-bg">
            <img src={heroPhoto} alt="Hero" className="ce-hero-img" />
            <div className="ce-hero-overlay" />
          </div>
          <div className="ce-hero-content reveal">
            <p className="label" style={{ color: 'white' }}>{config.heroLabel || 'Nuestra Boda'}</p>
            <h1 className="ce-hero-names">
              {config.couple?.person1} <span className="ce-hero-amp">&</span> {config.couple?.person2}
            </h1>
            <div className="flex items-center gap-4 text-white opacity-80">
              <span className="label" style={{ color: 'white' }}>{config.date?.day} · {config.date?.month} · {config.date?.year}</span>
              <div className="w-1 h-1 rounded-full bg-gold" />
              <span className="label" style={{ color: 'white' }}>{config.location}</span>
            </div>
          </div>
          <div className="absolute bottom-12 flex flex-col items-center gap-4 z-10 opacity-60">
            <span className="label text-[9px]" style={{ color: 'white' }}>Desliza</span>
            <div className="w-[1px] h-12 bg-white/30 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1/2 bg-white animate-scrollDown" />
            </div>
          </div>
          <div className="ce-hero-bottom">
            <TornEdge position="top" color="var(--white)" />
          </div>
        </section>

      {/* ── COUNTDOWN SECTION ── */}
      <section className="section-pad bg-white relative">
        <div className="max-w-5xl mx-auto text-center reveal">
          <SectionHeading eyebrow="Faltan muy pocos días" title="Cuenta Regresiva" />
          <div className="flex flex-wrap justify-center gap-8 md:gap-14 mt-20">
            {[
              { v: timeLeft.days, l: 'DÍAS' },
              { v: timeLeft.hours, l: 'HORAS' },
              { v: timeLeft.minutes, l: 'MINUTOS' },
              { v: timeLeft.seconds, l: 'SEGUNDOS' }
            ].map((u, i) => (
              <div key={i} className="ce-cd-card reveal" style={{ transitionDelay: `${i * 150}ms` }}>
                <span className="ce-cd-number font-heading text-5xl md:text-7xl text-gold mb-3">
                  {String(u.v).padStart(2, '0')}
                </span>
                <div className="w-10 h-[1px] bg-gold/20 mx-auto mb-4" />
                <span className="label text-[9px] opacity-40 tracking-[0.5em]">{u.l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <TornEdge position="top" />
        </div>
      </section>

        {/* ── CITA ── */}
        {config.sections?.quote !== false && config.quote?.text && (
          <section className="section-pad bg-beige text-center">
            <div className="max-w-2xl mx-auto reveal">
              <SectionHeading eyebrow="Nuestra Historia" title="Un Mensaje Especial" />
              <p className="font-body italic text-2xl leading-relaxed text-dark/70">
                "{config.quote.text}"
              </p>
              {config.quote.reference && <p className="label mt-8">— {config.quote.reference}</p>}
            </div>
          </section>
        )}

        {/* ── PARENTS & GODPARENTS (Preserved) ── */}
        {config.sections?.parents !== false && (
          <section className="section-pad bg-white">
            <SectionHeading eyebrow="Nuestras Familias" title="Con la bendición de nuestros padres" />
            <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto reveal">
              <div className="text-center">
                <p className="font-display text-5xl text-gold mb-6">De la Novia</p>
                <p className="font-heading text-lg tracking-wide">{config.parents?.person1 || "Sres. de la Novia"}</p>
                {config.godparents?.person1 && (
                  <div className="mt-8">
                    <p className="label text-[9px] mb-2">Padrinos</p>
                    <p className="font-body text-md italic">{config.godparents.person1}</p>
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="font-display text-5xl text-gold mb-6">Del Novio</p>
                <p className="font-heading text-lg tracking-wide">{config.parents?.person2 || "Sres. del Novio"}</p>
                {config.godparents?.person2 && (
                  <div className="mt-8">
                    <p className="label text-[9px] mb-2">Padrinos</p>
                    <p className="font-body text-md italic">{config.godparents.person2}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {renderBlocks('parents')}

        {/* ── ITINERARIO (Preserved Arch) ── */}
        {config.sections?.itinerary !== false && config.itinerary?.length && (
          <section className="section-pad bg-sage relative overflow-hidden">
            <SectionHeading eyebrow="El Programa" title="Itinerario del Día" />
            <div className="ce-arch-container reveal">
              <div className="ce-arch-line" />
              {config.itinerary.map((item, idx) => (
                <div key={idx} className="ce-itinerary-item reveal">
                  <div className="w-14 h-14 bg-white border border-gold rounded-full flex items-center justify-center text-gold mb-6 shadow-sm">
                    {idx === 0 ? <Flower2 size={24} /> : <MapPin size={24} />}
                  </div>
                  <span className="label text-[10px] mb-2">{item.time}</span>
                  <h3 className="font-heading text-2xl mb-2">{item.name}</h3>
                  <p className="font-body italic text-sm mb-1">{item.venue}</p>
                  <p className="label text-[8px] opacity-60 mb-6">{item.address}</p>
                  {item.mapsUrl && (
                    <a href={item.mapsUrl} target="_blank" rel="noopener noreferrer" className="label text-[9px] border border-gold/20 px-6 py-2 rounded-full hover:bg-gold hover:text-white transition-all">
                      Ver Ubicación
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {renderBlocks('itinerary')}

        {/* ── DRESS CODE ── */}
        {config.sections?.dressCode !== false && config.dressCode && (
          <section className="section-pad bg-white">
            <SectionHeading eyebrow="Importante" title="Código de Vestimenta" />
            <div className="max-w-2xl mx-auto text-center reveal">
               <div className="inline-block border border-gold/30 px-10 py-5 mb-10">
                  <p className="font-heading text-2xl tracking-[0.2em]">{config.dressCode.label}</p>
               </div>
               <div className="grid md:grid-cols-2 gap-12 text-left mb-16">
                  <div className="border-l border-sage pl-8">
                    <p className="label text-[9px] mb-3">Mujeres</p>
                    <p className="font-body text-sm leading-relaxed opacity-80">{config.dressCode.women}</p>
                  </div>
                  <div className="border-l border-sage pl-8">
                    <p className="label text-[9px] mb-3">Hombres</p>
                    <p className="font-body text-sm leading-relaxed opacity-80">{config.dressCode.men}</p>
                  </div>
               </div>
               {config.dressCode.swatches?.length && (
                 <div>
                   <p className="label text-[9px] mb-10">Inspiración de Colores</p>
                   <div className="flex flex-wrap justify-center gap-8">
                     {config.dressCode.swatches.map((s, i) => (
                       <div key={i} className="flex flex-col items-center gap-3">
                         <div className="w-16 h-16 rounded-full border border-beige shadow-lg" style={{ backgroundColor: s.color }} />
                         <span className="label text-[8px] opacity-60">{s.name}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
            </div>
          </section>
        )}

        {/* ── MESA DE REGALOS ── */}
        {config.sections?.gifts !== false && (() => {
          const gt = config.gifts?.giftTypes ?? [];
          const showTransfer = gt.includes('transfer') || (!gt.length && !!config.gifts?.bank);
          const showList     = gt.includes('list')     || (!gt.length && !!config.gifts?.giftListUrl);
          const showEnvelope = gt.includes('envelope');
          if (!config.gifts || (!showTransfer && !showList && !showEnvelope)) return null;
          const gifts = config.gifts;
          return (
            <section className="section-pad bg-beige">
              <SectionHeading eyebrow="Obsequios" title="Mesa de Regalos" />
              <div className="flex justify-center reveal">
                <div className="gifts-grid-v2">
                  {showTransfer && gifts.bank && (
                    <div className="gift-card-v2 gift-card-v2--transfer reveal">
                      <div className="gct-header">
                        <span className="gct-badge">Transferencia</span>
                        <div className="gct-icon-wrap">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gold)' }}>
                            <rect x="2" y="5" width="20" height="14" rx="2"/>
                            <path d="M2 10h20"/>
                          </svg>
                        </div>
                      </div>
                      <div className="gct-rows">
                        {[
                          { label: 'Banco',  value: gifts.bank,    mono: false },
                          { label: 'Nombre', value: gifts.holder,  mono: false },
                          { label: 'Cuenta', value: gifts.account, mono: true  },
                          { label: 'CLABE',  value: gifts.clabe,   mono: true  },
                        ].filter(r => r.value).map(({ label, value, mono }, idx) => (
                          <React.Fragment key={label}>
                            {idx > 0 && <div className="gct-divider" />}
                            <div className="gct-row">
                              <span className="gct-row-label">{label}</span>
                              <span className={`gct-row-value${mono ? ' gct-row-value--mono' : ''}`}>{value}</span>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {showList && gifts.giftListUrl && (
                    <div className="gift-card-v2 gift-card-v2--list reveal">
                      <div className="gcl-icon-ring">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gold)' }}>
                          <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/>
                          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                        </svg>
                      </div>
                      <p className="gcl-title">Mesa de Regalos</p>
                      {gifts.giftListLabel && <p className="gcl-subtitle">{gifts.giftListLabel}</p>}
                      <a href={gifts.giftListUrl} target="_blank" rel="noopener noreferrer" className="ce-btn-outline">
                        Ver lista →
                      </a>
                    </div>
                  )}

                  {showEnvelope && (
                    <div className="gift-card-v2 gift-card-v2--envelope reveal">
                      <div className="gce-icon-ring">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </div>
                      <p className="gcl-title">Sobre de Regalo</p>
                      <p className="gce-note">
                        {gifts.envelopeMessage || 'Con gusto recibimos sobres el día del evento'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })()}

        {/* ── RSVP ── */}
        <section className="rsvp-section">
          <SectionHeading eyebrow="RSVP" title="¿Nos acompañas?" />
          <p className="font-body italic max-w-md mx-auto mb-12 opacity-80">
            Será un verdadero honor celebrar este inicio con todos ustedes. Por favor confirma tu asistencia.
          </p>
          {!rsvpDone ? (
            <button className="ce-btn-primary reveal" onClick={() => setIsRsvpOpen(true)}>
              Confirmar Asistencia
            </button>
          ) : (
            <div className="reveal">
              <div className="inline-flex items-center gap-3 bg-sage px-10 py-4 rounded-full mb-6 border border-gold/20">
                <Check size={20} className="text-gold" />
                <span className="font-heading text-sm tracking-widest">
                  {guestConfirmed === false ? 'No asistiré' : '¡Confirmado!'}
                </span>
              </div>
              <p className="label text-[9px] cursor-pointer hover:text-dark transition-colors block mt-4"
                onClick={() => { setRsvpDone(false); setGuestConfirmed(null); setIsRsvpOpen(true); }}>
                Actualizar respuesta
              </p>
            </div>
          )}
        </section>

        {/* ── FOOTER ── */}
        <footer className="ce-footer">
          <p className="ce-footer-monogram">
            {config.couple?.person1?.[0]} &amp; {config.couple?.person2?.[0]}
          </p>
          <p className="ce-footer-names">{config.couple?.person1} &amp; {config.couple?.person2}</p>
          <p className="ce-footer-date">
            {config.date?.day} · {config.date?.month} · {config.date?.year}{config.location ? ` · ${config.location}` : ''}
          </p>
          <p className="ce-footer-powered">
            powered by <span className="ce-footer-brand">moments</span>
          </p>
        </footer>

        {/* ── MODAL RSVP ── */}
        {isRsvpOpen && (hasToken || isDemo) && (
          <div className="ce-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setIsRsvpOpen(false); }}>
            <div className="ce-modal" ref={modalRef}>
              <button className="ce-modal-close" onClick={() => setIsRsvpOpen(false)} aria-label="Cerrar">×</button>

              {rsvpDone ? (
                <div className="ce-modal-success">
                  <div className="ce-modal-success-icon">✓</div>
                  <h3 className="ce-modal-title">
                    {guestConfirmed === false ? 'Respuesta registrada' : '¡Hasta pronto!'}
                  </h3>
                  <p className="label" style={{ textAlign: 'center', lineHeight: '1.8', color: 'rgba(44,44,44,0.5)', textTransform: 'none', letterSpacing: '0.02em', fontSize: '13px' }}>
                    {guestConfirmed === false
                      ? 'Lamentamos no poder verte. Gracias por avisarnos.'
                      : 'Tu confirmación fue registrada. Estamos emocionados de celebrar contigo.'}
                  </p>
                </div>
              ) : (
                <div className="ce-modal-form">
                  <div className="ce-modal-header">
                    <p className="label" style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>Confirmación de Asistencia</p>
                    <h3 className="ce-modal-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                      ¡Hola {displayName}!
                    </h3>
                    <p className="label" style={{ textTransform: 'none', letterSpacing: '0.02em', fontSize: '14px', color: 'rgba(44,44,44,0.5)', marginBottom: '1.5rem' }}>
                      Nos encantaría que nos acompañaras en nuestro gran día.
                    </p>
                  </div>

                  {/* Tarjeta del invitado */}
                  <div className="modal-guest-card">
                    <div className="mgc-avatar">{displayName.charAt(0)}</div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontFamily: 'var(--font-jost)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.2rem' }}>
                        Invitado
                      </p>
                      <p className="mgc-name">{displayName}</p>
                      <p className="label" style={{ fontSize: '9px', color: 'rgba(44,44,44,0.4)' }}>
                        {totalSeats} {totalSeats === 1 ? 'lugar' : 'lugares'} reservados
                      </p>
                    </div>
                  </div>

                  {submitError && (
                    <p style={{ color: '#9C3A3A', fontSize: '12px', textAlign: 'center' }}>{submitError}</p>
                  )}

                  {/* Paso 1: Elección Sí / No */}
                  {guestConfirmed === null ? (
                    <div className="ce-rsvp-choice">
                      <button className="ce-rsvp-yes" onClick={() => {
                        setGuestConfirmed(true);
                        const names = isDemo
                          ? ['Acompañante 1', 'Acompañante 2']
                          : (initialCompanionNames.length > 0
                            ? initialCompanionNames
                            : Array.from({ length: maxCompanions }, (_, i) => `Acompañante ${i + 1}`));
                        setAttendeeNames(names);
                        setAttendeeChecked(Array(names.length).fill(true));
                      }}>
                        Sí, asistiré
                      </button>
                      <button className="ce-rsvp-no" onClick={() => setGuestConfirmed(false)}>
                        No podré ir
                      </button>
                    </div>

                  /* Paso 2a: Confirmado — lista de asistentes + dietary */
                  ) : guestConfirmed ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <p style={{ fontFamily: 'var(--font-lora)', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--dark)', textAlign: 'center' }}>
                        ¡Perfecto! Te esperamos.
                      </p>

                      <div className="attendees-list">
                        <p className="label" style={{ fontSize: '9px', color: 'rgba(44,44,44,0.4)', marginBottom: '0.75rem' }}>¿Quiénes asistirán?</p>
                        <div className="attendee-row attendee-row--main">
                          <div className="attendee-num">✓</div>
                          <span className="attendee-name">{displayName}</span>
                          <span className="label" style={{ fontSize: '9px', color: 'rgba(44,44,44,0.4)' }}>Titular</span>
                        </div>
                        {attendeeNames.map((name, i) => {
                          const attending = attendeeChecked[i] ?? true;
                          return (
                            <div key={i} className="attendee-row">
                              <label className="attendee-check-label">
                                <input type="checkbox" checked={attending} onChange={() => {
                                  const u = [...attendeeChecked]; u[i] = !u[i]; setAttendeeChecked(u);
                                }} />
                                <span className="attendee-check-box" />
                              </label>
                              <span className={`attendee-name${!attending ? ' attendee-name--muted' : ''}`}>{name}</span>
                              <span className={`attendee-badge ${attending ? 'attendee-badge--yes' : 'attendee-badge--no'}`}>
                                {attending ? 'Asistirá' : 'No asistirá'}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Dietary por persona */}
                      {(config.rsvp?.dietaryOptions?.length ?? 0) > 0 && (() => {
                        const attendingPeople = [
                          displayName,
                          ...attendeeNames.filter((_, i) => attendeeChecked[i] ?? true),
                        ];
                        return (
                          <div className="dlx-dietary-wrap">
                            <p className="label" style={{ fontSize: '9px', color: 'rgba(44,44,44,0.4)', marginBottom: '0.75rem', textAlign: 'center' }}>
                              Restricción alimentaria
                            </p>
                            {attendingPeople.map((personName) => (
                              <div key={personName} style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem', textAlign: 'center' }}>
                                  {personName}
                                </p>
                                <div className="dietary-details-container">
                                  <details className="dietary-details">
                                    <summary className="dietary-summary">
                                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                        {dietaryMap[personName]?.length ? dietaryMap[personName].join(', ') : 'Seleccionar restricciones'}
                                      </span>
                                      <ChevronDown size={14} />
                                    </summary>
                                    <div className="dietary-options">
                                      {config.rsvp!.dietaryOptions!.map((opt) => {
                                        const isSelected = dietaryMap[personName]?.includes(opt);
                                        return (
                                          <label key={opt} className="dietary-option-label">
                                            <input type="checkbox" className="dietary-checkbox" checked={isSelected || false}
                                              onChange={(e) => {
                                                setDietaryMap(prev => {
                                                  const cur = prev[personName] || [];
                                                  return { ...prev, [personName]: e.target.checked ? [...cur, opt] : cur.filter(x => x !== opt) };
                                                });
                                              }} />
                                            <span>{opt}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </details>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      {isDemo ? (
                        <p style={{ fontFamily: 'var(--font-jost)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', textAlign: 'center', padding: '0.75rem 1rem', border: '1px solid rgba(166,141,91,0.3)', borderRadius: '4px' }}>
                          Vista previa · Los datos no se guardan
                        </p>
                      ) : (
                        <button className="btn-submit" onClick={handleSubmitRsvp} disabled={submitting}>
                          {submitting ? 'Guardando…' : 'Confirmar asistencia'}
                        </button>
                      )}
                      <button className="rsvp-change" onClick={() => { setGuestConfirmed(null); setAttendeeNames([]); setAttendeeChecked([]); setSubmitError(''); }}>
                        Cambiar respuesta
                      </button>
                    </div>

                  /* Paso 2b: Declinado */
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <p style={{ fontFamily: 'var(--font-lora)', fontSize: '1.1rem', fontStyle: 'italic', color: 'rgba(44,44,44,0.6)', textAlign: 'center' }}>
                        Lamentamos no poder verte, gracias por avisarnos.
                      </p>
                      {isDemo ? (
                        <p style={{ fontFamily: 'var(--font-jost)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', textAlign: 'center', padding: '0.75rem 1rem', border: '1px solid rgba(166,141,91,0.3)', borderRadius: '4px', width: '100%' }}>
                          Vista previa · Los datos no se guardan
                        </p>
                      ) : (
                        <button className="btn-submit" onClick={handleSubmitRsvp} disabled={submitting}>
                          {submitting ? 'Guardando…' : 'Enviar respuesta'}
                        </button>
                      )}
                      <button className="rsvp-change" onClick={() => { setGuestConfirmed(null); setSubmitError(''); }}>
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
    </ContentProtection>
    </div>
  );
}
