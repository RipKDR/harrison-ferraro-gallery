import 'server-only';

/** Whether website email (Resend) is configured. Read at render time by server pages. */
export const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.ENQUIRY_TO_EMAIL);
