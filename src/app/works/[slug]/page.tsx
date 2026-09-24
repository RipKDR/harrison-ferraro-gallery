import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { artworkBySlug, artworkDimensions, artworkPath, artworks, artworkTitle } from '../../../artworks';
import { ArtworkImage } from '../../../ArtworkImage';
import { EnquiryForm } from '../../../components/EnquiryForm';
import { PrintWaitlistForm } from '../../../components/PrintWaitlistForm';
import { TrackArtworkView } from '../../../components/TrackArtworkView';
import { SiteHeader } from '../../../components/SiteHeader';
import { breadcrumbJsonLd, JsonLd, visualArtworkJsonLd } from '../../../lib/jsonld';
import { SiteFooter } from '../../../components/SiteFooter';
import { SITE_NAME } from '../../../lib/site';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return artworks.map(work => ({ slug: work.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const work = artworkBySlug((await params).slug);
  if (!work) return {};
  const title = artworkTitle(work);
  const description = `${work.description} A painting by Melbourne artist ${SITE_NAME}.`;
  const url = artworkPath(work);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', locale: 'en_AU', siteName: SITE_NAME, url, title: `${title} — ${SITE_NAME}`, description },
    twitter: { card: 'summary_large_image', title: `${title} — ${SITE_NAME}`, description },
  };
}

const availabilityLabel = { available: 'Available', reserved: 'Reserved', sold: 'Sold' } as const;

export default async function WorkPage({ params }: Props) {
  const work = artworkBySlug((await params).slug);
  if (!work) notFound();
  const index = artworks.indexOf(work);
  const previous = artworks[(index - 1 + artworks.length) % artworks.length];
  const next = artworks[(index + 1) % artworks.length];
  // Next three works in catalogue order, wrapping around: stable internal links between every page.
  const related = [1, 2, 3].map(offset => artworks[(index + offset) % artworks.length]);
  const dimensions = artworkDimensions(work);
  const facts: [string, string][] = [
    ['Artist', SITE_NAME],
    ...(work.facts.medium ? [['Medium', work.facts.medium] as [string, string]] : []),
    ...(dimensions ? [['Dimensions', dimensions] as [string, string]] : []),
    ...(work.facts.year ? [['Year', work.facts.year] as [string, string]] : []),
    ...(work.facts.availability ? [['Availability', availabilityLabel[work.facts.availability]] as [string, string]] : []),
    ...(work.facts.price ? [['Price', work.facts.price] as [string, string]] : []),
  ];
  const unconfirmed = !work.facts.title || !work.facts.medium || !dimensions || !work.facts.availability || !work.facts.price;
  return (
    <div className="site work-page">
      <JsonLd data={visualArtworkJsonLd(work)} />
      <JsonLd data={breadcrumbJsonLd(work)} />
      <TrackArtworkView slug={work.slug} source="page" />
      <a className="skip-link" href="#main">Skip to the artwork</a>
      <SiteHeader />
      <main id="main">
        <article className="work-layout">
          <div className="work-photo-area">
            <div className="work-page-photo"><ArtworkImage work={work} preload sizes="(max-width: 700px) 100vw, 55vw" /></div>
          </div>
          <div className="work-info">
            <nav className="eyebrow breadcrumb" aria-label="Breadcrumb"><Link href="/">Harrison Ferraro</Link> / <Link href="/#collection">Works</Link> / <span aria-current="page">{work.number}</span></nav>
            <h1>{artworkTitle(work)}</h1>
            <p>{work.description}</p>
            <dl>{facts.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
            {unconfirmed && <p className="small-note">{work.facts.title ? '' : 'Descriptive working title. '}Please enquire for the confirmed details, price and availability.</p>}
            <a className="solid-action" href="#enquire">Enquire about the original <ArrowRight size={22} /></a>
            <PrintWaitlistForm work={work} />
            <nav className="work-pagination" aria-label="More works">
              <Link href={artworkPath(previous)} aria-label={`Previous work: ${artworkTitle(previous)}`}><ArrowLeft size={18} /> Previous</Link>
              <Link href="/#collection">All works</Link>
              <Link href={artworkPath(next)} aria-label={`Next work: ${artworkTitle(next)}`}>Next <ArrowRight size={18} /></Link>
            </nav>
          </div>
        </article>
        <section className="enquiry-content work-enquiry" id="enquire" aria-labelledby="enquire-title">
          <span className="eyebrow">A conversation about art</span>
          <h2 id="enquire-title">Enquire about {artworkTitle(work)}</h2>
          <p className="enquiry-notice">Send your enquiry below and Harrison will reply to you by email.</p>
          <EnquiryForm artworkId={work.id} />
        </section>
        <section className="collection-section more-works" aria-labelledby="more-works-title">
          <div className="section-heading"><div><span className="eyebrow">The collection</span><h2 id="more-works-title">More works.</h2></div><p><Link href="/#collection">See all {artworks.length} works</Link></p></div>
          <div className="collection-grid">
            {related.map(other => (
              <article className="collection-item" key={other.id}>
                <Link className="collection-image" href={artworkPath(other)} aria-label={`View artwork: ${artworkTitle(other)}`}><ArtworkImage work={other} sizes="(max-width: 700px) 90vw, 30vw" /><span className="view-art">View artwork <ArrowUpRight size={20} /></span></Link>
                <div className="collection-caption"><span>{other.number}</span><h3><Link href={artworkPath(other)}>{artworkTitle(other)}</Link></h3></div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
