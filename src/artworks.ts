/** One record per painting: the work page, sitemap entry, share card, alt text and JSON-LD all come from here. */
export type Artwork = {
  /** Stable URL slug and photo name: keep it even if the title changes. */
  slug: string;
  title: string;
  /** One factual visual sentence, used for alt text. */
  description: string;
  /** Whole Australian dollars. */
  price: number;
  available: boolean;
  year: number;
  medium: string;
  widthCm: number;
  heightCm: number;
  src: string;
  /** Pixel size of the photo. A painting is never displayed larger than this. */
  width: number;
  height: number;
};

type Entry = Pick<Artwork, 'slug' | 'title' | 'price' | 'width' | 'height' | 'description'>;

// Catalogue order is display order. Facts confirmed by Harry in October 2026.
const entries: Entry[] = [
  { slug: 'figure-with-skull', title: 'Figure with Skull', price: 1400, width: 944, height: 1303, description: 'A dark-haired woman holds a skull against her cheek, drawn in charcoal over layers of white and pale pink.' },
  { slug: 'over-the-shoulder', title: 'Over the Shoulder', price: 1200, width: 903, height: 1232, description: 'A woman looks back over a bare shoulder, in soft layers of grey, black and warm neutral tones.' },
  { slug: 'portrait-with-rose', title: 'Rose Sitter', price: 1400, width: 806, height: 1258, description: 'A woman holds a dark rose to her chest, lit warm against ochre, charcoal and broken white marks.' },
  { slug: 'new-painting-2026', title: 'Vigil', price: 1200, width: 887, height: 1269, description: 'A seated woman lets a dark garment slip from her shoulders, against a rose ground of deep red and pale marks.' },
  { slug: 'abstract-blue-loops', title: 'Blue Undertow', price: 950, width: 2384, height: 1575, description: 'Heavy black loops sweep across a blue-grey ground banded with gold, violet and rose.' },
  { slug: 'figure-exhaling-red', title: 'Red Breath', price: 1400, width: 1862, height: 2400, description: 'A bald figure tips its head back as a cloud of red breath rises into a scraped black ground.' },
  // Photo returned to its native 636 × 800: the supplied file was a 3× upscale.
  { slug: 'woman-cigarette', title: 'Last Light', price: 1200, width: 636, height: 800, description: 'A woman lights a cigarette, the flame glowing orange on her face, with smoke curling into her dark hair.' },
  { slug: 'purple-splatter', title: 'Bruise', price: 950, width: 1001, height: 1240, description: 'Tangled white lines of poured paint cross a black ground flecked with violet.' },
  { slug: 'black-splatter', title: 'Pitch', price: 950, width: 1817, height: 2178, description: 'Dense loops of white and grey poured paint over a black ground.' },
  { slug: 'woman-cigarette-easel', title: 'Smoke at the Easel', price: 1400, width: 1048, height: 1482, description: 'A woman with loosely pinned dark hair looks down, a cigarette in her hand, in grey and charcoal tones.' },
];

export const artworks: Artwork[] = entries.map(entry => ({
  ...entry,
  year: 2026,
  medium: 'Acrylic, charcoal and pastel on canvas',
  available: true,
  // Every work is a 60 × 90 cm canvas; the landscape one hangs 90 wide.
  ...(entry.width > entry.height ? { widthCm: 90, heightCm: 60 } : { widthCm: 60, heightCm: 90 }),
  src: `/art/${entry.slug}-web.jpg`,
}));

export const artworkBySlug = (slug: string) => artworks.find(work => work.slug === slug);
export const artworkPath = (work: Artwork) => `/works/${work.slug}`;
export const artworkAlt = (work: Artwork) => `${work.title}, a painting by Harrison Ferraro. ${work.description}`;
export const artworkSize = (work: Artwork) => `${work.widthCm} × ${work.heightCm} cm`;
export const artworkPrice = (work: Artwork) => `$${work.price.toLocaleString('en-AU')} AUD`;
