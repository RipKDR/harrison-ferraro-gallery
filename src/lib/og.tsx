import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { type Artwork, artworkCrop } from '../artworks';

export const OG_SIZE = { width: 1200, height: 630 };

const fontData = readFile(join(process.cwd(), 'node_modules/@fontsource/bodoni-moda/files/bodoni-moda-latin-900-normal.woff'));

// Downscale before embedding: the card shows the photo ~550 px tall, and some sources are several MB.
async function photoDataUrl(work: Artwork) {
  const file = await readFile(join(process.cwd(), 'public', work.src));
  const resized = await sharp(file).resize({ height: 1100, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  return `data:image/jpeg;base64,${resized.toString('base64')}`;
}

// Share card: the original photograph (cropped to the canvas edges, never repainted) beside the wordmark.
export async function renderArtworkCard(work: Artwork, heading: string, subheading: string) {
  const [font, src] = await Promise.all([fontData, photoDataUrl(work)]);
  const crop = artworkCrop(work);
  const frameH = 550;
  const photoH = work.height * crop.height;
  const photoW = work.width * crop.width;
  const frameW = Math.round((frameH * photoW) / photoH);
  const imgW = frameW / crop.width;
  const imgH = frameH / crop.height;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', background: '#101010', color: '#eeeae4', padding: 40 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', paddingRight: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 30, letterSpacing: '0.22em', lineHeight: 1.05 }}>
            <span>HARRISON</span>
            <span>FERRARO</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'Bodoni Moda', fontSize: heading.length > 22 ? 58 : 72, lineHeight: 1.05 }}>{heading}</span>
            <span style={{ marginTop: 20, fontSize: 24, color: '#a9a5a0', letterSpacing: '0.06em' }}>{subheading}</span>
          </div>
        </div>
        <div style={{ display: 'flex', position: 'relative', width: frameW, height: frameH, overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
          <img src={src} alt="" width={imgW} height={imgH} style={{ position: 'absolute', left: -crop.left * imgW, top: -crop.top * imgH, width: imgW, height: imgH }} />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: 'Bodoni Moda', data: await font, style: 'normal', weight: 900 }] },
  );
}
