# Facts

A language model fills gaps with plausible details. In SEO text that means features a competitor does not have, prices that were never charged, and capabilities of your own product that do not exist. This file is how to stop that.

## Your own product: one facts file

`seo/product-facts.md` is the only source for anything written about the product. Build it with the owner from the product itself: the live app, the pricing page, the code or configuration, the changelog. Never from memory and never from old articles.

It holds:

- what the product does, grouped by task;
- what it does not do. This list matters as much as the first;
- prices and limits, with the date;
- platforms;
- wording the owner approved for sensitive topics such as privacy, accuracy and speed;
- a "never write" list: claims that are false, unprovable or change too often;
- honest minuses, for comparison pages.

Every line has a date. Ask where the truth lives when sources disagree. A code snapshot, a design file and the live product can all differ, and only the owner knows which one is production.

When a draft needs a fact the file lacks, do not write it. Mark the place `[CHECK: what exactly]` and ask. No mark survives to publishing.

## Keeping up with the product

At the start of each session, before writing anything:

1. Read the date "product changes last checked" in `seo/site-profile.md`.
2. Look at what changed since then, in the place the owner named during setup: changelog, tracker, repository log, or ask the owner.
3. Keep only changes a reader could notice: prices and plans, limits, new or removed features, renamed things, new platforms and integrations.
4. Update `seo/product-facts.md`. Each changed line gets the new value, the date and the source. Move removed features to "does not do".
5. Search the live pages, `llms.txt` and structured data for the old value: the old price, the removed feature, the old plan name. List the pages that still carry it as candidates for `page-audit.md`, wrong facts first.
6. A new feature that solves a searched-for problem is an idea for a page (`content-ideas.md`).
7. Write today's date into the profile.

Tell the owner what you found in three lines: what changed, which facts were updated, which pages need fixing. If nothing can be read automatically, ask the owner the one question and do the same steps with the answer.

## Other products: a separate collector

Give the collection of competitor facts to a separate agent with `assets/prompts/fact-collector.md`. Keeping it separate from the writer matters: the writer wants the sentence to work, the collector only wants the quote.

Its rules:

- Sources: the product's official site, help centre, pricing page, and its pages in the App Store and Google Play. Nothing else.
- For each fact: the exact quote, the URL, the date checked.
- What cannot be confirmed is marked "not confirmed". It is not guessed.
- A site that refuses a plain request is opened in a headless browser, without logging in.

Results go into `seo/sources/<product>.md` using `assets/sources.md`. Check the disputed and the surprising ones yourself before using them.

Facts older than two weeks are re-checked before they are used again.

## Rules for using facts in text

- "No" only when the source says so. Otherwise "Not listed".
- Prices and limits as on the official page on the date checked. A promotional price is not the regular price.
- No statistics from the product's users.
- Near health, money or law: effects only in the company's own words, quoted and linked. Leave out products whose scientific claims rest only on their own studies.

## Common mistakes

- Product changes do not reach the content by themselves. Unless someone has the job of carrying them over, pages and files like `llms.txt` keep describing the older product. The session-start check above is that job.
- Using a snapshot of the product's code or old documentation as the source of facts. It can be weeks behind what is live. Name the source of truth and date every line.
- Trusting statements about your own product less carefully than statements about others. "Covers all of these" is often false in a detail.
- Reusing competitor facts after a couple of weeks without a re-check.
- Reading "the page did not load" as "no information". Some sites refuse plain requests and need a headless browser.
