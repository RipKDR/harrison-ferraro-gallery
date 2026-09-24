import posthog from 'posthog-js';
import { track } from '@vercel/analytics';
import { type Artwork, artworkTitle } from '../artworks';

export type AnalyticsEvent = 'artwork_view' | 'enquiry_submit' | 'print_waitlist_join' | 'studio_list_join' | 'artwork_share';
type Properties = Record<string, string | number | boolean | null>;

export const artworkProperties = (work: Artwork) => ({ artwork_id: work.id, artwork_slug: work.slug, artwork_title: artworkTitle(work) });

// Sends to whichever providers are active; each is a no-op when not configured. Never pass personal data.
export function trackEvent(name: AnalyticsEvent, properties: Properties = {}) {
  try {
    if (posthog.__loaded) posthog.capture(name, properties);
  } catch { /* analytics must never break the page */ }
  try {
    track(name, properties);
  } catch { /* ditto */ }
}
