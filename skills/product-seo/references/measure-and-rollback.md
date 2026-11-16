# Measure and roll back

Every change is a bet. This file is how to find out whether it paid, and how to undo it when it did not.

## Log every change

One row in `seo/change-log.md` per change:

- date and URL;
- what changed, in one line (rewrite, new title, merged from three pages, new page);
- where the backup is;
- first check: one week later;
- second check: three weeks later;
- result, filled in at each check.

At the start of every session read the log and tell the user which checks are due. A change nobody measures teaches nothing.

## How to measure

```
node scripts/measure.mjs --page <slug or URL> --date <day it went live>
node scripts/measure.mjs seo/data/<slug>-dates.jsonl --page <slug> --date <day it went live> --log seo/change-log.md
```

The first form uses the API. The second reads a file: rows fetched with `--dims date`, or the Dates table of a Search Console export filtered by this page. The script compares whole weeks before the change with the same number of whole weeks after it (three by default, `--weeks 4` for title changes), prints clicks, impressions, average position and the weekly trend, and ends with a verdict: too early, watch, keep or roll back. `--log` appends the verdict to the change log.

`--page` matches any URL that contains the text. Give enough of the address that only one page matches.

Rules:

- Compare the same weekdays. A period with an extra weekend looks like a drop.
- Look at position together with clicks. Clicks can fall because the season changed while position held.
- For title and description changes compare four weeks with four weeks.
- A new page shows its first impressions after two to four weeks. Do not judge it earlier.

## What to expect

After a large rewrite Google re-evaluates the page. For one to four weeks impressions and clicks can dip. That is normal and is the reason the decision is made at three weeks and not at one.

The one-week check is for breakage: the page is indexed, it is in the sitemap, images load, nothing returns an error.

## The rollback rule

At three weeks:

- clicks are down 30% or more against the period before, **and** position is not coming back: restore the old version from the backup;
- clicks are down but position is recovering week by week: wait two more weeks and look again. The script judges by the last week's position alone, so read its weekly trend table before accepting a "roll back" verdict;
- otherwise keep the change.

Restoring means the whole old version: text, title, description, images. Log the rollback as a change of its own.

## Measure groups, not only the total

When several pages changed together, look at them as a group and separately from the rest of the site. One very large page can hide everything else in a site-wide chart; take it out of the total and report it on its own.

## Signups

Positions and clicks are the early signal. The result that matters is signups from the page: by `utm_campaign=<slug>`, and by `utm_content` for which button was pressed.

Samples per page are small. Draw a conclusion only when the difference is obvious, and say how many signups it rests on.

Fill in the result in `seo/experiments.md` for the page's hypothesis.

## Lessons

After every page or batch add to `seo/lessons.md`:

- what was better than last time;
- what to do differently next time.

Keep entries short and concrete. The next page starts by reading this file.

## Common mistakes

- Rolling back after one week. A rewritten page often dips for a few weeks and then recovers. In our case one group of rewritten pages ended far above where it started. Decide at three weeks.
- Reading a seasonal fall as a failed change. Compare with the same weeks a year earlier.
- Judging by a site-wide total. One page with a spike or a crash hides everything else; measure groups apart.
- Changing several things on a page at once. The measurement then says nothing about any of them.
