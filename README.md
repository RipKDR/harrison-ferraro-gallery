# Harrison Ferraro gallery

Responsive Next.js App Router portfolio. Next.js 16.3.5 was verified against the package registry on 15 September 2026. Every page is static; there is no WebGL or client-side gallery.

## Run

`npm install` then `npm run dev` (port 4173). `npm run build` creates the production Next.js build and a Sites-compatible static mirror. `npm run test:sites` verifies hosting behavior.

## Content

`src/artworks.ts` holds the ten works with the title, price, size, medium and year Harry confirmed in October 2026. The photos in `public/art/*-web.jpg` are cropped to the canvas edge and never upscaled or retouched. Each record stores the photo's pixel size, and a painting is never displayed larger than that. The artist statement on `/` and `/about` is Harry's own text, verbatim. Do not add biography, exhibitions or awards that he has not supplied.

## Pages

`/` leads with one painting and the statement, then six more works. `/works` shows all ten works. The studio list sign-up is in the footer of every page. Each `/works/[slug]` page has the painting, a wall label with the price, and an Enquire button that jumps to an enquiry form already filled in with that work. ← / → move between works, and Share uses the phone's share sheet (copy-link on desktop). `/about` has the portrait and statement, `/contact` takes general enquiries, and `/privacy` covers email and analytics. Old work URLs and photo paths 301-redirect to their new equivalents (`next.config.mjs`).

Enquiries and studio list sign-ups are sent by server actions through Resend (see `.env.example`). Only the studio receives email; the visitor's address is used only as reply-to. Nothing is stored by the website. Without Resend env vars, both forms fall back to a `mailto:` link. Prints were removed on 26 September 2026.

## Preview and deployment

The site is public and indexable (`src/app/robots.ts`, `src/app/sitemap.ts`). Sites source history provides rollback. Production runs on Vercel (Next.js runtime), where `next/image` serves AVIF/WebP. Outside Vercel images are served unoptimized. `npm run build` also stages a static mirror in `dist/` for the Sites handoff; forms need the Next.js runtime and do not work in that mirror. No payment or authentication backend is added.

Analytics: Vercel Web Analytics (on Vercel only), PostHog (when `NEXT_PUBLIC_POSTHOG_KEY` is set) and Microsoft Clarity session replay, which loads after the page and is disclosed on `/privacy`. Custom events are `artwork_view`, `enquiry_view`, `enquiry_submit`, `enquiry_success`, `enquiry_error`, `studio_list_join`, `artwork_share` and `instagram_click`. Instagram clicks record placement, not confirmed follows.

With the local server running, `node --test tests/portfolio-routes.test.mjs` checks the public routes, the ten-work sitemap and the print removal. Set `PORTFOLIO_BASE_URL` to inspect another local preview address.
