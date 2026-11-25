import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import { checkProduction } from '../scripts/check-production.mjs';
import { artworks } from '../src/artworks.ts';

async function fixture(run, brokenPath) {
  const server = createServer((request, response) => {
    const path = request.url;
    if (path === brokenPath) return response.writeHead(503).end('Unavailable');
    if (path.startsWith('/art/')) return response.writeHead(200, { 'content-type': 'image/jpeg' }).end();
    if (path.startsWith('/_vercel/')) return response.writeHead(200, { 'content-type': 'application/javascript' }).end('void 0;');
    if (path === '/robots.txt') return response.end('User-agent: *\nAllow: /\n');
    if (path === '/llms.txt') return response.end('Harrison Ferraro');
    if (path === '/sitemap.xml') return response.end(`<urlset>${artworks.map(work => `<url><loc>https://www.ferraro.studio/works/${work.slug}</loc></url>`).join('')}</urlset>`);
    if (path.startsWith('/.env') || path === '/src/artworks.ts') return response.writeHead(404).end();
    response.setHeader('content-type', 'text/html');
    response.end(`<link rel="canonical" href="https://www.ferraro.studio${path === '/' ? '' : path}"><h1>Harrison Ferraro</h1><div class="open-floor">${artworks.map(work => work.title).join(' ')}</div>`);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

test('production check covers every catalogue route, photo and required integration endpoint', async () => {
  await fixture(async base => {
    const report = await checkProduction(base);
    assert.equal(report.ok, true, JSON.stringify(report));
    for (const path of ['/contact', '/privacy', '/robots.txt', '/sitemap.xml', '/llms.txt', '/_vercel/insights/script.js', '/_vercel/speed-insights/script.js', '/.env', '/.env.local', '/src/artworks.ts', ...artworks.flatMap(work => [`/works/${work.slug}`, work.src])]) {
      assert.ok(report.checks.some(check => check.path === path && check.ok), `Missing ${path}`);
    }
  });
});

test('a failed artwork image makes the read-only monitor fail', async () => {
  const path = artworks[0].src;
  await fixture(async base => {
    const report = await checkProduction(base);
    assert.equal(report.ok, false);
    assert.ok(report.checks.some(check => check.path === path && check.status === 503 && !check.ok));
  }, path);
});

test('production check reports an outage and never submits forms', async () => {
  const methods = [];
  const server = createServer((request, response) => {
    methods.push(request.method);
    response.writeHead(503).end('Unavailable');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const report = await checkProduction(`http://127.0.0.1:${server.address().port}`);
    assert.equal(report.ok, false);
    assert.ok(report.checks.some(check => check.path === '/' && check.status === 503 && !check.ok));
    assert.ok(methods.length > 0);
    assert.ok(methods.every(method => method === 'GET' || method === 'HEAD'));
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
