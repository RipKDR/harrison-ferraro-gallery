# Portfolio QA — 26 September 2026

final result: passed

Scope: local Next.js portfolio improvements. No commit, push or production deployment. Prior prototype evidence is retained below as historical context.

## Visual evidence

Source visual truth: `docs/selected-design.png`, 1487 x 1058 pixels. Implementation: `docs/qa-2026-09-26/desktop-gallery.jpg`, 1487 x 1058 requested CSS viewport; native browser capture is 1472 x 1047 JPEG pixels. Both images were opened together in the same comparison input. The browser capture excludes the scrollbar and scales proportionally; no image stretching was used. State: initial spatial gallery, panels closed. Original photos and artist-selected work-10/11/12 supersede the older generated paintings; this is an intentional content difference.

Additional browser screenshots under `docs/qa-2026-09-26/`: requested CSS viewports are desktop collection 1440 x 1200, About and full-screen viewer 1440 x 1000; mobile gallery, collection and About 390 x 844; corrected narrow About 320 x 740. Actual JPEG dimensions are collection 1425 x 1188, About 1425 x 990, full-screen viewer 1440 x 1000, mobile 375 x 812 and narrow About 305 x 705. Tablet About was visually checked at 768 x 1024. Fonts loaded before screenshots. Full-view source comparison checked composition, artwork edges, floor lettering and navigation; separate collection/About/viewer captures supplied focused evidence for readable captions, forms and controls.

## Required fidelity surfaces

- Typography: retained spaced sans wordmark and Bodoni floor lettering; added locally hosted Bodoni regular/italic for editorial headings. Painting captions use readable serif titles. No external font dependency added.
- Spacing/layout: approved spatial composition preserved. Ivory catalogue uses three staggered opening paintings; phones show one featured work then two-column cards. About grid has zero minimum column width and responsive heading size to prevent narrow-screen clipping.
- Colour/tokens: charcoal, warm ivory and restrained oxblood labels; contrasting focus outlines, dark text on ivory catalogue, light text on dark enquiry surfaces.
- Imagery: authentic photographs remain perspective mapped; artist-band detail is explicitly captioned as artwork, not a portrait of the artist. No replacement artwork or invented biography supplied.
- Content: all 12 paintings, stable IDs, featured order and individual artwork URLs remain. Prints removed throughout. Working titles and unknown facts remain identified or omitted. Acquisition begins with an enquiry.

## Findings and fixes

- P2 resolved: About heading forced a grid track wider than a 320px phone. Added minmax(0, 1fr), zero minimum content width and responsive type. Post-fix `narrow-about.jpg` and measured site scroll/client widths both 305px confirm no overflow.
- P2 resolved: work-page styling leaked into full-screen viewer. Explicit viewer layout restoration keeps artwork and controls within the viewport; `desktop-fullscreen.jpg`, controls bottom 973px within 1000px viewport.
- P2 resolved: 404 footer briefly hardcoded email-disabled state during reuse. Restored server configuration lookup so configured studio-list submission remains available.
- UX resolved: initial phone painting required two taps. Central action now opens the displayed painting directly.
- Accessibility resolved: hidden fallback paintings removed from tab order and accessibility tree; focus follows displayed painting. Gallery arrow keys ignore editable/modifier/handled events and do not change the gallery while reading later sections. Swipe requires predominantly horizontal movement.

Independent visual review: no actionable P1/P2 findings across source and six implementation screenshots. Independent code review findings above were corrected. Residual P3: generated mock's exact floor glyph shape/texture differs from real CSS/Three rendering; accepted existing implementation difference. Ivory editorial sections are intentional improvements, not literal mock reconstruction.

## Runtime verification

Verified phone next selects Figure in rose / 02 of 03 and only that fallback painting is focusable; artwork modal, zoom to 150%, full view, Escape dismissal and opener-focus restoration; collection quick-view and specific-work enquiry; changing Artwork updates both selected thumbnail/title and form selection; native optional-delivery disclosure; stable artwork pages and About contact paths. Reduced-motion emulation disabled animations/transitions; arrow key while reading collection left hero unchanged. Temporary viewport/media overrides reset. Final gallery left open in Codex in-app browser.

