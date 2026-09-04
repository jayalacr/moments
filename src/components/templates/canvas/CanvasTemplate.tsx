'use client';

/**
 * Canvas — plantilla "lienzo".
 *
 * A diferencia de las plantillas de boda (secciones con CSS hardcodeado), aquí
 * el diseño ES una imagen: el diseñador entrega el arte y el código sólo coloca
 * texto encima en coordenadas porcentuales. Sirve para cualquier temática
 * (fiesta infantil, bautizo, XV) cambiando `screens[].art` y los slots.
 *
 * El texto escala con `cqw` (container query units), así que la tipografía
 * mantiene su proporción con el arte en cualquier ancho de pantalla.
 */

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import ContentProtection from '@/components/templates/shared/ContentProtection';
import { getCapabilities, type EventPlan } from '@/lib/plans';

export interface CanvasSlot {
  text: string;              // admite \n; {invitado} se sustituye por el nombre del invitado
  x: number;                 // % del ancho del lienzo (centro del bloque)
  y: number;                 // % del alto
  size: number;              // tamaño de fuente en % del ancho del lienzo (cqw)
  font?: string;             // font-family
  color?: string;
  weight?: number;
  italic?: boolean;
  letterSpacing?: number;    // em
  lineHeight?: number;
  width?: number;            // ancho máximo en % del lienzo (default 84)
  align?: 'left' | 'center' | 'right';
  rotate?: number;           // grados
}

export interface CanvasView {
  art: string;               // URL del arte (Cloudinary)
  aspect: string;            // ej. '526 / 724' — debe ser el del arte
  slots: CanvasSlot[];
  maxWidth?: number;         // ancho máximo del lienzo en px
  ctaAt?: { x: number; y: number; size: number };  // botón dentro del lienzo (% y cqw)
}

export interface CanvasScreen extends CanvasView {
  // Arte horizontal opcional para pantallas anchas. Lleva sus propios slots
  // porque en landscape el texto rara vez va donde iba en retrato.
  desktop?: CanvasView;
}

export interface CanvasConfig {
  screens?: CanvasScreen[];
  fonts?: string[];          // familias de Google Fonts a cargar, ej. ['Yellowtail', 'Quicksand:wght@500;700']
  pageBg?: string;
  maxWidth?: number;         // ancho máximo del lienzo en px (default 620)
  cta?: { label?: string; color?: string; bg?: string; font?: string };
  whatsapp?: { number?: string; message?: string };
  rsvp?: { maxPlusOnes?: number };
  hostName?: string;         // nombre del festejado, para los textos del modal
}

interface Props {
  config: CanvasConfig;
  plan?: EventPlan;
  eventId?: string;
  guestToken?: string;
  maxCompanions?: number;
  companionNames?: string[];
  guestName?: string;
  hasExistingRsvp?: boolean;
}

