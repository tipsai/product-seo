#!/usr/bin/env node
// Submits URLs to IndexNow (Bing, Yandex, Seznam, Naver, Yep and others). Google does not take part.
import { readFileSync, existsSync } from 'node:fs';
import { args, die, loadEnv } from './lib/common.mjs';

const HELP = `
indexnow: tell Bing and other IndexNow search engines that pages were added, changed or redirected.
Google does not use IndexNow: in Google, the site owner presses "Request indexing" in Search Console.

Usage:
  node scripts/indexnow.mjs https://example.com/blog/new-post https://example.com/pricing
  node scripts/indexnow.mjs --file seo/data/changed-urls.txt

Before the first run (once per site):
  1. Make a key: 8 to 128 characters, letters, digits and dashes (for example a random UUID).
  2. Host it as a plain text file at https://<your-site>/<key>.txt containing just the key.
  3. Set INDEXNOW_KEY in the environment or in .env in the current folder.

Options:
  --file <file>          one URL per line
  --key-location <url>   where the key file is, if not at the site root
  --dry-run              check the key file and list the URLs, submit nothing

All URLs must be on one host. Up to 10,000 URLs per request; larger lists are split.
`;

loadEnv();
const { values: v, positionals } = args({
  file: { type: 'string' },
  'key-location': { type: 'string' },
  'dry-run': { type: 'boolean', default: false },
}, HELP);

let urls = [...positionals];
if (v.file) {
  if (!existsSync(v.file)) die(`file not found: ${v.file}`);
  urls.push(...readFileSync(v.file, 'utf8').split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith('#')));
}
urls = [...new Set(urls)];
if (!urls.length) die('pass at least one URL or --file. Run with --help.');

let host;
for (const u of urls) {
  let parsed;
  try { parsed = new URL(u); } catch { die(`not a full URL: ${u}`); }
  if (!/^https?:$/.test(parsed.protocol)) die(`not an http(s) URL: ${u}`);
  host ??= parsed.host;
  if (parsed.host !== host) die(`all URLs must be on one host; found ${host} and ${parsed.host}. Run once per host.`);
}

const key = process.env.INDEXNOW_KEY;
if (!key) die('INDEXNOW_KEY is not set. See --help for the one-time setup.');
if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) die('INDEXNOW_KEY must be 8 to 128 characters: letters, digits and dashes.');

const scheme = new URL(urls[0]).protocol;
const keyLocation = v['key-location'] || `${scheme}//${host}/${key}.txt`;
const res = await fetch(keyLocation, { redirect: 'follow' }).catch((e) => ({ ok: false, status: e.message }));
const body = res.ok ? (await res.text()).trim() : '';
if (!res.ok || body !== key) {
  die(`the key file is not reachable or does not match (${res.status ?? 'no response'}) at ${keyLocation.replace(key, '<key>')}.\n` +
    'Host a plain text file with exactly the key at that address, then run again.');
}
process.stdout.write(`Key file OK at ${keyLocation.replace(key, '<key>')}\n`);

if (v['dry-run']) {
  process.stdout.write(`Dry run: would submit ${urls.length} URL(s) for ${host}:\n${urls.map((u) => `  ${u}`).join('\n')}\n`);
  process.exit(0);
}

const MEANING = {
  200: 'OK, received',
  202: 'Accepted; the key will be validated later',
  400: 'Bad request: invalid format',
  403: 'Forbidden: the key is not valid or the key file does not match',
  422: 'Unprocessable: some URLs do not belong to the host or the key location does not match',
  429: 'Too many requests: try again later',
};

let failed = false;
for (let i = 0; i < urls.length; i += 10000) {
  const batch = urls.slice(i, i + 10000);
  const payload = { host, key, urlList: batch };
  if (v['key-location']) payload.keyLocation = v['key-location'];
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  }).catch((e) => ({ ok: false, status: e.message }));
  process.stdout.write(`Submitted ${batch.length} URL(s): ${r.status} ${MEANING[r.status] || ''}\n`);
  if (!(r.status === 200 || r.status === 202)) failed = true;
}
process.stdout.write('IndexNow is a hint, not a guarantee of crawling. Bing usually picks pages up within days.\n');
process.exit(failed ? 1 : 0);
