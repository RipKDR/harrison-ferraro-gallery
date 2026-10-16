import assert from 'node:assert/strict';
import test from 'node:test';

const base = process.env.PORTFOLIO_BASE_URL || 'http://localhost:4173';
const get = path => fetch(new URL(path, base), { signal: AbortSignal.timeout(30_000) });

test('portfolio keeps all artwork pages and removes the print journey', async () => {
  assert.equal((await get('/prints')).status, 404, 'Removed print page must return 404');
  const sitemap = await get('/sitemap.xml');
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  assert.doesNotMatch(xml, /\/prints(?:<|\/)/);
  const works = [...xml.matchAll(/<loc>([^<]+\/works\/[^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
  assert.equal(works.length, 10, 'Every original painting must remain discoverable');
  assert.equal(new Set(works).size, 10);
  for (const path of ['/', '/works', '/about', '/contact', '/privacy', ...works]) {
    const response = await get(path);
    assert.equal(response.status, 200, `${path} must remain available`);
    const html = await response.text();
    assert.doesNotMatch(html, /href="(?:\/prints|[^\"]*#print-interest)"|Print interest|prints are released|prints in preparation|print waitlist/i, `${path} must not promote prints`);
  }
});
