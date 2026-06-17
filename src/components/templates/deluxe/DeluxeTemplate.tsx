'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Cormorant_Garamond, Jost, Playfair_Display, EB_Garamond, Raleway, Montserrat } from 'next/font/google';
import { MapPin, Play, Pause, CalendarDays, Hotel, Car, Mail, Gift, Flower2, Shirt, UserX, ChevronDown } from 'lucide-react';
import type { PhotoEntry } from '@/lib/imageLayout';
import ContentProtection from '@/components/templates/shared/ContentProtection';
import { getCapabilities } from '@/lib/plans';

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
export interface Hotel { name: string; category: string; address: string; note: string; phone: string; }

export interface DeluxeConfig {
  theme?: {
    accentColor?:     string;
    backgroundColor?: string;
    textColor?:       string;
    displayFont?:     'cormorant' | 'playfair' | 'eb-garamond';
    bodyFont?:        'jost' | 'raleway' | 'montserrat';
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
  dressCode?: { label?: string; description?: string; women?: string; men?: string; swatches?: Swatch[]; avoid?: Swatch[] };
  notes?: string[];
  gifts?: { bank?: string; holder?: string; account?: string; clabe?: string; giftListUrl?: string; giftListLabel?: string; giftTypes?: string[]; envelopeMessage?: string };
  music?: { url?: string; title?: string; artist?: string };
  destination?: {
    hotels?: Hotel[];
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
  config: DeluxeConfig;
  plan?: import('@/lib/plans').EventPlan;
  eventId?: string;
  guestToken?: string;
  maxCompanions?: number;
  companionNames?: string[];
  guestName?: string;
  hasExistingRsvp?: boolean;
  invalidToken?: boolean;
}

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
  cormorant:    'var(--font-cormorant)',
  playfair:     'var(--font-playfair)',
  'eb-garamond':'var(--font-eb-garamond)',
};

const BODY_FONT_VAR: Record<string, string> = {
  jost:       'var(--font-jost)',
  raleway:    'var(--font-raleway)',
  montserrat: 'var(--font-montserrat)',
};

// ---------------------------------------------------------------------------
// Default photos (fallback when no config provided)
// ---------------------------------------------------------------------------
const DEFAULT_PHOTOS = {
  hero: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85',
  trio: [
    'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
  ],
  wide: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&q=85',
  duo: [
    'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=900&q=80',
    'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900&q=80',
  ],
  cinematic: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1600&q=85',
};
// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const css = `
  :root {
    --ivory:    #F8F3EC;
    --charcoal: #1C1611;
    --gold:     #B8965A;
    --dark:     #14100C;
    --muted:    #E6DDD2;
    --muted-fg: #9B8B78;
  }

  .dlx-root { background: var(--ivory); color: var(--charcoal); }

  .label {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    font-weight: 400;
  }
  .gold  { color: var(--gold); }
  .muted { color: var(--muted-fg); }
  .text-center { text-align: center; }

