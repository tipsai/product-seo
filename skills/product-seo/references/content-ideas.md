# What to write about

Contents:
- The test for any idea
- Where ideas come from
- Page types that work for a product site
- What to avoid
- From idea to plan
- Common mistakes

For when the owner asks "what should we write next?" or the list from triage has run out.

## The test for any idea

Three questions, in this order:

1. **Is the product the answer?** The idea must belong to pile A (`triage.md`).
2. **Do people search for it?** Impressions in Search Console, or volume in a keyword tool, or at least the wording appearing in search suggestions.
3. **Can this page be better than what ranks now?** Read the first ten results. If you have nothing they lack, skip the idea.

One page that answers a query better than the current top ten is worth more than ten pages that repeat them. Fewer ideas pass this test than you expect. That is the point of it.

## Where ideas come from

Sources that proved useful:

1. **Pile A queries where the page ranks 8–20.** The idea already exists; it needs a better page.
2. **Queries with impressions and no page of their own.** `scripts/opportunities.mjs` lists them under "No dedicated page".
3. **What paying customers actually do with the product.** Ask the owner who pays and for which task. Topics built around those tasks beat topics built around the product's category name.
4. **Product features nobody has written about.** A feature that solves a searched-for problem deserves a page about that problem.
5. **Competitors' best pages.** With a keyword tool, look at which pages bring search traffic to two or three direct competitors. Their top pages show which page types work in your market.
6. **Keyword tool suggestions around a seed phrase.** Check each large number with a direct volume request, and check the yearly trend.
7. **Long, question-like queries in Search Console.** They show what people ask in full sentences, including questions about connecting the product to AI assistants.

Other standard sources, not tested in the work behind this skill: questions from support and sales conversations, answers to onboarding surveys ("what did you come to do?"), and forum threads where people describe the problem in their own words. Use them for wording and for tasks you had not thought of, then run the three-question test.

## Page types that work for a product site

Examples are for an invented product, an invoicing app for freelancers.

| Page type | Example title | Notes |
|---|---|---|
| How to do the job, with the product in it | "How to invoice a client in another currency" | The product appears where it does the step. No comparison section. |
| "X vs Y" | "Our app vs BigBooks: which fits a one-person business" | `comparison-pages.md`. Say where each is stronger. |
| "Alternatives to X" | "7 alternatives to BigBooks for freelancers" | Say plainly which one is yours. |
| "Best X for <audience>" | "Best invoicing apps for photographers" | A narrow audience beats a broad "best invoicing apps". |
| Template to download | "Invoice template for consultants (Word, Google Docs)" | People keep it. The product is the faster way to do the same. |
| Free tool or task page | "Late fee calculator" | `task-pages-and-tools.md`. Check that the results are tools first. |
| Cost or time calculation | "What an unpaid invoice really costs you" | One concrete case with real arithmetic. |
| "X not working? Fix" | "Client says the payment link doesn't open: what to check" | Diagnosis form: what you see, why, what to do. |
| Use case per audience | "Invoicing for translators: per-word rates, rush fees, two currencies" | One page per audience that actually pays. |
| Integration page | "Send invoices from your project tracker" | One page per integration people search for. Not measured in the work behind this skill. |
| What's new | "What changed in October" | Gives other pages and emails something to link to, and can pick up question-like queries about new features. |

Vary the form inside each type (`page-workflow.md`, "Choose the form").

## What to avoid

Topics that bring readers and no signups. They are often the largest part of a site's traffic:

- **Tasks next to the product that a different kind of tool does.** The reader needs that other tool and leaves.
- **File format and conversion questions** loosely related to the product's input or output.
- **Legal and policy explainers** ("is it legal to …"). Readers want a ruling, not software.
- **General workplace advice** with the product mentioned at the end.
- **Head terms for a broad category** when the site has no page that could compete there yet.

Also avoid:

- a second page for a query the site already covers. Improve or merge the existing one;
- topics whose search volume has been falling for a year;
- a page whose only reason is "competitors have one".

Pages of these kinds that already exist go to `cleanup-and-merge.md`. They are parked, not deleted on sight.

## From idea to plan

1. Collect ideas into one table: idea, source, main query, demand, what ranks now, page type, why ours would be better.
2. Drop what fails the test. Say how many were dropped and why.
3. Check each survivor against existing pages for duplicates.
4. Group by topic and by the audience that pays. Each topic gets one main page and a few supporting ones that link to it.
5. Propose an order to the owner: closest to page one first, then new pages with proven demand.
6. Write one hypothesis per page into `seo/experiments.md`.

## Common mistakes

- Publishing by volume. Template-shaped articles written for search demand alone bring almost nothing, and removing or merging weak pages often does more for a site than adding new ones.
- Planning content around the name of the product's category. Who pays, and for which task, is a better map: build topics around those tasks.
- A roundup for a broad audience. It gets few clicks. Rewritten around how one audience uses the product, it can become the main page of that topic.
- A new page that competes with one of the site's own strong pages on a neighbouring query. Separate the two by title and by what each promises, and watch both.
