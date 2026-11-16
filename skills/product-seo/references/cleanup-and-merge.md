# Cleanup and merging

Contents:
- When this play applies
- Build the table
- Decide for each page
- Rules that came from mistakes
- Order of a merge
- Measure
- Common mistakes

## When this play applies

- Several of the site's pages show for the same query and none ranks well. `scripts/opportunities.mjs` lists these under "Competing pages", with each page's share of impressions and its position.
- The site has many thin pages on topics far from the product. They bring nothing and blur what the site is about.

Check for duplicates before writing any new page. If three old pages already sit at positions 20–50 for the query, merge them into one strong page. A fourth page will not help.

## Build the table

One row per page under review:

| Column | Where it comes from |
|---|---|
| URL, title, publish date, word count | The site |
| Clicks, impressions, average position, last 90 days | Search Console |
| Top five queries with position | Search Console, filtered by page |
| Index status | Search Console, URL inspection |
| Clicks and impressions in Bing | Bing Webmaster Tools, if connected |
| Links from other sites | Search Console links report |
| Signups from this page | Analytics, if available |
| Topic and pile | `seo/site-profile.md` |

## Decide for each page

- **Remove**: no clicks to speak of, no links from other sites, topic far from the product.
- **Merge**: another page of the site covers the same query better. The weak page gets a 301 redirect to it, and anything useful from it moves into the strong page.
- **Keep or rewrite**: pile A topic with impressions, no better page on the site.

Present the full list to the owner with the reason for each row. They may know something the data does not, for example "we already have pages on these topics, do not rewrite, merge".

## Rules that came from mistakes

1. **A page with links from other sites is redirected, never removed.** A removed page throws the links away.
2. **Compare positions on shared queries before merging.** If the page you planned to fold in ranks higher on those queries than the target, do not merge it.
3. **Back up every page before touching it**, all fields, into `seo/backups/`.
4. **Nothing is removed or redirected before the owner approves the whole list.**

## Order of a merge

1. Publish the strong page, with whatever was worth keeping from the weak ones.
2. Change internal links that point to the weak pages so they point to the strong one. Keep a log of what was changed so it can be undone.
3. Unpublish or archive the weak pages.
4. Set the 301 redirects.
5. Check each old address: it must answer 301 and land on a page that answers 200, in one hop.
6. Submit the old addresses through IndexNow so Bing sees the redirects: put them in a file, one per line, and run `node scripts/indexnow.mjs --file <file>`.
7. Check the sitemap. The removed pages should be gone and the strong page present. In some site builders the sitemap refreshes only when the whole site is published, which is the owner's button.
8. Update `llms.txt` if the site has one (`ai-search.md`).
9. Log the whole operation in `seo/change-log.md` with check dates at about two and four weeks.

## Measure

Measure three groups separately: the pages that received redirects, the rest of the site, and any single page so large that it distorts the total. A site-wide chart hides what happened.

Leave a second round of cleanup until the first has been measured.

## Common mistakes

- Removing a page that was promised to a partner. In a bulk cleanup it looks like any other thin page, and the partner finds a 404. Keep the list of promised pages and check every removal against it.
- Merging a page into one that ranks worse. Compare positions on the shared queries at the last check, and cancel the merge if the "weak" page stands higher.
- Removing a page that other sites link to. Look at the Search Console links report first, and redirect such pages.
- Assuming the sitemap follows. In some site builders it refreshes only on a full-site publish, so removed and restored pages stay wrong until then.
- Cleaning up without backups. A restore is only possible if every field was saved before the change.
