'use client';
import {useEffect,useRef,useState} from 'react';
import {Artwork,loadArtwork} from './artworks';
export function ArtworkImage({work,className=''}:{work:Artwork;className?:string}){
 const ref=useRef<HTMLCanvasElement>(null);const [error,setError]=useState(false);
 useEffect(()=>{
  let live=true;setError(false);
  const render=()=>loadArtwork(work).then(source=>{if(!live||!ref.current)return;ref.current.width=source.width;ref.current.height=source.height;ref.current.getContext('2d')?.drawImage(source,0,0);}).catch(()=>{if(live)setError(true)});
  // Defer catalogue photographs until near the viewport; repeated views share one decoded crop.
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();void render()}},{rootMargin:'500px'});
  if(ref.current)observer.observe(ref.current);
  return()=>{live=false;observer.disconnect()};
 },[work]);
 return error?<img className={className} src={work.src} alt={work.description} loading="lazy"/>:<canvas ref={ref} className={className} role="img" aria-label={work.description} style={{aspectRatio:work.ratio}}/>;
}
