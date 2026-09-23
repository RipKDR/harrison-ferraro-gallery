import type { Metadata } from 'next';
import '@fontsource/bodoni-moda/900.css';
import './globals.css';
import { SITE_DESCRIPTION, SITE_TITLE } from '../lib/site';

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en-AU"><body>{children}</body></html>;
}
