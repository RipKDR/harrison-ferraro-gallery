/** Artist-confirmed catalogue facts. Leave a field out until Harry confirms it; never estimate. */
export type ArtworkFacts={title?:string;medium?:string;widthCm?:number;heightCm?:number;depthCm?:number;year?:string;availability?:'available'|'reserved'|'sold';price?:string};
export type Artwork={id:string;/** Stable URL slug: keep even if the title changes. */slug:string;number:string;label:string;facts:ArtworkFacts;description:string;src:string;/** Source photo pixel size. */width:number;height:number;ratio:number;corners:[number,number][]};
// TODO(harry): confirm for each work — title, medium, dimensions (cm), year, availability and price
// (or "price on request"). Unconfirmed fields stay out of the UI, alt text and JSON-LD.
const facts:Record<string,ArtworkFacts>={
 'work-01':{},'work-02':{},'work-03':{},'work-04':{},'work-05':{},'work-06':{},
 'work-07':{},'work-08':{},'work-09':{},'work-10':{},'work-11':{},'work-12':{},
};
// Labels are descriptive working titles until facts.title is confirmed.
const catalogue:Artwork[]=[
{id:'work-01', slug: 'figure-in-red', facts: facts['work-01'],number:'01',label:'Figure in red',description:'A pale figure beneath a vivid red form, against a dark ground.',src:'/art/figure-in-red.png', width: 1365, height: 2048,ratio:.81,corners:[[.095,.143],[.909,.142],[.909,.805],[.117,.808]]},
{id:'work-02', slug: 'figure-in-motion', facts: facts['work-02'],number:'02',label:'Figure in motion',description:'A figurative portrait with sweeping dark marks and warm, earthy colour.',src:'/art/figure-in-motion.jpg', width: 1086, height: 1448,ratio:.79,corners:[[.077,.079],[.895,.083],[.827,.829],[.128,.831]]},
{id:'work-03', slug: 'abstract-in-pale-violet', facts: facts['work-03'],number:'03',label:'Abstract in pale violet',description:'A long abstract canvas with white, violet and scattered colour.',src:'/art/abstract-in-pale-violet.jpg', width: 1152, height: 1536,ratio:.43,corners:[[.288,.095],[.738,.129],[.733,.885],[.307,.906]]},
{"id": "work-04", slug: 'portrait-in-crimson', facts: facts['work-04'], "number": "04", "label": "Portrait in crimson", "description": "A dark-haired figure turns towards the viewer, surrounded by layered crimson and black.", "src": "/art/portrait-in-crimson.jpg", width: 988, height: 1317, "ratio": 0.7, "corners": [[0.033, 0.066], [0.883, 0.057], [0.835, 0.94], [0.1, 0.946]]},
{"id": "work-05", slug: 'portrait-with-an-ember', facts: facts['work-05'], "number": "05", "label": "Portrait with an ember", "description": "A portrait in charcoal tones, with a warm ember and a fine trail of smoke.", "src": "/art/portrait-with-ember.jpg", width: 988, height: 1317, "ratio": 0.77, "corners": [[0.074, 0.155], [0.959, 0.119], [0.945, 0.97], [0.133, 0.971]]},
{"id": "work-06", slug: 'portrait-in-light', facts: facts['work-06'], "number": "06", "label": "Portrait in light", "description": "A smiling figure emerges from sweeping dark marks and a pale, textured ground.", "src": "/art/portrait-in-light.jpg", width: 988, height: 1317, "ratio": 0.79, "corners": [[0.005, 0.102], [0.995, 0.098], [0.894, 0.94], [0.11, 0.915]]},
{"id": "work-07", slug: 'figure-in-grey', facts: facts['work-07'], "number": "07", "label": "Figure in grey", "description": "A dark, turned figure against layered silver-grey marks and a weathered surface.", "src": "/art/figure-in-grey.jpg", width: 988, height: 1317, "ratio": 0.67, "corners": [[0.125, 0.117], [0.847, 0.121], [0.851, 0.946], [0.103, 0.94]]},
{"id": "work-08", slug: 'portrait-with-a-rose', facts: facts['work-08'], "number": "08", "label": "Portrait with a rose", "description": "A figure holding a dark rose, surrounded by ochre, charcoal and broken white marks.", "src": "/art/portrait-with-rose.jpg", width: 876, height: 1317, "ratio": 0.65, "corners": [[0.025, 0.025], [0.946, 0.014], [0.989, 0.98], [0.036, 0.986]]},
{"id": "work-09", slug: 'white-on-charcoal', facts: facts['work-09'], "number": "09", "label": "White on charcoal", "description": "Sweeping white gestures and fine scattered marks cross a deep charcoal ground.", "src": "/art/white-on-charcoal.jpg", width: 950, height: 1317, "ratio": 0.72, "corners": [[0, 0.005], [0.999, 0.014], [0.999, 0.999], [0, 0.999]]},
{"id": "work-10", slug: 'over-the-shoulder', facts: facts['work-10'], "number": "10", "label": "Over the shoulder", "description": "A figure looks back through softly layered grey, black and warm neutral tones.", "src": "/art/over-the-shoulder.jpg", width: 989, height: 1317, "ratio": 0.75, "corners": [[0.034, 0.022], [0.976, 0.022], [0.968, 0.972], [0.043, 0.975]]},
{"id": "work-11", slug: 'figure-in-rose', facts: facts['work-11'], "number": "11", "label": "Figure in rose", "description": "A seated figure in dark fabric, set against a rose-coloured ground with deep red and pale marks.", "src": "/art/figure-in-rose.jpg", width: 741, height: 1317, "ratio": 0.667, "corners": [[0.039, 0.097], [0.966, 0.094], [0.919, 0.839], [0.096, 0.84]]},
{"id": "work-12", slug: 'figure-with-a-skull', facts: facts['work-12'], "number": "12", "label": "Figure with a skull", "description": "A figure holds a skull close, against layers of charcoal, white and pale pink.", "src": "/art/figure-with-skull.jpg", width: 988, height: 1317, "ratio": 0.75, "corners": [[0.002, 0.004], [0.999, 0.002], [0.999, 0.998], [0.037, 0.998]]},
];
// Lead with Over the shoulder, Figure in rose, and Figure with a skull.
// Keep catalogue references stable for shared artwork links and enquiries.
const featuredIds=['work-10','work-11','work-12'];
export const artworks:Artwork[]=[
 ...featuredIds.map(id=>catalogue.find(work=>work.id===id)!),
 ...catalogue.filter(work=>!featuredIds.includes(work.id)),
];
export const featuredArtworks=artworks.slice(0,3);
export const artworkBySlug=(slug:string)=>artworks.find(work=>work.slug===slug);
export const artworkPath=(work:Artwork)=>`/works/${work.slug}`;
export const artworkTitle=(work:Artwork)=>work.facts.title??work.label;
export function artworkDimensions({facts}:Artwork){
 if(!facts.widthCm||!facts.heightCm)return undefined;
 return `${facts.heightCm} × ${facts.widthCm}${facts.depthCm?` × ${facts.depthCm}`:''} cm`;
}
const availabilityLabel={available:'Available',reserved:'Reserved',sold:'Sold'} as const;
/** Label/value rows for every confirmed fact, in display order. Unconfirmed fields are simply absent. */
export function artworkFactRows(work:Artwork):[string,string][]{
 const {facts}=work;const dimensions=artworkDimensions(work);
 return [
  ...(facts.medium?[['Medium',facts.medium] as [string,string]]:[]),
  ...(dimensions?[['Dimensions',dimensions] as [string,string]]:[]),
  ...(facts.year?[['Year',facts.year] as [string,string]]:[]),
  ...(facts.availability?[['Availability',availabilityLabel[facts.availability]] as [string,string]]:[]),
  ...(facts.price?[['Price',facts.price] as [string,string]]:[]),
 ];
}
/** True while any fact a collector needs to decide is still awaiting Harry's confirmation. */
export const artworkUnconfirmed=({facts}:Artwork)=>!facts.title||!facts.medium||!facts.widthCm||!facts.heightCm||!facts.availability||!facts.price;
// Descriptive alt text: only confirmed facts (medium) are added to the working description.
export function artworkAlt(work:Artwork){
 const kind=work.facts.medium?work.facts.medium.toLowerCase():'painting';
 return `${artworkTitle(work)} — ${kind} by Harrison Ferraro: ${work.description.charAt(0).toLowerCase()}${work.description.slice(1)}`;
}
// Bounding box of the photographed canvas inside the source photo, as fractions.
// Used where the perspective canvas is unavailable (server HTML, share images).
export function artworkCrop(work:Artwork){
 const [tl,tr,br,bl]=work.corners;
 const left=Math.min(tl[0],bl[0]),right=Math.max(tr[0],br[0]),top=Math.min(tl[1],tr[1]),bottom=Math.max(bl[1],br[1]);
 return {left,top,width:right-left,height:bottom-top};
}
// Small LRU: each ArtworkImage copies the result into its own canvas, so only recent maps are worth keeping.
// Unbounded caching of full-size canvases can exhaust iOS Safari's canvas memory.
const CACHE_LIMIT=6;
const cache=new Map<string,Promise<HTMLCanvasElement>>();
const remember=(key:string,promise:Promise<HTMLCanvasElement>)=>{cache.delete(key);cache.set(key,promise);while(cache.size>CACHE_LIMIT)cache.delete(cache.keys().next().value!);};
// Perspective-correct display of original photographs. No generated artwork or altered source files.
// `height` is the output canvas height: size it to the display so small cards stay cheap to map.
export function loadArtwork(work:Artwork,src=work.src,height=1300):Promise<HTMLCanvasElement>{
 const key=`${work.id}|${src}|${height}`;const cached=cache.get(key);if(cached){remember(key,cached);return cached;}
 const promise=new Promise<HTMLCanvasElement>((resolve,reject)=>{
 const image=new Image();image.onload=()=>{
 const canvas=document.createElement('canvas');canvas.width=Math.round(height*work.ratio);canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx){reject(new Error('Canvas unavailable'));return;}
 const [tl,tr,br,bl]=work.corners;
 const source=(u:number,v:number)=>[(tl[0]*(1-u)*(1-v)+tr[0]*u*(1-v)+br[0]*u*v+bl[0]*(1-u)*v)*image.width,(tl[1]*(1-u)*(1-v)+tr[1]*u*(1-v)+br[1]*u*v+bl[1]*(1-u)*v)*image.height];
 const triangle=(uv:number[][])=>{const s=uv.map(([u,v])=>source(u,v));const d=uv.map(([u,v])=>[u*canvas.width,v*canvas.height]);const [a,b,c]=s;const [p,q,r]=d;const det=a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]);
 const ax=(p[0]*(b[1]-c[1])+q[0]*(c[1]-a[1])+r[0]*(a[1]-b[1]))/det;const bx=(p[0]*(c[0]-b[0])+q[0]*(a[0]-c[0])+r[0]*(b[0]-a[0]))/det;const cx=p[0]-ax*a[0]-bx*a[1];
 const ay=(p[1]*(b[1]-c[1])+q[1]*(c[1]-a[1])+r[1]*(a[1]-b[1]))/det;const by=(p[1]*(c[0]-b[0])+q[1]*(a[0]-c[0])+r[1]*(b[0]-a[0]))/det;const cy=p[1]-ay*a[0]-by*a[1];
 ctx.save();ctx.beginPath();const center=[(p[0]+q[0]+r[0])/3,(p[1]+q[1]+r[1])/3];const expand=(v:number[])=>{const dx=v[0]-center[0],dy=v[1]-center[1],len=Math.hypot(dx,dy);return [v[0]+dx/len*.65,v[1]+dy/len*.65]};const [P,Q,R]=[p,q,r].map(expand);ctx.moveTo(P[0],P[1]);ctx.lineTo(Q[0],Q[1]);ctx.lineTo(R[0],R[1]);ctx.closePath();ctx.clip();ctx.setTransform(ax,ay,bx,by,cx,cy);ctx.drawImage(image,0,0);ctx.restore();};
 const n=height>=800?16:10;let row=0;
 // Draw a row of the mesh per slice and yield in between, so mapping never blocks input for long.
 const step=()=>{const end=performance.now()+12;while(row<n&&performance.now()<end){const y=row++;for(let x=0;x<n;x++){const u=x/n,v=y/n,U=(x+1)/n,V=(y+1)/n;triangle([[u,v],[U,v],[U,V]]);triangle([[u,v],[U,V],[u,V]]);}}if(row<n)setTimeout(step,0);else resolve(canvas);};
 step();
 };image.onerror=()=>{cache.delete(key);reject(new Error('Artwork photograph could not load'));};image.src=src;});remember(key,promise);return promise;
}
