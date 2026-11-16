// Run: node --test tests/   (from the repo root). Uses only the synthetic fixture: no real site data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const S = join(root, 'skills', 'product-seo', 'scripts');
const F = join(root, 'tests', 'fixtures');
execFileSync(process.execPath, [join(F, 'make-fixture.mjs')]);
const run = (script, args) => execFileSync(process.execPath, [join(S, script), ...args], { encoding: 'utf8', env: { ...process.env, MSYS_NO_PATHCONV: '1' } });

test('every script prints help', () => {
  for (const s of ['gsc-fetch.mjs', 'opportunities.mjs', 'coverage.mjs', 'measure.mjs', 'indexnow.mjs', 'shoot.mjs', 'brand.mjs']) {
    assert.match(run(s, ['--help']), /Usage:/, s);
  }
});

test('opportunities: striking distance, competing pages, brand split', () => {
  const out = run('opportunities.mjs', [join(F, 'rows.jsonl'), '--brand', 'acme', '--min-impr', '100']);
  assert.match(out, /Brand queries: 1,008 of/);
  assert.match(out, /\| meeting notes template \| \/blog\/meeting-notes-template \| 3,360 \|/);
  assert.match(out, /meeting notes template \| 5,600 \| \/blog\/meeting-notes-template \(60%, 11\.5\)<br>\/blog\/notes-template-free \(40%, 13\.0\)/);
  assert.doesNotMatch(out, /acme notes \|/);
});

test('opportunities: reads a Search Console UI export with Russian headers and decimal commas', () => {
  const out = run('opportunities.mjs', [join(F, 'Queries.csv'), '--brand', 'acme', '--min-impr', '100']);
  assert.match(out, /\| meeting notes template \|  \| 5,600 \| 12 \| 0\.2% \| 11\.9 \|/);
  assert.match(out, /Needs query-page pairs/);
});

test('opportunities: writes CSV', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pseo-'));
  run('opportunities.mjs', [join(F, 'rows.jsonl'), '--min-impr', '100', '--out', join(dir, 'o.csv')]);
  const csv = readFileSync(join(dir, 'o.csv'), 'utf8');
  assert.match(csv, /^section,query,page,/);
  assert.match(csv, /striking_distance,meeting notes template,https:\/\/example\.com\/blog\/meeting-notes-template/);
});

test('coverage: share of impressions whose words are in title and headings', () => {
  const out = run('coverage.mjs', [join(F, 'rows.jsonl'), '--page', '/blog/call-notes', '--html', join(F, 'draft.html')]);
  assert.match(out, /Covered: 62\.5% of 4,480 impressions/);
  assert.match(out, /voice memo to text \| 1,680 \| 0 \| 16\.4 \| voice, memo, text/);
});

test('measure: roll back, keep, watch, too early', () => {
  const rows = join(F, 'rows.jsonl');
  const dir = mkdtempSync(join(tmpdir(), 'pseo-'));
  const log = join(dir, 'change-log.md');
  assert.match(run('measure.mjs', [rows, '--page', '/blog/call-notes', '--date', '2026-09-30', '--log', log]), /Verdict: roll back/);
  assert.ok(existsSync(log));
  assert.match(readFileSync(log, 'utf8'), /verdict: roll back/);
  assert.match(run('measure.mjs', [rows, '--page', '/blog/meeting-notes-template', '--date', '2026-09-30']), /Verdict: keep/);
  assert.match(run('measure.mjs', [rows, '--page', '/blog/call-notes', '--date', '2026-10-12']), /Verdict: watch/);
  assert.match(run('measure.mjs', [rows, '--page', '/blog/call-notes', '--date', '2026-10-22']), /Verdict: too early/);
});

test('indexnow: refuses mixed hosts and a missing key without network calls', () => {
  const env = { ...process.env, INDEXNOW_KEY: '' };
  const call = (args) => { try { execFileSync(process.execPath, [join(S, 'indexnow.mjs'), ...args], { encoding: 'utf8', env, stdio: 'pipe' }); return ''; } catch (e) { return e.stderr; } };
  assert.match(call(['https://a.example.com/x', 'https://b.example.com/y']), /one host/);
  assert.match(call(['https://a.example.com/x']), /INDEXNOW_KEY is not set/);
});

test('gsc-fetch: explains missing credentials instead of crashing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pseo-'));
  const env = { ...process.env, GSC_SERVICE_ACCOUNT_FILE: '', GOOGLE_APPLICATION_CREDENTIALS: '', GSC_ACCESS_TOKEN: '' };
  let err = '';
  try { execFileSync(process.execPath, [join(S, 'gsc-fetch.mjs'), '--site', 'sc-domain:example.com'], { cwd: dir, encoding: 'utf8', env, stdio: 'pipe' }); } catch (e) { err = e.stderr; }
  assert.match(err, /no Search Console credentials/);
});
