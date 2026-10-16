# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Confirmed design (superseded 16 October 2026; see Premium redesign)
The selected visual is upload/01-Generated-image-5.png: dark spatial three-artwork gallery with large FERRARO floor lettering. Preserve it. User explicitly requests a responsive website using Next.js and Three.js; use Next App Router (Next.js runtime on Vercel since 23 Sep 2026; `scripts/stage-next.mjs` stages a static mirror for Sites), not a mobile app shell. Original artwork photos are rendered without AI repainting. Enquiries are drafts until real contact details are supplied.

## Commercial direction — 21 September 2026
User prioritises a professional mobile-first portfolio that leads to original-art enquiries and print sales, and delegates business defaults. Retain selected dark gallery identity; stop generating variants unless requested. Originals start enquiry-led, with destination collected for bespoke packing/shipping quotes. Prints start unframed and proof-approved before checkout, with prices/edition/fulfilment not fabricated. Keep private preview clearly labelled until catalogue, public contact and commerce are connected. Never treat account contact details as a public artist contact without authorisation.

## Catalogue and contact — 21 September 2026 (catalogue superseded 16 October 2026; contact still authorised)
User supplied nine additional painting photos and authorised publication of Harrisonferraro99@gmail.com and https://www.instagram.com/harrison_ferraro/. Use original photos with non-destructive in-browser canvas edge mapping; do not generate replacement artwork. Keep 3 featured works in spatial hero and all 12 in catalogue; never hard-code full-catalogue pagination to 3. Descriptive labels and artist statement are editable drafts, not confirmed titles. Enquiry composer opens addressed email and clearly requires sending in the visitor's email app. No backend submission or automatic sends are claimed.

## Featured paintings — 21 September 2026 (superseded 16 October 2026)
Lead the opening gallery and collection with Over the shoulder (work-10), Figure in rose (work-11), and Figure with a skull (work-12), in that order. Preserve stable artwork IDs and catalogue reference numbers.

## SEO loop — 28 September 2026
`docs/seo/backlog.md` holds the verified baseline, ranked backlog and cycle log; `docs/seo/offsite-checklist.md` the off-site plan. `npm run seo:check` is a required gate (scripts/seo-check.mjs): it starts the built site, crawls sitemap + internal links, and fails on title/description/canonical/h1/alt/JSON-LD/link/sitemap faults, plus /robots.txt and /llms.txt 200. No new dependency. `npm run seo:check:selftest` (scripts/seo-check-selftest.mjs) injects six fault classes into the source, rebuilds, and requires the gate to catch each — run it after editing the checker or the page templates, because a gate never observed failing is not a gate. Measure with Lighthouse run 3x and compare like-for-like: `VERCEL=1 next build && VERCEL=1 next start` enables the image optimiser locally, and Vercel preview deployments are behind Deployment Protection (302) so they cannot be crawled or measured without a Vercel account. On this page Lighthouse swings +/-5 between identical runs, so report image-byte deltas rather than score deltas. The collection is `/works`; there is no separate studio page.

## Public launch — 23 September 2026
User confirmed the private preview is over: the site is indexed (robots allow all, sitemap). Production is Vercel at https://www.ferraro.studio. Enquiries send from hello@ferraro.studio via Resend. This supersedes the earlier mailto composer: the enquiry form posts to a server action (honeypot + rate limit) and the authorised Gmail address appears only as a fallback when sending fails. Analytics: Vercel Analytics + PostHog, both env-driven and no-op without keys. Unknown artwork facts (medium, size, year, price, availability) are omitted from UI and JSON-LD, never invented; track them as `TODO(harry)`.

## Growth direction — 24 September 2026
Preserve the approved spatial gallery and original artwork imagery. User prioritises search discovery, qualified original enquiries, future print sales and Instagram followers. Improve those paths without redesigning the site. Never promise rankings, followers or sales. The dedicated `/prints` page is for interest until physical proofs, specifications, pricing and fulfilment are confirmed.

