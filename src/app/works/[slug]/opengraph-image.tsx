import { artworkBySlug, artworks, artworkTitle } from '../../../artworks';
import { OG_SIZE, renderArtworkCard } from '../../../lib/og';

// Static alt (per-work alt via generateImageMetadata would stop these being prerendered at build).
export const alt = 'A painting by Harrison Ferraro beside the Harrison Ferraro wordmark';
export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return artworks.map(work => ({ slug: work.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const work = artworkBySlug((await params).slug);
  if (!work) return new Response('Not found', { status: 404 });
  return renderArtworkCard(work, artworkTitle(work), `Painting by Harrison Ferraro · ${work.number}`);
}
