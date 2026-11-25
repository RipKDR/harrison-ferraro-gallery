'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { artworkBySlug, artworkPath, artworkSize, PRINT_EDITION, printCheckoutPrice } from '../artworks';
import { rateLimit } from '../lib/rate-limit';
import { absoluteUrl } from '../lib/site';
import { inStock, KINDS, type Kind } from '../lib/stock';
import { isCheckoutEnabled, salesRecord, stripe } from '../lib/stripe';

export type CheckoutState = { message?: string; submission?: number };

// Stripe's minimum lifetime is 30 minutes; a minute's margin keeps the request inside it.
const HOLD_SECONDS = 31 * 60;

/**
 * Starts a Stripe Checkout for one original or one signed print. The amount always comes from the
 * catalogue on the server, never from the form. An open checkout holds the item until it expires.
 */
export async function startCheckout(_previous: CheckoutState, data: FormData): Promise<CheckoutState> {
  const submission = Date.now();
  const work = artworkBySlug(String(data.get('slug') ?? ''));
  const kind = String(data.get('kind') ?? '') as Kind;
  if (!work || !KINDS.includes(kind)) return { message: 'That painting could not be found.', submission };
  if (!isCheckoutEnabled()) return { message: 'Online payment is not available right now. Please enquire instead.', submission };

  const amount = kind === 'original' ? (work.available ? work.price : null) : printCheckoutPrice(work);
  if (!amount) return { message: kind === 'original' ? 'This painting is sold.' : 'Prints can’t be bought online yet. Please enquire instead.', submission };

  const list = await headers();
  const ip = list.get('x-forwarded-for')?.split(',')[0]?.trim() || list.get('x-real-ip') || 'unknown';
  if (!rateLimit(`checkout:${ip}`, 10, 10 * 60_000)) return { message: 'Too many attempts. Please wait a few minutes and try again.', submission };
  // Return to the site the buyer came from (production, a Vercel preview or local dev); any other
  // Host header falls back to production, so a forged header cannot redirect the payer elsewhere.
  const host = list.get('x-forwarded-host') || list.get('host') || '';
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  const origin = local || /^(www\.)?ferraro\.studio$|^harrison-ferraro-gallery[a-z0-9-]*\.vercel\.app$/.test(host) ? `${local ? 'http' : 'https'}://${host}` : absoluteUrl('/');
  const back = (path: string) => new URL(path, origin).toString();

  let url: string | null;
  try {
    if (!inStock(await salesRecord(), work.slug, kind)) {
      return { message: kind === 'original' ? 'This painting has just been sold or is being bought right now.' : `All ${PRINT_EDITION} prints of this painting are sold or reserved.`, submission };
    }
    const metadata = { slug: work.slug, kind };
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'aud',
          unit_amount: amount * 100,
          product_data: {
            name: kind === 'original' ? `${work.title}, original painting` : `${work.title}, signed print (edition of ${PRINT_EDITION})`,
            description: kind === 'original' ? `${work.year}. ${work.medium}, ${artworkSize(work)}. Free delivery within Australia.` : 'Free delivery within Australia.',
            images: [absoluteUrl(work.src)],
          },
        },
      }],
      // Delivery is free and built into the price; Australia only until Harry adds countries.
      shipping_address_collection: { allowed_countries: ['AU'] },
      phone_number_collection: { enabled: true },
      custom_text: { submit: { message: `Free delivery within Australia. 14-day change-of-mind returns. [Terms of sale](${absoluteUrl('/terms')})` } },
      metadata,
      payment_intent_data: { metadata },
      expires_at: Math.floor(Date.now() / 1000) + HOLD_SECONDS,
      success_url: back('/thanks?session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: back(artworkPath(work)),
    });
    url = session.url;
  } catch (error) {
    console.error('Checkout could not start', error instanceof Error ? error.message : error);
    return { message: 'Payment could not be started. Please try again in a moment, or enquire instead.', submission };
  }
  if (!url) return { message: 'Payment could not be started. Please enquire instead.', submission };
  redirect(url);
}
