# Harrison Ferraro gallery prototype

Responsive Next.js App Router portfolio using Three.js 0.186.0. Next.js 16.3.5 was verified against the package registry on 15 September 2026.

## Run

`npm install` then `npm run dev` (port 4173). `npm run build` creates a static Next.js export and Sites-compatible output. `npm run test:sites` verifies hosting behavior.

## Content

`src/artworks.ts` holds provisional descriptive labels and original photo corner coordinates. Source photos are unchanged. Browser canvas maps the photographed canvas corners for display; no AI repainting is used. The environment background is generated. Add confirmed titles, dimensions, medium, prices/availability, and contact details before launch.

## Interaction

Click a work, use the arrow controls or keyboard arrows, switch to Index, zoom or use Full view, and prepare/copy an enquiry. Artwork hash links reopen a selected work. Native dialogs support keyboard focus and Escape. Nothing in the enquiry form is transmitted or persisted.

## Rendering and limits

Three.js loads client-side and renders on demand with bounded pixel density. Browsers without WebGL use an equivalent projective CSS/canvas gallery. The cloud browser has WebGL disabled; the fallback is visually and interactively verified. GPU rendering still requires an accelerated-browser check.

## Preview and deployment

The site is public and indexable (`src/app/robots.ts`, `src/app/sitemap.ts`). `?preview=mobile` supplies a 390×844 development comparison surface; normal routes adapt to device width. Sites source history provides rollback. No payment, email service, tracking or authentication backend is added.
