import 'server-only';
import { Resend } from 'resend';

export const DEFAULT_FROM = 'Harrison Ferraro <hello@ferraro.studio>';

export function emailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO_EMAIL;
  if (!apiKey || !to) return null;
  return {
    resend: new Resend(apiKey),
    from: process.env.ENQUIRY_FROM_EMAIL || DEFAULT_FROM,
    to: to.split(',').map(address => address.trim()).filter(Boolean),
    printWaitlistSegmentId: process.env.RESEND_PRINT_WAITLIST_SEGMENT_ID || null,
    studioListSegmentId: process.env.RESEND_STUDIO_LIST_SEGMENT_ID || null,
  };
}

// Single-line header values: no CR/LF, bounded length.
export const headerSafe = (value: string, max = 120) => value.replace(/[\r\n]+/g, ' ').trim().slice(0, max);
