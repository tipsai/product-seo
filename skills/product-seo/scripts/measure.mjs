#!/usr/bin/env node
// Before/after for one page around a change date, with the rollback rule.
import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { args, die, loadEnv, readRows, mdTable, pct, fix, int } from './lib/common.mjs';
import { fetchRows, lastAvailableDate, shiftDate } from './lib/gsc.mjs';

const HELP = `
measure: compare one page before and after a change and apply the rollback rule.

Usage:
  node scripts/measure.mjs --page /blog/post --date 2026-10-20 --site sc-domain:example.com
  node scripts/measure.mjs seo/data/post-dates.jsonl --page /blog/post --date 2026-10-20

Data: either Search Console API credentials (see gsc-fetch.mjs --help), or a file with a
date column: rows from gsc-fetch.mjs --dims date --page-contains <slug>, or the Dates
table of a Search Console export filtered by this page.

How it compares: whole weeks before the change against the same number of whole weeks
after it, so weekdays line up. The change day itself is left out.

Rule (from references/measure-and-rollback.md):
  under 7 days after the change   too early
  7 to 20 days                    watch: a dip is normal for 1-4 weeks after a big rewrite
  21+ days, clicks down 30% or more AND the last week's position is still worse than before
                                  roll back to the saved version,
                                  unless the position improves week to week: wait
  otherwise                       keep

Options:
  --page <text>     URL or part of it (required)
  --date <date>     the day the change went live, YYYY-MM-DD (required)
  --weeks <n>       weeks to compare on each side (default: 3; use 4 for title changes)
  --site <property> Search Console property for the API (default: GSC_SITE)
  --log <file>      append the verdict line to this file, e.g. seo/change-log.md
`;

loadEnv();
const { values: v, positionals: files } = args({
  page: { type: 'string' },
  date: { type: 'string' },
  weeks: { type: 'string', default: '3' },
  site: { type: 'string' },
  log: { type: 'string' },
}, HELP);

if (!v.page) die('pass --page.');
if (!v.date || !/^\d{4}-\d{2}-\d{2}$/.test(v.date)) die('pass --date as YYYY-MM-DD.');
const weeks = Math.max(1, Number(v.weeks));
const span = weeks * 7;
const change = v.date;

let rows;
if (files.length) {
  rows = readRows(files).filter((r) => r.date && (!r.page || r.page.includes(v.page)));
  const matched = [...new Set(rows.map((r) => r.page).filter(Boolean))];
  if (matched.length > 1) process.stderr.write(`Warning: --page matches ${matched.length} URLs (${matched.slice(0, 3).join(', ')}${matched.length > 3 ? ', ...' : ''}). Pass a longer part of the URL to measure one page.
`);
} else {
  const end = lastAvailableDate();
  rows = await fetchRows({ site: v.site || process.env.GSC_SITE, start: shiftDate(change, -span - 7), end, dims: ['date'], pageContains: v.page });
}
if (!rows.length) die('no dated rows for this page. Check --page, or that the file has a date column.');

// Sum by day (a file may hold several rows per day, e.g. per query).
const byDay = new Map();
for (const r of rows) {
  let d = byDay.get(r.date);
  if (!d) { d = { clicks: 0, impressions: 0, posWeight: 0 }; byDay.set(r.date, d); }
  d.clicks += r.clicks; d.impressions += r.impressions; d.posWeight += r.position * r.impressions;
}
const lastDay = [...byDay.keys()].sort().pop();
const daysAfter = Math.round((Date.parse(lastDay) - Date.parse(change)) / 86400000);

function sum(from, to) {
  const s = { clicks: 0, impressions: 0, posWeight: 0, days: 0 };
  for (let d = from; d <= to; d = shiftDate(d, 1)) {
    const x = byDay.get(d);
    s.days++;
    if (x) { s.clicks += x.clicks; s.impressions += x.impressions; s.posWeight += x.posWeight; }
  }
  s.position = s.impressions ? s.posWeight / s.impressions : NaN;
  s.ctr = s.impressions ? s.clicks / s.impressions : 0;
  return s;
}

const fullWeeksAfter = Math.min(weeks, Math.floor(daysAfter / 7));
const out = [];
out.push(`# Measure: ${v.page}`);
out.push(`Change live on ${change}. Data up to ${lastDay} (${daysAfter} days after).`);

