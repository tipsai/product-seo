#!/usr/bin/env node
// Checks that the words people search with appear in a page's title and headings.
import { readFileSync, existsSync } from 'node:fs';
import { args, die, readRows, aggregate, words, hasWord, mdTable, pct, int, fix } from './lib/common.mjs';

const HELP = `
coverage: what share of a page's search impressions come from queries whose words
all appear in the page's title and headings (h1-h3).

Usage:
  node scripts/coverage.mjs seo/data/page.jsonl --url https://example.com/blog/post
  node scripts/coverage.mjs seo/data/page.jsonl --page /blog/post --html seo/drafts/post.html

Input: rows with query and page (gsc-fetch.mjs --dims query,page --page-contains <slug>),
or the Queries table of a Search Console export filtered by this page.
Run it on the live page before a rewrite and on the draft after. If the share drops,
put the missing words back into the title or a heading.

Options:
  --url <url>       the live page; its HTML is fetched, and rows are filtered to this URL
  --html <file>     a local draft instead of the live page
  --page <text>     filter rows to pages whose URL contains this text (default: the --url)
  --title <text>    add an SEO title that is not in the HTML yet
  --top <n>         queries to list (default: 20)
`;

const { values: v, positionals: files } = args({
  url: { type: 'string' },
  html: { type: 'string' },
  page: { type: 'string' },
  title: { type: 'string' },
  top: { type: 'string', default: '20' },
}, HELP);

if (!files.length) die('pass the rows file or the Queries export of this page. Run with --help.');
if (!v.url && !v.html) die('pass --url (live page) or --html (draft file).');

let html;
if (v.html) {
  if (!existsSync(v.html)) die(`file not found: ${v.html}`);
  html = readFileSync(v.html, 'utf8');
} else {
  const res = await fetch(v.url, { headers: { 'User-Agent': 'Mozilla/5.0 (product-seo coverage check)' }, redirect: 'follow' });
  if (!res.ok) die(`${v.url} returned ${res.status}.`);
  html = await res.text();
}

const strip = (s) => s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const title = strip((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
const headings = [...html.matchAll(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({ level: m[1], text: strip(m[2]) })).filter((h) => h.text);
const zone = [title, v.title || '', ...headings.map((h) => h.text)].join(' ');
const tokens = words(zone);

const filter = v.page || (v.url ? new URL(v.url).pathname.replace(/\/$/, '') : null);
let rows = readRows(files).filter((r) => r.query);
if (filter && rows.some((r) => r.page)) rows = rows.filter((r) => !r.page || r.page.includes(filter));
if (!rows.length) die('no query rows for this page in the input.');

const queries = aggregate(rows, (r) => r.query).map((q) => {
  const qw = words(q.key);
  const missing = qw.filter((w) => !hasWord(tokens, w));
  return { ...q, missing, covered: qw.length > 0 && missing.length === 0 };
}).sort((a, b) => b.impressions - a.impressions);

const total = queries.reduce((s, q) => s + q.impressions, 0);
const covered = queries.filter((q) => q.covered).reduce((s, q) => s + q.impressions, 0);

const out = [];
out.push(`# Coverage: ${v.url || v.html}`);
out.push(`Title: ${title || '(none)'}${v.title ? `\nExtra title: ${v.title}` : ''}`);
out.push(`Headings found: ${headings.length} (h1 ${headings.filter((h) => h.level === '1').length}, h2 ${headings.filter((h) => h.level === '2').length}, h3 ${headings.filter((h) => h.level === '3').length})`);
out.push(`\n**Covered: ${pct(total ? covered / total : 0)} of ${int(total)} impressions** (${queries.filter((q) => q.covered).length} of ${queries.length} queries).\n`);
out.push('Not covered, by impressions:\n');
out.push(mdTable(['Query', 'Impr.', 'Clicks', 'Pos.', 'Missing words'], queries.filter((q) => !q.covered).slice(0, Number(v.top)).map((q) => [
  q.key, int(q.impressions), int(q.clicks), fix(q.position), q.missing.join(', '),
])));
const missingWords = new Map();
for (const q of queries.filter((q) => !q.covered)) for (const w of q.missing) missingWords.set(w, (missingWords.get(w) || 0) + q.impressions);
const topWords = [...missingWords].sort((a, b) => b[1] - a[1]).slice(0, 10);
if (topWords.length) out.push(`Missing words that carry the most impressions: ${topWords.map(([w, i]) => `${w} (${int(i)})`).join(', ')}.`);
out.push('Words are matched by their beginning, so word forms count. Add only words that read naturally; do not stuff headings.');
process.stdout.write(out.join('\n') + '\n');
