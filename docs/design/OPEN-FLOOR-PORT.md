# Open floor production port — local verification

Repository: C:/Users/harri/OneDrive/Desktop/GitHub/harrison-ferraro-gallery
Branch / implementation base: feat/gallery-3d / 069b01f
Approved direction: Option 1, A / Open floor. No design-selection work was repeated.
Execution model: session runtime gpt-6.1-sol; no model/provider switch or delegated design pass.

## Acceptance checklist

- [x] Copied A's glass-easel / concrete-base scene into src/components/open-floor-scene.ts. Geometry, lens solve, light/floor constants and 1400 ms movement remain source-matched; tests assert these declarations and equations against the fingerprinted baseline.
- [x] Ported responsive painting/label/walk composition, index, statement and original/print sheet into server-prerendered OpenFloor. Removed review bar, not the selected room. Kept .proto[hidden], opaque phone label and statement red #e15b50 in scoped production CSS.
- [x] src/artworks.ts remains the catalogue and computed-price source. Original records and JPEGs unchanged. Prints are signed editions of 10 at price / 3: about $466.67, $400 and about $316.67 AUD. Final repeating-cent rounding remains provisional.
- [x] All existing work URLs, work-page images/content, metadata, Person / VisualArtwork JSON-LD, sitemap, contact actions, spam/rate-limit protection and privacy disclosure retained. Existing enquiry form accepts Signed print. The home sheet passes the chosen work and kind into /contact; neither choice submits anything automatically.
- [x] DOM painting available before the dynamically imported room. Native image aspect/size caps, unlit sRGB/untoned textures, reduced-motion still navigation and keyboard/native dialogs retained. GPU disposal, demand-only rendering, hidden/offscreen suspension, missing-WebGL/context-loss/chunk-failure fallback and image retry exercised.
- [x] Scoped contextmenu/drag deterrents, draggable=false, touch-callout and print hiding retained. Browser zoom and screenshot shortcuts untouched. No screenshot-prevention claim, watermark, repainting or huge-original route added.

## Necessary production corrections (not new art direction)

The prototype can measure the previous JPEG's intrinsic ratio during a rapid cut, leaving its glass pane/camera offset until resize. The React port commits the next label/image layout before measuring, reserves the photo's exact native aspect ratio and resynchronises on image load. Comparison room screenshots wait for decode and trigger a settled resize on both pages, providing the prototype's correctly aligned reference. Baseline files were never edited.

An SSR JPEG can fail before React attaches onError. The port also observes initial decode rejection so its failure message and Retry button work in that case. Interrupted walks settle to the DOM image; no animation continues while hidden/offscreen.

Schibsted Grotesk 400/500 is self-hosted through next/font rather than requested from Google by visitors. Shared secondary pages inherit that family and the approved dark/bone/ash palette; no separate secondary redesign was undertaken. Old unused hall assets/components and all user sketches are retained, not deleted.

## Fresh evidence

Run: node scripts/verify-open-floor-evidence.mjs

- Six identical source / production viewport pairs: 1440×900, 390×844, 360×780, 768×1024, 1920×1080 and 844×390. Initial painting, label, work, stage, header, walk, title and Details button rectangles match exactly; no page-width overflow.
- 120 catalogue records: ten works × six viewports × source/production. Titles, image URLs, native dimensions, ratios, rendered native-size bounds, original prices and calculated print prices asserted against src/artworks.ts.
- 80 original/print selections across all ten works at desktop and phone widths in both source and port; checked summary, action text and production enquiry query values.
- 20 native interaction / motion / failure / lifecycle / enquiry checks. Includes Enter, Escape with focus restoration, normal neighbour walk, reduced motion, scoped casual-save controls, print hiding, context loss, unavailable WebGL, image failure/retry, chunk failure, idle rendering, simulated hidden-tab suspension, offscreen suspension, visibility recovery, GPU resource deletion on client route exit and both enquiry selections. No enquiry was submitted.
- 29 screenshot pairs. First painting, Blue Undertow, Red Breath and Last Light at all six requested viewports; print sheet and keyboard-focus state at primary desktop/phone widths; additional Last Light native ceiling at 1920×1440, exactly 636×800. Actual-pixels mode also checked at 636×800.
- Comparison gallery: docs/design/open-floor-qa/comparison.html. Each section has source left, production right, at identical dimensions/state. Individual PNGs, side-by-side PNGs and machine-readable JSON/JSONL are beside it.
- Native-image/photo identity and all seven approved source/screenshot SHA-256 values verified by tests/open-floor.test.mjs.

