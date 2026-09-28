'use client';
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { Minus, Plus } from '@phosphor-icons/react';
import type { Artwork } from '../artworks';
import { ArtworkImage } from '../ArtworkImage';

const MAX_ZOOM = 3;
const STEP = 0.5;
const DOUBLE_CLICK_ZOOM = 2;

/**
 * Full-resolution artwork with zoom controls. Mouse: drag to pan, double-click to zoom in at the
 * pointer or back out. Trackpad pinch (ctrl + wheel) zooms the artwork, not the page. Touch pans
 * natively through the scrolling surface. Remount (`key`) per work.
 * `children` are extra buttons appended to the controls row. `onSwipe` (-1 | 1) fires on a
 * horizontal touch swipe while not zoomed.
 */
export function ZoomableArtwork({ work, sizes, children, onSwipe }: { work: Artwork; sizes: string; children?: React.ReactNode; onSwipe?: (direction: -1 | 1) => void }) {
  const surface = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  // Surface point (fractions of its visible box) that should stay put across the next zoom change.
  const anchor = useRef<{ x: number; y: number; from: number } | null>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  // Latest requested zoom: several wheel events can arrive before React renders the previous one.
  const requested = useRef(1);

  function zoomTo(next: number, x = 0.5, y = 0.5) {
    const clamped = Math.round(Math.min(MAX_ZOOM, Math.max(1, next)) * 100) / 100;
    if (clamped === requested.current) return;
    anchor.current = { x, y, from: anchor.current?.from ?? requested.current };
    requested.current = clamped;
    setZoom(clamped);
  }

  useLayoutEffect(() => {
    const el = surface.current;
    const a = anchor.current;
    anchor.current = null;
    if (!el || !a) return;
    const ratio = zoom / a.from;
    const px = el.clientWidth * a.x, py = el.clientHeight * a.y;
    el.scrollLeft = (el.scrollLeft + px) * ratio - px;
    el.scrollTop = (el.scrollTop + py) * ratio - py;
  }, [zoom]);

  const onWheel = useEffectEvent((event: WheelEvent) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    zoomTo(requested.current * Math.exp(-event.deltaY * 0.01), (event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  });
  useEffect(() => {
    const el = surface.current;
    if (!el) return;
    // React's onWheel is passive, so it cannot stop the browser's own page zoom.
    const listener = (event: WheelEvent) => onWheel(event);
    el.addEventListener('wheel', listener, { passive: false });
    return () => el.removeEventListener('wheel', listener);
  }, []);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || event.button !== 0 || zoom === 1) return;
    const el = event.currentTarget;
    drag.current = { x: event.clientX, y: event.clientY, left: el.scrollLeft, top: el.scrollTop };
    el.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    event.currentTarget.scrollLeft = d.left - (event.clientX - d.x);
    event.currentTarget.scrollTop = d.top - (event.clientY - d.y);
  }
  function endDrag() { drag.current = null; }
  function onTouchStart(event: React.TouchEvent) {
    swipe.current = zoom === 1 && event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }
  function onTouchEnd(event: React.TouchEvent) {
    const start = swipe.current;
    swipe.current = null;
    if (!start || !onSwipe) return;
    const dx = event.changedTouches[0].clientX - start.x, dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) onSwipe(dx < 0 ? 1 : -1);
  }
  function onDoubleClick(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    zoomTo(zoom > 1 ? 1 : DOUBLE_CLICK_ZOOM, (event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  }

  return <>
    <div ref={surface} className={`zoom-surface ${zoom > 1 ? 'is-zoomed' : ''}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} onDoubleClick={onDoubleClick} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="zoom-inner" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
        <ArtworkImage work={work} sizes={sizes} detail />
      </div>
    </div>
    <div className="zoom-controls">
      <button className="icon-button" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => zoomTo(zoom - STEP)}><Minus size={20} /></button>
      <span aria-live="polite" aria-label={`Zoom level ${Math.round(zoom * 100)} percent`}>{Math.round(zoom * 100)}%</span>
      <button className="icon-button" aria-label="Zoom in" disabled={zoom >= MAX_ZOOM} onClick={() => zoomTo(zoom + STEP)}><Plus size={20} /></button>
      {children}
    </div>
  </>;
}
