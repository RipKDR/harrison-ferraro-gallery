import { artworkPath, artworks, artworkTitle } from '../../artworks';
import { absoluteUrl, INSTAGRAM_URL, SITE_DESCRIPTION, SITE_NAME } from '../../lib/site';

// llms.txt (llmstxt.org): a plain-text map of the site for AI answer engines, generated from the
// catalogue so it never drifts. Only facts already published on the site; unknown facts stay out.
export const dynamic = 'force-static';

export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Titles are descriptive working titles. Medium, dimensions, year, price and availability are given on request: enquire through the site.

## Works

${artworks.map(work => `- [${artworkTitle(work)}](${absoluteUrl(artworkPath(work))}): ${work.description}`).join('\n')}

## About

- [About the artist](${absoluteUrl('/about')}): artist statement and enquiries
- [Instagram](${INSTAGRAM_URL}): new paintings and studio news
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
