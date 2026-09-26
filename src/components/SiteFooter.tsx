import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { InstagramLink } from './InstagramLink';
import { StudioListForm } from './StudioListForm';

export function SiteFooter({ emailEnabled }: { emailEnabled: boolean }) {
  return (<>
    <section className="footer-invitation" aria-labelledby="footer-invitation-title">
      <div>
        <span className="eyebrow">Original paintings. Direct conversation.</span>
        <h2 id="footer-invitation-title">A painting starts<br /><em>a conversation.</em></h2>
      </div>
      <Link className="solid-action" href="/about#enquire">Get in touch <ArrowUpRight size={22} /></Link>
    </section>
    <StudioListForm emailEnabled={emailEnabled} />
    <footer className="site-footer">
      <div className="footer-meta"><span>Harrison Ferraro</span><span>Melbourne, Australia</span></div>
      <nav className="footer-links" aria-label="Footer navigation">
        <Link href="/#collection">Works</Link>
        <Link href="/about">About</Link>
        <Link href="/about#enquire">Enquire</Link>
        <InstagramLink placement="footer">Instagram <ArrowUpRight size={16} /></InstagramLink>
      </nav>
      <div className="footer-wordmark" aria-hidden="true">FERRARO</div>
      <p>© {new Date().getFullYear()} Harrison Ferraro. All rights reserved.</p>
    </footer>
  </>);
}
