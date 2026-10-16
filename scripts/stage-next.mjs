// Stage a static mirror of the Next.js build for the Sites handoff (dist/client).
// Production runs on the Next.js runtime; this mirror has no server actions or image optimisation.
import {cpSync,existsSync,mkdirSync,readdirSync,rmSync} from 'node:fs';
import path from 'node:path';
// Vercel serves the Next.js output directly, and Next 16.4 on Vercel no longer leaves prerendered HTML in .next/server/app.
if(process.env.VERCEL){console.log('Vercel build: skipping Sites mirror');process.exit(0)}
const app='.next/server/app',out='dist/client';
rmSync(out,{recursive:true,force:true});mkdirSync(out,{recursive:true});
cpSync('public',out,{recursive:true});
cpSync('.next/static',path.join(out,'_next/static'),{recursive:true});
function walk(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory()){walk(full);continue}
 const rel=path.relative(app,full);let target=null;
 if(rel==='_not-found.html')target='404.html';
 else if(rel.endsWith('.html')&&!rel.startsWith('_'))target=rel;
 else if(rel.endsWith('.body'))target=rel.slice(0,-'.body'.length);
 if(target){const dest=path.join(out,target);mkdirSync(path.dirname(dest),{recursive:true});cpSync(full,dest)}}}
walk(app);
if(!existsSync(path.join(out,'index.html')))throw new Error('Missing prerendered index.html');
