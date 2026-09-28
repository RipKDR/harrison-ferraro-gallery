'use server';
import { headers } from 'next/headers';
import { artworks, artworkTitle } from '../artworks';
import { emailConfig, headerSafe } from '../lib/email';
import { EMAIL_PATTERN, type EnquiryValues, type FormState, GENERAL, ELAPSED, HONEYPOT, INTERESTS, type StudioListValues } from '../lib/forms';
import { rateLimit } from '../lib/rate-limit';
import { absoluteUrl } from '../lib/site';

const MIN_FILL_MS = 2500;
const text = (data: FormData, key: string, max: number) => String(data.get(key) ?? '').trim().slice(0, max);

async function clientKey(scope: string) {
  const list = await headers();
  const ip = list.get('x-forwarded-for')?.split(',')[0]?.trim() || list.get('x-real-ip') || 'unknown';
  return `${scope}:${ip}`;
}

// Bots fill hidden fields or submit instantly; they get a quiet success and nothing is sent.
function looksAutomated(data: FormData) {
  if (text(data, HONEYPOT, 200)) return true;
  // Time since the page loaded, measured on the visitor's own clock: no clock skew, and a retry after
  // an error still counts the time already spent on the page. Absent (no JS) means no timing check.
  const raw = String(data.get(ELAPSED) ?? '');
  const elapsed = raw === '' ? NaN : Number(raw);
  return Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_FILL_MS;
}

const findArtwork = (id: string) => artworks.find(work => work.id === id);

export async function submitEnquiry(_previous: FormState<EnquiryValues>, data: FormData): Promise<FormState<EnquiryValues>> {
  const values: EnquiryValues = {
    interest: text(data, 'interest', 40),
    artwork: text(data, 'artwork', 20),
    name: text(data, 'name', 100),
    email: text(data, 'email', 254),
    country: text(data, 'country', 100),
    postcode: text(data, 'postcode', 20),
    message: text(data, 'message', 3000),
  };
  const submission = Date.now();
  if (looksAutomated(data)) return { status: 'success', submission };

  const fieldErrors: FormState<EnquiryValues>['fieldErrors'] = {};
  if (!INTERESTS.includes(values.interest as (typeof INTERESTS)[number])) fieldErrors.interest = 'Choose what you are interested in.';
  if (values.artwork !== GENERAL && !findArtwork(values.artwork)) fieldErrors.artwork = 'Choose an artwork.';
  if (!values.name) fieldErrors.name = 'Enter your name.';
  if (!EMAIL_PATTERN.test(values.email)) fieldErrors.email = 'Enter a valid email address.';
  if (values.message.length < 2) fieldErrors.message = 'Write a short message.';
  if (Object.keys(fieldErrors).length) return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors, values, submission };

  if (!rateLimit(await clientKey('enquiry'), 5, 10 * 60_000)) {
    return { status: 'error', message: 'Too many enquiries from this connection. Please wait a few minutes and try again.', values, submission };
  }

  const config = emailConfig();
  if (!config) {
    console.error('Enquiry not sent: RESEND_API_KEY or ENQUIRY_TO_EMAIL is not configured.');
    return { status: 'error', message: 'Enquiries cannot be sent from the website right now.', values, submission };
  }

  const work = findArtwork(values.artwork);
  const workLine = work ? `${artworkTitle(work)} (ref. ${work.number})\n${absoluteUrl(`/works/${work.slug}`)}` : 'General enquiry';
  const destination = [values.country, values.postcode].filter(Boolean).join(', ') || 'Not supplied';
  const { error } = await config.resend.emails.send({
    from: config.from,
    to: config.to,
    replyTo: values.email,
    subject: headerSafe(`${values.interest}: ${work ? artworkTitle(work) : 'general enquiry'} — from ${values.name}`),
    text: `New enquiry from ferraro.studio\n\nInterest: ${values.interest}\nWork: ${workLine}\nDestination: ${destination}\nFrom: ${values.name} <${values.email}>\n\n${values.message}\n\nReply to this email to respond directly.`,
  });
  if (error) {
    console.error('Enquiry email failed', error.name, error.message);
    return { status: 'error', message: 'Your enquiry could not be sent. Please try again in a moment.', values, submission };
  }
  // Receipt for the visitor, so they know it arrived. Fixed text only: echoing visitor-typed fields would let
  // anyone relay arbitrary content to any address through this form. Best effort: never fails the enquiry.
  const receipt = await config.resend.emails.send({
    from: config.from,
    to: values.email,
    replyTo: config.to,
    subject: headerSafe(`Your enquiry${work ? ` about ${artworkTitle(work)}` : ''}`),
    text: `Hello,\n\nThanks for getting in touch. Your enquiry reached Harrison and he will reply to this address.\n\n${work ? `${workLine}\n\n` : ''}If you didn't send this, you can ignore this email.\n\nHarrison Ferraro\n${absoluteUrl('/')}`,
  }).catch((e: Error) => ({ error: e }));
  if (receipt.error) console.warn('Enquiry receipt not sent', receipt.error.message);
  return { status: 'success', values: { email: values.email, interest: values.interest, artwork: values.artwork }, submission };
}

/**
 * General studio list (new work and studio news) for visitors not yet asking about a
 * specific painting. Harry is notified of each sign-up, and the
 * address joins RESEND_STUDIO_LIST_SEGMENT_ID when set so a broadcast (with unsubscribe) can be sent.
 */
export async function joinStudioList(_previous: FormState<StudioListValues>, data: FormData): Promise<FormState<StudioListValues>> {
  const values: StudioListValues = { email: text(data, 'email', 254) };
  const submission = Date.now();
  if (looksAutomated(data)) return { status: 'success', submission };
  if (!EMAIL_PATTERN.test(values.email)) return { status: 'error', message: 'Enter a valid email address.', fieldErrors: { email: 'Enter a valid email address.' }, values, submission };
  if (!rateLimit(await clientKey('studio-list'), 10, 10 * 60_000)) {
    return { status: 'error', message: 'Too many sign-ups from this connection. Please wait a few minutes and try again.', values, submission };
  }
  const config = emailConfig();
  if (!config) {
    console.error('Studio list sign-up not recorded: RESEND_API_KEY or ENQUIRY_TO_EMAIL is not configured.');
    return { status: 'error', message: 'Sign-ups are unavailable right now. Please try again later.', values, submission };
  }

  let segmentNote = 'No Resend segment configured (RESEND_STUDIO_LIST_SEGMENT_ID).';
  if (config.studioListSegmentId) {
    const { error } = await config.resend.contacts.create({ email: values.email, segments: [{ id: config.studioListSegmentId }] });
    segmentNote = error ? `Not added to the segment (${error.name}: ${error.message}).` : 'Added to the studio list segment.';
    if (error) console.warn('Studio list contact not created', error.name, error.message);
  }
  const { error } = await config.resend.emails.send({
    from: config.from,
    to: config.to,
    replyTo: values.email,
    subject: headerSafe(`Studio list: ${values.email}`),
    text: `New studio list sign-up on ferraro.studio\n\nEmail: ${values.email}\n\n${segmentNote}`,
  });
  if (error) {
    console.error('Studio list notification failed', error.name, error.message);
    return { status: 'error', message: 'Your sign-up could not be saved. Please try again in a moment.', values, submission };
  }
  return { status: 'success', values: { email: values.email }, submission };
}
