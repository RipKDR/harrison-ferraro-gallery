import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { artworkPath, artworkPrice, artworks, artworkSize } from '../artworks';
import { ArtworkImage } from '../ArtworkImage';
import { WorkCard } from '../components/WorkCard';
import { JsonLd, personJsonLd, websiteJsonLd } from '../lib/jsonld';

// Canonical lives here, not in the layout, so other routes never inherit the home URL.
export const metadata: Metadata = { alternates: { canonical: '/' } };

// The copy is Harry's artist statement, one sentence per section. The first painting leads; the next six hang below.
export default function Page() {
  const [lead, ...rest] = artworks;
  return <>
    <JsonLd data={personJsonLd} />
    <JsonLd data={websiteJsonLd} />
    <section className="opening" aria-labelledby="opening-title">
      <Link className="opening-work spot" href={artworkPath(lead)}>
        <ArtworkImage work={lead} eager sizes="(max-width: 999px) 78vw, 36vw" />
      </Link>
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
    <section className="hang ruled" aria-labelledby="hang-title">
      <div className="hang-head">
        <h2 id="hang-title">The paintings</h2>
        <p>I work in acrylic, charcoal and pastel on canvas, building the surface up and tearing it back until what’s left feels honest.</p>
      </div>
      <div className="hang-grid">
        {rest.slice(0, 6).map(work => <WorkCard key={work.slug} work={work} sizes="(max-width: 999px) 80vw, 40vw" />)}
      </div>
      <Link className="text-link hang-more" href="/works">See all {artworks.length} paintings <ArrowRight size={18} /></Link>
    </section>
    <section className="pull ruled">
      <p>The palette stays dark, with <span className="red">red</span> used only where it hurts.</p>
      <Link className="text-link" href="/about">About Harrison <ArrowRight size={18} /></Link>
    </section>
    <section className="close">
      <p>Every piece is an original, made in Melbourne.</p>
      <Link className="button" href="/contact">Enquire about a painting <ArrowRight size={20} /></Link>
    </section>
  </>;
}
