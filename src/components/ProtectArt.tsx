'use client';
import { useEffect } from 'react';

/** No right-click "Save image" and no drag-out on a painting. Deters casual saving only; a screenshot can't be blocked. */
export function ProtectArt() {
  useEffect(() => {
    const stop = (e: Event) => { if ((e.target as Element).closest?.('.art')) e.preventDefault(); };
    document.addEventListener('contextmenu', stop);
    document.addEventListener('dragstart', stop);
    return () => { document.removeEventListener('contextmenu', stop); document.removeEventListener('dragstart', stop); };
  }, []);
  return null;
}
