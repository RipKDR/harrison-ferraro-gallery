'use client';
import { useActionState, type ReactNode } from 'react';
import { startCheckout, type CheckoutState } from '../app/checkout';
import type { Kind } from '../lib/stock';

type Props = { slug: string; kind: Kind; className: string; children: ReactNode };

/** The one red action when checkout is on: posts to a server action that redirects to Stripe. */
export function BuyForm({ slug, kind, className, children }: Props) {
  const [state, action, pending] = useActionState<CheckoutState, FormData>(startCheckout, {});
  return <form action={action} className="buy-form">
    <input type="hidden" name="slug" value={slug} />
    <input type="hidden" name="kind" value={kind} />
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending ? 'Opening secure checkout…' : children}
    </button>
    <p className="buy-status" role="status">{state.message ?? ''}</p>
  </form>;
}
