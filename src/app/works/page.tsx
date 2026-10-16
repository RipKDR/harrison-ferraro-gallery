import type { Metadata } from 'next';
import { artworks } from '../../artworks';
import { WorkCard } from '../../components/WorkCard';
import { collectionJsonLd, JsonLd } from '../../lib/jsonld';
import { SITE_NAME } from '../../lib/site';

const description = `All ${artworks.length} original paintings by Harrison Ferraro, in acrylic, charcoal and pastel on canvas, with sizes and prices in Australian dollars.`;

export const metadata: Metadata = {
  title: 'Works',
  description,
  alternates: { canonical: '/works' },
  openGraph: { type: 'website', locale: 'en_AU', siteName: SITE_NAME, url: '/works', title: `Works — ${SITE_NAME}`, description },
  twitter: { card: 'summary_large_image', title: `Works — ${SITE_NAME}`, description },
};

export default function WorksPage() {
  return <>
    <JsonLd data={collectionJsonLd} />
    <header className="page-head">
      <h1>Works</h1>
      <p>Original paintings in acrylic, charcoal and pastel on canvas. Prices are in Australian dollars.</p>
    </header>
    <div className="works-grid">
      {artworks.map((work, index) => <WorkCard key={work.slug} work={work} sizes="(max-width: 999px) 45vw, 22vw" eager={index < 4} />)}
    </div>
  </>;
}
