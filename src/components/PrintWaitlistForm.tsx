'use client';
import { useActionState, useEffect, useId, useRef } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { joinPrintWaitlist } from '../app/actions';
import { type Artwork, artworkTitle } from '../artworks';
import { artworkProperties, trackEvent } from '../lib/analytics';
import { ELAPSED, type FormState, HONEYPOT, type WaitlistValues } from '../lib/forms';
import { FALLBACK_CONTACT_EMAIL } from '../lib/site';

const initialState: FormState<WaitlistValues> = { status: 'idle' };

/** `emailEnabled` comes from the server; without Resend the visitor asks by email instead. */
export function PrintWaitlistForm({ work, emailEnabled }: { work: Artwork; emailEnabled: boolean }) {
  const [state, action, pending] = useActionState(joinPrintWaitlist, initialState);
  const id = useId();
  const elapsed = useRef<HTMLInputElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (state.status !== 'idle') status.current?.focus(); }, [state]);
  useEffect(() => { if (state.status === 'success') trackEvent('print_waitlist_join', { ...artworkProperties(work), method: 'email_service' }); }, [state, work]);

  if (!emailEnabled) {
    const title = artworkTitle(work);
    const href = `mailto:${FALLBACK_CONTACT_EMAIL}?subject=${encodeURIComponent(`Print waitlist: ${title} (${work.number})`)}&body=${encodeURIComponent(`Please let me know when prints of ${title} (ref. ${work.number}) are released.`)}`;
    return <div className="waitlist-form">
      <p className="waitlist-title">Notify me when prints release</p>
      <a className="waitlist-mailto" href={href} onClick={() => trackEvent('print_waitlist_join', { ...artworkProperties(work), method: 'mailto' })}>Ask by email <ArrowUpRight size={18} /></a>
      <p className="small-note">Prints are not on sale yet. This opens your email app with a short request to Harrison.</p>
    </div>;
  }

  if (state.status === 'success') {
    return <div className="waitlist-form"><p className="waitlist-title" role="status" ref={status} tabIndex={-1}>You’re on the list for {artworkTitle(work)} prints.</p><p className="small-note">Harrison will email you when prints of this work are released.</p></div>;
  }
  return <form className="waitlist-form" action={action} onSubmit={() => { if (elapsed.current) elapsed.current.value = String(Math.round(performance.now())); }} key={state.submission ?? 'initial'} aria-labelledby={`${id}-title`}>
    <p className="waitlist-title" id={`${id}-title`}>Notify me when prints release</p>
    <div className="waitlist-row">
      <label className="visually-hidden" htmlFor={`${id}-email`}>Email address</label>
      <input id={`${id}-email`} name="email" type="email" required autoComplete="email" maxLength={254} placeholder="Email address" defaultValue={state.values?.email} aria-invalid={state.status === 'error' || undefined} aria-describedby={`${id}-note`} />
      <button type="submit" disabled={pending}>{pending ? 'Joining…' : 'Notify me'}</button>
    </div>
    <input type="hidden" name="artwork" value={work.id} />
    <input type="hidden" name={ELAPSED} defaultValue="" ref={elapsed} />
    <div className="hp-field" aria-hidden="true"><label>Leave this empty<input name={HONEYPOT} tabIndex={-1} autoComplete="off" /></label></div>
    {state.status === 'error' && <p className="form-error" role="alert" ref={status} tabIndex={-1}>{state.message} {!state.fieldErrors && <>You can also email <a href={`mailto:${FALLBACK_CONTACT_EMAIL}`}>{FALLBACK_CONTACT_EMAIL}</a>.</>}</p>}
    <p className="small-note" id={`${id}-note`}>Prints are not on sale yet. Your address is used only for news about print releases.</p>
  </form>;
}
