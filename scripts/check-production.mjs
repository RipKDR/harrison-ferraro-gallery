import assert from 'node:assert/strict';
import { artworks } from '../src/artworks.ts';

const canonicalOrigin = 'https://www.ferraro.studio';

/** Read-only HTTP checks. Never submit a form or download a large original. Node 24+. */
export async function checkProduction(base = canonicalOrigin) {
  const checks = [];
  async function probe(path, { method = 'GET', statuses = [200], validate } = {}) {
    const started = performance.now();
    const check = { path, method, ok: false };
    try {
      const response = await fetch(new URL(path, base), {
        method, redirect: 'manual', signal: AbortSignal.timeout(15_000),
        headers: { 'user-agent': 'Ferraro-read-only-health-check/1.0' },
      });
      check.status = response.status;
      const body = method === 'HEAD' ? '' : await response.text();
      assert.ok(statuses.includes(response.status), `Expected HTTP ${statuses.join('/')}, got ${response.status}`);
      if (validate) validate(body, response.headers);
      check.ok = true;
    } catch (error) {
      check.error = error.message;
    }
    check.durationMs = Math.round(performance.now() - started);
    checks.push(check);
  }

  for (const path of ['/', '/works', '/about', '/contact', '/privacy', ...artworks.map(work => `/works/${work.slug}`)]) {
    await probe(path, { validate: (html, headers) => {
      assert.match(headers.get('content-type') || '', /text\/html/);
      assert.match(html, /<h1(?:\s|>)/, 'Missing server-rendered heading');
      const canonical = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)/)?.[1];
      assert.ok(canonical, 'Missing canonical URL');
      assert.equal(new URL(canonical).href, new URL(path, canonicalOrigin).href, 'Wrong canonical URL');
      if (path === '/') {
        assert.match(html, /class="open-floor(?:\s|")/, 'Approved Open floor is missing');
        for (const work of artworks) assert.ok(html.includes(work.title), `Index missing ${work.title}`);
      }
    } });
  }
  for (const work of artworks) {
    await probe(work.src, { method: 'HEAD', validate: (_, headers) => assert.match(headers.get('content-type') || '', /^image\/jpeg\b/) });
  }
  await probe('/sitemap.xml', { validate: xml => {
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname).filter(path => path.startsWith('/works/'));
    assert.deepEqual(paths.sort(), artworks.map(work => `/works/${work.slug}`).sort(), 'Sitemap catalogue differs');
  } });
  await probe('/robots.txt', { validate: text => {
    assert.match(text, /User-Agent:\s*\*/i);
    assert.doesNotMatch(text, /^Disallow:\s*\/\s*$/im, 'Site-wide crawl block');
  } });
  await probe('/llms.txt', { validate: text => assert.match(text, /Harrison Ferraro/) });
  for (const path of ['/_vercel/insights/script.js', '/_vercel/speed-insights/script.js']) {
    await probe(path, { method: 'HEAD', validate: (_, headers) => assert.match(headers.get('content-type') || '', /javascript/) });
  }
  for (const path of ['/.env', '/.env.local', '/src/artworks.ts']) await probe(path, { statuses: [404] });
  if (new URL(base).origin === canonicalOrigin) {
    await probe('https://ferraro.studio/', { statuses: [301, 308], validate: (_, headers) => {
      assert.equal(headers.get('location'), `${canonicalOrigin}/`, 'Apex must redirect to canonical www host');
    } });
  }
  return { checkedAt: new Date().toISOString(), base, ok: checks.every(check => check.ok), checks };
}

if (import.meta.main) {
  const report = await checkProduction(process.env.PRODUCTION_BASE_URL || canonicalOrigin);
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else {
    for (const check of report.checks) console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.method} ${check.path} ${check.status ?? 'network error'}${check.error ? ` — ${check.error}` : ''}`);
    console.log(`${report.checks.filter(check => check.ok).length}/${report.checks.length} passed. Read-only; no enquiries sent.`);
  }
  if (!report.ok) process.exitCode = 1;
}
