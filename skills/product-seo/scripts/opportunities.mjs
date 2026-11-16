#!/usr/bin/env node
// Finds where search work pays off first, from Search Console rows or CSV exports.
import { args, die, readRows, aggregate, dateRange, words, hasWord, writeCsv, mdTable, pct, fix, int, shortUrl } from './lib/common.mjs';

const HELP = `
opportunities: find the pages and queries where SEO work pays off first.

Usage:
  node scripts/opportunities.mjs seo/data/rows.jsonl --brand "acme,acme app"
  node scripts/opportunities.mjs seo/data/Queries.csv seo/data/Pages.csv

Input: a rows file from gsc-fetch.mjs (best: dimensions query,page) or the CSV tables
from the Search Console export. With separate Queries and Pages tables, sections that
need query-page pairs are skipped and the report says so.

Sections:
  1. Striking distance   query-page pairs at average position 8-20 (page two, close to page one)
  2. CTR gaps            page-one pages with under half the site's own CTR at the same position
  3. Competing pages     queries where two or more of the site's pages split the impressions
  4. No dedicated page   queries with demand where no ranking URL contains the query's words

Options:
  --brand <list>        comma-separated brand names and spellings; brand queries are reported apart
  --min-impr <n>        ignore rows with fewer impressions (default: 50, or 20 for small sites)
  --top <n>             rows per section (default: 25)
  --from <pos>          striking distance from position (default: 8)
  --to <pos>            striking distance to position (default: 20)
  --share <0-1>         competing pages: minimum share of a query's impressions per page (default: 0.2)
  --out <file.csv>      also write every section to one CSV file
`;

const { values: v, positionals: files } = args({
  brand: { type: 'string', default: '' },
  'min-impr': { type: 'string' },
  top: { type: 'string', default: '25' },
  from: { type: 'string', default: '8' },
  to: { type: 'string', default: '20' },
  share: { type: 'string', default: '0.2' },
  out: { type: 'string' },
}, HELP);

if (!files.length) die('pass at least one rows file or Search Console CSV export. Run with --help.');
const rows = readRows(files);
if (!rows.length) die('no rows found in the input.');

const top = Number(v.top);
const from = Number(v.from), to = Number(v.to);
const share = Number(v.share);
const brandTerms = v.brand.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
const isBrand = (q) => brandTerms.some((b) => q.toLowerCase().includes(b));

const hasQuery = rows.some((r) => r.query);
const hasPage = rows.some((r) => r.page);
const pairs = rows.filter((r) => r.query && r.page);
const totalImpr = rows.reduce((s, r) => s + r.impressions, 0);
const minImpr = v['min-impr'] ? Number(v['min-impr']) : (totalImpr > 200000 ? 50 : 20);
const csv = [];
const out = [];

out.push(`# Opportunities`);
const range = dateRange(rows);
out.push(`Input: ${files.join(', ')}${range ? `, dates ${range}` : ''}. Rows: ${int(rows.length)}. Minimum impressions per row: ${minImpr}.`);
if (!range) out.push('The input has no date column, so the period is whatever was chosen in the export or fetch. State it in the report.');
out.push('');

// Brand split
if (hasQuery && brandTerms.length) {
  const q = rows.filter((r) => r.query);
  const b = q.filter((r) => isBrand(r.query));
  const bc = b.reduce((s, r) => s + r.clicks, 0), tc = q.reduce((s, r) => s + r.clicks, 0);
  const bi = b.reduce((s, r) => s + r.impressions, 0), ti = q.reduce((s, r) => s + r.impressions, 0);
  out.push(`## Brand`);
  out.push(`Brand queries: ${int(bc)} of ${int(tc)} clicks (${pct(tc ? bc / tc : 0)}), ${int(bi)} of ${int(ti)} impressions. Everything below excludes them.\n`);
} else if (hasQuery) {
  out.push('No --brand given: brand queries are mixed in and inflate CTR. Pass --brand "name,spelling".\n');
}

const nonBrand = (r) => !r.query || !isBrand(r.query);

