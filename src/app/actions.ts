'use server';
import { headers } from 'next/headers';
import { artworks, artworkTitle } from '../artworks';
import { emailConfig, headerSafe } from '../lib/email';
import { EMAIL_PATTERN, type EnquiryValues, type FormState, GENERAL, HONEYPOT, INTERESTS, STARTED_AT } from '../lib/forms';
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
  const started = Number(data.get(STARTED_AT));
  return Number.isFinite(started) && started > 0 && Date.now() - started < MIN_FILL_MS;
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
  return { status: 'success', values: { email: values.email }, submission };
}
