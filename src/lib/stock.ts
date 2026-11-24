/**
 * Stock rules for paid checkout. Stripe is the record of sale: every Checkout Session carries
 * `metadata.slug` and `metadata.kind`, and these functions count them. No database.
 */
export type Kind = 'original' | 'print';
export const KINDS: readonly Kind[] = ['original', 'print'];
/** Signed prints per painting. Kept here (not imported) so this module stays dependency-free for tests. */
export const EDITION_SIZE = 10;

export type SessionLike = {
  status: string | null;
  payment_status?: string | null;
  metadata?: Record<string, string> | null;
};

/** How many of this item are paid for, or held by a checkout that is still open. */
export function claimed(sessions: SessionLike[], slug: string, kind: Kind) {
  return sessions.filter(session =>
    session.metadata?.slug === slug &&
    session.metadata?.kind === kind &&
    (session.status === 'open' || (session.status === 'complete' && session.payment_status !== 'unpaid')),
  ).length;
}

export const limitFor = (kind: Kind) => (kind === 'original' ? 1 : EDITION_SIZE);

/** True while at least one unit is neither sold nor held by an open checkout. */
export const inStock = (sessions: SessionLike[], slug: string, kind: Kind) => claimed(sessions, slug, kind) < limitFor(kind);

/** Paid sales only (open checkouts excluded): used to flag a double-sold original after payment. */
export const paid = (sessions: SessionLike[], slug: string, kind: Kind) =>
  sessions.filter(s => s.metadata?.slug === slug && s.metadata?.kind === kind && s.status === 'complete' && s.payment_status === 'paid').length;
