'use client';
import { useActionState, useEffect, useId, useRef } from 'react';
import { joinPrintWaitlist } from '../app/actions';
import { type Artwork, artworkTitle } from '../artworks';
import { artworkProperties, trackEvent } from '../lib/analytics';
import { type FormState, HONEYPOT, STARTED_AT, type WaitlistValues } from '../lib/forms';

const initialState: FormState<WaitlistValues> = { status: 'idle' };

export function PrintWaitlistForm({ work }: { work: Artwork }) {
  const [state, action, pending] = useActionState(joinPrintWaitlist, initialState);
  const id = useId();
  const started = useRef<HTMLInputElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (started.current) started.current.value = String(Date.now()); }, [state.submission]);
  useEffect(() => { if (state.status !== 'idle') status.current?.focus(); }, [state]);
  useEffect(() => { if (state.status === 'success') trackEvent('print_waitlist_join', artworkProperties(work)); }, [state, work]);

  if (state.status === 'success') {
    return <div className="waitlist-form"><p className="waitlist-title" role="status" ref={status} tabIndex={-1}>You’re on the list for {artworkTitle(work)} prints.</p><p className="small-note">Harrison will email you when prints of this work are released.</p></div>;
  }
  return <form className="waitlist-form" action={action} key={state.submission ?? 'initial'} aria-labelledby={`${id}-title`}>
    <p className="waitlist-title" id={`${id}-title`}>Notify me when prints release</p>
    <div className="waitlist-row">
      <label className="visually-hidden" htmlFor={`${id}-email`}>Email address</label>
      <input id={`${id}-email`} name="email" type="email" required autoComplete="email" maxLength={254} placeholder="Email address" defaultValue={state.values?.email} aria-invalid={state.status === 'error' || undefined} aria-describedby={`${id}-note`} />
      <button type="submit" disabled={pending}>{pending ? 'Joining…' : 'Notify me'}</button>
    </div>
    <input type="hidden" name="artwork" value={work.id} />
    <input type="hidden" name={STARTED_AT} defaultValue="0" ref={started} />
    <div className="hp-field" aria-hidden="true"><label>Leave this empty<input name={HONEYPOT} tabIndex={-1} autoComplete="off" /></label></div>
    {state.status === 'error' && <p className="form-error" role="alert" ref={status} tabIndex={-1}>{state.message}</p>}
    <p className="small-note" id={`${id}-note`}>Prints are not on sale yet. Your address is used only for news about print releases.</p>
  </form>;
}
