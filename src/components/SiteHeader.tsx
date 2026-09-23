import Link from 'next/link';

// Masthead for standalone pages; the home page keeps its own panel-driven masthead.
export function SiteHeader() {
  return (
    <header className="masthead masthead-static">
      <Link className="wordmark" href="/" aria-label="Harrison Ferraro home">HARRISON<br />FERRARO</Link>
      <nav aria-label="Main navigation">
        <Link href="/#collection">Works</Link>
        <Link href="/#prints">Prints</Link>
        <Link href="/#about">About</Link>
      </nav>
    </header>
  );
}
