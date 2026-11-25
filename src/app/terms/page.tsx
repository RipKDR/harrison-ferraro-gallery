import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME } from '../../lib/site';

const description = 'Terms of sale for original paintings and prints bought on ferraro.studio: payment, delivery within Australia, returns and refunds.';

export const metadata: Metadata = {
  title: 'Terms of sale',
  description,
  alternates: { canonical: '/terms' },
  openGraph: { type: 'website', locale: 'en_AU', siteName: SITE_NAME, url: '/terms', title: `Terms of sale — ${SITE_NAME}`, description },
  twitter: { card: 'summary_large_image', title: `Terms of sale — ${SITE_NAME}`, description },
};

// Keep in step with checkout.ts (AUD, Australia-only free delivery, hold time) and the order webhook.
export default function TermsPage() {
  return <article className="prose">
    <h1>Terms of sale</h1>
    <p>Last updated 25 November 2026.</p>
    <h2>Buying</h2>
    <p>Prices are in Australian dollars and include delivery within Australia. No GST is added. You pay on a checkout page run by Stripe; your order is confirmed once payment is received, and Stripe emails you a receipt.</p>
    <p>Each original painting is one of a kind and sells once. While someone is paying, the painting is held for up to 31 minutes. If a painting is ever paid for twice, the later buyer is refunded in full.</p>
    <h2>Delivery</h2>
    <p>Delivery is free and available to Australian addresses only. After you pay, Harrison emails you to arrange delivery. Paintings are packed to protect the surface and sent with tracking.</p>
    <h2>Change of mind</h2>
    <p>If you change your mind, tell Harrison within 14 days of delivery and return the work in the condition it arrived. You pay the return postage. Your refund is paid to your original payment method within 5 business days of the work coming back.</p>
    <h2>Damage in transit</h2>
    <p>If a work arrives damaged, <Link href="/contact">tell Harrison</Link> within 48 hours with photos of the work and the packaging. He will arrange its return at his cost and refund you in full.</p>
    <h2>Your rights</h2>
    <p>Nothing in these terms limits your rights under the Australian Consumer Law. Our goods come with guarantees that cannot be excluded under it.</p>
    <h2>Questions</h2>
    <p>For anything about an order, <Link href="/contact">send an enquiry</Link> or reply to your order email. How your details are handled is set out in the <Link href="/privacy">privacy notice</Link>.</p>
  </article>;
}
