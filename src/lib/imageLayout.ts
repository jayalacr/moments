export type ImageLayout = 'full' | 'duo' | 'trio' | 'carousel';

/** @deprecated Usar PhotoEntry */
export interface ImageBlock {
  afterSection: string;
  layout: ImageLayout;
  imageIndexes: number[];
}

/** Cuántas imágenes acepta cada layout */
export const LAYOUT_LIMITS: Record<ImageLayout, { min: number; max: number; label: string }> = {
  full:     { min: 1, max: 1,        label: 'Ancho completo' },
  duo:      { min: 2, max: 2,        label: 'Dos imágenes'   },
  trio:     { min: 3, max: 3,        label: 'Trío de fotos'  },
  carousel: { min: 2, max: Infinity, label: 'Carrusel'       },
};

/**
 * Foto con su rol y posición dentro de la invitación.
 * role=null  → subida pero sin asignar (no se muestra al público).
 * role=hero  → foto de portada (solo una permitida por evento).
 * role=block → aparece en un bloque posicionado después de `afterSection`.
 */
export interface PhotoEntry {
  url: string;
  role: 'hero' | 'block' | null;
  /** Solo cuando role === 'block' */
  afterSection?: string;
  layout?: ImageLayout;
  /** Agrupa fotos en un mismo bloque dentro de la sección (0-indexed) */
  blockGroup?: number;
  /** Orden dentro del bloque (0-indexed) */
  orderInBlock?: number;
  /**
   * CSS object-position value (ej. "40% 20%").
   * Default "center center" si no está definido.
   */
  objectPosition?: string;
  /**
   * Zoom level for the crop. 1 = default cover fill, >1 = zoomed in. Range [1, 3].
   * Applied as transform: scale(N) with transform-origin matching objectPosition.
   */
  scale?: number;
}