// 1. Striking distance
out.push(`## 1. Striking distance (positions ${from}-${to})`);
const sdBase = pairs.length ? pairs : rows.filter((r) => r.query || r.page);
const sdKey = pairs.length ? (r) => `${r.query}\u0000${r.page}` : (r) => r.query || r.page;
const sd = aggregate(sdBase.filter(nonBrand), sdKey)
  .filter((a) => a.position >= from && a.position <= to + 0.5 && a.impressions >= minImpr)
  .sort((a, b) => b.impressions - a.impressions);
if (!pairs.length) out.push('_Queries and pages are separate in this input, so the list shows each on its own. Filter the export by page to see which queries belong to it._\n');
out.push(mdTable(['Query', 'Page', 'Impr.', 'Clicks', 'CTR', 'Pos.'], sd.slice(0, top).map((a) => [
  a.sample.query || '', a.sample.page ? shortUrl(a.sample.page) : '', int(a.impressions), int(a.clicks), pct(a.ctr), fix(a.position),
])));
sd.forEach((a) => csv.push({ section: 'striking_distance', query: a.sample.query || '', page: a.sample.page || '', impressions: a.impressions, clicks: a.clicks, ctr: a.ctr.toFixed(4), position: a.position.toFixed(1) }));

// 2. CTR gaps, page level, against the site's own CTR curve
out.push('## 2. CTR gaps (page one, below the site\'s own CTR at that position)');
if (!hasPage) {
  out.push('_Needs page data: add the Pages table or fetch with --dims query,page._\n');
} else {
  // Only page-one impressions count here: that is where the title and description decide the click.
  const pageRows = rows.filter((r) => r.page && nonBrand(r) && r.position <= 10.5);
  const bucket = (p) => (p < 2 ? '1' : p < 3 ? '2' : p < 4 ? '3' : p < 6 ? '4-5' : p < 8 ? '6-7' : '8-10');
  // The site's own CTR curve: all page-one clicks divided by all page-one impressions, per position bucket.
  const curve = new Map();
  for (const r of pageRows) {
    const k = bucket(r.position);
    const c = curve.get(k) || { clicks: 0, impressions: 0 };
    c.clicks += r.clicks; c.impressions += r.impressions;
    curve.set(k, c);
  }
  for (const c of curve.values()) c.ctr = c.impressions ? c.clicks / c.impressions : 0;
  const pages = aggregate(pageRows, (r) => r.page).filter((a) => a.impressions >= minImpr * 4);
  const gaps = pages
    .map((a) => { const c = curve.get(bucket(a.position)); return { ...a, med: c.ctr, lost: a.impressions * (c.ctr - a.ctr) }; })
    .filter((a) => a.ctr < a.med * 0.5 && a.lost >= 5)
    .sort((a, b) => b.lost - a.lost);
  if (brandTerms.length && !pairs.length) out.push('_Pages come without their queries in this input, so brand clicks cannot be removed from the curve. Brand-heavy pages such as the home page look better than they are._');
  out.push(`Site curve (non-brand page-one CTR by position): ${[...curve].sort().map(([k, c]) => `${k}: ${pct(c.ctr, 2)} on ${int(c.impressions)} impressions`).join(', ') || 'no page-one rows'}.`);
  out.push(`Pages with at least ${minImpr * 4} page-one impressions and less than half the site's CTR at their position. "Missed clicks" is impressions times the gap, a rough size, not a forecast.\n`);
  out.push(mdTable(['Page', 'Page-one impr.', 'Clicks', 'CTR', 'Site CTR here', 'Pos.', 'Missed clicks'], gaps.slice(0, top).map((a) => [
    shortUrl(a.key), int(a.impressions), int(a.clicks), pct(a.ctr), pct(a.med), fix(a.position), int(a.lost),
  ])));
  gaps.forEach((a) => csv.push({ section: 'ctr_gap', page: a.key, impressions: a.impressions, clicks: a.clicks, ctr: a.ctr.toFixed(4), site_ctr: a.med.toFixed(4), position: a.position.toFixed(1), missed_clicks: Math.round(a.lost) }));
}

