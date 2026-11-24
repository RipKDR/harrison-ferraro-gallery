import type { Metadata } from 'next';
import Link from 'next/link';
import { artworkBySlug } from '../../artworks';
import { isCheckoutEnabled, stripe } from '../../lib/stripe';

export const metadata: Metadata = { title: 'Thank you', robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ session_id?: string | string[] }> };

/** Stripe returns the buyer here after payment. Only facts read back from Stripe are shown. */
export default async function ThanksPage({ searchParams }: Props) {
  const id = (await searchParams).session_id;
  let item = '';
  let email = '';
  let settled = false;
  if (typeof id === 'string' && /^cs_[A-Za-z0-9_]+$/.test(id) && isCheckoutEnabled()) {
    try {
      const session = await stripe().checkout.sessions.retrieve(id);
      const work = artworkBySlug(session.metadata?.slug ?? '');
      if (work) item = `${session.metadata?.kind === 'print' ? 'a signed print of ' : ''}${work.title}`;
      email = session.customer_details?.email ?? '';
      settled = session.payment_status === 'paid';
    } catch {
      // Unknown or expired id: fall through to the general message.
    }
  }
  return <section className="page-head">
    <h1>Thank you.</h1>
    {item
      ? <p>{settled ? 'Payment received for' : 'Your order for'} <strong>{item}</strong>{settled ? '.' : ' is placed; payment is still processing.'} Harrison will email you{email ? ` at ${email}` : ''} to arrange delivery.</p>
      : <p>If you completed a payment, Harrison will email you to arrange delivery.</p>}
    <Link className="text-link" href="/works">Back to the works</Link>
  </section>;
}
