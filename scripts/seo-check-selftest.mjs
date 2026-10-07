// Proves npm run seo:check actually fails when the site is broken. A gate nobody has watched
// fail is a gate nobody should trust. Injects one fault at a time into a copy of the tree,
// runs the checker against it, and restores the originals.
import { execFileSync } from 'node:child_process';
import { copyFileSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

const WORK = 'src/app/works/[slug]/page.tsx';
const ABOUT = 'src/app/about/page.tsx';
const SITEMAP = 'src/app/sitemap.ts';
const backup = new Map();
const read = path => { if (!backup.has(path)) backup.set(path, readFileSync(path, 'utf8')); return backup.get(path); };
const write = (path, s) => writeFileSync(path, s);
const restore = () => { for (const [path, s] of backup) writeFileSync(path, s); backup.clear(); };
process.on('exit', restore);

// Each fault must be caught. `expect` is the substring the checker's output must contain.
const faults = [
  { name: 'title over 60 chars', files: [[WORK, s => s.replace(/    title,(\r?\n)/, "    title: title + ' padded out well past the sixty character limit',$1")]], expect: 'chars (>60)' },
  { name: 'img without alt', files: [[ABOUT, s => s.replace('<ArtworkImage work={featuredArtworks[0]} preload sizes="(max-width: 700px) 85vw, 40vw" />', '<img src={featuredArtworks[0].src} width={400} height={600} />', 1)]], expect: 'img without alt' },
  { name: 'invalid JSON-LD', files: [[ABOUT, s => s.replace('      <JsonLd data={personJsonLd} />', "      <JsonLd data={{ missing: true }} />", 1)]], expect: 'JSON-LD' },
  { name: 'broken internal link', files: [[ABOUT, s => s.replace('href="/#collection">See all works', 'href="/works/does-not-exist">See all works', 1)]], expect: 'broken internal link' },
  { name: 'sitemap URL that 308s', files: [[SITEMAP, s => s.replace('url: absoluteUrl(artworkPath(work)),', "url: absoluteUrl(artworkPath(work)) + '/',", 1)]], expect: 'status 308' },
  { name: 'missing canonical', files: [[ABOUT, s => s.replace('alternates: { canonical: \'/about\' },', '', 1)]], expect: 'missing canonical' },
];

const run = () => {
  execFileSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], { stdio: 'ignore' });
  try {
    execFileSync(process.execPath, ['scripts/seo-check.mjs'], { stdio: 'pipe', encoding: 'utf8' });
    return { caught: false, output: '(exited 0 — fault not detected)' };
  } catch (e) {
    return { caught: true, output: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
};

let failures = 0;
for (const fault of faults) {
  restore();
  let applied = true;
  for (const [path, edit] of fault.files) if (edit(read(path)) === read(path)) applied = false;
  if (!applied) { console.log(`✗ ${fault.name}: could not apply the fault (source changed — update this test)`); failures++; continue; }
  for (const [path, edit] of fault.files) write(path, edit(read(path)));
  const { caught, output } = run();
  console.log(`${caught && output.includes(fault.expect) ? '✓' : '✗'} ${fault.name}${caught ? '' : ' — NOT CAUGHT'}`);
  if (!caught || !output.includes(fault.expect)) { failures++; console.log(output.split('\n').filter(l => l.includes('✗')).slice(0, 3).join('\n')); }
}
restore();
execFileSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], { stdio: 'ignore' });
console.log(failures ? `\n${failures} gate check(s) failed` : '\nseo:check catches every injected fault');
process.exit(failures ? 1 : 0);
