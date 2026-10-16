'use client';
import { useState } from 'react';
import { Check, ShareNetwork } from '@phosphor-icons/react';
import { type Artwork, artworkPath } from '../artworks';
import { artworkProperties, trackEvent } from '../lib/analytics';
import { absoluteUrl, SITE_NAME } from '../lib/site';

/** Native share sheet on touch devices; elsewhere copies the artwork link. */
export function ShareArtwork({ work }: { work: Artwork }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const url = absoluteUrl(artworkPath(work));

  async function share() {
    if (typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ title: `${work.title} — ${SITE_NAME}`, url });
        trackEvent('artwork_share', { ...artworkProperties(work), method: 'native' });
        return;
      } catch (error) {
        // Dismissing the sheet is fine; anything else (e.g. an in-app browser refusing) falls back to copying.
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setState('copied');
      trackEvent('artwork_share', { ...artworkProperties(work), method: 'copy' });
    } catch {
      setState('failed');
    }
  }

  return <>
    <button type="button" className="text-button" onClick={share}>
      {state === 'copied' ? <Check size={17} /> : <ShareNetwork size={17} />} {state === 'copied' ? 'Link copied' : 'Share this work'}
    </button>
    {state === 'failed' && <p className="small-note" role="status">Copy the address from your browser to share this work.</p>}
  </>;
}
