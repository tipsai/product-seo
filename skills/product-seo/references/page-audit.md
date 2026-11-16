# Auditing pages that are already live

Contents:
- When this play applies
- Which pages first
- What to check on each page
- The report
- Fixing
- What to leave alone
- Common mistakes

`review.md` covers a new draft before it goes live. This file is for pages that have been on the site for months: what they sound like, how they look, whether they still tell the truth, and whether they lead anyone to the product.

## When this play applies

- The owner asks to check or audit existing pages.
- The site has many older pages nobody has re-read, especially pages produced quickly or in batches.
- A product fact changed (price, plan, feature) and live pages may still carry the old one.
- Before a cleanup, to tell pages worth repairing from pages to merge or remove.

## Which pages first

Do not audit everything at the same depth. Order pages by what a fix can win:

1. Pile A pages with the most impressions (`triage.md`).
2. Pages that mention a changed product fact.
3. The rest, by impressions.

For a large site, run the mechanical checks on every page first. They are cheap and show the scale. Then do the reading passes on the top pages only.

## What to check on each page

**1. What it sounds like.** Send the live text to a second model with `assets/prompts/editor-review.md`. Record `ai_feel` and `usefulness` and the quoted places. A page above 3 on `ai_feel` goes on the fix list. For many pages, a quick count of the patterns in `slop-patterns.en.md` or `slop-patterns.ru.md` ranks them before the model reads any.

**2. Whether it helps the reader do the job.** Read it as the person who typed the query. Is the answer in the first screen? Does the opening start with something concrete, or with a general sentence about the modern world? In a roundup, is every item a real option, or are some filler?

**3. How it looks on a phone.** Run `node scripts/shoot.mjs --url <address>`. It saves the page at 1440, 900 and 390 px and warns when the page scrolls sideways. Look at the 390 px shot:

- tables that slide out of the screen or are cut off;
- images whose text cannot be read at about 320 px wide;
- how far a reader scrolls before the first call to try the product;
- broken layout: overlapping blocks, stray code, empty image frames.

**4. What affects signups.**

- The product appears where it solves the reader's step, not only in the last paragraph.
- There are two visible blocks with a button, and they say different things.
- The button says what the person will get.
- Every product link goes to signup, not the home page, and carries UTM parameters with this page's slug.

**5. Facts against the facts file.** Compare every statement about the product with `seo/product-facts.md`: prices, plan names, limits, numbers, features, platforms. Check structured data and the meta description too; stale facts hide there. For a whole site, turn the "never write" list and the old values into search patterns and run them over all pages.

Facts about other products: anything with a price or a "does not have" older than a few months needs a re-check (`facts.md`).

**6. Links.**

- Links to competitors' blogs and to unrelated sites. Links to competitors' official product pages are fine.
- Internal links that return anything other than 200, or that point to pages since merged.
- Old variants of the site's own domain or of the product's name.
- Product links without UTM.

**7. Author.** A named real person, not "Admin" or the company. Photo, role, a link to their profile, publish and update dates in the byline. `author` in the structured data is a `Person` with `url` and matches the name shown. Details in `page-workflow.md`, "A real author".

**8. Housekeeping.** A title that does not carry a past year. Images that load. One H1.

**9. A reader's verdict.** For the top pages, run the reader pass from `review.md` on the desktop and phone screenshots with `assets/prompts/reader-simulation.md`.

## The report

One table for the owner, one row per page:

| Page | Impressions, position | Blocks the reader | Wrong or stale | Looks broken | Minor | Proposed action |
|---|---|---|---|---|---|---|

Severity, highest first:

1. **Wrong or stale facts** about the product or others. Fix regardless of traffic.
2. **Blocks the reader or the signup**: broken table on phones, no visible way to try the product, links to the home page, dead links.
3. **Sounds machine-written or pads the answer.**
4. **Missing or generic author.** One fix in the page template usually covers every page.
5. **Minor**: year in the title, alt text.

Proposed action is one of: quick fix, rewrite (`page-workflow.md`), merge or remove (`cleanup-and-merge.md`), leave.

Add the date range of the traffic data, how many pages were checked at which depth, and what could not be checked.

## Fixing

The owner approves the list before anything changes. Then every fix follows the usual steps: back up the page, change it, log it in `seo/change-log.md`.

- Group mechanical fixes of one kind (dead links, UTM, a stale price) into a batch and log the batch.
- Do not mix mechanical fixes with a text rewrite on the same page in the same pass, or the measurement says nothing.
- After a batch, re-run the same checks to confirm the count went to zero.

## What to leave alone

On a page that already ranks, a repair is not a rewrite. Keep the heading structure, the address, working internal links, images and tables that render correctly. Change the opening, the wording, the facts and the links. A full rewrite is a separate decision with its own measurement.

## Common mistakes

- Auditing every page at the same depth. Run the cheap mechanical checks on all pages and read only the ones that matter.
- Treating a wrong fact as a one-page problem. Pages get written from each other, so the same old value repeats across the site and in its structured data. One search pattern per statement finds them all.
- Missing filler items in roundups: entries that are not real options, such as an app store listed as an app. Replace each with a real one.
- Leaving product links pointed at the home page. Repointing them to signup belongs in the first audit, not in a later pass.
- Rewriting a page that only needed a repair. On a ranking page, keep the structure and fix the text, facts and links.
