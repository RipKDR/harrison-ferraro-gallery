import type { MetadataRoute } from 'next';
import { artworkPath, artworks } from '../artworks';
import { absoluteUrl, CONTENT_UPDATED as lastModified } from '../lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl('/'), lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: absoluteUrl('/works'), lastModified, changeFrequency: 'monthly', priority: 0.9, images: artworks.map(work => absoluteUrl(work.src)) },
    ...artworks.map(work => ({
      url: absoluteUrl(artworkPath(work)),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: [absoluteUrl(work.src)],
    })),
    { url: absoluteUrl('/about'), lastModified, changeFrequency: 'yearly', priority: 0.6, images: [absoluteUrl('/art/harry-portrait-web.jpg')] },
    { url: absoluteUrl('/contact'), lastModified, changeFrequency: 'yearly', priority: 0.5 },
  ];
}
