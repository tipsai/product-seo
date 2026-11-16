# Triage: what to work on first

Contents:
- Get the data
- Two piles
- Order of work inside the first pile
- Check the trend
- Read the results page
- Choose words by demand
- New site
- What to hand the owner
- Common mistakes

## Get the data

Take queries and pages for the last one to three months. Three months smooths out weekly noise; one month is enough for a site that changes fast.

With API access:

```
node scripts/gsc-fetch.mjs --site <property> --start <date> --end <date> --dims query,page --out seo/data/rows.jsonl
node scripts/opportunities.mjs seo/data/rows.jsonl --brand "<brand name and its spellings>"
```

Without it, read the exported CSV tables from `seo/data/`. `scripts/opportunities.mjs` accepts those files too.

Separate brand queries from the rest. People who type the product's name are already coming; they say nothing about which topics work.

## Two piles

Group pages and queries into topics. Ten to twenty topics is typical. For each topic ask one question: **is the product the answer to this search?**

- **Pile A, "the product is the answer".** The person searching has the task the product does. They could sign up within the same visit.
- **Pile B, "traffic only".** The person reads and leaves. The topic is next to the product, or the task is done by something else.

How to decide:

- With signup data: count signups by first landing page or by `utm_campaign` for each topic. Topics that bring signups are pile A, whatever their traffic.
- Without it: imagine the searcher finishing their task. If the product would be open on their screen while they do it, pile A. If they need a different kind of tool, pile B.

Show the piles to the owner and let them move topics. They know who pays. Write the agreed piles into `seo/site-profile.md`.

Expect an uncomfortable result. Usually most non-brand clicks sit in pile B, and the pile A topics are on the second page. That is the finding to act on. It means the easy traffic was never going to convert and the valuable queries are within reach.

Pile B is parked. Do not delete it during triage. Pages far from the product go to `references/cleanup-and-merge.md` later.

## Order of work inside the first pile

1. **Positions 8–20.** Pages near the top of page two are the cheapest to move. The `opportunities` report lists them by impressions under "Striking distance".
2. **Page one with weak clicks.** Position 1–8 and a click rate below what the same site gets at that position. See `references/titles-and-snippets.md`.
3. **Pages fighting each other.** Two or more of the site's pages share a query and none ranks well. See `references/cleanup-and-merge.md`.
4. **Demand with no page.** Queries with impressions where no page is really about them, and topics the owner knows people ask about. For more sources of ideas and the page types that fit a product site, see `content-ideas.md`.

## Check the trend

Before touching a page, look at its weekly clicks, impressions and position for the last two or three months: fetch with `node scripts/gsc-fetch.mjs --dims date --page-contains <slug> --out seo/data/<slug>-dates.jsonl`, or use the Dates table of an export filtered by page.

- Rising by itself: leave it alone and look again in a month.
- Flat or slowly falling: a candidate.
- Dropped in one step: find out what changed on that date before rewriting anything.

Check the season too. A page about a seasonal topic falls every year at the same time.

## Read the results page

For the main query of each candidate, open the results and note for the first ten:

- who they are;
- what kind of page each one is: article, tool, product landing page, video, forum thread;
- what the titles promise.

The page type that dominates is the page type to build. Tools in the results mean `references/task-pages-and-tools.md`. Lists of products mean `references/comparison-pages.md`. Guides mean an article.

With a handful of queries, a browser is enough. A paid results API only saves time on dozens.

## Choose words by demand

People use one wording far more than its synonyms, and the page title should use theirs. Compare the candidates in Search Console impressions first, then in a volume tool if one is connected. Check the trend of the phrase over a year: a large number that has halved since last year is a different bet.

## New site

Search Console is nearly empty for a new site, or the site is not connected yet. The piles are the same; the data source changes. A first month looks like this.

**Week 1: make the site findable and measurable.**
1. Connect Search Console and Bing Webmaster Tools, submit the sitemap, request indexing of the home page (`setup.md`, "The site is not in Search Console yet").
2. Check that search engines may index the site: no `noindex` left over from development, `robots.txt` does not block the pages, every page has its own title and description, the site works on a phone.
3. Make signups measurable: analytics that ties a signup to its first page, and UTM on links from content to the product (`setup.md`, "Signups and analytics").

**Weeks 1–2: find demand instead of guessing it.**
4. Write down the tasks the product does, in the words a customer would type.
5. Get volumes for those phrases. Free: Google Keyword Planner, Google Trends, the search box suggestions; for Russian-language search, Wordstat. Paid options are in `setup.md`.
6. Read the results page for each phrase (previous section). Note which kinds of pages rank.
7. Look at which pages bring search traffic to two or three direct competitors, if a tool for that is available.
8. Sort the phrases into the same two piles.

**Weeks 2–4: the first pages.**
9. The home page says what the product does in the words people search, in the title and the first heading.
10. Three to five narrow pages from pile A: a page for one exact task (`references/task-pages-and-tools.md`) and comparisons with products people already know (`references/comparison-pages.md`). Broad head terms come later.
11. Get listed where people look for tools like this (`references/links-and-listings.md`). For a new site, mentions on other sites are also how search engines find it.

**After that.** New pages on a new site take weeks to show impressions. Set the first check at four weeks. Once there are one to three months of Search Console data, switch to the normal triage at the top of this file.

## What to hand the owner

A short report in this order:

1. One sentence: where the clicks are and where the signups are.
2. Pile A table: topic, main query, page, position, impressions, clicks, proposed play.
3. Pile B in three lines: what it is and why it is parked.
4. The first three things to do, in order.
5. The date range of the data and anything that could not be checked.

## Common mistakes

- Working on whatever brings clicks. Most clicks usually come from topics that never sign up. Split the piles first.
- Blaming a page for a seasonal drop. Check when the topic peaks each year.
- Planning around a volume number without its trend. A topic can look large and have lost half its searches within a year.
