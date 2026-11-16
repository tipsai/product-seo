# Brief: collect facts about other products

Fill the brackets and give this to a separate agent. It must not see the draft.

```
Collect facts about the products listed below. You are a researcher, not a writer. Do not summarize, compare or recommend.

Products: [names and official sites]
Facts needed for each: what it is in one line; platforms; whether there is a free version and what limits it; the lowest paid plan at its regular price; [capabilities from the comparison table]
Today's date: [date]

Rules:
1. Sources: only the product's official site, its help centre, its pricing page, and its own pages in the App Store and Google Play. No reviews, no blogs, no third-party comparisons, nothing from memory.
2. For every fact give the exact quote from the page, the URL, and today's date.
3. If you cannot find a fact on an official page, write "not confirmed" and say where you looked. Do not infer. Absence of a mention is "not confirmed", not "no".
4. A promotional price is not the regular price. Record both if both are shown and label them.
5. If a page refuses a plain request, open it in a headless browser without logging in. Never sign in or create an account.
6. If two official pages disagree, record both quotes and flag the conflict.

Output: one markdown file per product in this shape.

# Sources: <product>
Official site: <url>
Collected on: <date>

| Fact | Exact quote | URL | Checked on | Status |
|---|---|---|---|---|

## Could not be confirmed
- <what was looked for> (looked at: <urls>)
```
