import type { Metadata } from 'next';
import Home from '../Home';
import { isEmailConfigured } from '../lib/email-status';
import { JsonLd, personJsonLd, websiteJsonLd } from '../lib/jsonld';

// Canonical lives here, not in the layout, so other routes never inherit the home URL.
export const metadata: Metadata = { alternates: { canonical: '/' } };

export default function Page() {
  return <>
    <JsonLd data={personJsonLd} />
    <JsonLd data={websiteJsonLd} />
    <Home emailEnabled={isEmailConfigured()} />
  </>;
}