const css = `
  .cv-page { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; padding: 2rem 1rem 3rem; }
  .cv-screen { position: relative; width: 100%; container-type: inline-size; }
  .cv-desktop { display: none; }
  @media (min-width: 900px) {
    .cv-has-desktop .cv-mobile { display: none; }
    .cv-has-desktop .cv-desktop { display: block; }
  }
  .cv-screen img { display: block; width: 100%; height: auto; }
  .cv-slot { position: absolute; margin: 0; white-space: pre-line; transform: translate(-50%, -50%); }
  .cv-cta-in { position: absolute; transform: translate(-50%, -50%); white-space: nowrap; border: none; cursor: pointer; padding: 0.55em 1.7em; border-radius: 999px; box-shadow: 0 4px 14px rgba(0,0,0,0.15); text-decoration: none; display: inline-block; }
  .cv-btn { border: none; cursor: pointer; padding: 0.95rem 2.4rem; border-radius: 999px; font-size: 15px; letter-spacing: 0.04em; box-shadow: 0 6px 18px rgba(0,0,0,0.12); }
  .cv-done { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 15px; }
  .cv-link { display: block; margin-top: 0.7rem; background: none; border: none; font-size: 12px; text-decoration: underline; opacity: 0.6; cursor: pointer; color: inherit; }
  .cv-backdrop { position: fixed; inset: 0; background: rgba(40,30,50,0.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1rem; z-index: 50; }
  .cv-modal { position: relative; background: #fff; border-radius: 22px; width: min(92vw, 400px); max-height: 88dvh; overflow-y: auto; padding: 2rem 1.5rem; display: flex; flex-direction: column; gap: 1.1rem; text-align: center; color: #4A4463; }
  .cv-modal h3 { margin: 0; font-size: 22px; }
  .cv-close { position: absolute; top: 10px; right: 14px; background: none; border: none; font-size: 26px; line-height: 1; cursor: pointer; color: #B9B3CC; }
  .cv-choice { display: flex; gap: 0.6rem; }
  .cv-choice button { flex: 1; padding: 0.85rem; border-radius: 14px; border: none; cursor: pointer; font-size: 14px; }
  .cv-row { display: flex; align-items: center; gap: 0.6rem; text-align: left; font-size: 14px; padding: 0.5rem 0; }
  .cv-check { width: 22px; height: 22px; border-radius: 50%; border: 1px solid #D8D2E6; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
  .cv-check.on { background: #7ECB9B; border-color: #7ECB9B; color: #fff; }
  .cv-step { display: flex; align-items: center; justify-content: center; gap: 1.2rem; margin: 0.5rem 0; }
  .cv-step button { width: 34px; height: 34px; border-radius: 50%; border: 1px solid #D8D2E6; background: #fff; font-size: 18px; cursor: pointer; color: #6E6890; }
  .cv-step button:disabled { opacity: 0.35; cursor: default; }
  .cv-input { width: 100%; padding: 0.7rem 0.9rem; border: 1px solid #E2DDEE; border-radius: 12px; font-size: 14px; margin-top: 0.4rem; }
  .cv-error { color: #C0392B; font-size: 13px; }
  .cv-powered { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; opacity: 0.45; }
`;

function slotStyle(s: CanvasSlot): React.CSSProperties {
  return {
    left: `${s.x}%`,
    top: `${s.y}%`,
    width: `${s.width ?? 84}%`,
    fontSize: `${s.size}cqw`,
    fontFamily: s.font,
    color: s.color ?? '#4A4463',
    fontWeight: s.weight,
    fontStyle: s.italic ? 'italic' : undefined,
    letterSpacing: s.letterSpacing ? `${s.letterSpacing}em` : undefined,
    lineHeight: s.lineHeight ?? 1.25,
    textAlign: s.align ?? 'center',
    transform: `translate(-50%, -50%)${s.rotate ? ` rotate(${s.rotate}deg)` : ''}`,
  };
}