  .sep-line { display: block; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); flex: 1; }
  .sep-line.short { max-width: 48px; }

  /* ── Loader ── */
  .loader {
    position: fixed;
    inset: 0;
    background: var(--dark);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    z-index: 999;
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .loader--out { opacity: 0; transform: scale(1.04); pointer-events: none; }
  .loader-monogram {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: loaderReveal 1s cubic-bezier(0.16,1,0.3,1) 0.3s both;
  }
  .loader-initial {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(64px, 15vw, 120px);
    font-weight: 300;
    font-style: italic;
    color: var(--ivory);
    line-height: 1;
  }
  .loader-amp {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(32px, 7vw, 56px);
    font-weight: 300;
    color: var(--gold);
    margin: 0 0.25rem;
    align-self: flex-start;
    padding-top: 0.5rem;
  }
  .loader-line {
    width: 60px;
    height: 1px;
    background: var(--gold);
    animation: loaderLine 0.8s ease 0.9s both;
    transform-origin: left;
  }
  @keyframes loaderLine { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  .loader-date {
    color: rgba(248,243,236,0.4);
    animation: loaderReveal 0.8s ease 1.1s both;
  }
  @keyframes loaderReveal { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  /* ── Music pill Evolution ── */
  .music-pill {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    border-radius: 100px;
    background: rgba(20,16,12,0.85);
    border: 1px solid rgba(184,150,90,0.3);
    color: var(--ivory);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    letter-spacing: 0.1em;
    cursor: pointer;
    backdrop-filter: blur(16px);
    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    max-width: 320px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }
  .music-pill--minimized {
    padding: 0.75rem;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    max-width: 44px;
    background: rgba(184,150,90,0.9);
    border-color: var(--gold);
  }
  .music-pill--minimized .music-pill-text,
  .music-pill--minimized .music-pill-wave { display: none; }
  .music-pill-icon { display: flex; align-items: center; justify-content: center; }
  .music-pill--minimized:hover { background: rgba(200,165,100,0.95); }
  .music-pill:hover { border-color: var(--gold); }
  .music-pill--playing { border-color: var(--gold); }
  .music-pill-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .music-pill-wave {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 14px;
    margin-left: 2px;
  }
  .music-pill-wave span {
    display: block;
    width: 2px;
    background: var(--gold);
    border-radius: 2px;
    animation: wave 0.8s ease-in-out infinite alternate;
  }
  .music-pill-wave span:nth-child(1) { height: 4px; animation-delay: 0s; }
  .music-pill-wave span:nth-child(2) { height: 10px; animation-delay: 0.15s; }
  .music-pill-wave span:nth-child(3) { height: 7px; animation-delay: 0.3s; }
  .music-pill-wave span:nth-child(4) { height: 12px; animation-delay: 0.45s; }
  @keyframes wave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }

  /* ── Hero ── */
  .dlx-hero {
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
  .dlx-hero-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-color: var(--dark);
    z-index: 0;
    transform: scale(1.05);
    animation: heroZoom 15s ease-in-out infinite alternate;
  }
  @keyframes heroZoom {
    0% { transform: scale(1.05); }
    100% { transform: scale(1.1); }
  }
  .dlx-hero-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 30%, rgba(184,150,90,0.15) 0%, transparent 60%);
    z-index: 1;
    animation: glowPulse 8s ease-in-out infinite alternate;
  }
  @keyframes glowPulse {
    0% { opacity: 0.3; transform: scale(1); }
    100% { opacity: 0.6; transform: scale(1.1); }
  }
  .dlx-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(20,16,12,0.5) 0%, rgba(20,16,12,0.2) 40%, rgba(20,16,12,0.8) 100%);
    z-index: 2;
  }
  .dlx-hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: var(--gold);
    z-index: 2;
  }
  .dlx-hero::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    z-index: 2;
  }
  .dlx-hero-content {
    position: relative;
    z-index: 2;
    padding: 2rem 2rem 9rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
  }
  .hero-label { animation: loaderReveal 1s ease 0.2s both; }
  .dlx-hero-names {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(56px, 12vw, 130px);
    font-weight: 300;
    font-style: italic;
    letter-spacing: -0.02em;
    line-height: 1;
    margin: 0;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    animation: loaderReveal 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s both;
  }
  .dlx-hero-amp {
    display: inline-flex;
    align-items: center;
    gap: 1.5rem;
    font-family: var(--font-playfair), serif;
    font-size: 0.35em;
    color: var(--gold);
    font-weight: 300;
    font-style: italic;
    opacity: 0.8;
  }
  .dlx-hero-amp::before, .dlx-hero-amp::after {
    content: '';
    width: 30px;
    height: 1px;
    background: currentColor;
    opacity: 0.4;
  }
  .dlx-hero-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    animation: loaderReveal 1s ease 0.5s both;
  }
  .dlx-meta-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--gold);
    opacity: 0.6;
  }
  .hero-scroll-indicator {
    position: absolute;
    bottom: 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    z-index: 2;
    animation: loaderReveal 1s ease 1.2s both;
  }
  .scroll-bar { width: 1px; height: 48px; background: rgba(255,255,255,0.15); overflow: hidden; border-radius: 1px; }
  .scroll-thumb { width: 100%; height: 50%; background: rgba(255,255,255,0.5); animation: scrollDown 1.6s ease-in-out infinite; }
  @keyframes scrollDown { 0% { transform: translateY(-100%); } 100% { transform: translateY(200%); } }

  /* Countdown Deluxe */
  .dlx-countdown {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(184,150,90,0.3);
    border-radius: 14px;
    padding: 0.875rem 1.25rem;
    backdrop-filter: blur(10px);
    animation: loaderReveal 1s ease 0.7s both;
  }
  .dlx-cd-unit { display: flex; flex-direction: column; align-items: center; }
  .dlx-cd-value {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 300;
    color: #fff;
    line-height: 1;
    min-width: 2.2ch;
    text-align: center;
  }
  .dlx-cd-label {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 9px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    margin-top: 0.25rem;
  }
  .dlx-cd-sep {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.75rem;
    color: var(--gold);
    opacity: 0.5;
    padding-bottom: 1.1rem;
    align-self: flex-end;
    margin: 0 0.05rem;
  }

  /* ── Sections ── */
  .section {
    max-width: 680px;
    margin: 0 auto;
    padding: 5rem 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    scroll-margin-top: 4rem;
  }
  .section--itinerary { max-width: 760px; }
  .section--wide { max-width: 900px; }

  /* ── Destination ── */
  .destination-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    width: 100%;
  }
  @media (max-width: 768px) { .destination-grid { grid-template-columns: 1fr; } }
  @media (min-width: 769px) and (max-width: 900px) { .destination-grid { grid-template-columns: 1fr 1fr; } }
  .dest-card {
    background: #F0E9DF;
    border: 1px solid var(--muted);
    border-radius: 14px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    text-align: left;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }
  .dest-card:hover { box-shadow: 0 8px 24px rgba(28,22,17,0.1); transform: translateY(-3px); }
  .dest-card-icon { margin-bottom: 0.5rem; }
  .dest-card-name {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.15rem;
    font-weight: 400;
    color: var(--charcoal);
    margin: 0;
  }
  .dest-card-category { margin: 0; }
  .dest-card-divider { height: 1px; background: var(--muted); margin: 0.75rem 0; }
  .dest-card-address {
    display: flex;
    align-items: flex-start;
    gap: 0.3rem;
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    color: var(--muted-fg);
    line-height: 1.5;
  }
  .dest-card-note {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    color: var(--gold);
    margin: 0.25rem 0 0;
  }
  .dest-card-phone {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px;
    color: var(--charcoal);
    text-decoration: none;
    letter-spacing: 0.03em;
    transition: color 0.2s;
  }
  .dest-card-phone:hover { color: var(--gold); }
  .transport-card {
    width: 100%;
    background: #F0E9DF;
    border: 1px solid var(--muted);
    border-radius: 14px;
    padding: 1.5rem;
    text-align: left;
  }
  .transport-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
  .transport-info {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 13px;
    color: var(--muted-fg);
    line-height: 1.7;
    margin: 0 0 1.25rem;
  }
  .transport-schedule { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
  .transport-row {
    display: flex;
    gap: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--muted);
  }
  .transport-row:last-child { border-bottom: none; }
  .transport-time {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.1rem;
    font-weight: 300;
    color: var(--gold);
    min-width: 120px;
  }
  .transport-detail {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px;
    color: var(--charcoal);
  }
  .transport-contact { display: flex; align-items: center; gap: 0.75rem; }

  .dlx-dark {
    background: var(--dark);
    max-width: 100%;
    width: 100%;
    color: var(--ivory);
    padding-left: 2rem;
    padding-right: 2rem;
  }
  .section-heading {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 300;
    font-style: italic;
    margin: 0 0 1.5rem;
    color: var(--charcoal);
    letter-spacing: -0.03em;
    line-height: 1.1;
  }

  /* ── Minimal Nav ── */

  /* ── Ornament ── */
  .ornament {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
    width: 100%;
    padding: 2.5rem 0 0.5rem;
  }
  .ornament .sep-line {
    flex: none;
    width: 120px;
  }
  .ornament-motif {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-shrink: 0;
  }

  /* ── Quote (dark) ── */
  .quote-mark {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 5rem;
    line-height: 1;
    color: var(--gold);
    opacity: 0.3;
    margin-bottom: 0.5rem;
  }
  .quote-text {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(1.3rem, 3vw, 1.75rem);
    font-style: italic;
    font-weight: 300;
    line-height: 1.6;
    color: var(--ivory);
    margin: 0 0 0.5rem;
    max-width: 560px;
  }

  /* ── Photo blocks (dynamic engine) ── */
  .photo-block {
    width: 100%;
    aspect-ratio: 21 / 9;
    overflow: hidden;
    background: var(--ivory);
  }
  .photo-block-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  .photo-block:hover .photo-block-img { transform: scale(1.02); }
  @media (max-width: 600px) { .photo-block { aspect-ratio: 4 / 3; } }

  .duo-block {
    display: flex;
    width: 100%;
    aspect-ratio: 2 / 1;
    gap: 4px;
    background: var(--ivory);
    overflow: hidden;
  }
  .duo-block-item { flex: 1; overflow: hidden; }
  .duo-block-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  .duo-block-item:hover .duo-block-img { transform: scale(1.04); }
  @media (max-width: 600px) {
    .duo-block { flex-direction: column; aspect-ratio: auto; gap: 3px; }
    .duo-block-item { aspect-ratio: 4 / 3; }
  }

  .trio-block {
    display: flex;
    width: 100%;
    aspect-ratio: 12 / 5;
    gap: 4px;
    background: var(--ivory);
    overflow: hidden;
  }
  .trio-block-item { flex: 1; aspect-ratio: 4 / 5; overflow: hidden; }
  .trio-block-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  .trio-block-item:hover .trio-block-img { transform: scale(1.04); }
  @media (max-width: 600px) {
    .trio-block { flex-direction: column; aspect-ratio: auto; gap: 3px; }
    .trio-block-item { aspect-ratio: 4 / 3; }
  }

  /* ── Carousel Deluxe ── */
  .dlx-carousel {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: clamp(280px, 46vw, 800px);
    background: var(--dark);
  }
  @media (max-width: 600px) { .dlx-carousel { height: clamp(260px, 75vw, 70vh); } }
  .dlx-carousel-track {
    display: flex;
    height: 100%;
    transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .dlx-carousel-slide {
    flex: 0 0 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .dlx-carousel-img-blur-bg {
    display: none;
  }
  .dlx-carousel-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    z-index: 2;
  }
  @media (min-width: 601px) {
    .dlx-carousel-slide--portrait .dlx-carousel-img-blur-bg {
      display: block;
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      filter: blur(20px) brightness(0.5);
      transform: scale(1.1);
      z-index: 1;
    }
    .dlx-carousel-slide--portrait .dlx-carousel-img {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
    }
  }
  .dlx-carousel-counter {
    position: absolute;
    top: 1.25rem;
    right: 1.5rem;
    z-index: 2;
    background: rgba(20, 16, 12, 0.5);
    padding: 0.25rem 0.6rem;
    border-radius: 100px;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(184, 150, 90, 0.2);
  }
  .dlx-carousel-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(20, 16, 12, 0.35);
    border: 1px solid rgba(184, 150, 90, 0.25);
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(6px);
    transition: background 0.3s, border-color 0.3s, color 0.3s, opacity 0.3s;
    z-index: 2;
    opacity: 0.4;
  }
  .dlx-carousel-btn--prev { left: 1rem; }
  .dlx-carousel-btn--next { right: 1rem; }
  .dlx-carousel:hover .dlx-carousel-btn,
  .dlx-carousel:focus-within .dlx-carousel-btn { opacity: 1; }
  .dlx-carousel-btn:hover { background: rgba(184, 150, 90, 0.55); border-color: var(--gold); color: var(--ivory); }
  @media (max-width: 600px) { .dlx-carousel-btn { opacity: 0.55; width: 28px; height: 28px; } }
  .dlx-carousel-dots {
    display: flex;
    gap: 0.45rem;
    align-items: center;
  }
  .dlx-carousel-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.25);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    padding: 0;
  }
  .dlx-carousel-dot--active {
    background: var(--gold);
    width: 20px;
    border-radius: 3px;
  }

  /* ── Dietary ── */
  .dlx-dietary-wrap { width: 100%; text-align: center; padding-top: 0.25rem; }
  .dietary-details { position: relative; width: 100%; text-align: left; margin-bottom: 0.5rem; }
  .dietary-summary {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.6rem 1rem; border: 1px solid rgba(184, 150, 90, 0.3); border-radius: 8px;
    background: rgba(255,255,255,0.5); color: var(--charcoal); font-family: var(--font-jost), system-ui, sans-serif; font-size: 12px;
    cursor: pointer; list-style: none; transition: border-color 0.2s;
  }
  .dietary-summary:hover { border-color: var(--gold); }
  .dietary-summary::-webkit-details-marker { display: none; }
  .dietary-options {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0;
    background: var(--ivory); border: 1px solid rgba(184, 150, 90, 0.2); border-radius: 8px;
    padding: 0.5rem; z-index: 10; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    max-height: 200px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px;
  }
  .dietary-option-label {
    display: flex; align-items: center; gap: 10px; padding: 8px;
    cursor: pointer; font-family: var(--font-jost), system-ui, sans-serif; font-size: 13px; color: var(--charcoal);
    border-radius: 6px; transition: background 0.2s;
  }
  .dietary-option-label:hover { background: rgba(184, 150, 90, 0.08); }
  .dietary-checkbox { accent-color: var(--gold); width: 14px; height: 14px; }
  .photo-cinematic-overlay {
    position: absolute;
    inset: 0;
    background: rgba(20,16,12,0.55);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }
  .dlx-cinematic-quote {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(1.75rem, 5vw, 3.5rem);
    font-style: italic;
    font-weight: 300;
    color: #fff;
    margin: 0;
  }

  /* ── Parents ── */
  .parents-wrap { display: grid; grid-template-columns: 1fr auto 1fr; align-items: start; gap: 2rem; width: 100%; }
  .parents-group { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.45rem; min-width: 0; max-width: 220px; justify-self: center; }
  .parents-monogram {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    align-self: start;
    padding-top: 2.2rem;
    gap: 1rem;
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 2.4rem;
    font-style: italic;
    font-weight: 300;
    color: var(--gold);
    opacity: 0.6;
    flex-shrink: 0;
  }
  .pm-amp { font-size: 1.3rem; opacity: 0.8; font-family: var(--font-jost), sans-serif; font-style: normal; }
  @media (max-width: 640px) {
    .parents-wrap { grid-template-columns: 1fr; gap: 1.5rem; }
    .parents-group { max-width: 100%; width: 100%; }
    .parents-monogram { align-self: auto; padding-top: 0.5rem; padding-bottom: 0.5rem; font-size: 2rem; }
  }
  .display-name { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.25rem; font-weight: 400; color: var(--charcoal); margin: 0; }
  .name-sep { display: flex; justify-content: center; margin: 0.75rem 0; }

  /* ── Itinerary Deluxe v2 (alternating editorial) ── */
  .dlx-itinerary-wrap {
    width: 100%;
    max-width: 580px;
    margin: 3rem auto 0;
    position: relative;
  }

  /* Vertical gold line (desktop) */
  .dlx-itinerary-wrap::before {
    content: '';
    position: absolute;
    left: 165px;
    top: 2rem;
    bottom: 2rem;
    width: 1px;
    background: linear-gradient(to bottom, transparent, rgba(184,150,90,0.4) 8%, rgba(184,150,90,0.4) 92%, transparent);
  }

  .dlx-irow-v2 {
    display: grid;
    grid-template-columns: 140px 50px 1fr;
    align-items: start;
    margin-bottom: 2.5rem;
  }

  /* Time column (always on left) */
  .dlx-itime-col {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 0.25rem 0 0 0;
    text-align: right;
  }
  .dlx-itime-big {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: clamp(2.5rem, 5vw, 3.75rem);
    font-weight: 300;
    color: var(--gold);
    line-height: 1;
    letter-spacing: -0.02em;
    white-space: nowrap;
  }

  /* Node column (always center of the rail) */
  .dlx-inode-col {
    display: flex;
    justify-content: center;
    padding-top: calc(0.25rem + clamp(2.75rem, 6vw, 4.25rem) / 2 - 6px);
  }
  .dlx-inode-v2 {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--ivory);
    border: 2px solid var(--gold);
    box-shadow: 0 0 0 5px rgba(184,150,90,0.12), 0 0 20px rgba(184,150,90,0.15);
    flex-shrink: 0;
  }

  /* Card column (always on right) */
  .dlx-icontent-col {
    padding: 0;
  }

  /* Card */
  .dlx-icard-v2 {
    background: color-mix(in srgb, var(--ivory) 94%, var(--gold) 6%);
    border: 1px solid rgba(184,150,90,0.22);
    border-radius: 18px;
    overflow: hidden;
    transition: border-color 0.35s ease, box-shadow 0.35s ease;
  }
  .dlx-icard-v2:hover {
    border-color: rgba(184,150,90,0.55);
    box-shadow: 0 8px 40px rgba(0,0,0,0.10);
  }
  .dlx-iimg-wrap {
    width: 100%;
    aspect-ratio: 16 / 7;
    overflow: hidden;
  }
  .dlx-iimg { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(0.16,1,0.3,1); display: block; }
  .dlx-iimg-wrap:hover .dlx-iimg { transform: scale(1.04); }

  .dlx-icard-v2-body {
    padding: 1rem 1.25rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .dlx-iname-v2 {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.35rem;
    font-weight: 400;
    font-style: italic;
    color: var(--charcoal);
    margin: 0;
  }
  .dlx-ivenue-v2 {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted-fg);
    margin: 0;
  }
  .dlx-iaddress-v2 {
    display: flex;
    align-items: flex-start;
    gap: 0.3rem;
    margin-top: 0.2rem;
  }
  .dlx-iaddress-v2 span {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px;
    color: var(--muted-fg);
    line-height: 1.55;
  }
  .dlx-maps-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.75rem;
    padding: 0.4rem 0.9rem;
    border-radius: 100px;
    border: 1px solid rgba(184,150,90,0.4);
    color: var(--gold);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s;
  }
  .dlx-maps-btn:hover { background: rgba(184,150,90,0.1); border-color: var(--gold); }

  /* Mobile itinerary: left-rail layout */
  @media (max-width: 680px) {
    .dlx-itinerary-wrap::before {
      left: 15px;
      top: 0;
      bottom: 0;
    }
    .dlx-irow-v2 {
      grid-template-columns: 30px 1fr;
      gap: 0 1rem;
    }
    .dlx-itime-col,
    .dlx-irow-v2--even .dlx-itime-col { display: none; }
    .dlx-inode-col,
    .dlx-irow-v2--even .dlx-inode-col { order: 1; padding-top: 0.3rem; }
    .dlx-icontent-col,
    .dlx-irow-v2--even .dlx-icontent-col { order: 2; padding: 0; }
    .dlx-itime-mobile {
      display: flex;
      align-items: baseline;
      gap: 0.1rem;
      margin-bottom: 0.5rem;
    }
    .dlx-itime-mobile-h {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: 1.5rem;
      font-weight: 300;
      color: var(--gold);
      line-height: 1;
    }
    .dlx-itime-mobile-m {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: 1rem;
      font-weight: 300;
      color: var(--gold);
    }
  }
  @media (min-width: 681px) {
    .dlx-itime-mobile { display: none; }
  }

  /* ── Section tinted / Contrast ── */
  .section--tinted {
    background: color-mix(in srgb, var(--ivory) 92%, var(--gold));
    width: 100%;
    max-width: 100%;
    padding-left: max(2rem, calc((100vw - 680px) / 2));
    padding-right: max(2rem, calc((100vw - 680px) / 2));
  }
  .section--contrast {
    background: color-mix(in srgb, var(--ivory) 95%, var(--charcoal));
    width: 100%;
    max-width: 100%;
    padding-left: max(2rem, calc((100vw - 680px) / 2));
    padding-right: max(2rem, calc((100vw - 680px) / 2));
  }
  .label.gold {
    letter-spacing: 0.25em;
    font-weight: 400;
  }
  .label.muted {
    letter-spacing: 0.15em;
    font-weight: 300;
  }

  /* ── Dress code v2 ── */
  .dc-description {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.15rem;
    font-style: italic;
    font-weight: 300;
    color: var(--muted-fg);
    line-height: 1.75;
    max-width: 480px;
    text-align: center;
    margin: 1.25rem 0 2.5rem;
  }
  .dc-gender-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    width: 100%;
    max-width: 580px;
    margin-bottom: 2.75rem;
  }
  @media (max-width: 560px) { .dc-gender-grid { grid-template-columns: 1fr; max-width: 360px; } }
  .dc-gender-card {
    background: color-mix(in srgb, var(--ivory) 94%, var(--gold) 6%);
    border: 1px solid rgba(184,150,90,0.22);
    border-radius: 18px;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: border-color 0.35s ease, box-shadow 0.35s ease;
  }
  .dc-gender-card:hover {
    border-color: rgba(184,150,90,0.55);
    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  }
  .dc-gender-icon-ring {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: rgba(184,150,90,0.1);
    border: 1px solid rgba(184,150,90,0.28);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.85rem;
  }
  .dc-gender-divider-line {
    width: 32px;
    height: 1px;
    background: rgba(184,150,90,0.3);
    margin: 0.6rem 0 0.85rem;
  }
  .dc-gender-desc {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12.5px;
    color: var(--muted-fg);
    line-height: 1.85;
    margin: 0;
  }

  /* ── Dress code swatches label ── */
  .dc-swatches-label {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--muted-fg);
    margin-bottom: 1.25rem;
  }

  /* ── No children ── */
  .no-children-block { display: flex; align-items: flex-start; gap: 1.25rem; background: #F0E9DF; border: 1px solid var(--muted); border-left: 3px solid var(--gold); border-radius: 12px; padding: 1.5rem 1.75rem; max-width: 480px; text-align: left; }
  .no-children-title { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.15rem; font-weight: 400; color: var(--charcoal); margin: 0 0 0.4rem; }
  .no-children-desc { font-family: var(--font-jost), system-ui, sans-serif; font-size: 13px; color: var(--muted-fg); line-height: 1.8; margin: 0; }

  /* ── Notes ── */
  .notes-list { display: flex; flex-direction: column; gap: 0.75rem; width: 100%; max-width: 480px; text-align: left; }
  .note-item { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.875rem 1.25rem; background: #F0E9DF; border: 1px solid var(--muted); border-radius: 10px; }
  .note-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); flex-shrink: 0; margin-top: 5px; }
  .note-text { font-family: var(--font-jost), system-ui, sans-serif; font-size: 13px; color: var(--charcoal); line-height: 1.7; margin: 0; }

  /* ── Swatches ── */
  .swatches { display: flex; gap: 1.75rem; flex-wrap: wrap; justify-content: center; }
  .swatch-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.65rem;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), filter 0.3s ease;
  }
  .swatch-item:hover { transform: translateY(-6px); filter: brightness(1.08); }
  .swatch-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 1.5px solid var(--muted);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.25);
  }
  .swatch-name {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted-fg);
    text-align: center;
  }
  /* Swatch avoid: posición relativa para overlay ✕ */
  .swatch-item--avoid .swatch-circle {
    border-color: rgba(196,130,130,0.45);
    opacity: 0.65;
    position: relative;
  }
  .swatch-avoid-x {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  /* ── Gifts v2 ── */
  .gifts-grid-v2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 1.25rem;
    width: 100%;
    max-width: 720px;
  }
  /* 3ª tarjeta sola en su fila → centrada */
  .gifts-grid-v2 .gift-card-v2:last-child:nth-child(3) {
    grid-column: 1 / -1;
    justify-self: center;
    width: 100%;
    max-width: 320px;
  }
  @media (max-width: 560px) {
    .gifts-grid-v2 { grid-template-columns: 1fr; max-width: 380px; }
    .gifts-grid-v2 .gift-card-v2:last-child:nth-child(3) {
      grid-column: auto;
      justify-self: auto;
      max-width: 100%;
    }
  }

  /* Base card */
  .gift-card-v2 {
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease;
    cursor: default;
  }
  .gift-card-v2:hover { transform: translateY(-5px); box-shadow: 0 20px 48px rgba(28,22,17,0.13); }

  /* Transfer — dark card */
  .gift-card-v2--transfer {
    background: color-mix(in srgb, var(--ivory) 94%, var(--gold) 6%);
    border: 1px solid rgba(184,150,90,0.22);
    padding: 1.75rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .gift-card-v2--transfer::after {
    content: '';
    position: absolute;
    top: -50px; right: -50px;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(184,150,90,0.09) 0%, transparent 70%);
    pointer-events: none;
  }
  .gct-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .gct-badge {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 9px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--gold);
    opacity: 0.7;
  }
  .gct-icon-wrap {
    width: 34px; height: 34px;
    border-radius: 10px;
    background: rgba(184,150,90,0.1);
    border: 1px solid rgba(184,150,90,0.25);
    display: flex; align-items: center; justify-content: center;
  }
  .gct-rows { display: flex; flex-direction: column; gap: 0.75rem; }
  .gct-row { display: flex; flex-direction: column; gap: 0.1rem; }
  .gct-row-label {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 9px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(184,150,90,0.55);
  }
  .gct-row-value {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: var(--charcoal);
    letter-spacing: 0.01em;
  }
  .gct-row-value--mono {
    font-size: 12px;
    letter-spacing: 0.12em;
    opacity: 0.85;
  }
  .gct-divider {
    height: 1px;
    background: rgba(184,150,90,0.12);
    margin: 0;
  }

  /* List card — ivory */
  .gift-card-v2--list {
    background: color-mix(in srgb, var(--ivory) 94%, var(--gold));
    border: 1px solid var(--muted);
    padding: 2rem 1.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
  }
  .gcl-icon-ring {
    width: 52px; height: 52px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--ivory) 82%, var(--gold));
    border: 1px solid rgba(184,150,90,0.3);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 0.25rem;
  }
  .gcl-title {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.3rem;
    font-style: italic;
    font-weight: 400;
    color: var(--charcoal);
    margin: 0;
  }
  .gcl-subtitle {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px;
    color: var(--muted-fg);
    line-height: 1.7;
    max-width: 180px;
    margin: 0.1rem 0 0.75rem;
  }

  /* Envelope card — warm tint */
  .gift-card-v2--envelope {
    background: color-mix(in srgb, var(--ivory) 94%, var(--gold));
    border: 1px solid var(--muted);
    padding: 2rem 1.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
  }
  .gce-icon-ring {
    width: 52px; height: 52px;
    border-radius: 50%;
    background: rgba(184,150,90,0.1);
    border: 1px solid rgba(184,150,90,0.3);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 0.25rem;
  }
  .gce-note {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.05rem;
    font-style: italic;
    color: var(--muted-fg);
    line-height: 1.65;
    max-width: 200px;
    margin: 0.1rem 0 0;
  }
  .btn-outline {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.625rem 1.5rem; border-radius: 100px;
    border: 1px solid var(--gold); color: var(--gold);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase;
    text-decoration: none; transition: background 0.2s, color 0.2s; cursor: pointer; background: transparent;
  }
  .btn-outline:hover { background: var(--gold); color: #fff; }
  .btn-outline--sm { padding: 0.5rem 1.25rem; font-size: 10px; }

  /* ── RSVP actions ── */
  .dlx-rsvp-actions { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  .btn-rsvp {
    display: inline-flex; align-items: center; gap: 0.75rem;
    padding: 1.1rem 3rem; border-radius: 100px;
    background: var(--charcoal); color: var(--ivory);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
    border: 1px solid var(--charcoal); cursor: pointer;
    transition: background 0.25s, color 0.25s, transform 0.2s, box-shadow 0.2s;
  }
  .btn-rsvp:hover { background: var(--gold); border-color: var(--gold); transform: translateY(-2px); box-shadow: 0 10px 28px rgba(184,150,90,0.35); }
  .btn-calendar {
    display: inline-flex; align-items: center; gap: 0.5rem;
    padding: 0.75rem 1.75rem; border-radius: 100px;
    border: 1px solid var(--muted); color: var(--muted-fg);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
  }
  .btn-calendar:hover { border-color: var(--gold); color: var(--gold); }

  /* ── Footer ── */
  .footer { text-align: center; padding: 3rem 2rem 4rem; border-top: 1px solid var(--muted); background: var(--dark); }
  .footer-monogram {
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 3rem;
    font-style: italic;
    font-weight: 300;
    color: var(--gold);
    opacity: 0.5;
    margin: 0 0 0.5rem;
  }
  .footer-names { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.5rem; font-style: italic; font-weight: 300; color: var(--ivory); margin: 0; }
  .footer-powered { font-family: var(--font-jost), sans-serif; font-size: 9px; letter-spacing: 0.2em; text-transform: none; color: var(--ivory); opacity: 0.35; margin-top: 2rem; }
  .footer-brand { font-family: var(--font-montserrat), 'Montserrat', sans-serif; font-size: 1.1em; font-weight: 400; font-style: normal; color: #b28375; letter-spacing: 0.05em; opacity: 1; }

  /* ── Modal ── */
  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(20,16,12,0.75);
    backdrop-filter: blur(6px);
    z-index: 100;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    animation: fadeIn 0.25s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: rgba(248, 243, 236, 0.92);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.45);
    border-radius: 20px;
    width: 100%; max-width: 420px;
    max-height: 90svh; overflow-y: auto;
    position: relative;
    animation: slideUp 0.35s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
  .modal-close {
    position: absolute; top: 1rem; right: 1rem;
    width: 32px; height: 32px; border-radius: 50%;
    border: 1px solid var(--muted); background: transparent;
    color: var(--muted-fg); font-size: 1.25rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s; line-height: 1;
  }
  .modal-close:hover { background: var(--muted); }
  .modal-form { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
  .modal-header { text-align: center; padding-bottom: 1rem; border-bottom: 1px solid var(--muted); }
  .modal-title { 
    font-family: var(--font-cormorant), Georgia, serif; 
    font-size: 2rem; 
    font-style: italic; 
    font-weight: 300; 
    color: var(--charcoal); 
    margin: 0.5rem 0; 
    letter-spacing: -0.01em;
  }
  .modal-success { padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  .modal-success-icon { width: 56px; height: 56px; border-radius: 50%; background: #EDE5D8; border: 1px solid var(--gold); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--gold); }

  /* Guest card */
  .modal-guest-card {
    display: flex; align-items: center; gap: 1rem;
    background: #F0E9DF; border: 1px solid var(--muted);
    border-radius: 12px; padding: 1rem 1.25rem;
  }
  .mgc-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    background: var(--charcoal); color: var(--ivory);
    font-family: var(--font-cormorant), Georgia, serif;
    font-size: 1.4rem; font-style: italic;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .mgc-name { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.15rem; font-weight: 400; color: var(--charcoal); margin: 0 0 0.2rem; }

  /* RSVP choice */
  .rsvp-choice { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .rsvp-yes {
    padding: 0.875rem; border-radius: 10px;
    background: var(--charcoal); color: var(--ivory);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
    border: none; cursor: pointer;
    transition: background 0.2s, transform 0.15s;
  }
  .rsvp-yes:hover { background: var(--gold); transform: translateY(-1px); }
  .rsvp-no {
    padding: 0.875rem; border-radius: 10px;
    background: transparent; color: var(--muted-fg);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
    border: 1px solid var(--muted); cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .rsvp-no:hover { border-color: var(--muted-fg); color: var(--charcoal); }
  .rsvp-confirmed { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
  .rsvp-confirmed-text { font-family: var(--font-cormorant), Georgia, serif; font-size: 1.25rem; font-style: italic; color: var(--charcoal); margin: 0; }
  .rsvp-change { background: none; border: none; font-family: var(--font-jost), system-ui, sans-serif; font-size: 11px; color: var(--muted-fg); cursor: pointer; text-decoration: underline; letter-spacing: 0.05em; }

  .attendees-list {
    width: 100%;
    background: #F0E9DF;
    border: 1px solid var(--muted);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
  }
  .attendee-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .attendee-row--main { padding-bottom: 0.5rem; border-bottom: 1px solid var(--muted); margin-bottom: 0.25rem; }
  .attendee-num {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: var(--muted);
    border: 1px solid var(--gold);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 10px; color: var(--gold);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .attendee-name {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 13px; font-weight: 500;
    color: var(--charcoal); flex: 1;
    transition: color 0.2s, opacity 0.2s;
  }
  .attendee-name--muted {
    color: var(--muted-fg);
    text-decoration: line-through;
    opacity: 0.55;
  }
  /* Checkbox personalizado */
  .attendee-check-label {
    display: flex; align-items: center; cursor: pointer; flex-shrink: 0;
  }
  .attendee-check-label input[type="checkbox"] { display: none; }
  .attendee-check-box {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: var(--muted);
    border: 1.5px solid var(--muted-fg);
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s, border-color 0.2s;
    flex-shrink: 0;
  }
  .attendee-check-label input[type="checkbox"]:checked + .attendee-check-box {
    background: rgba(184,150,90,0.15);
    border-color: var(--gold);
  }
  .attendee-check-label input[type="checkbox"]:checked + .attendee-check-box::after {
    content: '✓';
    font-size: 11px;
    color: var(--gold);
    line-height: 1;
  }
  .attendee-badge {
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-weight: 600;
    padding: 0.18rem 0.55rem;
    border-radius: 100px;
    flex-shrink: 0;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }
  .attendee-badge--yes {
    background: rgba(74, 160, 90, 0.12);
    color: #3d8b52;
    border: 1px solid rgba(74, 160, 90, 0.28);
  }
  .attendee-badge--no {
    background: rgba(0, 0, 0, 0.04);
    color: var(--muted-fg);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  .form-input {
    width: 100%; padding: 0.875rem 1rem;
    border: 1px solid var(--muted); border-radius: 10px;
    background: #F0E9DF;
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 14px; color: var(--charcoal);
    outline: none; transition: border-color 0.2s; box-sizing: border-box;
  }
  .form-input:focus { border-color: var(--gold); }
  .form-input::placeholder { color: var(--muted-fg); }
  .btn-submit {
    width: 100%; padding: 1rem; border-radius: 100px;
    background: var(--charcoal); color: var(--ivory);
    font-family: var(--font-jost), system-ui, sans-serif;
    font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
    border: none; cursor: pointer;
    transition: background 0.2s, transform 0.2s;
  }
  .btn-submit:hover { background: var(--gold); transform: translateY(-1px); }

  /* ── Reveal Animations defined ── */
  .reveal {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  .slide-left {
    opacity: 0;
    transform: translateX(-40px);
    transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  .slide-right {
    opacity: 0;
    transform: translateX(40px);
    transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  .slide-up {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }
  .reveal.is-visible,
  .slide-left.is-visible,
  .slide-right.is-visible,
  .slide-up.is-visible {
    opacity: 1;
    transform: translate(0, 0);
  }

  .delay-1 { transition-delay: 0.1s; }
  .delay-2 { transition-delay: 0.2s; }
  .delay-3 { transition-delay: 0.3s; }
  .delay-4 { transition-delay: 0.4s; }

  /* ── Mobile adjustments ── */
  @media (max-width: 768px) {
    .section { padding: 3rem 1.5rem; }
    .section--wide { padding-left: 1.5rem; padding-right: 1.5rem; }
    .destination-grid { grid-template-columns: 1fr; }
    .dlx-itinerary-wrap { max-width: 100%; padding: 0 0.5rem; }
    .gifts-grid-v2 { grid-template-columns: 1fr; max-width: 380px; }
    .gifts-grid-v2 .gift-card-v2:last-child:nth-child(3) { grid-column: auto; justify-self: auto; max-width: 100%; }
  }
  @media (max-width: 480px) {
    .dlx-hero-meta { flex-direction: column; gap: 0.4rem; }
    .dlx-meta-dot { display: none; }
    .section { padding: 3rem 1.25rem; }
    .dc-gender-grid { grid-template-columns: 1fr; max-width: 360px; }
  }
`;

// ---------------------------------------------------------------------------
// DeluxeCarouselBlock — carrusel interactivo con navegación
// ---------------------------------------------------------------------------
function DeluxeCarouselBlock({ srcs, positions, scales, names }: { srcs: string[]; positions?: string[]; scales?: number[]; names?: string }) {
  const total = srcs.length;
  // trackIdx: position in the extended track [clone-last, ...real, clone-first]
  // Starts at 1 so the first real slide is visible
  const [trackIdx, setTrackIdx] = useState(total > 1 ? 1 : 0);
  const [noTransition, setNoTransition] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [portraits, setPortraits] = useState<boolean[]>(() => new Array(total).fill(false));
  const touchStartX = useRef<number | null>(null);

  // Logical index for dots (0-based)
  const realIdx = total > 1 ? (trackIdx - 1 + total) % total : 0;

  // Extended slides: [last-clone, real-0, real-1, ..., real-n, first-clone]
  const extSrcs      = total > 1 ? [srcs[total - 1], ...srcs, srcs[0]] : srcs;
  const extPositions = total > 1
    ? [positions?.[total - 1] ?? 'center center', ...(positions ?? srcs.map(() => 'center center')), positions?.[0] ?? 'center center']
    : positions;
  const extScales    = total > 1
    ? [scales?.[total - 1] ?? 1, ...(scales ?? srcs.map(() => 1)), scales?.[0] ?? 1]
    : scales;

  // Map extended index → real portrait state
  const getPortrait = (extI: number) => {
    if (total <= 1) return portraits[extI] ?? false;
    if (extI === 0) return portraits[total - 1];
    if (extI === total + 1) return portraits[0];
    return portraits[extI - 1];
  };

  // Auto-advance
  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const id = setInterval(() => setTrackIdx(i => i + 1), 5000);
    return () => clearInterval(id);
  }, [total, isPaused]);

  // Re-enable transition after instant snap
  useEffect(() => {
    if (!noTransition) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setNoTransition(false)));
    return () => cancelAnimationFrame(id);
  }, [noTransition]);

  const prev = () => { setIsPaused(true); setTrackIdx(i => { if (i < 1) return i; return i - 1; }); };
  const next = () => { setIsPaused(true); setTrackIdx(i => { if (i > total) return i; return i + 1; }); };

  // After the CSS transition ends, snap back from clone to real slide without animation
  const handleTransitionEnd = () => {
    if (total <= 1) return;
    if (trackIdx === 0)         { setNoTransition(true); setTrackIdx(total); }
    else if (trackIdx === total + 1) { setNoTransition(true); setTrackIdx(1); }
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { if (diff > 0) next(); else prev(); }
    touchStartX.current = null;
  };

  if (total === 0) return null;

  return (
    <div
      className="dlx-carousel reveal"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="dlx-carousel-track"
        style={{
          transform: `translateX(-${trackIdx * 100}%)`,
          transition: noTransition ? 'none' : undefined,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extSrcs.map((src, i) => (
          <div key={i} className={`dlx-carousel-slide${getPortrait(i) ? ' dlx-carousel-slide--portrait' : ''}`}>
            <div className="dlx-carousel-img-blur-bg" style={{ backgroundImage: `url(${src})` }} />
            <img
              src={src}
              alt={names ? `Foto ${realIdx + 1} de ${names}` : `Foto ${realIdx + 1}`}
              className="dlx-carousel-img"
              style={{
                objectPosition: extPositions?.[i] ?? 'center center',
                transform: `scale(${extScales?.[i] ?? 1})`,
                transformOrigin: extPositions?.[i] ?? 'center center',
              }}
              onLoad={(e) => {
                const img = e.currentTarget;
                let realI = total > 1
                  ? (i === 0 ? total - 1 : i === total + 1 ? 0 : i - 1)
                  : i;
                if (img.naturalHeight > img.naturalWidth) {
                  setPortraits(prev => { const n = [...prev]; n[realI] = true; return n; });
                }
              }}
            />
          </div>
        ))}
      </div>
      {total > 1 && (
        <>
          <button className="dlx-carousel-btn dlx-carousel-btn--prev" onClick={prev} aria-label="Anterior">
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
              <path d="M9 1L1 8.5L9 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="dlx-carousel-btn dlx-carousel-btn--next" onClick={next} aria-label="Siguiente">
            <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
              <path d="M1 1L9 8.5L1 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="dlx-carousel-dots">
            {srcs.map((_, i) => (
              <button
                key={i}
                className={`dlx-carousel-dot${i === realIdx ? ' dlx-carousel-dot--active' : ''}`}
                onClick={() => { setIsPaused(true); setTrackIdx(i + 1); }}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------
function useCountdown(targetDate: string) {
  const calc = () => {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      isOver: false,
    };
  };
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });
  useEffect(() => {
    setTime(calc());
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function DeluxeTemplate({
  config,
  plan: planProp,
  eventId,
  guestToken,
  maxCompanions = 0,
  companionNames: initialCompanionNames = [],
  guestName,
  hasExistingRsvp = false,
  invalidToken = false,
}: Props) {
  const caps = getCapabilities(planProp);
  const isPlus = planProp === 'plus';
  // ── Build data from config with defaults ────────────────────────────────
  const cfg = (config ?? {}) as DeluxeConfig;
  const dietary = cfg.dietary ?? { enabled: false, options: [] };

  // ── Theme ────────────────────────────────────────────────────────────────
  const t = cfg.theme ?? {};
  const accentColor     = t.accentColor     ?? '#B8965A';
  const backgroundColor = t.backgroundColor ?? '#F8F3EC';
  const textColor       = t.textColor       ?? '#1C1611';
  const displayFontVar  = DISPLAY_FONT_VAR[t.displayFont ?? 'cormorant'] ?? 'var(--font-cormorant)';
  const bodyFontVar     = BODY_FONT_VAR[t.bodyFont ?? 'jost'] ?? 'var(--font-jost)';
  const rootStyle = { '--font-display': displayFontVar, '--font-body': bodyFontVar } as React.CSSProperties;
  const dynamicCss = `.dlx-root { --ivory: ${backgroundColor}; --charcoal: ${textColor}; --gold: ${accentColor}; }`;
  const allFontVars = `${cormorant.variable} ${jost.variable} ${playfair.variable} ${ebGaramond.variable} ${raleway.variable} ${montserrat.variable}`;

  const couple = {
    person1: cfg.couple?.person1 || 'Persona 1',
    person2: cfg.couple?.person2 || 'Persona 2',
  };
  const initials = {
    person1: couple.person1.charAt(0),
    person2: couple.person2.charAt(0),
  };
  const fullNames = {
    person1: cfg.fullNames?.person1 || couple.person1,
    person2: cfg.fullNames?.person2 || couple.person2,
  };
  const date = {
    day:   cfg.date?.day   || '',
    month: cfg.date?.month || '',
    year:  cfg.date?.year  || '',
  };
  const location = cfg.location || '';
  const targetDate = cfg.targetDate || '';
  const heroLabel = cfg.heroLabel || 'Matrimonio';
  const noChildrenMessage = cfg.noChildrenMessage || 'Con todo nuestro cariño, les pedimos que esta celebración sea exclusiva para adultos. Agradecemos su comprensión.';
  const quote = {
    text:      cfg.quote?.text      || '',
    reference: cfg.quote?.reference || '',
  };
  const splitParent = (s: string) => {
    const lines = s.split('\n').map(l => l.replace(/\s*&\s*$/, '').trim()).filter(Boolean);
    if (lines.length < 2) return lines;
    const out: string[] = [lines[0]];
    for (let i = 1; i < lines.length; i++) { out.push('&'); out.push(lines[i]); }
    return out;
  };
  const parents = {
    person1: cfg.parents?.person1 || '',
    person2: cfg.parents?.person2 || '',
    lines1: splitParent(cfg.parents?.person1 || ''),
    lines2: splitParent(cfg.parents?.person2 || ''),
  };
  // Hero photo
  // Limit specific to Deluxe plan as per requirements
  const allPhotos = (cfg.photos ?? []).slice(0, caps.maxPhotos);
  const heroEntry = allPhotos.find(p => p.role === 'hero');
  const heroUrl   = heroEntry?.url || DEFAULT_PHOTOS.hero;

  /** Renderiza los bloques de imagen para una posición de sección */
  function renderBlocks(afterSection: string) {
    const sp = allPhotos.filter(p => p.role === 'block' && p.afterSection === afterSection);
    if (sp.length === 0) return null;
    const map = new Map<number, typeof sp>();
    for (const p of sp) {
      const g = p.blockGroup ?? 0;
      map.set(g, [...(map.get(g) ?? []), p]);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a - b)
      .map(([g, ps]) => {
        const sorted    = ps.sort((a, b) => (a.orderInBlock ?? 0) - (b.orderInBlock ?? 0));
        const srcs      = sorted.map(p => p.url).filter(Boolean);
        const positions = sorted.map(p => p.objectPosition ?? 'center center');
        const scales    = sorted.map(p => p.scale ?? 1);
        if (!srcs.length) return null;

        const photoAlt = `Foto de ${couple.person1} y ${couple.person2}`;
        if (ps[0].layout === 'full') {
          return (
            <div key={g} className="photo-block reveal">
              <img src={srcs[0]} alt={photoAlt} className="photo-block-img"
                style={{ objectPosition: positions[0], transform: `scale(${scales[0]})`, transformOrigin: positions[0] }} />
            </div>
          );
        }
        if (ps[0].layout === 'duo') {
          return (
            <div key={g} className="duo-block reveal">
              <div className="duo-block-item slide-left">
                <img src={srcs[0]} alt={photoAlt} className="duo-block-img"
                  style={{ objectPosition: positions[0], transform: `scale(${scales[0]})`, transformOrigin: positions[0] }} />
              </div>
              <div className="duo-block-item slide-right">
                <img src={srcs[1] ?? srcs[0]} alt={photoAlt} className="duo-block-img"
                  style={{ objectPosition: positions[1] ?? positions[0], transform: `scale(${scales[1] ?? scales[1]})`, transformOrigin: positions[1] ?? positions[0] }} />
              </div>
            </div>
          );
        }
        if (ps[0].layout === 'trio') {
          return (
            <div key={g} className="trio-block reveal">
              <div className="trio-block-item slide-up">
                <img src={srcs[0]} alt={photoAlt} className="trio-block-img"
                  style={{ objectPosition: positions[0], transform: `scale(${scales[0]})`, transformOrigin: positions[0] }} />
              </div>
              <div className="trio-block-item slide-up delay-1">
                <img src={srcs[1] ?? srcs[0]} alt={photoAlt} className="trio-block-img"
                  style={{ objectPosition: positions[1] ?? positions[0], transform: `scale(${scales[1] ?? scales[0]})`, transformOrigin: positions[1] ?? positions[0] }} />
              </div>
              <div className="trio-block-item slide-up delay-2">
                <img src={srcs[2] ?? srcs[0]} alt={photoAlt} className="trio-block-img"
                  style={{ objectPosition: positions[2] ?? positions[0], transform: `scale(${scales[2] ?? scales[0]})`, transformOrigin: positions[2] ?? positions[0] }} />
              </div>
            </div>
          );
        }
        // carousel (solo disponible en plan deluxe)
        return <DeluxeCarouselBlock key={g} srcs={srcs} positions={positions} scales={scales} names={`${couple.person1} y ${couple.person2}`} />;
      });
  }
  const itinerary = cfg.itinerary ?? [];
  const dressCode = {
    label:       cfg.dressCode?.label       || '',
    description: cfg.dressCode?.description || '',
    women:       cfg.dressCode?.women       || '',
    men:         cfg.dressCode?.men         || '',
    swatches:    cfg.dressCode?.swatches    ?? [],
    avoid:       cfg.dressCode?.avoid       ?? [],
  };
  const notes       = cfg.notes  ?? [];
  const gifts       = cfg.gifts  ?? {};
  const rawMusicUrl = cfg.music?.url || '';
  const audioSrc = rawMusicUrl.includes('drive.google.com')
    ? `/api/audio-proxy?url=${encodeURIComponent(rawMusicUrl)}`
    : rawMusicUrl;
  const music       = { url: audioSrc, title: cfg.music?.title || '', artist: cfg.music?.artist || '' };
  const destination = cfg.destination ?? {};
  const noChildren  = cfg.noChildren ?? false;
  const rsvpDeadline = cfg.rsvpDeadline || '';
  const showDestination = caps.recommendations && cfg.sections?.destination !== false && (
    (destination.hotels && destination.hotels.length > 0) ||
    destination.transport?.info
  );

  // Google Calendar URL
  const firstItineraryTime = itinerary[0]?.time ?? '17:00';
  const [startH, startM] = firstItineraryTime.split(':');
  const dateStr = `${date.year}${String(date.month).padStart(2, '0')}${String(date.day).padStart(2, '0')}`;
  const isoStart = targetDate
    ? targetDate.replace(/[-:]/g, '').replace('T', 'T').slice(0, 15)
    : `${dateStr}T${startH}${startM}00`;
  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Boda de ${couple.person1} & ${couple.person2}`)}&dates=${isoStart}&location=${encodeURIComponent(location)}`;

  // ── State ────────────────────────────────────────────────────────────────
  const countdown = useCountdown(targetDate);
  const [loading, setLoading] = useState(caps.loader);
  const [loaderOut, setLoaderOut] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(false);
  const [guestConfirmed, setGuestConfirmed] = useState<null | boolean>(null);
  const [attendeeNames, setAttendeeNames] = useState<string[]>([]);
  const [attendeeChecked, setAttendeeChecked] = useState<boolean[]>([]);
  const [dietaryMap, setDietaryMap] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const axisRef = useRef<HTMLDivElement>(null);
  const itineraryRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [musicMinimized, setMusicMinimized] = useState(false);
  const [showSongName, setShowSongName] = useState(false);
  const showSongNameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasToken = !!guestToken;
  const isDemo = !eventId && !guestToken;
  const displayName = guestName || (isDemo ? 'Ana García' : couple.person1);
  const effectiveMaxCompanions = isDemo ? 2 : maxCompanions;
  const totalSeats = 1 + effectiveMaxCompanions;

  // Loader
  useEffect(() => {
    const t1 = setTimeout(() => setLoaderOut(true), 2200);
    const t2 = setTimeout(() => setLoading(false), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Music Auto-minimize
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => setMusicMinimized(true), 4000);
    return () => clearTimeout(timer);
  }, [loading]);

  // Music Autoplay + fallback on first interaction
  useEffect(() => {
    if (loading || !music.url) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().then(() => {
      setPlaying(true);
    }).catch(() => {
      // Browser blocked autoplay — wait for first user interaction
      const unlock = () => {
        audio.play().then(() => { setPlaying(true); }).catch(() => {});
        document.removeEventListener('click', unlock);
        document.removeEventListener('touchstart', unlock);
      };
      document.addEventListener('click', unlock, { once: true });
      document.addEventListener('touchstart', unlock, { once: true });
    });
  }, [loading, music.url]);

  // Scroll reveal
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal, .slide-left, .slide-right, .slide-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  // Itinerary axis growing line
  useEffect(() => {
    if (loading) return;
    const el = axisRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('axis-grow'); },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading]);

  // Modal focus management
  useEffect(() => {
    if (modalOpen) {
      const first = modalRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }
  }, [modalOpen]);

  // Music toggle
  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (audio && music.url) {
      if (playing) {
        audio.pause();
        setMusicMinimized(true);
      } else {
        audio.play().catch(() => {});
        setMusicMinimized(false);
      }
    }
    setPlaying((p) => !p);
    // Mostrar nombre de canción brevemente al hacer click
    if (showSongNameTimerRef.current) clearTimeout(showSongNameTimerRef.current);
    setShowSongName(true);
    showSongNameTimerRef.current = setTimeout(() => setShowSongName(false), 3000);
  }, [playing, music.url]);

  // RSVP submit
  async function handleSubmitRsvp() {
    if (!hasToken || !eventId) return;
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
          seats: guestConfirmed ? 1 + (isPlus
            ? attendeeNames.filter(n => n.trim() !== '').length
            : attendeeNames.filter((_, i) => attendeeChecked[i]).length) : 0,
          companionNames: guestConfirmed ? (isPlus
            ? attendeeNames.filter(n => n.trim() !== '')
            : attendeeNames.filter((_, i) => attendeeChecked[i])) : [],
          dietary: guestConfirmed ? (dietaryMap[displayName]?.join(', ') || '') : undefined,
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


  if (loading && caps.loader) {
    return (
      <ContentProtection>
      <div className={`${allFontVars} dlx-root`} style={rootStyle}>
        <style suppressHydrationWarning>{css}</style>
        <style suppressHydrationWarning>{dynamicCss}</style>
        <div className={`loader ${loaderOut ? 'loader--out' : ''}`}>
          <div className="loader-monogram">
            {cfg.monogram ? (
              <span className="loader-initial">{cfg.monogram}</span>
            ) : (
              <>
                <span className="loader-initial">{initials.person1}</span>
                <span className="loader-amp">&</span>
                <span className="loader-initial">{initials.person2}</span>
              </>
            )}
          </div>
          <div className="loader-line" />
          <p className="loader-date label">
            {date.day} · {date.month} · {date.year}
          </p>
        </div>
      </div>
      </ContentProtection>
    );
  }

  return (
    <ContentProtection>
    <div className={`${allFontVars} dlx-root`} style={rootStyle}>
      <style suppressHydrationWarning>{css}</style>
      <style suppressHydrationWarning>{dynamicCss}</style>

      {/* Audio */}
      {caps.music && music.url && <audio ref={audioRef} src={music.url} loop preload="none" />}

      {/* ── MUSIC PLAYER ── */}
      {caps.music && music.url && (
        <button 
          className={`music-pill ${playing ? 'music-pill--playing' : ''} ${musicMinimized ? 'music-pill--minimized' : ''}`} 
          onClick={toggleMusic}
          aria-label="Play"
        >
          <div className="music-pill-icon">
            {playing ? <PauseIcon /> : <PlayIcon />}
          </div>
          {showSongName && (
            <span className="music-pill-text">
              {playing
                ? [music.title, music.artist].filter(Boolean).join(' · ') || 'Reproduciendo'
                : 'Reproducir'}
            </span>
          )}
          {playing && <span className="music-pill-wave"><span/><span/><span/><span/></span>}
        </button>
      )}

      {/* ── HERO ── */}
      <section className="dlx-hero" id="hero">
        <div className="dlx-hero-bg" style={{ backgroundImage: `url(${heroUrl})` }} />
        <div className="dlx-hero-glow" />
        <div className="dlx-hero-overlay" />
        <div className="dlx-hero-content">
          <p className="label gold hero-label reveal">{heroLabel}</p>
          <h1 className="dlx-hero-names reveal">
            <span>{couple.person1}</span>
            <span className="dlx-hero-amp">&</span>
            <span>{couple.person2}</span>
          </h1>
          <div className="dlx-hero-meta reveal">
            <span className="label gold">{date.day} · {date.month} · {date.year}</span>
            <span className="dlx-meta-dot" />
            <span className="label muted">{location}</span>
          </div>
          {/* Countdown */}
          {caps.countdown && (countdown.isOver ? (
            <div className="dlx-countdown reveal">
              <span className="label gold">¡Gracias por celebrar con nosotros!</span>
            </div>
          ) : (
            <div className="dlx-countdown reveal">
              {[
                { value: countdown.days, label: 'Días' },
                { value: countdown.hours, label: 'Horas' },
                { value: countdown.minutes, label: 'Min' },
                { value: countdown.seconds, label: 'Seg' },
              ].map(({ value, label }, i) => (
                <React.Fragment key={label}>
                  <div className="dlx-cd-unit">
                    <span className="dlx-cd-value">{String(value).padStart(2, '0')}</span>
                    <span className="dlx-cd-label">{label}</span>
                  </div>
                  {i < 3 && <span className="dlx-cd-sep">:</span>}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
        <div className="hero-scroll-indicator">
          <span className="label muted" style={{ fontSize: '10px' }}>Desliza</span>
          <div className="scroll-bar"><div className="scroll-thumb" /></div>
        </div>
      </section>

      {renderBlocks('hero')}

      {/* ── CITA ── */}
      {cfg.sections?.quote !== false && quote.text && (
        <section className="section dlx-dark" id="quote">
          <div className="quote-mark reveal">"</div>
          <p className="quote-text reveal">{quote.text}</p>
          {quote.reference && <p className="label muted reveal" style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.6)' }}>{quote.reference}</p>}
        </section>
      )}

      {renderBlocks('quote')}

      {/* ── NOMBRES Y PADRES ── */}
      {cfg.sections?.parents !== false && (
        <section className="section" id="parents">
          <p className="label muted reveal" style={{ marginBottom: '2.5rem' }}>Con la bendición de nuestras familias</p>
          <div className="parents-wrap">
            <div className="parents-group slide-left delay-1" style={{ alignSelf: 'start' }}>
              <p className="display-name">{fullNames.person1}</p>
              <div className="name-sep"><span className="sep-line short" /></div>
              {parents.lines1.map((line, i) => (
                <p key={i} className="label muted">{line}</p>
              ))}
            </div>
            <div className="parents-monogram reveal">
              <span>{initials.person1}</span>
              <span className="pm-amp">&</span>
              <span>{initials.person2}</span>
            </div>
            <div className="parents-group slide-right delay-1" style={{ alignSelf: 'start' }}>
              <p className="display-name">{fullNames.person2}</p>
              <div className="name-sep"><span className="sep-line short" /></div>
              {parents.lines2.map((line, i) => (
                <p key={i} className="label muted">{line}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {renderBlocks('parents')}

      {/* ── ITINERARIO ── */}
      {cfg.sections?.itinerary !== false && itinerary.length > 0 && <Ornament />}
      {cfg.sections?.itinerary !== false && itinerary.length > 0 && (
        <section className="section" ref={itineraryRef} id="itinerary" style={{ maxWidth: '100%', width: '100%' }}>
          <h2 className="section-heading reveal">Programa del Día</h2>
          <p className="label muted reveal" style={{ marginBottom: '0.5rem' }}>
            {date.day} · {date.month} · {date.year}
          </p>
          <div className="dlx-itinerary-wrap">
            {itinerary.map((item, i) => {
              const [h, m] = (item.time || '00:00').split(':');
              const manualUrl = item.mapsUrl?.trim();
              const mapsUrl = manualUrl || (item.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}` : '');
              return (
                <div key={i} className={`dlx-irow-v2 slide-up${i <= 3 ? ` delay-${i + 1}` : ''}`}>
                  {/* Hora (oculta en mobile) */}
                  <div className="dlx-itime-col">
                    <span className="dlx-itime-big">{h}<span style={{ fontSize: '0.45em', opacity: 0.6 }}>:{m}</span></span>
                  </div>
                  {/* Nodo central */}
                  <div className="dlx-inode-col">
                    <div className="dlx-inode-v2" />
                  </div>
                  {/* Tarjeta */}
                  <div className="dlx-icontent-col">
                    {/* Hora en mobile */}
                    <div className="dlx-itime-mobile">
                      <span className="dlx-itime-mobile-h">{h}</span>
                      <span className="dlx-itime-mobile-m">:{m}</span>
                    </div>
                    <div className="dlx-icard-v2">
                      {item.image && (
                        <div className="dlx-iimg-wrap">
                          <img 
                            src={item.image} 
                            alt={item.venue ?? item.name ?? 'Lugar del evento'} 
                            className="dlx-iimg" 
                            style={{
                              objectPosition: item.imageObjectPosition ?? 'center center',
                              transform: `scale(${item.imageScale ?? 1})`,
                              transformOrigin: item.imageObjectPosition ?? 'center center',
                            }}
                          />
                        </div>
                      )}
                      <div className="dlx-icard-v2-body">
                        <p className="dlx-iname-v2">{item.name}</p>
                        {item.venue && <p className="dlx-ivenue-v2">{item.venue}</p>}
                        {item.address && (
                          <div className="dlx-iaddress-v2">
                            <PinIcon /><span>{item.address}</span>
                          </div>
                        )}
                        {mapsUrl && (
                          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="dlx-maps-btn">
                            <MapsIcon /> Ver en Maps
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {renderBlocks('itinerary')}

      {/* Solo mostramos ornamento si la siguiente sección (Destino) está activa */}
      {cfg.sections?.destination !== false && showDestination && <Ornament />}

      {/* ── DESTINO ── */}
      {cfg.sections?.destination !== false && showDestination && (
        <section className="section section--wide" id="destination">
          <h2 className="section-heading reveal">Boda Destino</h2>
          <p className="label muted reveal" style={{ marginBottom: '3rem' }}>
            Te ayudamos a organizar tu estadía
          </p>

          {destination.hotels && destination.hotels.length > 0 && (
            <>
              <p className="label gold reveal" style={{ marginBottom: '1.5rem' }}>Hospedaje</p>
              <div className="destination-grid reveal">
                {destination.hotels.map((hotel, i) => (
                  <div key={i} className={`dest-card delay-${i + 1}`}>
                    <div className="dest-card-icon"><HotelIcon /></div>
                    <p className="dest-card-name">{hotel.name}</p>
                    <p className="label muted dest-card-category">{hotel.category}</p>
                    <div className="dest-card-divider" />
                    <div className="dest-card-address"><PinIcon /><span>{hotel.address}</span></div>
                    {hotel.note && <p className="dest-card-note">{hotel.note}</p>}
                    {hotel.phone && <a href={`tel:${hotel.phone}`} className="dest-card-phone">{hotel.phone}</a>}
                  </div>
                ))}
              </div>
            </>
          )}

          {destination.transport?.info && (
            <>
              <p className="label gold reveal" style={{ margin: '3.5rem 0 1.5rem' }}>Transporte</p>
              <div className="transport-card reveal">
                <div className="transport-header">
                  <CarIcon />
                  <p className="dest-card-name" style={{ margin: 0 }}>Información de transporte</p>
                </div>
                <p className="transport-info">{destination.transport.info}</p>
                {destination.transport.schedule && destination.transport.schedule.length > 0 && (
                  <div className="transport-schedule">
                    {destination.transport.schedule.map((s, i) => (
                      <div key={i} className="transport-row">
                        <span className="transport-time">{s.time}</span>
                        <span className="transport-detail">{s.detail}</span>
                      </div>
                    ))}
                  </div>
                )}
                {destination.transport.contact && (
                  <div className="transport-contact">
                    <EnvelopeIcon />
                    <a href={`mailto:${destination.transport.contact}`} className="dest-card-phone">
                      {destination.transport.contact}
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {renderBlocks('destination')}

      {/* ── DRESS CODE ── */}
      {cfg.sections?.dressCode !== false && dressCode.label && <Ornament />}
      {cfg.sections?.dressCode !== false && dressCode.label && (
        <section className="section" id="dresscode" style={{ maxWidth: '100%', width: '100%' }}>
          {/* Eyebrow */}
          <p className="label gold reveal" style={{ letterSpacing: '0.25em', marginBottom: '0.75rem' }}>Dress Code</p>
          {/* Nombre del dress code como hero */}
          <h2 className="section-heading reveal" style={{ marginBottom: '0.75rem' }}>
            {dressCode.label}
          </h2>
          <span className="sep-line reveal" style={{ maxWidth: '72px', marginBottom: '0' }} />

          {/* Descripción general */}
          {dressCode.description && (
            <p className="dc-description reveal">{dressCode.description}</p>
          )}

          {/* Gender cards */}
          {(dressCode.women || dressCode.men) && (
            <div className="dc-gender-grid reveal">
              {dressCode.women && (
                <div className="dc-gender-card">
                  <div className="dc-gender-icon-ring"><WomenIcon /></div>
                  <p className="label gold" style={{ letterSpacing: '0.2em', margin: '0 0 0.1rem' }}>Ellas</p>
                  <div className="dc-gender-divider-line" />
                  <p className="dc-gender-desc">{dressCode.women}</p>
                </div>
              )}
              {dressCode.men && (
                <div className="dc-gender-card">
                  <div className="dc-gender-icon-ring"><MenIcon /></div>
                  <p className="label gold" style={{ letterSpacing: '0.2em', margin: '0 0 0.1rem' }}>Ellos</p>
                  <div className="dc-gender-divider-line" />
                  <p className="dc-gender-desc">{dressCode.men}</p>
                </div>
              )}
            </div>
          )}

          {/* Paleta sugerida */}
          {dressCode.swatches.length > 0 && (
            <div className="reveal" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <p className="dc-swatches-label">Colores sugeridos</p>
              <div className="swatches">
                {dressCode.swatches.map((s, i) => (
                  <div key={i} className="swatch-item">
                    <div className="swatch-circle" style={{ backgroundColor: s.color }} />
                    <span className="swatch-name">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paleta a evitar */}
          {dressCode.avoid.length > 0 && (
            <div className="reveal" style={{ textAlign: 'center', marginTop: '2rem' }}>
              <p className="dc-swatches-label">Por favor evita</p>
              <div className="swatches">
                {dressCode.avoid.map((s, i) => (
                  <div key={i} className="swatch-item swatch-item--avoid">
                    <div style={{ position: 'relative', width: 64, height: 64 }}>
                      <div className="swatch-circle" style={{ backgroundColor: s.color, width: '100%', height: '100%' }} />
                      <div className="swatch-avoid-x">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path d="M4 4l10 10M14 4L4 14" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                    </div>
                    <span className="swatch-name">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {renderBlocks('dressCode')}

      {/* Ornamento condicional antes de Notas */}
      {cfg.sections?.notes !== false && notes.length > 0 && <Ornament />}

      {/* ── INDICACIONES ── */}
      {cfg.sections?.notes !== false && notes.length > 0 && (
        <section className="section" id="notes">
          <h2 className="section-heading reveal">Toma nota</h2>
          <div className="notes-list">
            {notes.map((note, i) => (
              <div key={i} className={`note-item reveal delay-${i + 1}`}>
                <span className="note-dot" />
                <p className="note-text">{note}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {renderBlocks('notes')}

      {/* Ornamento condicional antes de Regalos */}
      {cfg.sections?.gifts !== false && (() => {
        const gt = gifts.giftTypes ?? [];
        return gt.length > 0 || gifts.bank || gifts.giftListUrl;
      })() && <Ornament />}

      {/* ── REGALOS ── */}
      {cfg.sections?.gifts !== false && (() => {
        const gt = gifts.giftTypes ?? [];
        const showTransfer = gt.includes('transfer') || (!gt.length && !!gifts.bank);
        const showList     = gt.includes('list')     || (!gt.length && !!gifts.giftListUrl);
        const showEnvelope = gt.includes('envelope');
        if (!showTransfer && !showList && !showEnvelope) return null;
        return (
          <section className="section" id="gifts">
            <h2 className="section-heading reveal">Mesa de Regalos</h2>
            <p className="label muted reveal" style={{ maxWidth: '360px', lineHeight: '1.9', marginBottom: '2.5rem' }}>
              Tu presencia es nuestro mayor regalo. Si deseas obsequiarnos algo, aquí encontrarás las opciones.
            </p>
            <div className="gifts-grid-v2">
              {/* Transfer card — dark premium */}
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

              {/* List card — ivory */}
              {showList && gifts.giftListUrl && (
                <div className="gift-card-v2 gift-card-v2--list reveal delay-1">
                  <div className="gcl-icon-ring">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gold)' }}>
                      <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                    </svg>
                  </div>
                  <p className="gcl-title">Mesa de Regalos</p>
                  {gifts.giftListLabel && <p className="gcl-subtitle">{gifts.giftListLabel}</p>}
                  <a href={gifts.giftListUrl} target="_blank" rel="noopener noreferrer" className="btn-outline btn-outline--sm">
                    Ver lista →
                  </a>
                </div>
              )}

              {/* Envelope card — warm tint */}
              {showEnvelope && (
                <div className="gift-card-v2 gift-card-v2--envelope reveal delay-2">
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
          </section>
        );
      })()}

      {renderBlocks('gifts')}

      {/* Ornamento condicional antes de No Niños */}
      {noChildren && <Ornament />}

      {/* ── NO NIÑOS ── */}
      {noChildren && (
        <section className="section">
          <div className="no-children-block reveal">
            <NoChildrenIcon />
            <div>
              <p className="no-children-title">Evento solo para adultos</p>
              <p className="no-children-desc">{noChildrenMessage}</p>
            </div>
          </div>
        </section>
      )}

      {renderBlocks('noChildren')}

      {/* Ornamento final antes del RSVP */}
      <Ornament />

      {/* ── RSVP ── */}
      <section className="section" id="rsvp">
        <h2 className="section-heading reveal">¿Nos acompañas?</h2>
        {rsvpDeadline && (
          <p className="label muted reveal" style={{ marginBottom: '1.5rem', textTransform: 'none', letterSpacing: '0.05em' }}>
            Nos encantaría contar contigo. Por favor, confírmanos antes del <strong style={{ color: 'var(--gold)' }}>{rsvpDeadline}</strong>
          </p>
        )}
        <div className="dlx-rsvp-actions reveal">
          {caps.rsvpMode === 'whatsapp' ? (
            cfg.whatsapp?.number ? (
              <a
                href={`https://wa.me/${cfg.whatsapp.number}?text=${encodeURIComponent(cfg.whatsapp.message ?? '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-rsvp"
              >
                Confirmar por WhatsApp
              </a>
            ) : null
          ) : caps.rsvpMode === 'modalManual' ? (
            <button className="btn-rsvp" onClick={() => setModalOpen(true)}>
              {hasExistingRsvp ? 'Actualizar mi respuesta' : 'Confirmar mi asistencia'}
            </button>
          ) : invalidToken ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: 'var(--font-jost)',
                fontSize: '12px',
                letterSpacing: '0.05em',
                color: '#9B8B78',
                padding: '1.25rem 2rem',
                border: '1px solid color-mix(in srgb, var(--gold), transparent 80%)',
                borderRadius: '0',
                maxWidth: '400px',
                lineHeight: '1.8'
              }}>
                El enlace que utilizaste no es válido. Contacta a los novios para obtener tu invitación personalizada.
              </p>
            </div>
          ) : (hasToken || isDemo) ? (
            <button className="btn-rsvp" onClick={() => setModalOpen(true)}>
              {hasExistingRsvp ? 'Actualizar mi respuesta' : 'Confirmar mi asistencia'}
            </button>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: 'var(--font-jost)',
                fontSize: '12px',
                letterSpacing: '0.05em',
                color: '#9B8B78',
                padding: '1.25rem 2rem',
                border: '1px solid color-mix(in srgb, var(--gold), transparent 80%)',
                borderRadius: '0',
                maxWidth: '400px',
                lineHeight: '1.8'
              }}>
                Para confirmar, por favor utiliza el enlace personal que te enviamos.
              </p>
            </div>
          )}
          {caps.calendarButton && (
            <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="btn-calendar">
              <CalendarIcon />
              Agendar en Google Calendar
            </a>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <p className="footer-monogram">{initials.person1} &amp; {initials.person2}</p>
        <p className="footer-names">{couple.person1} &amp; {couple.person2}</p>
        <p className="label muted" style={{ marginTop: '0.5rem' }}>
          {date.day} · {date.month} · {date.year}{location ? ` · ${location}` : ''}
        </p>
        <p className="footer-powered">
          powered by <span className="footer-brand">moments</span>
        </p>
      </footer>

      {/* ── MODAL RSVP (pre-cargado) ── */}
      {modalOpen && (caps.rsvpMode === 'modalManual' || hasToken || isDemo) && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal" ref={modalRef}>
            <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Cerrar">×</button>
            {rsvpDone ? (
              <div className="modal-success">
                <div className="modal-success-icon">✓</div>
                <h3 className="modal-title">
                  {guestConfirmed ? '¡Hasta pronto!' : 'Respuesta registrada'}
                </h3>
                <p className="label muted" style={{ textAlign: 'center', lineHeight: '1.8' }}>
                  {guestConfirmed
                    ? 'Tu confirmación fue registrada. Estamos emocionados de celebrar contigo.'
                    : 'Lamentamos no poder verte. Gracias por avisarnos.'}
                </p>
              </div>
            ) : (
              <div className="modal-form">
                <div className="modal-header">
                  <p className="label gold" style={{ marginBottom: '1.5rem' }}>Confirmación de Asistencia</p>
                  <h3 className="modal-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    ¡Hola {displayName}!
                  </h3>
                  <p className="label muted" style={{ textTransform: 'none', letterSpacing: '0.02em', fontSize: '14px', marginBottom: '1.5rem' }}>
                    Nos encantaría que nos acompañaras en nuestro gran día.
                  </p>
                  <div className="sep-line" style={{ maxWidth: '40px', margin: '0 auto 1.5rem' }} />
                </div>

                {/* Datos pre-cargados del invitado */}
                <div className="modal-guest-card">
                  <div className="mgc-avatar">{displayName.charAt(0)}</div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ 
                      fontFamily: 'var(--font-jost)', 
                      fontSize: '10px', 
                      letterSpacing: '0.1em', 
                      textTransform: 'uppercase', 
                      color: 'var(--gold)',
                      marginBottom: '0.2rem'
                    }}>
                      Invitado Confirmado
                    </p>
                    <p className="mgc-name">{displayName}</p>
                    <p className="label muted">{totalSeats} {totalSeats === 1 ? 'lugar' : 'lugares'} reservados</p>
                  </div>
                </div>

                {hasExistingRsvp && guestConfirmed === null && (
                  <p className="label muted" style={{ textAlign: 'center', lineHeight: '1.8', color: '#B8965A' }}>
                    Ya tienes una confirmación registrada. Puedes actualizarla.
                  </p>
                )}

                {submitError && (
                  <p style={{ color: '#9C3A3A', fontSize: '12px', textAlign: 'center' }}>{submitError}</p>
                )}

                {guestConfirmed === null ? (
                  <div className="rsvp-choice">
                    <button
                      className="rsvp-yes"
                      onClick={() => {
                        setGuestConfirmed(true);
                        if (isPlus) {
                          setAttendeeNames([]);
                          setAttendeeChecked([]);
                        } else {
                          const names = isDemo
                            ? ['Acompañante 1', 'Acompañante 2']
                            : (initialCompanionNames.length > 0
                            ? initialCompanionNames
                            : Array.from({ length: maxCompanions }, (_, i) => `Acompañante ${i + 1}`));
                          setAttendeeNames(names);
                          setAttendeeChecked(Array(names.length).fill(true));
                        }
                      }}
                    >
                      Sí, asistiré
                    </button>
                    <button className="rsvp-no" onClick={() => setGuestConfirmed(false)}>
                      No podré ir
                    </button>
                  </div>
                ) : guestConfirmed ? (
                  <div className="rsvp-confirmed">
                    <p className="rsvp-confirmed-text">¡Perfecto! Te esperamos.</p>

                    <div className="attendees-list">
                      <p className="label muted" style={{ marginBottom: '0.75rem' }}>¿Quiénes asistirán?</p>
                      {/* Titular — siempre confirmado */}
                      <div className="attendee-row attendee-row--main">
                        <div className="attendee-num">✓</div>
                        <span className="attendee-name">{displayName}</span>
                        <span className="label muted">Titular</span>
                      </div>
                      {/* Acompañantes */}
                      {isPlus ? (
                        effectiveMaxCompanions > 0 && (
                          <div style={{ marginTop: '0.5rem' }}>
                            <p className="label muted" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                              Acompañantes <span style={{ color: 'var(--gold)' }}>(máx. {effectiveMaxCompanions})</span>
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', margin: '0.5rem 0 1rem' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setAttendeeNames(p => p.slice(0, p.length - 1));
                                  setAttendeeChecked(p => p.slice(0, p.length - 1));
                                }}
                                disabled={attendeeNames.length === 0}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--gold)', background: 'transparent', color: 'var(--gold)', fontSize: '18px', lineHeight: 1, cursor: attendeeNames.length === 0 ? 'not-allowed' : 'pointer', opacity: attendeeNames.length === 0 ? 0.4 : 1 }}
                              >−</button>
                              <span style={{ fontFamily: 'var(--font-jost)', fontSize: '16px', minWidth: '24px', textAlign: 'center' }}>{attendeeNames.length}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setAttendeeNames(p => [...p, '']);
                                  setAttendeeChecked(p => [...p, true]);
                                }}
                                disabled={attendeeNames.length >= effectiveMaxCompanions}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--gold)', background: 'transparent', color: 'var(--gold)', fontSize: '18px', lineHeight: 1, cursor: attendeeNames.length >= effectiveMaxCompanions ? 'not-allowed' : 'pointer', opacity: attendeeNames.length >= effectiveMaxCompanions ? 0.4 : 1 }}
                              >+</button>
                            </div>
                            {attendeeNames.map((name, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <span style={{ fontFamily: 'var(--font-jost)', fontSize: '12px', color: 'var(--gold)', minWidth: '18px', textAlign: 'center' }}>{i + 1}</span>
                                <input
                                  type="text"
                                  value={name}
                                  placeholder={`Nombre del acompañante ${i + 1}`}
                                  onChange={(e) => {
                                    const next = [...attendeeNames];
                                    next[i] = e.target.value;
                                    setAttendeeNames(next);
                                  }}
                                  style={{ flex: 1, padding: '8px 12px', border: '1px solid rgba(184,150,90,0.4)', borderRadius: '4px', background: 'transparent', fontFamily: 'var(--font-jost)', fontSize: '13px', color: 'var(--charcoal)', outline: 'none' }}
                                />
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        attendeeNames.map((name, i) => {
                          const attending = attendeeChecked[i] ?? true;
                          return (
                            <div key={i} className="attendee-row">
                              <label className="attendee-check-label">
                                <input
                                  type="checkbox"
                                  checked={attending}
                                  onChange={() => {
                                    const updated = [...attendeeChecked];
                                    updated[i] = !updated[i];
                                    setAttendeeChecked(updated);
                                  }}
                                />
                                <span className="attendee-check-box" />
                              </label>
                              <span className={`attendee-name${!attending ? ' attendee-name--muted' : ''}`}>
                                {name}
                              </span>
                              <span className={`attendee-badge ${attending ? 'attendee-badge--yes' : 'attendee-badge--no'}`}>
                                {attending ? 'Asistirá' : 'No asistirá'}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Opciones Dietéticas por Persona */}
                    {(dietary.enabled && (dietary.options?.length ?? 0) > 0) && (() => {
                      // Personas que asistirán: titular + acompañantes marcados
                      const attendingNames = [
                        displayName,
                        ...attendeeNames.filter((_, i) => attendeeChecked[i] ?? true),
                      ];
                      return (
                        <div className="dlx-dietary-wrap">
                          <p className="label muted" style={{ marginBottom: '0.75rem', textAlign: 'center' }}>Restricción alimentaria</p>
                          {attendingNames.map((personName, pi) => (
                            <div key={pi} style={{ marginBottom: '1rem' }}>
                              <p style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem', textAlign: 'center' }}>
                                {personName}
                              </p>
                              <div className="dietary-details-container">
                                <details className="dietary-details">
                                  <summary className="dietary-summary">
                                    <span style={{ 
                                      whiteSpace: 'nowrap', 
                                      overflow: 'hidden', 
                                      textOverflow: 'ellipsis',
                                      maxWidth: '200px'
                                    }}>
                                      {dietaryMap[personName]?.length ? dietaryMap[personName].join(', ') : 'Seleccionar restricciones'}
                                    </span>
                                    <ChevronDown size={14} />
                                  </summary>
                                  <div className="dietary-options">
                                    {dietary.options!.map((opt) => {
                                      const isSelected = dietaryMap[personName]?.includes(opt);
                                      return (
                                        <label key={opt} className="dietary-option-label">
                                          <input 
                                            type="checkbox" 
                                            className="dietary-checkbox"
                                            checked={isSelected || false}
                                            onChange={(e) => {
                                              setDietaryMap(prev => {
                                                const current = prev[personName] || [];
                                                const updated = e.target.checked 
                                                  ? [...current, opt]
                                                  : current.filter(x => x !== opt);
                                                return { ...prev, [personName]: updated };
                                              });
                                            }}
                                          />
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
                      <p style={{ fontFamily: 'var(--font-jost)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', textAlign: 'center', padding: '0.75rem 1rem', border: '1px solid color-mix(in srgb, var(--gold), transparent 70%)', borderRadius: '4px' }}>
                        Vista previa · Los datos no se guardan
                      </p>
                    ) : (
                      <button
                        className="btn-submit"
                        onClick={handleSubmitRsvp}
                        disabled={submitting}
                      >
                        {submitting ? 'Guardando…' : 'Confirmar asistencia'}
                      </button>
                    )}
                    <button className="rsvp-change" onClick={() => { setGuestConfirmed(null); setAttendeeNames([]); setAttendeeChecked([]); setSubmitError(''); }}>
                      Cambiar respuesta
                    </button>
                  </div>
                ) : (
                  <div className="rsvp-confirmed">
                    <p className="rsvp-confirmed-text" style={{ color: '#9B8B78' }}>
                      Lamentamos no poder verte, gracias por avisarnos.
                    </p>
                    {isDemo ? (
                      <p style={{ fontFamily: 'var(--font-jost)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gold)', textAlign: 'center', padding: '0.75rem 1rem', border: '1px solid color-mix(in srgb, var(--gold), transparent 70%)', borderRadius: '4px' }}>
                        Vista previa · Los datos no se guardan
                      </p>
                    ) : (
                      <button
                        className="btn-submit"
                        onClick={handleSubmitRsvp}
                        disabled={submitting}
                      >
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
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Ornament() {
  return (
    <div className="ornament">
      <span className="sep-line" />
      <div className="ornament-motif">
        {/* Rombo pequeño izquierdo */}
        <svg width="8" height="8" viewBox="0 0 8 8">
          <polygon points="4,0 8,4 4,8 0,4" fill="none" stroke="#B8965A" strokeWidth="1" opacity="0.45" />
        </svg>
        {/* Estrella de 4 puntas central */}
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path
            d="M9 0 C9 0 9.6 5.4 12.4 5.6 C15.2 5.8 18 9 18 9 C18 9 15.2 12.2 12.4 12.4 C9.6 12.6 9 18 9 18 C9 18 8.4 12.6 5.6 12.4 C2.8 12.2 0 9 0 9 C0 9 2.8 5.8 5.6 5.6 C8.4 5.4 9 0 9 0 Z"
            fill="#B8965A"
            opacity="0.75"
          />
        </svg>
        {/* Rombo pequeño derecho */}
        <svg width="8" height="8" viewBox="0 0 8 8">
          <polygon points="4,0 8,4 4,8 0,4" fill="none" stroke="#B8965A" strokeWidth="1" opacity="0.45" />
        </svg>
      </div>
      <span className="sep-line" />
    </div>
  );
}
function WomenIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L9 7v3l-6 11h18l-6-11V7l-3-5z" />
      <path d="M9 10h6" />
    </svg>
  );
}
function MenIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2h16v20H4V2z" />
      <path d="M4 2l8 10 8-10" />
      <path d="M12 12v10" />
      <path d="M11 5l1 1 1-1-1-1-1 1z" />
    </svg>
  );
}
function NoChildrenIcon() {
  return <UserX size={40} color="var(--gold)" strokeWidth={1.4} style={{ flexShrink: 0 }} />;
}

function PinIcon() {
  return <MapPin size={12} color="var(--gold)" strokeWidth={1.6} style={{ flexShrink: 0, marginTop: '1px' }} />;
}
function MapsIcon() {
  return <MapPin size={13} strokeWidth={1.6} style={{ flexShrink: 0 }} />;
}
function PlayIcon() {
  return <Play size={14} />;
}
function PauseIcon() {
  return <Pause size={14} />;
}
function CalendarIcon() {
  return <CalendarDays size={15} style={{ flexShrink: 0 }} />;
}
function HotelIcon() {
  return <Hotel size={28} color="var(--gold)" strokeWidth={1.3} />;
}
function CarIcon() {
  return <Car size={28} color="var(--gold)" strokeWidth={1.3} />;
}
function EnvelopeIcon() {
  return <Mail size={44} color="var(--gold)" strokeWidth={1.4} />;
}
function EnvelopeSmallIcon() {
  return <Mail size={32} color="var(--gold)" strokeWidth={1.4} />;
}
function GiftIcon() {
  return <Gift size={40} color="var(--gold)" strokeWidth={1.4} />;
}

