---
name: run-ferraro-gallery
description: Build, run, and drive the ferraro.studio Next.js gallery site. Use when asked to start or run the site, take screenshots (desktop or mobile) of the home page, the works index, a painting page or About, test the enquiry or studio-list forms end-to-end, verify a PR in a real browser, or run the pre-PR checks (typecheck, lint, build, test).
---

# Run ferraro.studio

This is a Next.js 16 App Router site of static pages: `/`, `/works`, 10 SSG painting pages under `/works/[slug]`, `/about`, `/contact` and `/privacy`, with Resend-backed server-action forms. There is no WebGL, modal or zoom viewer.

The agent path uses three scripts:
- `serve.sh` builds and starts the site.
- `driver.mjs` drives it in headless Chromium using the globally installed Playwright.
- `mock-resend.mjs` stands in for the Resend API, so the forms can be submitted end-to-end without a key.

All paths are relative to the repo root. `S=.claude/skills/run-ferraro-gallery`.

## Prerequisites

You need Node 22 and a `playwright` package. The cloud image normally has it installed globally with Chromium at `/opt/pw-browsers`; no `apt-get` step is needed. Playwright is **not** a project dependency, so don't add it. If it is missing, set `NODE_PATH` to any `node_modules` that contains `playwright` (an `npx playwright` cache works) and `PW_CHANNEL=chrome` to drive the installed Google Chrome.

## Setup

```bash
npm ci
```

`.env.local` is not needed locally. Without Resend env vars, both forms (enquiry and studio list) fall back to a `mailto:` link.

## Pre-PR checks (CLAUDE.md requires all of them)

```bash
npm run typecheck && npm run lint && npm run build && npm run test:sites && npm run seo:check
```

Expected results:
- Lint shows 0 errors and 4 existing warnings (2 `import/no-anonymous-default-export`, 2 unused imports in `scripts/seo-check-selftest.mjs`).
- The build prerenders 36 pages.
- `test:sites` passes 4 tests.
- `seo:check` crawls 15 pages (14 in the sitemap; `/privacy` is linked but not listed) with no problems.

## Run (agent path)

```bash
S=.claude/skills/run-ferraro-gallery
$S/serve.sh prod                  # build + next start on :4180 (forms in mailto mode)
node $S/driver.mjs smoke          # ~45 s: /, /works, /about, /contact, /privacy, 2 painting pages × desktop+mobile, 404
node $S/driver.mjs shot /works/figure-with-skull --mobile --full
PORTFOLIO_BASE_URL=http://localhost:4180 node --test tests/portfolio-routes.test.mjs
$S/serve.sh stop
```

To exercise the **real server-action path** (Resend stubbed locally):

```bash
$S/serve.sh prod-email            # mock Resend on :4199 + build/start with email env
node $S/driver.mjs forms          # enquiry + studio list on a painting page; asserts 2 emails, none to the visitor
cat /tmp/ferraro-resend.jsonl     # exact payloads the server sent (from, reply_to, subject, text)
MOCK_FAIL=1 $S/serve.sh prod-email && node $S/driver.mjs forms   # error UI; the result checks are EXPECTED to FAIL
```

Take PR screenshots in `prod-email` mode. In mailto mode the forms show the fallback ("Write the email", "Join by email"), not what production shows.

For ad-hoc driving, use the REPL. Selectors can contain spaces, so `fill` and `select` take the form `<selector> | <value>`:

```bash
printf '%s\n' 'nav /works/figure-with-skull' \
  'fill .studio-list input[type=email] | a@example.com' \
  'click .studio-list button[type=submit]' \
  'wait .studio-list [role=status]' 'text .studio-list [role=status]' \
  'shot studio-list' 'errors' 'quit' | node $S/driver.mjs repl --mobile
```

