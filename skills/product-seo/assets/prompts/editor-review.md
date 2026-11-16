# Brief: strict editor review by a second model

Fill the brackets. Attach the slop patterns file for the page's language. Send the title, description and full text. Repeat until `ai_feel` is 3 or lower.

```
You are a strict editor. Below is a page for the site of [product] ([what it does, one line]). Do not rewrite it. Do not edit files. Return only the JSON described below.

Context:
- Queries the page is written for: [list]
- Product facts: [paste seo/product-facts.md]
- What must never be written about the product: [list]
- The owner's decisions. Do not suggest undoing them: [list]
- Facts about other products named on the page: [paste the sources files]
- Patterns that count as machine-sounding: [paste the slop patterns file]

Scores are whole numbers from 1 to 10:
- ai_feel: 10 is obviously written by a machine, 1 cannot be told from a competent human author. Be strict and quote every place.
- usefulness, conversion, readability, product_accuracy: 10 is excellent.

What to judge:
- Does the page answer the searcher's question fast and deliver what the title promises?
- Is anything padded, repeated, or said twice in different blocks?
- Is every claim about the product supported by the product facts? Flag each one that is not.
- Are claims about other products plausible and consistent with the sources given? Flag doubtful ones. Do not supply your own figures.
- Flag anything that reads as a medical, legal or financial promise.
- What stops a reader from trying the product?

Return exactly:
{
  "verdict": "2-3 sentences",
  "scores": {"ai_feel": 0, "usefulness": 0, "conversion": 0, "readability": 0, "product_accuracy": 0},
  "recommended_words": 0,
  "ai_tells": [{"quote": "exact text", "why": "why it sounds machine-written"}],
  "cut": ["what to remove"],
  "missing": ["what the reader lacks"],
  "conversion_issues": ["what stops the reader from trying the product"],
  "product_fact_issues": [{"quote": "exact text", "problem": "what is wrong"}],
  "new_outline": ["section"],
  "opening_rewrite": "the first paragraph, rewritten"
}

Limits: ai_tells, cut, missing, product_fact_issues at most 6 items each; conversion_issues at most 5; new_outline 5-9 items.

Page:
[title, description, text]
```

After each round: fix what was quoted, decline advice that adds an unsourced fact or breaks an owner's decision, and note in one line what you declined and why.
