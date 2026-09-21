# Design QA

final result: passed

Scope: responsive prototype and compatible gallery renderer. GPU/WebGL execution remains unverified because the cloud browser disables WebGL. This is not production sign-off.

## Evidence

Source visual truth: docs/selected-design.png (1487×1058). Browser-rendered desktop: docs/desktop-verified.jpg (1363×936 CSS pixels, density 1). Mobile: docs/mobile-verified.jpg (390×844 content crop, density 1). State: initial gallery with panels closed. Source and final desktop screenshot were emitted together in one comparison input. Artwork coordinates scale proportionally into the responsive viewport; the 3.6% aspect-ratio difference was accounted for without stretching the source. Exact-size full-page capture timed out; normal viewport screenshots succeeded. Important controls and artwork edges were readable in the full comparison; no additional focused crop needed.

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
