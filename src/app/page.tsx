import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { type Artwork, artworkPath, artworkPrice, artworks, artworkSize } from '../artworks';
import { ArtworkImage } from '../ArtworkImage';
import { ScrollMotion } from '../components/ScrollMotion';
import { JsonLd, personJsonLd, websiteJsonLd } from '../lib/jsonld';

// Canonical lives here, not in the layout, so other routes never inherit the home URL.
export const metadata: Metadata = { alternates: { canonical: '/' } };

// Six hangs, one per room. The sequence is a rhythm (how big, how much dark, where the title sits),
// not a repeated card. Index follows catalogue order; it is not a hard-coded page size.
const hangs = ['monument', 'intimate', 'low', 'wide', 'tower', 'aside'] as const;
type Hang = (typeof hangs)[number];

function hangAt(index: number): Hang {
  return hangs[index] ?? 'monument';
}

/** One painting owns the screen. The whole hang is one link, so each room is one tab stop. */
function Room({ work, hang }: { work: Artwork; hang: Hang }) {
  const wide = hang === 'wide';
  return <div className={`beat room room-${hang}`} data-fx>
    <div className="beat-frame">
      <Link className="room-link" href={artworkPath(work)}>
        <div className="room-work spot">
          <ArtworkImage work={work} sizes={wide ? '(max-width: 999px) 92vw, 70vw' : '(max-width: 999px) 86vw, 40vw'} />
        </div>
        <div className="room-copy">
          <h3 className="room-title">{work.title}</h3>
          {/* A wall label: one fact per line. Year and medium are shared by every work, so the opening states them once. */}
          <div className="label room-meta">
            <p>{artworkSize(work)}</p>
            <p>{work.available ? artworkPrice(work) : 'Sold'}</p>
            <span className="room-cue">View the painting</span>
          </div>
        </div>
      </Link>
    </div>
  </div>;
}

// An exhibition told on scroll. The opening is a room: the painting on the wall, the name on the floor.
// Six more paintings follow, each hung differently, with Harry's statement between them, verbatim.
export default function Page() {
  const [lead, ...rest] = artworks;
  const rooms = rest.slice(0, 6);
  const early = rooms.slice(0, 3);
  const later = rooms.slice(3);
  return <>
    <JsonLd data={personJsonLd} />
    <JsonLd data={websiteJsonLd} />
    <ScrollMotion />
    <div className="hero-pin">
      <section className="opening" aria-labelledby="opening-title">
        <Link className="opening-work spot" href={artworkPath(lead)}>
          <ArtworkImage work={lead} eager sizes="(max-width: 999px) 84vw, 38vw" />
        </Link>
        <div className="floor" aria-hidden="true"><div className="floor-plane"><span>Ferraro</span></div></div>
        <div className="label opening-label">
          <p className="label-title">{lead.title}, <span>{lead.year}</span></p>
          <p>{lead.medium}</p>
          <p>{artworkSize(lead)}</p>
          <p>{lead.available ? artworkPrice(lead) : 'Sold'}</p>
        </div>
        <div className="opening-text">
          {/* Harry's words first, then the artist's name as the attribution, the way a quotation hangs on a gallery wall. */}
          <h1 id="opening-title">I paint people in the moments they don’t perform: an exhale, a turned shoulder, smoke hanging in the air. <span className="attribution">Harrison Ferraro, painter, Melbourne</span></h1>
          <Link className="text-link" href="/works">See the works</Link>
        </div>
      </section>
    </div>
    <div className="show">
      <section className="beat interlude" data-fx aria-labelledby="hang-title">
        <div className="beat-frame">
          <div className="interlude-copy">
            <h2 id="hang-title" className="visually-hidden">The paintings</h2>
            <p>I work in acrylic, charcoal and pastel on canvas, building the surface up and tearing it back until what’s left feels honest.</p>
          </div>
        </div>
      </section>
      {early.map((work, i) => <Room key={work.slug} work={work} hang={hangAt(i)} />)}
      <section className="beat interlude" data-fx>
        <div className="beat-frame">
          <div className="interlude-copy">
            <p>The palette stays dark, with <span className="red">red</span> used only where it hurts.</p>
            <Link className="text-link" href="/about">About Harrison</Link>
          </div>
        </div>
      </section>
      {later.map((work, i) => <Room key={work.slug} work={work} hang={hangAt(i + early.length)} />)}
      <section className="beat close" data-fx>
        <div className="beat-frame">
          <p>Every piece is an original, made in Melbourne.</p>
          <div className="close-actions">
            <Link className="button" href="/contact">Enquire about a painting <ArrowRight size={20} /></Link>
            <Link className="text-link" href="/works">See all {artworks.length} paintings</Link>
          </div>
        </div>
      </section>
    </div>
  </>;
}
