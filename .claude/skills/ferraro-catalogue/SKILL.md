---
name: ferraro-catalogue
description: Update the ferraro.studio artwork catalogue in src/artworks.ts. Use when Harry confirms or changes a title, price, size, medium, year or availability; when adding or removing a painting or photo; when changing which work leads the home page; or when asked what artwork facts are still missing (TODO(harry)).
---

# Catalogue changes (`src/artworks.ts`)

`src/artworks.ts` holds every artwork in display order. A work page, its `/works` card, sitemap entry, share card, alt text, JSON-LD, `llms.txt` line and enquiry email all come from one record. Paths are relative to the repo root.

## Rules (from CLAUDE.md and AGENTS.md; not negotiable)

- **Only enter facts Harry has confirmed in writing in this conversation or in a linked message.** Never estimate medium, size, year, availability or price. A missing fact stays missing and is listed as `TODO(harry)` in the PR.
- Changing `price` or availability needs his explicit approval in the PR description.
- Never change a `slug`. It is the URL, the photo file name, the enquiry form value and the analytics key. When a title changes, change `title` only. If a slug ever has to move, add the old one to `movedWorks` in `next.config.mjs` so the old URL 301s.
- Photos are the original photograph cropped to the canvas edge, nothing else: no repainting, no generated detail, no upscaling. `width` and `height` must equal the file's pixel size, because a painting is never displayed larger than that.

## What a record holds

Each `entries` item sets `slug`, `title`, `price` (whole AUD), `width`, `height` (photo pixels) and `description` (one factual visual sentence, used in alt text). The `artworks` map adds the facts all ten share: year 2026, "Acrylic, charcoal and pastel on canvas", available, and 60 × 90 cm (90 × 60 for the landscape work). The photo path is always `/art/<slug>-web.jpg`.

When one work differs from the shared facts (for example it sells), add that field to the `Entry` type as optional and spread `...entry` after the shared defaults so it wins. `available: false` already renders as "Sold" in place of the price on cards, the home label and the work page.

## Add a new work

1. Crop the original photo to the canvas edge and save it as `public/art/<slug>-web.jpg` (JPEG). Read its pixel size:
   ```bash
   node -e "require('sharp')('public/art/<slug>-web.jpg').metadata().then(m=>console.log(m.width,m.height))"
   ```
2. Add an `entries` item. Its position is its display order: the first work leads the home page, the next six hang below it, and `/works` shows them all.
3. Bump `CONTENT_UPDATED` in `src/lib/site.ts`, then update the expected count in `tests/portfolio-routes.test.mjs`.
4. Build, check and screenshot:
   ```bash
   npm run typecheck && .claude/skills/run-ferraro-gallery/serve.sh prod
   npm run seo:check
   node .claude/skills/run-ferraro-gallery/driver.mjs shot /works/<slug> --mobile
   ```

## Gotchas

- **A wrong `width`/`height` fails silently.** Nothing checks the record against the file; too large and the photo is upscaled, wrong ratio and it is squashed. Re-run the `sharp` one-liner for every photo you touch.
- `artworks` order is the order of the home page, `/works`, the sitemap, previous/next links and related works. Adding or moving a work changes its neighbours' pages.
- Outside Vercel `images.unoptimized` is on, so local builds serve the JPEG as-is. Keep files at their native size; don't add a larger copy for "quality".
