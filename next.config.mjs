// Served by the Next.js runtime on Vercel (server actions, image optimisation, OG routes).
// scripts/stage-next.mjs still stages the prerendered HTML for the Sites handoff.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
];

// October 2026 catalogue: old work and photo URLs that are the same painting point at its new page;
// works no longer in the catalogue point at the works page.
const movedWorks = [
  ['figure-with-a-skull', '/works/figure-with-skull'],
  ['portrait-with-a-rose', '/works/portrait-with-rose'],
  ['figure-in-rose', '/works/new-painting-2026'],
  ['figure-in-red', '/works/figure-exhaling-red'],
  ['portrait-with-an-ember', '/works/woman-cigarette'],
  ...['figure-in-motion', 'abstract-in-pale-violet', 'portrait-in-crimson', 'portrait-in-light', 'figure-in-grey', 'white-on-charcoal'].map(slug => [slug, '/works']),
];
const movedPhotos = [
  ['red-smoke.png', 'figure-exhaling-red-web.jpg'],
  ['figure-in-red.png', 'figure-exhaling-red-web.jpg'],
  ['figure-with-skull.jpg', 'figure-with-skull-web.jpg'],
  ['over-the-shoulder.jpg', 'over-the-shoulder-web.jpg'],
  ['portrait-with-rose.jpg', 'portrait-with-rose-web.jpg'],
  ['figure-in-rose.jpg', 'new-painting-2026-web.jpg'],
  ['portrait-with-ember.jpg', 'woman-cigarette-web.jpg'],
];

const config = {
  allowedDevOrigins: ['terminal.local', '127.0.0.1'],
  devIndicators: false,
  poweredByHeader: false,
  async redirects() {
    return [
      ...movedWorks.map(([from, to]) => ({ source: `/works/${from}`, destination: to, permanent: true })),
      ...movedPhotos.map(([from, to]) => ({ source: `/art/${from}`, destination: `/art/${to}`, permanent: true })),
    ];
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Source photographs rarely change: cache for a week, revalidate in the background after that.
      { source: '/art/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }] },
    ];
  },
  // Vercel runs the image optimiser; elsewhere (e.g. the static Sites mirror) serve source files directly.
  // AVIF first: ~47% smaller than WebP at the optimiser's settings (measured at 1080 px, all 11 photos).
  images: { unoptimized: !process.env.VERCEL, formats: ['image/avif', 'image/webp'] },
};

export default config;
