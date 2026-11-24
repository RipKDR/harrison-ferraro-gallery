import type { Metadata } from 'next';
import { OpenFloor } from '../components/OpenFloor';
import { JsonLd, personJsonLd, websiteJsonLd } from '../lib/jsonld';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default function Page() {
  return <>
    <JsonLd data={personJsonLd} />
    <JsonLd data={websiteJsonLd} />
    <OpenFloor />
  </>;
}
