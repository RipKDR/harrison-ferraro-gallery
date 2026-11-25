# Website operations and launch check

The approved Open floor design is unchanged. This work covers operational checks,
release traceability, and maintenance; it does not introduce checkout, change
prices, add trackers, or alter the approved prototype.

## Verified production state

- Production release: `3a519b7873cc3d2f2a13ef03a9f08d2b66c8f0d9`.
- Deployment: `dpl_vAzVmSYLD9tKKHqYQxAikGMZTHYU`.
- Both `ferraro.studio` and `www.ferraro.studio` alias that production release.
- The feature branch was pushed and its remote commit was read back.
- `launch-health.json` records the live HTTP checks and their exact timestamp.
  They cover the Open floor home, all ten work pages and web-photo headers,
  secondary pages, sitemap, robots, llms.txt, analytics script endpoints, canonical
  URLs, apex redirect, and three source/environment paths that must return 404.
- No production form is submitted by the recurring checker. Artwork requests use
  HEAD, not downloads of public originals. HTTP checks do not certify browser
  interaction, physical-phone behavior, visual fidelity, or email delivery.

## Email and enquiries

Vercel has production `RESEND_API_KEY` and `ENQUIRY_TO_EMAIL` secrets. Sending DNS
records exist for Resend, including DKIM, SPF, a bounce subdomain, and DMARC in
monitoring mode. Root-domain MX lookup returned no receiving-mail record:
`hello@ferraro.studio` is a sending identity, not a verified receiving inbox.
Do not publish it as the direct reply/contact address until receiving mail or
forwarding is configured. Existing form Reply-To uses the visitor's address;
the authorized Gmail fallback remains intact.

Two labeled native-form POST tests were made, one original and one signed print.
Run label: `OPS-20261017T171243Z`. The print response contains actual React action
state `success` with `Signed print` and `abstract-blue-loops`, confirming the
email service accepted that submission. Neither provider delivery nor inbox
receipt has been verified. The original returned HTTP 200 but its response body
was not retained, so its action acceptance remains unknown. Do not blindly
resend either test: an email may already have arrived.

The native HTML result remained the form rather than rendering a confirmation;
these requests are not equivalent to a hydrated-browser interaction test. The
normal browser attempt was blocked by an unrelated extension's restricted frame
before any submission. No extension was disabled and no browser setting changed.
Browser follow-up remains open. No successful-order or delivered-email claim is
made from HTTP 200.

Vercel refuses to export these sensitive secret values and returns `[SENSITIVE]`
placeholders. The temporary environment download was deleted. No secret values
were printed, committed, or copied into this documentation. Delivery-log checks
need the existing Resend dashboard or Harry's inbox confirmation; do not weaken
secret protection to obtain them.

## Analytics and privacy

The Vercel project API reports `webAnalytics.hasData: true` and
`speedInsights.hasData: true`. This establishes that both services have received
data, not that this check measured current conversion rates or field performance.
Their public script endpoints pass the live HTTP check. No new tracker was added.
PostHog has no production key and remains off. Clarity is already included, loads
lazily, and is disclosed on the privacy page. Work pages have an `artwork_view`
tracker, but the new Open floor component does not emit per-painting navigation
events. Do not present room-browsing popularity as measured. Adding and verifying
that hook is a separate nonvisual follow-up; this pass does not enable extra
tracking merely to fill a dashboard.

No consent control was found in the inspected layout or PostHog initializer.
Before targeting visitors in jurisdictions requiring consent, review whether
Clarity/cookie-based analytics must be gated and how requests to delete data are
handled. Disclosure alone is not a legal compliance determination. This pass does
not invent legal terms, promise compliance, remove the requested Clarity setup,
or enable PostHog. A user/provider decision is required for tracking changes.

The studio list currently emails Harry each signup. It is not a subscriber
platform: do not claim automatic storage, confirmed subscriptions, automated
newsletter campaigns, or automatic unsubscribe processing. A confirmed-subscribe
provider and actual publishing process are a separate setup decision.

## Repeat the read-only check

Use Node.js 24 or newer. No packages or credentials are required by the checker.
The catalogue is imported directly from `src/artworks.ts`.

```bash
npm run check:production
node scripts/check-production.mjs --json
node --test tests/production-check.test.mjs
```

