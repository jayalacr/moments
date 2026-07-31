'use client';

import { useState, useEffect } from 'react';
import { Cormorant_Garamond, Jost, Montserrat } from 'next/font/google';
import { Check, Minus, Sparkles, Star, Crown } from 'lucide-react';
import Link from 'next/link';
import { BASE_PRICES, formatMXN } from '@/lib/pricing';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
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

type Val = true | false | string;
type PlanKey = 'essential' | 'plus' | 'deluxe';

interface Feature {
  label: string;
  essential: Val;
  plus: Val;
  deluxe: Val;
  note?: { essential?: string; plus?: string; deluxe?: string };
}

interface Section {
  title: string;
  description: string;
  features: Feature[];
}

const TIER_MAP: Record<PlanKey, 'e' | 'p' | 'd'> = { essential: 'e', plus: 'p', deluxe: 'd' };
const BG_MAP: Record<PlanKey, string> = { essential: 'bg-e', plus: 'bg-p', deluxe: 'bg-d' };

function getPlanVal(feat: Feature, plan: PlanKey): Val {
  if (plan === 'essential') return feat.essential;
  if (plan === 'plus') return feat.plus;
  return feat.deluxe;
}

function getPlanNote(feat: Feature, plan: PlanKey): string | undefined {
  if (plan === 'essential') return feat.note?.essential;
  if (plan === 'plus') return feat.note?.plus;
  return feat.note?.deluxe;
}

