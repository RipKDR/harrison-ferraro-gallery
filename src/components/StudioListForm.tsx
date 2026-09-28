'use client';
import { useActionState, useEffect, useId, useRef } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import { joinStudioList } from '../app/actions';
import { trackEvent } from '../lib/analytics';
import { ELAPSED, type FormState, HONEYPOT, type StudioListValues } from '../lib/forms';
import { FALLBACK_CONTACT_EMAIL } from '../lib/site';

const initialState: FormState<StudioListValues> = { status: 'idle' };

/**
 * General studio list shown above the footer on every page. `emailEnabled` comes from the server;
 * without Resend the visitor asks to be added by email instead.
 */
export function StudioListForm({ emailEnabled }: { emailEnabled: boolean }) {
  const [state, action, pending] = useActionState(joinStudioList, initialState);
  const id = useId();
  const elapsed = useRef<HTMLInputElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (state.status !== 'idle') status.current?.focus(); }, [state]);
  useEffect(() => { if (state.status === 'success') trackEvent('studio_list_join', { method: 'email_service' }); }, [state]);

  const heading = <div className="studio-list-copy">
    <span className="eyebrow">Stay in touch</span>
        <h2 id={`${id}-title`}>Studio updates</h2>
    <p>Occasional notes on new paintings and news from the studio.</p>
  </div>;

  if (!emailEnabled) {
    const href = `mailto:${FALLBACK_CONTACT_EMAIL}?subject=${encodeURIComponent('Studio list')}&body=${encodeURIComponent('Please add me to your studio list for new paintings and studio news.')}`;
    return <section className="studio-list" aria-labelledby={`${id}-title`}>
      {heading}
      <div className="studio-list-form">
        <a className="waitlist-mailto" href={href} onClick={() => trackEvent('studio_list_join', { method: 'mailto' })}>Join by email <ArrowUpRight size={18} /></a>
        <p className="small-note">This opens your email app with a short request to Harrison.</p>
      </div>
    </section>;
  }

  return <section className="studio-list" aria-labelledby={`${id}-title`}>
    {heading}
    {state.status === 'success'
      ? <div className="studio-list-form"><p className="waitlist-title" role="status" ref={status} tabIndex={-1}>You’re on the studio list.</p><p className="small-note">Harrison will email you about new paintings and studio news.</p></div>
      : <form className="studio-list-form" action={action} onSubmit={() => { if (elapsed.current) elapsed.current.value = String(Math.round(performance.now())); }} key={state.submission ?? 'initial'}>
        <div className="waitlist-row">
          <label className="visually-hidden" htmlFor={`${id}-email`}>Email address</label>
          <input id={`${id}-email`} name="email" type="email" required autoComplete="email" maxLength={254} placeholder="Email address" defaultValue={state.values?.email} aria-invalid={state.status === 'error' || undefined} aria-describedby={`${id}-note`} />
          <button type="submit" disabled={pending}>{pending ? 'Joining…' : 'Join'}</button>
        </div>
        <input type="hidden" name={ELAPSED} defaultValue="" ref={elapsed} />
        <div className="hp-field" aria-hidden="true"><label>Leave this empty<input name={HONEYPOT} tabIndex={-1} autoComplete="off" /></label></div>
        {state.status === 'error' && <p className="form-error" role="alert" ref={status} tabIndex={-1}>{state.message} {!state.fieldErrors && <>You can also email <a href={`mailto:${FALLBACK_CONTACT_EMAIL}`}>{FALLBACK_CONTACT_EMAIL}</a>.</>}</p>}
        <p className="small-note" id={`${id}-note`}>No spam. Your address is used only for studio news, and you can unsubscribe at any time.</p>
      </form>}
  </section>;
}
