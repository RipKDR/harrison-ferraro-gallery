import { artworks } from '../../artworks';
import { OG_SIZE, renderArtworkCard } from '../../lib/og';

export const alt = `${artworks[0].title}, a painting by Harrison Ferraro, beside the Harrison Ferraro wordmark`;
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return renderArtworkCard(artworks[0], 'Enquire', 'Painter · Melbourne');
}
