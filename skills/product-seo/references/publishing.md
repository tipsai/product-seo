# Publishing (optional)

The skill's work ends when the owner approves a page. How the page gets onto the site is the owner's choice. Pasting it in by hand is a normal way to do it.

Read this file only when the owner asks you to publish, or to check a page that has just gone live.

## Before anything goes live

1. The owner has seen the page as it will look and said "ok".
2. The old version is saved: every field, into `seo/backups/<slug>-<date>`. Rollback depends on this copy.
3. If the page has traffic, the address stays the same. Update the date.

## Publishing one item

Publish this page and nothing else. Whichever route the site has:

- the content system's API call for a single item (most systems have one);
- a commit that touches this one file, for a site built from a repository;
- the owner pasting the text into the editor.

Never trigger a "publish whole site" action. It pushes everyone's unfinished edits live along with yours. If the system offers only that, hand the button to the owner.

A new page is created as a draft first, checked, then published.

Ask the owner for access with the narrowest scope that works, and read before writing: fetch the item, show what will change, then change it.

## After it is live

1. Open the live page at 1440, 900 and 390 px wide: `node scripts/shoot.mjs --url <address>` saves all three into `seo/shots/`. Scroll to the bottom, because images often load on scroll. The table fits the screen. Links to the product go to signup.
2. Submit the address through IndexNow: `node scripts/indexnow.mjs <address>`.
3. Ask the owner to press "Request indexing" in Search Console's URL inspection. Google's Indexing API covers only job postings and livestream pages, so for ordinary pages the button is the only way, and it has a daily limit.
4. Check that the page is in the sitemap.
5. Log the change with its two check dates (`measure-and-rollback.md`).

## Common mistakes

- Expecting a new or restored page to appear in the sitemap by itself. In some site builders that needs a full-site publish, which only the owner can do.
- Publishing late in the day on a site whose time zone is ahead. The page shows the next day's date. Set the publish time to midday.
- Publishing the whole site to get one page out. Other people's unfinished edits go live with it.
