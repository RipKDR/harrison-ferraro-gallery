---
name: ferraro-seo-audit
description: Audit ferraro.studio's crawlable SEO surface, including robots.txt, sitemap and sitemap images, titles, meta descriptions, canonicals, Open Graph/Twitter images, JSON-LD (Person, VisualArtwork, BreadcrumbList), img alt text, the 404 route, and missing TODO(harry) artwork facts. Use for the weekly check, before any PR that touches metadata, routes, artworks.ts or JSON-LD, or when asked to check SEO, structured data, share previews or missing alt text.
---

# ferraro.studio SEO audit

`audit.mjs` reads the server HTML exactly as a crawler would, with no browser. It walks every sitemap URL and exits 1 on any FAIL. It runs in under a second against a local build.

## Run

```bash
.claude/skills/run-ferraro-gallery/serve.sh prod        # build + start :4180
node .claude/skills/ferraro-seo-audit/audit.mjs --out /tmp/seo-report.md
.claude/skills/run-ferraro-gallery/serve.sh stop
```

- `--base <url>` audits another origin. Sitemap `<loc>`s are always `https://www.ferraro.studio/...` and are rewritten onto `--base`.
- `--out` also writes a Markdown table of the FAIL/WARN findings plus the TODO(harry) list, ready to paste into a PR or the weekly report.

## What it checks

| Level | Check |
|---|---|
| FAIL | robots.txt missing or blocking the site; sitemap missing or not pointing at production; a sitemap image not returning 200 image/* |
| FAIL | per page: non-200, `noindex`/`nofollow`, no title, duplicate title, no description, canonical ≠ sitemap loc, `og:image` missing or not an image, `og:title`/`og:description`/`og:url` missing, `<img>` without alt, JSON-LD missing or unparseable |
| FAIL | `/works/*`: artwork `<img>` not in server HTML, or no `VisualArtwork` with name, image, creator and url; home without `Person`; unknown slug not returning 404 |
| WARN | title over 70 or description outside 50–160 characters, duplicate descriptions, lang not `en-AU`, `og:locale` not `en_AU`, no `summary_large_image`, no BreadcrumbList, **`Product`/`Offer` present** (not allowed until prints are purchasable) |
| INFO | per-work `artMedium`/`width`/`height`/`dateCreated` gaps. This is Harry's TODO list and is **expected** until he confirms facts. Never "fix" it by filling in values. |

Baseline as of 24 Sep 2026: 0 fail and 0 warn. All 12 works are missing all four facts.

## Weekly report

1. Run the audit locally on `main`.
2. Paste the `--out` table into the report, along with the PostHog/Search Console numbers (those need the PostHog connector to be authorised).
3. Open one fix PR per real FAIL.
4. List the TODO(harry) gaps as questions for Harry, not as fixes.

## Gotchas

- **Production is unreachable from the cloud container.** `--base https://www.ferraro.studio` fails with 403 on robots.txt and the sitemap, because the proxy denies the CONNECT. That comes from the environment's network policy, not from the site. Audit the local build, or allow the domain in the environment settings.
- **The OG image URL has a hash query** (`/opengraph-image?8afaec…`). It is fetched as-is, so the check covers the generated PNG route.
- **Home currently serves 16 `<img>` and work pages 4, all with alt text.** A count drop or an alt FAIL means a component stopped server-rendering its image. The client canvas does not count for crawlers.
