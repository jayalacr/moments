export type ImageLayout = 'full' | 'duo' | 'carousel';

/** Bloque de imagen insertado entre secciones de la invitación */
export interface ImageBlock {
  /** ID de la sección después de la cual aparece el bloque */
  afterSection: string;
  /** Tipo de presentación visual */
  layout: ImageLayout;
  /** Índices en images[] que pertenecen a este bloque */
  imageIndexes: number[];
}

/** Cuántas imágenes acepta cada layout */
export const LAYOUT_LIMITS: Record<ImageLayout, { min: number; max: number; label: string }> = {
  full:     { min: 1, max: 1,        label: 'Ancho completo' },
  duo:      { min: 2, max: 2,        label: 'Dos imágenes'   },
  carousel: { min: 2, max: Infinity, label: 'Carrusel'       },
};
