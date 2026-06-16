'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cld, T } from '@/lib/cloudinary';
import type { ImageLayout, PhotoEntry } from '@/lib/imageLayout';
import { LAYOUT_LIMITS } from '@/lib/imageLayout';
import { PhotoPositionerModal } from './PhotoPositionerModal';
import type { PositionerColors } from './PhotoPositionerModal';

const SECTION_SLOTS = [
  { id: 'hero',        label: 'Después de la portada' },
  { id: 'quote',       label: 'Cita' },
  { id: 'parents',     label: 'Nombres y Padres' },
  { id: 'itinerary',   label: 'Programa del Día' },
  { id: 'destination', label: 'Boda Destino' },
  { id: 'dressCode',   label: 'Dress Code' },
  { id: 'notes',       label: 'Indicaciones' },
  { id: 'gifts',       label: 'Mesa de Regalos' },
  { id: 'noChildren',  label: 'Solo Adultos' },
] as const;

// ---------------------------------------------------------------------------
// Iconos SVG
// ---------------------------------------------------------------------------
function IconFull() {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none" aria-hidden>
      <rect x="2" y="6" width="44" height="20" rx="2" fill="currentColor" opacity=".9"/>
    </svg>
  );
}
function IconDuo() {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none" aria-hidden>
      <rect x="2"  y="6" width="20" height="20" rx="2" fill="currentColor" opacity=".9"/>
      <rect x="26" y="6" width="20" height="20" rx="2" fill="currentColor" opacity=".9"/>
    </svg>
  );
}
function IconCarousel() {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none" aria-hidden>
      <rect x="8"  y="6" width="32" height="20" rx="2" fill="currentColor" opacity=".9"/>
      <path d="M5 16L2 13M5 16L2 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M43 16L46 13M43 16L46 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function IconTrio() {
  return (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none" aria-hidden>
      <rect x="2"  y="6" width="13" height="20" rx="2" fill="currentColor" opacity=".9"/>
      <rect x="17.5" y="6" width="13" height="20" rx="2" fill="currentColor" opacity=".9"/>
      <rect x="33" y="6" width="13" height="20" rx="2" fill="currentColor" opacity=".9"/>
    </svg>
  );
}

const LAYOUT_OPTIONS: { id: ImageLayout; label: string; hint: string; Icon: () => React.JSX.Element }[] = [
  { id: 'full',     label: 'Ancho completo', hint: '1 imagen',   Icon: IconFull     },
  { id: 'duo',      label: 'Dos imágenes',   hint: '2 imágenes', Icon: IconDuo      },
  { id: 'trio',     label: 'Trío retratos',  hint: '3 imágenes', Icon: IconTrio     },
  { id: 'carousel', label: 'Carrusel',       hint: '2 o más',    Icon: IconCarousel },
];

// ---------------------------------------------------------------------------
// Tipos de color (compatible con LIGHT/DARK de EditarForm)
// ---------------------------------------------------------------------------
interface Colors extends PositionerColors {
  mutedLight: string;
}

