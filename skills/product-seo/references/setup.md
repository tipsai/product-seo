# Setup: data and workspace

Contents:
- What works with no setup
- Search Console
- Bing Webmaster Tools
- Data tools by budget
- Signups and analytics
- Where product changes show up
- Screenshots
- The workspace folder
- Where the skill runs
- Common mistakes

## What works with no setup

A CSV export from Google Search Console is enough for the first triage and for most plays. Everything below adds speed or depth. Nothing paid is required.

Ask the user what they already have before suggesting anything new. Connect one thing at a time, and only when a play needs it.

## Search Console

**The site is not in Search Console yet.** Connect it first; everything else in this skill reads from it.

1. At search.google.com/search-console add a property. A **Domain** property covers every subdomain and both http and https, and is verified with a DNS TXT record at the domain registrar. A **URL prefix** property covers one address and can be verified with an HTML tag or file. Prefer Domain if the user can edit DNS.
2. Submit the sitemap (usually `/sitemap.xml`; most site builders generate one) under Sitemaps.
3. Run URL Inspection on the home page and press "Request indexing". The owner presses it; it is a button, not an API.
4. Add the site to Bing Webmaster Tools by importing it from Search Console, and set up IndexNow (next section).
5. Performance data starts to appear after a few days. Until there are a few weeks of impressions, work from demand data: `references/triage.md`, section "New site".

Once the site is connected, there are two ways in. Start with the first.

**1. CSV export.** In Search Console open Performance, set the date range to the last three months, press Export and choose CSV. The download holds separate tables for queries, pages, countries, devices and dates. Put the files in `seo/data/`.

Limits to keep in mind and to state in reports:
- The export holds at most 1,000 rows per table (Google: "The maximum you can export through the Search Console user interface is 1,000 rows"), so long-tail queries are missing.
- Queries and pages come as separate tables. To see which queries belong to one page, the user filters Performance by that page and exports again.

**2. The official API.** `scripts/gsc-fetch.mjs` downloads query, page and date rows together and pages through the results. Google caps the API at 50,000 rows per day of data per search type, which is far more than the export gives. It needs a Google service account:

1. In Google Cloud Console create a project and enable "Google Search Console API".
2. Create a service account and download its JSON key. Store the key outside the repository or in a git-ignored path.
3. In Search Console open Settings, Users and permissions, and add the service account's email address as a user.
4. Set `GSC_SERVICE_ACCOUNT_FILE` to the key's path and `GSC_SITE` to the property, in the environment or in a `.env` file in the project root. `assets/env.example` lists the variable names.

If the user already has Google credentials of another kind, `node scripts/gsc-fetch.mjs --help` lists what else the script accepts.

The property is written as `sc-domain:example.com` for a domain property or as the full URL with a trailing slash for a URL-prefix property.

Never print the key, never copy it into the workspace, never commit it. Check that `.env` and the key path are in `.gitignore` before the first commit.

If the user's agent already has a Search Console connector, use it and save the rows in the same format the scripts read. Do not suggest installing one.

## Bing Webmaster Tools

Free. The user signs in at bing.com/webmasters and can import the site from Search Console. It shows the site's queries, clicks and impressions in Bing, which is a second opinion on what people search for.

For submitting URLs set up IndexNow: generate a key (8 to 128 characters), host it as `<key>.txt` at the site root, and set `INDEXNOW_KEY`. `scripts/indexnow.mjs` checks that the key file is reachable before it submits. IndexNow passes submissions to Bing, Yandex, Seznam, Naver and Yep. Google is not on its list of participants.

## Data tools by budget

Prices were checked on the vendors' own pricing pages on 2026-11-16, in the currency the page showed. They change often and differ by region. Re-open the vendor's pricing page before quoting a price to the user. Present this as a choice. For a site that already has impressions, the free column is enough.

| Need | Free | Pay as you go | Subscription |
|---|---|---|---|
| What people already find the site for | Search Console, Bing Webmaster Tools | | |
| Search volume for new topics | Google Keyword Planner, Google Trends (direction over time) | DataForSEO, SE Ranking Data API | Ahrefs, Semrush |
| Who ranks for a query | Open the results page and read the first ten | Serper, DataForSEO | Ahrefs, Semrush |
| Who links to a site | Search Console links report, Ahrefs Webmaster Tools (own site) | DataForSEO, SE Ranking Data API | Ahrefs, Semrush |
| Search engines other than Google | Bing Webmaster Tools, IndexNow, Yandex Webmaster | | |
| Demand in Russian-language search | Wordstat website | Wordstat API in Yandex Cloud Search API | |

