# Off-site playbook — ferraro.studio (do not execute automatically)

Ordered steps with links and time estimates. Every item marked **[HARRY]** needs Harry's account, decision or fact.
Nothing here promises rankings, followers or sales. Off-site activity must follow the site's rules: one
enquiry invitation, no keyword stuffing, no fake facts, original photos only.

## 1. Google Search Console (P0, do first)

1. **Create the property** for `https://www.ferraro.studio` (URL-prefix, not Domain: the site is www-only). <https://search.google.com/search-console> — 5 min. **[HARRY: Google account]**
2. **Verify with the DNS TXT record** in Vercel → Project → Settings → Domains. The site already reads
   `GOOGLE_SITE_VERIFICATION` from the environment (`src/app/layout.tsx`), so an alternative is to paste the
   token into the Vercel env var `GOOGLE_SITE_VERIFICATION` and redeploy — no code change. DNS is cleaner. 10 min. **[HARRY: Vercel + DNS access]**
3. **Submit the sitemap**: Sitemap → `sitemap.xml` → enter `https://www.ferraro.studio/sitemap.xml`. It now
   carries `lastmod` and image entries, so image results can be picked up. 2 min.
4. **URL inspection → Request indexing** for the 3 featured works (highest-value pages):
   `https://www.ferraro.studio/works/over-the-shoulder`, `/works/figure-in-rose`, `/works/figure-with-a-skull`. 5 min.
5. **Fix what it reports first** (expect some). The old `/#collection` home anchor is gone; the collection is `/works`. Real issues are the ones the `npm run seo:check` gate lists. 20–60 min depending on count.
6. **Weekly habit (5 min/week)**: Performance → Core Web Vitals; Pages → the pages with impressions but no
   clicks. This is where to judge the loop's effect.

## 2. Bing Webmaster Tools (P0)

1. Import the site from Search Console or add manually: <https://www.bing.com/webmasters> — 5 min. **[HARRY]**
2. **Verify with the DNS TXT record** in Vercel, or paste the `msvalidate.01` token into the Vercel env var
   `BING_SITE_VERIFICATION` (already read by `src/app/layout.tsx`). 10 min. **[HARRY]**
3. **Sitemaps tab** → submit `https://www.ferraro.studio/sitemap.xml`. 2 min.
4. **IndexNow**: Bing's `IndexNow` protocol gets new/changed URLs indexed in minutes. 30–60 min. **[HARRY: decide whether to wire it into the Vercel deploy hook; a tiny no-dep endpoint is possible in `src/app/api/indexnow/route.ts`]**
5. **Bing Webmaster → Site Explorer / SEO report** quarterly. 15 min.

## 3. Image search (Google Images, Pinterest, Instagram)

1. **Verify Google images are eligible**: in Sitemap, the 12 artwork photos appear as `image:image` entries.
   The per-work pages have server-rendered `<img>` with descriptive alt text and WebP/AVIF sources. Confirm
   in Search Console → Sitemaps that no image errors are reported. 10 min. **[HARRY]**
2. **Per-image alt text already descriptive** (from `artworkAlt()` in `src/artworks.ts`). If Harry supplies the
   confirmed medium (e.g. "oil on linen"), the alt text and JSON-LD pick it up automatically. 0 min. **[HARRY: medium]**
3. **Pinterest Business account** (free): <https://business.pinterest.com> — 20 min to claim, 5 min/wk to pin. **[HARRY]**
   - Claim the website; set the profile to Melbourne, Australia.
   - Pin each of the 12 works (original photo, link to the work page, title = descriptive label, description =
     the work description + "original painting by Harrison Ferraro, Melbourne"). Pinterest is the strongest
     free image-search surface for art.
   - Add the website as a claim so pins deep-link to `ferraro.studio`.

## 4. Instagram (followers + qualified traffic)

1. **Bio link → `https://www.ferraro.studio/?utm_source=instagram&utm_medium=profile&utm_campaign=bio`** —
   2 min. The site does not UTM-tag its *outbound* links (those UTMs would do nothing); the UTM belongs on the
   inbound bio link, so PostHog attributes the traffic. Note: PostHog only loads when
   `NEXT_PUBLIC_POSTHOG_KEY` is set. **[HARRY: install the PostHog key in Vercel]**
