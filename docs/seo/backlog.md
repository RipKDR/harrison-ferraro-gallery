# SEO backlog — ferraro.studio (branch `seo-loop`)

(Requested location `.hermes/seo-backlog.md` is write-protected in this environment, so the backlog lives here.)

Ranked by impact ÷ effort. Evidence verified by curl/Lighthouse, not taken on trust from audit agents.

## Baseline — 28 Sep 2026

Lighthouse 13, headless Chrome, simulated throttling. Live = https://www.ferraro.studio (Vercel image optimiser on).
Local = `next start` without `VERCEL` env, so images are unoptimised originals (inflated img kB, slower LCP) — compare local to local only.

| live route | form | perf | a11y | bp | seo | LCP ms | CLS | TBT ms | JS kB | img kB |
|---|---|---|---|---|---|---|---|---|---|---|
| / | mobile | 88 | 100 | 96 | 100 | 3131 | 0.002 | 260 | 281 | 1579 |
| / | desktop | 100 | 100 | 100 | 100 | 630 | 0.008 | 59 | 415 | 1522 |
| /works/over-the-shoulder | mobile | 92 | 100 | 100 | 100 | 2645 | 0.001 | 252 | 286 | 144 |
| /works/over-the-shoulder | desktop | 100 | 100 | 100 | 100 | 577 | 0 | 27 | 286 | 308 |
| /about | mobile | 94 | 100 | 100 | 100 | 2440 | 0.002 | 224 | 286 | 326 |
| /about | desktop | 100 | 100 | 100 | 100 | 574 | 0.002 | 12 | 286 | 252 |

| local route | form | perf | a11y | bp | seo | LCP ms | CLS | TBT ms | JS kB | img kB |
|---|---|---|---|---|---|---|---|---|---|---|
| / | mobile | 71 | 100 | 96 | 100 | 11261 | 0.002 | 226 | 272 | 10039 |
| / | desktop | 95 | 100 | 100 | 100 | 1031 | 0.008 | 3 | 402 | 10039 |
| /works/over-the-shoulder | mobile | 87 | 100 | 100 | 100 | 3910 | 0.001 | 93 | 277 | 6443 |
| /works/over-the-shoulder | desktop | 99 | 100 | 100 | 100 | 889 | 0 | 0 | 277 | 6443 |
| /about | mobile | 88 | 100 | 100 | 100 | 3030 | 0.002 | 277 | 277 | 7025 |
| /about | desktop | 100 | 100 | 100 | 100 | 820 | 0.002 | 12 | 277 | 7025 |

Notes: the site has no separate studio page. At this 28 Sep baseline the collection was `/#collection` on the home page; it is now `/works`, and the home is a scroll exhibition rather than a collection anchor. The studio list is a footer form, so `/` and `/about` stood in for a studio page. INP needs field data (Speed Insights / CrUX); TBT is the lab proxy. seo:check baseline: 14 pages, 0 problems.

Already good (verified): robots allow all + sitemap with image entries; apex 308 to www; og:image per work (file-convention OG route, 1200x630 from original photo); unique title/description per work; one h1; server-rendered <img> with descriptive alt + LCP preload; WebP from Vercel optimiser; Three.js dynamic-imported, idle-loaded, desktop only; CSS poster fallback; Person/WebSite/CollectionPage/VisualArtwork/BreadcrumbList JSON-LD.

## Backlog

