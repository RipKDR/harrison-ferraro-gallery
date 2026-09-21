# Harrison Ferraro portfolio — Codex handover

## Start here
Continue this existing project. Do not restart, regenerate the paintings, or repeat design ideation. Read AGENTS.md and COMMERCIAL-PLAN.md. The user wants a professional, mobile-first artist portfolio that leads to original-art enquiries and print sales. Be economical with tokens; choose sensible defaults and complete work without unnecessary confirmations.

## Source and deployment
- Current source snapshot before this handover: 27ec8d3493fa2fe09b93450defe6476ad03e3933, branch main.
- Private deployed website: https://harrison-ferraro-gallery.ripkdr.chatgpt.site
- Sites project: appgprj_6aa90abd0be481919c0fd51103c38992
- Source remote: https://git.chatgpt-team.site/545bbed3-fff2-4285-bad2-2ecdbe074c72/appgprj_6aa90abd0be481919c0fd51103c38992.git
- Original workspace: /workspace/scratch/6317ee68c7e5/ferraro-gallery (may not exist in a new session).
- This ZIP contains the complete tracked project, assets, lockfile and this handover; no dependencies, build output, Git history or credentials. Extract it and open its folder in Codex.
- The remote needs a fresh Sites source credential. No credential is included. Reuse the same Site and preserve private access. Do not create a replacement or deploy to another provider without user direction.

## Stack and local use
Next.js 16.3.5 App Router static export, React 19.2, Three.js 0.186, TypeScript, custom CSS, Phosphor icons. Preserve package-lock.json. Older Vite dependencies remain but Next is the active application.

```sh
npm ci
npm run dev
npm run build
npm run test:sites
```
Read scripts/dev.mjs for local port options. In the managed Sites environment use its current skill and sites-preview, not an independently started server. Build outputs are staged for Sites by scripts/stage-next.mjs and scripts/prepare-sites-build.mjs. Keep worker/index.js and .openai/hosting.json intact.

## Implemented
- Chosen dark spatial three-canvas gallery with large FERRARO floor lettering; responsive single-artwork presentation on mobile.
- Three.js gallery with CSS/canvas fallback, keyboard arrows, touch navigation, reduced-motion support.
- Twelve-work collection: original three plus nine supplied photographs.
- Non-destructive in-browser crop/straightening via corner coordinates in src/artworks.ts. Original image bytes remain in public/art. No AI repainting and no standalone cropped derivative files were produced.
- Deferred catalogue canvas loading, shared decoded-image cache.
- Artwork modal: enlarged view, zoom controls, copyable hash link, previous/next across all twelve works.
- Original and print-interest enquiry composer; addresses mailto:Harrisonferraro99@gmail.com, then visitor reviews and sends in their own email app. Copy fallback exists. No website-to-email backend or delivery confirmation.
- Instagram: https://www.instagram.com/harrison_ferraro/
- Editable descriptive catalogue labels, artist statement, collecting information and print interest section.

## Key files
- src/app/page.tsx: main page and modal flows; public contact constants.
- src/app/globals.css: desktop/mobile styles, including explicit ?preview=mobile inspection mode.
- src/artworks.ts: all twelve records, crop mapping, featuredArtworks (first three), loadArtwork.
- src/ArtworkImage.tsx: lazy canvas display.
- src/GalleryScene.tsx / src/GalleryFallback.tsx: featured gallery rendering; must remain limited to three independently of catalogue size.
- docs/catalogue-preparation.json: nine new file mappings and crop coordinates.
- docs/selected-design.png: original approved visual target. Other generated concepts were explored but not selected for implementation.

## Important limits and decisions
The site is private; metadata currently disables indexing. Payments, cart, stock, order processing, subscriptions and analytics are not implemented. Prices, sizes, media, availability and formal work titles are not confirmed. Do not manufacture them. All current labels are descriptive placeholders. Some source photos contain glare or incomplete edges; preserve those rather than inventing image detail. These are website photographs, not approved print masters.

Originals should start enquiry-led with destination-specific delivery quotes. Prints should start with one proof-approved image, two proportional unframed sizes and inspected fulfilment; supplier, prices and edition policy remain undecided. Never promise print availability or accept payment until confirmed. The artist authorised use of the email and Instagram above and delegated editable copy decisions.

## Verification completed
Production build and four Sites worker tests passed. All nine new crops were visually inspected in the browser. The twelve-item catalogue and email recipient/body were checked with sample form data, without sending email. Earlier 390px layout and original/print selection flows were checked. Hardware-accelerated WebGL and actual iOS/Android/Instagram browser testing remain unverified; the cloud browser used the fallback renderer.

## Recommended next work
1. Audit current mobile flow and artwork aspect ratios; actual dimensions would improve ratio accuracy. Preserve approved visual direction.
2. Add independently addressable artwork pages with metadata, while retaining gallery inspection UX. Current links are hashes opening modals.
3. If requested, replace mailto with server-delivered enquiries using an authorised email provider, spam protection, validation and honest error/success states. Do not assume Gmail address grants Gmail API access or sender-domain verification.
4. Obtain/confirm catalogue facts and print proof/specifications, then implement real checkout with server-verified payment and inventory handling.
5. Prepare accurate policies, real-device QA, custom domain, public access and search indexing when launch is authorised and ready.

Do not make continued progress contingent on a fresh interview. Ask only for genuinely unavailable facts/accounts needed for the next concrete step. Report limits accurately; never claim a working shop or delivered enquiry when only a draft exists.

## Local continuation — 21 September 2026
See CONTINUATION-VERIFIED.md for the latest mobile/enquiry changes and browser verification. This project was imported from the supplied ZIP; its new Git history begins with this continuation. The website has not been redeployed.
