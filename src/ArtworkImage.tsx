'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import Image,{getImageProps} from 'next/image';
import {Artwork,artworkAlt,artworkCrop,loadArtwork} from './artworks';

const DEFAULT_SIZES='(max-width: 700px) 100vw, 40vw';
// Full-resolution source for the zoom views, through the image optimiser where it runs (Vercel):
// the 2x candidate of a half-size request is the photo at its own pixel size, re-encoded (e.g. WebP)
// instead of the original upload (one source photo is a 5.6 MB PNG). Elsewhere this is work.src.
const detailSource=(work:Artwork)=>getImageProps({src:work.src,width:Math.ceil(work.width/2),height:Math.ceil(work.height/2),alt:''}).props.src;

// Server-rendered <img> (crawlable, descriptive alt) cropped to the canvas bounding box.
// Once visible, the same optimised file is perspective-mapped onto a canvas layered on top.
/** `detail`: for the zoomable viewer — map the full-resolution photo at up to 2000 px so zooming stays sharp. */
export function ArtworkImage({work,className='',sizes=DEFAULT_SIZES,preload=false,detail=false}:{work:Artwork;className?:string;sizes?:string;preload?:boolean;detail?:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null);const photo=useRef<HTMLImageElement>(null);const [mapped,setMapped]=useState<string|null>(null);const watcher=useRef<IntersectionObserver|null>(null);
 const crop=artworkCrop(work);
 const map=useCallback((src:string)=>{
  // Mapping is CPU-heavy: wait for an idle moment and render only as many pixels as are displayed.
  const run=()=>{
   const el=canvas.current;if(!el)return;
   const displayed=el.parentElement?.clientHeight||600;
   const height=detail?Math.min(2000,work.height):Math.min(1300,Math.max(300,Math.ceil(displayed*Math.min(window.devicePixelRatio||1,2)/100)*100));
   loadArtwork(work,detail?detailSource(work):src||work.src,height).then(source=>{const target=canvas.current;if(!target)return;target.width=source.width;target.height=source.height;target.getContext('2d')?.drawImage(source,0,0);setMapped(work.id)}).catch(()=>{/* the cropped photograph stays visible */});
  };
  const schedule=()=>{if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(run,{timeout:2500});else window.setTimeout(run,200);};
  // Lazy images load well outside the viewport; only map once the artwork is actually on screen.
  const el=canvas.current?.parentElement;
  if(!el||typeof IntersectionObserver==='undefined'){schedule();return;}
  watcher.current?.disconnect();
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();schedule();}},{rootMargin:'100px'});
  watcher.current=observer;observer.observe(el);
 },[work,detail]);
 useEffect(()=>{
  const el=photo.current;if(!el)return;
  // Images that finished loading before hydration never fire onLoad.
  if(el.complete&&el.naturalWidth)map(el.currentSrc);
 },[map]);
 useEffect(()=>()=>watcher.current?.disconnect(),[]);
 return <span className={`artwork-image ${className}`} style={{'--ratio':work.ratio} as React.CSSProperties}><span className="artwork-frame">
  <Image ref={photo} className="artwork-photo" src={work.src} alt={artworkAlt(work)} width={work.width} height={work.height} sizes={sizes} preload={preload} loading={preload?undefined:'lazy'} onLoad={e=>map(e.currentTarget.currentSrc)}
   style={{left:`${-crop.left/crop.width*100}%`,top:`${-crop.top/crop.width*(work.height/work.width)*work.ratio*100}%`,width:`${100/crop.width}%`,height:'auto'}}/>
  <canvas ref={canvas} className={`artwork-canvas ${mapped===work.id?'ready':''}`} aria-hidden="true"/>
 </span></span>;
}
