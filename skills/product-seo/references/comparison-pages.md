# Comparison pages

Pages for "X vs Y", "alternatives to X" and "best X for Y". The reader has already decided to use some product and is choosing which. That makes these the pages closest to a signup.

## The rule

Write the page you would accept if the competitor wrote it about you. Say where the competitor is better. Pages that do this are trusted by readers, and AI assistants are more willing to quote a balanced page than an advert.

The opposite mistake is as common: playing down your own product. Check both directions.

## Structure of a "vs" page

1. **The choice in two lines at the top**: "Choose X if … / Choose us if …".
2. **Who each one is for**, as an image or two short columns.
3. **A table by capability**, your product in the first column.
4. **"Where X is better."** A real list.
5. **"Where we are better."**
6. **The competitor's pricing**, from their pricing page, with the date.
7. **Moving from X**, step by step, if moving is realistic.
8. **Other alternatives**, linking to the sibling pages of the series.
9. **FAQ.**
10. **A footer line**: "Checked on <date>. Found a mistake? Write to <address>." Accept corrections from competitors.

Give each page its own main block: the one thing that really differs with this competitor. How they count usage, what their free plan actually shows, which task they are built around. Nine pages with nine identical skeletons read as generated.

## Roundups ("best X")

- Say plainly which product on the list is yours.
- One or two sentences on how the list was made: criteria, sources, date.
- Each entry starts with its main difference, not with "X is a powerful tool". Vary length and order between entries.
- Each entry says who it fits and when it does not, including your own.
- A screenshot of each product's official site, captioned (`images.md`).

## Facts

Stale facts are the main risk of these pages.

- Keep **one facts file per competitor** in `seo/sources/`. Every page and every table reads from it. A changed price is corrected in one place.
- Collect facts with the fact collector (`facts.md`): official pages only, exact quote, URL, date.
- Re-check any fact older than two weeks before it goes into a page.
- Write "No" only when the official source confirms it. Otherwise write "Not listed".
- Do not list as the competitor's advantage something your product has too.
- Write your own product's honest minuses into `seo/product-facts.md` so every page uses the same ones.
- Prices: the regular price from the pricing page. A promotional price is not the price.

Give the reviewer model the facts files for all products named on the page. If it sees only one, it will flag every other claim as unverified.

## Common mistakes

- One-sided pages in the "and the winner is" manner. Readers and assistants treat them as adverts, and they bring few clicks.
- Nobody owns keeping the facts current. Prices and plans change, and the page does not. One facts file per competitor and a re-check date fix that.
- Storing competitor facts per article. Updating one price then means finding it in several files.
- Listing as the competitor's advantage something your own product also has. Check each "better" item against `seo/product-facts.md`.
- Trusting facts that are a few weeks old. Products ship constantly; re-check before every use.
