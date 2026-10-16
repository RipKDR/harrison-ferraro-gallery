export const SITE_URL = 'https://www.ferraro.studio';
export const SITE_NAME = 'Harrison Ferraro';
export const SITE_TITLE = 'Harrison Ferraro — Figurative & Abstract Painter, Melbourne';
export const SITE_DESCRIPTION = 'Original figurative and abstract paintings by Melbourne artist Harrison Ferraro, with sizes and prices. Enquire about an original.';
/** Sitemap lastmod: bump when page content or the catalogue changes (not on every deploy). */
export const CONTENT_UPDATED = '2026-10-16';
export const INSTAGRAM_URL = 'https://www.instagram.com/harrison_ferraro/';
export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();
/** Authorised public address; shown only as a fallback when the website cannot send. */
export const FALLBACK_CONTACT_EMAIL = 'Harrisonferraro99@gmail.com';
