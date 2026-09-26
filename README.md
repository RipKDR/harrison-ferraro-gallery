# Harrison Ferraro gallery

Responsive Next.js App Router portfolio using Three.js 0.186.0. Next.js 16.3.5 was verified against the package registry on 15 September 2026.

## Run

`npm install` then `npm run dev` (port 4173). `npm run build` creates the production Next.js build and a Sites-compatible static mirror. `npm run test:sites` verifies hosting behavior.

## Content

`src/artworks.ts` holds provisional descriptive labels and original photo corner coordinates. Source photos are unchanged. Browser canvas maps the photographed canvas corners for display; no AI repainting is used. The environment background is generated. Publish further titles, dimensions, medium, prices and availability only when confirmed; public contact is already connected.

## Interaction

Click a work, use the arrow controls or keyboard arrows, zoom or use Full view, and send an enquiry. In any artwork viewer, double-click zooms at the pointer and dragging pans; on phones, swipe the modal artwork to step through works. On work pages, ← / → move between works and Share uses the phone's share sheet (copy-link on desktop). A compact navigation bar slides in on scroll-up. Every work has its own page at `/works/[slug]`; artwork hash links still reopen the gallery modal. Native dialogs support keyboard focus and Escape. Enquiries are sent by a server action through Resend (see `.env.example`); nothing is stored by the website. Prints and print-interest forms were removed on 26 September 2026; the focus is paintings and original-artwork enquiries. The studio list remains for new paintings and studio news.

## Rendering and limits

Three.js loads client-side and renders on demand with bounded pixel density. Browsers without WebGL use an equivalent projective CSS/canvas gallery. The cloud browser has WebGL disabled; the fallback is visually and interactively verified. GPU rendering still requires an accelerated-browser check.

## Preview and deployment

The site is public and indexable (`src/app/robots.ts`, `src/app/sitemap.ts`). `?preview=mobile` supplies a 390×844 development comparison surface; normal routes adapt to device width. Sites source history provides rollback. Production runs on Vercel (Next.js runtime). `npm run build` also stages a static mirror in `dist/` for the Sites handoff; forms need the Next.js runtime and do not work in that mirror. No payment or authentication backend is added. Analytics: Vercel Web Analytics (on Vercel only) and PostHog (when `NEXT_PUBLIC_POSTHOG_KEY` is set), with custom events `artwork_view`, `enquiry_submit`, `studio_list_join`, `artwork_share` and `instagram_click`. Instagram clicks record placement, not confirmed follows.

With the local server running, `node --test tests/portfolio-routes.test.mjs` checks the public portfolio routes, twelve-work sitemap and print removal. Set `PORTFOLIO_BASE_URL` to inspect another local preview address.