export default function CanvasTemplate({
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
  const screens = config.screens ?? [];

  const [isOpen, setIsOpen] = useState(false);
  const [rsvpDone, setRsvpDone] = useState(hasExistingRsvp);
  const [confirmed, setConfirmed] = useState<null | boolean>(null);
  const [names, setNames] = useState<string[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const hasToken = !!guestToken;
  const isDemo = !eventId && !guestToken;
  const effectiveMax = isDemo ? (maxCompanions || 2) : maxCompanions;
  const displayName = initialGuestName || (isDemo ? 'Ana García' : 'Invitado');
  const totalSeats = 1 + effectiveMax;

  useEffect(() => {
    if (isOpen) modalRef.current?.querySelector<HTMLElement>('button, input')?.focus();
  }, [isOpen]);

  const fontsHref = config.fonts?.length
    ? `https://fonts.googleapis.com/css2?${config.fonts.map(f => `family=${f.replace(/ /g, '+')}`).join('&')}&display=swap`
    : null;

  async function handleSubmit() {
    if (!hasToken || !eventId) { setRsvpDone(true); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: guestToken,
          eventId,
          name: displayName,
          seats: confirmed ? 1 + names.filter((_, i) => checked[i]).length : 0,
          companionNames: confirmed ? names.filter((_, i) => checked[i]) : [],
          status: confirmed ? 'confirmed' : 'declined',
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'Error al guardar'); return; }
      setRsvpDone(true);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  const cta = config.cta ?? {};

  // ponytail: si alguna vista coloca el CTA dentro del lienzo, se omite el externo.
  // Si sólo una de las dos variantes lo trae, esa variante se queda sin botón.
  const anyCtaInside = screens.some(sc => sc.ctaAt || sc.desktop?.ctaAt);

  const renderCta = (cls: string, style?: React.CSSProperties) => {
    const base: React.CSSProperties = { background: cta.bg ?? '#F59BC3', color: cta.color ?? '#fff', fontFamily: cta.font, ...style };
    if (rsvpDone) {
      return (
        <button className={cls} style={{ ...base, background: '#7ECB9B' }}
          onClick={() => { setRsvpDone(false); setConfirmed(null); setIsOpen(true); }}>
          {confirmed === false ? 'No podré asistir · cambiar' : '¡Confirmado! · cambiar'}
        </button>
      );
    }
    if (caps.rsvpMode === 'whatsapp' && config.whatsapp?.number) {
      return (
        <a className={cls} style={base} target="_blank" rel="noopener noreferrer"
          href={`https://wa.me/${config.whatsapp.number}?text=${encodeURIComponent(config.whatsapp.message ?? '')}`}>
          {cta.label ?? 'Confirmar por WhatsApp'}
        </a>
      );
    }
    return (
      <button className={cls} style={base} onClick={() => setIsOpen(true)}>
        {cta.label ?? 'Confirmar asistencia'}
      </button>
    );
  };
  const width = (v: CanvasView) => `min(100%, ${v.maxWidth ?? config.maxWidth ?? 620}px)`;

  const renderView = (v: CanvasView, cls: string) => (
    <div className={`cv-screen ${cls}`} style={{ width: width(v), aspectRatio: v.aspect }}>
      {/* loading=lazy evita que el navegador descargue la variante oculta */}
      <img src={v.art} alt="" loading="lazy" />
      {v.slots.map((slot, j) => (
        <p key={j} className="cv-slot" style={slotStyle(slot)}>
          {slot.text.replace(/\{invitado\}/g, displayName)}
        </p>
      ))}
      {v.ctaAt && renderCta('cv-cta-in', {
        left: `${v.ctaAt.x}%`,
        top: `${v.ctaAt.y}%`,
        fontSize: `${v.ctaAt.size}cqw`,
      })}
    </div>
  );

  return (
    <ContentProtection>
      {fontsHref && <link rel="stylesheet" href={fontsHref} precedence="default" />}
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="cv-page" style={{ background: config.pageBg ?? '#F6F1FA' }}>
        {screens.map((screen, i) => (
          <div key={i} className={screen.desktop ? 'cv-has-desktop' : undefined} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            {renderView(screen, 'cv-mobile')}
            {screen.desktop && renderView(screen.desktop, 'cv-desktop')}
          </div>
        ))}

        {!anyCtaInside && renderCta('cv-btn')}

        <p className="cv-powered" style={{ color: '#6E6890' }}>powered by moments</p>
      </div>

      {isOpen && (caps.rsvpMode === 'modalManual' || hasToken || isDemo) && (
        <div className="cv-backdrop" onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div className="cv-modal" ref={modalRef} style={{ fontFamily: cta.font }}>
            <button className="cv-close" onClick={() => setIsOpen(false)} aria-label="Cerrar">×</button>

            {rsvpDone ? (
              <>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(126,203,155,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <Check size={22} style={{ color: '#7ECB9B' }} />
                </div>
                <h3>{confirmed === false ? 'Respuesta registrada' : '¡Nos vemos en la fiesta!'}</h3>
                <p style={{ fontSize: 13, opacity: 0.65 }}>
                  {confirmed === false ? 'Gracias por avisarnos.' : 'Tu confirmación quedó guardada.'}
                </p>
              </>
            ) : (
              <>
                <h3>¡Hola {displayName}!</h3>
                <p style={{ fontSize: 13, opacity: 0.65 }}>
                  Tienes {totalSeats} {totalSeats === 1 ? 'lugar reservado' : 'lugares reservados'}
                  {config.hostName ? ` para el cumpleaños de ${config.hostName}` : ''}.
                </p>

                {error && <p className="cv-error">{error}</p>}

                {confirmed === null ? (
                  <div className="cv-choice">
                    <button
                      style={{ background: '#7ECB9B', color: '#fff' }}
                      onClick={() => {
                        setConfirmed(true);
                        if (isPlus) { setNames([]); setChecked([]); }
                        else {
                          const list = isDemo
                            ? ['Acompañante 1', 'Acompañante 2']
                            : (initialCompanionNames.length ? initialCompanionNames : Array.from({ length: maxCompanions }, (_, i) => `Acompañante ${i + 1}`));
                          setNames(list);
                          setChecked(Array(list.length).fill(true));
                        }
                      }}
                    >
                      Sí, asistiré
                    </button>
                    <button style={{ background: '#F1EDF7', color: '#6E6890' }} onClick={() => setConfirmed(false)}>
                      No podré ir
                    </button>
                  </div>
                ) : confirmed ? (
                  <>
                    <div>
                      <div className="cv-row">
                        <span className="cv-check on"><Check size={12} /></span>
                        <span style={{ flex: 1 }}>{displayName}</span>
                        <span style={{ fontSize: 11, opacity: 0.55 }}>Titular</span>
                      </div>

                      {isPlus ? (
                        effectiveMax > 0 && (
                          <>
                            <div className="cv-step">
                              <button type="button" disabled={names.length === 0}
                                onClick={() => { setNames(p => p.slice(0, -1)); setChecked(p => p.slice(0, -1)); }}>−</button>
                              <span>{names.length} {names.length === 1 ? 'acompañante' : 'acompañantes'}</span>
                              <button type="button" disabled={names.length >= effectiveMax}
                                onClick={() => { setNames(p => [...p, '']); setChecked(p => [...p, true]); }}>+</button>
                            </div>
                            {names.map((n, i) => (
                              <input key={i} className="cv-input" value={n} placeholder={`Nombre del acompañante ${i + 1}`}
                                onChange={e => { const next = [...names]; next[i] = e.target.value; setNames(next); }} />
                            ))}
                          </>
                        )
                      ) : (
                        names.map((n, i) => {
                          const on = checked[i] ?? true;
                          return (
                            <div key={i} className="cv-row">
                              <span className={`cv-check${on ? ' on' : ''}`} onClick={() => { const u = [...checked]; u[i] = !u[i]; setChecked(u); }}>
                                {on && <Check size={12} />}
                              </span>
                              <span style={{ flex: 1, opacity: on ? 1 : 0.4, textDecoration: on ? 'none' : 'line-through' }}>{n}</span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <button className="cv-btn" disabled={submitting} onClick={handleSubmit}
                      style={{ background: cta.bg ?? '#F59BC3', color: '#fff' }}>
                      {submitting ? 'Guardando…' : 'Enviar confirmación'}
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 14 }}>Lamentamos que no puedas acompañarnos.</p>
                    <button className="cv-btn" disabled={submitting} onClick={handleSubmit}
                      style={{ background: '#B9B3CC', color: '#fff' }}>
                      {submitting ? 'Guardando…' : 'Enviar respuesta'}
                    </button>
                    <button className="cv-link" onClick={() => setConfirmed(null)}>Volver</button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </ContentProtection>
  );
}
