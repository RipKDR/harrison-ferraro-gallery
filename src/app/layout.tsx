import type { Metadata } from 'next';
import '@fontsource/bodoni-moda/900.css';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '../lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: '/',
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // Vercel Analytics only exists on Vercel deployments; elsewhere its script would 404.
  const vercelAnalytics = Boolean(process.env.VERCEL) && process.env.NEXT_PUBLIC_VERCEL_ANALYTICS !== 'off';
  return <html lang="en-AU"><body>{children}{vercelAnalytics && <Analytics />}</body></html>;
}