| command | what it does |
|---|---|
| `smoke` | status, console errors, sideways scroll and screenshots for every route on desktop and mobile, plus the 404; exits 1 on any FAIL |
| `forms` | detects email or mailto mode; submits the enquiry and studio list after the 3 s human delay; checks the 2 captured emails go only to the studio |
| `shot <path> [--mobile] [--full]` | one screenshot, plus any console errors; `--full` scrolls first so lazy images load |
| `repl [--mobile]` | `nav click fill select press wait text eval shot errors quit` |

Environment variables:
- `BASE` defaults to `http://localhost:4180`.
- `SHOTS` defaults to `/tmp/ferraro-shots`.
- `RESEND_CAPTURE` defaults to `/tmp/ferraro-resend.jsonl`.
- `PW_CHANNEL=chrome` uses the installed Google Chrome instead of Playwright's Chromium.

Screenshots are written to `/tmp/ferraro-shots/<route>-<desktop|mobile>.png`. Logs are written to `/tmp/ferraro-server.log`, `/tmp/ferraro-build.log` and `/tmp/ferraro-mock-resend.log`.

**Look at the screenshots** with the Read tool before claiming that a visual change works.

For HMR while you edit, run `$S/serve.sh dev` (`next dev` on port 4180, ready in about 5 s; the first route compile takes about 3 s). The driver works the same way against it.

## Run (human path)

```bash
npm run dev    # http://localhost:4173 (scripts/dev.mjs); Ctrl-C to stop
```

## Gotchas

- **Email mode is fixed at build time, not at start time.** Pages are static, so `isEmailConfigured()` runs during `next build`. If you start `next start` with `RESEND_API_KEY` and `ENQUIRY_TO_EMAIL` set on a build made without them, the forms stay in mailto mode. In production this means **adding or changing the Resend env vars in Vercel requires a redeploy.** `serve.sh prod-email` sets the env vars before the build for this reason.
- **A submit within 2.5 s of page load is silently dropped, and so is one with the honeypot filled.** The `looksAutomated()` check in `src/app/actions.ts` makes it look like a success: the UI shows the normal thank-you and nothing is sent. Automated tests must wait first. `driver.mjs forms` waits 3 s.
- **The resend SDK honours `RESEND_BASE_URL`.** That is how `mock-resend.mjs` intercepts calls with no code patch. The studio list makes 2 calls when `RESEND_STUDIO_LIST_SEGMENT_ID` is set: `POST /contacts`, then `POST /emails`.
- **`lsof` can't see listeners in this container, and `fuser` is not always installed.** A missed old server makes the next start fail with `EADDRINUSE` while the old one keeps serving stale pages. `serve.sh stop` uses `fuser` when present, otherwise `netstat`, and force-kills after 10 s.
- **`next dev` edits tracked files.** It rewrites `next-env.d.ts` (to `.next/dev/types`) and regenerates the `<!-- BEGIN:nextjs-agent-rules -->` block in `AGENTS.md`. Check `git diff AGENTS.md next-env.d.ts` before committing. `next build` does not do this.
- **Lazy images never finish loading in a headless browser.** Waiting on `img.complete` for every image stalls on `loading="lazy"` images below the fold. The driver's `settle()` skips lazy images, and `shot --full` scrolls the page before capturing.
- **Production can't be reached from the cloud container.** The network policy denies `www.ferraro.studio` (403 on CONNECT), so verify against the local build.
- **Stale-looking docs.** `CLAUDE.md`'s audit table and `CODEX-HANDOFF.md` predate the 23 Sep launch and the October 2026 redesign. `README.md` and `AGENTS.md` describe current state. Check the code before trusting a backlog item.

## Troubleshooting

- **`driver.mjs forms` prints `form mode: mailto fallback` after setting env vars:** the build ran without the email env. Rerun `serve.sh prod-email`.
- **`Error: listen EADDRINUSE :::4180` in `/tmp/ferraro-server.log`:** an old server is still running. Run `serve.sh stop`.
- **`Cannot find module 'playwright'` or `Executable doesn't exist`:** see Prerequisites (`NODE_PATH`, `PW_CHANNEL=chrome`).
- **REPL `locator.fill: Element is not an <input>`:** you used a space-separated value. Use `fill <selector> | <value>`.
