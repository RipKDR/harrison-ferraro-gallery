export const INTERESTS = ['Original artwork', 'Print interest', 'General enquiry'] as const;
export type Interest = (typeof INTERESTS)[number];
export const GENERAL = 'general';

export type EnquiryValues = { interest: string; artwork: string; name: string; email: string; country: string; postcode: string; message: string };
export type FormState<V = Record<string, string>> = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Partial<Record<keyof V, string>>;
  values?: Partial<V>;
  /** Changes on every response so the form can remount with returned values. */
  submission?: number;
};

// Deliberately not a name browsers autofill (e.g. "website", "url").
export const HONEYPOT = 'hp_reference_code';
/** Milliseconds since page load at submit (performance.now), so no clock comparison is needed. */
export const ELAPSED = 'elapsed_ms';
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type WaitlistValues = { email: string; artwork: string };
