import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { artworks, artworkPrice, printPrice } from '../src/artworks.ts';

const root = 'docs/design/open-floor-qa/';
const json = name => JSON.parse(readFileSync(root + name, 'utf8'));
const jsonl = name => readFileSync(root + name, 'utf8').trim().split('\n').map(JSON.parse);
const initial = jsonl('initial.jsonl');
assert.equal(initial.length, 12);
const viewports = [[1440, 900], [390, 844], [360, 780], [768, 1024], [1920, 1080], [844, 390]];
for (const [w, h] of viewports) {
  const pair = ['source', 'production'].map(name => initial.find(row => row.name === name && row.w === w && row.h === h));
  assert.deepEqual(pair[0].rects, pair[1].rects, `${w}x${h} geometry`);
  assert.ok(pair.every(row => row.spatial && !row.overflow));
}
const catalogue = jsonl('catalogue.jsonl');
assert.equal(catalogue.length, viewports.length * 2 * artworks.length);
const keys = catalogue.map(row => `${row.name}-${row.viewport.join('x')}-${row.i}`);
assert.equal(new Set(keys).size, catalogue.length, 'No duplicate evidence');
let choices = 0;
for (const row of catalogue) {
  const work = artworks[row.i];
  assert.equal(row.title, work.title);
  assert.equal(row.src, work.src);
  assert.equal(row.nw, work.width);
  assert.equal(row.nh, work.height);
  assert.equal(row.original, artworkPrice(work));
  assert.equal(row.print, printPrice(work));
  assert.ok(Math.abs(row.w / row.h - work.width / work.height) < 0.0001);
  assert.ok(row.w <= work.width + 0.5 && row.h <= work.height + 0.5);
  assert.equal(row.visible, 'visible');
  assert.ok(!row.overflow);
  if (row.choices) {
    assert.equal(row.choices.length, 2);
    for (const choice of row.choices) {
      assert.ok(choice.checked);
      assert.ok(choice.summary.includes(choice.kind === 'print' ? printPrice(work) : artworkPrice(work)));
      if (row.name === 'production') {
        const query = new URL(choice.href, 'http://localhost:4173').searchParams;
        assert.equal(query.get('artwork'), work.slug);
        assert.equal(query.get('kind'), choice.kind);
      }
      choices++;
    }
  }
}
const interactions = [...json('interactions.json'), ...json('lifecycle.json')];
assert.ok(interactions.length >= 20);
assert.ok(interactions.every(row => row.passed));
for (const row of json('native-size.json')) {
  assert.equal(row.rect.width, 636);
  assert.equal(row.rect.height, 800);
}
const screenshots = readdirSync(root).filter(name => name.startsWith('source-') && name.endsWith('.png')).sort();
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Open floor source / production evidence</title><style>body{margin:24px;background:#0f0e0d;color:#ece6dc;font:16px Arial,sans-serif}h1{font-size:24px}section{margin-block:40px}h2{font-size:18px}div{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0}img{width:100%;height:auto}figcaption{padding:8px}</style><h1>Open floor: approved source / production port</h1><p>Identical viewport, artwork and state. Prototype review bar hidden. Settled room captures follow image decode and resize. Desktop Chrome mobile emulation, not physical-device verification.</p>${screenshots.map(name => `<section><h2>${name.slice(7, -4)}</h2><div><figure><img src="${name}" alt="Approved source ${name}"><figcaption>Approved source</figcaption></figure><figure><img src="${name.replace('source-', 'production-')}" alt="Production port ${name}"><figcaption>Production port</figcaption></figure></div></section>`).join('')}</html>`;
writeFileSync(root + 'comparison.html', html);
const summary = { viewportPairs: initial.length / 2, catalogueRecords: catalogue.length, originalPrintSelections: choices, interactionAndLifecycleChecks: interactions.length, screenshotPairs: screenshots.length, nativeSizeCeiling: '636x800', physicalDeviceVerification: false };
writeFileSync(root + 'summary.json', JSON.stringify(summary, null, 2) + '\n');
console.log('PASS', JSON.stringify(summary));
