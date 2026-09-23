import { featuredArtworks } from '../artworks';
import { OG_SIZE, renderArtworkCard } from '../lib/og';

export const alt = 'Over the shoulder, a painting by Harrison Ferraro, beside the Harrison Ferraro wordmark';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function TwitterImage() {
  return renderArtworkCard(featuredArtworks[0], 'Selected works', 'Figurative and abstract painting · Melbourne');
}