let verdict, before, after, lastWeek;
if (fullWeeksAfter < 1) {
  verdict = 'too early';
  out.push('\nLess than one full week of data after the change. Use the one-week check only for breakage: indexed, in the sitemap, images load, no errors.');
} else {
  const n = fullWeeksAfter * 7;
  before = sum(shiftDate(change, -n), shiftDate(change, -1));
  after = sum(shiftDate(change, 1), shiftDate(change, n));
  lastWeek = sum(shiftDate(change, n - 6), shiftDate(change, n));
  const dClicks = before.clicks ? after.clicks / before.clicks - 1 : NaN;
  const dImpr = before.impressions ? after.impressions / before.impressions - 1 : NaN;
  const ch = (x) => (Number.isFinite(x) ? `${x >= 0 ? '+' : ''}${(x * 100).toFixed(0)}%` : 'n/a');
  out.push(`Comparing ${n} days before (${shiftDate(change, -n)} to ${shiftDate(change, -1)}) with ${n} days after (${shiftDate(change, 1)} to ${shiftDate(change, n)}).\n`);
  out.push(mdTable(['', 'Before', 'After', 'Change'], [
    ['Clicks', int(before.clicks), int(after.clicks), ch(dClicks)],
    ['Impressions', int(before.impressions), int(after.impressions), ch(dImpr)],
    ['CTR', pct(before.ctr, 2), pct(after.ctr, 2), ''],
    ['Avg. position', fix(before.position), fix(after.position), Number.isFinite(before.position) && Number.isFinite(after.position) ? `${after.position - before.position > 0 ? '+' : ''}${fix(after.position - before.position)} (${after.position - before.position > 0.05 ? 'worse' : after.position - before.position < -0.05 ? 'better' : 'same'})` : ''],
    ['Position, last week', '', fix(lastWeek.position), ''],
  ]));
  const positionWorse = Number.isFinite(lastWeek.position) && Number.isFinite(before.position) && lastWeek.position > before.position + 0.5;
  // The week before the last one, to see whether the position is coming back.
  const prevWeek = fullWeeksAfter >= 2 ? sum(shiftDate(change, n - 13), shiftDate(change, n - 7)) : null;
  const recovering = prevWeek && Number.isFinite(prevWeek.position) && lastWeek.position < prevWeek.position - 0.3;
  if (daysAfter < 21) {
    verdict = 'watch';
    out.push(`Under three weeks. A dip of 1-4 weeks after a big rewrite is normal. Check again on ${shiftDate(change, 21)}.`);
  } else if (Number.isFinite(dClicks) && dClicks <= -0.3 && positionWorse && recovering) {
    verdict = 'wait';
    out.push(`Clicks fell by 30% or more, but the position is improving week to week (${fix(prevWeek.position)} → ${fix(lastWeek.position)}). Check again on ${shiftDate(lastDay, 7)} before rolling back.`);
  } else if (Number.isFinite(dClicks) && dClicks <= -0.3 && positionWorse) {
    verdict = 'roll back';
    out.push('Clicks fell by 30% or more and the position has not come back. Restore the saved version, log it, and add what happened to seo/lessons.md.');
  } else {
    verdict = 'keep';
    if (Number.isFinite(dClicks) && dClicks <= -0.3) out.push('Clicks fell, but the position held or improved: look for a seasonal drop or a change in the results page before blaming the edit.');
  }
  if (before.clicks < 20) out.push(`Only ${before.clicks} click${before.clicks === 1 ? "" : "s"} before the change: too few to judge by clicks. Lean on impressions and position.`);
}

// Weekly trend, weeks starting on the change weekday.
const firstDay = [...byDay.keys()].sort()[0];
const trend = [];
for (let start = shiftDate(change, -Math.floor((Date.parse(change) - Date.parse(firstDay)) / 86400000 / 7) * 7); start <= lastDay; start = shiftDate(start, 7)) {
  const end = shiftDate(start, 6) > lastDay ? lastDay : shiftDate(start, 6);
  const s = sum(start, end);
  trend.push([`${start}${start === change ? ' (change)' : ''}`, s.days < 7 ? `${s.days} days` : '', int(s.clicks), int(s.impressions), fix(s.position)]);
}
out.push('\nWeekly trend (weeks start on the change weekday):\n');
out.push(mdTable(['Week from', 'Partial', 'Clicks', 'Impr.', 'Pos.'], trend));
out.push(`**Verdict: ${verdict}.**`);
process.stdout.write(out.join('\n') + '\n');

if (v.log) {
  const file = resolve(v.log);
  mkdirSync(dirname(file), { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const nums = before ? `clicks ${int(before.clicks)} → ${int(after.clicks)}, position ${fix(before.position)} → ${fix(after.position)} (${fix(lastWeek.position)} last week), ${shiftDate(change, -fullWeeksAfter * 7)} to ${shiftDate(change, fullWeeksAfter * 7)}` : 'no full week yet';
  appendFileSync(file, `${existsSync(file) ? '' : '# Change log\n'}\n- ${today} check · ${v.page} · changed ${change} · ${nums} · verdict: ${verdict}\n`, 'utf8');
  process.stderr.write(`Appended the verdict to ${v.log}\n`);
}
