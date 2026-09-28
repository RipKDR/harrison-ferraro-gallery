import type { MetadataRoute } from 'next';
import { artworkPath, artworks } from '../artworks';
import { absoluteUrl, CONTENT_UPDATED as lastModified } from '../lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl('/'), lastModified, changeFrequency: 'monthly', priority: 1, images: artworks.map(work => absoluteUrl(work.src)) },
    { url: absoluteUrl('/about'), lastModified, changeFrequency: 'yearly', priority: 0.6 },
    ...artworks.map(work => ({
      url: absoluteUrl(artworkPath(work)),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: [absoluteUrl(work.src)],
    })),
  ];
}
