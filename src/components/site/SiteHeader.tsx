'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Montserrat, Jost } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-montserrat' });
const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-jost' });

const LINKS = [
  { label: 'Inicio',        href: '/' },
  { label: 'Cómo funciona', href: '/#como' },
  { label: 'Plantillas',    href: '/plantillas' },
  { label: 'Planes',        href: '/planes' },
  { label: 'Preguntas',     href: '/#faq' },
];

interface SiteHeaderProps {
  /** 'fixed' con scroll-reveal (landing). 'sticky' siempre visible (otras páginas). */
  mode?: 'fixed' | 'sticky';
  scrolled?: boolean;
}

export default function SiteHeader({ mode = 'sticky', scrolled = false }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const css = `
    .sh-nav {
      top: 0; left: 0; right: 0; z-index: 100;
      background: #1C1611;
      box-shadow: 0 2px 20px rgba(0,0,0,0.4);
    }
    .sh-nav--fixed  { position: fixed; opacity: 0; transform: translateY(-100%); pointer-events: none; transition: opacity 0.4s ease, transform 0.4s ease; }
    .sh-nav--sticky { position: sticky; }
    .sh-nav--fixed.sh-nav--visible { opacity: 1; transform: translateY(0); pointer-events: auto; }
    .sh-nav__inner {
      max-width: 1100px; margin: 0 auto; padding: 0 24px;
      display: flex; align-items: center; gap: 40px; height: 64px;
    }
    .sh-brand { text-decoration: none; }
    .sh-brand__wordmark {
      font-family: var(--font-montserrat), 'Montserrat', system-ui, sans-serif;
      font-size: 18px; font-weight: 300; letter-spacing: 0.28em;
      color: white; text-transform: lowercase;
    }
    .sh-links { display: flex; align-items: center; gap: 28px; flex: 1; }
    .sh-links a {
      font-family: var(--font-jost), system-ui, sans-serif;
      font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
      color: rgba(255,255,255,0.55); text-decoration: none; transition: color 0.18s;
    }
    .sh-links a:hover { color: rgba(255,255,255,0.9); }
    .sh-cta { margin-left: auto; }
    .sh-btn {
      display: inline-flex; align-items: center;
      font-family: var(--font-jost), system-ui, sans-serif;
      font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
      padding: 12px 24px; border-radius: 100px; min-height: 44px;
      text-decoration: none; cursor: pointer; border: none; touch-action: manipulation;
      transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
      background: #B8965A; color: white;
    }
    .sh-btn:hover { box-shadow: 0 4px 20px rgba(184,150,90,0.4); }
    .sh-burger {
      display: none; flex-direction: column; justify-content: center; gap: 5px;
      width: 44px; height: 44px; background: none; border: none; cursor: pointer;
      padding: 10px; margin-left: auto; touch-action: manipulation;
    }
    .sh-burger span { display: block; width: 20px; height: 1.5px; background: rgba(255,255,255,0.8); }
    .sh-drawer {
      display: none; position: fixed; top: 64px; left: 0; right: 0;
      background: #111; border-bottom: 1px solid rgba(255,255,255,0.1);
      padding: 16px 24px 24px; flex-direction: column; gap: 2px; z-index: 99;
    }
    .sh-drawer.open { display: flex; }
    .sh-drawer a {
      font-family: var(--font-jost), system-ui, sans-serif;
      font-size: 14px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
      color: rgba(255,255,255,0.75); text-decoration: none;
      padding: 13px 0; border-bottom: 1px solid rgba(255,255,255,0.08); transition: color 0.18s;
    }
    .sh-drawer a:last-child { border-bottom: none; }
    .sh-drawer a:hover { color: #B8965A; }
    @media (max-width: 768px) {
      .sh-links { display: none; }
      .sh-cta { display: none; }
      .sh-burger { display: flex; }
    }
  `;

  const navClass = [
    'sh-nav',
    mode === 'fixed' ? 'sh-nav--fixed' : 'sh-nav--sticky',
    mode === 'fixed' && scrolled ? 'sh-nav--visible' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`${montserrat.variable} ${jost.variable}`}>
      <style suppressHydrationWarning>{css}</style>
      <nav className={navClass}>
        <div className="sh-nav__inner">
          <Link className="sh-brand" href="/">
            <span className="sh-brand__wordmark">moments</span>
          </Link>
          <div className="sh-links">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
          </div>
          <div className="sh-cta">
            <Link className="sh-btn" href="/cotizar">Cotizar</Link>
          </div>
          <button
            className="sh-burger"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span /><span /><span />
          </button>
        </div>
        <div className={`sh-drawer${menuOpen ? ' open' : ''}`}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</Link>
          ))}
          <Link href="/cotizar" onClick={() => setMenuOpen(false)}>Cotizar</Link>
        </div>
      </nav>
    </div>
  );
}
