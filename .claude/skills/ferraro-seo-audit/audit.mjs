#!/usr/bin/env node
// Crawl-level SEO / share / structured-data audit for ferraro.studio. No browser: it reads exactly
// what a crawler reads (server HTML), which is the point — Google Images and link previews never
// run the client canvas code.
//
//   node .claude/skills/ferraro-seo-audit/audit.mjs [--base http://localhost:4180] [--out report.md]
//
// --base defaults to http://localhost:4180; pass https://www.ferraro.studio to audit production.
// Sitemap <loc>s point at www.ferraro.studio and are rewritten onto --base. Exit 1 on any FAIL.
import { writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const BASE = opt('--base', 'http://localhost:4180').replace(/\/$/, '');
const OUT = opt('--out', null);
const PROD = 'https://www.ferraro.studio';
const local = url => url.replace(/^https?:\/\/(www\.)?ferraro\.studio/, BASE);

const rows = [];
let fails = 0;
let warns = 0;
const record = (level, page, message) => {
  rows.push({ level, page, message });
  if (level === 'FAIL') fails += 1;
  if (level === 'WARN') warns += 1;
};

async function get(url) {
  const response = await fetch(url, { redirect: 'manual' });
  return { status: response.status, type: response.headers.get('content-type') ?? '', body: response.status < 300 ? await response.text() : '' };
}
async function head(url) {
  const response = await fetch(url);
  await response.arrayBuffer();
  return { status: response.status, type: response.headers.get('content-type') ?? '' };
}

const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const meta = (html, attr, key) => {
  const match = html.match(new RegExp(`<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"`)) ?? html.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${key}"`));
  return match ? decode(match[1]) : null;
};

// --- robots + sitemap ------------------------------------------------------------------------
const robots = await get(`${BASE}/robots.txt`);
if (robots.status !== 200) record('FAIL', '/robots.txt', `status ${robots.status}`);
else {
  if (/Disallow:\s*\/\s*$/m.test(robots.body)) record('FAIL', '/robots.txt', 'disallows the whole site');
  if (!robots.body.includes(`${PROD}/sitemap.xml`)) record('FAIL', '/robots.txt', 'does not point at the production sitemap');
}

const sitemap = await get(`${BASE}/sitemap.xml`);
if (sitemap.status !== 200) { record('FAIL', '/sitemap.xml', `status ${sitemap.status}`); finish(); }
const entries = [...sitemap.body.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, block]) => ({
  loc: block.match(/<loc>([^<]+)<\/loc>/)[1],
  images: [...block.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(m => m[1]),
}));
record('INFO', '/sitemap.xml', `${entries.length} URLs, ${entries.filter(e => e.loc.includes('/works/')).length} work pages`);
for (const entry of entries) if (!entry.loc.startsWith(`${PROD}/`)) record('FAIL', entry.loc, 'sitemap loc is not on the production origin');
const sitemapImages = [...new Set(entries.flatMap(e => e.images))];
for (const image of sitemapImages) {
  const { status, type } = await head(local(image));
  if (status !== 200 || !type.startsWith('image/')) record('FAIL', image, `sitemap image -> ${status} ${type}`);
}

