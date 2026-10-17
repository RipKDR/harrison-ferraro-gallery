import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { artworks } from '../artworks';
import { SmokeWall } from '../components/SmokeWall';
import { WalkMotion } from '../components/WalkMotion';
import { WorkCard } from '../components/WorkCard';
import { JsonLd, personJsonLd, websiteJsonLd } from '../lib/jsonld';

// Canonical lives here, not in the layout, so other routes never inherit the home URL.
export const metadata: Metadata = { alternates: { canonical: '/' } };

// The smoke thickens at the painting of a breath: the one peak of the walk, with a wider gap before it.
const PEAK = 'figure-exhaling-red';

// One gallery wall. The name is lettered on it like exhibition vinyl, then the ten canvases hang in catalogue order at
// one scale (each is its width in cm times --cm) on a shared centre line, and the wall ends on an enquiry label.
// WalkMotion pins the wall and turns vertical scroll into a walk along it; without it (reduced motion, no script) the
// same markup is a still hang that wraps down the page.
export default function Page() {
  return <>
    <JsonLd data={personJsonLd} />
    <JsonLd data={websiteJsonLd} />
    <SmokeWall />
    <section className="walk" aria-labelledby="home-title">
      <div className="walk-stage">
        <ul className="walk-track">
          <li className="walk-vinyl">
            <h1 id="home-title">Harrison Ferraro</h1>
            <p>Original figurative and abstract paintings in acrylic, charcoal and pastel on canvas, made in Melbourne.</p>
            <p>Every canvas is 60 × 90 cm, hung here at one scale.</p>
          </li>
          {artworks.map((work, index) => <li key={work.slug} id={work.slug} className={work.slug === PEAK ? 'walk-work walk-peak' : 'walk-work'}
            style={{ '--wcm': work.widthCm } as React.CSSProperties} data-smoke={work.slug === PEAK ? 1.7 : 1} data-smoke-source={index === 0 ? '' : undefined}>
            <WorkCard work={work} sizes="(max-width: 999px) 80vw, 40vh" eager={index < 3} />
          </li>)}
          <li className="label walk-plate">
            <p className="label-title">Every piece is an original, made in Melbourne.</p>
            <Link className="button" href="/contact">Enquire about a painting <ArrowRight size={20} /></Link>
            <Link className="text-link" href="/about">About Harrison</Link>
          </li>
        </ul>
        <nav className="walk-index" aria-label="Paintings on this wall">
          {artworks.map(work => <a key={work.slug} href={`#${work.slug}`}>{work.title}</a>)}
        </nav>
      </div>
    </section>
    <WalkMotion />
  </>;
}
