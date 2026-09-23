'use client';
import { useActionState, useEffect, useRef } from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import { submitEnquiry } from '../app/actions';
import { artworks, artworkTitle } from '../artworks';
import { artworkProperties, trackEvent } from '../lib/analytics';
import { type EnquiryValues, type FormState, GENERAL, HONEYPOT, INTERESTS, type Interest, STARTED_AT } from '../lib/forms';
import { FALLBACK_CONTACT_EMAIL } from '../lib/site';

const initialState: FormState<EnquiryValues> = { status: 'idle' };

const defaultMessage = (interest: Interest) =>
  interest === 'General enquiry' ? "Hello Harrison, I'd like to get in touch about your work."
    : interest === 'Print interest' ? "I'd like to hear about print options for this work."
      : "I'd like to know more about this work, including its availability, price and dimensions.";

export function EnquiryForm({ interest = 'Original artwork', artworkId = GENERAL, headingId }: { interest?: Interest; artworkId?: string; headingId?: string }) {
  const [state, action, pending] = useActionState(submitEnquiry, initialState);
  const started = useRef<HTMLInputElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const thanks = useRef<HTMLHeadingElement>(null);
  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};
  const fieldError = (key: keyof EnquiryValues) => errors[key] ? { 'aria-invalid': true, 'aria-describedby': `enquiry-${key}-error` } : {};

  // Stamped in the browser (not during SSR) so the server can reject instant bot submissions.
  useEffect(() => { if (started.current) started.current.value = String(Date.now()); }, [state.submission]);
  useEffect(() => { (state.status === 'success' ? thanks : status).current?.focus(); }, [state]);
  useEffect(() => {
    if (state.status !== 'success') return;
    const work = artworks.find(item => item.id === state.values?.artwork);
    trackEvent('enquiry_submit', { interest: state.values?.interest ?? null, ...(work ? artworkProperties(work) : { artwork_id: 'general' }) });
  }, [state]);

  if (state.status === 'success') {
    return <div className="form-result" role="status">
      <h2 ref={thanks} tabIndex={-1} id={headingId}>Thank you.</h2>
      <p>Your enquiry has been sent to Harrison. {values.email ? <>He will reply to <strong>{values.email}</strong>.</> : null}</p>
    </div>;
  }

  return <form action={action} key={state.submission ?? 'initial'} aria-describedby="enquiry-privacy">
    <label>I’m interested in<select name="interest" defaultValue={values.interest ?? interest} {...fieldError('interest')}>{INTERESTS.map(option => <option key={option}>{option}</option>)}</select></label>
    <label>Artwork<select name="artwork" defaultValue={values.artwork ?? (interest === 'General enquiry' ? GENERAL : artworkId)} {...fieldError('artwork')}>{artworks.map(work => <option key={work.id} value={work.id}>{artworkTitle(work)} ({work.number})</option>)}<option value={GENERAL}>General enquiry</option></select></label>
    <div className="form-row">
      <label>Your name<input name="name" required autoComplete="name" maxLength={100} defaultValue={values.name} {...fieldError('name')} />{errors.name && <span className="field-error" id="enquiry-name-error">{errors.name}</span>}</label>
      <label>Email address<input name="email" type="email" required autoComplete="email" maxLength={254} defaultValue={values.email} {...fieldError('email')} />{errors.email && <span className="field-error" id="enquiry-email-error">{errors.email}</span>}</label>
    </div>
    <fieldset className="delivery-fields"><legend>Delivery destination (optional)</legend><p className="small-note">Helps Harrison prepare packing and delivery options with your quote.</p><div className="form-row"><label>Country<input name="country" autoComplete="country-name" maxLength={100} placeholder="e.g. Australia" defaultValue={values.country} /></label><label>Postcode<input name="postcode" autoComplete="postal-code" maxLength={20} placeholder="e.g. 3000" defaultValue={values.postcode} /></label></div></fieldset>
    <label>Your message<textarea name="message" required rows={4} maxLength={3000} defaultValue={values.message ?? defaultMessage(interest)} {...fieldError('message')} />{errors.message && <span className="field-error" id="enquiry-message-error">{errors.message}</span>}</label>
    <div className="hp-field" aria-hidden="true"><label>Leave this empty<input name={HONEYPOT} tabIndex={-1} autoComplete="off" /></label></div>
    <input type="hidden" name={STARTED_AT} defaultValue="0" ref={started} />
    {state.status === 'error' && <p className="form-error" role="alert" ref={status} tabIndex={-1}>{state.message} {!state.fieldErrors && <>You can also email <a href={`mailto:${FALLBACK_CONTACT_EMAIL}`}>{FALLBACK_CONTACT_EMAIL}</a>.</>}</p>}
    <p className="small-note" id="enquiry-privacy">Your details are sent to Harrison by email only to answer this enquiry.</p>
    <button className="line-action" type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send enquiry'} <ArrowRight size={22} /></button>
  </form>;
}
