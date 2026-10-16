#!/usr/bin/env node
// Headless-Chromium driver for ferraro.studio. Runs against an already running server (BASE).
//
//   node driver.mjs smoke            # every route, desktop + mobile screenshots, console errors, sideways scroll
//   node driver.mjs forms            # submit enquiry + studio list on a work page, assert the captured emails
//   node driver.mjs shot <path> [--mobile] [--full]
//   node driver.mjs repl [--mobile]  # stdin commands: nav/click/fill/select/press/wait/text/eval/shot/errors/quit
//
// Env: BASE (default http://localhost:4180), SHOTS (default /tmp/ferraro-shots),
//      RESEND_CAPTURE (default /tmp/ferraro-resend.jsonl, written by mock-resend.mjs).
// Exit code is non-zero when any check fails, so it can gate a PR.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try { return require('playwright'); } catch { /* not a project dependency */ }
  return require(join(execSync('npm root -g').toString().trim(), 'playwright'));
}
const { chromium } = loadPlaywright();

const BASE = process.env.BASE ?? 'http://localhost:4180';
const SHOTS = process.env.SHOTS ?? '/tmp/ferraro-shots';
const CAPTURE = process.env.RESEND_CAPTURE ?? '/tmp/ferraro-resend.jsonl';
const DESKTOP = { viewport: { width: 1440, height: 900 } };
const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
// Server action rejects (silently "succeeds") submits made < 2500 ms after page load: see looksAutomated().
const HUMAN_DELAY_MS = 3000;
mkdirSync(SHOTS, { recursive: true });