// 3. Competing pages (cannibalization)
out.push('## 3. Competing pages (one query, several of your pages)');
if (!pairs.length) {
  out.push('_Needs query-page pairs: fetch with --dims query,page._\n');
} else {
  const byQuery = new Map();
  for (const a of aggregate(pairs.filter(nonBrand), (r) => `${r.query}\u0000${r.page}`)) {
    const q = a.sample.query;
    if (!byQuery.has(q)) byQuery.set(q, []);
    byQuery.get(q).push(a);
  }
  const comp = [];
  for (const [q, list] of byQuery) {
    const total = list.reduce((s, a) => s + a.impressions, 0);
    if (total < minImpr) continue;
    const strong = list.filter((a) => a.impressions / total >= share).sort((a, b) => b.impressions - a.impressions);
    if (strong.length >= 2) comp.push({ q, total, strong });
  }
  comp.sort((a, b) => b.total - a.total);
  out.push('Before merging, compare positions: never merge a page into one that ranks worse for the shared queries.\n');
  out.push(mdTable(['Query', 'Impr.', 'Pages (share, position)'], comp.slice(0, top).map((c) => [
    c.q, int(c.total), c.strong.map((a) => `${shortUrl(a.sample.page)} (${pct(a.impressions / c.total, 0)}, ${fix(a.position)})`).join('<br>'),
  ])));
  comp.forEach((c) => c.strong.forEach((a) => csv.push({ section: 'competing_pages', query: c.q, page: a.sample.page, impressions: a.impressions, share: (a.impressions / c.total).toFixed(2), position: a.position.toFixed(1) })));
}

// 4. No dedicated page
out.push('## 4. No dedicated page (demand without a matching URL)');
if (!pairs.length) {
  out.push('_Needs query-page pairs: fetch with --dims query,page._\n');
} else {
  const byQuery = new Map();
  for (const r of pairs.filter(nonBrand)) {
    let q = byQuery.get(r.query);
    if (!q) { q = { query: r.query, impressions: 0, clicks: 0, posWeight: 0, pages: new Set() }; byQuery.set(r.query, q); }
    q.impressions += r.impressions; q.clicks += r.clicks; q.posWeight += r.position * r.impressions; q.pages.add(r.page);
  }
  const urlTokens = (u) => { try { return words(decodeURIComponent(new URL(u).pathname)); } catch { return words(u); } };
  const none = [...byQuery.values()]
    .filter((q) => q.impressions >= minImpr)
    .map((q) => {
      const qw = words(q.query);
      const best = Math.max(...[...q.pages].map((p) => { const t = urlTokens(p); return qw.filter((w) => hasWord(t, w)).length / (qw.length || 1); }));
      return { ...q, position: q.posWeight / q.impressions, match: best, n: q.pages.size };
    })
    .filter((q) => q.match < 0.5)
    .sort((a, b) => b.impressions - a.impressions);
  out.push('A rough check on URLs only: titles may still match. Look at the results page before planning a new page.\n');
  out.push(mdTable(['Query', 'Impr.', 'Clicks', 'Pos.', 'Your pages showing'], none.slice(0, top).map((q) => [
    q.query, int(q.impressions), int(q.clicks), fix(q.position), [...q.pages].slice(0, 3).map(shortUrl).join('<br>'),
  ])));
  none.forEach((q) => csv.push({ section: 'no_dedicated_page', query: q.query, impressions: q.impressions, clicks: q.clicks, position: q.position.toFixed(1), pages: [...q.pages].join(' ') }));
}

out.push('Next: sort these into the two piles (the product is the answer / traffic only) before choosing what to work on. See references/triage.md.');
process.stdout.write(out.join('\n') + '\n');

if (v.out) {
  const header = ['section', 'query', 'page', 'impressions', 'clicks', 'ctr', 'site_ctr', 'position', 'share', 'missed_clicks', 'pages'];
  writeCsv(v.out, header, csv);
  process.stderr.write(`Wrote ${csv.length} rows to ${v.out}\n`);
}
