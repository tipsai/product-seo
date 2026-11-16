# Writing or rewriting one page

Contents:
- Before writing
- Choose the form
- Length
- Text rules
- The product in the text
- Calls to try the product
- Links and table of contents
- A real author
- After the draft
- Checklist before showing the owner
- Common mistakes

This file covers any content page: an article, a guide, a roundup. Pages where the visitor does a task are in `task-pages-and-tools.md`. Comparisons add their own rules in `comparison-pages.md`.

## Before writing

1. **Read `seo/lessons.md`.** It exists so the same mistake is not made twice.
2. **Get the page's queries.** With the API: `node scripts/gsc-fetch.mjs --dims query,page --page-contains <slug> --out seo/data/<slug>.jsonl` (the default period is the last 90 days). Without it: an export filtered by this page. Write down the words that carry the most impressions. They must stay in the title and headings.
3. **For a rewrite, read the old page first.** Keep what already works: the sections that match the top queries, the URL, the parts people link to.
4. **Read the results page** for the main query (`triage.md`). Note what the top pages have that this one lacks.
5. **Facts.** Product facts from `seo/product-facts.md`. Facts about other products through the fact collector (`facts.md`).

## Choose the form

Pick one main block that fits what the reader came to do. It must differ from the main block of the last two pages published on the site. A blog where every page has the same skeleton looks generated, and readers notice. Be precise about why when you explain it to the owner: Google does not penalize a shared layout. What it filters out is pages that repeat each other, and its spam policies cover pages produced in bulk to rank rather than to help, however they were made. A fixed skeleton makes exactly that easy: the same page again with a different keyword.

Forms that worked:

1. A real result: what went in and what came out.
2. Before and after on one example.
3. Diagnosis: what you see, why, what to do.
4. Choose your path: two or three questions lead to the reader's route.
5. Routes by starting point: where the reader's material comes from decides the steps.
6. Ready-made prompts or requests with their results.
7. A template the reader downloads and keeps.
8. An open test on your own material, with numbers you measured yourself.
9. A thirty-second answer with one diagram.
10. Step by step on real screens.
11. One example carried through the whole page.
12. A calculation of time or money for a concrete case.

Write one hypothesis for the page into `seo/experiments.md`: what is being tried, what it will be compared against, when to look.

## Length

Length follows the task:

- quick answer: 700–900 words;
- how-to: 1,000–1,500;
- roundup or the main page of a topic: 2,000–3,000.

Longer only when the reader needs it.

## Text rules

- The title repeats the real query in the searcher's words. Read the finished page before fixing the title: it may promise only what the page contains.
- The answer is in the first 100 words. Right after it, three to five short takeaways of the form "if you need X, do Y".
- A comparison table, if the page has one, comes early, before the detailed sections.
- Headings are the reader's questions and contain query words. Each section can be read without the others.
- A competitor comparison belongs only on pages whose title promises a choice: best, top, alternatives, vs. A how-to has none.
- End with an FAQ of three to five questions taken from the queries, each answered in one to three sentences.
- Break up the text. Most people scan, and a wall of text sends them back to the results. Use tables, short lists, images, cards.
- Do not write "we tested" unless you did. Do not invent numbers, studies or reviews.
- Linking to competitors' official sites is fine.
- On topics near health, money or law: add one line that this is a tool and not treatment or legal advice, state effects only in the company's own quoted words, and do not generalize about groups of people.
- A detail you can only know from opening the product or the file yourself is worth more than a general statement.

Style rules against machine-sounding text are in `slop-patterns.en.md` and `slop-patterns.ru.md`. Load the one for the page's language.

## The product in the text

- Put the product where it solves the reader's task, and describe the path concretely: what to do and what you get.
- Say once, honestly, when it is not the right choice.
- Do not call it "the best" in a heading. Headings stay neutral and carry query words.
- Do not promise outcomes ("save five hours").
- Do not write conditions that change often: free limits, trial terms, promotions. They go stale on every page at once. If the owner wants a price mentioned, mention it once.
- In a roundup that includes the product, say plainly that it is yours.

## Calls to try the product

- Two visible blocks with a button, each saying something different: a short strip in the middle of the page after the table or the example, and a card at the end of the section about the product.
- The text says what the person will get. The button names the action on their own material, not "Sign up".
- Every link to the product goes straight to signup, not to the home page.
- Every link carries UTM parameters: `utm_campaign=<page-slug>` and `utm_content=<place>`, for example `intro`, `strip`, `card`.

