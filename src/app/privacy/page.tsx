import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME } from '../../lib/site';

const description = 'What this site collects when you enquire, join the studio list or browse, including Microsoft Clarity session replay, and your choices.';

export const metadata: Metadata = {
  title: 'Privacy',
  description,
  alternates: { canonical: '/privacy' },
  openGraph: { type: 'website', locale: 'en_AU', siteName: SITE_NAME, url: '/privacy', title: `Privacy — ${SITE_NAME}`, description },
  twitter: { card: 'summary_large_image', title: `Privacy — ${SITE_NAME}`, description },
};

// Keep in step with the code: layout.tsx (Clarity, Vercel), instrumentation-client.ts (PostHog), actions.ts (Resend).
export default function PrivacyPage() {
  return <article className="prose">
    <h1>Privacy</h1>
    <p>Last updated 16 October 2026.</p>
    <h2>Enquiries and the studio list</h2>
    <p>When you send an enquiry, your name, email address, message and any delivery destination you add are emailed to Harrison through Resend, an email delivery service, so he can reply. If you join the studio list, your email address is emailed to Harrison the same way so he can tell you when new paintings are finished. It is not added to a mailing list automatically. You can unsubscribe at any time: reply to any studio email or <Link href="/contact">send an enquiry</Link>.</p>
    <h2>Analytics</h2>
    <p>This site uses Vercel Web Analytics and Speed Insights to count page views and measure loading speed. They do not use cookies. When enabled, PostHog records which pages and paintings are viewed and may set a first-party cookie.</p>
    <h2>Microsoft Clarity</h2>
    <p>This site uses Microsoft Clarity to understand how visitors use it, through behavioural metrics, heatmaps and session replay. Clarity records interactions such as clicks, scrolling and mouse movement, and uses first- and third-party cookies. For how Microsoft collects and uses this data, see the <a href="https://privacy.microsoft.com/privacystatement" rel="noopener noreferrer" target="_blank">Microsoft Privacy Statement</a>.</p>
    <h2>Your choices</h2>
    <p>You can block or delete cookies in your browser settings; the site works without them. For questions about your information, <Link href="/contact">send an enquiry</Link>.</p>
  </article>;
}
