import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { artworkBySlug, artworkPath, artworkPrice, artworks, artworkSize } from '../../../artworks';
import { ArtworkImage } from '../../../ArtworkImage';
import { EnquiryForm } from '../../../components/EnquiryForm';
import { ShareArtwork } from '../../../components/ShareArtwork';
import { TrackArtworkView } from '../../../components/TrackArtworkView';
import { WorkCard } from '../../../components/WorkCard';
import { WorkKeyboardNav } from '../../../components/WorkKeyboardNav';
import { isEmailConfigured } from '../../../lib/email-status';
import { breadcrumbJsonLd, JsonLd, visualArtworkJsonLd } from '../../../lib/jsonld';
import { SITE_NAME } from '../../../lib/site';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return artworks.map(work => ({ slug: work.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const work = artworkBySlug((await params).slug);
  if (!work) return {};
  const title = work.title;
  const description = `${work.title} (${work.year}), an original painting by ${SITE_NAME}. ${work.medium}, ${artworkSize(work)}. ${work.available ? `Available, ${artworkPrice(work)}.` : 'Sold.'}`;
  const url = artworkPath(work);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', locale: 'en_AU', siteName: SITE_NAME, url, title: `${title} — ${SITE_NAME}`, description },
    twitter: { card: 'summary_large_image', title: `${title} — ${SITE_NAME}`, description },
  };
}

export default async function WorkPage({ params }: Props) {
  const work = artworkBySlug((await params).slug);
  if (!work) notFound();
  const index = artworks.indexOf(work);
  const previous = artworks[(index - 1 + artworks.length) % artworks.length];
  const next = artworks[(index + 1) % artworks.length];
  const related = [1, 2, 3].map(offset => artworks[(index + offset) % artworks.length]);
  return <>
    <JsonLd data={visualArtworkJsonLd(work)} />
    <JsonLd data={breadcrumbJsonLd(work)} />
    <TrackArtworkView slug={work.slug} />
    <WorkKeyboardNav previous={artworkPath(previous)} next={artworkPath(next)} />
    <article className="work">
      <div className="stage spot">
        <ArtworkImage work={work} eager sizes="(max-width: 999px) 100vw, 50vw" />
      </div>
      <div className="label work-label">
        <h1>{work.title}</h1>
        <p className="price">{work.available ? <>{artworkPrice(work)}<span>Available</span></> : 'Sold'}</p>
        <a className="button" href="#enquire">Enquire about this painting <ArrowRight size={20} /></a>
        <dl>
          <div><dt>Year</dt><dd>{work.year}</dd></div>
          <div><dt>Medium</dt><dd>{work.medium}</dd></div>
          <div><dt>Size</dt><dd>{artworkSize(work)}</dd></div>
        </dl>
        <p className="description">{work.description}</p>
        <ShareArtwork work={work} />
        <nav className="pager" aria-label="More paintings">
          <Link href={artworkPath(previous)} aria-label={`Previous painting: ${previous.title}`}><ArrowLeft size={18} /> Previous</Link>
          <Link href="/works">All works</Link>
          <Link href={artworkPath(next)} aria-label={`Next painting: ${next.title}`}>Next <ArrowRight size={18} /></Link>
        </nav>
      </div>
    </article>
    <section className="enquire" id="enquire" aria-labelledby="enquire-title">
      <div className="enquire-head">
        <h2 id="enquire-title">Enquire about {work.title}</h2>
        <p>Ask anything about the painting. Add your country and postcode for a delivery quote.</p>
      </div>
      <EnquiryForm artworkId={work.slug} emailEnabled={isEmailConfigured()} />
    </section>
    <section className="more ruled" aria-labelledby="more-title">
      <h2 id="more-title">More paintings</h2>
      <div className="more-grid">
        {related.map(other => <WorkCard key={other.slug} work={other} sizes="(max-width: 699px) 45vw, 30vw" />)}
      </div>
    </section>
  </>;
}
