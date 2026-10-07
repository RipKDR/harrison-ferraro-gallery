import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { artworkPath, artworkTitle, featuredArtworks } from '../artworks';
import { ArtworkImage } from '../ArtworkImage';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { isEmailConfigured } from '../lib/email-status';

export const metadata: Metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="site">
      <SiteHeader />
      <main id="main">
        <div className="about-content not-found-content">
          <span className="eyebrow">404</span>
          <h1>This page is not on the wall.</h1>
          <p>The link may be old or mistyped. The full collection is a click away.</p>
          <Link className="solid-action" href="/#collection">Browse all works <ArrowRight size={22} /></Link>
          <Link className="line-action" href="/about">About the artist <ArrowRight size={22} /></Link>
        </div>
        {/* Same card markup as the about page: a gallery 404 still shows paintings. */}
        <section className="collection-section about-works" aria-labelledby="not-found-works-title">
          <div className="section-heading"><div><span className="eyebrow">The collection</span><h2 id="not-found-works-title">Featured works.</h2></div></div>
          <div className="collection-grid">
            {featuredArtworks.map(work => (
              <article className="collection-item" key={work.id}>
                <Link className="collection-image" href={artworkPath(work)} aria-label={`View artwork: ${artworkTitle(work)}`}><ArtworkImage work={work} sizes="(max-width: 700px) 45vw, 30vw" /><span className="view-art">View artwork <ArrowUpRight size={20} /></span></Link>
                <div className="collection-caption"><h3><Link href={artworkPath(work)}>{artworkTitle(work)}</Link></h3></div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter emailEnabled={isEmailConfigured()} />
    </div>
  );
}
