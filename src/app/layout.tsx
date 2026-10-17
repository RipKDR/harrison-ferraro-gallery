import type { Metadata, Viewport } from 'next';
import { Schibsted_Grotesk } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ProtectArt } from '../components/ProtectArt';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { isEmailConfigured } from '../lib/email-status';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '../lib/site';

const sans = Schibsted_Grotesk({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  // Search Console / Bing Webmaster ownership tags, set in Vercel env when DNS verification isn't used.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || 'A9bsDN92kBX3xsKFXGWv-MQggRB5uglrp66YrVjuNeM',
    ...(process.env.BING_SITE_VERIFICATION && { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } }),
  },
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

export const viewport: Viewport = { themeColor: '#0f0e0d', colorScheme: 'dark', viewportFit: 'cover' };

export default function Layout({ children }: { children: React.ReactNode }) {
  // Vercel Analytics only exists on Vercel deployments; elsewhere its script would 404.
  const vercelAnalytics = Boolean(process.env.VERCEL) && process.env.NEXT_PUBLIC_VERCEL_ANALYTICS !== 'off';
  return <html lang="en-AU" className={sans.variable} data-scroll-behavior="smooth"><body>
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader />
    <main id="main">{children}</main>
    <SiteFooter emailEnabled={isEmailConfigured()} />
    <ProtectArt />
    {vercelAnalytics && <><Analytics /><SpeedInsights /></>}
    {/* Session replay and heatmaps, disclosed on /privacy. Loads after the page so it never delays the paintings. */}
    <Script id="microsoft-clarity" strategy="lazyOnload">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i+"?ref=bwt";y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "ypc3nxsht5");`}</Script>
  </body></html>;
}
