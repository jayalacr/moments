const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'moments-mx.com';

export function getInvitationUrl(
  event: { subdomain?: string | null; event_type: string; slug: string },
  token?: string
): string {
  const query = token ? `?id=${token}` : '';
  if (event.subdomain) {
    return `https://${event.subdomain}.${ROOT_DOMAIN}${query}`;
  }
  return `https://${ROOT_DOMAIN}/${event.event_type}/${event.slug}${query}`;
}
