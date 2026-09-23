'use client';
import { useEffect } from 'react';
import { artworkBySlug } from '../artworks';
import { artworkProperties, trackEvent } from '../lib/analytics';

export function TrackArtworkView({ slug, source }: { slug: string; source: 'page' | 'modal' }) {
  useEffect(() => {
    const work = artworkBySlug(slug);
    if (work) trackEvent('artwork_view', { ...artworkProperties(work), source });
  }, [slug, source]);
  return null;
}
