export const SITE_URL = 'https://www.ferraro.studio';
export const SITE_NAME = 'Harrison Ferraro';
export const SITE_TITLE = 'Harrison Ferraro — Figurative & Abstract Painter, Melbourne';
export const SITE_DESCRIPTION = 'Original figurative and abstract paintings by Melbourne artist Harrison Ferraro. Step inside the gallery, explore the collection and enquire about an original.';
export const INSTAGRAM_URL = 'https://www.instagram.com/harrison_ferraro/';
export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();
/** Authorised public address; shown only as a fallback when the website cannot send. */
export const FALLBACK_CONTACT_EMAIL = 'Harrisonferraro99@gmail.com';
