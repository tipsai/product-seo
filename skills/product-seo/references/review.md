# Review

Three passes before the owner sees a page, then the owner.

## Pass 1: a second model as a strict editor

Send the title, description and full text to a different model (see "Second model for review" in `SKILL.md`) with `assets/prompts/editor-review.md`. It returns JSON only: a verdict, scores, quoted places that sound machine-written, what to cut, what is missing, what blocks a signup, and doubtful facts.

The score that drives the loop is `ai_feel`: 10 is obviously machine-written, 1 reads like a competent human author. Fix what it quotes and send the text again. Stop at 3 or lower. This usually takes two or three rounds.

Give the reviewer context, or it will argue with decisions already made:

- the queries the page is written for;
- the product facts and the "never write" list;
- the owner's standing decisions ("the price appears once", "no comparison section in how-to pages");
- for comparison pages, the facts files of every product named.

Do not accept its advice blindly. Reject any suggestion that adds a fact with no source, a promise the product cannot keep, or something the owner has ruled out.

If the user has the `humanizer` skill installed (https://github.com/blader/humanizer), run it on the draft before sending it to the reviewer. It removes the common machine-writing patterns; the reviewer then judges what is left.

If the score sticks at 4, look for repetition: the same service line opening every section, headings that read like adverts, a frame repeated for every item.

## Pass 2: a reader

Take screenshots of the page as it will look, at desktop and phone width (`node scripts/shoot.mjs --url <address> --widths 1440,390`). Give them to a model with `assets/prompts/reader-simulation.md`. It plays an ordinary person who typed the query and landed here. It scrolls the screenshots and says:

- whether it found what it came for, and where;
- where it would have left;
- whether it would try the product, and why or why not.

This pass sees what a text review cannot: a wall of text, an unreadable image, a button nobody notices.

## Pass 3: your own read

Read the whole text once more yourself, start to finish. For each piece of advice ask: what will the reader do, and what will happen when they do? Check that an example carried through the page is identical everywhere it appears.

Then the mechanical checks: the checklist at the end of `page-workflow.md`.

## The owner

Show the page as it will look, with images, not a text file. Say what changed, what is being tested, and what you could not verify. Nothing goes live without their "ok".

Write every new remark from the owner into `seo/site-profile.md` or `seo/product-facts.md` at once, so it becomes a rule for the next page.

## Common mistakes

- A score that sticks at 4. The usual cause is repetition: the same service line in every section, or headings that sound promotional.
- Sending a draft to review with errors of meaning still in it. The reviewer finds some; the author should find all by asking what the reader would do with the advice.
- A reviewer without context. Given facts for only one product, it flags every other claim as unverified, and that is noise.
- Accepting every suggestion. A reviewer will happily propose a fact with no source.
