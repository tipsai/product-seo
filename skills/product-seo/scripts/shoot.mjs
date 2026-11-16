#!/usr/bin/env node
// Screenshots a live page at several widths, or renders a local HTML file to PNG.
// Needs Playwright in the current project: npm i -D playwright && npx playwright install chromium
import { createRequire } from 'node:module';
import { mkdirSync, existsSync } from 'node:fs';
import { resolve, join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { args, die } from './lib/common.mjs';

const HELP = `
shoot: screenshots for checking pages and making images.

Usage:
  node scripts/shoot.mjs --url https://example.com/blog/post
  node scripts/shoot.mjs --url https://example.com/blog/post --widths 1440,390 --out seo/shots
  node scripts/shoot.mjs --html seo/images/cover.html --width 1536 --height 1024 --out seo/images/cover.png

Live page mode (--url): full-page screenshots at each width. The page is scrolled to the
bottom first so lazy images load. Files: <out>/<slug>-<width>.png
HTML mode (--html): renders a local file at a fixed size and 2x density, for images
whose text and interface should be real typography, not generated letters.

Options:
  --url <url>         live page
  --widths <list>     comma-separated widths for --url (default: 1440,900,390)
  --html <file>       local HTML file
  --width <px>        width for --html (default: 1536)
  --height <px>       height for --html (default: 1024)
  --scale <n>         device scale factor (default: 2)
  --full              for --html, capture the full page height instead of --height
  --out <path>        folder for --url (default: seo/shots), file for --html (default: <name>.png)

Requires Playwright installed in the current folder's project:
  npm i -D playwright && npx playwright install chromium
`;

const { values: v } = args({
  url: { type: 'string' },
  widths: { type: 'string', default: '1440,900,390' },
  html: { type: 'string' },
  width: { type: 'string', default: '1536' },
  height: { type: 'string', default: '1024' },
  scale: { type: 'string', default: '2' },
  full: { type: 'boolean', default: false },
  out: { type: 'string' },
}, HELP);

if (!v.url && !v.html) die('pass --url or --html. Run with --help.');

let chromium;
try {
  const require = createRequire(join(process.cwd(), 'package.json'));
  ({ chromium } = require('playwright'));
} catch {
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    die('Playwright is not installed in this project. Run: npm i -D playwright && npx playwright install chromium');
  }
}

const browser = await chromium.launch().catch((e) => die(`could not start Chromium (${e.message.split('\n')[0]}). Run: npx playwright install chromium`));
try {
  if (v.url) {
    const dir = resolve(v.out || 'seo/shots');
    mkdirSync(dir, { recursive: true });
    const slug = (new URL(v.url).pathname.replace(/\/$/, '').split('/').pop() || 'home').replace(/[^\w-]+/g, '-');
    for (const w of v.widths.split(',').map(Number).filter(Boolean)) {
      const mobile = w < 600;
      const ctx = await browser.newContext({ viewport: { width: w, height: mobile ? 844 : 900 }, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile });
      const page = await ctx.newPage();
      const res = await page.goto(v.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      // Scroll to the bottom so lazy images load. A redirect or a late script can reset the page; try twice.
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
          await page.evaluate(async () => {
            for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); }
            window.scrollTo(0, 0);
          });
          break;
        } catch (e) {
          if (attempt === 1) process.stderr.write(`  could not scroll the page (${e.message.split('\n')[0]}); lazy images may be missing\n`);
        }
      }
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      const file = join(dir, `${slug}-${w}.png`);
      await page.screenshot({ path: file, fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      process.stdout.write(`${w}px: ${file} (HTTP ${res?.status() ?? '?'})${overflow ? '  WARNING: page is wider than the screen (horizontal scroll)' : ''}\n`);
      await ctx.close();
    }
  } else {
    const src = resolve(v.html);
    if (!existsSync(src)) die(`file not found: ${v.html}`);
    const out = resolve(v.out || basename(src).replace(/\.html?$/i, '') + '.png');
    const ctx = await browser.newContext({ viewport: { width: Number(v.width), height: Number(v.height) }, deviceScaleFactor: Number(v.scale) });
    const page = await ctx.newPage();
    await page.goto(pathToFileURL(src).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.screenshot({ path: out, fullPage: v.full });
    process.stdout.write(`Rendered ${v.html} at ${v.width}x${v.full ? 'full' : v.height}, ${v.scale}x: ${out}\n`);
    await ctx.close();
  }
} finally {
  await browser.close();
}
