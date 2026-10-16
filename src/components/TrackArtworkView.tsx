'use client';
import { useEffect } from 'react';
import { artworkBySlug } from '../artworks';
import { artworkProperties, trackEvent } from '../lib/analytics';

export function TrackArtworkView({ slug }: { slug: string }) {
  useEffect(() => {
    const work = artworkBySlug(slug);
    if (work) trackEvent('artwork_view', { ...artworkProperties(work), source: 'page' });
  }, [slug]);
  return null;
}
