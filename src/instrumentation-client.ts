import posthog from 'posthog-js';

// PostHog is opt-in by environment: without NEXT_PUBLIC_POSTHOG_KEY nothing loads or sends.
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
if (key) {
  try {
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      defaults: '2026-08-30',
      person_profiles: 'identified_only',
    });
  } catch (error) {
    console.warn('PostHog failed to initialise', error);
  }
}