const sections: Section[] = [
  {
    title: 'Presentación',
    description: 'Frase especial, nombres, padres de familia, cuenta regresiva y música de fondo.',
    features: [
      {
        label: 'Apartado inicial',
        essential: 'Frase, cita, nombres y padres',
        plus: 'Frase, cita, nombres y padres',
        deluxe: 'Frase, cita, nombres y padres',
      },
      { label: 'Loader animado', essential: false, plus: false, deluxe: 'Animación de entrada personalizada' },
      { label: 'Cuenta regresiva', essential: false, plus: true, deluxe: true },
      { label: 'Música de fondo', essential: false, plus: false, deluxe: true },
    ],
  },
  {
    title: 'Fotos',
    description: 'Fotos de sesión o de compromiso mostradas como galería o carrusel a lo largo de la invitación.',
    features: [
      {
        label: 'Imágenes en la invitación',
        essential: 'Hasta 5 imágenes',
        plus: 'Hasta 10 imágenes',
        deluxe: 'Hasta 15 imágenes',
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
    description: 'Programa del día, dirección con mapa, dress code y opciones de hospedaje para boda destino.',
    features: [
      { label: 'Itinerario', essential: 'Estático', plus: 'Animado', deluxe: 'Animado' },
      { label: 'Ubicaciones', essential: false, plus: 'Google Maps interactivo', deluxe: 'Google Maps interactivo' },
      { label: 'Dress code', essential: true, plus: true, deluxe: true },
      { label: 'Boda destino', essential: false, plus: 'Hoteles y transporte', deluxe: 'Hoteles y transporte' },
      { label: 'Agendar en Google Calendar', essential: false, plus: false, deluxe: true },
    ],
  },
  {
    title: 'Regalos',
    description: 'Datos bancarios, enlace a mesa de regalos y opción de sobre en efectivo.',
    features: [
      {
        label: 'Datos de transferencia',
        essential: true, plus: true, deluxe: true,
        note: { essential: 'Banco, cuenta, CLABE', plus: 'Banco, cuenta, CLABE', deluxe: 'Banco, cuenta, CLABE' },
      },
      { label: 'Mesa de regalos', essential: 'Link externo', plus: 'Link externo', deluxe: 'Link externo' },
      { label: 'Sobre de regalo', essential: true, plus: true, deluxe: true },
    ],
  },
  {
    title: 'Confirmación de asistencia',
    description: 'Los invitados confirman desde la invitación. Tú controlas cupo y acompañantes desde tu panel.',
    features: [
      {
        label: 'Tipo de confirmación',
        essential: 'Botón a WhatsApp',
        plus: 'Formulario interno',
        deluxe: 'Formulario personalizado',
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
        note: { plus: 'El organizador define el límite', deluxe: 'Cupo asignado por persona' },
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
  {
    title: 'Panel de administración',
    description: 'Edita tu invitación, previsualiza los cambios y revisa el estado de confirmaciones de tus invitados.',
    features: [
      {
        label: 'Editar invitación',
        essential: true,
        plus: true,
        deluxe: true,
        note: { essential: 'Textos, fotos y configuración', plus: 'Textos, fotos y configuración', deluxe: 'Textos, fotos y configuración' },
      },
      { label: 'Vista previa en tiempo real', essential: true, plus: true, deluxe: true },
      {
        label: 'Estadísticas de confirmaciones',
        essential: false,
        plus: 'Totales generales',
        deluxe: 'Por invitado individual',
        note: { plus: 'Confirmados / Pendientes / Declinaron', deluxe: 'Nombre, estado, cupo y acciones' },
      },
      {
        label: 'Gestión de lista de invitados',
        essential: false,
        plus: false,
        deluxe: true,
        note: { deluxe: 'Importar lista, reenviar links únicos' },
      },
    ],
  },
];

// Rota cada plan a una colección de plantilla distinta — el plan no define el diseño,
// así que el "Ver demo" de cada uno debe mostrar una plantilla diferente.
const DEMO_COLLECTION: Record<PlanKey, string> = {
  essential: 'classic-elegance',
  plus: 'costa',
  deluxe: 'deluxe',
};

const PLAN_DATA = [
  {
    key: 'essential' as PlanKey,
    name: 'Essential',
    tagline: 'Sencillo y elegante',
    Icon: Sparkles,
    accentColor: '#9B8B78',
    popular: false,
    highlights: [
      'Invitación digital elegante y personalizada',
      'Hasta 5 fotografías + foto de portada',
      'Itinerario, dress code y regalos',
      'Confirmación directa por WhatsApp',
    ],
  },
  {
    key: 'plus' as PlanKey,
    name: 'Plus',
    tagline: 'Experiencia completa',
    Icon: Star,
    accentColor: '#B8965A',
    popular: true,
    highlights: [
      'Todo lo del plan Essential',
      'Cuenta regresiva al gran evento',
      'Carrusel fotográfico (hasta 10 fotos)',
      'Formulario RSVP y dashboard de confirmaciones',
    ],
  },
  {
    key: 'deluxe' as PlanKey,
    name: 'Deluxe',
    tagline: 'Premium e inmersivo',
    Icon: Crown,
    accentColor: '#8B6030',
    popular: false,
    highlights: [
      'Todo lo del plan Plus',
      'Loader animado y música de fondo',
      'Links únicos personalizados por invitado',
      'Dashboard con estado individual y reenvío',
    ],
  },
];

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


export default function PlanesPage() {
  const [activeTab, setActiveTab] = useState<PlanKey>('plus');

  const activeTier = TIER_MAP[activeTab];
  const activeBg = BG_MAP[activeTab];
  const activePlanData = PLAN_DATA.find((p) => p.key === activeTab)!;

  const css = `
    :root {
      --ivory: #FAF7F2;
      --gold: #B8965A;
      --charcoal: #1C1611;
      --muted: #E6DDD2;
      --muted-fg: #6B5D52;
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
      padding: 64px 24px 48px;
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

    .planes-title {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: clamp(2.4rem, 5.5vw, 4rem);
      font-weight: 600;
      line-height: 1.1;
      color: var(--charcoal);
      margin-bottom: 20px;
    }
    .planes-title em { font-style: italic; color: var(--gold); }
    .planes-sub {
      font-size: 14px;
      font-weight: 300;
      color: var(--muted-fg);
      max-width: 460px;
      margin: 20px auto 0;
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
    .planes-ornament-line { flex: 1; height: 1px; background: var(--gold); }

    /* ── Plan Cards ── */
    .plan-cards-section {
      padding: 0 20px 48px;
      max-width: 1020px;
      margin: 0 auto;
    }
    .plan-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      align-items: end;
    }
    .plan-card {
      border: 1px solid var(--muted);
      border-radius: 20px;
      padding: 28px 22px 24px;
      position: relative;
      transition: box-shadow 0.25s ease, transform 0.25s ease;
    }
    .plan-card:hover { box-shadow: 0 8px 32px rgba(28,22,17,0.1); transform: translateY(-4px); }
    .plan-card.card-essential { background: #F5F1EC; }
    .plan-card.card-plus { background: #FDFBF7; }
    .plan-card.card-deluxe {
      background: #F7F2EA;
      border-color: #8B6030;
      border-width: 1.5px;
      box-shadow: 0 8px 28px rgba(139,96,48,0.16);
      padding: 36px 26px 30px;
      transform: translateY(-6px);
      z-index: 1;
    }
    .plan-card.card-deluxe:hover {
      box-shadow: 0 14px 44px rgba(139,96,48,0.24);
      transform: translateY(-10px);
    }

    .plan-card-badge {
      position: absolute;
      top: -13px; left: 50%;
      transform: translateX(-50%);
      background: var(--gold);
      color: white;
      font-size: 9.5px;
      font-weight: 500;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding: 4px 14px;
      border-radius: 20px;
      font-family: var(--font-jost);
      white-space: nowrap;
    }
    .plan-card-icon-wrap {
      width: 36px; height: 36px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 12px;
    }
    .card-essential .plan-card-icon-wrap { background: #EAE4DB; }
    .card-plus .plan-card-icon-wrap { background: rgba(184,150,90,0.15); }
    .card-deluxe .plan-card-icon-wrap { background: rgba(139,96,48,0.15); }

    .plan-card-name {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: 24px;
      font-weight: 400;
      color: var(--charcoal);
      line-height: 1;
      margin-bottom: 3px;
    }
    .card-deluxe .plan-card-name { font-size: 28px; }
    .plan-card-tagline {
      font-size: 11px;
      font-weight: 300;
      color: var(--muted-fg);
      letter-spacing: 0.06em;
      font-family: var(--font-jost);
      margin-bottom: 16px;
    }
    .plan-card-divider { height: 1px; background: var(--muted); margin-bottom: 16px; }

    .plan-card-price-row {
      display: flex;
      align-items: baseline;
      gap: 5px;
      margin-bottom: 18px;
    }
    .plan-card-price-from {
      font-size: 10px; font-weight: 400; color: var(--muted-fg);
      font-family: var(--font-jost); letter-spacing: 0.08em; text-transform: uppercase;
    }
    .plan-card-price-amount {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: 30px; font-weight: 400; color: var(--charcoal); line-height: 1;
    }
    .card-deluxe .plan-card-price-amount { font-size: 36px; color: #3D2E1A; }
    .plan-card-price-note {
      font-size: 10px; font-weight: 300; color: var(--muted-fg); font-family: var(--font-jost);
    }

    .plan-card-features {
      list-style: none; padding: 0; margin: 0 0 22px;
      display: flex; flex-direction: column; gap: 9px;
    }
    .plan-card-feature-item { display: flex; align-items: flex-start; gap: 8px; }
    .plan-card-feature-text {
      font-size: 12px; color: #5C5248; font-family: var(--font-jost); line-height: 1.45;
    }
    .card-deluxe .plan-card-feature-text { font-size: 12.5px; color: #3D2E1A; }

    .plan-card-cta {
      display: block; text-align: center;
      font-family: var(--font-jost), system-ui, sans-serif;
      font-size: 10.5px; font-weight: 500; letter-spacing: 0.12em;
      text-transform: uppercase; padding: 10px 20px; border-radius: 100px;
      text-decoration: none;
      transition: opacity 0.2s, transform 0.15s;
    }
    .plan-card-cta:hover { opacity: 0.82; transform: translateY(-1px); }
    .card-essential .plan-card-cta { background: #EAE4DB; color: #5C5248; }
    .card-plus .plan-card-cta { background: var(--gold); color: white; }
    .card-deluxe .plan-card-cta { background: var(--charcoal); color: rgba(184,150,90,0.9); }

    /* ── Compare section header ── */
    .compare-section-header {
      display: flex; align-items: center; gap: 16px;
      max-width: 1020px; margin: 0 auto;
      padding: 0 20px 20px;
    }
    .compare-section-header-line { flex: 1; height: 1px; background: var(--muted); }
    .compare-section-header-label {
      font-size: 10px; font-weight: 500; letter-spacing: 0.22em;
      text-transform: uppercase; color: var(--muted-fg);
      font-family: var(--font-jost); white-space: nowrap;
    }

    /* ── Wrap ── */
    .planes-wrap { max-width: 1020px; margin: 0 auto; padding: 0 20px 96px; }

    /* ── Desktop: sticky plan header ── */
    .plans-header {
      position: sticky; top: 0; z-index: 10;
      display: grid;
      grid-template-columns: 200px repeat(3, minmax(0, 1fr));
      background: var(--ivory);
      border-bottom: 1px solid var(--muted);
      box-shadow: 0 4px 24px rgba(28,22,17,0.06);
    }
    .ph-spacer { width: 200px; }
    .ph-plan {
      padding: 20px 16px 18px; text-align: center;
      position: relative; border-top: 2px solid transparent;
    }
    .ph-plan.e { border-top-color: var(--muted); background: #F5F1EC; }
    .ph-plan.p { border-top-color: var(--gold); background: #FDFBF7; }
    .ph-plan.d { border-top-color: #8B6030; background: #F7F2EA; }
    .ph-badge {
      position: absolute; top: -12px; left: 50%;
      transform: translateX(-50%);
      background: var(--gold); color: white;
      font-size: 9px; font-weight: 500; letter-spacing: 0.12em;
      text-transform: uppercase; padding: 3px 10px; border-radius: 20px;
      white-space: nowrap; font-family: var(--font-jost);
    }
    .ph-icon-wrap {
      width: 34px; height: 34px; border-radius: 50%;
      margin: 0 auto 8px; display: flex; align-items: center; justify-content: center;
    }
    .ph-icon-wrap.e { background: #EAE4DB; }
    .ph-icon-wrap.p { background: rgba(184,150,90,0.15); }
    .ph-icon-wrap.d { background: rgba(139,96,48,0.18); }
    .ph-name {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: 20px; font-weight: 400; color: var(--charcoal); margin-bottom: 2px;
    }
    .ph-desc { font-size: 10px; font-weight: 300; color: var(--muted-fg); letter-spacing: 0.05em; font-family: var(--font-jost); }
    .btn-example {
      font-size: 10px; color: var(--gold); text-decoration: none;
      border-bottom: 1px solid transparent; transition: border-color 0.2s;
      margin-top: 10px; display: inline-block; letter-spacing: 0.05em; text-transform: uppercase;
    }
    .btn-example:hover { border-bottom-color: var(--gold); }

    /* ── What's included ── */
    .includes-section {
      max-width: 1020px; margin: 0 auto 40px; padding: 0 20px;
    }
    .includes-title {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 300;
      color: var(--charcoal); margin-bottom: 8px; line-height: 1.2;
    }
    .includes-title em { font-style: italic; color: var(--gold); }
    .includes-subtitle {
      font-size: 13px; font-weight: 300; color: var(--muted-fg);
      font-family: var(--font-jost); margin-bottom: 28px; line-height: 1.6;
    }
    .includes-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }
    .includes-card {
      background: white; border: 1px solid var(--muted);
      border-radius: 12px; padding: 20px 20px 18px;
    }
    .includes-card-label {
      font-size: 9px; font-weight: 500; letter-spacing: 0.2em;
      text-transform: uppercase; color: var(--gold);
      font-family: var(--font-jost); margin-bottom: 8px;
    }
    .includes-card-desc {
      font-size: 14px; font-weight: 300; color: #5C5248;
      font-family: var(--font-jost); line-height: 1.6;
    }
    @media (max-width: 720px) {
      .includes-grid { grid-template-columns: 1fr; gap: 10px; }
    }

    /* ── Table ── */
    .plans-table { border: 1px solid var(--muted); border-top: none; border-radius: 0 0 16px 16px; overflow: hidden; }
    .sec-div { background: var(--charcoal); padding: 7px 20px; }
    .sec-div-label {
      font-size: 9px; font-weight: 500; letter-spacing: 0.2em;
      text-transform: uppercase; color: rgba(184,150,90,0.75); font-family: var(--font-jost);
    }
    .feat-row {
      display: grid;
      grid-template-columns: 200px repeat(3, minmax(0, 1fr));
      border-top: 1px solid var(--muted);
    }
    .feat-row:hover { background: rgba(184,150,90,0.025); }
    .feat-label {
      padding: 14px 20px; font-size: 12px; color: var(--muted-fg);
      font-weight: 400; font-family: var(--font-jost);
      display: flex; align-items: flex-start; line-height: 1.45;
    }
    .feat-cell { padding: 12px 16px; }
    .feat-cell.e { background: #F5F1EC; }
    .feat-cell.p { background: #FDFBF7; border-left: 1px solid rgba(184,150,90,0.35); border-right: 1px solid rgba(184,150,90,0.35); }
    .feat-cell.d { background: #F7F2EA; }

    .price-row {
      display: grid;
      grid-template-columns: 200px repeat(3, minmax(0, 1fr));
      border-top: 1px solid var(--muted);
    }
    .price-label {
      padding: 22px 20px; font-size: 11px; color: var(--muted-fg);
      font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase;
      font-family: var(--font-jost); display: flex; align-items: center;
    }
    .price-cell {
      padding: 22px 16px 20px; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
    }
    .price-cell.e { background: #F5F1EC; }
    .price-cell.p { background: #FDFBF7; border-left: 1px solid rgba(184,150,90,0.35); border-right: 1px solid rgba(184,150,90,0.35); }
    .price-cell.d { background: #F7F2EA; }
    .price-from { font-size: 9px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted-fg); font-family: var(--font-jost); }
    .price-amount {
      font-family: var(--font-cormorant), Georgia, serif;
      font-size: 28px; font-weight: 400; line-height: 1; color: var(--charcoal);
    }
    .price-cell.p .price-amount, .price-cell.d .price-amount { color: #3D2E1A; }
    .price-note { font-size: 10px; font-weight: 300; color: var(--muted-fg); font-family: var(--font-jost); letter-spacing: 0.04em; }

    .plans-footer {
      display: grid;
      grid-template-columns: 200px repeat(3, minmax(0, 1fr));
      border-top: 1px solid var(--muted);
    }
    .pf-spacer { padding: 20px; }
    .pf-cell {
      padding: 20px 16px; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 6px;
    }
    .pf-cell.e { background: #F5F1EC; border-radius: 0 0 0 16px; }
    .pf-cell.p { background: #FDFBF7; }
    .pf-cell.d { background: #F7F2EA; border-left: 1.5px solid #8B6030; border-right: 1.5px solid #8B6030; border-bottom: 1.5px solid #8B6030; border-radius: 0 0 12px 12px; }

    .btn-cta {
      display: inline-block; font-family: var(--font-jost), system-ui, sans-serif;
      font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
      padding: 9px 20px; border-radius: 100px; cursor: pointer;
      transition: opacity 0.2s, transform 0.2s; border: none; outline: none;
    }
    .btn-cta:hover { opacity: 0.82; transform: translateY(-1px); }
    .btn-e { background: var(--muted); color: #5C5248; }
    .btn-p { background: var(--gold); color: white; }
    .btn-d { background: var(--charcoal); color: rgba(184,150,90,0.9); }

    /* ── Quote CTA + note ── */
    .quote-cta-wrap { text-align: center; padding: 28px 24px 0; }
    .quote-cta {
      display: inline-flex; align-items: center; gap: 8px;
      font-family: var(--font-jost), system-ui, sans-serif;
      font-size: 11px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--gold); text-decoration: none; padding: 11px 22px;
      border: 1px solid var(--gold); border-radius: 100px;
      transition: background 0.2s, color 0.2s;
    }
    .quote-cta:hover { background: var(--gold); color: white; }
    .plans-note {
      text-align: center; padding: 32px 24px 0;
      font-size: 12px; color: var(--muted-fg); font-weight: 300; font-family: var(--font-jost);
    }
    .plans-note span { color: var(--gold); }

    /* ── Mobile: hide desktop table ── */
    .mobile-tabs { display: none; }
    .mobile-feature-list { display: none; }

    /* ── Mobile layout ── */
    @media (max-width: 720px) {
      .planes-hero { padding: 56px 20px 36px; }

      .plan-cards-grid { grid-template-columns: 1fr; gap: 12px; }
      .plan-card.card-plus { transform: none; padding: 28px 22px 24px; }
      .card-plus .plan-card-name { font-size: 24px; }
      .card-plus .plan-card-price-amount { font-size: 30px; }
      .card-plus .plan-card-feature-text { font-size: 12px; }

      .desktop-table { display: none; }

      .mobile-tabs {
        display: flex;
        border: 1px solid var(--muted);
        border-radius: 12px 12px 0 0;
        overflow: hidden;
        background: white;
        margin-bottom: 0;
      }
      .mobile-tab {
        flex: 1; padding: 12px 8px;
        font-family: var(--font-jost); font-size: 11px; font-weight: 500;
        letter-spacing: 0.08em; text-transform: uppercase;
        background: white; color: var(--muted-fg);
        border: none; cursor: pointer;
        transition: background 0.18s, color 0.18s;
        border-bottom: 2px solid transparent;
      }
      .mobile-tab + .mobile-tab { border-left: 1px solid var(--muted); }
      .mobile-tab.tab-e { background: #F5F1EC; color: #5C5248; border-bottom-color: var(--muted); }
      .mobile-tab.tab-p { background: #FDFBF7; color: #3D2E1A; border-bottom-color: var(--gold); }
      .mobile-tab.tab-d { background: #F7F2EA; color: #3D2E1A; border-bottom-color: #8B6030; }

      .mobile-feature-list {
        display: block;
        border: 1px solid var(--muted);
        border-top: none;
        border-radius: 0 0 16px 16px;
        overflow: hidden;
      }
      .mobile-sec-div {
        background: var(--charcoal); padding: 7px 16px;
        font-size: 9px; font-weight: 500; letter-spacing: 0.2em;
        text-transform: uppercase; color: rgba(184,150,90,0.75); font-family: var(--font-jost);
      }
      .mobile-feat-row {
        display: grid; grid-template-columns: 1fr 1fr;
        border-top: 1px solid var(--muted); align-items: start;
      }
      .mobile-feat-label {
        padding: 12px 14px; font-size: 11.5px; color: var(--muted-fg);
        font-family: var(--font-jost); line-height: 1.4; padding-top: 13px;
      }
      .mobile-feat-val { padding: 11px 14px; }
      .mobile-feat-val.bg-e { background: #F5F1EC; }
      .mobile-feat-val.bg-p { background: #FDFBF7; }
      .mobile-feat-val.bg-d { background: #F7F2EA; }

      .mobile-price-section {
        border-top: 1px solid var(--muted); padding: 20px 16px;
        text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px;
      }
      .mobile-price-section.bg-e { background: #F5F1EC; }
      .mobile-price-section.bg-p { background: #FDFBF7; }
      .mobile-price-section.bg-d { background: #F7F2EA; }
      .mobile-price-from { font-size: 9px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted-fg); font-family: var(--font-jost); }
      .mobile-price-amount { font-family: var(--font-cormorant), Georgia, serif; font-size: 34px; font-weight: 400; color: var(--charcoal); line-height: 1; }
      .mobile-price-note { font-size: 10px; font-weight: 300; color: var(--muted-fg); font-family: var(--font-jost); }

      .mobile-cta-section {
        border-top: 1px solid var(--muted); padding: 18px 16px;
        display: flex; justify-content: center;
      }
      .mobile-cta-section.bg-e { background: #F5F1EC; border-radius: 0 0 16px 16px; }
      .mobile-cta-section.bg-p { background: #FDFBF7; border-radius: 0 0 16px 16px; }
      .mobile-cta-section.bg-d { background: #F7F2EA; border-radius: 0 0 16px 16px; }
    }
  `;

  return (
    <div className={`${cormorant.variable} ${jost.variable} ${montserrat.variable} planes-root`}>
      <style suppressHydrationWarning>{css}</style>

      <SiteHeader />

      {/* ── Hero ── */}
      <div className="planes-hero">
        <h1 className="planes-title">
          Elige el plan perfecto<br /><em>para tu celebración</em>
        </h1>
        <div className="planes-ornament">
          <span className="planes-ornament-line" />
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 0L6.18 3.82L10 5L6.18 6.18L5 10L3.82 6.18L0 5L3.82 3.82L5 0Z" fill="#B8965A" />
          </svg>
          <span className="planes-ornament-line" />
        </div>
        <p className="planes-sub">
          Cada plan incluye una invitación diseñada a medida. Tú editas libremente la información —nombres, fechas, fotos, mensajes— dentro de la estructura del plan que elijas.
        </p>
      </div>

      {/* ── Plan Cards ── */}
      <div className="plan-cards-section">
        <div className="plan-cards-grid">
          {PLAN_DATA.map(({ key, name, tagline, Icon, accentColor, popular, highlights }) => (
            <div key={key} className={`plan-card card-${key}`}>
              {popular && <div className="plan-card-badge">Más popular</div>}
              <div className="plan-card-icon-wrap">
                <Icon size={16} color={accentColor} strokeWidth={1.5} />
              </div>
              <p className="plan-card-name">{name}</p>
              <p className="plan-card-tagline">{tagline}</p>
              <div className="plan-card-divider" />
              <div className="plan-card-price-row">
                <span className="plan-card-price-from">Desde</span>
                <span className="plan-card-price-amount">{formatMXN(BASE_PRICES[key])}</span>
                <span className="plan-card-price-note">MXN</span>
              </div>
              <ul className="plan-card-features">
                {highlights.map((h) => (
                  <li key={h} className="plan-card-feature-item">
                    <Check size={13} color={accentColor} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span className="plan-card-feature-text">{h}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/plantillas/${DEMO_COLLECTION[key]}?plan=${key}`} className="plan-card-cta" target="_blank">
                Ver demo
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── What's included ── */}
      <div className="includes-section">
        <h2 className="includes-title">¿Qué incluye <em>tu invitación?</em></h2>
        <p className="includes-subtitle">Cada sección de la invitación se puede personalizar con tu información. Esto es lo que tus invitados verán al abrirla.</p>
        <div className="includes-grid">
          {sections.map((section) => (
            <div key={section.title} className="includes-card">
              <p className="includes-card-label">{section.title}</p>
              <p className="includes-card-desc">{section.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Compare header ── */}
      <div className="compare-section-header">
        <span className="compare-section-header-line" />
        <span className="compare-section-header-label">Comparar en detalle</span>
        <span className="compare-section-header-line" />
      </div>

      <div className="planes-wrap">
        {/* ── Mobile tabs ── */}
        <div className="mobile-tabs">
          {PLAN_DATA.map(({ key, name }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                className={`mobile-tab${isActive ? ` tab-${TIER_MAP[key]}` : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {name}
              </button>
            );
          })}
        </div>

        {/* ── Mobile feature list ── */}
        <div className="mobile-feature-list">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="mobile-sec-div">{section.title}</div>
              {section.features.map((feat) => (
                <div key={feat.label} className="mobile-feat-row">
                  <div className="mobile-feat-label">{feat.label}</div>
                  <div className={`mobile-feat-val ${activeBg}`}>
                    <Cell val={getPlanVal(feat, activeTab)} note={getPlanNote(feat, activeTab)} tier={activeTier} />
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="mobile-sec-div">Inversión</div>
          <div className={`mobile-price-section ${activeBg}`}>
            <span className="mobile-price-from">Desde</span>
            <span className="mobile-price-amount">{formatMXN(BASE_PRICES[activeTab])}</span>
            <span className="mobile-price-note">pago único · 2 meses de anticipación</span>
          </div>

        </div>

        {/* ── Desktop table ── */}
        <div className="desktop-table">
          <div className="plans-header">
            <div className="ph-spacer" />
            <div className="ph-plan e">
              <div className="ph-icon-wrap e"><Sparkles size={16} color="#9B8B78" strokeWidth={1.5} /></div>
              <p className="ph-name">Essential</p>
              <p className="ph-desc">Sencillo y elegante</p>
              <a href={`/plantillas/${DEMO_COLLECTION.essential}?plan=essential`} target="_blank" className="btn-example">Ver demo</a>
            </div>
            <div className="ph-plan p">
              <div className="ph-badge">Más popular</div>
              <div className="ph-icon-wrap p"><Star size={16} color="#B8965A" strokeWidth={1.5} /></div>
              <p className="ph-name">Plus</p>
              <p className="ph-desc">Experiencia completa</p>
              <a href={`/plantillas/${DEMO_COLLECTION.plus}?plan=plus`} target="_blank" className="btn-example">Ver demo</a>
            </div>
            <div className="ph-plan d">
              <div className="ph-icon-wrap d"><Crown size={16} color="#8B6030" strokeWidth={1.5} /></div>
              <p className="ph-name">Deluxe</p>
              <p className="ph-desc">Premium e inmersivo</p>
              <a href={`/plantillas/${DEMO_COLLECTION.deluxe}?plan=deluxe`} target="_blank" className="btn-example">Ver demo</a>
            </div>
          </div>

          <div className="plans-table">
            {sections.map((section) => (
              <div key={section.title}>
                <div className="sec-div"><span className="sec-div-label">{section.title}</span></div>
                {section.features.map((feat) => (
                  <div key={feat.label} className="feat-row">
                    <div className="feat-label">{feat.label}</div>
                    <div className="feat-cell e"><Cell val={feat.essential} note={feat.note?.essential} tier="e" /></div>
                    <div className="feat-cell p"><Cell val={feat.plus} note={feat.note?.plus} tier="p" /></div>
                    <div className="feat-cell d"><Cell val={feat.deluxe} note={feat.note?.deluxe} tier="d" /></div>
                  </div>
                ))}
              </div>
            ))}

            <div className="sec-div"><span className="sec-div-label">Inversión</span></div>
            <div className="price-row">
              <div className="price-label">Precio base</div>
              <div className="price-cell e">
                <span className="price-from">Desde</span>
                <span className="price-amount">{formatMXN(BASE_PRICES.essential)}</span>
                <span className="price-note">pago único · 2 meses de anticipación</span>
              </div>
              <div className="price-cell p">
                <span className="price-from">Desde</span>
                <span className="price-amount">{formatMXN(BASE_PRICES.plus)}</span>
                <span className="price-note">pago único · 2 meses de anticipación</span>
              </div>
              <div className="price-cell d">
                <span className="price-from">Desde</span>
                <span className="price-amount">{formatMXN(BASE_PRICES.deluxe)}</span>
                <span className="price-note">pago único · 2 meses de anticipación</span>
              </div>
            </div>

          </div>
        </div>

        <div className="quote-cta-wrap">
          <Link href="/cotizar" className="quote-cta">
            Simular mi cotización completa →
          </Link>
        </div>

        <p className="plans-note" style={{ paddingTop: 12 }}>
          * La carga de datos la realiza el organizador desde su panel. Si tienes wedding planner, puede tener su propio acceso para administrar la lista de invitados.
        </p>
      </div>
      <SiteFooter />
    </div>
  );
}
