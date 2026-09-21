export type Artwork={id:string;number:string;label:string;description:string;src:string;ratio:number;corners:[number,number][]};
// Working descriptive labels: replace with artist-confirmed catalogue data before publishing.
export const artworks:Artwork[]=[
{id:'work-01',number:'01',label:'Figure in red',description:'A pale figure beneath a vivid red form, against a dark ground.',src:'/art/red-smoke.png',ratio:.81,corners:[[.095,.143],[.909,.142],[.909,.805],[.117,.808]]},
{id:'work-02',number:'02',label:'Figure in motion',description:'A figurative portrait with sweeping dark marks and warm, earthy colour.',src:'/art/portrait.jpeg',ratio:.79,corners:[[.077,.079],[.895,.083],[.827,.829],[.128,.831]]},
{id:'work-03',number:'03',label:'Abstract in pale violet',description:'A long abstract canvas with white, violet and scattered colour.',src:'/art/abstract.jpeg',ratio:.43,corners:[[.288,.095],[.738,.129],[.733,.885],[.307,.906]]},
{"id": "work-04", "number": "04", "label": "Portrait in crimson", "description": "A dark-haired figure turns towards the viewer, surrounded by layered crimson and black.", "src": "/art/portrait-in-crimson.jpeg", "ratio": 0.7, "corners": [[0.033, 0.066], [0.883, 0.057], [0.835, 0.94], [0.1, 0.946]]},
{"id": "work-05", "number": "05", "label": "Portrait with an ember", "description": "A portrait in charcoal tones, with a warm ember and a fine trail of smoke.", "src": "/art/portrait-with-ember.jpg", "ratio": 0.77, "corners": [[0.074, 0.155], [0.959, 0.119], [0.945, 0.97], [0.133, 0.971]]},
{"id": "work-06", "number": "06", "label": "Portrait in light", "description": "A smiling figure emerges from sweeping dark marks and a pale, textured ground.", "src": "/art/portrait-in-light.jpg", "ratio": 0.79, "corners": [[0.005, 0.102], [0.995, 0.098], [0.894, 0.94], [0.11, 0.915]]},
{"id": "work-07", "number": "07", "label": "Figure in grey", "description": "A dark, turned figure against layered silver-grey marks and a weathered surface.", "src": "/art/figure-in-grey.jpg", "ratio": 0.67, "corners": [[0.125, 0.117], [0.847, 0.121], [0.851, 0.946], [0.103, 0.94]]},
{"id": "work-08", "number": "08", "label": "Portrait with a rose", "description": "A figure holding a dark rose, surrounded by ochre, charcoal and broken white marks.", "src": "/art/portrait-with-rose.jpg", "ratio": 0.65, "corners": [[0.025, 0.025], [0.946, 0.014], [0.989, 0.98], [0.036, 0.986]]},
{"id": "work-09", "number": "09", "label": "White on charcoal", "description": "Sweeping white gestures and fine scattered marks cross a deep charcoal ground.", "src": "/art/white-on-charcoal.jpg", "ratio": 0.72, "corners": [[0, 0.005], [0.999, 0.014], [0.999, 0.999], [0, 0.999]]},
{"id": "work-10", "number": "10", "label": "Over the shoulder", "description": "A figure looks back through softly layered grey, black and warm neutral tones.", "src": "/art/over-the-shoulder.jpg", "ratio": 0.75, "corners": [[0.034, 0.022], [0.976, 0.022], [0.968, 0.972], [0.043, 0.975]]},
{"id": "work-11", "number": "11", "label": "Figure in rose", "description": "A seated figure in dark fabric, set against a rose-coloured ground with deep red and pale marks.", "src": "/art/figure-in-rose.jpg", "ratio": 0.667, "corners": [[0.039, 0.097], [0.966, 0.094], [0.919, 0.839], [0.096, 0.84]]},
{"id": "work-12", "number": "12", "label": "Figure with a skull", "description": "A figure holds a skull close, against layers of charcoal, white and pale pink.", "src": "/art/figure-with-skull.jpg", "ratio": 0.75, "corners": [[0.002, 0.004], [0.999, 0.002], [0.999, 0.998], [0.037, 0.998]]},
];
export const featuredArtworks=artworks.slice(0,3);
const cache=new Map<string,Promise<HTMLCanvasElement>>();
// Perspective-correct display of original photographs. No generated artwork or altered source files.
export function loadArtwork(work:Artwork):Promise<HTMLCanvasElement>{
 const cached=cache.get(work.id);if(cached)return cached;
 const promise=new Promise<HTMLCanvasElement>((resolve,reject)=>{
 const image=new Image();image.onload=()=>{
 const canvas=document.createElement('canvas');canvas.width=Math.round(1300*work.ratio);canvas.height=1300;const ctx=canvas.getContext('2d');if(!ctx){reject(new Error('Canvas unavailable'));return;}
 const [tl,tr,br,bl]=work.corners;
 const source=(u:number,v:number)=>[(tl[0]*(1-u)*(1-v)+tr[0]*u*(1-v)+br[0]*u*v+bl[0]*(1-u)*v)*image.width,(tl[1]*(1-u)*(1-v)+tr[1]*u*(1-v)+br[1]*u*v+bl[1]*(1-u)*v)*image.height];
 const triangle=(uv:number[][])=>{const s=uv.map(([u,v])=>source(u,v));const d=uv.map(([u,v])=>[u*canvas.width,v*canvas.height]);const [a,b,c]=s;const [p,q,r]=d;const det=a[0]*(b[1]-c[1])+b[0]*(c[1]-a[1])+c[0]*(a[1]-b[1]);
 const ax=(p[0]*(b[1]-c[1])+q[0]*(c[1]-a[1])+r[0]*(a[1]-b[1]))/det;const bx=(p[0]*(c[0]-b[0])+q[0]*(a[0]-c[0])+r[0]*(b[0]-a[0]))/det;const cx=p[0]-ax*a[0]-bx*a[1];
 const ay=(p[1]*(b[1]-c[1])+q[1]*(c[1]-a[1])+r[1]*(a[1]-b[1]))/det;const by=(p[1]*(c[0]-b[0])+q[1]*(a[0]-c[0])+r[1]*(b[0]-a[0]))/det;const cy=p[1]-ay*a[0]-by*a[1];
 ctx.save();ctx.beginPath();const center=[(p[0]+q[0]+r[0])/3,(p[1]+q[1]+r[1])/3];const expand=(v:number[])=>{const dx=v[0]-center[0],dy=v[1]-center[1],len=Math.hypot(dx,dy);return [v[0]+dx/len*.65,v[1]+dy/len*.65]};const [P,Q,R]=[p,q,r].map(expand);ctx.moveTo(P[0],P[1]);ctx.lineTo(Q[0],Q[1]);ctx.lineTo(R[0],R[1]);ctx.closePath();ctx.clip();ctx.setTransform(ax,ay,bx,by,cx,cy);ctx.drawImage(image,0,0);ctx.restore();};
 const n=16;for(let y=0;y<n;y++)for(let x=0;x<n;x++){const u=x/n,v=y/n,U=(x+1)/n,V=(y+1)/n;triangle([[u,v],[U,v],[U,V]]);triangle([[u,v],[U,V],[u,V]]);}resolve(canvas);
 };image.onerror=()=>{cache.delete(work.id);reject(new Error('Artwork photograph could not load'));};image.src=work.src;});cache.set(work.id,promise);return promise;
}
