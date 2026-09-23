import { artworkAlt, artworkBySlug, artworks, artworkTitle } from '../../../artworks';
import { OG_SIZE, renderArtworkCard } from '../../../lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';

export function generateStaticParams() {
  return artworks.map(work => ({ slug: work.slug }));
}

export async function generateImageMetadata({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const work = artworkBySlug((await params).slug);
  return [{ id: 'card', size: OG_SIZE, contentType, alt: work ? artworkAlt(work) : 'Painting by Harrison Ferraro' }];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const work = artworkBySlug((await params).slug);
  if (!work) return new Response('Not found', { status: 404 });
  return renderArtworkCard(work, artworkTitle(work), `Painting by Harrison Ferraro · ${work.number}`);
}
