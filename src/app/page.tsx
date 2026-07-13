'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Jost, Montserrat } from 'next/font/google';
import { Instagram } from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import { BASE_PRICES } from '@/lib/pricing';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jost',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-montserrat',
});

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '5200000000';
const WA_HREF = `https://wa.me/${WA_NUMBER}?text=Hola%20Moments%2C%20quiero%20cotizar%20mi%20invitaci%C3%B3n`;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M17.6 6.3A7.85 7.85 0 0 0 12 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1A7.9 7.9 0 0 0 12 19.9a7.95 7.95 0 0 0 5.6-13.6Zm-5.6 12.2a6.6 6.6 0 0 1-3.4-.9l-.24-.15-2.5.66.67-2.43-.16-.25a6.6 6.6 0 1 1 5.63 3.06Zm3.6-4.94c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.44.1-.5.64-.62.77-.23.15-.43.05a5.4 5.4 0 0 1-1.6-1 6 6 0 0 1-1.1-1.37c-.12-.2 0-.31.09-.41s.2-.23.3-.35a1.36 1.36 0 0 0 .2-.33.37.37 0 0 0 0-.35c0-.1-.44-1.06-.6-1.45s-.32-.33-.44-.34h-.37a.72.72 0 0 0-.52.24 2.17 2.17 0 0 0-.68 1.62a3.77 3.77 0 0 0 .79 2 8.63 8.63 0 0 0 3.3 2.92c.46.2.82.32 1.1.41a2.65 2.65 0 0 0 1.21.08 2 2 0 0 0 1.3-.92 1.6 1.6 0 0 0 .12-.92c-.05-.08-.18-.13-.38-.23Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 2 }}>
      <path d="M3.5 8.5l2.5 2.5 6-6.5" />
    </svg>
  );
}


export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    // Si hay hash en la URL (ej. /#faq desde otra página), revelar todo de inmediato
    if (window.location.hash) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('revealed'));
      const target = document.querySelector(window.location.hash);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.07, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    const onScroll = () => setNavScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --ivory:    #FAF7F2;
      --ivory-2:  #F2EDE6;
      --gold:     #B8965A;
      --gold-2:   #D4AA72;
      --charcoal: #1C1611;
      --warm-mid: #5C5248;
      --muted:    #E6DDD2;
      --muted-fg: #6B5D52;
    }
    .landing {
      --font-c: var(--font-cormorant), Georgia, serif;
      --font-j: var(--font-jost), system-ui, sans-serif;
      --font-m: var(--font-montserrat), system-ui, sans-serif;
    }

    .landing { font-family: var(--font-j); background: var(--ivory); color: var(--charcoal); }

    /* Reveal */
    .reveal { opacity: 0; }
    .reveal.revealed { opacity: 1; transform: none; }
    @media (prefers-reduced-motion: no-preference) {
      .reveal { transform: translateY(20px); transition: opacity 0.7s ease, transform 0.7s ease; }
      .reveal[data-d="1"] { transition-delay: 0.08s; }
      .reveal[data-d="2"] { transition-delay: 0.18s; }
      .reveal[data-d="3"] { transition-delay: 0.28s; }
    }

    .wrap { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

    /* Nav */
    .nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      background: var(--charcoal);
      opacity: 0; transform: translateY(-100%); pointer-events: none;
      transition: opacity 0.4s ease, transform 0.4s ease, box-shadow 0.4s;
    }
    .nav.scrolled {
      opacity: 1; transform: translateY(0); pointer-events: auto;
      box-shadow: 0 2px 20px rgba(0,0,0,0.4);
    }
    .nav__inner {
      max-width: 1100px; margin: 0 auto; padding: 0 24px;
      display: flex; align-items: center; gap: 40px; height: 64px;
    }
    .brand { text-decoration: none; }
    .brand__wordmark {
      font-family: var(--font-m); font-size: 18px; font-weight: 300;
      letter-spacing: 0.28em; color: white; text-transform: lowercase;
    }
    .nav__links { display: flex; align-items: center; gap: 28px; flex: 1; }
    .nav__links a {
      font-family: var(--font-j); font-size: 11px; font-weight: 500;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: rgba(255,255,255,0.55); text-decoration: none; transition: color 0.18s;
    }
    .nav__links a:hover { color: rgba(255,255,255,0.9); }
    .nav__links a:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; border-radius: 2px; }
    .nav__cta { display: flex; align-items: center; gap: 10px; margin-left: auto; }
    .nav__burger {
      display: none; flex-direction: column; justify-content: center; gap: 5px;
      width: 44px; height: 44px; background: none; border: none; cursor: pointer;
      padding: 10px; margin-left: auto; touch-action: manipulation;
    }
    .nav__burger span { display: block; width: 20px; height: 1.5px; background: rgba(255,255,255,0.8); }
    .nav__drawer {
      display: none; position: fixed; top: 64px; left: 0; right: 0;
      background: #111; border-bottom: 1px solid rgba(255,255,255,0.1);
      padding: 16px 24px 24px; flex-direction: column; gap: 2px; z-index: 99;
    }
    .nav__drawer.open { display: flex; }
    .nav__drawer a {
      font-family: var(--font-j); font-size: 14px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.75);
      text-decoration: none; padding: 13px 0; border-bottom: 1px solid rgba(255,255,255,0.08);
      transition: color 0.18s;
    }
    .nav__drawer a:last-child { border-bottom: none; }
    .nav__drawer a:hover { color: var(--gold); }

    /* Buttons */
    .btn {
      display: inline-flex; align-items: center; gap: 7px;
      font-family: var(--font-j); font-size: 11px; font-weight: 500;
      letter-spacing: 0.12em; text-transform: uppercase;
      padding: 12px 24px; border-radius: 100px; min-height: 44px;
      text-decoration: none; cursor: pointer; border: none;
      touch-action: manipulation;
      transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    }
    .btn:hover { opacity: 0.85; transform: translateY(-1px); }
    .btn:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
    .btn--ghost {
      background: transparent; color: rgba(255,255,255,0.75);
      border: 1px solid rgba(255,255,255,0.25);
    }
    .btn--ghost:hover { border-color: rgba(255,255,255,0.6); color: white; opacity: 1; transform: translateY(-1px); }
    .btn--gold { background: var(--gold); color: white; }
    .btn--gold:hover { box-shadow: 0 4px 20px rgba(184,150,90,0.4); opacity: 1; }
