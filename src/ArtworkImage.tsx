'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import {Artwork,artworkAlt,artworkCrop,loadArtwork} from './artworks';

const DEFAULT_SIZES='(max-width: 700px) 100vw, 40vw';

// Server-rendered <img> (crawlable, descriptive alt) cropped to the canvas bounding box.
// Once visible, the same optimised file is perspective-mapped onto a canvas layered on top.
export function ArtworkImage({work,className='',sizes=DEFAULT_SIZES,preload=false}:{work:Artwork;className?:string;sizes?:string;preload?:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null);const photo=useRef<HTMLImageElement>(null);const [mapped,setMapped]=useState<string|null>(null);
 const crop=artworkCrop(work);
 const map=useCallback((src:string)=>{
  loadArtwork(work,src||work.src).then(source=>{const el=canvas.current;if(!el)return;el.width=source.width;el.height=source.height;el.getContext('2d')?.drawImage(source,0,0);setMapped(work.id)}).catch(()=>{/* the cropped photograph stays visible */});
 },[work]);
 useEffect(()=>{
  const el=photo.current;if(!el)return;
  // Images that finished loading before hydration never fire onLoad.
  if(el.complete&&el.naturalWidth)map(el.currentSrc);
 },[map]);
 return <span className={`artwork-image ${className}`} style={{'--ratio':work.ratio} as React.CSSProperties}><span className="artwork-frame">
  <Image ref={photo} className="artwork-photo" src={work.src} alt={artworkAlt(work)} width={work.width} height={work.height} sizes={sizes} preload={preload} loading={preload?undefined:'lazy'} onLoad={e=>map(e.currentTarget.currentSrc)}
   style={{left:`${-crop.left/crop.width*100}%`,top:`${-crop.top/crop.height*100}%`,width:`${100/crop.width}%`,height:`${100/crop.height}%`}}/>
  <canvas ref={canvas} className={`artwork-canvas ${mapped===work.id?'ready':''}`} aria-hidden="true"/>
 </span></span>;
}
