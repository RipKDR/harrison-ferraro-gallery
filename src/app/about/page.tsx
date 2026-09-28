import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { artworkPath, artworks, featuredArtworks, artworkTitle } from '../../artworks';
import { ArtworkImage } from '../../ArtworkImage';
import { EnquiryForm } from '../../components/EnquiryForm';
import { InstagramLink } from '../../components/InstagramLink';
import { SiteFooter } from '../../components/SiteFooter';
import { SiteHeader } from '../../components/SiteHeader';
import { isEmailConfigured } from '../../lib/email-status';
import { JsonLd, personJsonLd, profilePageJsonLd } from '../../lib/jsonld';
import { SITE_NAME } from '../../lib/site';

const description = 'Harrison Ferraro is a Melbourne painter working between dark figurative painting and abstraction. Artist statement, selected works and enquiries.';

export const metadata: Metadata = {
  title: 'About the artist',
  description,
  alternates: { canonical: '/about' },
  openGraph: { type: 'profile', locale: 'en_AU', siteName: SITE_NAME, url: '/about', title: `About ${SITE_NAME}`, description },
  twitter: { card: 'summary_large_image', title: `About ${SITE_NAME}`, description },
};

// Copy is the existing artist statement (an editable draft); add confirmed biography facts here only.
export default function AboutPage() {
  const emailEnabled = isEmailConfigured();
  return (
    <div className="site about-page">
      <JsonLd data={personJsonLd} />
      <JsonLd data={profilePageJsonLd} />
      <a className="skip-link" href="#main">Skip to the content</a>
      <SiteHeader />
      <main id="main">
        <section className="about-hero" aria-labelledby="about-title">
          <figure className="about-hero-art">
            <Link href={artworkPath(featuredArtworks[0])} aria-label={`View artwork: ${artworkTitle(featuredArtworks[0])}`}>
              <ArtworkImage work={featuredArtworks[0]} preload sizes="(max-width: 700px) 85vw, 40vw" />
            </Link>
            <figcaption><span>No. {featuredArtworks[0].number}</span><span>{artworkTitle(featuredArtworks[0])}</span></figcaption>
          </figure>
          <article className="about-content about-page-content">
            <span className="eyebrow">The artist · Melbourne, Australia</span>
            <h1 id="about-title">Harrison<br /><em>Ferraro</em></h1>
            <p className="large-copy">Between the figure<br />and the feeling.</p>
            <p>My work moves between dark figurative painting and abstraction. I am drawn to the tension between a recognisable face and the marks that surround it: layered surfaces, shifting light and gestures that carry a feeling beyond the figure.</p>
            <p>For original paintings or a conversation about the work, get in touch directly.</p>
            <div className="about-actions">
              <a className="line-action" href="#enquire">Start a conversation <ArrowRight size={22} /></a>
              <InstagramLink className="contact-link" placement="about">Follow on Instagram <ArrowUpRight size={18} /></InstagramLink>
            </div>
          </article>
        </section>
        <section className="collection-section about-works" aria-labelledby="about-works-title">
          <div className="section-heading"><div><span className="eyebrow">Selected works</span><h2 id="about-works-title">From the studio.</h2></div><p><Link href="/#collection">See all works</Link></p></div>
          <div className="collection-grid">
            {artworks.slice(3, 6).map(work => (
              <article className="collection-item" key={work.id}>
                <Link className="collection-image" href={artworkPath(work)} aria-label={`View artwork: ${artworkTitle(work)}`}><ArtworkImage work={work} sizes="(max-width: 700px) 45vw, 30vw" /><span className="view-art">View artwork <ArrowUpRight size={20} /></span></Link>
                <div className="collection-caption"><h3><Link href={artworkPath(work)}>{artworkTitle(work)}</Link></h3></div>
              </article>
            ))}
          </div>
        </section>
        <section className="enquiry-content work-enquiry" id="enquire" aria-labelledby="enquire-title">
          <span className="eyebrow">A conversation about art</span>
          <h2 id="enquire-title">Start a conversation</h2>
          <p className="enquiry-notice">{emailEnabled ? 'Send your enquiry below and Harrison will reply to you by email.' : 'Write your enquiry below and it opens, ready to send, in your email app.'}</p>
          <EnquiryForm interest="General enquiry" emailEnabled={emailEnabled} />
        </section>
      </main>
      <SiteFooter emailEnabled={emailEnabled} />
    </div>
  );
}
