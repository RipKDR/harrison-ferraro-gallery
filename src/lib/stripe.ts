import 'server-only';
import Stripe from 'stripe';
import type { SessionLike } from './stock';

/** Whether paid checkout is switched on. Read at render time by server pages; no key means enquiry-only. */
export const isCheckoutEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);

let client: Stripe | null = null;
export function stripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured.');
  return (client ??= new Stripe(key));
}

/**
 * Every completed checkout plus any still open (an open one holds stock until it expires, at most
 * 24 h). ponytail: lists the whole sales history on each call; fine for a studio's volume, move
 * to a store or Stripe Search once completed sessions run into the thousands.
 */
export async function salesRecord(): Promise<SessionLike[]> {
  const sessions = stripe().checkout.sessions;
  const dayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
  const [complete, open] = await Promise.all([
    sessions.list({ status: 'complete', limit: 100 }).autoPagingToArray({ limit: 10_000 }),
    sessions.list({ status: 'open', created: { gte: dayAgo }, limit: 100 }).autoPagingToArray({ limit: 10_000 }),
  ]);
  return [...complete, ...open];
}
