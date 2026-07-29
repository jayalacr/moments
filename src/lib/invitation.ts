export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? '';

export function getInvitationUrl(
  event: { subdomain?: string | null; event_type: string; slug: string },
  token?: string
): string {
  const query = token ? `?id=${token}` : '';

  // En local no hay wildcard DNS para subdominios ni el dominio de producción,
  // así que siempre se arma la ruta con NEXT_PUBLIC_BASE_URL.
  if (process.env.NODE_ENV !== 'production') {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
    return `${base}/${event.event_type}/${event.slug}${query}`;
  }

  if (event.subdomain) {
    return `https://${event.subdomain}.${ROOT_DOMAIN}${query}`;
  }
  return `https://${ROOT_DOMAIN}/${event.event_type}/${event.slug}${query}`;
}
