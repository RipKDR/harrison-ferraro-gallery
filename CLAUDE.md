# CLAUDE.md — ferraro.studio operator brief

## Current direction — 26 September 2026
Each original has a signed limited print edition of 10 at a third of its price (user, 17 October 2026; purchase flow not built yet). Prioritise the artist portfolio, original-artwork enquiries, search discovery and studio news. The home is the Blender-built 3D hall (see AGENTS.md "3D hall"); paintings are always the original photographs, unlit, never inside Blender; do not invent biography, awards or artwork facts. No commits or pushes without the user's request.

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

## Current state — 17 October 2026
- Indexed and live: robots allow all, `sitemap.xml`, canonical URLs, en-AU, default and per-page Open Graph images.
- Static App Router pages: `/`, `/works`, `/works/[slug]` (ten works, `src/artworks.ts`), `/about`, `/contact`, `/privacy`. Server-rendered `next/image` with descriptive alt text; `Person` and `VisualArtwork` JSON-LD.
- Enquiry and studio-list forms post to server actions via Resend (honeypot + rate limit), with a mailto fallback.
- Analytics: Vercel Analytics, Speed Insights, PostHog, Microsoft Clarity (env-driven).
- `npm run seo:check` is the SEO gate; `npm run seo:check:selftest` proves it catches faults.

## Ongoing (weekly session)
- Pull PostHog + Search Console, report: top works, traffic sources, enquiries, studio-list growth.
- Draft (not publish) 1 journal post and 5 Pinterest pin descriptions from Harry's notes on a work.
- Check Core Web Vitals, broken links, missing alt text/metadata. Open fix PRs.

## Open questions for Harry
- Is the Sites static mirror (`worker/`, `scripts/stage-next.mjs`, `scripts/prepare-sites-build.mjs`) still wanted? Vercel builds skip it.
