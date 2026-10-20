'use client';
/* eslint-disable @next/next/no-img-element -- Approved, unchanged JPEGs; native pixel caps are part of this composition. */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';
import { artworkAlt, artworkPath, artworkPrice, artworks, artworkSize, printPrice, PRINT_EDITION, type Artwork } from '../artworks';
import type { FloorRoom } from './open-floor-scene';
import './open-floor.css';

const at = (i: number) => (i + artworks.length) % artworks.length;
const imageStyle = (work: Artwork) => ({ '--nw': `${work.width}px`, '--nh': `${work.height}px`, '--r': work.height / work.width, aspectRatio: `${work.width} / ${work.height}` }) as CSSProperties;

export function OpenFloor() {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const room = useRef<FloorRoom | null>(null);
  const current = useRef(0);
  const busy = useRef(false);
  const alive = useRef(true);
  const [index, setIndex] = useState(0);
  const [spatial, setSpatial] = useState(false);
  const [failed, setFailed] = useState(false);
  const [kind, setKind] = useState('original');
  const [actual, setActual] = useState(false);
  const indexDialog = useRef<HTMLDialogElement>(null);
  const aboutDialog = useRef<HTMLDialogElement>(null);
  const detailDialog = useRef<HTMLDialogElement>(null);
  const work = artworks[index];

  const go = useCallback(async (next: number) => {
    next = at(next);
    if (busy.current || next === current.current || !image.current) return;
    const from = current.current;
    current.current = next;
    // The shifted lens must measure the NEXT label/image layout, not React's previous commit.
    flushSync(() => { setIndex(next); setFailed(false); });
    const img = image.current;
    const scene = room.current;
    if (scene && Math.abs(next - from) === 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches && scene.ready(from, next)) {
      busy.current = true;
      try {
        scene.lift();
        img.style.visibility = 'hidden';
        await scene.move(from, next, img.getBoundingClientRect());
        // A stalled image request must not leave the DOM painting hidden indefinitely.
        await Promise.race([img.decode().catch(() => {}), new Promise(resolve => setTimeout(resolve, 3000))]);
      } finally {
        img.style.visibility = '';
        if (alive.current) room.current?.place(next, img.getBoundingClientRect());
        busy.current = false;
      }
    } else {
      scene?.place(next, img.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    let gone = false;
    // An SSR image can fail before hydration installs onError; observe that request too.
    image.current?.decode().catch(() => { if (!gone) setFailed(true); });
    let frame = 0;
    let offscreen = false;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const flat = () => {
      room.current?.dispose();
      room.current = null;
      if (!gone) setSpatial(false);
      if (image.current) image.current.style.visibility = '';
    };
    const follow = () => {
      cancelAnimationFrame(frame);
      if (document.hidden || offscreen) return;
      frame = requestAnimationFrame(() => {
        if (!busy.current && image.current) room.current?.place(current.current, image.current.getBoundingClientRect());
      });
    };
    const suspend = () => { room.current?.suspend(document.hidden || offscreen); follow(); };
    const observer = new IntersectionObserver(entries => { offscreen = !entries[0].isIntersecting; suspend(); });
    observer.observe(host.current!);
    const key = (event: KeyboardEvent) => {
      if (document.querySelector('dialog[open]') || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof Element && event.target.closest('input, textarea, select')) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        void go(current.current + (event.key === 'ArrowRight' ? 1 : -1));
      }
    };
    // Reduced motion is the still stage: the room never loads while it is on.
    let starting = false;
    const start = () => {
      if (starting || room.current || reduced.matches || !('WebGL2RenderingContext' in window)) return;
      starting = true;
      import('./open-floor-scene').then(({ createRoom }) => {
        if (gone || reduced.matches) return;
        return createRoom(canvas.current!, artworks, { onLost: flat });
      }).then(scene => {
        if (!scene) return;
        if (gone || reduced.matches) { scene.dispose(); return; }
        room.current = scene;
        scene.place(current.current, image.current!.getBoundingClientRect());
        scene.suspend(document.hidden || offscreen);
        setSpatial(true);
      }).catch(() => flat()).finally(() => { starting = false; });
    };
    const boot = requestAnimationFrame(start);
    addEventListener('resize', follow);
    addEventListener('scroll', follow, { passive: true });
    document.addEventListener('keydown', key);
    document.addEventListener('visibilitychange', suspend);
    // Turning reduced motion on mid-visit drops the room for the still stage; turning it off brings the room back.
    const motionChange = () => { if (reduced.matches) flat(); else start(); };
    reduced.addEventListener('change', motionChange);
    document.fonts.ready.then(() => { if (!gone) follow(); });
    return () => {
      gone = true;
      alive.current = false;
      cancelAnimationFrame(boot);
      cancelAnimationFrame(frame);
      observer.disconnect();
      removeEventListener('resize', follow);
      removeEventListener('scroll', follow);
      document.removeEventListener('keydown', key);
      document.removeEventListener('visibilitychange', suspend);
      reduced.removeEventListener('change', motionChange);
      flat();
    };
  }, [go]);

  const openDetail = () => { setKind('original'); setActual(false); detailDialog.current?.showModal(); };
  const backdrop = (event: React.MouseEvent<HTMLDialogElement>) => { if (event.target === event.currentTarget) event.currentTarget.close(); };

  return <div ref={host} className={`open-floor${spatial ? ' spatial' : ''}`}>
    <canvas ref={canvas} className="room art" aria-hidden="true" />
    <header className="top">
      <h1>Harrison Ferraro</h1>
      <nav aria-label="Site">
        <button type="button" className="link" data-open="index" aria-haspopup="dialog" onClick={() => indexDialog.current?.showModal()}>Index</button>
        <button type="button" className="link" data-open="about" aria-haspopup="dialog" onClick={() => aboutDialog.current?.showModal()}>About</button>
      </nav>
    </header>
    <section className="stage" aria-label="Paintings, 2026">
      <div className="work">
        <figure className="hang">
          <button type="button" className="image-button" onClick={openDetail} aria-label={`Details and prints: ${work.title}`} aria-haspopup="dialog">
            <img ref={image} className={`art${work.width > work.height ? ' land' : ''}`} src={work.src} width={work.width} height={work.height} draggable={false} fetchPriority="high" decoding="async" style={imageStyle(work)} alt={artworkAlt(work)} onLoad={() => { setFailed(false); if (!busy.current && image.current) room.current?.place(current.current, image.current.getBoundingClientRect()); }} onError={() => setFailed(true)} />
          </button>
          {failed && <p className="image-failure" role="status">Painting image unavailable. <button type="button" className="link" onClick={() => { if (image.current) image.current.src = work.src; }}>Retry image</button></p>}
        </figure>
        <div className="label">
          <div className="said" aria-live="polite" aria-atomic="true">
            <p className="visually-hidden" data-pos>Painting {index + 1} of {artworks.length}</p>
            <h2 data-title>{work.title}</h2>
            <p className="price"><span className="kind">Original</span> <span data-original>{artworkPrice(work)}</span></p>
            <p className="price"><span className="kind">Signed print, edition of {PRINT_EDITION},</span> <span data-print>{printPrice(work)}</span></p>
          </div>
          <button type="button" className="link details" data-details aria-haspopup="dialog" onClick={openDetail}>Details and prints</button>
          <nav className="walk" aria-label="Walk the floor">
            {[-1, 1].map(step => <button key={step} type="button" className="step" data-step={step} onClick={() => void go(index + step)}><span className="dir">{step < 0 ? <><span aria-hidden="true">←</span> Previous</> : <>Next <span aria-hidden="true">→</span></>}</span><span className="to" data-to={step}>{artworks[at(index + step)].title}</span></button>)}
          </nav>
        </div>
      </div>
    </section>
    <dialog ref={indexDialog} id="index" className="panel" aria-labelledby="index-title" onClick={backdrop}>
      <div className="panel-in">
        <h2 id="index-title">Index</h2>
        <ul data-list>{artworks.map((item, i) => <li key={item.slug}><button type="button" data-i={i} aria-current={i === index ? 'true' : undefined} onClick={() => { indexDialog.current?.close(); void go(i); }}><span>{item.title}</span><span className="price">{artworkPrice(item)}</span></button></li>)}</ul>
        <Link className="link" href="/works">All works and artwork pages</Link>
        <button type="button" className="link" data-close onClick={() => indexDialog.current?.close()}>Close</button>
      </div>
    </dialog>
    <dialog ref={aboutDialog} id="about" className="panel" aria-labelledby="about-title" onClick={backdrop}>
      <div className="panel-in">
        <h2 id="about-title">Harrison Ferraro</h2>
        <p className="attribution">Painter, Melbourne, Australia</p>
        <p className="statement" data-statement>I paint people in the moments they don’t perform: an exhale, a turned shoulder, smoke hanging in the air. I work in acrylic, charcoal and pastel on canvas, building the surface up and tearing it back until what’s left feels honest. The palette stays dark, with <span className="red">red</span> used only where it hurts. Every piece is an original, made in Melbourne.</p>
        <Link className="link" href="/about">About Harrison</Link>
        <Link className="link" href="/privacy">Privacy</Link>
        <button type="button" className="link" data-close onClick={() => aboutDialog.current?.close()}>Close</button>
      </div>
    </dialog>
    <dialog ref={detailDialog} id="detail" className="sheet" aria-labelledby="detail-title" onClick={backdrop}>
      <div className="sheet-in">
        <div className={`sheet-art${actual ? ' actual' : ''}`} data-art tabIndex={actual ? 0 : -1}>
          <img className="art" src={work.src} width={work.width} height={work.height} draggable={false} decoding="async" style={imageStyle(work)} alt={artworkAlt(work)} />
        </div>
        <div className="sheet-info">
          <button type="button" className="link close" data-close onClick={() => detailDialog.current?.close()}>Close</button>
          <h2 id="detail-title" data-f="title">{work.title}</h2>
          <p className="facts"><span data-f="year">{work.year}</span><br /><span data-f="medium">{work.medium}</span><br /><span data-f="size">{artworkSize(work)}</span></p>
          <fieldset className="choice"><legend>Original or print</legend>
            <label><input type="radio" name="kind" value="original" checked={kind === 'original'} onChange={() => setKind('original')} /><span className="what">Original painting</span><span className="cost" data-f="original">{artworkPrice(work)}</span></label>
            <label><input type="radio" name="kind" value="print" checked={kind === 'print'} onChange={() => setKind('print')} /><span className="what">Signed print, edition of {PRINT_EDITION}</span><span className="cost" data-f="print">{printPrice(work)}</span></label>
          </fieldset>
          <p className="summary" data-summary aria-live="polite">{kind === 'original' ? `The original painting, ${artworkSize(work)}, ${work.medium.toLowerCase()}, ${work.year}. ${artworkPrice(work)}.` : `A signed print from a limited edition of ${PRINT_EDITION}, at a third of the original’s ${artworkPrice(work)}: ${printPrice(work)}. Print size, paper and framing are not confirmed yet.`}</p>
          <Link className="enquire" data-enquire href={`/contact?artwork=${work.slug}&kind=${kind}`}>Enquire about {kind === 'print' ? 'a print' : 'the original'} <span aria-hidden="true">→</span></Link>
          <p className="status" data-status role="status" />
          <button type="button" className="link" data-zoom aria-pressed={actual} onClick={() => setActual(!actual)}>{actual ? 'Fit to screen' : 'Actual pixels'}</button>
          <p className="note">Print prices are a third of the original, shown to the cent; final rounding is to be confirmed.</p>
        </div>
      </div>
    </dialog>
    <noscript><nav aria-label="Artwork pages">{artworks.map(item => <p key={item.slug}><Link href={artworkPath(item)}>{item.title}</Link> — Original {artworkPrice(item)}; signed print, edition of {PRINT_EDITION}, {printPrice(item)}</p>)}</nav></noscript>
  </div>;
}
