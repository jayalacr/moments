/**
 * Construye una URL de Cloudinary con transformaciones aplicadas.
 * Si la URL no es de Cloudinary (ej. URL externa), la devuelve sin cambios.
 */
export function cld(url: string | undefined | null, transforms: string): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/${transforms}/`);
}

// Transformaciones predefinidas
export const T = {
  /** Hero desktop — landscape optimizado */
  heroDesktop: 'f_auto,q_auto,w_1600,c_fill,g_auto',
  /** Hero móvil — portrait para viewport vertical */
  heroMobile: 'f_auto,q_auto,w_800,ar_9:16,c_fill,g_auto',
  /** Foto ancho completo */
  fullDesktop: 'f_auto,q_auto,w_1400,c_fill,g_auto',
  fullMobile: 'f_auto,q_auto,w_800,ar_4:3,c_fill,g_auto',
  /** Foto centrada */
  centered: 'f_auto,q_auto,w_900,c_fill,g_auto',
  /** Fotos en dúo (la mitad del ancho) */
  duo: 'f_auto,q_auto,w_700,ar_3:4,c_fill,g_auto',
  /** Miniatura para preview en el admin */
  thumb: 'f_auto,q_auto,w_400',
};
