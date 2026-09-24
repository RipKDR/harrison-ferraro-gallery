import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';

export default function NotFound() {
  return (
    <div className="site">
      <SiteHeader />
      <main id="main" className="about-content not-found-content">
        <span className="eyebrow">404</span>
        <h1>This page is not on the wall.</h1>
        <p>The link may be old or mistyped. The full collection is a click away.</p>
        <Link className="solid-action" href="/#collection">Browse all works <ArrowRight size={22} /></Link>
        <Link className="line-action" href="/about">About the artist <ArrowRight size={22} /></Link>
      </main>
      <SiteFooter />
    </div>
  );
}
