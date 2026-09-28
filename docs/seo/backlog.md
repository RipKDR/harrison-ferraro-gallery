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

Notes: the site has no separate collection page or studio page. The collection is `/#collection` on the home page, and the studio list is a footer form, so `/` and `/about` stand in for them. INP needs field data (Speed Insights / CrUX); TBT is the lab proxy. seo:check baseline: 14 pages, 0 problems.

Already good (verified): robots allow all + sitemap with image entries; apex 308 to www; og:image per work (file-convention OG route, 1200x630 from original photo); unique title/description per work; one h1; server-rendered <img> with descriptive alt + LCP preload; WebP from Vercel optimiser; Three.js dynamic-imported, idle-loaded, desktop only; CSS poster fallback; Person/WebSite/CollectionPage/VisualArtwork/BreadcrumbList JSON-LD.

## Backlog

| # | impact | effort | item | evidence | status |
|---|---|---|---|---|---|
| 1 | H | S | Wrong `sizes` on phone grids: 2-col grid declares 90vw; ~1 MB wasted on home mobile. Hero fallback declares 80vw but renders ~100vw (BP image-size-responsive fail, 96) | LH image-delivery-insight 1,063 KiB; globals.css:119/289 2-col | todo |
| 2 | H | S | No `/llms.txt` for AI answer engines | live 404 | todo |
| 3 | M | S | Enquiry funnel events: only success fires (`enquiry_submit`); no view / attempt / error | EnquiryForm.tsx:48 | todo |
| 4 | M | S | Sitemap has no `lastmod` | sitemap.ts | todo |
| 5 | M | S | AVIF not enabled (`images.formats` default WebP only) | next.config.mjs | todo |
| 6 | L | S | 404 page inherits home og:url `/` and site title | layout.tsx openGraph.url | todo |
| 7 | L | S | Breadcrumb JSON-LD crumb 2 points to `/#collection` fragment | jsonld.tsx | todo |
| 8 | L | M | Non-descriptive source filenames (`portrait.jpeg`, `abstract.jpeg`, `red-smoke.png`) in image URLs | public/art | todo |
| 9 | L | S | Per-work OG image alt is generic (static `alt`) | works/[slug]/opengraph-image.tsx | todo |
| — | n/a | — | UTM on Instagram links: outbound UTMs do nothing; inbound bio-link UTM is off-site → offsite-checklist | — | moved |
| — | n/a | — | CSP header: security-only, risk of breaking PostHog/Vercel scripts; not an SEO item | — | parked |

## Cycle log
