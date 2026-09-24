import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const font = readFile(join(process.cwd(), 'node_modules/@fontsource/bodoni-moda/files/bodoni-moda-latin-900-normal.woff'));

// Typographic "HF" monogram in the site's Bodoni Moda on the gallery black. No artwork imagery.
export async function renderMonogram(size: number) {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#101010', color: '#eeeae4', fontFamily: 'Bodoni Moda', fontSize: size * 0.5, letterSpacing: '0.04em', paddingTop: size * 0.03 }}>
        HF
      </div>
    ),
    { width: size, height: size, fonts: [{ name: 'Bodoni Moda', data: await font, style: 'normal', weight: 900 }] },
  );
}
