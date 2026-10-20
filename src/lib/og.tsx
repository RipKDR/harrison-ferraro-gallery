import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import type { Artwork } from '../artworks';

export const OG_SIZE = { width: 1200, height: 630 };

// Satori cannot read the site's woff2 fonts, so the card keeps the installed Bodoni Moda woff.
const fontData = readFile(join(process.cwd(), 'node_modules/@fontsource/bodoni-moda/files/bodoni-moda-latin-900-normal.woff'));

// Downscale before embedding: the card shows the photo at most 640 × 550, and some sources are 1 MB.
async function photoDataUrl(work: Artwork) {
  const file = await readFile(join(process.cwd(), 'public', work.src));
  const resized = await sharp(file).resize({ width: 1280, height: 1100, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  return `data:image/jpeg;base64,${resized.toString('base64')}`;
}

// Share card: the original photograph, whole and unretouched, beside the wordmark.
export async function renderArtworkCard(work: Artwork, heading: string, subheading: string) {
  const [font, src] = await Promise.all([fontData, photoDataUrl(work)]);
  const scale = Math.min(640 / work.width, 550 / work.height);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', background: '#0f0e0d', color: '#ece6dc', padding: 40 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', paddingRight: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 30, letterSpacing: '0.22em', lineHeight: 1.05 }}>
            <span>HARRISON</span>
            <span>FERRARO</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'Bodoni Moda', fontSize: heading.length > 16 ? 58 : 72, lineHeight: 1.05 }}>{heading}</span>
            <span style={{ marginTop: 20, fontSize: 24, color: '#aaa399', letterSpacing: '0.06em' }}>{subheading}</span>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
        <img src={src} alt="" width={Math.round(work.width * scale)} height={Math.round(work.height * scale)} />
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: 'Bodoni Moda', data: await font, style: 'normal', weight: 900 }] },
  );
}
