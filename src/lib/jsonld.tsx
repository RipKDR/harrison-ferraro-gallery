import { type Artwork, artworkAlt, artworkPath, artworks } from '../artworks';
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

// Product/Offer markup is absent while sales are enquiry-led (there is no checkout to point an Offer at).
export function visualArtworkJsonLd(work: Artwork) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VisualArtwork',
    name: work.title,
    url: absoluteUrl(artworkPath(work)),
    image: { '@type': 'ImageObject', contentUrl: absoluteUrl(work.src), width: work.width, height: work.height, caption: artworkAlt(work) },
    description: work.description,
    artform: 'Painting',
    artMedium: work.medium,
    width: centimetres(work.widthCm),
    height: centimetres(work.heightCm),
    dateCreated: String(work.year),
    creator: { '@type': 'Person', '@id': ARTIST_ID, name: SITE_NAME, url: SITE_URL, sameAs: [INSTAGRAM_URL] },
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

export const contactPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  url: absoluteUrl('/contact'),
  name: `Enquire — ${SITE_NAME}`,
  inLanguage: 'en-AU',
  mainEntity: { '@id': ARTIST_ID },
};

// The works page lists the full collection; this mirrors that list for search engines.
export const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  url: absoluteUrl('/works'),
  name: `${SITE_NAME} — Works`,
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
      name: work.title,
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
      { '@type': 'ListItem', position: 2, name: 'Works', item: absoluteUrl('/works') },
      { '@type': 'ListItem', position: 3, name: work.title, item: absoluteUrl(artworkPath(work)) },
    ],
  };
}
