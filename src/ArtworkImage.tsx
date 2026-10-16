import Image from 'next/image';
import { type Artwork, artworkAlt } from './artworks';

/** Server-rendered photo with descriptive alt. CSS caps it at the photo's own pixel width (--w), so it is never upscaled. */
export function ArtworkImage({ work, sizes, eager = false }: { work: Artwork; sizes: string; eager?: boolean }) {
  return <Image className="art" src={work.src} alt={artworkAlt(work)} width={work.width} height={work.height} sizes={sizes}
    loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : undefined}
    style={{ '--w': `${work.width}px`, '--ratio': work.width / work.height } as React.CSSProperties} />;
}
