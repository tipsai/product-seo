#!/usr/bin/env node
// Downloads Search Console rows through the official API into a JSON Lines file.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { args, die, loadEnv } from './lib/common.mjs';
import { fetchRows, lastAvailableDate, shiftDate } from './lib/gsc.mjs';

const HELP = `
gsc-fetch: download Search Console rows (query, page, date) through the official API.

Usage:
  node scripts/gsc-fetch.mjs --site sc-domain:example.com --start 2026-08-01 --end 2026-10-31 --out seo/data/rows.jsonl

Options:
  --site <property>       sc-domain:example.com or https://example.com/ (default: GSC_SITE)
  --start <YYYY-MM-DD>    first day (default: 90 days before --end)
  --end <YYYY-MM-DD>      last day (default: the latest day with final data, about 3 days ago)
  --dims <list>           comma-separated: query, page, date, country, device (default: query,page)
  --page-contains <text>  only pages whose URL contains this text
  --query-contains <text> only queries that contain this text
  --type <type>           web, image, video, news, discover (default: web)
  --fresh                 include the last two days of not yet final data
  --out <file>            where to write JSON Lines (default: seo/data/rows.jsonl)

Credentials (environment or .env in the current folder; values are never printed):
  GSC_SERVICE_ACCOUNT_FILE   path to a service-account JSON key added as a user of the property
  GOOGLE_APPLICATION_CREDENTIALS, GSC_ACCESS_TOKEN   alternatives
No credentials? Export CSV from Search Console instead; the other scripts read those files too.
`;

loadEnv();
const { values: v } = args({
  site: { type: 'string' },
  start: { type: 'string' },
  end: { type: 'string' },
  dims: { type: 'string', default: 'query,page' },
  'page-contains': { type: 'string' },
  'query-contains': { type: 'string' },
  type: { type: 'string', default: 'web' },
  fresh: { type: 'boolean', default: false },
  out: { type: 'string', default: 'seo/data/rows.jsonl' },
}, HELP);

const iso = /^\d{4}-\d{2}-\d{2}$/;
const end = v.end || lastAvailableDate(v.fresh);
const start = v.start || shiftDate(end, -89);
if (!iso.test(start) || !iso.test(end)) die('dates must look like 2026-10-31.');
if (start > end) die('--start is after --end.');
const dims = v.dims.split(',').map((s) => s.trim()).filter(Boolean);
const allowed = new Set(['query', 'page', 'date', 'country', 'device', 'searchAppearance']);
for (const d of dims) if (!allowed.has(d)) die(`unknown dimension "${d}". Use: ${[...allowed].join(', ')}.`);

const site = v.site || process.env.GSC_SITE;
process.stderr.write(`Search Console ${site} ${start} to ${end}, dimensions ${dims.join(',')}\n`);
const rows = await fetchRows({
  site, start, end, dims,
  pageContains: v['page-contains'], queryContains: v['query-contains'],
  type: v.type, fresh: v.fresh, log: (m) => process.stderr.write(m + '\n'),
});

const out = resolve(v.out);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, rows.map((r) => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : ''), 'utf8');
const clicks = rows.reduce((s, r) => s + r.clicks, 0);
const impressions = rows.reduce((s, r) => s + r.impressions, 0);
process.stdout.write(`Saved ${rows.length} rows to ${v.out} (${start} to ${end}): ${clicks} clicks, ${impressions} impressions.\n`);
if (dims.includes('query')) {
  process.stdout.write('Note: totals by query are lower than the site total in Search Console, because Google hides rare queries for privacy.\n');
}