const failures = [];
const check = (ok, label) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`); if (!ok) failures.push(label); };
const slug = path => path.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';

async function openPage(browser, device) {
  const context = await browser.newContext({ ...device, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(String(err)));
  return { context, page, errors };
}

// Wait for eager images (lazy ones below the fold never complete headless and would stall 15 s)
// plus a beat for fonts and layout, so screenshots are not blank.
async function settle(page) {
  await page.waitForLoadState('load');
  await page.waitForFunction(() => [...document.querySelectorAll('img')].every(img => img.complete || img.loading === 'lazy'), null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1200);
}

async function shot(browser, path, { mobile = false, full = false } = {}) {
  const { context, page, errors } = await openPage(browser, mobile ? MOBILE : DESKTOP);
  const response = await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  await settle(page);
  if (full) {
    // Lazy images only load near the viewport: scroll the whole page first, then wait for every image.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
      scrollTo(0, 0);
    });
    await page.waitForFunction(() => [...document.images].every(img => img.complete), null, { timeout: 15000 }).catch(() => {});
  }
  const file = join(SHOTS, `${slug(path)}-${mobile ? 'mobile' : 'desktop'}${full ? '-full' : ''}.png`);
  await page.screenshot({ path: file, fullPage: full });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await context.close();
  return { status: response?.status(), file, errors, overflow };
}

async function smoke(browser) {
  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const workPaths = [...sitemap.matchAll(/<loc>https?:\/\/[^<]+?(\/works\/[^<]+)<\/loc>/g)].map(m => m[1]);
  check(workPaths.length > 0, `sitemap lists work pages (${workPaths.length})`);
  const routes = ['/', '/works', '/about', '/contact', '/privacy', ...workPaths.slice(0, 2)];
  for (const path of routes) {
    for (const mobile of [false, true]) {
      const { status, file, errors, overflow } = await shot(browser, path, { mobile });
      const label = `${path} ${mobile ? 'mobile' : 'desktop'}`;
      check(status === 200, `${label} -> ${status} (${file})`);
      check(errors.length === 0, `${label} console clean${errors.length ? `: ${errors.slice(0, 3).join(' | ')}` : ''}`);
      check(overflow <= 0, `${label} no sideways scroll${overflow > 0 ? ` (${overflow}px too wide)` : ''}`);
    }
  }
  const missing = await shot(browser, '/works/does-not-exist');
  check(missing.status === 404, `unknown work -> ${missing.status}`);
}

function captured() {
  if (!existsSync(CAPTURE)) return [];
  return readFileSync(CAPTURE, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line));
}

async function forms(browser) {
  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const path = sitemap.match(/<loc>https?:\/\/[^<]+?(\/works\/[^<]+)<\/loc>/)[1];
  const { context, page, errors } = await openPage(browser, MOBILE);
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  await settle(page);
  const emailMode = await page.locator('button:has-text("Send enquiry")').count() > 0;
  console.log(`form mode: ${emailMode ? 'email service (server action)' : 'mailto fallback (no RESEND_API_KEY/ENQUIRY_TO_EMAIL at server start)'}`);
  if (!emailMode) {
    check(await page.locator('.studio-list a.waitlist-mailto').count() === 1, 'studio list falls back to a mailto link');
    await context.close();
    return;
  }
  const before = captured().length;
  await page.waitForTimeout(HUMAN_DELAY_MS);

  const form = page.locator('#enquire form');
  await form.locator('input[name=name]').fill('Driver Test');
  await form.locator('input[name=email]').fill('collector@example.com');
  await form.locator('.delivery-options summary').click();
  await form.locator('input[name=country]').fill('Australia');
  await form.locator('input[name=postcode]').fill('3000');
  await form.locator('textarea[name=message]').fill('Smoke test enquiry from the run-ferraro-gallery driver.');
  await form.locator('button[type=submit]').click();
  const result = page.locator('#enquire [role=status], #enquire [role=alert]');
  await result.first().waitFor({ timeout: 10000 });
  const resultText = (await result.first().innerText()).trim();
  check(/Thank you/.test(resultText), `enquiry result: ${resultText.split('\n')[0]}`);
  await page.locator('#enquire').screenshot({ path: join(SHOTS, 'enquiry-result-mobile.png') });

  // Studio list (footer band on every page).
  const studio = page.locator('.studio-list');
  await studio.locator('input[type=email]').fill('fan@example.com');
  await studio.locator('button[type=submit]').click();
  const studioResult = studio.locator('[role=status], [role=alert]');
  await studioResult.first().waitFor({ timeout: 10000 });
  const studioText = (await studioResult.first().innerText()).trim();
  check(/studio list/.test(studioText), `studio list result: ${studioText}`);

  const sent = captured().slice(before).filter(entry => entry.path === '/emails');
  check(sent.length === 2, `mock Resend received ${sent.length} email(s) (expect enquiry + studio list)`);
  for (const entry of sent) console.log(`  -> ${entry.body.subject}  [to ${entry.body.to}, replyTo ${entry.body.replyTo ?? entry.body.reply_to}]`);
  // The form is open to anyone, so nothing may ever be addressed to the visitor's (unverified) address.
  check(sent.every(entry => !/collector@|fan@/.test(JSON.stringify(entry.body.to))), 'every email goes to the studio only, never to the visitor');
  check(errors.length === 0, `forms console clean${errors.length ? `: ${errors.join(' | ')}` : ''}`);
  await context.close();
}

async function repl(browser, mobile) {
  const { page, errors } = await openPage(browser, mobile ? MOBILE : DESKTOP);
  console.log('ready> commands: nav <path>, click <sel>, fill <sel> | <text>, select <sel> | <value>, press <key>, wait <sel>, text <sel>, eval <js>, shot [name], errors, quit');
  const rl = createInterface({ input: process.stdin });
  let n = 0;
  for await (const line of rl) {
    const [cmd, ...rest] = line.trim().split(' ');
    const arg = rest.join(' ');
    try {
      if (cmd === 'nav') { const r = await page.goto(BASE + arg, { waitUntil: 'domcontentloaded' }); await settle(page); console.log(`status ${r?.status()} ${page.url()}`); }
      else if (cmd === 'click') await page.locator(arg).first().click();
      // Selectors may contain spaces, so fill/select take "<selector> | <value>".
      else if (cmd === 'fill') { const [sel, text = ''] = arg.split(' | '); await page.locator(sel).first().fill(text); }
      else if (cmd === 'select') { const [sel, value = ''] = arg.split(' | '); await page.locator(sel).first().selectOption(value); }
      else if (cmd === 'press') await page.keyboard.press(arg);
      else if (cmd === 'wait') await page.locator(arg).first().waitFor({ timeout: 10000 });
      else if (cmd === 'text') console.log((await page.locator(arg).first().innerText({ timeout: 5000 })).trim());
      else if (cmd === 'eval') console.log(JSON.stringify(await page.evaluate(arg)));
      else if (cmd === 'shot') { const file = join(SHOTS, `${arg || `repl-${++n}`}.png`); await page.screenshot({ path: file }); console.log(file); }
      else if (cmd === 'errors') console.log(errors.length ? errors.join('\n') : '(no console errors)');
      else if (cmd === 'quit') break;
      else if (cmd) console.log(`unknown command: ${cmd}`);
    } catch (err) { console.log(`error: ${err.message.split('\n')[0]}`); }
    console.log('ready>');
  }
}

const [command = 'smoke', ...rest] = process.argv.slice(2);
// PW_CHANNEL=chrome uses an installed Google Chrome when Playwright's own Chromium is not downloaded.
const browser = await chromium.launch({ args: ['--no-sandbox'], channel: process.env.PW_CHANNEL });
try {
  if (command === 'smoke') await smoke(browser);
  else if (command === 'forms') await forms(browser);
  else if (command === 'shot') {
    const { status, file, errors } = await shot(browser, rest.find(a => !a.startsWith('--')) ?? '/', { mobile: rest.includes('--mobile'), full: rest.includes('--full') });
    console.log(`${status} ${file}`);
    if (errors.length) console.log(`console errors:\n${errors.join('\n')}`);
  } else if (command === 'repl') await repl(browser, rest.includes('--mobile'));
  else { console.error(`unknown command ${command}`); process.exitCode = 2; }
} finally {
  await browser.close();
}
if (failures.length) { console.log(`\n${failures.length} check(s) failed`); process.exitCode = 1; }
