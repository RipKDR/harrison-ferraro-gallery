// Served by the Next.js runtime on Vercel (server actions, image optimisation, OG routes).
// scripts/stage-next.mjs still stages the prerendered HTML for the Sites handoff.
export default {
  allowedDevOrigins: ['terminal.local'],
  devIndicators: false,
  poweredByHeader: false,
  // Vercel runs the image optimiser; elsewhere (e.g. the static Sites mirror) serve source files directly.
  images: { unoptimized: !process.env.VERCEL },
};
