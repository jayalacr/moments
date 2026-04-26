'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Jost, Montserrat } from 'next/font/google';
import { Sparkles, Star, Crown } from 'lucide-react';
import {
  BASE_PRICES,
  EXTRA_MONTH_PRICE,
  PLAN_LABEL,
  PLAN_TAGLINE,
  formatMXN,
  type Plan,
  type DesignType,
} from '@/lib/pricing';

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

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-montserrat',
});

const WHATSAPP_NUMBER = '528126390927';

const PLAN_ICONS: Record<Plan, typeof Sparkles> = {
  essential: Sparkles,
  plus: Star,
  deluxe: Crown,
};

const PLAN_COLORS: Record<Plan, { dot: string; ring: string; bg: string }> = {
  essential: { dot: '#9B8B78', ring: '#C9C0B5', bg: '#F5F1EC' },
  plus:      { dot: '#B8965A', ring: 'rgba(184,150,90,0.55)', bg: '#FDFBF7' },
  deluxe:    { dot: '#8B6030', ring: 'rgba(139,96,48,0.55)', bg: '#F7F2EA' },
};

const MAX_EXTRA_MONTHS = 11;

export default function CotizarPage() {
  const [plan, setPlan] = useState<Plan>('plus');
  const [designType, setDesignType] = useState<DesignType>('template');
  const [extraMonths, setExtraMonths] = useState(0);

  const extensionCost = extraMonths * EXTRA_MONTH_PRICE;
  const totalMonths = 1 + extraMonths;
  const hasCustomDesign = designType === 'custom';

  const breakdown = useMemo(() => {
    const base = BASE_PRICES[plan];
    const total = base + extensionCost;
    return { base, extensionCost, total };
  }, [plan, extensionCost]);

  const whatsappMessage = useMemo(() => {
    const totalLabel = totalMonths === 1
      ? '1 mes (incluido)'
      : `${totalMonths} meses (1 incluido + ${extraMonths} adicional${extraMonths > 1 ? 'es' : ''})`;
    const lines: string[] = [
      `Hola! Me interesa más información sobre moments.`,
      ``,
      `Esto es lo que estoy buscando:`,
      `• Plan: ${PLAN_LABEL[plan]}`,
      `• Diseño: ${designType === 'template' ? 'Plantilla prediseñada' : 'Diseño personalizado'}`,
      `• Publicación: ${totalLabel}`,
    ];
    return encodeURIComponent(lines.join('\n'));
  }, [plan, designType, extraMonths, totalMonths]);

  const css = `
    :root {
      --ivory: #FAF7F2;
      --gold: #B8965A;
      --charcoal: #1C1611;
      --muted: #E6DDD2;
      --muted-fg: #9B8B78;
    }
    .q-root {
      font-family: var(--font-jost), system-ui, sans-serif;
      background: var(--ivory);
      color: var(--charcoal);
      min-height: 100dvh;
    }
    .q-hero {
      text-align: center;
      padding: 64px 24px 32px;
    }
    .q-wordmark {
      font-family: var(--font-montserrat), 'Montserrat', sans-serif;
      font-size: 36px;
      font-weight: 400;
      font-style: normal;
      letter-spacing: 0.18em;
      color: #b28375;
      margin-bottom: 18px;
    }
    .q-title {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: clamp(2rem, 4.5vw, 3.2rem);
      font-weight: 300;
      line-height: 1.1;
      color: var(--charcoal);
      margin-bottom: 14px;
    }
    .q-title em {
      font-style: italic;
      color: var(--gold);
    }
    .q-sub {
      font-size: 14px;
      font-weight: 300;
      color: var(--muted-fg);
      max-width: 520px;
      margin: 0 auto;
      line-height: 1.7;
    }
    .q-wrap {
      max-width: 1020px;
      margin: 0 auto;
      padding: 16px 20px 96px;
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 32px;
      align-items: start;
    }
    @media (max-width: 820px) {
      .q-wrap { grid-template-columns: 1fr; }
      .q-summary { position: static !important; }
    }

    .q-section {
      background: white;
      border: 1px solid var(--muted);
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 16px;
    }
    .q-section-title {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: 18px;
      font-weight: 400;
      color: var(--charcoal);
      margin-bottom: 4px;
    }
    .q-section-hint {
      font-size: 11px;
      color: var(--muted-fg);
      font-weight: 300;
      margin-bottom: 18px;
      letter-spacing: 0.03em;
    }

    /* Plan cards */
    .q-plan-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    @media (max-width: 560px) {
      .q-plan-grid { grid-template-columns: 1fr; }
    }
    .q-plan-card {
      border: 1.5px solid var(--muted);
      border-radius: 12px;
      padding: 16px 12px;
      text-align: center;
      cursor: pointer;
      background: white;
      transition: border-color 0.15s, background 0.15s, transform 0.15s;
    }
    .q-plan-card:hover { transform: translateY(-1px); }
    .q-plan-card.active { border-color: var(--gold); background: #FDFBF7; box-shadow: 0 2px 12px rgba(184,150,90,0.15); }
    .q-plan-icon {
      width: 32px; height: 32px;
      border-radius: 50%;
      margin: 0 auto 8px;
      display: flex; align-items: center; justify-content: center;
    }
    .q-plan-name {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: 18px;
      font-weight: 400;
    }
    .q-plan-tag {
      font-size: 10px;
      color: var(--muted-fg);
      letter-spacing: 0.04em;
      margin-bottom: 6px;
    }
    .q-plan-price {
      font-size: 11px;
      color: var(--gold);
      font-weight: 500;
    }

    /* Radio options */
    .q-opts { display: flex; flex-direction: column; gap: 8px; }
    .q-opt {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 14px;
      border: 1.5px solid var(--muted);
      border-radius: 10px;
      cursor: pointer;
      background: white;
      transition: border-color 0.15s, background 0.15s;
    }
    .q-opt:hover:not(.disabled) { border-color: rgba(184,150,90,0.45); }
    .q-opt.active { border-color: var(--gold); background: #FDFBF7; }
    .q-opt.disabled { opacity: 0.45; cursor: not-allowed; }
    .q-opt-radio {
      width: 16px; height: 16px;
      border-radius: 50%;
      border: 1.5px solid var(--muted);
      margin-top: 2px;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .q-opt.active .q-opt-radio { border-color: var(--gold); }
    .q-opt.active .q-opt-radio::after {
      content: '';
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--gold);
    }
    .q-opt-body { flex: 1; }
    .q-opt-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--charcoal);
      margin-bottom: 2px;
    }
    .q-opt-detail {
      font-size: 11px;
      font-weight: 300;
      color: var(--muted-fg);
      line-height: 1.5;
    }
    .q-opt-amount {
      font-size: 12px;
      font-weight: 500;
      color: var(--gold);
      white-space: nowrap;
    }

    /* Summary card */
    .q-summary {
      position: sticky;
      top: 20px;
      background: white;
      border: 1px solid var(--muted);
      border-radius: 14px;
      padding: 24px;
      box-shadow: 0 4px 24px rgba(28,22,17,0.05);
    }
    .q-summary-title {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: 20px;
      margin-bottom: 4px;
    }
    .q-summary-sub {
      font-size: 11px;
      color: var(--muted-fg);
      margin-bottom: 20px;
    }
    .q-line {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      padding: 10px 0;
      border-top: 1px solid var(--muted);
    }
    .q-line:first-of-type { border-top: none; padding-top: 0; }
    .q-line-label {
      font-size: 12px;
      color: var(--charcoal);
      font-weight: 500;
      margin-bottom: 2px;
    }
    .q-line-detail {
      font-size: 10.5px;
      color: var(--muted-fg);
      font-weight: 300;
      line-height: 1.45;
    }
    .q-line-amount {
      font-size: 13px;
      font-weight: 500;
      color: var(--charcoal);
      white-space: nowrap;
    }
    .q-line-estimate {
      font-size: 10.5px;
      color: var(--gold);
      font-style: italic;
      white-space: nowrap;
    }
    .q-total {
      margin-top: 18px;
      padding-top: 18px;
      border-top: 1.5px solid var(--charcoal);
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .q-total-label {
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted-fg);
    }
    .q-total-amount {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: 32px;
      color: var(--charcoal);
    }
    .q-estimate-note {
      margin-top: 10px;
      padding: 10px 12px;
      background: rgba(184,150,90,0.08);
      border-left: 2px solid var(--gold);
      font-size: 11px;
      color: #6B5430;
      line-height: 1.5;
      border-radius: 4px;
    }
    .q-cta {
      display: block;
      text-align: center;
      margin-top: 18px;
      padding: 13px 18px;
      background: #25D366;
      color: white;
      text-decoration: none;
      border-radius: 100px;
      font-weight: 500;
      font-size: 12px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      transition: opacity 0.15s, transform 0.15s;
    }
    .q-cta:hover { opacity: 0.9; transform: translateY(-1px); }

    .q-back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--muted-fg);
      text-decoration: none;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .q-back:hover { color: var(--gold); }
  `;

  const planList: Plan[] = ['essential', 'plus', 'deluxe'];
  const designs: DesignType[] = ['template', 'custom'];

  return (
    <div className={`${cormorant.variable} ${jost.variable} ${montserrat.variable} q-root`}>
      <style suppressHydrationWarning>{css}</style>

      <div className="q-hero">
        <p className="q-wordmark">moments</p>
        <h1 className="q-title">
          Simula tu <em>cotización</em>
        </h1>
        <p className="q-sub">
          Elige el plan, el tiempo de publicación y los extras. El total se actualiza al instante.
          Cuando estés listo, escríbenos por WhatsApp y con gusto te damos todos los detalles.
        </p>
      </div>

      <div className="q-wrap">
        <div>
          <Link href="/planes" className="q-back">← Ver comparativa de planes</Link>

          {/* Plan */}
          <div className="q-section">
            <h2 className="q-section-title">Tu plan</h2>
            <p className="q-section-hint">Elige el nivel que mejor se adapta al evento.</p>
            <div className="q-plan-grid">
              {planList.map((p) => {
                const Icon = PLAN_ICONS[p];
                const colors = PLAN_COLORS[p];
                const active = plan === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlan(p)}
                    className={`q-plan-card ${active ? 'active' : ''}`}
                  >
                    <div className="q-plan-icon" style={{ background: colors.bg }}>
                      <Icon size={16} color={colors.dot} strokeWidth={1.5} />
                    </div>
                    <p className="q-plan-name">{PLAN_LABEL[p]}</p>
                    <p className="q-plan-tag">{PLAN_TAGLINE[p]}</p>
                    <p className="q-plan-price">Desde {formatMXN(BASE_PRICES[p])}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Design */}
          <div className="q-section">
            <h2 className="q-section-title">Tipo de diseño</h2>
            <p className="q-section-hint">La información mostrada es la misma en ambos casos. Lo que cambia es el look y el layout.</p>
            <div className="q-opts">
              {designs.map((d) => {
                const active = designType === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDesignType(d)}
                    className={`q-opt ${active ? 'active' : ''}`}
                  >
                    <span className="q-opt-radio" />
                    <div className="q-opt-body" style={{ textAlign: 'left' }}>
                      <p className="q-opt-label">
                        {d === 'template' ? 'Plantilla prediseñada' : 'Diseño personalizado'}
                      </p>
                      <p className="q-opt-detail">
                        {d === 'template'
                          ? 'Uno de nuestros layouts premium listos para usar. Mismos campos y secciones, estética ya definida.'
                          : 'Layout y estética distintos, diseñados desde cero para tu evento. La estructura de datos no cambia.'}
                      </p>
                    </div>
                    <span className="q-opt-amount">
                      {d === 'template' ? 'Incluido' : 'A cotizar'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extension */}
          <div className="q-section">
            <h2 className="q-section-title">Tiempo de publicación</h2>
            <p className="q-section-hint">El primer mes está incluido en tu plan. Agrega los meses extra que necesites a <strong>{formatMXN(EXTRA_MONTH_PRICE)}</strong> c/u.</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '16px', flexWrap: 'wrap' }}>
              {/* Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1px solid var(--muted)', borderRadius: '10px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setExtraMonths(m => Math.max(0, m - 1))}
                  disabled={extraMonths === 0}
                  style={{
                    width: '40px', height: '44px', border: 'none',
                    background: extraMonths === 0 ? 'transparent' : 'var(--ivory)',
                    color: extraMonths === 0 ? 'var(--muted)' : 'var(--charcoal)',
                    fontSize: '20px', cursor: extraMonths === 0 ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-jost)', lineHeight: 1,
                    transition: 'background 0.15s',
                  }}
                >−</button>
                <div style={{
                  minWidth: '80px', height: '44px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  borderLeft: '1px solid var(--muted)', borderRight: '1px solid var(--muted)',
                  background: 'white',
                }}>
                  <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '22px', fontWeight: 400, color: 'var(--charcoal)', lineHeight: 1 }}>
                    {totalMonths}
                  </span>
                  <span style={{ fontFamily: 'var(--font-jost)', fontSize: '9px', color: 'var(--muted-fg)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {totalMonths === 1 ? 'mes' : 'meses'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setExtraMonths(m => Math.min(MAX_EXTRA_MONTHS, m + 1))}
                  disabled={extraMonths === MAX_EXTRA_MONTHS}
                  style={{
                    width: '40px', height: '44px', border: 'none',
                    background: 'var(--ivory)',
                    color: 'var(--charcoal)',
                    fontSize: '20px', cursor: extraMonths === MAX_EXTRA_MONTHS ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-jost)', lineHeight: 1,
                    transition: 'background 0.15s',
                  }}
                >+</button>
              </div>

              {/* Desglose */}
              <div style={{ fontFamily: 'var(--font-jost)', fontSize: '13px', color: 'var(--muted-fg)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--charcoal)' }}>1 mes incluido</span>
                {extraMonths > 0 && (
                  <> + <span style={{ color: 'var(--charcoal)' }}>{extraMonths} mes{extraMonths > 1 ? 'es' : ''} adicional{extraMonths > 1 ? 'es' : ''}</span>
                  {' '}({formatMXN(extensionCost)})</>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Summary */}
        <aside className="q-summary">
          <h2 className="q-summary-title">Tu cotización</h2>
          <p className="q-summary-sub">Actualizada en tiempo real</p>

          <div className="q-line">
            <div style={{ flex: 1 }}>
              <p className="q-line-label">Plan {PLAN_LABEL[plan]}</p>
              <p className="q-line-detail">Pago único · 1 mes de publicación incluido</p>
            </div>
            <span className="q-line-amount">{formatMXN(breakdown.base)}</span>
          </div>

          {extraMonths > 0 && (
            <div className="q-line">
              <div style={{ flex: 1 }}>
                <p className="q-line-label">Meses adicionales</p>
                <p className="q-line-detail">{extraMonths} mes{extraMonths > 1 ? 'es' : ''} × {formatMXN(EXTRA_MONTH_PRICE)}</p>
              </div>
              <span className="q-line-amount">+{formatMXN(breakdown.extensionCost)}</span>
            </div>
          )}

          {hasCustomDesign && (
            <div className="q-line">
              <div style={{ flex: 1 }}>
                <p className="q-line-label">Diseño personalizado</p>
                <p className="q-line-detail">Se define según el alcance de las modificaciones</p>
              </div>
              <span className="q-line-estimate">A cotizar</span>
            </div>
          )}

          <div className="q-total">
            <span className="q-total-label">{hasCustomDesign ? 'Desde' : 'Total'}</span>
            <span className="q-total-amount">{formatMXN(breakdown.total)}</span>
          </div>

          {hasCustomDesign && (
            <p className="q-estimate-note">
              Este total no incluye el costo del diseño personalizado. Te contactamos para definirlo.
            </p>
          )}

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="q-cta"
          >
            Pedir informes por WhatsApp →
          </a>
        </aside>
      </div>
    </div>
  );
}