// --- per page ----------------------------------------------------------------------------------
const titles = new Map();
const descriptions = new Map();
const missingFacts = [];
for (const { loc } of entries) {
  const path = loc.slice(PROD.length) || '/';
  const page = await get(local(loc));
  if (page.status !== 200) { record('FAIL', path, `status ${page.status}`); continue; }
  const html = page.body;

  const robotsMeta = meta(html, 'name', 'robots');
  if (robotsMeta && /noindex|nofollow/.test(robotsMeta)) record('FAIL', path, `robots meta "${robotsMeta}"`);
  if (!/<html[^>]*lang="en-AU"/i.test(html)) record('WARN', path, 'html lang is not en-AU');

  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  if (!title) record('FAIL', path, 'no <title>');
  else if (title.length > 70) record('WARN', path, `title ${title.length} chars (>70): ${title}`);
  titles.set(title, [...(titles.get(title) ?? []), path]);

  const description = meta(html, 'name', 'description');
  if (!description) record('FAIL', path, 'no meta description');
  else {
    if (description.length < 50 || description.length > 160) record('WARN', path, `description ${description.length} chars (target 50–160)`);
    descriptions.set(description, [...(descriptions.get(description) ?? []), path]);
  }

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical) record('FAIL', path, 'no canonical');
  else if (canonical !== loc && canonical !== loc.replace(/\/$/, '')) record('FAIL', path, `canonical ${canonical} != sitemap ${loc}`);

  const ogImage = meta(html, 'property', 'og:image');
  if (!ogImage) record('FAIL', path, 'no og:image');
  else {
    const { status, type } = await head(local(ogImage));
    if (status !== 200 || !type.startsWith('image/')) record('FAIL', path, `og:image ${ogImage} -> ${status} ${type}`);
  }
  for (const key of ['og:title', 'og:description', 'og:url']) if (!meta(html, 'property', key)) record('FAIL', path, `no ${key}`);
  if (meta(html, 'property', 'og:locale') !== 'en_AU') record('WARN', path, 'og:locale is not en_AU');
  if (meta(html, 'name', 'twitter:card') !== 'summary_large_image') record('WARN', path, 'twitter:card is not summary_large_image');

  const images = [...html.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
  const noAlt = images.filter(tag => !/\salt="[^"]+"/.test(tag) && !/aria-hidden="true"/.test(tag));
  if (noAlt.length) record('FAIL', path, `${noAlt.length} <img> without alt text`);

  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const jsonld = [];
  for (const block of blocks) {
    try { jsonld.push(JSON.parse(block)); } catch (err) { record('FAIL', path, `JSON-LD does not parse: ${err.message}`); }
  }
  const types = jsonld.map(item => item['@type']);
  if (!jsonld.length) record('FAIL', path, 'no JSON-LD');

  if (path.startsWith('/works/')) {
    if (images.length === 0) record('FAIL', path, 'artwork not in server HTML (<img> missing)');
    const artwork = jsonld.find(item => item['@type'] === 'VisualArtwork');
    if (!artwork) { record('FAIL', path, `no VisualArtwork JSON-LD (found ${types.join(', ')})`); continue; }
    for (const key of ['name', 'image', 'creator', 'url']) if (!artwork[key]) record('FAIL', path, `VisualArtwork missing ${key}`);
    if (artwork.url && artwork.url !== loc) record('FAIL', path, `VisualArtwork url ${artwork.url} != ${loc}`);
    const gaps = ['artMedium', 'width', 'height', 'dateCreated'].filter(key => !artwork[key]);
    if (gaps.length) missingFacts.push(`${path}: ${gaps.join(', ')}`);
    if (jsonld.some(item => item['@type'] === 'Product' || item.offers)) record('WARN', path, 'Product/Offer markup present — only valid once prints are purchasable');
    if (!types.includes('BreadcrumbList')) record('WARN', path, 'no BreadcrumbList JSON-LD');
  }
  if (path === '/' && !types.includes('Person')) record('FAIL', path, 'home has no Person JSON-LD');
  record('INFO', path, `title "${title}" · ${images.length} img · JSON-LD: ${types.join(', ')}`);
}

for (const [title, paths] of titles) if (paths.length > 1) record('FAIL', paths.join(' '), `duplicate title "${title}"`);
for (const [, paths] of descriptions) if (paths.length > 1) record('WARN', paths.join(' '), 'duplicate meta description');

// Unknown artwork facts are intentionally omitted (never invented). Report them as Harry's TODO list.
if (missingFacts.length) record('INFO', 'TODO(harry)', `${missingFacts.length} works missing confirmed facts:\n    ${missingFacts.join('\n    ')}`);

const notFound = await get(`${BASE}/works/this-work-does-not-exist`);
if (notFound.status !== 404) record('FAIL', '/works/<unknown>', `expected 404, got ${notFound.status}`);

finish();

function finish() {
  const lines = rows.map(({ level, page, message }) => `${level.padEnd(4)}  ${page}  ${message}`);
  lines.push('', `${fails} fail, ${warns} warn — audited ${BASE}`);
  console.log(lines.join('\n'));
  if (OUT) {
    const table = rows.filter(r => r.level !== 'INFO').map(r => `| ${r.level} | \`${r.page}\` | ${r.message.replace(/\|/g, '\\|').replace(/\n\s*/g, '<br>')} |`);
    const todo = rows.find(r => r.page === 'TODO(harry)');
    writeFileSync(OUT, `# SEO audit — ${BASE}\n\n${fails} fail, ${warns} warn.\n\n| Level | Page | Finding |\n|---|---|---|\n${table.join('\n') || '| — | — | No failures or warnings |'}\n${todo ? `\n## Missing artwork facts (TODO(harry))\n\n${todo.message.split('\n').slice(1).map(l => `- ${l.trim()}`).join('\n')}\n` : ''}`);
    console.log(`report -> ${OUT}`);
  }
  process.exit(fails ? 1 : 0);
}
