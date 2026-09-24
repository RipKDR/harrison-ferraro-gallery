---
name: ferraro-catalogue
description: Update the ferraro.studio artwork catalogue in src/artworks.ts. Use when Harry confirms a title, medium, dimensions, year, availability or price; when adding a new painting or photo; when changing the featured three works; or when asked what artwork facts are still missing (TODO(harry)).
---

# Catalogue changes (`src/artworks.ts`)

`src/artworks.ts` holds every artwork. A work page, sitemap entry, OG image, alt text and JSON-LD are all generated from one record. Paths are relative to the repo root.

## Rules (from CLAUDE.md and AGENTS.md; not negotiable)

- **Only enter facts Harry has confirmed in writing in this conversation or in a linked message.** Never estimate medium, size, year, availability or price. A missing field stays missing and is listed as `TODO(harry)` in the PR.
- Changing `price` or `availability` needs his explicit approval in the PR description.
- Never change `id`, `slug` or `number` on an existing work. They are used in shared links, enquiry emails and analytics. When a confirmed title differs from the label, set `facts.title` and keep the slug.
- Use original photos only. Don't add AI-generated, repainted or cropped derivative image files. Perspective correction is done at runtime from `corners`.

## Confirm facts for an existing work

Edit the `facts` map near the top of `src/artworks.ts`:

```ts
'work-10':{medium:'Oil on canvas',widthCm:60,heightCm:90,year:'2026',availability:'available',price:'Price on request'},
```

Fields are `title`, `medium`, `widthCm`, `heightCm`, `depthCm`, `year` (string), `availability` (`'available' | 'reserved' | 'sold'`) and `price` (free text, e.g. `'Price on request'`).

The same edit updates these places automatically (verified on a throwaway build):
- The work page `<dl>` rows for Medium, Dimensions (rendered `H × W cm`), Year, Availability and Price.
- The alt text, e.g. `"… — oil on canvas by Harrison Ferraro: …"`.
- The `VisualArtwork` JSON-LD fields `artMedium` and `dateCreated`, plus width and height in `CMT`.
- The TODO(harry) list in the SEO audit, which drops the fields you filled.

One place is **not** updated: the home-page artwork modal (`src/Home.tsx`). It always shows "Acquisition: Enquire for details" and ignores `facts`.

## Add a new work

1. Copy the original photo into `public/art/<kebab-name>.jpg`. Read its pixel size:
   ```bash
   node -e "require('sharp')('public/art/figure-in-grey.jpg').metadata().then(m=>console.log(m.width,m.height,m.format))"
   ```
2. Add **both** of the following. Missing either one breaks the build.
   - A `facts` key: `'work-13':{},`.
   - A `catalogue` entry with these fields:
     - `id`: the next `work-NN`.
     - `slug`: kebab-case of the label.
     - `number`: `'NN'`.
     - `label`: a descriptive working title.
     - `description`: one factual visual sentence.
     - `src`, `width`, `height`: from step 1.
     - `ratio`: the painting's width ÷ height. Use the confirmed dimensions when you have them; otherwise estimate from the corners.
     - `corners`: the photographed canvas's TL, TR, BR and BL corners as 0–1 fractions of the photo. Record the mapping in `docs/catalogue-preparation.json` as well.
3. The featured three are set by `featuredIds` (currently `work-10`, `work-11`, `work-12`, in that order, per AGENTS.md). The 3D gallery must stay at exactly three works. Change that list only when asked.
4. Build, audit and screenshot. Check that the crop looks right in the screenshot; if it doesn't, adjust `corners`.
   ```bash
   npm run typecheck && .claude/skills/run-ferraro-gallery/serve.sh prod
   node .claude/skills/ferraro-seo-audit/audit.mjs      # expect the new /works/<slug> page and 0 fail
   node .claude/skills/run-ferraro-gallery/driver.mjs shot /works/<slug> --mobile
   ```

## Gotchas

- **`tsc` passes but `next build` fails when a work has no `facts` key.** `facts` is a `Record<string, ArtworkFacts>` and `noUncheckedIndexedAccess` is off, so `facts['work-13']` type-checks as defined. At build time it is `undefined`, and the build fails with `TypeError: Cannot read properties of undefined (reading 'title')` at `artworkTitle`, reported as "Failed to collect page data for /about". Always run the build, not just the typecheck.
- **`red-smoke.png` (work-01) is 5.6 MB.** It is the only PNG. It is served as-is in the sitemap image and, outside Vercel, to the page (`images.unoptimized` is on unless `VERCEL` is set). Prefer JPEG for new photos.
- `artworks` (catalogue order with the featured works first) is the order used by the index, the sitemap, the previous/next links and the "More works" section. Adding a work changes the neighbours of the works around it.
