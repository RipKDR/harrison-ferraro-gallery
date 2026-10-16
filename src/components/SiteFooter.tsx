import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { InstagramLink } from './InstagramLink';
import { StudioListForm } from './StudioListForm';

export function SiteFooter({ emailEnabled }: { emailEnabled: boolean }) {
  return <footer className="site-footer">
    <StudioListForm emailEnabled={emailEnabled} />
    <div className="footer-base">
      <p>Harrison Ferraro · Melbourne, Australia</p>
      <nav aria-label="Footer">
        <Link href="/works">Works</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Enquire</Link>
        <InstagramLink placement="footer">Instagram <ArrowUpRight size={16} /></InstagramLink>
        <Link href="/privacy">Privacy</Link>
      </nav>
      <p>© {new Date().getFullYear()} Harrison Ferraro</p>
    </div>
  </footer>;
}
