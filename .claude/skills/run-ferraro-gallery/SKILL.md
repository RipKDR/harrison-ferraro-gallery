---
name: run-ferraro-gallery
description: Build, run, and drive the ferraro.studio Next.js gallery site. Use when asked to start or run the site, take screenshots (desktop or mobile) of the home page, a work page, or the modal, test the enquiry or print-waitlist forms end-to-end, verify a PR in a real browser, or run the pre-PR checks (typecheck, lint, build, test).
---

# Run ferraro.studio

This is a Next.js 16 App Router site with a Three.js gallery, 12 SSG artwork pages under `/works/[slug]`, and Resend-backed server-action forms.

The agent path uses three scripts:
- `serve.sh` builds and starts the site.
- `driver.mjs` drives it in headless Chromium using the globally installed Playwright.
- `mock-resend.mjs` stands in for the Resend API, so the forms can be submitted end-to-end without a key.

All paths are relative to the repo root. `S=.claude/skills/run-ferraro-gallery`.

## Prerequisites

You need Node 22 and a globally installed `playwright` package with Chromium at `/opt/pw-browsers`. Both are preinstalled in the cloud container. No `apt-get` step is needed, and Playwright is **not** a project dependency, so don't add it.

## Setup

```bash
npm ci
```

`.env.local` is not needed locally. Without Resend env vars, both forms fall back to a `mailto:` link.

## Pre-PR checks (CLAUDE.md requires all of them)

```bash
npm run typecheck && npm run lint && npm run build && npm run test:sites
```

Expected results:
- Lint shows 2 existing `import/no-anonymous-default-export` warnings and 0 errors.
- The build prerenders 36 pages.
- `test:sites` passes 4 tests.

## Run (agent path)

```bash
S=.claude/skills/run-ferraro-gallery
$S/serve.sh prod                  # build + next start on :4180 (forms in mailto mode)
node $S/driver.mjs smoke          # ~20 s: /, /about, 2 work pages × desktop+mobile, 404, modal open/Escape
node $S/driver.mjs shot /works/figure-in-rose --mobile --full
$S/serve.sh stop
```

To exercise the **real server-action path** (Resend stubbed locally):

```bash
$S/serve.sh prod-email            # mock Resend on :4199 + build/start with email env
node $S/driver.mjs forms          # waitlist + enquiry on a work page; asserts 2 captured emails
cat /tmp/ferraro-resend.jsonl     # exact payloads the server sent (from, reply_to, subject, text)
MOCK_FAIL=1 $S/serve.sh prod-email && node $S/driver.mjs forms   # error UI; the result checks are EXPECTED to FAIL
```

For ad-hoc driving, use the REPL. Selectors can contain spaces, so `fill` and `select` take the form `<selector> | <value>`:

```bash
printf '%s\n' 'nav /works/figure-in-rose' \
  'fill .waitlist-form input[type=email] | a@example.com' \
  'click .waitlist-form button[type=submit]' \
  'wait .waitlist-form [role=status]' 'text .waitlist-form [role=status]' \
  'shot waitlist' 'errors' 'quit' | node $S/driver.mjs repl --mobile
```

| command | what it does |
|---|---|
| `smoke` | status, console errors, and screenshots for key routes; checks modal hash and Escape; exits 1 on any FAIL |
| `forms` | detects email or mailto mode; submits both forms after the 3 s human delay; checks the captured emails |
| `shot <path> [--mobile] [--full]` | one screenshot, plus any console errors |
| `repl [--mobile]` | `nav click fill select press wait text eval shot errors quit` |

Environment variables:
- `BASE` defaults to `http://localhost:4180`.
- `SHOTS` defaults to `/tmp/ferraro-shots`.
- `RESEND_CAPTURE` defaults to `/tmp/ferraro-resend.jsonl`.

Screenshots are written to `/tmp/ferraro-shots/<route>-<desktop|mobile>.png`. Logs are written to `/tmp/ferraro-server.log`, `/tmp/ferraro-build.log` and `/tmp/ferraro-mock-resend.log`.

**Look at the screenshots** with the Read tool before claiming that a visual change works.

For HMR while you edit, run `$S/serve.sh dev` (`next dev` on port 4180, ready in about 5 s; the first route compile takes about 3 s). The driver works the same way against it.

## Run (human path)

```bash
npm run dev    # http://localhost:4173 (scripts/dev.mjs); Ctrl-C to stop
```

## Gotchas

- **Email mode is fixed at build time, not at start time.** Work pages are SSG, so `isEmailConfigured()` runs during `next build`. If you start `next start` with `RESEND_API_KEY` and `ENQUIRY_TO_EMAIL` set on a build made without them, the forms stay in mailto mode. In production this means **adding or changing the Resend env vars in Vercel requires a redeploy.** `serve.sh prod-email` sets the env vars before the build for this reason.
- **A submit within 2.5 s of page load is silently dropped.** The `looksAutomated()` bot check in `src/app/actions.ts` makes it look like a success: the UI shows "You're on the list…" and nothing is sent (verified: 0 captured calls). Automated tests must wait first. `driver.mjs forms` waits 3 s.
- **The resend SDK honours `RESEND_BASE_URL`.** That is how `mock-resend.mjs` intercepts calls with no code patch. The waitlist makes 2 calls when a segment is set: `POST /contacts`, then `POST /emails`.
- **`lsof` can't see listeners in this container, so `lsof -ti:4180 | xargs kill` does nothing.** The next start then fails with `EADDRINUSE` while the old server keeps serving stale pages. Use `fuser -k 4180/tcp`; `serve.sh stop` already does this.
- **`next dev` edits tracked files.** It rewrites `next-env.d.ts` (to `.next/dev/types`) and regenerates the `<!-- BEGIN:nextjs-agent-rules -->` block in `AGENTS.md`, which **deletes the "Public launch — 23 September 2026" section** inside that block. Run `git checkout -- AGENTS.md next-env.d.ts` before committing. `next build` does not do this.
- **Lazy images never finish loading in a headless browser.** Waiting on `img.complete` for every image stalls on `loading="lazy"` images below the fold (15 s timeout each, which made a full smoke run take 64 s instead of 18 s). The driver's `settle()` skips lazy images.
- **Phones get the CSS fallback gallery, not WebGL** (`max-width: 699px` in `Home.tsx`). Mobile screenshots never exercise `GalleryScene.tsx`. Desktop headless starts WebGL after the page is idle.
- **Production can't be reached from the cloud container.** The network policy denies `www.ferraro.studio` (403 on CONNECT), so verify against the local build.
- **Stale-looking docs.** `CLAUDE.md`'s audit table and `CODEX-HANDOFF.md` predate the 23 Sep launch. `README.md` and `AGENTS.md` describe current state: the site is indexed, `/works/*` pages exist, and Resend forms and analytics are live. Check the code before trusting a backlog item.

## Troubleshooting

- **`driver.mjs forms` prints `form mode: mailto fallback` after setting env vars:** the build ran without the email env. Rerun `serve.sh prod-email`.
- **`Error: listen EADDRINUSE :::4180` in `/tmp/ferraro-server.log`:** an old server is still running. Run `serve.sh stop`, or `fuser -k 4180/tcp`.
- **REPL `locator.fill: Element is not an <input>`:** you used a space-separated value. Use `fill <selector> | <value>`.