interface Props {
  photos: PhotoEntry[];
  onChange: (photos: PhotoEntry[]) => void;
  activeSections: Record<string, boolean>;
  C: Colors;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getBlocksForSection(photos: PhotoEntry[], section: string) {
  const sp = photos.filter(p => p.role === 'block' && p.afterSection === section);
  const map = new Map<number, PhotoEntry[]>();
  for (const p of sp) {
    const g = p.blockGroup ?? 0;
    map.set(g, [...(map.get(g) ?? []), p]);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([g, ps]) => ({
      blockGroup: g,
      layout: (ps[0].layout ?? 'full') as ImageLayout,
      urls: ps
        .sort((a, b) => (a.orderInBlock ?? 0) - (b.orderInBlock ?? 0))
        .map(p => p.url),
    }));
}

function photosAvailableForForm(
  photos: PhotoEntry[],
  section: string,
  blockGroup: number | null,
): PhotoEntry[] {
  return photos.filter(p => {
    if (!p.url) return false;
    if (p.role === 'hero') return false;
    if (!p.role) return true; // sin asignar
    // fotos del bloque que se está editando
    if (p.role === 'block' && p.afterSection === section && (p.blockGroup ?? 0) === blockGroup) return true;
    return false;
  });
}


// ---------------------------------------------------------------------------
// PhotoThumb — miniatura con hover para reposicionar
// ---------------------------------------------------------------------------
function PhotoThumb({ url, C, onPress }: { url: string; C: Colors; onPress: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      title="Ajustar posición y zoom"
      onClick={onPress}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', padding: 0, flexShrink: 0,
        border: `2px solid ${hovered ? C.accent : C.border}`,
        borderRadius: '6px', cursor: 'pointer', background: 'none',
        transition: 'border-color 0.15s',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cld(url, T.thumb)} alt=""
        style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '4px', display: 'block' }} />
      {/* Overlay con ícono al hacer hover */}
      <span style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: hovered ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.22)',
        color: '#fff', fontSize: hovered ? '18px' : '12px',
        borderRadius: '4px',
        transition: 'background 0.15s, font-size 0.15s',
        pointerEvents: 'none',
      }}>✥</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function ImageLayoutEditor({ photos, onChange, activeSections, C }: Props) {
  const [heroPickerOpen,   setHeroPickerOpen]   = useState(false);
  const [addingAtSlot,     setAddingAtSlot]     = useState<string | null>(null);
  const [editingBlock,     setEditingBlock]     = useState<{ section: string; blockGroup: number } | null>(null);
  const [formLayout,       setFormLayout]       = useState<ImageLayout>('full');
  const [formSelected,     setFormSelected]     = useState<string[]>([]); // URLs
  const [repositioningUrl, setRepositioningUrl] = useState<string | null>(null);

  const heroPhoto  = photos.find(p => p.role === 'hero');
  const unassigned = photos.filter(p => !p.role && p.url);

  function updatePosition(url: string, objectPosition: string, scale?: number) {
    onChange(photos.map(p => p.url === url ? { ...p, objectPosition, ...(scale !== undefined ? { scale } : {}) } : p));
  }

  // ── Acciones sobre photos[] ──────────────────────────────────────────────

  function assignHero(url: string) {
    onChange(photos.map(p => {
      if (p.url === url) return { url: p.url, role: 'hero' as const };
      if (p.role === 'hero') return { url: p.url, role: null };
      return p;
    }));
    setHeroPickerOpen(false);
  }

  function unassignHero() {
    onChange(photos.map(p => p.role === 'hero' ? { url: p.url, role: null } : p));
  }

  function removeBlock(section: string, blockGroup: number) {
    onChange(photos.map(p =>
      p.role === 'block' && p.afterSection === section && (p.blockGroup ?? 0) === blockGroup
        ? { url: p.url, role: null }
        : p
    ));
  }

  function commitForm(section: string) {
    const { min } = LAYOUT_LIMITS[formLayout];
    if (formSelected.length < min) return;

    // Determinar blockGroup
    let targetGroup: number;
    if (editingBlock?.section === section) {
      targetGroup = editingBlock.blockGroup;
    } else {
      const used = new Set(
        photos
          .filter(p => p.role === 'block' && p.afterSection === section)
          .map(p => p.blockGroup ?? 0)
      );
      targetGroup = 0;
      while (used.has(targetGroup)) targetGroup++;
    }

    // Limpiar el bloque anterior (si es edición)
    let next = photos.map(p =>
      p.role === 'block' && p.afterSection === section && (p.blockGroup ?? 0) === targetGroup
        ? { url: p.url, role: null as null }
        : p
    );

    // Asignar fotos seleccionadas
    next = next.map(p => {
      const idx = formSelected.indexOf(p.url);
      if (idx >= 0) {
        return {
          ...p,
          role: 'block' as const,
          afterSection: section,
          layout: formLayout,
          blockGroup: targetGroup,
          orderInBlock: idx,
        };
      }
      return p;
    });

    onChange(next);
    cancelForm();
  }

  function cancelForm() {
    setAddingAtSlot(null);
    setEditingBlock(null);
    setFormSelected([]);
  }


  function openAdd(section: string) {
    setAddingAtSlot(section);
    setEditingBlock(null);
    setFormLayout('full');
    setFormSelected([]);
  }

  function openEdit(section: string, blockGroup: number, layout: ImageLayout, urls: string[]) {
    setEditingBlock({ section, blockGroup });
    setAddingAtSlot(null);
    setFormLayout(layout);
    setFormSelected(urls);
  }

  function changeFormLayout(next: ImageLayout) {
    setFormLayout(next);
    const { max } = LAYOUT_LIMITS[next];
    if (isFinite(max) && formSelected.length > max) setFormSelected(formSelected.slice(0, max));
  }

  function toggleUrl(url: string) {
    const { max } = LAYOUT_LIMITS[formLayout];
    if (formSelected.includes(url)) {
      setFormSelected(formSelected.filter(u => u !== url));
    } else if (!isFinite(max) || formSelected.length < max) {
      setFormSelected([...formSelected, url]);
    } else if (max === 1) {
      setFormSelected([url]);
    } else {
      setFormSelected([...formSelected.slice(1), url]); // duo: reemplaza el más antiguo
    }
  }

  // ── Estilos ──────────────────────────────────────────────────────────────

  const labelStyle: React.CSSProperties = {
    fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
    color: C.mutedLight, fontFamily: C.font,
    padding: '3px 8px', border: `1px solid ${C.border}`, borderRadius: '4px',
    display: 'inline-block',
  };

  const thumbStyle: React.CSSProperties = {
    width: '44px', height: '44px', objectFit: 'cover',
    borderRadius: '4px', border: `1px solid ${C.border}`, display: 'block',
  };

  function layoutCard(id: ImageLayout): React.CSSProperties {
    const active = formLayout === id;
    return {
      flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
      padding: '10px 6px 8px', borderRadius: '8px', cursor: 'pointer',
      border: `1.5px solid ${active ? C.accent : C.border}`,
      backgroundColor: active ? C.accentLight : 'transparent',
      color: active ? C.accent : C.muted,
      transition: 'border-color .15s, background .15s',
    };
  }

  // ── Sub-formulario (agregar / editar bloque) ─────────────────────────────

  function BlockForm({ section, isEdit }: { section: string; isEdit: boolean }) {
    const bg = editingBlock && isEdit ? editingBlock.blockGroup : null;
    const available = photosAvailableForForm(photos, section, bg);
    const { min } = LAYOUT_LIMITS[formLayout];
    const ready = formSelected.length >= min;

    return (
      <div style={{
        border: `1px solid ${C.accent}`, borderRadius: '8px', padding: '14px',
        backgroundColor: C.accentLight, display: 'flex', flexDirection: 'column', gap: '14px',
      }}>
        {/* Selector de layout */}
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.muted, fontFamily: C.font, marginBottom: '8px' }}>
            Tipo de bloque
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {LAYOUT_OPTIONS.map(opt => (
              <button key={opt.id} type="button" onClick={() => changeFormLayout(opt.id)} style={layoutCard(opt.id)}>
                <opt.Icon />
                <span style={{ fontSize: '11px', fontFamily: C.font, fontWeight: 500 }}>{opt.label}</span>
                <span style={{ fontSize: '10px', fontFamily: C.font, opacity: 0.7 }}>{opt.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selector de fotos */}
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.muted, fontFamily: C.font, marginBottom: '8px' }}>
            {formLayout === 'full'
              ? 'Selecciona 1 foto'
              : formLayout === 'duo'
                ? `Selecciona 2 fotos (${formSelected.length}/2)`
                : `Selecciona 2 o más fotos (${formSelected.length} elegidas)`}
          </p>
          {available.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {available.map(p => {
                const sel = formSelected.includes(p.url);
                const { max } = LAYOUT_LIMITS[formLayout];
                const maxed = !sel && isFinite(max) && formSelected.length >= max;
                return (
                  <div key={p.url} style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => !maxed && toggleUrl(p.url)}
                      style={{
                        padding: 0,
                        border: `2.5px solid ${sel ? C.accent : C.border}`,
                        borderRadius: '6px',
                        cursor: maxed ? 'not-allowed' : 'pointer',
                        opacity: maxed ? 0.35 : 1,
                        background: 'none',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cld(p.url, T.thumb)} alt=""
                        style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '4px', display: 'block' }} />
                    </button>
                    {sel && (
                      <span style={{
                        position: 'absolute', top: '3px', right: '3px',
                        width: '16px', height: '16px', borderRadius: '50%',
                        backgroundColor: C.accent, color: '#fff',
                        fontSize: '10px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        pointerEvents: 'none',
                      }}>
                        {formSelected.indexOf(p.url) + 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: C.muted, fontFamily: C.font, margin: 0 }}>
              No hay fotos disponibles. Sube más en la sección "Fotos".
            </p>
          )}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button type="button" onClick={() => commitForm(section)} disabled={!ready}
            style={{
              padding: '7px 20px', border: 'none', borderRadius: '6px',
              backgroundColor: ready ? C.accent : C.border,
              color: ready ? '#fff' : C.muted,
              fontSize: '12px', cursor: ready ? 'pointer' : 'not-allowed', fontFamily: C.font,
            }}
          >
            {isEdit ? 'Guardar cambios' : 'Agregar bloque'}
          </button>
          <button type="button" onClick={cancelForm}
            style={{
              padding: '7px 14px', border: `1px solid ${C.border}`, borderRadius: '6px',
              backgroundColor: 'transparent', color: C.muted,
              fontSize: '12px', cursor: 'pointer', fontFamily: C.font,
            }}
          >
            Cancelar
          </button>
          {!ready && min > formSelected.length && (
            <span style={{ fontSize: '11px', color: C.mutedLight, fontFamily: C.font }}>
              Elige {min - formSelected.length} foto{min - formSelected.length > 1 ? 's' : ''} más
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (photos.filter(p => p.url).length === 0) {
    return (
      <p style={{ fontSize: '13px', color: C.muted, fontFamily: C.font, margin: 0 }}>
        Primero sube fotos en la sección "Fotos" para asignarlas aquí.
      </p>
    );
  }

  // Fotos disponibles para el picker de hero (sin asignar + hero actual)
  const heroPickerPhotos = photos.filter(p => !p.role || p.role === 'hero');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Repositioner modal ───────────────────────────────────────────── */}
      {repositioningUrl && (() => {
        const photo = photos.find(p => p.url === repositioningUrl);
        // Responsive aspect ratios matching PlusTemplate.tsx CSS
        let ratioMobile  = '4/3';
        let ratioDesktop = '16/9';

        if (photo?.role === 'hero') {
          ratioMobile  = '9/19'; 
          ratioDesktop = '16/9';
        } else if (photo?.layout === 'full') {
          ratioMobile  = '4/3';   
          ratioDesktop = '21/9';
        } else if (photo?.layout === 'duo') {
          ratioMobile  = '4/3';   
          ratioDesktop = '1/1';   
        } else if (photo?.layout === 'trio') {
          ratioMobile  = '4/3';   
          ratioDesktop = '4/5';   
        } else if (photo?.layout === 'carousel') {
          ratioMobile  = '4/3';   // carrusel en móvil: contenedor landscape (ancho > alto)
          ratioDesktop = '21/9';
        }

        return (
          <PhotoPositionerModal
            url={repositioningUrl}
            objectPosition={photo?.objectPosition}
            scale={photo?.scale}
            label="Ajustar imagen"
            aspectRatio={ratioMobile}
            aspectRatioDesktop={ratioDesktop}
            onConfirm={(pos, s) => updatePosition(repositioningUrl, pos, s)}
            onClose={() => setRepositioningUrl(null)}
            C={C}
          />
        );
      })()}

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.muted, fontFamily: C.font }}>
          Foto de portada
        </span>

        {heroPhoto ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: `1px solid ${C.border}`, borderRadius: '10px', backgroundColor: C.card, overflow: 'hidden' }}>
            {/* Controls row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cld(heroPhoto.url, T.thumb)} alt="portada"
                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: `1px solid ${C.border}`, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: '12px', color: C.muted, fontFamily: C.font }}>Foto de portada asignada</span>
              <button type="button" onClick={() => setRepositioningUrl(heroPhoto.url)}
                style={{ padding: '4px 10px', border: `1px solid ${C.border}`, borderRadius: '6px', backgroundColor: 'transparent', color: C.muted, fontSize: '11px', cursor: 'pointer', fontFamily: C.font, flexShrink: 0 }}
              >✥ Posición</button>
              <button type="button" onClick={() => setHeroPickerOpen(o => !o)}
                style={{ padding: '4px 10px', border: `1px solid ${C.border}`, borderRadius: '6px', backgroundColor: 'transparent', color: C.muted, fontSize: '11px', cursor: 'pointer', fontFamily: C.font, flexShrink: 0 }}
              >Cambiar</button>
              <button type="button" onClick={unassignHero}
                style={{ width: '24px', height: '24px', borderRadius: '50%', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.mutedLight, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >×</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setHeroPickerOpen(o => !o)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 14px', border: `1px dashed ${heroPickerOpen ? C.accent : C.border}`,
              borderRadius: '10px', backgroundColor: heroPickerOpen ? C.accentLight : 'transparent',
              color: C.muted, fontSize: '12px', cursor: 'pointer', fontFamily: C.font,
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>☆</span>
            <span>Asignar foto de portada</span>
          </button>
        )}

        {/* Picker de hero */}
        {heroPickerOpen && (
          <div style={{ border: `1px solid ${C.accent}`, borderRadius: '8px', padding: '12px', backgroundColor: C.accentLight, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '11px', color: C.muted, fontFamily: C.font, margin: 0 }}>
              Selecciona la foto que aparecerá como portada principal
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {heroPickerPhotos.map(p => {
                const isHero = p.role === 'hero';
                return (
                  <button key={p.url} type="button" onClick={() => assignHero(p.url)}
                    style={{
                      padding: 0, border: `2.5px solid ${isHero ? C.accent : C.border}`,
                      borderRadius: '6px', cursor: 'pointer', background: 'none',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cld(p.url, T.thumb)} alt=""
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '4px', display: 'block' }} />
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setHeroPickerOpen(false)}
              style={{ alignSelf: 'flex-start', padding: '5px 12px', border: `1px solid ${C.border}`, borderRadius: '6px', backgroundColor: 'transparent', color: C.muted, fontSize: '11px', cursor: 'pointer', fontFamily: C.font }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* ── Slots de sección ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.muted, fontFamily: C.font, marginBottom: '4px' }}>
          Bloques entre secciones
        </span>

        {SECTION_SLOTS.map(slot => {
          const isActive  = activeSections[slot.id] !== false;
          const blocks    = getBlocksForSection(photos, slot.id);
          const isAdding  = addingAtSlot === slot.id;
          const isEditing = editingBlock?.section === slot.id;

          return (
            <div key={slot.id} style={{ borderTop: `1px solid ${C.border}`, paddingTop: '10px', paddingBottom: '4px' }}>
              {/* Label sección */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={labelStyle}>{slot.label}</span>
                {!isActive && <span style={{ fontSize: '10px', color: C.mutedLight, fontFamily: C.font }}>(oculta)</span>}
              </div>

              {/* Bloques existentes */}
              {blocks.map(blk => {
                const editing = isEditing && editingBlock?.blockGroup === blk.blockGroup;
                return editing ? (
                  <div key={blk.blockGroup} style={{ marginBottom: '8px' }}>
                    <BlockForm section={slot.id} isEdit={true} />
                  </div>
                ) : (
                  <div key={blk.blockGroup}
                    style={{
                      border: `1px solid ${C.border}`, borderRadius: '10px',
                      backgroundColor: C.card, marginBottom: '8px', overflow: 'hidden',
                    }}
                  >
                    {/* Header: tipo + acciones */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: C.accent, fontFamily: C.font, fontWeight: 600 }}>
                        {LAYOUT_LIMITS[blk.layout]?.label ?? blk.layout}
                        <span style={{ marginLeft: '6px', fontSize: '10px', color: C.muted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                          · {blk.urls.length} foto{blk.urls.length !== 1 ? 's' : ''}
                        </span>
                      </span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button type="button"
                          onClick={() => openEdit(slot.id, blk.blockGroup, blk.layout, blk.urls)}
                          style={{ padding: '4px 12px', border: `1px solid ${C.border}`, borderRadius: '6px', backgroundColor: 'transparent', color: C.text, fontSize: '11px', cursor: 'pointer', fontFamily: C.font, fontWeight: 500 }}
                        >Editar</button>
                        <button type="button"
                          onClick={() => removeBlock(slot.id, blk.blockGroup)}
                          style={{ width: '26px', height: '26px', borderRadius: '50%', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.mutedLight, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                        >×</button>
                      </div>
                    </div>

                    {/* Grid de fotos — todas visibles, con wrap para carrusel */}
                    <div style={{ padding: '10px 12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {blk.urls.map(url => url ? (
                        <PhotoThumb key={url} url={url} C={C} onPress={() => setRepositioningUrl(url)} />
                      ) : null)}
                    </div>
                    <p style={{ margin: '0 12px 10px', fontSize: '10px', color: C.muted, fontFamily: C.font }}>
                      Toca una foto para ajustar posición y zoom
                    </p>
                  </div>
                );
              })}

              {/* Formulario agregar */}
              {isAdding && <BlockForm section={slot.id} isEdit={false} />}

              {/* Botón "+" */}
              {!isAdding && !isEditing && (
                <button type="button" onClick={() => openAdd(slot.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 14px', border: `1px dashed ${C.border}`, borderRadius: '8px',
                    backgroundColor: 'transparent', color: C.muted,
                    fontSize: '12px', cursor: 'pointer', fontFamily: C.font,
                  }}
                >
                  <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
                  <span>Insertar bloque de fotos</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Pool sin asignar ─────────────────────────────────────────────── */}
      {unassigned.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.muted, fontFamily: C.font }}>
            Sin asignar ({unassigned.length})
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {unassigned.map(p => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.url} src={cld(p.url, T.thumb)} alt=""
                style={{ ...thumbStyle, opacity: 0.5 }}
                title="Sin asignar — no se mostrará en la invitación" />
            ))}
          </div>
          <p style={{ fontSize: '11px', color: C.mutedLight, fontFamily: C.font, margin: 0 }}>
            Estas fotos no se mostrarán hasta que les asignes un rol arriba.
          </p>
        </div>
      )}

    </div>
  );
}
