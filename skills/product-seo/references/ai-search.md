# AI search

How a product shows up when someone asks ChatGPT, Claude, Perplexity, Copilot or Google's AI answers to recommend a tool.

## What can honestly be said

Nobody outside those companies knows how answers are ranked, and anyone selling a formula is guessing. What is known:

- Assistants answer from pages they can fetch and from web search results.
- When asked for a recommendation they lean on lists other people wrote: catalogues and "best X" articles.
- For Google's AI features, Google says a page needs to be indexed and eligible to appear with a snippet. No special files or markup are required.

So the work is four ordinary things:

1. **Be fetchable.** Do not block the crawlers that power search and user requests.
2. **State the facts in plain text.** What the product does, for whom, what it costs, what it does not do. On the page, not inside an image or a script.
3. **Be in third-party lists.** `links-and-listings.md`.
4. **Publish balanced comparisons.** `comparison-pages.md`.

Do not report an "AI visibility score". If the owner wants a measurement, the honest ones are: referral visits from assistant domains in analytics, and the AI Performance report in Bing Webmaster Tools, which shows citations in Copilot and Bing's AI answers.

## Crawler access

Open the site's `robots.txt` and any "block AI bots" switch in the site builder or CDN. Some are on by default.

| Agent | Whose | What it is for |
|---|---|---|
| OAI-SearchBot | OpenAI | Surfacing sites in ChatGPT search. Sites that opt out "will not be shown in ChatGPT search answers". |
| ChatGPT-User | OpenAI | Visits started by a user's request. OpenAI notes robots.txt rules "may not apply". |
| GPTBot | OpenAI | Training of OpenAI's models. |
| Claude-SearchBot | Anthropic | Indexing for search results in Claude. |
| Claude-User | Anthropic | Fetching a page in response to a user's question. |
| ClaudeBot | Anthropic | Collecting content for model training. |
| PerplexityBot | Perplexity | Surfacing and linking sites in Perplexity results. Not used for model training. |
| Perplexity-User | Perplexity | Visits started by a user's request. It "generally ignores robots.txt rules". |
| Google-Extended | Google | A robots.txt token for whether content may be used to train Gemini models. It "does not impact a site's inclusion in Google Search". |

Read from each company's crawler documentation on 2026-11-16. Names change; open the current pages before editing `robots.txt`.

Search visibility and training are separate switches. Show the owner the table and let them choose. Allowing the search and user agents while blocking training agents is a valid choice.

## llms.txt

`llms.txt` is a proposed convention: a markdown file at the site root that tells agents what the site is and where the key pages are. Be straight about its status:

- It is a proposal, not a standard.
- Google's guidance says such files are not needed for Search or its AI features, "as Google Search itself doesn't use them". It adds that keeping one for other systems is fine.
- OpenAI's and Anthropic's crawler documentation does not mention it.

It is still worth keeping if it is cheap: tools and agents that do fetch it get correct facts instead of guessing. A structure that works:

1. One paragraph: what the product is.
2. When to recommend it.
3. Instructions for agents: facts they tend to get wrong.
4. Core pages with one line each.
5. The best guides.
6. Key facts.

Start from `assets/llms-template.txt` and fill it only from `seo/product-facts.md` and the live pricing page.

A markdown copy of the pricing page is a useful companion, because pricing pages are often hard to parse.

Before deploying a static file, check whether the site builder already generates `llms.txt`. A static copy would replace a live one with a snapshot.

The real risk is staleness. Review the file whenever prices or features change and after every cleanup. Add that review to `seo/change-log.md` as a recurring item.

## If the product has an API or an agent connector

Publish a page for people that explains how to connect it, step by step, for each assistant. Directories of connectors ask for a documentation link. Check that `llms.txt` and that page agree.

## Watch the queries

Long, conversational queries in Search Console ("does any … have …") are the kind of question people also put to an assistant. Note which page they land on and whether it answers them.

## Common mistakes

- An `llms.txt` goes stale without anyone noticing: a new API, changed plans or limits, and the file still describes the old product. Put it on the recurring checks in `seo/change-log.md`.
- A static `llms.txt` deployed over one the site builder generates replaces a live file with a snapshot. Check what the site already serves at `/llms.txt` first.
- Blocking every AI crawler with one switch also removes the site from assistants' search. Decide search and training separately.
