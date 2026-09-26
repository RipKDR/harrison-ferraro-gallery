import { type Artwork, artworkAlt, artworkPath, artworkTitle } from '../artworks';
import { artworks } from '../artworks';
import { INSTAGRAM_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from './site';

const ARTIST_ID = `${SITE_URL}/#artist`;

export const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': ARTIST_ID,
  name: SITE_NAME,
  url: SITE_URL,
  description: 'Figurative and abstract painter based in Melbourne, Australia.',
  jobTitle: 'Painter',
  homeLocation: { '@type': 'Place', name: 'Melbourne, Australia' },
  sameAs: [INSTAGRAM_URL],
};

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: 'en-AU',
  author: { '@id': ARTIST_ID },
};

const centimetres = (value: number) => ({ '@type': 'QuantitativeValue', value, unitCode: 'CMT' });

// Only confirmed facts are emitted; unknown medium, size and year are left out rather than guessed.
// Product/Offer markup is absent while acquisition remains enquiry-led.
export function visualArtworkJsonLd(work: Artwork) {
  const { facts } = work;
  return {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: artworkTitle(work),
    url: absoluteUrl(artworkPath(work)),
    image: { '@type': 'ImageObject', contentUrl: absoluteUrl(work.src), width: work.width, height: work.height, caption: artworkAlt(work) },
    description: work.description,
    artform: 'Painting',
    creator: { '@type': 'Person', '@id': ARTIST_ID, name: SITE_NAME, url: SITE_URL, sameAs: [INSTAGRAM_URL] },
    ...(facts.medium && { artMedium: facts.medium }),
    ...(facts.widthCm && { width: centimetres(facts.widthCm) }),
    ...(facts.heightCm && { height: centimetres(facts.heightCm) }),
    ...(facts.depthCm && { depth: centimetres(facts.depthCm) }),
    ...(facts.year && { dateCreated: facts.year }),
  };
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

export const profilePageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  url: absoluteUrl('/about'),
  name: `About ${SITE_NAME}`,
  inLanguage: 'en-AU',
  mainEntity: { '@id': ARTIST_ID },
};

// The home page lists the full collection; this mirrors that list for search engines.
export const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  url: SITE_URL,
  name: `${SITE_NAME} — Selected works`,
  description: SITE_DESCRIPTION,
  inLanguage: 'en-AU',
  author: { '@id': ARTIST_ID },
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: artworks.length,
    itemListElement: artworks.map((work, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(artworkPath(work)),
      name: artworkTitle(work),
      image: absoluteUrl(work.src),
    })),
  },
};

export function breadcrumbJsonLd(work: Artwork) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Works', item: absoluteUrl('/#collection') },
      { '@type': 'ListItem', position: 3, name: artworkTitle(work), item: absoluteUrl(artworkPath(work)) },
    ],
  };
}