Pixel comparisons are supporting evidence, not an invented pass threshold: viewport screenshots include small text/rasterisation differences and development/runtime loading differences. The largest recorded mean absolute channel difference is approximately 1.655 / 255 (phone print sheet). Geometry and artwork ratios/prices were asserted independently. No universal pixel-perfect claim is made.

## Executed gates

Passed after production changes:

- npm run typecheck
- npm run lint — zero errors; the single pre-existing unused-function warning in old sketches/shared.js remains.
- node --test tests/open-floor.test.mjs tests/portfolio-routes.test.mjs — four tests passed; dev server running.
- npm run build
- npm run test:sites — four tests passed; required dist/client/index.html, dist/server/index.js and dist/.openai/hosting.json retained.
- npm run seo:check — no problems; 15 pages / 14 sitemap URLs / 15 internal link targets.
- npm run seo:check:selftest — all six injected fault classes caught, originals restored and final rebuild passed.

Relevant installed Next.js 16 server/client-boundary and next/font guides were read before framework edits. No packages installed. worker/index.js, .openai/hosting.json, scripts/prepare-sites-build.mjs and tests/sites-worker.test.mjs were not modified.

## Compiled-production follow-up

A temporary loopback-only `next start` on port 4174 was exercised in the browser, then stopped. Three checks passed: compiled home hydration/room/painting loading; index access to all ten works; and print-sheet client navigation into the existing contact form with the correct artwork and Signed print selection. No form was submitted. Evidence: open-floor-qa/production-smoke.json. The development implementation on 4173 was reopened and remains the review preview.

## Accessibility follow-up

Four additional bounded browser checks passed: keyboard traversal/selection of all ten index entries; native modal isolation from background controls across Tab traversal; Escape restoring the invoking Details control; and no page-width overflow at a 720×450 CSS viewport rendered at DPR 2. The last check is an enlarged-layout proxy, not verification of browser-toolbar zoom. Native Chrome can report document.body while Tab crosses browser chrome; no background page control received focus, so no custom focus trap was added. Evidence: open-floor-qa/accessibility-followup.json. No application code changed during this follow-up.

## Preview / boundaries

Implementation: http://localhost:4173/
Approved source: http://localhost:4186/a/
Original comparison: http://localhost:4186/

Both existing local servers were reused; no duplicate dev/prototype server was started. Implementation left open in the browser. Mobile evidence is desktop Chrome emulation, not physical iOS/Android verification. Hidden-tab test uses a simulated visibility signal; offscreen and client-route disposal tests use actual browser observers/navigation. No full screen-reader audit or performance certification claimed.

Commerce, ordering, payments, inventory and fulfilment are not built. Print paper, size, framing and final rounding remain unconfirmed. These are not blockers for the approved portfolio/enquiry port.

The user first authorized a local commit, then explicitly authorized deployment to ferraro.studio. The approved production release is commit 3a519b7, deployment dpl_vAzVmSYLD9tKKHqYQxAikGMZTHYU. A later operational pass pushed the feature branch only; main merge still requires Harry's approval. Pre-existing AGENTS.md edits and unrelated sketches remain uncommitted. Current operational evidence, service limitations, release/rollback steps, and remaining account/device checks are recorded in [the launch runbook](../operations/launch-check.md).