## Print-page review — 24 September 2026
User explicitly dislikes the first `/prints` implementation and requested a Product Design audit. Treat its visual design as rejected, not approved for publication. Preserve the approved home gallery; a replacement print-page direction has not yet been selected.

## Portfolio direction — 26 September 2026
User removes prints from the website and delegates design improvements to create an impressive artist portfolio, attract qualified visitors and support original-artwork enquiries. Remove print pages, links, forms and print-only backend code. Retain the dark spatial gallery, featured artwork order and original photographs. The studio list covers new paintings and studio news. Use editable descriptive copy where useful; do not invent artist biography, exhibitions, awards, prices, availability or other factual claims. This direction supersedes earlier print-sales plans.

## Audit pass — 28 September 2026 (home CTA superseded 16 October 2026)
One enquiry invitation per page: the footer "A painting starts a conversation" band was removed; the collecting section's "Talk to Harrison" is the home page's solid CTA. Catalogue numbers show on the work page (Reference No.) only, not on grid captions or hero markers. Phones get no "+" quick-view button (the image already opens the work). Keep copy plain and factual; no poster-style taglines.

## Premium redesign — 16 October 2026
User asked for a premium, dark, gothic, handmade gallery and supplied ten confirmed works. This supersedes the spatial gallery, featured order, catalogue numbers and "preserve the gallery" lines above. The Three.js gallery, modal and zoom viewer are gone; every page is static App Router: `/`, `/works`, `/works/[slug]`, `/about`, `/contact`, `/privacy`. The paintings are the hero. Photos are cropped to the canvas edge and never upscaled, recoloured or given invented detail, and are never displayed larger than their native pixel size. Banned: cream cards or sections, numbered "01 /" labels, Inter, and the stock hero plus three-card layout. Type is IM Fell French Canon (display) and Newsreader (text) via `next/font`. The palette is near-black, bone and ash, with one red reserved for enquiry actions and the word "red" in the statement. Confirmed facts: all ten are 2026, 60 × 90 cm, acrylic, charcoal and pastel on canvas, priced in AUD and available; `src/artworks.ts` order is display order. The artist statement is Harry's text, verbatim; don't paraphrase it or add biography. Form email goes only to the studio, with the visitor's address used only as reply-to; never send the visitor a receipt. Microsoft Clarity stays, loads lazily and is disclosed on `/privacy`.

## Exhibition scroll — 16 October 2026
The first cinematic scroll was rejected: the opening read as a brochure row over a faint floor word, the pinned painting shrank, and six rooms repeated one card with two paintings stacked in the crossfade. Replaced on the same branch. The opening is a room again — the painting on the wall, the statement and wall label beside it, a large perspective FERRARO on the floor — and the painting stays at scale 1. The next six catalogue works hang differently (monument, intimate, low, wide, tower, aside); Blue Undertow is the wide one. Each beat owns the screen and dissolves in place. The image, title and label drift at different rates, in px, lighter on a phone. Motion is CSS scroll timelines, with ScrollMotion (IntersectionObserver plus a rAF `--fx`) only when `animation-timeline: view()` is unsupported and reduced motion is off. `prefers-reduced-motion: reduce` is the still page. Grain is a still fixed layer behind content, never over a painting. Harry's statement stays verbatim. One enquiry invitation, on the close. `/works` remains the full catalogue.

## Cursor Cloud specific instructions

`npm ci` is the install. Next.js 16 needs Node 20.9 or newer; the default image already has a new enough Node. There is no database and no extra system package. `npm run dev` serves the gallery on port 4173. Open `http://localhost:4173` or `http://127.0.0.1:4173` — both hosts are in `allowedDevOrigins`, so the dev hot-reload socket connects. Resend, PostHog, and search-console keys in `.env.example` are optional; without `RESEND_API_KEY` and `ENQUIRY_TO_EMAIL` the enquiry and studio-list forms use the mailto fallback. Verify with `npm run typecheck`, `npm run lint`, `node --test tests/portfolio-routes.test.mjs` while the dev server is up, then `npm run build` and `npm run test:sites`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
