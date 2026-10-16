import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { type Artwork, artworkPath, artworkPrice, artworks, artworkSize } from '../artworks';
import { ArtworkImage } from '../ArtworkImage';
import { ScrollMotion } from '../components/ScrollMotion';
import { JsonLd, personJsonLd, websiteJsonLd } from '../lib/jsonld';

// Canonical lives here, not in the layout, so other routes never inherit the home URL.
export const metadata: Metadata = { alternates: { canonical: '/' } };

/** One painting per screen, hung on alternate sides. The whole hang is one link, so each room is one tab stop. */
function Room({ work, flip }: { work: Artwork; flip: boolean }) {
  const wide = work.width > work.height;
  return <div className={`room${flip ? ' room-flip' : ''}${wide ? ' room-wide' : ''}`} data-fx>
    <Link className="room-link" href={artworkPath(work)}>
      <div className="room-work spot">
        <ArtworkImage work={work} sizes={wide ? '(max-width: 999px) 90vw, 58vw' : '(max-width: 999px) 84vw, 40vw'} />
      </div>
      <div className="label room-label">
        <h3 className="room-title">{work.title}</h3>
        <p>{work.year} · {work.medium}</p>
        <p>{artworkSize(work)} · {work.available ? artworkPrice(work) : 'Sold'}</p>
        <span className="room-cue">View the painting <ArrowRight size={18} /></span>
      </div>
    </Link>
  </div>;
}

// An exhibition told on scroll: the first painting opens the show, six more hang one per screen,
// and Harry's artist statement runs between them, one sentence per beat.
export default function Page() {
  const [lead, ...rest] = artworks;
  const rooms = rest.slice(0, 6);
  return <>
    <JsonLd data={personJsonLd} />
    <JsonLd data={websiteJsonLd} />
    <ScrollMotion />
    <div className="hero-pin">
      <section className="opening" aria-labelledby="opening-title">
        <Link className="opening-work spot" href={artworkPath(lead)}>
          <ArtworkImage work={lead} eager sizes="(max-width: 999px) 72vw, 30vw" />
        </Link>
        <div className="floor" aria-hidden="true"><span>Ferraro</span></div>
        <div className="label opening-label">
          <p className="label-title">{lead.title}</p>
          <p>{lead.year} · {lead.medium}</p>
          <p>{artworkSize(lead)} · {lead.available ? artworkPrice(lead) : 'Sold'}</p>
          <Link className="red-link" href={`${artworkPath(lead)}#enquire`}>Enquire about this painting <ArrowRight size={16} /></Link>
        </div>
        <div className="opening-text">
          <h1 id="opening-title"><span className="kicker">Harrison Ferraro · Painter, Melbourne</span> I paint people in the moments they don’t perform: <em>an exhale, a turned shoulder, smoke hanging in the air.</em></h1>
          <Link className="text-link" href="/works">See the works <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
    <section className="paintings" aria-labelledby="hang-title">
      <div className="interlude" data-fx>
        <h2 id="hang-title" className="kicker">The paintings</h2>
        <p>I work in acrylic, charcoal and pastel on canvas, building the surface up and tearing it back until what’s left feels honest.</p>
      </div>
      {rooms.slice(0, 3).map((work, i) => <Room key={work.slug} work={work} flip={i % 2 === 1} />)}
      <div className="interlude" data-fx>
        <p>The palette stays dark, with <span className="red">red</span> used only where it hurts.</p>
        <Link className="text-link" href="/about">About Harrison <ArrowRight size={18} /></Link>
      </div>
      {rooms.slice(3).map((work, i) => <Room key={work.slug} work={work} flip={(i + 3) % 2 === 1} />)}
    </section>
    <section className="close" data-fx>
      <p>Every piece is an original, made in Melbourne.</p>
      <div className="close-actions">
        <Link className="button" href="/contact">Enquire about a painting <ArrowRight size={20} /></Link>
        <Link className="text-link" href="/works">See all {artworks.length} paintings <ArrowRight size={18} /></Link>
      </div>
    </section>
  </>;
}