The command exits nonzero on a failed check. Regression tests use an actual
loopback HTTP server and cover a healthy response set, a failed artwork image,
and a site outage. They do not send email. The monitor was exercised against
production, and a false canonical alarm was corrected with a regression check:
`https://www.ferraro.studio` and its trailing-slash root are the same URL.

## CI, monitoring, and dependencies

`.github/workflows/site-operations.yml` defines:

- Build, typecheck, lint, source-fingerprint, operations, Sites, SEO, and compiled
  portfolio-route gates on feature-branch pushes and pull requests to main.
- An hourly, read-only production health job with JSON evidence retained for
  fourteen days. It also runs on pushes and manual workflow dispatch.
- Read-only repository permissions, pinned action commit SHAs, job timeouts,
  concurrency cancellation, and no external monitoring credentials.

The schedule does not become active until the workflow reaches the default
branch AND the GitHub account billing block is resolved. The authenticated run
page for [the first push run](https://github.com/RipKDR/harrison-ferraro-gallery/actions/runs/39053636993)
shows: "The job was not started because recent account payments have failed or
your spending limit needs to be increased. Please check the 'Billing & plans'
section in your settings." It failed before jobs started; no hosted gate or
scheduled monitor has passed. Local actionlint 1.7.12 validated the workflow with
exit 0; its downloaded archive was checked against the published SHA-256
manifest. Do not increase a spending limit or alter payment details automatically.
Feature-branch push runs can verify the workflow after billing is resolved and
before merge. GitHub scheduled jobs
can be delayed; this is not a continuous uptime service or an SLA. GitHub Actions
usage is subject to the account's existing allowance. Failure email delivery also
depends on Harry's GitHub Actions notification preferences; no alert destination
has been verified. Configure those preferences before relying on alerts. This
setup does not add automatic runtime-exception alerts; inspect Vercel runtime
logs for application errors and choose a notification channel before adding one.

`.github/dependabot.yml` requests weekly npm and Actions update PRs, groups npm
minor/patch changes, and limits open requests. It activates when merged to the
default branch. No automatic merge or dependency upgrades are enabled.
The production-dependency audit on this pass reported zero vulnerabilities.

## Release and rollback

1. Review and approve the feature PR; do not force-push or reset main. GitHub's
   configured production branch is main, while the live CLI release is currently
   ahead of it. Until merged, an unrelated main push could redeploy the old site.
2. Run the required gates, review the preview, and obtain Harry's merge approval.
   Merging main triggers Vercel production deployment; then inspect its aliases
   and run `npm run check:production` against the live domain.
3. If a release fails, select the last healthy production deployment in Vercel
   and use its rollback action. The known approved Open floor deployment ID is
   recorded above. Confirm both domain aliases and rerun the HTTP checks.
4. Treat environment changes separately: rolling back an artifact is not proof
   that email credentials, DNS, or external-provider state were rolled back.

[Open the Vercel project](https://vercel.com/harrisonferraro99-4774s-projects/harrison-ferraro-gallery)
for production aliases, rollback, runtime logs, Analytics, and Speed Insights.

## Local verification after this pass

The following commands completed successfully after the operations additions:

- `npm run typecheck`
- `npm run lint` (only the pre-existing old `sketches/shared.js` warning)
- `node --test tests/open-floor.test.mjs tests/production-check.test.mjs tests/portfolio-routes.test.mjs`
- `npm run build`
- `npm run test:sites`
- `npm run seo:check`

All application source, artwork data/photos, and approved baseline files are
unchanged by this pass. The protected worker and Sites packaging files remain
unchanged. No framework page template changed, so the SEO checker self-test did
not need another destructive fault-injection run.

## Remaining human/account checks

- Confirm receipt and Reply-To for the labeled email tests in the studio inbox
  or Resend. Do not infer delivery from the acceptance state.
- Resolve the GitHub billing warning without automatically raising spending
  limits, rerun the hosted gates, then approve the feature PR before hourly
  monitoring can activate. Confirm the preferred failure-notification channel.
- Verify Google Search Console ownership/indexing and Bing Webmaster access in
  their dashboards. A Google verification tag exists, but no account check was
  performed; an absent Bing environment key does not prove the property is absent.
- Test iPhone Safari and Android Chrome on physical devices. Existing mobile
  visual evidence is emulation, not real-device certification.
- Choose receiving-mail/forwarding, newsletter, consent, and print-production
  policies before enabling the corresponding services. No purchase, inventory,
  shipping, returns, or fulfillment behavior was invented.