| # | impact | effort | item | evidence | status |
|---|---|---|---|---|---|
| 1 | H | S | Wrong `sizes` on phone grids: 2-col grid declared 90vw; ~1 MB wasted on home mobile | LH image-delivery-insight 1,063 KiB; globals.css 2-col | done (cycle 1) |
| 2 | H | S | No `/llms.txt` for AI answer engines | live 404 | done (cycle 2) |
| 3 | M | S | Enquiry funnel events: only success fired | EnquiryForm.tsx | done (cycle 2b) |
| 4 | M | S | Sitemap has no `lastmod` | sitemap.ts | done (cycle 2) |
| 5 | M | S | AVIF not enabled | next.config | re-enabled (cycle 5): measured through Next 16.3.5's own optimiser, which encodes AVIF at q×50/80, AVIF is 47% smaller than WebP on the October photos. Cycle 4 had reverted it as 40% *larger* at q=75 (947 kB vs 1,329 kB over 8 works) with ~5x the encode time. |
| 6 | L | S | 404 page inherits home og:url `/` | layout.tsx | dropped: 404 already serves `noindex`; not a ranking risk |
| 7 | L | S | Breadcrumb JSON-LD crumb 2 -> `/#collection` fragment | jsonld.tsx | dropped: Google ignores fragments; changing to `/` would duplicate crumb 1 |
| 8 | L | M | Non-descriptive source filenames | public/art | done (cycle 3) |
| 9 | L | S | Per-work OG image alt is generic (static `alt`) | works/[slug]/opengraph-image | skipped: `generateImageMetadata` would un-prerender 12 OG routes (build-time cost, slower deploy) for a small alt gain. OG alt is near-zero ranking weight. |
| — | n/a | — | UTM on Instagram links: outbound UTMs do nothing; inbound bio-link UTM is off-site | — | moved to offsite-checklist §4 |
| — | n/a | — | CSP header: security-only, risk of breaking PostHog/Vercel scripts | — | parked (not an SEO item) |
| — | n/a | — | Hero fallback `sizes` under-fetch at 2x DPR (LH image-size-responsive) | LH: rendered 385x684 CSS px, served 640w | parked: correct for DPR 1; the 100vw "fix" made LCP worse, revert kept. Real DPR-2 phones re-test later on a real device. |

## Cycle log

- cycle 1: added `scripts/seo-check.mjs` (`npm run seo:check`) crawl gate + right-sized phone `sizes` (2-col tiles 45vw, about grid 45vw) | home-mobile images vs main 1,586 kB -> 681 kB (final WebP figure, see below) | next: llms.txt
- cycle 2: `/llms.txt` generated from the catalogue (static), sitemap `lastmod` via `CONTENT_UPDATED`, AVIF+WebP output | seo:check green; live matched local optimised build | next: enquiry funnel
- cycle 2b: enquiry funnel `enquiry_view` (once, in-viewport) → `enquiry_submit` → `enquiry_success`/`enquiry_error` (reason) | verified in browser (work page + home modal), no dupes | next: filenames
- cycle 3: 4 source photos renamed to slugs + 308 redirects, breadcrumb shows title, review fixes (view-once ref, seo-check slice) | 12 unique image URLs, redirects 308, all gates green | next: CTA fold
- cycle 4: AVIF reverted (measured larger than WebP here); work-page enquiry CTA moved under the h1 | CTA on a 390px phone: 1,054 px -> 800 px, now inside the 844 px fold; home-mobile images 1,586 kB -> 681 kB vs main | next: off-site (no code items left above low)
- cycle 5 (16 Oct, premium redesign): ten-work catalogue with new photos; AVIF+WebP re-enabled | `VERCEL=1` local `/_next/image?q=75` over all ten works: w=640 AVIF 575 kB vs WebP 1,088 kB; w=1080 AVIF 1,145 kB vs WebP 2,158 kB (47% smaller at both) | next: Lighthouse on the Vercel preview

## Final Lighthouse (branch, VERCEL=1 local, WebP, 28 Sep)

| route | form | perf | a11y | bp | seo | LCP ms | CLS | TBT ms | JS kB | img kB |
|---|---|---|---|---|---|---|---|---|---|---|
| / | mobile | 86 | 100 | 96 | 100 | 4184 | 0.002 | 81 | 272 | 681 |
| / | desktop | 99 | 100 | 100 | 100 | 892 | 0.008 | 12 | 403 | 1529 |
| /works/over-the-shoulder | mobile | 90-96 | 100 | 100 | 100 | 2715-3527 | 0.001 | 82 | 277 | 146 |
| /works/over-the-shoulder | desktop | 100 | 100 | 100 | 100 | 724 | 0 | 0 | 277 | 310 |
| /about | mobile | 91 | 100 | 100 | 100 | 3501 | 0.002 | 68 | 277 | 118 |
| /about | desktop | 100 | 100 | 100 | 100 | 575 | 0.002 | 0 | 277 | 253 |

**Corrected reading of the image win.** The honest comparison is main vs branch, both WebP at q=75:
home-mobile image bytes **1,586 kB -> 681 kB (-57%)**, not the 383 kB reported in the cycle-3 summary
(that number came from the AVIF build, since reverted because AVIF is larger than WebP for these textures).
The work page gains 38% of its image bytes. Score noise is +/-5 on this Three.js home page: main measures
82-86 and the branch 86, work page 90-96 vs main 92-96 — overlapping bands, so no regression, but the
scores themselves are not a reliable signal. CLS stays 0.002 everywhere; no score dropped more than 3 points
once baseline noise is discounted.
