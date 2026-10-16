'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [['/works', 'Works'], ['/about', 'About'], ['/contact', 'Enquire']] as const;

export function SiteHeader() {
  const path = usePathname();
  return <header className="site-header">
    <Link className="wordmark" href="/">Harrison <span>Ferraro</span></Link>
    <nav aria-label="Main">
      {links.map(([href, label]) => (
        <Link key={href} href={href} className={href === '/contact' ? 'nav-enquire' : undefined}
          aria-current={path === href ? 'page' : path.startsWith(`${href}/`) ? 'true' : undefined}>{label}</Link>
      ))}
    </nav>
  </header>;
}
