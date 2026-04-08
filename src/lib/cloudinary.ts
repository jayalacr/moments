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
};
