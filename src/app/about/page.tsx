import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { InstagramLink } from '../../components/InstagramLink';
import { JsonLd, personJsonLd, profilePageJsonLd } from '../../lib/jsonld';
import { SITE_NAME } from '../../lib/site';

const description = 'Harrison Ferraro paints people in unguarded moments, in acrylic, charcoal and pastel on canvas, in Melbourne. Artist statement and portrait.';

export const metadata: Metadata = {
  title: 'About the artist',
  description,
  alternates: { canonical: '/about' },
  openGraph: { type: 'profile', locale: 'en_AU', siteName: SITE_NAME, url: '/about', title: `About ${SITE_NAME}`, description },
  twitter: { card: 'summary_large_image', title: `About ${SITE_NAME}`, description },
};

// The statement is Harry's own, verbatim. Add biography here only once he confirms it.
export default function AboutPage() {
  return <>
    <JsonLd data={personJsonLd} />
    <JsonLd data={profilePageJsonLd} />
    <section className="about" aria-labelledby="about-title">
      <Image className="portrait" src="/art/harry-portrait-web.jpg" alt="Harrison Ferraro beside one of his paintings" width={1858} height={2308} loading="eager" fetchPriority="high" sizes="(max-width: 999px) 90vw, 460px" />
      <div className="about-text">
        <h1 id="about-title"><span className="kicker">Painter · Melbourne, Australia</span> Harrison Ferraro</h1>
        <p className="statement">I paint people in the moments they don’t perform: an exhale, a turned shoulder, smoke hanging in the air. I work in acrylic, charcoal and pastel on canvas, building the surface up and tearing it back until what’s left feels honest. The palette stays dark, with <span className="red">red</span> used only where it hurts. Every piece is an original, made in Melbourne.</p>
        <div className="about-links">
          <Link className="button" href="/contact">Enquire about a painting <ArrowRight size={20} /></Link>
          <Link className="text-link" href="/works">See the works <ArrowRight size={18} /></Link>
          <InstagramLink className="text-link" placement="about">Instagram <ArrowUpRight size={18} /></InstagramLink>
        </div>
      </div>
    </section>
  </>;
}
