import { track } from '@vercel/analytics';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

/**
 * Link de WhatsApp para los CTAs del sitio de marketing.
 * Devuelve null si NEXT_PUBLIC_WHATSAPP_NUMBER no está configurada — nunca un número
 * inventado: un botón ausente es preferible a uno que lleva a un número falso.
 */
export function waLink(message?: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Registra un clic a WhatsApp como evento de conversión en Vercel Analytics. */
export function trackWhatsAppClick(source: string) {
  track('WhatsApp Click', { source });
}
