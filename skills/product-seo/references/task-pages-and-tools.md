# Task pages and free tools

Contents:
- What a task page is
- When to build one
- What is on the page
- The handoff into the product
- Addresses and links
- Free tools
- Build order
- Common mistakes

## What a task page is

One page for one exact query, where the visitor does the job on the page: uploads a file, pastes a link, gets a result. It is a small front door to the product. An article explains how to do the task; a task page does it.

## When to build one

Open the results for the query. If most of the first ten are tools or product pages with a working widget, an article will not get in, however good it is. Build a task page.

Collect proof before asking anyone to build:

- which competitor pages of this kind get search traffic in your market, if a tool for that is available;
- how many impressions your own site gets on pages outside the blog. If the answer is "almost none", that gap is the argument.

Choose queries from pile A only (`triage.md`), one page per task. Do not create pages in bulk for every variation of a phrase. Google's spam policy on scaled content is about pages made in volume for rankings, and a page per task with a working tool on it is the opposite of that.

## What is on the page

- **Title** that repeats the query and says what the page does. If competitors' titles all say "free" and the product is not free, write what is true.
- **The working widget above the fold.** The visitor can start without scrolling.
- **600–900 words below it** that answer the variants of the query: how it works in three steps, what goes in (formats, sources, limits), what comes out, who it is for.
- **Formats and limits taken from the product itself**, not from memory. Ask the developers for the source or read the configuration.
- **FAQ** of five to seven real questions. If the page carries FAQ structured data, the questions in the markup must match the visible ones exactly.
- **A short block on privacy** in wording the owner has approved.
- **Links to sibling task pages.**

Write for the person, not for the phrase. Repeating the keyword dozens of times on a short page does not make it rank.

A quick self-check before review: one H1, the query in the title, the H1 and the first paragraph, title and description within the usual lengths, FAQ markup equal to the visible FAQ, every link and image loading.

## The handoff into the product

The step that decides whether the page brings signups: what the visitor did on the page must arrive in the product after signup, without doing it twice.

Decide with the owner:

- what happens before signup and what after;
- whether the first result is free, and if so, say it on the page in plain words. Promise it only where it is true;
- that the campaign parameters from the page are stored on the new account, so signups can be traced back to this page.

Then write the developers a brief, not code: what the page sends, what the product must do with it, and acceptance criteria written as things a tester can check ("a new visitor picks a file, signs up, and finds that file in the account without picking it again").

## Addresses and links

- Main tasks get short addresses in the site root. Generators and small utilities go under `/tools/` with a hub page that lists them.
- Put a column of links to all of them in the footer, and link to them from related articles.
- Make sure each page is in the sitemap.

A tool that lives on a separate app subdomain with no links from the main site and no sitemap entry gets no search traffic. Move it or link it.

## Free tools

A free tool is a small utility next to the product's main job. A pattern that works:

- the page is a self-contained mini-product;
- a guest gets one result free;
- part of the result is shown, the rest opens after signup on the same page, with no redirect;
- the result is then saved in the new account like any other item.

Pick tools by search demand, the same way as pages. A tool nobody searches for is a feature, not an entry point.

## Build order

1. Prototype the page with the real text.
2. Make it clickable and let the owner try the whole path.
3. Hand it to a tester agent with `assets/prompts/page-qa.md`: several widths, light and dark theme, every link and state. Fix what it finds and run it again, because fixes break other things.
4. Write the developer brief.
5. Launch together with the handoff, not before it. Text that says "starts right away" must be true on launch day.
6. Log it in `seo/change-log.md`. First look at impressions after two and four weeks.

## Common mistakes

- Tools with no links from the main site and no sitemap entry. They get no search traffic, however good they are.
- One QA pass. Fixes introduce new problems, so check the page again after them.
- Testing the page block only standalone. Inside the real site, global styles can break it: colour variables defined outside the block, global rules for paragraphs, lists and images, a pop-up sitting under the site header.
- Promises that are true in one launch mode and false in another, such as "starts right away" when a fallback path does not. Check every promise against the mode the page will launch in.
- Stuffing the query into the text. It does not help the page rank and it reads badly.