## Links and table of contents

- Three to five links to other live pages of the site. Check that each returns 200.
- After publishing, add one or two links to the new page from related pages where it reads naturally.
- Give the page a clickable table of contents: a list "On this page" built from the H2 headings, each linked to its section. A reader who came for one question jumps to it without scrolling past the rest. Headings written as the reader's questions make the list read like a list of answers.
  - On desktop it sits beside the text and highlights the section being read.
  - On a phone it is a compact block at the top.
  - A click scrolls smoothly and stops with the heading visible below a fixed site header.
  - `assets/toc.html` is a drop-in snippet that builds the list from the page's headings. It goes into the page template once, so every page gets it.
  - After adding it, test: clicks land on the heading even when images above load late, the last section highlights at the bottom, and a link with `#section` opens at that section.

## A real author

Every article has a named person behind it. "Admin" and the company name are not authors.

- **A byline at the top**: name, photo, role, the publish date and the date of the last update.
- **A short bio relevant to the topic**: why this person can write about it. Only facts that can be checked. Do not copy claims from the author's own social profile without checking them against the product facts.
- **A link to further information about the author**: a profile on LinkedIn or X, a personal site, or an author page on your site that lists their articles. An author page is the fuller option. A role and a profile link next to the name is the lighter one.
- **The same small set of authors across the blog**, each assigned to the topics they really know.
- **Structured data**: in the page's Article or BlogPosting markup, `author` is a `Person` with `name` and `url`, and `sameAs` pointing to their profile. Every author shown on the page is in the markup.
- **A photo that reads at small size**: crop to head and shoulders. In a 40 px circle a full-figure photo is a blur.

What can honestly be said about the effect. Google's guidance on helpful content asks "Do pages carry a byline, where one might be expected?" and says "We strongly encourage adding accurate authorship information". It also warns against made-up names, generated headshots and false credentials. Nowhere does it promise a ranking gain, and neither do we. Our experience: we assigned real authors with role, photo and profile link across the whole blog, and kept it.

The author must be real and must agree to sign the page. Never invent an author.

## After the draft

1. Images: `images.md`. A cover, and for a page of 1,000–1,500 words three or four images inside. `assets/cover-template.html` is a worked example of a cover: real typography in HTML with a slot for an object from the image model.
2. Coverage check: `node scripts/coverage.mjs seo/data/<slug>.jsonl --url <live page>` before the rewrite, and the same with `--page <slug> --html <draft file>` after. It reports what share of the page's impressions comes from queries whose words all appear in the title and headings. If the share fell after a rewrite, put the missing words back into headings.
3. Review: `review.md`.
4. The owner's "ok".
5. Going live and the change log: `publishing.md`, `measure-and-rollback.md`.
6. Two lines in `seo/lessons.md`: what was better this time, what to fix next time.

## Checklist before showing the owner

- [ ] Title repeats the real query and promises only what is on the page.
- [ ] Answer in the first 100 words; takeaways and table near the top.
- [ ] Words from the main queries are in the title and headings.
- [ ] Every fact about the product is in `seo/product-facts.md`; every fact about another product has a quote, URL and date; no `[CHECK]` marks left.
- [ ] The product has one honest "when it does not fit".
- [ ] No promised outcomes, no free limits, trial terms or promotions.
- [ ] The main block differs from the last two pages.
- [ ] Two different calls to try the product; links go to signup with UTM.
- [ ] Internal links return 200.
- [ ] A cover plus three or four images inside for 1,000–1,500 words; images and tables are readable on a phone.
- [ ] The table of contents lists every section and its links land on the headings.
- [ ] A real author: byline with photo, role and dates, a link to their profile, `author` in the structured data.

## Common mistakes

- Sentences of the kind "it covers all of these". They are often wrong in a detail. Check every "all" and "any" against the product separately.
- A running example that drifts between the image, the screenshot and the text. Fix the example before the first draft and reuse it exactly.
- Leaving errors of meaning for the reviewer to find. Ask of each piece of advice: what will the reader do with it, and what will happen?
- Tables checked only on a desktop. A cell with a link can slide out of place on a phone.
- Every page on one skeleton. Each reads fine alone and the blog reads as generated in a row. Hence the rule about the main block.
- A statistic taken from users' data. It tells readers their data is being looked at. Use open tests on your own material or outside sources.
