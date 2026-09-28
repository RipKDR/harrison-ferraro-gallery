'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,X,ArrowUpRight,CornersOut,Plus} from '@phosphor-icons/react';
import {artworkFactRows,artworkPath,artworks,artworkTitle,artworkUnconfirmed,featuredArtworks} from './artworks';
import {InstagramLink} from './components/InstagramLink';
import {EnquiryForm} from './components/EnquiryForm';
import {TrackArtworkView} from './components/TrackArtworkView';
import {SiteFooter} from './components/SiteFooter';
import {ZoomableArtwork} from './components/ZoomableArtwork';
import {ShareArtwork} from './components/ShareArtwork';
import {CompactHeader} from './components/CompactHeader';
import type {Interest} from './lib/forms';
import {ArtworkImage} from './ArtworkImage';
import GalleryFallback from './GalleryFallback';
const GalleryScene=dynamic(()=>import('./GalleryScene'),{ssr:false});
type Panel='enquire'|'work'|null;
export default function Home({emailEnabled}:{emailEnabled:boolean}){
 const [focus,setFocus]=useState<number|null>(null);const [ready,setReady]=useState(false);const [failed,setFailed]=useState(false);const [panel,setPanel]=useState<Panel>(null);const [selected,setSelected]=useState(0);const [full,setFull]=useState(false);const [preview,setPreview]=useState(false);const [referencePreview,setReferencePreview]=useState(false);const dialog=useRef<HTMLDialogElement>(null);const gallery=useRef<HTMLElement>(null);const touch=useRef<{x:number;y:number}|null>(null);const opener=useRef<HTMLElement|null>(null);
 const [interest,setInterest]=useState<Interest>('Original artwork');
 // The CSS gallery paints first; WebGL boots once the page is idle (desktop/tablet only).
 const [sceneOn,setSceneOn]=useState(false);
 useEffect(()=>{
  // Phones get the equivalent CSS gallery (same single-card layout) without the 0.5 MB WebGL bundle.
  if(window.matchMedia('(max-width: 699px)').matches||(navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData)return;
  let idle=0,timer=0;
  const start=()=>{if(typeof window.requestIdleCallback==='function')idle=window.requestIdleCallback(()=>setSceneOn(true),{timeout:3000});else timer=window.setTimeout(()=>setSceneOn(true),500)};
  if(document.readyState==='complete')timer=window.setTimeout(start,300);else window.addEventListener('load',start,{once:true});
  return()=>{window.removeEventListener('load',start);window.clearTimeout(timer);if(idle)window.cancelIdleCallback(idle)};
 },[]);
 const work=artworks[selected];
 function browse(){document.getElementById('collection')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
 function enquire(kind:Interest,index=selected){setInterest(kind);open('enquire',index)}
 const close=useCallback(()=>{setPanel(null);setFull(false);if(window.location.hash.startsWith('#work-'))history.replaceState(null,'',window.location.pathname+window.location.search);},[]);
 const open=useCallback((type:Panel,index?:number)=>{if(!dialog.current?.open)opener.current=document.activeElement as HTMLElement;if(index!==undefined)setSelected(index);setPanel(type);setFull(false);if(type==='work'&&index!==undefined)history.replaceState(null,'','#'+artworks[index].id);},[]);
 const onOpen=(i:number)=>open('work',i);const onReady=useCallback(()=>setReady(true),[]);const onError=useCallback(()=>{setFailed(true);setReady(true)},[]);
 // Hash and preview params exist only in the browser, so they are read once after hydration.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{const id=window.location.hash.slice(1);const i=artworks.findIndex(a=>a.id===id);if(i>=0){setSelected(i);setPanel('work')}else if(id==='about')window.location.replace('/about');setPreview(new URLSearchParams(window.location.search).get('preview')==='mobile');setReferencePreview(new URLSearchParams(window.location.search).get('preview')==='reference');},[]);
 useEffect(()=>{if(panel){dialog.current?.showModal();document.body.style.overflow='hidden'}else{dialog.current?.close();document.body.style.overflow='';opener.current?.focus()}return()=>{document.body.style.overflow=''}},[panel]);
 useEffect(()=>{if(panel){dialog.current?.scrollTo(0,0);requestAnimationFrame(()=>dialog.current?.querySelector<HTMLElement>('#panel-title')?.focus())}},[panel]);
 function navigate(delta:number){setFocus(previous=>previous===null?(delta>0?(gallery.current!.clientWidth<700?1:0):2):(previous+delta+featuredArtworks.length)%featuredArtworks.length)}
 const step=useCallback((delta:number)=>{const i=(selected+delta+artworks.length)%artworks.length;setSelected(i);history.replaceState(null,'','#'+artworks[i].id)},[selected]);
 useEffect(()=>{function key(e:KeyboardEvent){if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||(e.target as HTMLElement).closest('input,textarea,select,[contenteditable]'))return;if(panel==='work'&&(e.key==='ArrowLeft'||e.key==='ArrowRight')&&!dialog.current?.querySelector('.is-zoomed')){e.preventDefault();step(e.key==='ArrowLeft'?-1:1);return}if(panel||!gallery.current||gallery.current.getBoundingClientRect().bottom<window.innerHeight*.5)return;if(e.key==='ArrowRight'){e.preventDefault();navigate(1)}if(e.key==='ArrowLeft'){e.preventDefault();navigate(-1)}if(e.key==='Escape')setFocus(null)}window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[panel,step]);
 return <div className={`site ${preview?'mobile-preview':''} ${referencePreview?'reference-preview':''}`}>
 <a className="skip-link" href="#collection">Skip to the collection</a>
 <header className="masthead">
  <h1 className="wordmark-heading"><button className="wordmark" onClick={()=>{setFocus(null);close();window.scrollTo({top:0})}}>HARRISON<br/>FERRARO</button><span className="visually-hidden"> — Figurative and abstract painter, Melbourne</span></h1>
  <nav aria-label="Main navigation"><button onClick={browse}>Works</button><Link href="/about">About</Link><button className="nav-enquire" onClick={()=>enquire('General enquiry')}>Enquire <ArrowUpRight size={16}/></button></nav>
 </header>
 <CompactHeader><button className="compact-wordmark" onClick={()=>window.scrollTo({top:0})}>HARRISON FERRARO</button><nav aria-label="Quick navigation"><button onClick={browse}>Works</button><Link href="/about">About</Link><button onClick={()=>enquire('General enquiry')}>Enquire</button></nav></CompactHeader>
 <main id="main">
 <section ref={gallery} className="gallery" aria-label="Selected works spatial gallery" onTouchStart={e=>{touch.current=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null}} onTouchEnd={e=>{const start=touch.current;touch.current=null;if(!start)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)navigate(dx<0?1:-1)}}>
  <div className="gallery-backdrop"/><div className="floor-word" aria-hidden="true">FERRARO</div>
  <p className="gallery-intro">Figurative &amp; abstract painting<span>Melbourne, Australia</span></p>
  {(!ready||failed)&&<GalleryFallback focus={focus} onOpen={onOpen}/>}
  {sceneOn&&!failed&&<GalleryScene focus={focus} onOpen={onOpen} onReady={onReady} onError={onError}/>}
  {sceneOn&&!ready&&<div className="scene-loading" role="status">Opening the gallery<span/></div>}
  {focus!==null&&<button className="overview" onClick={()=>setFocus(null)}><ArrowLeft size={17}/> Gallery overview</button>}
  <div className="gallery-controls">
   <div className="progress"><span className="gallery-position">{String((focus??0)+1).padStart(2,'0')} / 03</span><div className="progress-track">{featuredArtworks.map((a,i)=><button key={a.id} aria-label={`Focus work ${a.number}: ${artworkTitle(a)}`} aria-pressed={(focus??0)===i} className={(focus??0)===i?'current':''} onClick={()=>setFocus(i)}><span/></button>)}</div></div>
   <div className="explore"><button className="icon-button" aria-label="Previous artwork" onClick={()=>navigate(-1)}><ArrowLeft size={24} weight="light"/></button><button className="explore-label" onClick={()=>open('work',focus??0)}><span className="gallery-current-title">{artworkTitle(featuredArtworks[focus??0])}</span><span className="gallery-action">View painting <ArrowUpRight size={14}/></span></button><button className="icon-button" aria-label="Next artwork" onClick={()=>navigate(1)}><ArrowRight size={24} weight="light"/></button></div>
   <button className="index-link" onClick={browse}>All {artworks.length} paintings <ArrowUpRight size={16}/></button>
  </div>
  <button className="collection-cue" onClick={browse}>Scroll to discover <span aria-hidden="true">↓</span></button>
 </section>
 <section className="collection-section home-collection" id="collection" aria-labelledby="collection-title">
  <div className="section-heading"><div><span className="eyebrow">01 / The collection</span><h2 id="collection-title">Selected<br/><em>paintings.</em></h2></div><div className="section-intro"><span className="collection-count">{String(artworks.length).padStart(2,'0')} original works</span><p>Faces, gestures, and the spaces between them.</p></div></div>
  <div className="collection-grid">{artworks.map((a,i)=><article className={`collection-item ${i<3?'featured-item':''}`} key={a.id}>
   <div className="collection-art"><Link className="collection-image" href={artworkPath(a)} aria-label={`View artwork: ${artworkTitle(a)}`}><ArtworkImage work={a} sizes={i===0?'(max-width: 700px) 90vw, 33vw':'(max-width: 700px) 45vw, 33vw'}/><span className="view-art">Explore painting <ArrowUpRight size={20}/></span></Link><button className="quick-view icon-button" aria-label={`Quick view: ${artworkTitle(a)}`} onClick={()=>open('work',i)}><Plus size={20} weight="light"/></button></div>
   <div className="collection-caption"><h3><Link href={artworkPath(a)}>{artworkTitle(a)}</Link></h3></div>
   <button className="collection-enquire" aria-label={`Enquire about the original: ${artworkTitle(a)}`} onClick={()=>enquire('Original artwork',i)}><span>Enquire<span className="enquire-extra"> about this work</span></span><ArrowUpRight size={18}/></button>
  </article>)}</div>
  <p className="catalogue-note">Descriptive working titles. For dimensions, materials, price and availability, please enquire directly.</p>
 </section>
 <section className="artist-section" aria-labelledby="artist-title">
  <div className="artist-art"><ArtworkImage work={artworks.find(a=>a.id==='work-08')!} sizes="(max-width: 700px) 100vw, 50vw"/><span className="artist-art-caption">A closer look / Portrait with a rose</span></div>
  <div className="artist-copy"><span className="eyebrow">02 / The artist</span><h2 id="artist-title">Between<br/>figure <em>&amp; feeling.</em></h2><p className="artist-lead">A face is only the beginning.</p><p>Harrison Ferraro’s paintings move between the recognisable and the unresolved. Figures emerge through layered surfaces, shifting light and expressive marks.</p><div className="artist-links"><Link className="line-action" href="/about">Meet the artist <ArrowUpRight size={22}/></Link><InstagramLink className="contact-link" placement="home">Inside the studio on Instagram <ArrowUpRight size={18}/></InstagramLink></div></div>
 </section>
 <section className="collecting-section" aria-labelledby="collecting-title">
  <div className="collecting-intro"><span className="eyebrow">03 / Collecting</span><h2 id="collecting-title">Buying an<br/><em>original.</em></h2><p>Ask about any painting: its size, materials, price, or delivery to where you live.</p><button className="solid-action" onClick={()=>enquire('General enquiry')}>Talk to Harrison <ArrowUpRight size={18}/></button></div>
  <div className="collecting-questions"><details><summary><span>01</span> A painting caught your eye</summary><p>Open the work and send an enquiry. Harrison can confirm its title, dimensions, materials, price and availability, and answer questions about the painting.</p></details><details><summary><span>02</span> Bringing it home</summary><p>Include your country and postcode for packing and delivery options. Shipping is quoted individually and confirmed before any purchase is arranged.</p></details><details><summary><span>03</span> Seeing the details</summary><p>Each artwork has a full-screen view with zoom controls. For additional photographs or a closer conversation about a painting, get in touch directly.</p></details></div>
 </section>
 </main>
 <SiteFooter emailEnabled={emailEnabled}/>
 <dialog ref={dialog} onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===e.currentTarget)close()}} className={`panel ${panel==='work'?'work-panel':''} ${full?'full-view':''}`} aria-labelledby="panel-title"><button className="close-button icon-button" aria-label="Close panel" onClick={close}><X size={26} weight="light"/></button>
 {panel==='work'&&<TrackArtworkView slug={work.slug} source="modal"/>}{panel==='work'&&<div className="work-layout"><div className="work-photo-area"><ZoomableArtwork key={work.id} work={work} sizes="(max-width: 700px) 100vw, 60vw" onSwipe={step}><button className="icon-button" aria-label={full?'Exit full view':'Full view'} onClick={()=>setFull(v=>!v)}><CornersOut size={20}/></button></ZoomableArtwork></div><div className="work-info"><span className="eyebrow">Selected work / {work.number}</span><h1 id="panel-title" tabIndex={-1}>{artworkTitle(work)}</h1><p>{work.description}</p><dl><div><dt>Artist</dt><dd>Harrison Ferraro</dd></div>{artworkFactRows(work).map(([term,value])=><div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}{!work.facts.availability&&!work.facts.price&&<div><dt>Acquisition</dt><dd>Enquire for details</dd></div>}</dl>{artworkUnconfirmed(work)&&<p className="small-note">{work.facts.title?'':'Descriptive working title. '}Please enquire for the confirmed details, price and availability.</p>}<button className="solid-action" onClick={()=>enquire('Original artwork')}>Enquire about the original <ArrowRight size={22}/></button><Link className="subtle-action" href={artworkPath(work)}>Open the artwork page <ArrowUpRight size={17}/></Link><ShareArtwork key={`share-${work.id}`} work={work}/><div className="work-pagination"><button onClick={()=>step(-1)}><ArrowLeft size={18}/> Previous</button><button onClick={()=>step(1)}>Next <ArrowRight size={18}/></button></div></div></div>}
 {panel==='enquire'&&<div className="enquiry-content"><span className="eyebrow">A conversation about art</span><h1 id="panel-title" tabIndex={-1}>Enquire</h1><div className="direct-contact"><InstagramLink placement="enquiry">Instagram <ArrowUpRight size={16}/></InstagramLink></div><p className="enquiry-notice">{emailEnabled?'Send your enquiry below and Harrison will reply to you by email.':'Write your enquiry below and it opens, ready to send, in your email app.'}</p><EnquiryForm key={`${interest}-${work.id}`} interest={interest} artworkId={work.id} emailEnabled={emailEnabled}/></div>}
 </dialog>
 </div>
}
