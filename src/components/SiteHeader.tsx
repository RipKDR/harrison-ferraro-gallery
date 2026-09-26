import Link from 'next/link';
import { CompactHeader } from './CompactHeader';

// Masthead for standalone pages; the home page keeps its own panel-driven masthead.
export function SiteHeader() {
  return (<>
    <header className="masthead masthead-static">
      <Link className="wordmark" href="/" aria-label="Harrison Ferraro home">HARRISON<br />FERRARO</Link>
      <nav aria-label="Main navigation">
        <Link href="/#collection">Works</Link>
        <Link href="/about">About</Link>
        <Link className="nav-enquire" href="/about#enquire">Enquire</Link>
      </nav>
    </header>
    <CompactHeader>
      <Link className="compact-wordmark" href="/">HARRISON FERRARO</Link>
      <nav aria-label="Quick navigation">
        <Link href="/#collection">Works</Link>
        <Link href="/about">About</Link>
        <Link className="nav-enquire" href="/about#enquire">Enquire</Link>
      </nav>
    </CompactHeader>
  </>);
}
