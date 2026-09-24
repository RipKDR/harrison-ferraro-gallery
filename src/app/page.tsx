import Home from '../Home';
import { collectionJsonLd, JsonLd, personJsonLd, websiteJsonLd } from '../lib/jsonld';

export default function Page() {
  return <>
    <JsonLd data={personJsonLd} />
    <JsonLd data={websiteJsonLd} />
    <JsonLd data={collectionJsonLd} />
    <Home />
  </>;
}
