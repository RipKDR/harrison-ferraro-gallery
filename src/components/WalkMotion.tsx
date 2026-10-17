'use client';
import { useEffect } from 'react';
import { walk } from './SmokeWall';

/** Pins the home wall and turns vertical scroll into a walk along it: the section is made as tall as the wall is wide,
 *  and the track slides left by however far the page has scrolled into it. Marks the painting nearest the centre as
 *  the smoke's source and the index's current entry. Off with reduced motion, which keeps the still hang. */
export function WalkMotion() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>('.walk');
    const stage = section?.querySelector<HTMLElement>('.walk-stage');
    const track = section?.querySelector<HTMLElement>('.walk-track');
    if (!section || !stage || !track || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const works = [...track.querySelectorAll<HTMLElement>('.walk-work')];
    const links = [...section.querySelectorAll<HTMLAnchorElement>('.walk-index a')];
    let travel = 0;
    let top = 0;
    let centres: number[] = [];
    let current = -1;
    let frame = 0;

    // Page scroll that puts an element's centre at the centre of the screen.
    const scrollFor = (el: HTMLElement) => top + Math.min(travel, Math.max(0, el.offsetLeft + el.offsetWidth / 2 - innerWidth / 2));
    // Layout is read in measure() only, so a scroll frame writes and never forces a reflow.
    const update = () => {
      frame = 0;
      const x = Math.min(travel, Math.max(0, scrollY - top));
      track.style.transform = `translate3d(${-x}px, 0, 0)`;
      walk.x = x;
      const centre = x + innerWidth / 2;
      let nearest = 0;
      centres.forEach((c, i) => { if (Math.abs(c - centre) < Math.abs(centres[nearest] - centre)) nearest = i; });
      if (nearest === current) return;
      works[current]?.removeAttribute('data-smoke-source');
      links[current]?.removeAttribute('aria-current');
      works[nearest].setAttribute('data-smoke-source', '');
      links[nearest]?.setAttribute('aria-current', 'true');
      current = nearest;
    };
    const measure = () => {
      travel = Math.max(0, track.scrollWidth - innerWidth);
      top = section.getBoundingClientRect().top + scrollY;
      centres = works.map(el => el.offsetLeft + el.offsetWidth / 2);
      section.style.height = `${travel + innerHeight}px`;
      update();
    };
    const onScroll = () => { frame ||= requestAnimationFrame(update); };
    // The index jumps along the wall instead of to an anchor the transformed track can't scroll to.
    const onIndex = (e: MouseEvent) => {
      const i = links.indexOf(e.target as HTMLAnchorElement);
      if (i < 0) return;
      e.preventDefault();
      scrollTo({ top: scrollFor(works[i]) });
    };
    // Tabbing to a link off-screen would scroll the clipped stage sideways; walk to it instead.
    const onFocus = (e: FocusEvent) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>('.walk-track > li');
      stage.scrollLeft = 0;
      if (item) scrollTo({ top: scrollFor(item), behavior: 'instant' });
    };

    section.classList.add('is-walking');
    measure();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', measure);
    section.addEventListener('click', onIndex);
    section.addEventListener('focusin', onFocus);
    // Paintings load lazily, and fonts can change the vinyl's width: re-measure when the track's size changes.
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', measure);
      section.removeEventListener('click', onIndex);
      section.removeEventListener('focusin', onFocus);
      section.classList.remove('is-walking');
      section.style.height = '';
      track.style.transform = '';
      walk.x = 0;
    };
  }, []);
  return null;
}
