'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import { Minus, Plus } from '@phosphor-icons/react';
import type { Artwork } from '../artworks';
import { ArtworkImage } from '../ArtworkImage';

const MAX_ZOOM = 3;
const STEP = 0.5;
const DOUBLE_CLICK_ZOOM = 2;

/**
 * Full-resolution artwork with zoom controls. Mouse: drag to pan, double-click to zoom in at the
 * pointer or back out. Touch pans natively through the scrolling surface. Remount (`key`) per work.
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

  function zoomTo(next: number, x = 0.5, y = 0.5) {
    const clamped = Math.min(MAX_ZOOM, Math.max(1, next));
    if (clamped === zoom) return;
    anchor.current = { x, y, from: zoom };
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
      <span aria-live="polite">{Math.round(zoom * 100)}%</span>
      <button className="icon-button" aria-label="Zoom in" disabled={zoom >= MAX_ZOOM} onClick={() => zoomTo(zoom + STEP)}><Plus size={20} /></button>
      {children}
    </div>
  </>;
}