| Tool | Price model on 2026-11-16 | Official MCP server |
|---|---|---|
| Google Keyword Planner | Free tool inside Google Ads. The account must have billing details entered. | No |
| Ahrefs Webmaster Tools | Free for sites the user has verified. Shows up to 1,000 backlinks at once. | No |
| DataForSEO | Pay as you go, no subscription. Minimum top-up $50, $1 trial credit. A results page from $0.0006; search volume for up to 1,000 keywords $0.06. | Yes |
| SE Ranking Data API | Credit packs that never expire (€45 per 250K credits), or an annual plan (€155 a month). 14-day trial with 100K credits, no card. | Yes, included |
| Serper | 2,500 free queries, then packs from $50 for 50,000 credits, valid six months. Results pages only, no volumes. | None listed |
| Ahrefs | Monthly plans: Starter €27, Lite €119, Standard €229. | Yes, from the Lite plan |
| Semrush | Monthly plans from €134. | Yes, on some plans; see Semrush's MCP page |
| Wordstat API (Yandex Cloud Search API) | Paid per request: about $0.16 per 1,000 requests for top phrases and for dynamics, more for regions. Check the Search API pricing page. | No official one |
| Yandex Webmaster API | Needs a Yandex OAuth token. See its documentation for what it returns. | No official one |

We have no working experience with the Yandex tools in this project. If the user's market is Russian-language search, the method is the same: Yandex Webmaster plays the role of Search Console and Wordstat gives demand. An open-source, MIT-licensed set of skills for the Wordstat and Webmaster APIs exists: https://github.com/artwist-polyakov/polyakov-claude-skills (not ours; review it before installing). The Wordstat API moved from its old free endpoint to Yandex Cloud, so older guides that call it free are out of date.

For any paid API, agree a spending cap with the user before the first call and write the cost of each call into `seo/data/spend.md`. Stop when the cap is reached.

## Signups and analytics

Triage needs to know which pages bring signups. Ask the owner which analytics the product has and how you may read it. Any of these works:

- a connector or MCP server for the analytics tool, if the user's agent already has one;
- the tool's API with a read-only key;
- an export the owner makes: signups by first landing page, or by UTM campaign.

Common tools are PostHog, GA4, Plausible, Mixpanel and Amplitude. The skill does not depend on any of them. What it needs is one table: landing page or campaign, and signups. Write into `seo/site-profile.md` which tool it is, how it is read, and which report holds that table.

If nothing ties a signup to a page yet:

1. Add UTM parameters to every link from content to the product: `utm_source=blog&utm_medium=article&utm_campaign=<page-slug>&utm_content=<place>`.
2. Ask the developers to store the first UTM set on the user record at signup.

Until that data exists, sort the piles by judgment (`triage.md`) and say so.

Analytics often holds personal data. Read aggregates only, never copy user-level rows into the workspace, and never put a number from user data into public text.

## Where product changes show up

Pages go stale when the product moves and nobody tells the content. Ask the owner where changes can be seen, and record the answer in `seo/site-profile.md`:

- a public changelog or release notes page;
- the task tracker, through its connector if the agent has one (Linear, Jira, GitHub issues);
- the git log of the product's repository, if the agent can read it;
- or simply the owner: "what shipped or changed since <date>?"

Ask which of these reflects what is live. A merged task is not always a released one. The routine that uses this is in `facts.md`, "Keeping up with the product".

## Screenshots

`scripts/shoot.mjs` needs Playwright in the project: `npm i -D playwright` and `npx playwright install chromium`. If the user's agent already has a browser tool, that works too.

## The workspace folder

On first run create `seo/` in the project root and copy the templates from `assets/`: `site-profile.md`, `product-facts.md`, `change-log.md`, `lessons.md`, `experiments.md`, and `workspace-readme.md` as `seo/README.md`. Create empty `seo/data/`, `seo/backups/`, `seo/sources/`.

Then add the block from `assets/agents-block.md` to the project's `CLAUDE.md` (Claude Code) or `AGENTS.md` (Codex and most other agents), or both if both exist. Show it to the user first and touch nothing else in those files. This is what makes a new session find the notes without being told.

The files are the memory. A session that ends takes its context with it; what was written into `seo/` stays. Write decisions down when they are made, not at the end.

Add to `.gitignore`: `.env`, `seo/data/`, and any credential file path. `seo/backups/` may hold unpublished text; ask the user whether it belongs in git.

## Where the skill runs

- **Claude Code and Codex CLI on the user's machine.** Everything works. Codex may ask for approval before a script uses the network.
- **claude.ai.** The sandbox usually cannot reach Google's API or IndexNow. Work from uploaded CSV exports, and hand URL submission to the user.
- **Cursor and other agents.** Same as the CLI case if they can run Node.

## Common mistakes

- Keeping decisions in conversations. A new session does not have them. A small set of files does the job: an instruction file the agent reads first, a change log, a lessons file.
- Writing product facts from an old code snapshot or old documentation. A fact file needs a date on every line and a named source of truth.
- Trusting large numbers from a keyword tool's suggestions. Some endpoints return the volume of a whole keyword group. Re-check with a direct volume request for the exact phrase.
- Calling a paid API without a cap. Agree the limit first and log each call's cost.
