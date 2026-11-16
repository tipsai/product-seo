# Change log

One row per change. Read at the start of every session: report which checks are due.

| Date | URL | What changed | Backup | Check 1 (+1 week) | Check 2 (+3 weeks) | Result |
|---|---|---|---|---|---|---|
| | | | `seo/backups/…` | | | |

Result is one of: keep, wait until <date>, rolled back on <date>. Add the numbers and their date range.

## Recurring checks

| What | How often | Last done |
|---|---|---|
| `llms.txt` matches current prices and features | On every price or feature change | |
| Competitor facts files | Before each use if older than two weeks | |

## Check results

`scripts/measure.mjs --log seo/change-log.md` appends one line per check below. Copy the verdict into the Result column of the table above.
