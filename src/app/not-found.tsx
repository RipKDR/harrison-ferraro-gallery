import Link from 'next/link';

export default function NotFound() {
  return <section className="page-head">
    <h1>This page is not on the wall.</h1>
    <p>The link may be old or mistyped. Every painting is on the works page.</p>
    <Link className="text-link" href="/works">See the works</Link>
  </section>;
}
