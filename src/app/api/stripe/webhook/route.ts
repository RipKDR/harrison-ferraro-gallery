import type Stripe from 'stripe';
import { artworkBySlug } from '../../../../artworks';
import { emailConfig, headerSafe } from '../../../../lib/email';
import { paid, type Kind } from '../../../../lib/stock';
import { salesRecord, stripe } from '../../../../lib/stripe';

/**
 * Stripe webhook: tells the studio about each paid order (item, buyer, delivery address).
 * Register https://www.ferraro.studio/api/stripe/webhook in Stripe for checkout.session.completed,
 * checkout.session.async_payment_succeeded and checkout.session.async_payment_failed.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');
  if (!secret || !process.env.STRIPE_SECRET_KEY) return new Response('Webhook not configured', { status: 503 });
  if (!signature) return new Response('Missing signature', { status: 400 });

  let event: Stripe.Event;
  try {
    // The signature covers the exact raw body, so read text before any parsing.
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const paidNow =
    (event.type === 'checkout.session.completed' && session.payment_status === 'paid') ||
    event.type === 'checkout.session.async_payment_succeeded';
  const failed = event.type === 'checkout.session.async_payment_failed';
  // A completed but unpaid session (delayed payment method) is reported when it settles.
  if (!paidNow && !failed) return Response.json({ received: true });

  const slug = session.metadata?.slug ?? '';
  const kind = (session.metadata?.kind ?? '') as Kind;
  const work = artworkBySlug(slug);
  const item = work ? `${work.title}, ${kind === 'print' ? 'signed print' : 'original painting'}` : `Unknown item (${slug || 'no slug'})`;

  let warning = '';
  if (paidNow && kind === 'original') {
    try {
      const sales = paid(await salesRecord(), slug, 'original');
      warning = sales > 1
        ? `\n\nWARNING: this original now has ${sales} paid orders. Refund the later buyer in Stripe and tell them.`
        : `\n\nNext: set available: false for ${slug} in src/artworks.ts so the site shows it as sold.`;
    } catch (error) {
      console.error('Sales check failed', error instanceof Error ? error.message : error);
    }
  }

  const buyer = session.customer_details;
  const ship = session.collected_information?.shipping_details;
  const address = ship?.address
    ? [ship.name, ship.address.line1, ship.address.line2, `${ship.address.city ?? ''} ${ship.address.state ?? ''} ${ship.address.postal_code ?? ''}`.trim(), ship.address.country].filter(Boolean).join('\n')
    : 'Not supplied';
  const amount = session.amount_total != null ? `$${(session.amount_total / 100).toLocaleString('en-AU', { minimumFractionDigits: 2 })} ${session.currency?.toUpperCase()}` : 'Unknown';

  const config = emailConfig();
  if (!config) {
    // Stripe still holds the order; the dashboard and Stripe's own notification emails show it.
    console.error('Order email not sent: RESEND_API_KEY or ENQUIRY_TO_EMAIL is not configured.', session.id);
    return Response.json({ received: true });
  }
  const { error } = await config.resend.emails.send({
    from: config.from,
    to: config.to,
    ...(buyer?.email ? { replyTo: buyer.email } : {}),
    subject: headerSafe(`${failed ? 'Payment FAILED' : 'Paid order'}: ${item}`),
    text: `${failed ? 'A delayed payment failed. Nothing to send.' : 'New paid order on ferraro.studio. Delivery is free within Australia.'}\n\nItem: ${item}\nAmount: ${amount}\nBuyer: ${buyer?.name ?? 'Unknown'} <${buyer?.email ?? 'no email'}>\nPhone: ${buyer?.phone ?? 'Not supplied'}\n\nDeliver to:\n${address}\n\nStripe: https://dashboard.stripe.com/${session.livemode ? '' : 'test/'}checkout/sessions/${session.id}${warning}\n\nReply to this email to contact the buyer.`,
  });
  // Returning an error makes Stripe retry, so a transient email failure doesn't lose the notice.
  if (error) {
    console.error('Order email failed', error.name, error.message);
    return new Response('Notification failed', { status: 500 });
  }
  return Response.json({ received: true });
}
