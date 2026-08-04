import { ROOT_DOMAIN } from './invitation';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * URL de un video de Cloudinary a partir de su public_id (sin extensión).
 * Ej: cldVideoUrl('moments/plantillas/classic') → mp4 optimizado y transcodificado.
 */
export function cldVideoUrl(publicId: string, transforms = 'f_auto,q_auto,w_1280'): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${transforms}/${publicId}.mp4`;
}

const WATERMARK = `l_text:Arial_60_bold:PREVIEW%20-%20${encodeURIComponent(ROOT_DOMAIN || 'moments.mx')},co_white,o_40,g_center`;

/**
 * Construye una URL de Cloudinary con transformaciones aplicadas.
 * Si la URL no es de Cloudinary (ej. URL externa), la devuelve sin cambios.
 */
export function cld(url: string | undefined | null, transforms: string): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/${transforms}/`);
}

/**
 * Igual que cld() pero añade marca de agua de preview centrada.
 * Usar en templates cuando el evento no esté pagado.
 */
export function cldPreview(url: string | undefined | null, transforms: string): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/${transforms}/${WATERMARK}/`);
}

// Transformaciones predefinidas
// q_auto:best — calidad máxima dentro del modo automático
// El recorte lo maneja CSS (object-fit: cover), no Cloudinary
export const T = {
  /** Hero desktop — ancho amplio para pantallas retina */
  heroDesktop: 'f_auto,q_auto:best,w_2400',
  /** Hero móvil */
  heroMobile: 'f_auto,q_auto:best,w_1200',
  /** Foto ancho completo */
  fullDesktop: 'f_auto,q_auto:best,w_2000',
  fullMobile: 'f_auto,q_auto:best,w_1000',
  /** Foto centrada */
  centered: 'f_auto,q_auto:best,w_1400',
  /** Fotos en dúo (la mitad del ancho) */
  duo: 'f_auto,q_auto:best,w_1000',
  /** Miniatura para preview en el admin */
  thumb: 'f_auto,q_auto,w_400',
  /** Variantes preview (con marca de agua) — para uso con cldPreview() */
  heroDesktopPreview: 'f_auto,q_auto:best,w_2400',
  heroMobilePreview: 'f_auto,q_auto:best,w_1200',
  fullDesktopPreview: 'f_auto,q_auto:best,w_2000',
  fullMobilePreview: 'f_auto,q_auto:best,w_1000',
};
