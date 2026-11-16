# Block for the project's CLAUDE.md or AGENTS.md

On first run, add the block below to the instruction file the user's agent reads: `CLAUDE.md` for Claude Code, `AGENTS.md` for Codex and most other agents. If both exist, add it to both. If neither exists, ask the user which to create. Show the block to the user before writing it, and never change anything else in those files.

Fill the brackets. Keep it this short: the details live in `seo/`.

```
## SEO

SEO work for this site lives in `seo/`. Before any SEO task, read in this order:
1. `seo/site-profile.md`: the product, who pays, which topics matter, the owner's standing decisions.
2. `seo/change-log.md`: what was changed and which checks are due.
3. `seo/lessons.md`: what went wrong before.

Rules:
- Anything written about the product comes from `seo/product-facts.md`. [Source of truth for product facts: where]
- Nothing is published, redirected, removed or sent without the owner's "ok".
- Back up a page into `seo/backups/` before changing it, and log every change with its check dates.
- [Product changes are tracked in: changelog / tracker / repository / ask the owner]
- [Analytics for signups: tool and how to read it]

`seo/README.md` lists every file in the folder.
```
