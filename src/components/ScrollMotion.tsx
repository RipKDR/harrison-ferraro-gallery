'use client';
import { useEffect } from 'react';

/** Fallback for browsers without CSS scroll timelines: reveals each [data-fx] beat as it enters, and sets --fx
 *  (about 1 entering at the bottom, 0 centred, -1 leaving at the top) so the painting, title and label drift apart.
 *  Off with reduced motion. The opening is not a [data-fx] beat — its image must stay visible. */
export function ScrollMotion() {
  useEffect(() => {
    if (CSS.supports('animation-timeline: view()') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    const visible = new Set<HTMLElement>();
    let frame = 0;
    const update = () => {
      frame = 0;
      for (const el of visible) {
        const { top, height } = el.getBoundingClientRect();
        el.style.setProperty('--fx', ((top + height / 2) / innerHeight - 0.5).toFixed(3));
      }
    };
    const observer = new IntersectionObserver(entries => {
      for (const { target, isIntersecting } of entries) {
        const el = target as HTMLElement;
        if (isIntersecting) { el.classList.add('is-in'); visible.add(el); } else visible.delete(el);
      }
      update();
    });
    const onScroll = () => { frame ||= requestAnimationFrame(update); };
    // Mark beats already on screen before fx-js hides the rest, so they don't flash out for a frame.
    document.querySelectorAll<HTMLElement>('[data-fx]').forEach(el => {
      const { top, bottom } = el.getBoundingClientRect();
      if (bottom > 0 && top < innerHeight) el.classList.add('is-in');
      observer.observe(el);
    });
    root.classList.add('fx-js');
    addEventListener('scroll', onScroll, { passive: true });
    return () => { observer.disconnect(); removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); root.classList.remove('fx-js'); };
  }, []);
  return null;
}
