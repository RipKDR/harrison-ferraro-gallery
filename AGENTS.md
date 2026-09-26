# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Confirmed design
The selected visual is upload/01-Generated-image-5.png: dark spatial three-artwork gallery with large FERRARO floor lettering. Preserve it. User explicitly requests a responsive website using Next.js and Three.js; use Next App Router (Next.js runtime on Vercel since 23 Sep 2026; `scripts/stage-next.mjs` stages a static mirror for Sites), not a mobile app shell. Original artwork photos are rendered without AI repainting. Enquiries are drafts until real contact details are supplied.

## Commercial direction — 21 September 2026
User prioritises a professional mobile-first portfolio that leads to original-art enquiries and print sales, and delegates business defaults. Retain selected dark gallery identity; stop generating variants unless requested. Originals start enquiry-led, with destination collected for bespoke packing/shipping quotes. Prints start unframed and proof-approved before checkout, with prices/edition/fulfilment not fabricated. Keep private preview clearly labelled until catalogue, public contact and commerce are connected. Never treat account contact details as a public artist contact without authorisation.

## Catalogue and contact — 21 September 2026
User supplied nine additional painting photos and authorised publication of Harrisonferraro99@gmail.com and https://www.instagram.com/harrison_ferraro/. Use original photos with non-destructive in-browser canvas edge mapping; do not generate replacement artwork. Keep 3 featured works in spatial hero and all 12 in catalogue; never hard-code full-catalogue pagination to 3. Descriptive labels and artist statement are editable drafts, not confirmed titles. Enquiry composer opens addressed email and clearly requires sending in the visitor's email app. No backend submission or automatic sends are claimed.

## Featured paintings — 21 September 2026
Lead the opening gallery and collection with Over the shoulder (work-10), Figure in rose (work-11), and Figure with a skull (work-12), in that order. Preserve stable artwork IDs and catalogue reference numbers.

## Public launch — 23 September 2026
User confirmed the private preview is over: the site is indexed (robots allow all, sitemap). Production is Vercel at https://www.ferraro.studio. Enquiries send from hello@ferraro.studio via Resend. This supersedes the earlier mailto composer: the enquiry form posts to a server action (honeypot + rate limit) and the authorised Gmail address appears only as a fallback when sending fails. Analytics: Vercel Analytics + PostHog, both env-driven and no-op without keys. Unknown artwork facts (medium, size, year, price, availability) are omitted from UI and JSON-LD, never invented; track them as `TODO(harry)`.

## Growth direction — 24 September 2026
Preserve the approved spatial gallery and original artwork imagery. User prioritises search discovery, qualified original enquiries, future print sales and Instagram followers. Improve those paths without redesigning the site. Never promise rankings, followers or sales. The dedicated `/prints` page is for interest until physical proofs, specifications, pricing and fulfilment are confirmed.

## Print-page review — 24 September 2026
User explicitly dislikes the first `/prints` implementation and requested a Product Design audit. Treat its visual design as rejected, not approved for publication. Preserve the approved home gallery; a replacement print-page direction has not yet been selected.

## Portfolio direction — 26 September 2026
User removes prints from the website and delegates design improvements to create an impressive artist portfolio, attract qualified visitors and support original-artwork enquiries. Remove print pages, links, forms and print-only backend code. Retain the dark spatial gallery, featured artwork order and original photographs. The studio list covers new paintings and studio news. Use editable descriptive copy where useful; do not invent artist biography, exhibitions, awards, prices, availability or other factual claims. This direction supersedes earlier print-sales plans.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
