import { artworkPath, artworkPrice, artworks, artworkSize } from '../../artworks';
import { absoluteUrl, INSTAGRAM_URL, SITE_DESCRIPTION, SITE_NAME } from '../../lib/site';

// llms.txt (llmstxt.org): a plain-text map of the site for AI answer engines, generated from the
// catalogue so it never drifts. Only facts already published on the site.
export const dynamic = 'force-static';

export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

## Works

${artworks.map(work => `- [${work.title}](${absoluteUrl(artworkPath(work))}): ${work.description} ${work.medium}, ${artworkSize(work)}, ${work.year}. ${work.available ? `Available, ${artworkPrice(work)}.` : 'Sold.'}`).join('\n')}

## Pages

- [All works](${absoluteUrl('/works')}): every painting with size and price
- [About the artist](${absoluteUrl('/about')}): artist statement and portrait
- [Enquire](${absoluteUrl('/contact')}): ask about a painting or a delivery quote
- [Instagram](${INSTAGRAM_URL}): new paintings and studio news
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
