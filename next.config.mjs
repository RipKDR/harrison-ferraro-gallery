// Served by the Next.js runtime on Vercel (server actions, image optimisation, OG routes).
// scripts/stage-next.mjs still stages the prerendered HTML for the Sites handoff.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
];

export default {
  allowedDevOrigins: ['terminal.local'],
  devIndicators: false,
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Source photographs rarely change: cache for a week, revalidate in the background after that.
      { source: '/art/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }] },
      { source: '/gallery-background.:ext', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }] },
    ];
  },
  // Vercel runs the image optimiser; elsewhere (e.g. the static Sites mirror) serve source files directly.
  images: { unoptimized: !process.env.VERCEL, formats: ['image/avif', 'image/webp'] },
};
