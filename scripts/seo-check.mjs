// SEO regression check: crawls the built site and fails on basic on-page / sitemap faults. No dependencies.
// Usage: npm run build && npm run seo:check        (starts `next start` on a spare port)
//        SEO_BASE_URL=https://preview.example npm run seo:check   (checks a running deployment)
import { spawn } from 'node:child_process';

const PORT = 4199;
const base = process.env.SEO_BASE_URL || `http://localhost:${PORT}`;
let server;
if (!process.env.SEO_BASE_URL) {
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--port', String(PORT)], { stdio: 'ignore' });
  process.on('exit', () => server.kill());
  for (let i = 0; ; i++) {
    try { await fetch(base); break; } catch { if (i > 60) throw new Error('next start did not come up'); await new Promise(r => setTimeout(r, 500)); }
  }
}

const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attr = (tag, name) => decode(tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))?.[1] ?? '');
const get = url => fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(30_000) });

const sitemapRes = await get(new URL('/sitemap.xml', base));
for (const path of ['/robots.txt', '/llms.txt']) { const status = (await get(new URL(path, base))).status; if (status !== 200) fail(path, `status ${status}`); }
if (sitemapRes.status !== 200) fail('/sitemap.xml', `status ${sitemapRes.status}`);
const sitemapUrls = [...(await sitemapRes.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).filter(u => !/\.(png|jpe?g|webp|avif)$/i.test(u));

const pages = new Map(); // path -> { title, description, canonical }
const queue = ['/', ...sitemapUrls.map(u => new URL(u).pathname)];
const linkStatus = new Map();

while (queue.length) {
  const path = queue.shift();
  if (pages.has(path)) continue;
  const res = await get(new URL(path, base));
  if (res.status !== 200) { fail(path, `status ${res.status}`); pages.set(path, {}); continue; }
  const html = await res.text();
  const head = html.slice(0, html.indexOf('</head>') + 1 || undefined);
  const title = decode(head.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? '').trim();
  const metaTag = name => head.match(new RegExp(`<meta[^>]+name="${name}"[^>]*>`, 'i'))?.[0];
  const description = metaTag('description') ? attr(metaTag('description'), 'content').trim() : '';
  const canonicalTag = head.match(/<link[^>]+rel="canonical"[^>]*>/i)?.[0];
  const canonical = canonicalTag ? attr(canonicalTag, 'href') : '';
  pages.set(path, { title, description, canonical });

  if (!title) fail(path, 'missing <title>');
  else if (title.length > 60) fail(path, `title ${title.length} chars (>60): "${title}"`);
  if (!description) fail(path, 'missing meta description');
  else if (description.length < 70 || description.length > 160) fail(path, `description ${description.length} chars (70-160)`);
  if (!canonical) fail(path, 'missing canonical');
  if (/<meta[^>]+name="robots"[^>]+noindex/i.test(head)) fail(path, 'noindex');

  const body = html.slice(Math.max(0, html.indexOf('<body')));
  const h1s = (body.match(/<h1[\s>]/gi) || []).length;
  if (h1s !== 1) fail(path, `${h1s} <h1> elements`);
  for (const img of body.match(/<img\b[^>]*>/gi) || []) if (!/\salt="/i.test(img)) fail(path, `img without alt: ${img.slice(0, 80)}`);

  for (const [, json] of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(json);
      for (const node of data['@graph'] ?? [data]) if (!node['@type']) fail(path, 'JSON-LD node without @type');
      if (!data['@context']) fail(path, 'JSON-LD without @context');
    } catch (e) { fail(path, `invalid JSON-LD: ${e.message}`); }
  }

  for (const [, href] of body.matchAll(/<a\b[^>]*\shref="([^"]+)"/gi)) {
    const url = new URL(decode(href), new URL(path, base));
    if (url.origin !== new URL(base).origin) continue;
    const target = url.pathname;
    if (!linkStatus.has(target)) {
      const status = (await get(new URL(target, base))).status;
      linkStatus.set(target, status);
      if (status === 200 && !/\.\w+$/.test(target)) queue.push(target);
    }
    if (linkStatus.get(target) !== 200) fail(path, `broken internal link ${target} (${linkStatus.get(target)})`);
  }
}

for (const url of sitemapUrls) {
  const page = pages.get(new URL(url).pathname);
  if (!page?.canonical) continue; // already reported
  if (new URL(page.canonical).href !== new URL(url).href) fail(url, `sitemap URL is not canonical (canonical: ${page.canonical})`);
}
for (const key of ['title', 'description']) {
  const seen = new Map();
  for (const [path, page] of pages) if (page[key]) seen.set(page[key], [...(seen.get(page[key]) || []), path]);
  for (const [value, paths] of seen) if (paths.length > 1) fail(paths.join(', '), `duplicate ${key}: "${value}"`);
}

console.log(`seo:check ${base}: ${pages.size} pages, ${sitemapUrls.length} sitemap URLs, ${linkStatus.size} internal link targets`);
if (errors.length) { console.error(errors.map(e => `  ✗ ${e}`).join('\n')); console.error(`${errors.length} problem(s)`); process.exit(1); }
console.log('  ✓ no problems');
process.exit(0);
