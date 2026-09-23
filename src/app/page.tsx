import Home from '../Home';
import { JsonLd, personJsonLd, websiteJsonLd } from '../lib/jsonld';

export default function Page() {
  return <>
    <JsonLd data={personJsonLd} />
    <JsonLd data={websiteJsonLd} />
    <Home />
  </>;
}
