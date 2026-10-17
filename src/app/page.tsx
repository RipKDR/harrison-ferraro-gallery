import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { artworkPath, artworkPrice, artworks, artworkSize } from '../artworks';
import { ArtworkImage } from '../ArtworkImage';
import { Gallery3D, type HallWork } from '../components/Gallery3D';
import { JsonLd, personJsonLd, websiteJsonLd } from '../lib/jsonld';

// Canonical lives here, not in the layout, so other routes never inherit the home URL.
export const metadata: Metadata = { alternates: { canonical: '/' } };

const hall: HallWork[] = artworks.map(work => ({
  slug: work.slug, title: work.title, src: work.src, width: work.width, height: work.height,
  size: artworkSize(work), price: work.available ? artworkPrice(work) : 'Sold', href: artworkPath(work),
}));

// The hall: ten pointed-arch niches, one painting each. The markup is a still viewing room (one painting per screen,
// swipe or scroll sideways) that works with no script and with reduced motion. Gallery3D lays the Blender-built room
// over it in three.js when WebGL is there and motion is welcome.
export default function Page() {
  return <>
    <JsonLd data={personJsonLd} />
    <JsonLd data={websiteJsonLd} />
    <section className="hall" aria-labelledby="home-title">
      <h1 id="home-title" className="visually-hidden">Harrison Ferraro, paintings</h1>
      <ol className="hall-rooms">
        {artworks.map((work, index) => <li key={work.slug} className="hall-room">
          <Link href={artworkPath(work)} className="hall-art spot" tabIndex={-1} aria-hidden="true">
            <ArtworkImage work={work} sizes="(max-width: 699px) 86vw, 50vh" eager={index === 0} />
          </Link>
          <div className="label hall-label">
            <h2 className="label-title"><Link href={artworkPath(work)}>{work.title}</Link></h2>
            <span>{artworkSize(work)}</span>
            <span>{work.available ? artworkPrice(work) : 'Sold'}</span>
          </div>
        </li>)}
      </ol>
      <Gallery3D works={hall} />
    </section>
    <section className="hall-close">
      <p>Ten original paintings, 2026. Acrylic, charcoal and pastel on canvas, each 60 × 90 cm.</p>
      <Link className="button" href="/contact">Enquire about a painting <ArrowRight size={20} /></Link>
    </section>
  </>;
}
