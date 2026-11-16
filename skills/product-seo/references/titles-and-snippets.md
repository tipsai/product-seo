# Titles and descriptions

The title and description are what a person sees in the results. They decide whether a page that already ranks gets the click.

## When this play applies

A page sits on the first page of results, has many impressions, and gets fewer clicks than other pages of the same site at the same position. `scripts/opportunities.mjs` lists these under "CTR gaps": pages with less than half of the site's own page-one click rate at the same position. It uses the site's own numbers, not an industry table. Pass `--brand`, or brand queries inflate the comparison.

Do not start here for pages on page two. They need a better page first (`page-workflow.md`).

## Title

- Repeat the query in the searcher's words. Check which wording has more impressions.
- Say what is inside: how many items, the year if the topic dates quickly, the one thing that sets the page apart.
- Read the page before writing its title. The title promises only what the page delivers.
- No clickbait and no claims you cannot back ("we tested" when nobody did).

## Description

Write it as a short summary for someone deciding whether to click: who this is for, what it costs, what the catch is. An honest "but" in the description earns more trust than another adjective.

## Length

A workable habit: titles of 50–65 characters and descriptions of 150–160, so they are rarely cut off. These are habits, not rules. Google builds the title link and the snippet automatically and may show something else. Its documentation says the title link is generated automatically and that a description has no length limit but is truncated in results as needed.

## How to run it

1. Take a small batch: five to twelve pages.
2. Save the old title and description of each into `seo/backups/`.
3. Change only the title and description. No text edits in the same pass, or the result cannot be attributed.
4. If a page shows no author, add one in the same pass.
5. The owner approves the list of old and new texts side by side.
6. Log the batch in `seo/change-log.md`.
7. Compare four weeks before with four weeks after: `node scripts/measure.mjs --page <slug> --date <day it went live> --weeks 4` (`measure-and-rollback.md`).

## Common mistakes

- Treating title changes as a habit. The first repair of weak snippets can clearly raise clicks, as it did for us; a second round on other pages may do nothing measurable.
- Writing the title before reading the page. The title then promises what the page does not deliver.
- Changing the title and the text in one pass. The result cannot be attributed to either.