.btn--outline-dark {
      background: transparent; color: var(--charcoal);
      border: 1px solid rgba(28,22,17,0.25);
    }
    .btn--outline-dark:hover { border-color: var(--charcoal); opacity: 1; }
    .btn--block { display: flex; justify-content: center; width: 100%; }
    .wa-icon { width: 16px; height: 16px; flex-shrink: 0; }

    /* Section */
    .section { padding: 112px 0; border-top: 1px solid var(--muted); }
    .section--dark { background: var(--charcoal); color: rgba(250,247,242,0.92); border-top: none; }
    .section-head { margin-bottom: 72px; }
    .section-head.centered { text-align: center; }
    .section-cta { text-align: center; margin-top: 56px; }

    .eyebrow {
      display: block; font-size: 10.5px; font-weight: 500; letter-spacing: 0.32em;
      text-transform: uppercase; color: var(--gold); margin-bottom: 20px;
    }
    .eyebrow.centered { text-align: center; }

    h2 {
      font-family: var(--font-c); font-size: clamp(2.8rem, 6vw, 5rem);
      font-weight: 300; line-height: 1.08; margin-bottom: 28px;
    }
    h2 em { font-style: italic; color: var(--gold); font-weight: 400; }
    .section--dark h2 { color: white; }
    .lede {
      font-family: var(--font-c); font-size: 22px; font-weight: 300; font-style: italic;
      color: var(--muted-fg); line-height: 1.75; max-width: 640px;
    }
    .section--dark .lede { color: rgba(250,247,242,0.45); }
    .section-head.centered .lede { margin: 0 auto; }

    /* Scroll hint */
    @keyframes scrollBounce {
      0%, 100% { transform: translateY(0); opacity: 0.6; }
      50% { transform: translateY(8px); opacity: 1; }
    }
    .hero__scroll-hint {
      position: fixed; bottom: 36px; left: 0; right: 0; margin: 0 auto; width: fit-content;
      z-index: 2;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      color: rgba(250,247,242,0.45); font-family: var(--font-j);
      font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
      animation: scrollBounce 2s ease-in-out infinite;
      transition: opacity 0.4s;
    }
    .hero__scroll-hint svg { width: 18px; height: 18px; }
    .hero__scroll-hint.hidden { opacity: 0; pointer-events: none; animation: none; visibility: hidden; }

    /* Hero animations */
    @keyframes auraDrift {
      0%, 100% { transform: translateX(-50%) translateY(0px) scale(1); opacity: 0.7; }
      50% { transform: translateX(-50%) translateY(-24px) scale(1.05); opacity: 0.4; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    /* Hero */
    .hero {
      min-height: 100dvh; display: flex; align-items: center;
      position: relative; overflow: hidden;
      background: var(--charcoal); padding: 120px 0 80px;
    }
    .hero-bg {
      position: absolute; inset: 0; pointer-events: none; overflow: hidden;
    }
    .hero-bg__aura {
      position: absolute; top: -20%; left: 50%;
      width: 1000px; height: 1000px; border-radius: 50%;
      background: radial-gradient(circle at 50% 50%, rgba(184,150,90,0.12) 0%, transparent 65%);
      animation: auraDrift 10s ease-in-out infinite;
    }
    .hero-bg__noise {
      position: absolute; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: 0.04; mix-blend-mode: overlay;
    }

    .hero__inner {
      position: relative; z-index: 1; text-align: center;
      width: 100%; max-width: 780px; margin: 0 auto; padding: 0 24px;
    }
    .hero__wordmark {
      font-family: var(--font-m); font-size: clamp(3rem, 8vw, 6.5rem);
      font-weight: 300; display: block; margin-bottom: 32px;
      letter-spacing: 0.28em;
      background: linear-gradient(
        90deg,
        rgba(250,247,242,0.55) 0%,
        rgba(250,247,242,0.55) 30%,
        rgba(212,170,114,0.95) 50%,
        rgba(250,247,242,0.55) 70%,
        rgba(250,247,242,0.55) 100%
      );
      background-size: 200% auto;
      -webkit-background-clip: text; background-clip: text;
      -webkit-text-fill-color: transparent; color: transparent;
      animation: shimmer 5s linear infinite;
    }
    .hero__eyebrow {
      display: block; font-family: var(--font-j); font-size: 10px; font-weight: 500;
      letter-spacing: 0.28em; text-transform: uppercase; color: rgba(184,150,90,0.7);
      margin-bottom: 20px;
      animation: fadeUp 1s 0.1s ease both;
    }
    .hero__heading {
      font-family: var(--font-c); font-size: clamp(1.5rem, 4vw, 2.6rem);
      font-weight: 400; color: rgba(250,247,242,0.85); line-height: 1.25;
      margin-bottom: 20px;
      animation: fadeUp 1s 0.3s ease both;
    }
    .hero__sub {
      font-family: var(--font-c); font-size: clamp(1rem, 2vw, 1.2rem);
      font-weight: 300; font-style: italic;
      color: rgba(250,247,242,0.4); line-height: 1.75;
      max-width: 520px; margin: 0 auto 40px;
      animation: fadeUp 1s 0.45s ease both;
    }
    .hero__ctas {
      display: flex; justify-content: center; gap: 14px; flex-wrap: wrap;
      animation: fadeUp 1s 0.5s ease both;
    }


    /* Templates section */
    .templates-section { background: var(--ivory); }
    .templates-cards {
      display: grid; grid-template-columns: 1fr 1px 1fr; gap: 0; align-items: stretch;
    }
    .tpl-card { padding: 0 48px 0 0; display: flex; flex-direction: column; }
    .tpl-card:last-child { padding: 0 0 0 48px; }
    .tpl-card .btn { margin-top: auto; align-self: flex-start; }
    .tpl-card__divider { background: var(--muted); align-self: stretch; }
    .tpl-card__num {
      font-family: var(--font-c); font-size: 13px; font-weight: 300;
      letter-spacing: 0.12em; color: var(--gold); margin-bottom: 20px;
    }
    .tpl-card__title {
      font-family: var(--font-c); font-size: clamp(1.6rem, 2.5vw, 2.2rem);
      font-weight: 500; color: var(--charcoal); margin-bottom: 20px; line-height: 1.15;
    }
    .tpl-card__desc {
      font-family: var(--font-c); font-size: 17px; font-weight: 300; font-style: italic;
      color: var(--muted-fg); line-height: 1.8; margin-bottom: 28px;
    }
    .tpl-card__list {
      list-style: none; padding: 0; margin: 0 0 32px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .tpl-card__list li {
      font-family: var(--font-c); font-size: 16px; font-weight: 300; color: var(--charcoal);
      padding-left: 20px; position: relative; line-height: 1.5;
    }
    .tpl-card__list li::before {
      content: '—'; position: absolute; left: 0;
      color: var(--gold); font-weight: 300;
    }
    .tpl-card__link {
      font-family: var(--font-c); font-size: 15px; font-weight: 400;
      color: var(--gold); text-decoration: none; letter-spacing: 0.02em;
      border-bottom: 1px solid rgba(184,150,90,0.3); padding-bottom: 2px;
      transition: border-color 0.2s;
    }
    .tpl-card__link:hover { border-color: var(--gold); }

    /* Values */
    .values { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
    .value { text-align: center; }
    .value__mark {
      width: 56px; height: 56px; border: 1px solid var(--muted); border-radius: 50%;
      display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
    }
    .value__mark svg { width: 22px; height: 22px; color: var(--gold); }
    .value h3 { font-family: var(--font-c); font-size: 26px; font-weight: 400; margin-bottom: 12px; }
    .value p { font-family: var(--font-c); font-size: 17px; font-weight: 300; color: var(--muted-fg); line-height: 1.8; }

    /* Plans */
    .plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; align-items: stretch; }
    .plan {
      border: 1px solid rgba(250,247,242,0.1); border-radius: 4px;
      padding: 24px 22px 20px; position: relative;
      background: rgba(255,255,255,0.04);
      display: flex; flex-direction: column;
      transition: transform 0.25s cubic-bezier(0.25,1,0.5,1), box-shadow 0.25s ease;
    }
    .plan:hover {
      transform: translateY(-8px);
      box-shadow: 0 16px 48px rgba(0,0,0,0.35);
    }
    .plan--featured {
      border-color: var(--gold); background: rgba(184,150,90,0.07);
      box-shadow: 0 8px 40px rgba(184,150,90,0.15);
    }
    .plan--featured:hover {
      box-shadow: 0 20px 56px rgba(184,150,90,0.25);
    }
    .plan__badge {
      position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
      background: var(--gold); color: white;
      font-size: 9px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
      padding: 4px 18px; border-radius: 100px; white-space: nowrap; font-family: var(--font-j);
    }
    .plan__name {
      font-family: var(--font-c); font-size: 26px; font-weight: 400;
      color: rgba(250,247,242,0.9); margin-bottom: 4px;
    }
    .plan__desc { font-family: var(--font-c); font-size: 14px; font-style: italic; font-weight: 300; color: rgba(184,150,90,0.6); margin-bottom: 14px; }
    .plan__price { display: flex; align-items: baseline; gap: 2px; margin-bottom: 2px; }
    .plan__price .cur { font-size: 14px; color: rgba(250,247,242,0.4); font-family: var(--font-j); }
    .plan__price .amt {
      font-family: var(--font-c); font-size: 32px; font-weight: 400;
      color: rgba(250,247,242,0.92); line-height: 1;
    }
    .plan__price .period { font-size: 10px; color: rgba(250,247,242,0.35); font-family: var(--font-j); }
    .plan__free { display: block; font-size: 9.5px; color: rgba(184,150,90,0.65); margin-bottom: 16px; letter-spacing: 0.04em; }
    .plan__feats { list-style: none; margin-bottom: 20px; display: flex; flex-direction: column; gap: 7px; flex: 1; }
    .plan__feats li {
      display: flex; align-items: flex-start; gap: 8px;
      font-family: var(--font-c); font-size: 14px; font-weight: 300; color: rgba(250,247,242,0.72); line-height: 1.4;
    }
    .plan__feats svg { color: var(--gold); flex-shrink: 0; margin-top: 3px; }
    .plan .btn--ghost { color: rgba(250,247,242,0.7); border-color: rgba(250,247,242,0.18); }
    .plan .btn--ghost:hover { border-color: var(--gold); color: var(--gold); }

    /* Steps */
    .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 48px; position: relative; }
    .step__num {
      font-family: var(--font-c); font-size: 42px; font-weight: 400;
      color: var(--muted); line-height: 1; margin-bottom: 18px;
      padding-bottom: 18px; border-bottom: 1px solid var(--muted);
      display: block;
    }
    .step h3 { font-family: var(--font-c); font-size: 26px; font-weight: 400; margin-bottom: 12px; }
    .step p { font-family: var(--font-c); font-size: 17px; font-weight: 300; color: var(--muted-fg); line-height: 1.75; }

    /* FAQ */
    .faq { max-width: 720px; margin: 0 auto; }
    .faq__item { border-bottom: 1px solid var(--muted); }
    .faq__q {
      width: 100%; display: flex; justify-content: space-between; align-items: flex-start;
      gap: 16px; padding: 24px 0; background: none; border: none; cursor: pointer;
      font-family: var(--font-c); font-size: 19px; font-weight: 400; color: var(--charcoal);
      text-align: left;
    }
    .faq__icon { flex-shrink: 0; margin-top: 2px; }
    .faq__icon svg { width: 18px; height: 18px; }
    .faq__q:focus-visible { outline: 2px solid var(--gold); outline-offset: -2px; }
    .faq__a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s ease; }
    .faq__item.open .faq__a { grid-template-rows: 1fr; }
    .faq__a-inner { overflow: hidden; }
    .faq__a-inner-pad { padding-bottom: 24px; font-family: var(--font-c); font-size: 17px; font-style: italic; font-weight: 300; color: var(--muted-fg); line-height: 1.8; }

    /* CTA band */
    .ctaband {
      background: var(--charcoal); text-align: center; padding: 112px 0;
      border-top: none;
    }
    .ctaband__sub {
      font-size: 12px; font-weight: 300; color: rgba(184,150,90,0.7);
      letter-spacing: 0.1em; margin-bottom: 12px;
    }
    .ctaband h2 {
      font-family: var(--font-c); font-size: clamp(2.4rem, 5.5vw, 4rem);
      font-weight: 400; color: white; margin-bottom: 16px; line-height: 1.1;
    }
    .ctaband p { font-family: var(--font-c); font-size: 20px; font-style: italic; font-weight: 300; color: rgba(250,247,242,0.45); margin-bottom: 40px; }
    .ctaband__ctas { display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; }

    /* Footer */
    .footer { background: #111; padding: 32px 0; border-top: 1px solid rgba(255,255,255,0.08); }
    .footer__simple {
      display: grid; grid-template-columns: 1fr auto 1fr;
      align-items: center;
    }
    .footer__copy { justify-self: start; }
    .footer__links { justify-self: end; }
    .footer__wordmark {
      font-family: var(--font-m); font-size: 16px; font-weight: 300;
      letter-spacing: 0.26em; color: rgba(250,247,242,0.4);
    }
    .footer__links {
      display: flex; align-items: center; gap: 24px;
    }
    .footer__links a {
      font-family: var(--font-j); font-size: 10.5px; font-weight: 400;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: rgba(250,247,242,0.35); text-decoration: none; transition: color 0.18s;
      display: flex;
    }
    .footer__links a:hover { color: var(--gold); }
    .footer-wa-icon { width: 30px; height: 30px; }
    .footer__copy {
      font-size: 11px; font-weight: 300; color: rgba(250,247,242,0.2);
    }

    /* Mobile nav */
    @media (max-width: 900px) {
      .nav__links { display: none; }
      .nav__cta .btn--ghost { display: none; }
      .nav__burger { display: flex; }
    }

    /* Tablet */
    @media (max-width: 768px) {
      .section { padding: 80px 0; }
      .templates-cards { grid-template-columns: 1fr; }
      .tpl-card__divider { display: none; }
      .tpl-card, .tpl-card:last-child { padding: 0 0 48px; border-bottom: 1px solid var(--muted); }
      .tpl-card:last-child { padding-bottom: 0; border-bottom: none; }
      .values { grid-template-columns: 1fr 1fr; gap: 28px; }
      .steps { grid-template-columns: 1fr; gap: 36px; }
      .step__line { display: none; }
    }

    /* Mobile */
    @media (max-width: 580px) {
      .section { padding: 64px 0; }
      .wrap { padding: 0 18px; }
      .tpl-card, .tpl-card:last-child { padding: 0 0 36px; }
      .tpl-card:last-child { padding-bottom: 0; }
      .values { grid-template-columns: 1fr; gap: 36px; }
      .plans { grid-template-columns: 1fr; }
      .footer__links { gap: 16px; }
      h2 { font-size: 2.4rem; }
      .ctaband { padding: 80px 0; }
      .ctaband h2 { font-size: 2rem; }
      .hero__wordmark { letter-spacing: 0.2em; }
    }
  `;

  const faqs = [
    {
      q: '¿Cuánto tiempo tarda en estar lista mi invitación?',
      a: 'Una vez que eliges plantilla y nos compartes tus datos, la primera versión está lista en 3 a 5 días hábiles. Después afinamos juntos los detalles hasta que quede exactamente como la imaginaste.',
    },
    {
      q: '¿Puedo agregar mi lista de invitados y gestionar confirmaciones?',
      a: 'Sí. Los planes Plus y Deluxe incluyen confirmación de asistencia (RSVP) con conteo de boletos, acompañantes y mensajes de tus invitados, todo organizado en un panel de control.',
    },
    {
      q: '¿Cuánto tiempo está disponible mi invitación?',
      a: 'Todos los planes incluyen 1 mes gratis de publicación a partir de la fecha de tu evento. Después puedes extenderla por meses adicionales o de forma permanente a precios accesibles.',
    },
    {
      q: '¿Puedo agregar mesa de regalos y datos bancarios?',
      a: 'Sí. Los planes Plus y Deluxe incluyen una sección de mesa de regalos donde puedes listar tiendas, links de registro y datos bancarios para transferencias — todo integrado en la misma invitación.',
    },
  ];

  const plans = [
    {
      name: 'Essential',
      desc: 'Lo esencial, con muy buen gusto.',
      price: BASE_PRICES.essential,
      feats: [
        'Diseño de plantilla premium',
        'Portada con frase, cita y nombres',
        'Foto principal + hasta 5 imágenes',
        'Itinerario estático y dress code',
        'Mesa de regalos y datos bancarios',
        'Confirmación vía WhatsApp directo',
      ],
      cta: 'Elegir Essential',
      featured: false,
    },
    {
      name: 'Plus',
      desc: 'El equilibrio perfecto entre detalle y precio.',
      price: BASE_PRICES.plus,
      feats: [
        'Todo lo de Essential',
        'Carrusel de fotos (5 a 10 imágenes)',
        'Cuenta regresiva animada',
        'Itinerario animado y Google Maps',
        'RSVP con formulario en modal + acompañantes',
        'Dashboard: confirmados, pendientes y declinaron',
        'Control de cupo máximo global',
      ],
      cta: 'Elegir Plus',
      featured: false,
    },
    {
      name: 'Deluxe',
      desc: 'Una pieza de autor, totalmente a medida.',
      price: BASE_PRICES.deluxe,
      feats: [
        'Todo lo de Plus',
        'Loader animado personalizado',
        'Música de fondo en la invitación',
        'Carrusel automático a lo largo de la página',
        'Link único por invitado con RSVP pre-cargado',
        'Dashboard individual con cupo por persona',
        'Reenvío de links únicos desde el panel',
        'Botón para agendar en Google Calendar',
      ],
      cta: 'Elegir Deluxe',
      featured: true,
    },
  ];

  return (
    <div className={`${cormorant.variable} ${jost.variable} ${montserrat.variable} landing`}>
      <style suppressHydrationWarning>{css}</style>

      <SiteHeader mode="fixed" scrolled={navScrolled} />

      {/* Hero */}
      <header className="hero" id="top">
        <div className="hero-bg" aria-hidden="true">
          <span className="hero-bg__aura" />
          <div className="hero-bg__noise" />
        </div>
        <div className="hero__inner">
          <span className="hero__wordmark">moments</span>
          <span className="hero__eyebrow">Invitaciones digitales</span>
          <h1 className="hero__heading">Una invitación tan única como su boda.</h1>
          <div className="hero__ctas">
            <Link className="btn btn--gold" href="/plantillas">Ver plantillas</Link>
            <a className="btn btn--ghost" href={WA_HREF} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="wa-icon" />
              Cotizar por WhatsApp
            </a>
          </div>
        </div>
        <div className={`hero__scroll-hint${navScrolled ? ' hidden' : ''}`} aria-hidden="true">
          <span>desliza</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </header>


      {/* ¿Qué es? */}
      <section className="section" id="que-es">
        <div className="wrap">
          <div className="section-head centered reveal">
            <span className="eyebrow centered">¿Qué es Moments?</span>
            <h2>Tu boda anunciada con la <em>elegancia que merece</em>.</h2>
            <p className="lede">Olvídate de las invitaciones genéricas. Creamos una pieza digital única, hecha a tu medida, que tus invitados abren con un solo toque.</p>
          </div>
          <div className="values">
            <div className="value reveal" data-d="1">
              <div className="value__mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="7" y="3" width="10" height="18" rx="2.5" />
                  <line x1="10.5" y1="18.2" x2="13.5" y2="18.2" />
                </svg>
              </div>
              <h3>Digital</h3>
              <p>Un enlace elegante que se ve impecable en cualquier celular. Lo compartes por WhatsApp y tus invitados confirman al instante.</p>
            </div>
            <div className="value reveal" data-d="2">
              <div className="value__mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <rect x="6.5" y="6.5" width="11" height="11" transform="rotate(45 12 12)" />
                </svg>
              </div>
              <h3>Elegante</h3>
              <p>Tipografía fina, paletas sobrias y composición cuidada. Cada detalle está pensado para sentirse premium, nunca recargado ni cursi.</p>
            </div>
            <div className="value reveal" data-d="3">
              <div className="value__mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M8.5 12.2l2.2 2.2 4.8-5" />
                </svg>
              </div>
              <h3>Sin estrés</h3>
              <p>Nosotros nos encargamos del diseño y la parte técnica. Tú solo apruebas. Una cosa menos en tu lista, justo cuando más cosas tienes que organizar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates section */}
      <section className="section templates-section" id="plantillas">
        <div className="wrap">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span className="eyebrow centered">Plantillas</span>
            <h2>Tu historia, <em>tu diseño</em>.</h2>
            <p className="lede" style={{ margin: '0 auto' }}>
              Cada plantilla es un lienzo en blanco. Tú pones los nombres, las fechas,
              las fotos y los detalles; nosotros nos encargamos de que todo se vea impecable.
            </p>
          </div>

          <div className="templates-cards">
            {/* Card 1 */}
            <div className="tpl-card">
              <div className="tpl-card__num">01</div>
              <h3 className="tpl-card__title">Plantillas base</h3>
              <p className="tpl-card__desc">
                Elige una de nuestras colecciones de diseño — Classic o Elegance — y personaliza
                cada detalle: nombres, fecha, lugar, itinerario, fotos, dress code, mesa de regalos
                y más. El diseño ya está listo; solo lo haces tuyo.
              </p>
              <ul className="tpl-card__list">
                <li>Colores y tipografía definidos por colección</li>
                <li>Tu información en todos los campos</li>
                <li>Fotos propias de la pareja</li>
                <li>Disponible en los tres planes</li>
              </ul>
              <Link href="/plantillas" className="btn btn--outline-dark">Ver demos en vivo</Link>
            </div>

            <div className="tpl-card__divider" />

            {/* Card 2 */}
            <div className="tpl-card">
              <div className="tpl-card__num">02</div>
              <h3 className="tpl-card__title">Diseño desde cero</h3>
              <p className="tpl-card__desc">
                ¿Tienes una visión propia? Diseñamos tu invitación de principio a fin:
                paleta de colores exclusiva, tipografía a tu gusto, animaciones y estructura
                únicas. Una pieza irrepetible, hecha solo para tu boda.
              </p>
              <ul className="tpl-card__list">
                <li>Concepto visual único</li>
                <li>Paleta y tipografía a medida</li>
                <li>Animaciones y detalles exclusivos</li>
                <li>Costo adicional según complejidad</li>
              </ul>
              <a href={WA_HREF} target="_blank" rel="noopener noreferrer" className="btn btn--gold">Cotizar diseño a medida</a>
            </div>
          </div>
        </div>
      </section>

      {/* Planes */}
      <section className="section section--dark" id="planes">
        <div className="wrap">
          <div className="section-head centered reveal">
            <span className="eyebrow centered">Planes y precios</span>
            <h2>Un precio claro. Pago único.</h2>
            <p className="lede">El plan no define tu diseño — cualquier colección funciona en cualquier plan. Lo que cambia son las funciones. Todos incluyen <strong style={{ color: 'rgba(250,247,242,0.7)' }}>1 mes gratis de publicación</strong>.</p>
          </div>
          <div className="plans">
            {plans.map((plan, i) => (
              <article key={plan.name} className={`plan reveal${plan.featured ? ' plan--featured' : ''}`} data-d={String(i + 1)}>
                {plan.featured && <span className="plan__badge">★ Más popular</span>}
                <div className="plan__name">{plan.name}</div>
                <p className="plan__desc">{plan.desc}</p>
                <div className="plan__price">
                  <span className="cur">$</span>
                  <span className="amt">{plan.price.toLocaleString('es-MX')}</span>
                  <span className="period">&nbsp;MXN</span>
                </div>
                <span className="plan__free">Incluye 1 mes gratis de publicación</span>
                <ul className="plan__feats">
                  {plan.feats.map((f) => (
                    <li key={f}><CheckIcon />{f}</li>
                  ))}
                </ul>
                <a
                  className={`btn btn--block${plan.featured ? ' btn--gold' : ' btn--ghost'}`}
                  href={WA_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {plan.cta}
                </a>
              </article>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/planes" target="_blank" className="btn btn--ghost" style={{ display: 'inline-flex' }}>
              Ver comparativo completo de planes →
            </Link>
          </div>
          <p style={{ textAlign: 'center', marginTop: '32px', fontFamily: 'var(--font-c)', fontSize: '14px', fontStyle: 'italic', color: 'rgba(250,247,242,0.35)' }}>
            * La carga de datos puede realizarla el organizador desde su panel o solicitarla a Moments con costo adicional, sujeto a disponibilidad.
          </p>
        </div>
      </section>

      {/* Cómo funciona */}
      {/* Cómo funciona */}
      <section className="section" id="como">
        <div className="wrap">
          <div className="section-head centered reveal">
            <span className="eyebrow centered">Proceso</span>
            <h2>Tu invitación en <em>tres pasos</em>.</h2>
          </div>
          <div className="steps">
            <div className="step reveal" data-d="1">
              <div className="step__num">01</div>
              <h3>Elige tu estilo</h3>
              <p>Explora nuestra colección editorial y elige la plantilla que mejor refleje la personalidad de su boda.</p>
            </div>
            <div className="step reveal" data-d="2">
              <div className="step__num">02</div>
              <h3>Personaliza</h3>
              <p>Nos compartes nombres, fecha, lugar y fotos. Configuramos y ajustamos cada detalle hasta que quede perfecto.</p>
            </div>
            <div className="step reveal" data-d="3">
              <div className="step__num">03</div>
              <h3>Comparte</h3>
              <p>Recibes un enlace personalizado para enviar por WhatsApp. Tus invitados confirman en un solo toque.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="wrap">
          <div className="section-head centered reveal">
            <span className="eyebrow centered">Preguntas frecuentes</span>
            <h2>Todo lo que necesitas saber.</h2>
          </div>
          <div className="faq reveal">
            {faqs.map((item, i) => (
              <div key={i} className={`faq__item${openFaq === i ? ' open' : ''}`}>
                <button
                  className="faq__q"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {item.q}
                  <span className="faq__icon">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                      <line x1="3" y1="10" x2="17" y2="10" />
                      <line
                        x1="10" y1="3" x2="10" y2="17"
                        style={{ transformOrigin: 'center', transform: openFaq === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.25s' }}
                      />
                    </svg>
                  </span>
                </button>
                <div className="faq__a">
                  <div className="faq__a-inner">
                    <div className="faq__a-inner-pad">{item.a}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="section ctaband">
        <div className="wrap">
          <div className="reveal">
            <h2>Comienza a escribir tu<br /><em>historia</em> hoy mismo.</h2>
            <p>Cuéntanos de tu boda y te enviamos una cotización sin compromiso, hoy mismo.</p>
            <div className="ctaband__ctas">
              <a className="btn btn--gold" href={WA_HREF} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="wa-icon" />
                Solicitar diseño
              </a>
              <Link className="btn btn--ghost" href="/plantillas">Ver demo en vivo</Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
