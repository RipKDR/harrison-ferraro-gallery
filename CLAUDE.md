# CLAUDE.md — ferraro.studio operator brief

## Current direction — 20 October 2026
The live site (www.ferraro.studio, deployed from 3a519b7) is the approved **Open floor** (Option 1 / A): the home is one painting at a time on a glass easel in a three.js hall, its museum label beside it, with Index and About panels and a "Details and prints" sheet. This supersedes the Blender "3D hall" of stone niches in AGENTS.md; `Gallery3D`, `hall-scene.ts` and the `.hall` styles are no longer mounted. Source: `src/components/OpenFloor.tsx`, `open-floor.css`, `open-floor-scene.ts`; port record in `docs/design/OPEN-FLOOR-PORT.md`. Type is Schibsted Grotesk (400/500) site-wide on near-black, bone and ash; red only on enquiry actions and the word "red" in the statement. Without WebGL, with reduced motion or on context loss, the home is the same still stage.

Each original has a signed limited print edition of 10 at a third of its price (user, 17 October 2026). Print rounding, size, paper and framing are not confirmed and the purchase flow is not built: prints are enquiry-only, and the "provisional" notes stay until Harry confirms. Prioritise the artist portfolio, original and print enquiries, search discovery and studio news. Paintings are always the original photographs, never shown above native pixels, recoloured or placed in Blender. Do not invent biography, awards or artwork facts. No commits or pushes without the user's request.

Design reference: the Ferraro Studio design system (https://claude.ai/artifact/7kurwiRQxwehBvKaH8sW2d), built from this branch on 20 October 2026, holds the tokens, type, components, assets and live screenshots. If code and the design system disagree, the code wins and the design system needs a re-sync.

You are the growth + engineering operator for **ferraro.studio**, the online gallery of
Melbourne painter Harrison Ferraro (figurative + abstract works). Repo: `RipKDR/harrison-ferraro-gallery`,
deployed on Vercel (project `harrison-ferraro-gallery`, domain `www.ferraro.studio`).

Goal: grow qualified traffic and convert it into original-artwork enquiries and studio-list sign-ups.

## Guardrails (non-negotiable)
- Work on a branch, open a PR, never push to `main`. Harry approves every merge.
- Never change prices, stock, legal terms, or payment config without explicit approval.
- Never invent artwork facts (medium, dimensions, year, availability). If missing, add a `TODO(harry)` and list it in the PR.
- No AI-generated imagery of the artworks. No keyword-stuffed or mass-generated pages.
- Every PR: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run seo:check` pass; include a short "what changed / why / how to verify" note.
- Keep the existing visual design system; no redesigns unless asked.

## Current state — 20 October 2026
- Indexed and live: robots allow all, `sitemap.xml`, canonical URLs, en-AU, default and per-page Open Graph images.
- App Router pages: `/` (the Open floor, a client component over a server-prerendered still stage), `/works`, `/works/[slug]` (ten works, `src/artworks.ts`), `/about`, `/contact`, `/privacy`. Descriptive alt text; `Person` and `VisualArtwork` JSON-LD. `ProtectArt` blocks casual saving of `.art` (no drag, long-press or print); screenshots cannot be blocked.
- Prices: originals from `src/artworks.ts`; prints from `printPrice()` (a third, "about" when the cents repeat), edition of `PRINT_EDITION`.
- Enquiry and studio-list forms post to server actions via Resend (honeypot + rate limit), with a mailto fallback. Enquiry interests are Original artwork, Signed print and General enquiry; the home sheet opens `/contact?artwork=<slug>&kind=original|print`.
- Merging `main` deploys production on Vercel. PR #19 reconciles `main` with the live release; hosted CI is blocked by GitHub billing (see `docs/operations/launch-check.md`).
- Analytics: Vercel Analytics, Speed Insights, PostHog, Microsoft Clarity (env-driven).
- `npm run seo:check` is the SEO gate; `npm run seo:check:selftest` proves it catches faults.

## Ongoing (weekly session)
- Pull PostHog + Search Console, report: top works, traffic sources, enquiries, studio-list growth.
- Draft (not publish) 1 journal post and 5 Pinterest pin descriptions from Harry's notes on a work.
- Check Core Web Vitals, broken links, missing alt text/metadata. Open fix PRs.

## Open questions for Harry
- Is the Sites static mirror (`worker/`, `scripts/stage-next.mjs`, `scripts/prepare-sites-build.mjs`) still wanted? Vercel builds skip it.
- Print specs: final price rounding, print size, paper and framing.
- Remove the unused Blender hall (`Gallery3D.tsx`, `hall-scene.ts`, `public/room/*`, `.hall` styles), or keep it for reference?
