import type { Metadata } from 'next';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { Suspense } from 'react';
import { ContactEnquiry } from '../../components/ContactEnquiry';
import { EnquiryForm } from '../../components/EnquiryForm';
import { InstagramLink } from '../../components/InstagramLink';
import { isEmailConfigured } from '../../lib/email-status';
import { contactPageJsonLd, JsonLd } from '../../lib/jsonld';
import { SITE_NAME } from '../../lib/site';

const description = 'Enquire about an original painting by Harrison Ferraro: ask about a work, its price or a delivery quote, or anything else.';

export const metadata: Metadata = {
  title: 'Enquire about a painting',
  description,
  alternates: { canonical: '/contact' },
  openGraph: { type: 'website', locale: 'en_AU', siteName: SITE_NAME, url: '/contact', title: `Enquire — ${SITE_NAME}`, description },
  twitter: { card: 'summary_large_image', title: `Enquire — ${SITE_NAME}`, description },
};

export default function ContactPage() {
  return <section className="enquire contact" aria-labelledby="enquire-title">
    <JsonLd data={contactPageJsonLd} />
    <div className="enquire-head">
      <h1 id="enquire-title">Enquire</h1>
      <p>Ask about a painting, a delivery quote, or anything else. Choose a painting below, or leave it as a general enquiry.</p>
      <p><InstagramLink className="text-link" placement="enquiry">Or find Harrison on Instagram <ArrowUpRight size={18} /></InstagramLink></p>
    </div>
    <Suspense fallback={<EnquiryForm interest="General enquiry" emailEnabled={isEmailConfigured()} />}><ContactEnquiry emailEnabled={isEmailConfigured()} /></Suspense>
  </section>;
}
