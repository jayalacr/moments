import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/plantillas', '/planes', '/cotizar'].map(path => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));
}
