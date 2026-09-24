import Link from 'next/link';
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr';
import { isEmailConfigured } from '../lib/email-status';
import { INSTAGRAM_URL } from '../lib/site';
import { StudioListForm } from './StudioListForm';

export function SiteFooter() {
  return (<>
    <StudioListForm emailEnabled={isEmailConfigured()} />
    <footer className="site-footer">
      <span>HARRISON FERRARO</span>
      <Link href="/#collection">Works</Link>
      <Link href="/#prints">Prints</Link>
      <Link href="/about">About</Link>
      <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer me">Instagram <ArrowUpRight size={16} /></a>
      <p>© {new Date().getFullYear()} Harrison Ferraro · Original artwork enquiries welcome. Prints in preparation.</p>
    </footer>
  </>);
}
