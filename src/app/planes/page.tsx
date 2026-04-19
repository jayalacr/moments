'use client';

import { Cormorant_Garamond, Jost } from 'next/font/google';
import { Check, Minus, Sparkles, Star, Crown } from 'lucide-react';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
});

// ── Data ────────────────────────────────────────────────────────────────────

type Val = true | false | string;

interface Feature {
  label: string;
  essential: Val;
  plus: Val;
  deluxe: Val;
  note?: { essential?: string; plus?: string; deluxe?: string };
}

interface Section {
  title: string;
  features: Feature[];
}

const sections: Section[] = [
  {
    title: 'Presentación',
    features: [
      {
        label: 'Apartado inicial',
        essential: 'Frase, cita, nombres y padres',
        plus: 'Frase, cita, nombres y padres',
        deluxe: 'Frase, cita, nombres y padres',
      },
      {
        label: 'Loader animado',
        essential: false,
        plus: false,
        deluxe: 'Animación de entrada personalizada',
      },
      {
        label: 'Cuenta regresiva',
        essential: false,
        plus: true,
        deluxe: true,
      },
      {
        label: 'Música de fondo',
        essential: false,
        plus: false,
        deluxe: true,
      },
    ],
  },
  {
    title: 'Fotos',
    features: [
      {
        label: 'Imágenes en la invitación',
        essential: 'Hasta 5 imágenes',
        plus: 'De 5 a 10 imágenes',
        deluxe: 'Imágenes ilimitadas',
        note: {
          essential: '5 imágenes + portada',
          plus: 'De 5 a 10 imágenes + portada',
          deluxe: 'A lo largo de la invitación',
        },
      },
    ],
  },
  {
    title: 'Logística',
    features: [
      {
        label: 'Itinerario',
        essential: 'Estático',
        plus: 'Animado',
        deluxe: 'Animado',
      },
      {
        label: 'Ubicaciones',
        essential: false,
        plus: 'Google Maps interactivo',
        deluxe: 'Google Maps interactivo',
      },
      {
        label: 'Dress code',
        essential: true,
        plus: true,
        deluxe: true,
      },
      {
        label: 'Boda destino',
        essential: false,
        plus: 'Hoteles y transporte',
        deluxe: 'Hoteles y transporte',
      },
      {
        label: 'Agendar en Google Calendar',
        essential: false,
        plus: false,
        deluxe: true,
      },
    ],
  },
  {
    title: 'Regalos',
    features: [
      {
        label: 'Datos de transferencia',
        essential: true,
        plus: true,
        deluxe: true,
        note: { essential: 'Banco, cuenta, CLABE', plus: 'Banco, cuenta, CLABE', deluxe: 'Banco, cuenta, CLABE' },
      },
      {
        label: 'Mesa de regalos',
        essential: 'Link externo',
        plus: 'Link externo',
        deluxe: 'Link externo',
      },
      {
        label: 'Sobre de regalo',
        essential: true,
        plus: true,
        deluxe: true,
      },
    ],
  },
  {
    title: 'Confirmación de asistencia',
    features: [
      {
        label: 'Tipo de confirmación',
        essential: 'Botón a WhatsApp',
        plus: 'Formulario interno',
        deluxe: 'Formulario interno personalizado',
        note: {
          essential: 'Mensaje pre-escrito',
          plus: 'El invitado escribe su nombre',
          deluxe: 'Datos del invitado pre-cargados',
        },
      },
      {
        label: 'Control de acompañantes',
        essential: false,
        plus: 'Máximo global',
        deluxe: 'Por invitado individual',
        note: {
          plus: 'El organizador define el límite',
          deluxe: 'Cupo asignado por persona',
        },
      },
      {
        label: 'Panel de confirmaciones',
        essential: false,
        plus: 'Conteo general',
        deluxe: 'Dashboard completo',
        note: {
          plus: 'Confirmados / Pendientes / Declinaron',
          deluxe: 'Estado individual + reenvío de links',
        },
      },
    ],
  },
];

// ── Cell renderer ───────────────────────────────────────────────────────────

