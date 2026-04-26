import { NextRequest } from 'next/server';

// Solo permite dominios de Google Drive
const ALLOWED_HOSTS = ['drive.google.com', 'drive.usercontent.google.com'];

function isAllowed(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_HOSTS.some(h => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');
  if (!urlParam || !isAllowed(urlParam)) {
    return new Response('URL no permitida', { status: 400 });
  }

  const upstreamHeaders: HeadersInit = {
    'User-Agent': 'Mozilla/5.0 (compatible; moments-audio-proxy/1.0)',
  };
  const range = req.headers.get('range');
  if (range) upstreamHeaders['Range'] = range;

  let upstream: Response;
  try {
    upstream = await fetch(urlParam, { headers: upstreamHeaders, redirect: 'follow' });
  } catch {
    return new Response('Error al obtener el audio', { status: 502 });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new Response('El archivo no está disponible', { status: upstream.status });
  }

  const resHeaders = new Headers();
  resHeaders.set('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg');
  resHeaders.set('Cache-Control', 'public, max-age=3600');
  resHeaders.set('Accept-Ranges', 'bytes');

  for (const h of ['Content-Length', 'Content-Range']) {
    const v = upstream.headers.get(h);
    if (v) resHeaders.set(h, v);
  }

  return new Response(upstream.body, { status: upstream.status, headers: resHeaders });
}
