'use client';
import { useActionState, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react';
import { submitEnquiry } from '../app/actions';
import { artworkBySlug, artworkPath, artworks } from '../artworks';
import { artworkProperties, trackEvent } from '../lib/analytics';
import { ELAPSED, type EnquiryValues, type FormState, GENERAL, HONEYPOT, INTERESTS, type Interest } from '../lib/forms';
import { absoluteUrl, FALLBACK_CONTACT_EMAIL } from '../lib/site';

const initialState: FormState<EnquiryValues> = { status: 'idle' };

const defaultMessage = (interest: Interest) =>
  interest === 'General enquiry' ? "Hello Harrison, I'd like to get in touch about your work."
    : interest === 'Signed print' ? "Hello Harrison, I'm interested in a signed print of this painting."
    : "Hello Harrison, I'm interested in this painting.";

// Funnel: enquiry_view -> enquiry_submit -> enquiry_success | enquiry_error. The mailto path ends at submit
// (whether the visitor presses Send in their email app is unknowable). No personal data is sent.
const trackEnquiry = (event: 'enquiry_view' | 'enquiry_submit' | 'enquiry_success' | 'enquiry_error', interest: string | null, artworkId: string | undefined, method: 'email_service' | 'mailto', extra: Record<string, string> = {}) => {
  const work = artworkBySlug(artworkId ?? '');
  trackEvent(event, { interest, method, ...extra, ...(work ? artworkProperties(work) : { artwork_id: 'general' }) });
};

function mailtoFromForm(data: FormData) {
  const work = artworkBySlug(String(data.get('artwork')));
  const destination = [data.get('country'), data.get('postcode')].filter(Boolean).join(', ') || 'Not supplied';
  const body = `Interest: ${data.get('interest')}\nWork: ${work ? `${work.title}\n${absoluteUrl(artworkPath(work))}` : 'General enquiry'}\nDestination: ${destination}\nFrom: ${data.get('name')}\n\n${data.get('message')}`;
  const subject = `${data.get('interest')}: ${work ? work.title : 'general enquiry'}`;
  return `mailto:${FALLBACK_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * `emailEnabled` comes from the server (Resend configured). Without it the same form composes the
 * enquiry in the visitor's email app instead, so there is always a working way to get in touch.
 */
export function EnquiryForm({ interest = 'Original artwork', artworkId = GENERAL, emailEnabled }: { interest?: Interest; artworkId?: string; emailEnabled: boolean }) {
  const [state, action, pending] = useActionState(submitEnquiry, initialState);
  const [mailto, setMailto] = useState<string | null>(null);
  const [selection, setSelection] = useState({ interest, artwork: interest === 'General enquiry' ? GENERAL : artworkId });
  const elapsed = useRef<HTMLInputElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const thanks = useRef<HTMLHeadingElement>(null);
  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};
  // Once per error response, show what was submitted (also on a no-JS re-render); later picks stay.
  const [syncedAt, setSyncedAt] = useState<number>();
  if (state.status === 'error' && state.submission !== syncedAt) {
    setSyncedAt(state.submission);
    const submitted = INTERESTS.find(option => option === values.interest);
    if (submitted) setSelection({ interest: submitted, artwork: artworkBySlug(values.artwork ?? '')?.slug ?? GENERAL });
  }
  const fieldError = (key: keyof EnquiryValues) => errors[key] ? { 'aria-invalid': true, 'aria-describedby': `enquiry-${key}-error` } : {};
  const specificArtwork = interest !== 'General enquiry' && Boolean(artworkBySlug(artworkId));
  const selectedWork = selection.interest !== 'General enquiry' ? artworkBySlug(selection.artwork) : undefined;

  useEffect(() => { (state.status === 'success' || mailto ? thanks : status).current?.focus(); }, [state, mailto]);
  // Bot submissions get a quiet success without values: not counted.
  useEffect(() => {
    if (state.status === 'success' && state.values) trackEnquiry('enquiry_success', state.values.interest ?? null, state.values.artwork, 'email_service');
    if (state.status === 'error') trackEnquiry('enquiry_error', state.values?.interest ?? null, state.values?.artwork, 'email_service', { reason: state.fieldErrors ? 'validation' : 'send' });
  }, [state]);
  const form = useRef<HTMLFormElement>(null);
  const viewed = useRef(false);
  const method = emailEnabled ? 'email_service' : 'mailto';
  useEffect(() => {
    const el = form.current;
    if (!el || viewed.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); viewed.current = true; trackEnquiry('enquiry_view', interest, artworkId, method); } });
    observer.observe(el);
    return () => observer.disconnect();
  }, [interest, artworkId, method]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (emailEnabled) {
      // Runs before React builds the action's FormData.
      if (elapsed.current) elapsed.current.value = String(Math.round(performance.now()));
      const data = new FormData(event.currentTarget);
      trackEnquiry('enquiry_submit', String(data.get('interest')), String(data.get('artwork')), 'email_service');
      return;
    }
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const href = mailtoFromForm(data);
    trackEnquiry('enquiry_submit', String(data.get('interest')), String(data.get('artwork')), 'mailto');
    setMailto(href);
    window.location.href = href;
  }

  if (state.status === 'success') {
    return <div className="form-result" role="status">
      <h2 ref={thanks} tabIndex={-1}>Thank you.</h2>
      <p>Your enquiry has been sent to Harrison. {values.email ? <>He will reply to <strong>{values.email}</strong>.</> : null}</p>
    </div>;
  }

  if (mailto) {
    return <div className="form-result" role="status">
      <h2 ref={thanks} tabIndex={-1}>Almost there.</h2>
      <p>Your email app should now be open with the enquiry ready. Press <strong>Send</strong> there. Nothing has been sent yet.</p>
      <a className="button" href={mailto}>Open the email again <ArrowUpRight size={20} /></a>
      <p className="small-note">If no email app opens, write to <a href={`mailto:${FALLBACK_CONTACT_EMAIL}`}>{FALLBACK_CONTACT_EMAIL}</a>.</p>
      <button className="text-button" type="button" onClick={() => setMailto(null)}>Edit enquiry</button>
    </div>;
  }

  const options = <>
    <label>I’m interested in<select name="interest" value={selection.interest} onChange={event => setSelection(current => ({ ...current, interest: event.target.value as Interest }))} {...fieldError('interest')}>{INTERESTS.map(option => <option key={option}>{option}</option>)}</select>{errors.interest && <span className="field-error" id="enquiry-interest-error">{errors.interest}</span>}</label>
    <label>Artwork<select name="artwork" value={selection.artwork} onChange={event => setSelection(current => ({ ...current, artwork: event.target.value }))} {...fieldError('artwork')}>{artworks.map(work => <option key={work.slug} value={work.slug}>{work.title}</option>)}<option value={GENERAL}>General enquiry</option></select>{errors.artwork && <span className="field-error" id="enquiry-artwork-error">{errors.artwork}</span>}</label>
  </>;

  return <form ref={form} action={action} onSubmit={onSubmit} key={state.submission ?? 'initial'} aria-describedby="enquiry-privacy">
    {specificArtwork && selectedWork && <p className="enquiry-for">Enquiring about <strong>{selectedWork.title}</strong></p>}
    {specificArtwork ? <details className="enquiry-options" open={Boolean(errors.interest || errors.artwork) || undefined}><summary>Change painting or enquiry type</summary><div>{options}</div></details> : options}
    <div className="form-row">
      <label>Your name<input name="name" required autoComplete="name" maxLength={100} defaultValue={values.name} {...fieldError('name')} />{errors.name && <span className="field-error" id="enquiry-name-error">{errors.name}</span>}</label>
      {emailEnabled && <label>Email address<input name="email" type="email" required autoComplete="email" maxLength={254} defaultValue={values.email} {...fieldError('email')} />{errors.email && <span className="field-error" id="enquiry-email-error">{errors.email}</span>}</label>}
    </div>
    <details className="delivery-options" open={Boolean(values.country || values.postcode) || undefined}><summary>Add a delivery destination (optional)</summary><fieldset className="delivery-fields"><legend>Delivery destination</legend><p className="small-note">Helps Harrison prepare packing and delivery options with your quote.</p><div className="form-row"><label>Country<input name="country" autoComplete="country-name" maxLength={100} placeholder="e.g. Australia" defaultValue={values.country} /></label><label>Postcode<input name="postcode" autoComplete="postal-code" maxLength={20} placeholder="e.g. 3000" defaultValue={values.postcode} /></label></div></fieldset></details>
    <label>Your message<textarea name="message" required rows={4} maxLength={3000} defaultValue={values.message ?? defaultMessage(interest)} {...fieldError('message')} />{errors.message && <span className="field-error" id="enquiry-message-error">{errors.message}</span>}</label>
    <div className="hp-field" aria-hidden="true"><label>Leave this empty<input name={HONEYPOT} tabIndex={-1} autoComplete="off" /></label></div>
    <input type="hidden" name={ELAPSED} defaultValue="" ref={elapsed} />
    {state.status === 'error' && <p className="form-error" role="alert" ref={status} tabIndex={-1}>{state.message} {!state.fieldErrors && <>You can also email <a href={`mailto:${FALLBACK_CONTACT_EMAIL}`}>{FALLBACK_CONTACT_EMAIL}</a>.</>}</p>}
    <p className="small-note" id="enquiry-privacy">{emailEnabled ? 'Your details are sent to Harrison by email only to answer this enquiry.' : 'This opens your email app with the enquiry written out, ready to send to Harrison.'}</p>
    <button className="button" type="submit" disabled={pending}>{pending ? 'Sending…' : emailEnabled ? 'Send enquiry' : 'Write the email'} <ArrowRight size={20} /></button>
  </form>;
}
