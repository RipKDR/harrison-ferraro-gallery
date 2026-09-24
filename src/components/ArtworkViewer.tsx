'use client';
import { useEffect, useRef, useState } from 'react';
import { CornersOut, Minus, Plus, X } from '@phosphor-icons/react';
import { type Artwork, artworkTitle } from '../artworks';
import { ArtworkImage } from '../ArtworkImage';

const MAX_ZOOM = 3;

/**
 * Work-page photograph that opens a full-screen, zoomable view (same controls as the home-page
 * modal). The full-resolution mapping only loads once the viewer is opened.
 */
export function ArtworkViewer({ work }: { work: Artwork }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const title = artworkTitle(work);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!open && element.open) {
      element.close();
    }
    if (!open) document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function close() {
    setOpen(false);
    setZoom(1);
    opener.current?.focus();
  }

  return <>
    <button ref={opener} type="button" className="work-page-photo artwork-open" onClick={() => setOpen(true)} aria-label={`View ${title} full screen`}>
      <ArtworkImage work={work} preload sizes="(max-width: 700px) 100vw, 55vw" />
      <span className="artwork-open-hint" aria-hidden="true"><CornersOut size={18} /> View full screen</span>
    </button>
    <dialog ref={dialog} className="panel work-panel full-view" aria-label={`${title} — full screen`} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <button className="close-button icon-button" aria-label="Close full screen view" onClick={close}><X size={26} weight="light" /></button>
      {open && <div className="work-layout">
        <div className="work-photo-area">
          <div className={`zoom-surface ${zoom > 1 ? 'is-zoomed' : ''}`}>
            <div className="zoom-inner" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
              <ArtworkImage work={work} sizes="100vw" detail />
            </div>
          </div>
          <div className="zoom-controls">
            <button className="icon-button" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - 0.5))}><Minus size={20} /></button>
            <span aria-live="polite">{Math.round(zoom * 100)}%</span>
            <button className="icon-button" aria-label="Zoom in" disabled={zoom >= MAX_ZOOM} onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + 0.5))}><Plus size={20} /></button>
          </div>
        </div>
      </div>}
    </dialog>
  </>;
}
