// Shared helpers for the product-seo scripts. Node.js 18+, standard library only.
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { parseArgs } from 'node:util';

export function die(message, code = 1) {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(code);
}

// Reads KEY=value lines from .env in the current working directory (the user's project).
// Existing environment variables win. Values are never printed.
export function loadEnv(file = resolve(process.cwd(), '.env')) {
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).replace(/^export\s+/, '').trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export function args(options, help) {
  let parsed;
  try {
    parsed = parseArgs({ options: { help: { type: 'boolean', short: 'h' }, ...options }, allowPositionals: true });
  } catch (e) {
    die(`${e.message}\nRun with --help to see the options.`);
  }
  if (parsed.values.help) {
    process.stdout.write(help.trim() + '\n');
    process.exit(0);
  }
  return parsed;
}

// ---------- CSV ----------

export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  text = text.replace(/^﻿/, '');
  // Search Console exports use commas; some spreadsheet locales save with ; or tabs.
  const first = text.split(/\r?\n/, 1)[0];
  const count = (ch) => first.split(ch).length - 1;
  const sep = [',', ';', '\t'].sort((a, b) => count(b) - count(a))[0];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((f) => f !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f !== '')) rows.push(row);
  return rows;
}

function csvCell(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function writeCsv(file, header, rows) {
  mkdirSync(dirname(resolve(file)), { recursive: true });
  const lines = [header.map(csvCell).join(','), ...rows.map((r) => header.map((h) => csvCell(r[h])).join(','))];
  writeFileSync(file, lines.join('\n') + '\n', 'utf8');
}

// ---------- Rows ----------
// The shared format is JSON Lines, one object per row:
// {"date":"2026-10-01","query":"...","page":"https://...","clicks":3,"impressions":120,"ctr":0.025,"position":9.4}
// Any of date/query/page may be absent, depending on the dimensions that were fetched.

function num(v) {
  if (typeof v === 'number') return v;
  const s = String(v ?? '').trim().replace(/\s/g, '').replace('%', '');
  if (s === '') return 0;
  // "1,234" (thousands) vs "9,4" (decimal comma)
  if (/^\d{1,3}(,\d{3})+$/.test(s)) return Number(s.replace(/,/g, ''));
  return Number(s.replace(',', '.'));
}

// Search Console UI export: Queries.csv, Pages.csv, Dates.csv, ... in the UI language.
// Columns are always: key, clicks, impressions, CTR, position. The key type comes from the
// first header cell or, failing that, from the file name.
function detectKey(header, file) {
  const h = `${header} ${basename(file)}`.toLowerCase();
  if (/quer|запрос|consulta|requête|anfrage/.test(h)) return 'query';
  if (/page|страниц|página|seite/.test(h)) return 'page';
  if (/date|дата|fecha|datum/.test(h)) return 'date';
  if (/countr|стран/.test(h)) return 'country';
  if (/device|устройств/.test(h)) return 'device';
  return null;
}

export function readRows(files) {
  const out = [];
  for (const file of files) {
    if (!existsSync(file)) die(`file not found: ${file}`);
    const text = readFileSync(file, 'utf8');
    if (/\.jsonl?$/i.test(file)) {
      const trimmed = text.trim();
      if (trimmed.startsWith('[')) {
        for (const r of JSON.parse(trimmed)) out.push(normalize(r));
      } else {
        for (const line of trimmed.split(/\r?\n/)) if (line.trim()) out.push(normalize(JSON.parse(line)));
      }
      continue;
    }
    const table = parseCsv(text);
    if (table.length < 2) continue;
    const header = table[0];
    const lower = header.map((h) => h.toLowerCase().trim());
    // Our own CSV (written by these scripts) has named columns.
    if (lower.includes('clicks') && lower.includes('impressions') && (lower.includes('query') || lower.includes('page') || lower.includes('date'))) {
      for (const cells of table.slice(1)) {
        const r = {};
        lower.forEach((h, i) => { r[h] = cells[i]; });
        out.push(normalize(r));
      }
      continue;
    }
    const key = detectKey(header[0], file);
    if (!key) die(`cannot tell what ${basename(file)} contains. Expected a Search Console export (Queries, Pages or Dates) or a .jsonl rows file.`);
    if (key === 'country' || key === 'device') continue;
    for (const cells of table.slice(1)) {
      out.push(normalize({ [key]: cells[0], clicks: cells[1], impressions: cells[2], ctr: cells[3], position: cells[4] }));
    }
  }
  return out;
}

function normalize(r) {
  const row = {};
  if (r.date) row.date = String(r.date).slice(0, 10);
  if (r.query) row.query = String(r.query).trim();
  // Search Console reports jump links (#section) as separate URLs; they are the same page.
  if (r.page) row.page = String(r.page).trim().replace(/#.*$/, '');
  row.clicks = num(r.clicks);
  row.impressions = num(r.impressions);
  row.position = num(r.position);
  row.ctr = row.impressions ? row.clicks / row.impressions : 0;
  return row;
}

// Sums rows by the given key function. Position is weighted by impressions.
export function aggregate(rows, keyFn) {
  const map = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    if (k === null || k === undefined) continue;
    let a = map.get(k);
    if (!a) { a = { key: k, clicks: 0, impressions: 0, posWeight: 0, sample: r }; map.set(k, a); }
    a.clicks += r.clicks;
    a.impressions += r.impressions;
    a.posWeight += r.position * r.impressions;
  }
  for (const a of map.values()) {
    a.position = a.impressions ? a.posWeight / a.impressions : 0;
    a.ctr = a.impressions ? a.clicks / a.impressions : 0;
  }
  return [...map.values()];
}

export function dateRange(rows) {
  const dates = rows.map((r) => r.date).filter(Boolean).sort();
  return dates.length ? `${dates[0]} to ${dates[dates.length - 1]}` : null;
}

// ---------- Text ----------

const STOP = new Set(('a an and are as at be by can do for from how i in is it my of on or the to vs what with without your you ' +
  'и в во на с со по для как что это или ли не из к у о об от до за же бы а но').split(' '));

export function words(text) {
  return String(text || '').toLowerCase().normalize('NFKC')
    .split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1 && !STOP.has(w));
}

// A query word counts as present when a token starts with its stem.
// The stem trims endings so that "transcribing" matches "transcribe" and "транскрибацию" matches "транскрибация".
export function stem(word) {
  if (word.length <= 4) return word;
  return word.slice(0, Math.max(4, Math.ceil(word.length * 0.75)));
}

export function hasWord(tokens, word) {
  const s = stem(word);
  return tokens.some((t) => (word.length <= 4 ? t === word : t.startsWith(s)));
}

// ---------- Output ----------

export const pct = (x, digits = 1) => `${(x * 100).toFixed(digits)}%`;
export const fix = (x, digits = 1) => (Number.isFinite(x) ? x.toFixed(digits) : '');
export const int = (x) => Math.round(x).toLocaleString('en-US');

export function mdTable(header, rows) {
  if (!rows.length) return '_nothing found_\n';
  const esc = (v) => String(v ?? '').replace(/\|/g, '\\|');
  return [
    `| ${header.join(' | ')} |`,
    `|${header.map(() => '---').join('|')}|`,
    ...rows.map((r) => `| ${r.map(esc).join(' | ')} |`),
  ].join('\n') + '\n';
}

export function shortUrl(url) {
  try {
    const u = new URL(url);
    return u.pathname + u.search || '/';
  } catch {
    return url;
  }
}
