'use client';
import { useEffect, useState } from 'react';

/**
 * Slim bar that slides in when the visitor scrolls back up, once past the first screen, so the
 * navigation stays in reach on long pages. The full masthead at the top is unchanged.
 */
export function CompactHeader({ children }: { children: React.ReactNode }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let last = window.scrollY, frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY, delta = y - last;
      if (Math.abs(delta) < 8) return;
      last = y;
      setShown(delta < 0 && y > window.innerHeight * 0.8);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);
  return <div className={`compact-header ${shown ? 'is-visible' : ''}`}>{children}</div>;
}