function Cell({ val, note, tier }: { val: Val; note?: string; tier: 'e' | 'p' | 'd' }) {
  const colors = {
    e: { dot: '#9B8B78', text: '#5C5248' },
    p: { dot: '#B8965A', text: '#3D2E1A' },
    d: { dot: '#8B6030', text: '#3D2E1A' },
  }[tier];

  if (val === false) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <Minus size={15} color="#C9C0B5" strokeWidth={2} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span style={{ fontSize: '12px', color: '#B0A89E', fontFamily: 'var(--font-jost)' }}>No incluido</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
      <Check size={15} color={colors.dot} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        <span style={{ fontSize: '12.5px', color: colors.text, fontFamily: 'var(--font-jost)', lineHeight: '1.45' }}>
          {val === true ? 'Incluido' : val}
        </span>
        {note && (
          <span style={{ display: 'block', fontSize: '10.5px', color: '#9B8B78', marginTop: '2px', fontFamily: 'var(--font-jost)', fontWeight: 300 }}>
            {note}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function PlanesPage() {
  const css = `
    :root {
      --ivory: #FAF7F2;
      --gold: #B8965A;
      --charcoal: #1C1611;
      --muted: #E6DDD2;
      --muted-fg: #9B8B78;
    }

    .planes-root {
      font-family: var(--font-jost), system-ui, sans-serif;
      background: var(--ivory);
      color: var(--charcoal);
      min-height: 100dvh;
    }

    /* ── Hero ── */
    .planes-hero {
      text-align: center;
      padding: 72px 24px 56px;
      position: relative;
    }
    .planes-hero::before {
      content: '';
      position: absolute;
      top: 0; left: 50%;
      transform: translateX(-50%);
      width: 1px; height: 52px;
      background: linear-gradient(to bottom, transparent, var(--gold));
    }
    .planes-wordmark {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: 13px;
      font-weight: 400;
      letter-spacing: 0.45em;
      text-transform: uppercase;
      color: var(--gold);
      margin-bottom: 20px;
    }
    .planes-title {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: clamp(2.4rem, 5.5vw, 4rem);
      font-weight: 300;
      line-height: 1.1;
      color: var(--charcoal);
      margin-bottom: 20px;
    }
    .planes-title em {
      font-style: italic;
      color: var(--gold);
    }
    .planes-sub {
      font-size: 14px;
      font-weight: 300;
      color: var(--muted-fg);
      max-width: 460px;
      margin: 0 auto;
      line-height: 1.75;
    }
    .planes-ornament {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: center;
      margin: 24px auto 0;
      max-width: 200px;
      opacity: 0.5;
    }
    .planes-ornament-line {
      flex: 1;
      height: 1px;
      background: var(--gold);
    }

    /* ── Wrap ── */
    .planes-wrap {
      max-width: 1020px;
      margin: 0 auto;
      padding: 0 20px 96px;
    }

    /* ── Sticky plan header ── */
    .plans-header {
      position: sticky;
      top: 0;
      z-index: 10;
      display: grid;
      grid-template-columns: 200px repeat(3, minmax(0, 1fr));
      background: var(--ivory);
      border-bottom: 1px solid var(--muted);
      padding-bottom: 0;
      box-shadow: 0 4px 24px rgba(28,22,17,0.06);
    }
    .ph-spacer { width: 200px; }
    .ph-plan {
      padding: 20px 16px 18px;
      text-align: center;
      position: relative;
      border-top: 2px solid transparent;
    }
    .ph-plan.e { border-top-color: var(--muted); background: #F5F1EC; }
    .ph-plan.p { border-top-color: var(--gold); background: #FDFBF7; }
    .ph-plan.d { border-top-color: #8B6030; background: #F7F2EA; }

    .ph-badge {
      position: absolute;
      top: -12px; left: 50%;
      transform: translateX(-50%);
      background: var(--gold);
      color: white;
      font-size: 9px;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 3px 10px;
      border-radius: 20px;
      white-space: nowrap;
      font-family: var(--font-jost);
    }
    .ph-icon-wrap {
      width: 34px; height: 34px;
      border-radius: 50%;
      margin: 0 auto 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .ph-icon-wrap.e { background: #EAE4DB; }
    .ph-icon-wrap.p { background: rgba(184,150,90,0.15); }
    .ph-icon-wrap.d { background: rgba(139,96,48,0.18); }

    .ph-name {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: 20px;
      font-weight: 400;
      color: var(--charcoal);
      margin-bottom: 2px;
    }
    .ph-desc {
      font-size: 10px;
      font-weight: 300;
      color: var(--muted-fg);
      letter-spacing: 0.05em;
      font-family: var(--font-jost);
    }

    /* ── Table ── */
    .plans-table {
      border: 1px solid var(--muted);
      border-top: none;
      border-radius: 0 0 16px 16px;
      overflow: hidden;
    }

    /* Section divider */
    .sec-div {
      background: var(--charcoal);
      padding: 7px 20px;
    }
    .sec-div-label {
      font-size: 9px;
      font-weight: 500;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(184,150,90,0.75);
      font-family: var(--font-jost);
    }

    /* Feature row */
    .feat-row {
      display: grid;
      grid-template-columns: 200px repeat(3, minmax(0, 1fr));
      border-top: 1px solid var(--muted);
    }
    .feat-row:hover { background: rgba(184,150,90,0.025); }

    .feat-label {
      padding: 13px 20px;
      font-size: 12px;
      color: var(--muted-fg);
      font-weight: 400;
      font-family: var(--font-jost);
      display: flex;
      align-items: flex-start;
      padding-top: 14px;
      line-height: 1.45;
    }
    .feat-cell {
      padding: 12px 16px;
    }
    .feat-cell.e { background: #F5F1EC; }
    .feat-cell.p { background: #FDFBF7; border-left: 1px solid rgba(184,150,90,0.35); border-right: 1px solid rgba(184,150,90,0.35); }
    .feat-cell.d { background: #F7F2EA; }

    /* Footer row */
    .plans-footer {
      display: grid;
      grid-template-columns: 200px repeat(3, minmax(0, 1fr));
      border-top: 1px solid var(--muted);
    }
    .pf-spacer { padding: 20px; }
    .pf-cell {
      padding: 20px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .pf-cell.e { background: #F5F1EC; border-radius: 0 0 0 16px; }
    .pf-cell.p { background: #FDFBF7; border-left: 1.5px solid var(--gold); border-right: 1.5px solid var(--gold); border-bottom: 1.5px solid var(--gold); border-radius: 0 0 12px 12px; }
    .pf-cell.d { background: #F7F2EA; border-radius: 0 0 16px 0; }

    .btn-cta {
      display: inline-block;
      font-family: var(--font-jost), system-ui, sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 9px 20px;
      border-radius: 100px;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.2s;
      border: none;
      outline: none;
    }
    .btn-cta:hover { opacity: 0.82; transform: translateY(-1px); }
    .btn-e { background: var(--muted); color: #5C5248; }
    .btn-p { background: var(--gold); color: white; }
    .btn-d { background: var(--charcoal); color: rgba(184,150,90,0.9); }

    .btn-example {
      font-size: 10px;
      color: var(--gold);
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s;
      margin-top: 10px;
      display: inline-block;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .btn-example:hover {
      border-bottom-color: var(--gold);
    }

    .plans-note {
      text-align: center;
      padding: 32px 24px 0;
      font-size: 12px;
      color: var(--muted-fg);
      font-weight: 300;
      font-family: var(--font-jost);
    }
    .plans-note span { color: var(--gold); }

    /* ── Mobile ── */
    @media (max-width: 720px) {
      .plans-header,
      .sec-div,
      .feat-row,
      .plans-footer {
        grid-template-columns: 1fr;
      }
      .ph-spacer,
      .feat-label,
      .pf-spacer { display: none; }
      .ph-plan.e,
      .ph-plan.p,
      .ph-plan.d { text-align: left; padding-left: 20px; }
      .ph-icon-wrap { margin: 0 0 8px; }
      .feat-cell.e,
      .feat-cell.p,
      .feat-cell.d { padding: 10px 20px; border-left: none !important; border-right: none !important; }
      .feat-cell.e::before { content: 'Essential — '; font-weight: 500; color: #9B8B78; font-size: 10px; display: block; margin-bottom: 4px; font-family: var(--font-jost); letter-spacing: 0.05em; }
      .feat-cell.p::before { content: 'Plus — '; font-weight: 500; color: var(--gold); font-size: 10px; display: block; margin-bottom: 4px; font-family: var(--font-jost); letter-spacing: 0.05em; }
      .feat-cell.d::before { content: 'Deluxe — '; font-weight: 500; color: #8B6030; font-size: 10px; display: block; margin-bottom: 4px; font-family: var(--font-jost); letter-spacing: 0.05em; }
      .pf-cell.e, .pf-cell.p, .pf-cell.d { border-radius: 0 !important; border: none !important; }
    }
  `;

  return (
    <div className={`${cormorant.variable} ${jost.variable} planes-root`}>
      <style suppressHydrationWarning>{css}</style>

      {/* ── Hero ── */}
      <div className="planes-hero">
        <p className="planes-wordmark">Moments</p>
        <h1 className="planes-title">
          Elige el plan para<br /><em>su gran día</em>
        </h1>
        <div className="planes-ornament">
          <span className="planes-ornament-line" />
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 0L6.18 3.82L10 5L6.18 6.18L5 10L3.82 6.18L0 5L3.82 3.82L5 0Z" fill="#B8965A" />
          </svg>
          <span className="planes-ornament-line" />
        </div>
        <p className="planes-sub" style={{ marginTop: '20px' }}>
          Cada plan incluye una invitación diseñada a medida, adaptada al estilo y necesidades de cada pareja.
        </p>
      </div>

      <div className="planes-wrap">

        {/* ── Sticky plan headers ── */}
        <div className="plans-header">
          <div className="ph-spacer" />

          <div className="ph-plan e">
            <div className="ph-icon-wrap e">
              <Sparkles size={16} color="#9B8B78" strokeWidth={1.5} />
            </div>
            <p className="ph-name">Essential</p>
            <p className="ph-desc">Sencillo y elegante</p>
            <a href="/plantillas/essential" target="_blank" className="btn-example">Ver ejemplo</a>
          </div>

          <div className="ph-plan p">
            <div className="ph-badge">Más popular</div>
            <div className="ph-icon-wrap p">
              <Star size={16} color="#B8965A" strokeWidth={1.5} />
            </div>
            <p className="ph-name">Plus</p>
            <p className="ph-desc">Experiencia completa</p>
            <a href="/plantillas/plus" target="_blank" className="btn-example">Ver ejemplo</a>
          </div>

          <div className="ph-plan d">
            <div className="ph-icon-wrap d">
              <Crown size={16} color="#8B6030" strokeWidth={1.5} />
            </div>
            <p className="ph-name">Deluxe</p>
            <p className="ph-desc">Premium e inmersivo</p>
            <a href="/plantillas/deluxe" target="_blank" className="btn-example">Ver ejemplo</a>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="plans-table">
          {sections.map((section) => (
            <div key={section.title}>
              {/* Section header */}
              <div className="sec-div">
                <span className="sec-div-label">{section.title}</span>
              </div>

              {/* Feature rows */}
              {section.features.map((feat) => (
                <div key={feat.label} className="feat-row">
                  <div className="feat-label">{feat.label}</div>
                  <div className="feat-cell e">
                    <Cell val={feat.essential} note={feat.note?.essential} tier="e" />
                  </div>
                  <div className="feat-cell p">
                    <Cell val={feat.plus} note={feat.note?.plus} tier="p" />
                  </div>
                  <div className="feat-cell d">
                    <Cell val={feat.deluxe} note={feat.note?.deluxe} tier="d" />
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Footer */}
          <div className="plans-footer">
            <div className="pf-spacer" />
            <div className="pf-cell e">
              <button className="btn-cta btn-e">Elegir Essential</button>
            </div>
            <div className="pf-cell p">
              <button className="btn-cta btn-p">Elegir Plus</button>
            </div>
            <div className="pf-cell d">
              <button className="btn-cta btn-d">Elegir Deluxe</button>
            </div>
          </div>
        </div>

        <p className="plans-note">
          Todos los planes incluyen diseño personalizado · <span>Hecho con amor en México</span>
        </p>
      </div>
    </div>
  );
}
