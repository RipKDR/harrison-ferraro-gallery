'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';

export type HallWork = { slug: string; title: string; src: string; width: number; height: number; size: string; price: string; href: string };
type Hall = { go: (index: number) => void; step: (dir: number) => void; dispose: () => void };

/** The 3D hall over the still viewing room. Absent with reduced motion or without WebGL; three.js loads only here. */
export function Gallery3D({ works }: { works: HallWork[] }) {
  const host = useRef<HTMLDivElement>(null);
  const hall = useRef<Hall | null>(null);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!document.createElement('canvas').getContext('webgl2')) return;
    let gone = false;
    import('./hall-scene').then(({ createHall }) => createHall(host.current!, works, {
      onChange: setIndex,
      onOpen: i => router.push(works[i].href),
    })).then(h => {
      if (gone) return h.dispose();
      hall.current = h;
      setReady(true);
    }).catch(error => console.warn('3D hall unavailable, keeping the still room.', error));
    return () => { gone = true; hall.current?.dispose(); hall.current = null; };
  }, [works, router]);

  // The section is the hall only once the room has loaded; until then the still room shows.
  useEffect(() => { host.current?.closest('.hall')?.classList.toggle('is-3d', ready); }, [ready]);

  const work = works[index];
  return <div className="hall-3d" ref={host} aria-hidden={!ready}>
    {ready && <div className="hall-ui">
      <div className="label hall-label" aria-live="polite">
        <h2 className="label-title"><Link href={work.href}>{work.title}</Link></h2>
        <span>{work.size}</span>
        <span>{work.price}</span>
        <Link className="text-link" href={work.href}>View the painting</Link>
      </div>
      <div className="hall-nav">
        <button type="button" onClick={() => hall.current?.step(-1)} disabled={index === 0} aria-label="Previous painting"><ArrowLeft size={20} /></button>
        <span>{index + 1} of {works.length}</span>
        <button type="button" onClick={() => hall.current?.step(1)} disabled={index === works.length - 1} aria-label="Next painting"><ArrowRight size={20} /></button>
      </div>
    </div>}
  </div>;
}