2. **A link in a highlight** ("New work" or "Paintings") with the same UTM. 5 min.
3. **Cadence**: 1 post + 1 story set per week; **1 studio-news post per month** (see §7). Avoids a follower spike
   that then goes quiet. Never buy followers; never promise sales.
4. **Tags**: 5–8 specific, no 30-tag stuffing. Location tag: Melbourne.
5. **Profile photo and name**: keep "Harrison Ferraro" and "painter" in the name field so IG search finds it.

## 5. Backlinks and authority (P1)

| Target | Link | Time | Notes |
|---|---|---|---|
| Artsy (artist page) | <https://www.artsy.net/artist-signup> | 30 min | Strong art-search visibility. **[HARRY: bio, statement, availability]** |
| Saatchi Art | <https://saatchi.art/artist-signup> | 30 min | Marketplace; needs prices to sell, but the profile itself ranks. **[HARRY: price policy]** |
| Local galleries | — | 2–4 h total | Email Melbourne galleries asking to show the work; each is a real referring link. **[HARRY: which studios]** |
| Art prizes / open calls | <https://www.artscouncilcollective.com> (Aus) | 1 h to scout | Entry fees only; skip paid. **[HARRY: which entries]** |
| University / TAFE alumni | Harry's pages | 15 min | One-time, durable link. **[HARRY: URL]** |
| Local press | — | ongoing | Studio-news posts are the hook: "Melbourne painter Harrison Ferraro". **[HARRY: leads]** |

Rule: one page per listing, original photos, no invented exhibitions/awards/reviews. Every listing must match
the site's own claims exactly.

## 6. Google Business Profile — OPTIONAL, and only with Harry's consent

Only if Harry wants a public location (the site currently says "Melbourne, Australia" only, no address).
<https://www.google.com/business/> — 30–45 min. Requires a real, publicly-visible location or service area;
a virtual office is against policy. **Do not create one without an explicit decision** — a fabricated
location would violate the "never invent facts" rule and risks a suspension. **[HARRY: decision required]**

## 7. Studio-news cadence (1 per month)

- Cadence: the first week of each month, on the website (the studio-list form collects addresses) and one
  Instagram post. The site's footer already collects the list — new work is announced there first.
- **Post template** (plain, factual, no taglines, no invented facts):

```
Title: New work in the studio — [month] [year]

One or two new paintings are finished and photographed. [Title or descriptive label] (ref. No. NN) is
[medium if confirmed] measuring [dimensions if confirmed].

[Short paragraph on the work itself: what you were trying to do with the figure and the marks around it,
2–3 sentences, first person, factual.]

See it: https://www.ferraro.studio/works/<slug>
Interested in this or any painting? Enquire through the site; include your destination for packing and
delivery options.

Harrison Ferraro — Melbourne, Australia
```

- Rules: no claim of sales, awards, exhibition history or prices that are not confirmed; use the descriptive
  labels until Harry confirms titles; one artwork per post maximum.

## 8. Optional: AI answer engines

The site now serves `/llms.txt` (generated from the catalogue) and returns 200 to GPTBot, OAI-SearchBot,
ClaudeBot, PerplexityBot, Google-Extended, Bingbot, Applebot and CCBot. No action needed. If Harry wants
stronger presence in AI answers, the only real lever is public, factual, indexable text about the artist and
the work — i.e. the off-site listings above.

## Checklist of what needs Harry

- [HARRY] Google account + Search Console property creation
- [HARRY] Vercel/DNS access to add TXT records
- [HARRY] Bing Webmaster account
- [HARRY] `NEXT_PUBLIC_POSTHOG_KEY` installed in Vercel (analytics is a no-op without it)
- [HARRY] Instagram bio + highlight edits (2 taps once the UTM link is prepared)
- [HARRY] Pinterest Business account
- [HARRY] Artsy / Saatchi profiles: bio, statement, price policy
- [HARRY] Google Business Profile: an explicit yes/no on a public location
- [HARRY] Artwork facts that would lift conversion most (medium → dimensions → year → availability → price)
