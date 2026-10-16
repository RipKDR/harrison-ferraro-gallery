import Link from 'next/link';
import { type Artwork, artworkPath, artworkPrice, artworkSize } from '../artworks';
import { ArtworkImage } from '../ArtworkImage';

/** A painting with its wall label: the one way into a work page from the home page, the index and related works. */
export function WorkCard({ work, sizes, eager = false }: { work: Artwork; sizes: string; eager?: boolean }) {
  const price = work.available ? artworkPrice(work) : 'Sold';
  return <Link className="work-card" href={artworkPath(work)}>
    <ArtworkImage work={work} sizes={sizes} eager={eager} />
    <span className="label">
      <span className="label-title">{work.title}</span>
      <span>{work.year} · {artworkSize(work)}</span>
      <span>{price}</span>
    </span>
  </Link>;
}
