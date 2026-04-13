'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cld, T } from '@/lib/cloudinary';

// ---------------------------------------------------------------------------
// Color contract — subset shared by ImageLayoutEditor and EditarForm palettes
// ---------------------------------------------------------------------------
export interface PositionerColors {
  border: string;
  accent: string;
  accentLight: string;
  text: string;
  muted: string;
  card: string;
  font: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function parseObjectPosition(str?: string): { x: number; y: number } {
  if (!str) return { x: 50, y: 50 };
  const map: Record<string, number> = { center: 50, left: 0, right: 100, top: 0, bottom: 100 };
  const [a, b] = str.trim().split(/\s+/);
  const x = a in map ? map[a] : (parseFloat(a) || 50);
  const y = b ? (b in map ? map[b] : (parseFloat(b) || 50)) : 50;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

// ---------------------------------------------------------------------------
// PhotoPositioner — drag to reposition + scroll/pinch/buttons to zoom
// onChange fires on drag-end and on each zoom step.
// ---------------------------------------------------------------------------
export function PhotoPositioner({
  url, objectPosition, scale = 1, onChange, C, aspectRatio = '4/3',
}: {
  url: string;
  objectPosition?: string;
  /** Zoom level. 1 = default cover fill, >1 = zoomed in. Range [1, 3]. */
  scale?: number;
  onChange: (pos: string, scale: number) => void;
  C: PositionerColors;
  /** CSS aspect-ratio matching the template crop, e.g. "9/16", "39/14". */
  aspectRatio?: string;
}) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const imgRef        = useRef<HTMLImageElement>(null);
  const [isDragging,  setIsDragging]  = useState(false);
  const [isHovered,   setIsHovered]   = useState(false);
  const [scaleDisplay, setScaleDisplay] = useState(scale);

  // All mutable drag/zoom state lives in a ref to avoid stale closures
  const d = useRef({
    active: false,
    startClientX: 0, startClientY: 0,
    startPosX: 50,   startPosY: 50,
    currentX: 50,    currentY: 50,
    currentScale: scale,
  });

  // Stable callback ref — avoids wheel/pinch effects needing onChange in deps
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  // Sync from props when they change (e.g. modal opens fresh)
  useEffect(() => {
    const { x, y } = parseObjectPosition(objectPosition);
    d.current.currentX = x;
    d.current.currentY = y;
    d.current.currentScale = scale;
    setScaleDisplay(scale);
    applyDOM(x, y, scale);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectPosition, scale]);

  function applyDOM(x: number, y: number, s: number) {
    const img = imgRef.current;
    if (!img) return;
    img.style.objectPosition  = `${x}% ${y}%`;
    img.style.transform       = `scale(${s})`;
    img.style.transformOrigin = `${x}% ${y}%`;
  }

  function applyPos(clientX: number, clientY: number) {
    if (!d.current.active || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(100, d.current.startPosX - ((clientX - d.current.startClientX) / rect.width)  * 150));
    const newY = Math.max(0, Math.min(100, d.current.startPosY - ((clientY - d.current.startClientY) / rect.height) * 150));
    d.current.currentX = newX;
    d.current.currentY = newY;
    applyDOM(newX, newY, d.current.currentScale);
  }

  function applyZoom(newScale: number) {
    const s = Math.max(0.1, Math.min(5, newScale));
    d.current.currentScale = s;
    setScaleDisplay(s);
    applyDOM(d.current.currentX, d.current.currentY, s);
    onChangeRef.current(
      `${Math.round(d.current.currentX * 10) / 10}% ${Math.round(d.current.currentY * 10) / 10}%`,
      Math.round(s * 100) / 100,
    );
  }

  function reset() {
    d.current.currentX = 50;
    d.current.currentY = 50;
    d.current.currentScale = 1;
    setScaleDisplay(1);
    applyDOM(50, 50, 1);
    onChangeRef.current('50% 50%', 1);
  }

  function startDrag(clientX: number, clientY: number) {
    d.current.active       = true;
    d.current.startClientX = clientX;
    d.current.startClientY = clientY;
    d.current.startPosX    = d.current.currentX;
    d.current.startPosY    = d.current.currentY;
    setIsDragging(true);
  }

  function endDrag() {
    if (!d.current.active) return;
    d.current.active = false;
    setIsDragging(false);
    onChangeRef.current(
      `${Math.round(d.current.currentX)}% ${Math.round(d.current.currentY)}%`,
      Math.round(d.current.currentScale * 100) / 100,
    );
  }

  // ── Mouse drag (document-level, only while dragging) ───────────────────────
  useEffect(() => {
    if (!isDragging) return;
    const onMM = (e: MouseEvent) => applyPos(e.clientX, e.clientY);
    const onMU = () => endDrag();
    document.addEventListener('mousemove', onMM);
    document.addEventListener('mouseup',   onMU);
    return () => {
      document.removeEventListener('mousemove', onMM);
      document.removeEventListener('mouseup',   onMU);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  // ── Touch (1-finger drag) + pinch zoom + wheel zoom — container-level ──────
  const lastPinchDist = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      applyZoom(d.current.currentScale + (e.deltaY > 0 ? -0.15 : 0.15));
    };

    const onTM = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        // Pinch zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastPinchDist.current !== null) {
          applyZoom(d.current.currentScale * (dist / lastPinchDist.current));
        }
        lastPinchDist.current = dist;
      } else if (e.touches.length === 1 && d.current.active) {
        applyPos(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onTE = () => {
      lastPinchDist.current = null;
      endDrag();
    };

    el.addEventListener('wheel',      onWheel, { passive: false });
    el.addEventListener('touchmove',  onTM,    { passive: false });
    el.addEventListener('touchend',   onTE);
    return () => {
      el.removeEventListener('wheel',     onWheel);
      el.removeEventListener('touchmove', onTM);
      el.removeEventListener('touchend',  onTE);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { x: initX, y: initY } = parseObjectPosition(objectPosition);
  const btnBase: React.CSSProperties = {
    width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${C.border}`,
    background: C.card, color: C.text, fontSize: '18px', lineHeight: 1,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: C.font, flexShrink: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Crop preview */}
      <div
        ref={containerRef}
        onMouseDown={e => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
        onTouchStart={e => {
          if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
          } else {
            e.preventDefault();
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { if (!isDragging) setIsHovered(false); }}
        style={{
          width: '100%', aspectRatio, overflow: 'hidden', position: 'relative',
          borderRadius: '8px', border: `2px solid ${isDragging ? C.accent : C.border}`,
          cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none',
          transition: 'border-color 0.15s',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={cld(url, T.centered)}
          alt=""
          draggable={false}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            objectPosition: `${initX}% ${initY}%`,
            transform: `scale(${scale})`,
            transformOrigin: `${initX}% ${initY}%`,
            display: 'block', pointerEvents: 'none',
          }}
        />

        {isDragging && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: `${C.accent}28`, pointerEvents: 'none' }} />
        )}

        {(isHovered || isDragging) && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              backgroundColor: isDragging ? C.accent : 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}>
              <span style={{ color: '#fff', fontSize: '22px', lineHeight: 1 }}>✥</span>
            </div>
          </div>
        )}

        <div style={{ position: 'absolute', bottom: '8px', left: '10px', pointerEvents: 'none' }}>
          <span style={{
            fontSize: '11px', color: '#fff', fontFamily: C.font,
            backgroundColor: 'rgba(0,0,0,0.45)', padding: '3px 8px', borderRadius: '4px',
          }}>
            {isDragging ? 'Arrastrando…' : 'Arrastra para reposicionar'}
          </span>
        </div>
      </div>

      {/* Zoom controls + Reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => applyZoom(d.current.currentScale - 0.15)}
          title="Alejar"
          style={btnBase}
        >−</button>
        <div 
          onClick={reset}
          style={{
            flex: 1, textAlign: 'center', fontSize: '12px', fontFamily: C.font,
            color: C.muted, letterSpacing: '0.5px', cursor: 'pointer',
            padding: '4px', borderRadius: '4px', border: `1px solid transparent`,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = C.muted; }}
        >
          {Math.round(scaleDisplay * 100)}%
          <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '1px' }}>Restablecer</div>
        </div>
        <button
          type="button"
          onClick={() => applyZoom(d.current.currentScale + 0.15)}
          title="Acercar"
          style={btnBase}
        >+</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PhotoPositionerModal — full-screen overlay with large realistic preview
// ---------------------------------------------------------------------------
export function PhotoPositionerModal({
  url, objectPosition, scale, label, aspectRatio = '4/3', aspectRatioDesktop, onConfirm, onClose, C,
}: {
  url: string;
  objectPosition?: string;
  scale?: number;
  label?: string;
  /** Match the exact crop ratio used in the template (e.g. "9/16", "39/14"). */
  aspectRatio?: string;
  aspectRatioDesktop?: string;
  onConfirm: (pos: string, scale: number) => void;
  onClose: () => void;
  C: PositionerColors;
}) {
  const [pendingPos,   setPendingPos]   = useState(objectPosition ?? 'center center');
  const [pendingScale, setPendingScale] = useState(scale ?? 1);
  const [viewMode,     setViewMode]     = useState<'mobile' | 'desktop'>('mobile');

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.card, borderRadius: '14px',
          width: '100%', maxWidth: viewMode === 'mobile' ? '420px' : '900px',
          maxHeight: '92vh', overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          transition: 'max-width 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: `1px solid ${C.border}`,
          position: 'sticky', top: 0, background: C.card, zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontFamily: C.font, color: C.text, fontWeight: 600 }}>
              {label ?? 'Ajustar foto'}
            </span>
            {aspectRatioDesktop && (
              <div style={{ display: 'flex', backgroundColor: C.border, borderRadius: '6px', padding: '2px' }}>
                <button
                  onClick={() => setViewMode('mobile')}
                  style={{
                    padding: '3px 8px', fontSize: '10px', border: 'none', borderRadius: '4px',
                    backgroundColor: viewMode === 'mobile' ? C.card : 'transparent',
                    color: viewMode === 'mobile' ? C.accent : C.muted,
                    cursor: 'pointer', fontFamily: C.font, fontWeight: 600,
                  }}
                >Móvil</button>
                <button
                  onClick={() => setViewMode('desktop')}
                  style={{
                    padding: '3px 8px', fontSize: '10px', border: 'none', borderRadius: '4px',
                    backgroundColor: viewMode === 'desktop' ? C.card : 'transparent',
                    color: viewMode === 'desktop' ? C.accent : C.muted,
                    cursor: 'pointer', fontFamily: C.font, fontWeight: 600,
                  }}
                >Escritorio</button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '22px', color: C.muted, lineHeight: 1, padding: '2px 6px' }}
          >×</button>
        </div>

        {/* Preview */}
        <div style={{ padding: '16px' }}>
          <PhotoPositioner
            url={url}
            objectPosition={pendingPos}
            scale={pendingScale}
            onChange={(pos, s) => { setPendingPos(pos); setPendingScale(s); }}
            C={C}
            aspectRatio={viewMode === 'mobile' ? aspectRatio : (aspectRatioDesktop || aspectRatio)}
          />
          <p style={{ fontSize: '11px', color: C.muted, fontFamily: C.font, marginTop: '8px', textAlign: 'center' }}>
            Arrastra para reposicionar · scroll o pellizco para zoom
          </p>
        </div>

        {/* Footer */}
        <div style={{
          padding: '0 16px 16px', display: 'flex', gap: '8px', justifyContent: 'flex-end',
          position: 'sticky', bottom: 0, background: C.card,
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '8px 18px', borderRadius: '7px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: '13px', cursor: 'pointer', fontFamily: C.font }}
          >Cancelar</button>
          <button
            type="button"
            onClick={() => { onConfirm(pendingPos, pendingScale); onClose(); }}
            style={{ padding: '8px 18px', borderRadius: '7px', border: 'none', background: C.accent, color: '#fff', fontSize: '13px', cursor: 'pointer', fontFamily: C.font, fontWeight: 600 }}
          >Guardar</button>
        </div>
      </div>
    </div>
  );
}
