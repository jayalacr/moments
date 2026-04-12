'use client';

import React, { useState, useRef } from 'react';
import { cld, T } from '@/lib/cloudinary';
import type { ImageBlock, ImageLayout } from '@/lib/imageLayout';
import { LAYOUT_LIMITS } from '@/lib/imageLayout';

// ---------------------------------------------------------------------------
// Secciones fijas de la invitación Plus/Deluxe (orden de aparición)
// ---------------------------------------------------------------------------
const SECTION_SLOTS = [
  { id: 'hero',        label: 'Portada' },
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
// Iconos SVG para cada layout
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

const LAYOUT_OPTIONS: { id: ImageLayout; label: string; hint: string; Icon: () => React.JSX.Element }[] = [
  { id: 'full',     label: 'Ancho completo', hint: '1 imagen',    Icon: IconFull     },
  { id: 'duo',      label: 'Dos imágenes',   hint: '2 imágenes',  Icon: IconDuo      },
  { id: 'carousel', label: 'Carrusel',       hint: '2 o más',     Icon: IconCarousel },
];

// ---------------------------------------------------------------------------
// Interfaz de colores (compatible con LIGHT/DARK de EditarForm)
// ---------------------------------------------------------------------------
interface Colors {
  border: string;
  accent: string;
  accentLight: string;
  text: string;
  muted: string;
  mutedLight: string;
  card: string;
  font: string;
}

interface Props {
  /** Array completo: [0]=hero, [1+]=galería */
  images: string[];
  layout: ImageBlock[];
  onChange: (layout: ImageBlock[]) => void;
  activeSections: Record<string, boolean>;
  C: Colors;
}

// ---------------------------------------------------------------------------
// Helpers de selección según layout
// ---------------------------------------------------------------------------
function applySelection(prev: number[], idx: number, imgLayout: ImageLayout): number[] {
  const { max } = LAYOUT_LIMITS[imgLayout];
  if (prev.includes(idx)) return prev.filter(i => i !== idx);
  if (max === 1)  return [idx];
  if (prev.length < max) return [...prev, idx];
  // para duo (max=2): rotar — quita el más antiguo y agrega el nuevo
  return [...prev.slice(1), idx];
}

function isReady(selected: number[], imgLayout: ImageLayout): boolean {
  const { min } = LAYOUT_LIMITS[imgLayout];
  return selected.length >= min;
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function ImageLayoutEditor({ images, layout, onChange, activeSections, C }: Props) {
  const [addingAtSlot,  setAddingAtSlot]  = useState<string | null>(null);
  const [editingSlot,   setEditingSlot]   = useState<string | null>(null);
  const [formLayout,    setFormLayout]    = useState<ImageLayout>('full');
  const [formSelected,  setFormSelected]  = useState<number[]>([]);
  const draggedSlotRef = useRef<string | null>(null);

  const galleryIndexes = images
    .map((url, i) => ({ url, i }))
    .filter(({ url, i }) => i > 0 && url && url.trim() !== '')
    .map(({ i }) => i);

  const usedIndexes = new Set<number>(
    layout.flatMap(b => b.imageIndexes ?? [])
  );

  function getBlock(slotId: string): ImageBlock | undefined {
    return layout.find(b => b.afterSection === slotId);
  }

  function removeBlock(slotId: string) {
    onChange(layout.filter(b => b.afterSection !== slotId));
  }

  function openAdd(slotId: string) {
    setAddingAtSlot(slotId);
    setEditingSlot(null);
    setFormLayout('full');
    setFormSelected([]);
  }

  function openEdit(slotId: string) {
    const block = getBlock(slotId);
    if (!block) return;
    setEditingSlot(slotId);
    setAddingAtSlot(null);
    // Normaliza formato antiguo: type→layout, imageIndex→imageIndexes
    const legacyLayout = (block as { type?: string }).type === 'single' ? 'full' : 'carousel';
    setFormLayout(block.layout ?? (legacyLayout as ImageLayout));
    const legacyIndex = (block as { imageIndex?: number }).imageIndex;
    setFormSelected(block.imageIndexes ?? (legacyIndex != null ? [legacyIndex] : []));
  }

  function cancelForm() {
    setAddingAtSlot(null);
    setEditingSlot(null);
    setFormSelected([]);
  }

  function commitForm(slotId: string, isEdit: boolean) {
    if (!isReady(formSelected, formLayout)) return;
    const newBlock: ImageBlock = {
      afterSection: slotId,
      layout: formLayout,
      imageIndexes: formSelected,
    };
    if (isEdit) {
      onChange(layout.map(b => b.afterSection === slotId ? newBlock : b));
    } else {
      onChange([...layout, newBlock]);
    }
    cancelForm();
  }

  function changeFormLayout(next: ImageLayout) {
    setFormLayout(next);
    // Recorta selección si el nuevo max es menor
    const { max } = LAYOUT_LIMITS[next];
    if (formSelected.length > max) setFormSelected(formSelected.slice(-max));
  }

  // Drag & drop entre slots vacíos
  function handleDragStart(slotId: string) { draggedSlotRef.current = slotId; }
  function handleDrop(targetSlotId: string) {
    const from = draggedSlotRef.current;
    draggedSlotRef.current = null;
    if (!from || from === targetSlotId) return;
    if (layout.some(b => b.afterSection === targetSlotId)) return;
    onChange(layout.map(b => b.afterSection === from ? { ...b, afterSection: targetSlotId } : b));
  }

  // ---------------------------------------------------------------------------
  // Estilos inline
  // ---------------------------------------------------------------------------
  const labelStyle: React.CSSProperties = {
    fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase',
    color: C.mutedLight, fontFamily: C.font,
    padding: '3px 8px', border: `1px solid ${C.border}`, borderRadius: '4px', display: 'inline-block',
  };

  const thumbStyle: React.CSSProperties = {
    width: '44px', height: '44px', objectFit: 'cover',
    borderRadius: '4px', border: `1px solid ${C.border}`, display: 'block',
  };

  function layoutCard(opt: typeof LAYOUT_OPTIONS[number], active: boolean): React.CSSProperties {
    return {
      flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
      padding: '10px 6px 8px', borderRadius: '8px', cursor: 'pointer',
      border: `1.5px solid ${active ? C.accent : C.border}`,
      backgroundColor: active ? C.accentLight : 'transparent',
      color: active ? C.accent : C.muted,
      transition: 'border-color .15s, background .15s',
    };
  }

  function imgSelBtn(idx: number, available: boolean): React.CSSProperties {
    const selected = formSelected.includes(idx);
    const { max } = LAYOUT_LIMITS[formLayout];
    const maxed = !selected && formSelected.length >= max;
    return {
      padding: 0, border: `2.5px solid ${selected ? C.accent : C.border}`,
      borderRadius: '6px', cursor: !available || maxed ? 'not-allowed' : 'pointer',
      opacity: (!available || maxed) ? 0.35 : 1, background: 'none',
      position: 'relative',
    };
  }

  // ---------------------------------------------------------------------------
  // Sub-formulario reutilizable (agregar / editar)
  // ---------------------------------------------------------------------------
  function BlockForm({ slotId, isEdit }: { slotId: string; isEdit: boolean }) {
    // En modo edición, las imágenes del bloque actual no cuentan como "usadas por otros"
    const editingBlock = isEdit ? getBlock(slotId) : undefined;
    const editingIndexes = new Set(editingBlock?.imageIndexes ?? []);
    const usedByOthers = new Set(
      layout
        .filter(b => b.afterSection !== slotId)
        .flatMap(b => b.imageIndexes ?? [])
    );
    const availableIdxs = galleryIndexes.filter(i => !usedByOthers.has(i));
    const { min } = LAYOUT_LIMITS[formLayout];
    const ready = isReady(formSelected, formLayout);

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
              <button
                key={opt.id}
                type="button"
                onClick={() => changeFormLayout(opt.id)}
                style={layoutCard(opt, formLayout === opt.id)}
              >
                <opt.Icon />
                <span style={{ fontSize: '11px', fontFamily: C.font, fontWeight: 500 }}>{opt.label}</span>
                <span style={{ fontSize: '10px', fontFamily: C.font, opacity: 0.7 }}>{opt.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selector de imágenes */}
        <div>
          <p style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.muted, fontFamily: C.font, marginBottom: '8px' }}>
            {formLayout === 'full'
              ? 'Selecciona 1 imagen'
              : formLayout === 'duo'
                ? `Selecciona 2 imágenes (${formSelected.length}/2)`
                : `Selecciona 2 o más imágenes (${formSelected.length} elegidas)`}
          </p>
          {availableIdxs.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableIdxs.map(idx => {
                const selected = formSelected.includes(idx);
                const { max } = LAYOUT_LIMITS[formLayout];
                const maxed = !selected && formSelected.length >= max;
                const isFromEditing = editingIndexes.has(idx);
                return (
                  <div key={idx} style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={() => !maxed && setFormSelected(applySelection(formSelected, idx, formLayout))}
                      title={`Imagen ${idx + 1}${isFromEditing ? ' (actual)' : ''}`}
                      style={imgSelBtn(idx, true)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cld(images[idx], T.thumb)}
                        alt={`Imagen ${idx + 1}`}
                        style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '4px', display: 'block' }}
                      />
                    </button>
                    {selected && (
                      <span style={{
                        position: 'absolute', top: '3px', right: '3px',
                        width: '16px', height: '16px', borderRadius: '50%',
                        backgroundColor: C.accent, color: '#fff',
                        fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, pointerEvents: 'none',
                      }}>
                        {formSelected.indexOf(idx) + 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: C.muted, fontFamily: C.font, margin: 0 }}>
              No hay imágenes disponibles. Sube más en la sección "Fotos".
            </p>
          )}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => commitForm(slotId, isEdit)}
            disabled={!ready}
            style={{
              padding: '7px 20px', border: 'none', borderRadius: '6px',
              backgroundColor: ready ? C.accent : C.border,
              color: ready ? '#fff' : C.muted,
              fontSize: '12px', cursor: ready ? 'pointer' : 'not-allowed', fontFamily: C.font,
            }}
          >
            {isEdit ? 'Guardar cambios' : 'Agregar bloque'}
          </button>
          <button
            type="button"
            onClick={cancelForm}
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
              Elige {min - formSelected.length} imagen{min - formSelected.length > 1 ? 'es' : ''} más
            </span>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render principal
  // ---------------------------------------------------------------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Pool de imágenes */}
      {galleryIndexes.length === 0 ? (
        <p style={{ fontSize: '13px', color: C.muted, fontFamily: C.font, margin: 0 }}>
          Primero sube imágenes en la sección "Fotos" para posicionarlas aquí.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: C.muted, fontFamily: C.font }}>
            Imágenes de galería
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {galleryIndexes.map(idx => (
              <div key={idx} style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cld(images[idx], T.thumb)}
                  alt={`Imagen ${idx + 1}`}
                  title={usedIndexes.has(idx) ? 'Colocada en un bloque' : `Imagen ${idx + 1}`}
                  style={{ ...thumbStyle, opacity: usedIndexes.has(idx) ? 0.35 : 1 }}
                />
                {usedIndexes.has(idx) && (
                  <span style={{
                    position: 'absolute', bottom: '2px', right: '2px',
                    width: '14px', height: '14px', borderRadius: '50%',
                    backgroundColor: C.accent, color: '#fff',
                    fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slots de sección */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {SECTION_SLOTS.map(slot => {
          const block    = getBlock(slot.id);
          const isActive = activeSections[slot.id] !== false;
          const isAdding = addingAtSlot === slot.id;
          const isEditing = editingSlot === slot.id;

          return (
            <div key={slot.id}>
              {/* Etiqueta de sección */}
              <div style={{ padding: '10px 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={labelStyle}>{slot.label}</span>
                {!isActive && <span style={{ fontSize: '10px', color: C.mutedLight, fontFamily: C.font }}>(oculta)</span>}
              </div>

              {/* Zona de drop */}
              <div onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(slot.id)} style={{ marginBottom: '4px' }}>

                {isEditing ? (
                  <BlockForm slotId={slot.id} isEdit={true} />

                ) : block ? (
                  /* Bloque colocado */
                  <div
                    draggable
                    onDragStart={() => handleDragStart(slot.id)}
                    style={{
                      border: `1px solid ${C.border}`, borderRadius: '8px', padding: '8px 12px',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      backgroundColor: C.card, cursor: 'grab', userSelect: 'none',
                    }}
                  >
                    <span style={{ color: C.mutedLight, fontSize: '18px', lineHeight: 1, cursor: 'grab' }}>⠿</span>

                    {/* Thumbs */}
                    {(() => {
                      const idxs = block.imageIndexes ?? [];
                      return (
                        <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                          {idxs.slice(0, 4).map(idx =>
                            images[idx] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={idx} src={cld(images[idx], T.thumb)} alt=""
                                style={{ ...thumbStyle, width: '36px', height: '36px' }} />
                            ) : null
                          )}
                          {idxs.length > 4 && (
                            <div style={{
                              ...thumbStyle, width: '36px', height: '36px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '11px', color: C.muted, backgroundColor: C.accentLight,
                            }}>+{idxs.length - 4}</div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Badge layout */}
                    <span style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: C.accent, fontFamily: C.font, whiteSpace: 'nowrap' }}>
                      {(block.layout && LAYOUT_LIMITS[block.layout]?.label) ?? 'Foto'}
                    </span>

                    {/* Editar */}
                    <button
                      type="button"
                      onClick={() => openEdit(slot.id)}
                      title="Editar bloque"
                      style={{
                        padding: '4px 10px', border: `1px solid ${C.border}`, borderRadius: '6px',
                        backgroundColor: 'transparent', color: C.muted,
                        fontSize: '11px', cursor: 'pointer', fontFamily: C.font, flexShrink: 0,
                      }}
                    >Editar</button>

                    {/* Eliminar */}
                    <button
                      type="button"
                      onClick={() => removeBlock(slot.id)}
                      title="Eliminar bloque"
                      style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        border: `1px solid ${C.border}`, backgroundColor: 'transparent',
                        color: C.mutedLight, fontSize: '15px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >×</button>
                  </div>

                ) : isAdding ? (
                  <BlockForm slotId={slot.id} isEdit={false} />

                ) : (
                  /* Botón "+" */
                  <button
                    type="button"
                    onClick={() => openAdd(slot.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '9px 14px', border: `1px dashed ${C.border}`, borderRadius: '8px',
                      backgroundColor: 'transparent', color: C.muted,
                      fontSize: '12px', cursor: 'pointer', fontFamily: C.font,
                    }}
                  >
                    <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
                    <span>Insertar bloque de imagen</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
