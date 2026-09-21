'use client';
import {useEffect,useRef} from 'react';
import * as THREE from 'three';
import {featuredArtworks as artworks,loadArtwork} from './artworks';
type Point=[number,number];
const original:Point[][]=[[[204,75],[666,126],[666,713],[204,750]],[[739,143],[1114,203],[1114,684],[739,712]],[[1194,237],[1340,261],[1340,680],[1194,689]]];
export default function GalleryScene({focus,onOpen,onReady,onError}:{focus:number|null;onOpen:(i:number)=>void;onReady:()=>void;onError:()=>void}){
 const root=useRef<HTMLDivElement>(null);const focusRef=useRef(focus);const updateRef=useRef<(()=>void)|null>(null);const openRef=useRef(onOpen);openRef.current=onOpen;
 useEffect(()=>{focusRef.current=focus;updateRef.current?.()},[focus]);
 useEffect(()=>{
 const host=root.current!;let disposed=false,frame=0;const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const canvas=document.createElement('canvas');const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});if(!context){onError();return;}
 let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({canvas,context,alpha:true,antialias:true,powerPreference:'low-power'});}catch{onError();return;}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x000000,0);host.appendChild(renderer.domElement);
 const scene=new THREE.Scene();const camera=new THREE.OrthographicCamera(0,1,1,0,.1,2000);camera.position.z=1000;
 const objects:THREE.Mesh[]=[];const sides:THREE.Mesh[]=[];let current:Point[][]=[],targets:Point[][]=[],width=1,height=1;let hover=-1;
 function geometry(points:Point[],side=false){const geo=new THREE.PlaneGeometry(1,1,20,20);writeGeometry(geo,points,side);return geo;}
 function writeGeometry(geo:THREE.PlaneGeometry,points:Point[],side=false){const p=geo.attributes.position;const uv=geo.attributes.uv;const [a,b,c,d]=points;for(let i=0;i<p.count;i++){const u=uv.getX(i),v=1-uv.getY(i);const x=a[0]*(1-u)*(1-v)+b[0]*u*(1-v)+c[0]*u*v+d[0]*(1-u)*v;const y=a[1]*(1-u)*(1-v)+b[1]*u*(1-v)+c[1]*u*v+d[1]*(1-u)*v;p.setXYZ(i,x-(side?6:0),height-y,side?-2:0);}p.needsUpdate=true;geo.computeBoundingSphere();}
 function layout(){width=host.clientWidth;height=host.clientHeight;renderer.setSize(width,height);camera.right=width;camera.top=height;camera.updateProjectionMatrix();const scale=Math.min(width/1487,height/1058);const ox=(width-1487*scale)/2,oy=(height-1058*scale)/2;const mobile=width<700;
 targets=original.map((corners,i)=>{if(mobile||focusRef.current!==null){const selected=focusRef.current??0;const h=Math.min(height*.64,width/(artworks[i].ratio)*.88),w=h*artworks[i].ratio;const left=width/2-w/2+(i-selected)*width*.98,top=height*.45-h/2;return [[left,top],[left+w,top+w*.035],[left+w,top+h-w*.025],[left,top+h]] as Point[];}return corners.map(([x,y])=>[x*scale+ox,y*scale+oy] as Point)});
 if(!current.length)current=targets.map(p=>p.map(v=>[...v]));kick();}
 function draw(){if(disposed)return;let moving=false;current=current.map((p,i)=>p.map(([x,y],j)=>{const target=targets[i][j];const ty=target[1]-(i===hover?4:0);const dx=target[0]-x,dy=ty-y;if(Math.abs(dx)+Math.abs(dy)>.1)moving=true;return [x+dx*(reduce?1:.16),y+dy*(reduce?1:.16)] as Point}));objects.forEach((mesh,i)=>{writeGeometry(mesh.geometry as THREE.PlaneGeometry,current[i]);writeGeometry(sides[i].geometry as THREE.PlaneGeometry,current[i],true)});renderer.render(scene,camera);frame=moving?requestAnimationFrame(draw):0;}
 function kick(){if(!frame&&!disposed)frame=requestAnimationFrame(draw);}updateRef.current=layout;
 const resize=new ResizeObserver(layout);resize.observe(host);
 Promise.all(artworks.map(loadArtwork)).then(canvases=>{if(disposed)return;layout();canvases.forEach((canvas,i)=>{const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);const mesh=new THREE.Mesh(geometry(current[i]),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));mesh.userData.index=i;objects.push(mesh);scene.add(mesh);const side=new THREE.Mesh(geometry(current[i],true),new THREE.MeshBasicMaterial({color:0x8b8070,side:THREE.DoubleSide}));sides.push(side);scene.add(side);});kick();onReady();}).catch(()=>{if(!disposed)onError()});
 const ray=new THREE.Raycaster();const pointer=new THREE.Vector2();let downX=0;
 function hit(e:PointerEvent){const rect=host.getBoundingClientRect();pointer.set((e.clientX-rect.left)/width*2-1,-(e.clientY-rect.top)/height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(objects)[0]?.object.userData.index??-1;}
 function move(e:PointerEvent){const next=hit(e);if(next!==hover){hover=next;renderer.domElement.style.cursor=hover>=0?'pointer':'default';kick()}}
 function down(e:PointerEvent){downX=e.clientX;}function up(e:PointerEvent){const idx=hit(e);if(Math.abs(e.clientX-downX)<12&&idx>=0)openRef.current(idx)}function leave(){hover=-1;kick()}
 host.addEventListener('pointermove',move);host.addEventListener('pointerdown',down);host.addEventListener('pointerup',up);host.addEventListener('pointerleave',leave);
 const lost=(e:Event)=>{e.preventDefault();onError()};renderer.domElement.addEventListener('webglcontextlost',lost);
 return()=>{disposed=true;cancelAnimationFrame(frame);resize.disconnect();updateRef.current=null;host.removeEventListener('pointermove',move);host.removeEventListener('pointerdown',down);host.removeEventListener('pointerup',up);host.removeEventListener('pointerleave',leave);renderer.domElement.removeEventListener('webglcontextlost',lost);[...objects,...sides].forEach(m=>{m.geometry.dispose();const mat=m.material as THREE.MeshBasicMaterial;mat.map?.dispose();mat.dispose()});renderer.dispose();renderer.domElement.remove()};
 // Parent callbacks are stable and initialisation should run only once.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 return <div className="three-stage" ref={root} aria-hidden="true"/>;
}