Fresh final browser console interval: no errors or warnings. Earlier transient hot-reload errors during parallel print removal were resolved. Local sending is unconfigured, so enquiry accurately offers the email-app fallback. No real message was sent; production email delivery was not retested or modified.

## Checks

- `npm.cmd run build`: passed, including TypeScript and Sites staging.
- `npm.cmd run typecheck`: passed; final build also checked TypeScript after follow-up edits.
- `npm.cmd run lint`: 0 errors; 3 existing warnings in imported tooling, next.config.mjs and protected worker/index.js.
- `npm.cmd run test:sites`: 4 passed; dist/client/index.html, dist/server/index.js and dist/.openai/hosting.json present.
- `node --test tests/portfolio-routes.test.mjs`: passed. All 12 artwork routes, home/About, removed /prints 404 and sitemap verified.
- SEO audit: 0 failures, 0 warnings, `docs/seo-review-2026-09-26.md`.
- `git diff --check`: passed.

Reference research: Antony Gormley (https://www.antonygormley.com/) and Studio Olafur Eliasson (https://olafureliasson.net/). Used as grounding for artwork-first presentation, artist context and direct navigation; no verified traffic ranking claimed.

---

## Historical prototype QA (superseded by the current verification above)

# Design QA

final result: passed

Scope: responsive prototype and compatible gallery renderer. GPU/WebGL execution remains unverified because the cloud browser disables WebGL. This is not production sign-off.

## Evidence

Source visual truth: docs/selected-design.png (1487Ã—1058). Browser-rendered desktop: docs/desktop-verified.jpg (1363Ã—936 CSS pixels, density 1). Mobile: docs/mobile-verified.jpg (390Ã—844 content crop, density 1). State: initial gallery with panels closed. Source and final desktop screenshot were emitted together in one comparison input. Artwork coordinates scale proportionally into the responsive viewport; the 3.6% aspect-ratio difference was accounted for without stretching the source. Exact-size full-page capture timed out; normal viewport screenshots succeeded. Important controls and artwork edges were readable in the full comparison; no additional focused crop needed.

## Findings and comparison history

- P1 resolved: 100px CSS compositing blurred fallback artwork. Raised surface to 1000px; final screenshot has clear original-photo detail.
- P1 resolved: missing WebGL initially forced Index. Added equivalent projective fallback matching selected spatial design.
- P2 resolved: floor lettering clipped and controls were off-centre. Local Bodoni Moda, reduced perspective scale and centred controls fixed these in final desktop/mobile evidence.
- P2 resolved: first mobile next action selected first work again. Mobile now advances to second work; browser assertion passed.
- Development CSS was temporarily invalidated during build. Reloaded after build and rechecked styled final view.

## Required fidelity surfaces

Typography: spaced sans wordmark/navigation and high-contrast bold serif floor lettering match hierarchy. Exact generated glyphs/perspective differ slightly (P3). Spacing: measured three-canvas corners retained under proportional viewport fit; mobile shows one work. Colours: charcoal environment, warm white text, subdued floor word; backdrop texture differs slightly (P3). Images: authentic source photos are perspective-corrected at display time; no AI repainting. Result intentionally preserves actual work instead of generated variations in mockup. Copy: main navigation retained; provisional work descriptions and unconfirmed details explicitly identified.

## Browser verification

Tested: open artwork; zoom to 150%; enter/exit full view; open artwork enquiry; complete test name/email; prepare readonly draft; close panel; explore a work; return to overview; About; Escape dismissal; Index and return; mobile next selects work 02. Native dialogs contain keyboard focus. Clipboard has manual-copy fallback; actual clipboard write and hash-link reload were not separately exercised.

Console checked. Initial Three.js context errors fixed by preflight feature detection. Other observed errors came from browser extension metadata and its injected html cursor attribute causing a development hydration warning. No warning-suppression workaround added.

## Verification and open items

Next.js build and TypeScript pass. Four hosting/routing tests pass. Final visual pass applies to the compatible renderer. Still needed before public launch: accelerated-browser WebGL test, real iOS/Instagram webview check, confirmed artwork metadata/biography and contact destination. Enquiry draft sends/stores nothing.
