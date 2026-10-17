import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { artworks, artworkPrice, printPrice, PRINT_EDITION } from '../src/artworks.ts';

test('approved baseline stays untouched', async () => {
  const hashes = JSON.parse(readFileSync('docs/design/open-floor-source.sha256.json', 'utf8'));
  for (const [path, expected] of Object.entries(hashes)) {
    const hash = createHash('sha256');
    for await (const chunk of createReadStream(path)) hash.update(chunk);
    assert.equal(hash.digest('hex'), expected, path);
  }
});

test('ten unchanged originals and calculated provisional print prices', () => {
  assert.equal(artworks.length, 10);
  assert.equal(new Set(artworks.map(work => work.slug)).size, 10);
  assert.equal(PRINT_EDITION, 10);
  assert.equal(printPrice({ price: 1400 }), 'about $466.67 AUD');
  assert.equal(printPrice({ price: 1200 }), '$400 AUD');
  assert.equal(printPrice({ price: 950 }), 'about $316.67 AUD');
  for (const work of artworks) {
    assert.equal(work.src, `/art/${work.slug}-web.jpg`);
    assert.ok(work.width > 0 && work.height > 0);
    assert.equal(artworkPrice(work), `$${work.price.toLocaleString('en-AU')} AUD`);
  }
});

test('room preserves approved geometry, lens and movement constants', () => {
  const source = readFileSync('sketches/2026-10-18-directions/a/room.js', 'utf8');
  const port = readFileSync('src/components/open-floor-scene.ts', 'utf8');
  for (const name of ['LONG', 'CENTRE', 'STEP', 'VIEW', 'TALL_BELOW', 'MOVE_MS', 'MAX_DPR', 'FOG', 'CEILING', 'STRIPS', 'FLOOR', 'BASE', 'FACE_Z']) {
    const declaration = source.match(new RegExp(`const ${name} = [\\s\\S]*?;`))[0];
    assert.ok(port.includes(declaration), name);
  }
  for (const line of source.split('\n').filter(line => /sx:|sy:|x: lerp|z: lerp|y: lerp|f: lerp|const early|const late|const px =/.test(line))) {
    assert.ok(port.includes(line), line);
  }
  assert.match(port, /THREE\.SRGBColorSpace/);
  assert.match(port, /THREE\.NoToneMapping/);
  assert.match(port, /toneMapped: false, fog: false/);
  assert.match(port, /renderer\.dispose\(\)/);
});
