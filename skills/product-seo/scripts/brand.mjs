#!/usr/bin/env node
// Reads a site's visual style (colours, fonts, logo) so images match the site, not a default look.
// Needs Playwright in the current project: npm i -D playwright && npx playwright install chromium
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { args, die } from './lib/common.mjs';

const HELP = `
brand: read a website's colours, fonts and logo, and write them down for image work.

Usage:
  node scripts/brand.mjs --url https://example.com
  node scripts/brand.mjs --url https://example.com --url https://example.com/blog/some-post --out seo/brand.md

What it records:
  - background, text, heading, link and button colours as the browser computes them
  - colours defined as CSS variables, and the most used colours on the page
  - heading and body fonts, and whether they come from Google Fonts
  - the logo image or SVG and the favicon
  - a screenshot of each page at 1440 px, saved next to the output file
Use the result to fill the tokens in assets/cover-template.html and the palette in
assets/prompts/image-object.md. Check it with the owner: a site can use more colours than its brand.

Options:
  --url <url>     a page of the site; repeat to read several (home page and a blog post work well)
  --out <file>    where to write the summary (default: seo/brand.md)
`;

const { values: v } = args({ url: { type: 'string', multiple: true }, out: { type: 'string', default: 'seo/brand.md' } }, HELP);
if (!v.url?.length) die('pass at least one --url. Run with --help.');

let chromium;
try { ({ chromium } = createRequire(join(process.cwd(), 'package.json'))('playwright')); }
catch { try { ({ chromium } = await import('playwright')); } catch { die('Playwright is not installed in this project. Run: npm i -D playwright && npx playwright install chromium'); } }

const out = resolve(v.out);
mkdirSync(dirname(out), { recursive: true });
const browser = await chromium.launch();
const lines = [`# Brand: ${new URL(v.url[0]).host}`, '', `Read on ${new Date().toISOString().slice(0, 10)} from: ${v.url.join(', ')}`, ''];

try {
  for (const [n, url] of v.url.entries()) {
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    const shot = join(dirname(out), `brand-${n + 1}.png`);
    await page.screenshot({ path: shot });
    const d = await page.evaluate(() => {
      const hex = (c) => {
        const m = c && c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);
        if (!m || (m[4] !== undefined && Number(m[4]) < 0.5)) return null;
        return '#' + [m[1], m[2], m[3]].map((x) => Math.round(+x).toString(16).padStart(2, '0')).join('').toUpperCase();
      };
      const cs = (el) => (el ? getComputedStyle(el) : null);
      const first = (sel) => document.querySelector(sel);
      const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      // background: the first opaque background from body down to the main content
      let bg = null;
      for (const el of [document.body, document.documentElement, first('main'), first('#__next'), first('#root')]) { if (!bg && el) bg = hex(cs(el).backgroundColor); }
      const h = [...document.querySelectorAll('h1')].find(visible) || [...document.querySelectorAll('h2')].find(visible);
      const p = [...document.querySelectorAll('main p, article p, p')].find(visible);
      const a = [...document.querySelectorAll('main a, article a, p a')].find(visible);
      const btn = [...document.querySelectorAll('header a[class*="btn" i], header a[class*="button" i], header a[class*="cta" i], button, a[class*="btn" i], a[class*="button" i], a[class*="cta" i], [role="button"]')]
        .filter(visible).map((el) => ({ el, bg: hex(cs(el).backgroundColor) })).find((x) => x.bg && x.bg !== '#FFFFFF' && x.bg !== bg);
      // CSS variables that hold colours
      const vars = {};
      for (const sheet of [...document.styleSheets]) {
        let rules; try { rules = sheet.cssRules; } catch { continue; }
        for (const r of rules || []) {
          if (!r.style || !/^(:root|html|body)$/.test((r.selectorText || '').trim())) continue;
          for (const name of r.style) {
            if (!name.startsWith('--')) continue;
            const val = r.style.getPropertyValue(name).trim();
            if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val) || /^rgb/i.test(val)) vars[name] = val;
          }
        }
      }
      // most used colours across visible elements (text and backgrounds)
      const count = {};
      for (const el of [...document.querySelectorAll('body *')].slice(0, 4000)) {
        if (!visible(el)) continue;
        const s = cs(el);
        for (const c of [s.color, s.backgroundColor]) { const x = hex(c); if (x) count[x] = (count[x] || 0) + 1; }
      }
      const top = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([c, k]) => `${c} (${k})`);
      const fonts = [...document.querySelectorAll('link[href*="fonts.googleapis.com"]')].map((l) => l.href);
      const pick = (sels) => { for (const sel of sels) { const el = [...document.querySelectorAll(sel)].find(visible); if (el) return el; } return null; };
      // the logo is usually the image inside the link to the home page, near the top of the page
      const home = [...document.querySelectorAll('a')].filter((x) => {
        try { const u = new URL(x.href, location.href); return u.host === location.host && /^\/?$/.test(u.pathname) && visible(x) && x.getBoundingClientRect().top < 200; }
        catch { return false; }
      });
      const inHome = home.map((x) => x.querySelector('img, svg')).find(Boolean);
      const logoEl = inHome || pick(['header [class*="logo" i] img', 'header [class*="logo" i] svg', 'nav [class*="logo" i] img', 'nav [class*="logo" i] svg', 'header img', 'header svg']);
      const logo = logoEl && logoEl.tagName === 'IMG' ? logoEl : null;
      const logoSvg = logoEl && logoEl.tagName !== 'IMG' ? logoEl : null;
      const icon = first('link[rel~="icon"]');
      return {
        title: document.title,
        bg: bg || '#FFFFFF (body has no background of its own)', text: hex(cs(p)?.color), heading: hex(cs(h)?.color), link: hex(cs(a)?.color), button: btn?.bg || null,
        headingFont: cs(h)?.fontFamily || null, headingWeight: cs(h)?.fontWeight || null, bodyFont: cs(p)?.fontFamily || null,
        radius: btn ? cs(btn.el).borderRadius : null,
        vars, top, fonts,
        logo: logo ? logo.currentSrc || logo.src : logoSvg ? 'inline SVG in the header' : null,
        favicon: icon ? icon.href : null,
      };
    });
    lines.push(`## ${url} (HTTP ${res?.status() ?? '?'})`, '');
    lines.push(`Screenshot: ${shot.replace(/\\/g, '/')}`, '');
    lines.push('| Role | Value |', '|---|---|');
    for (const [k, label] of [['bg', 'Page background'], ['text', 'Body text'], ['heading', 'Headings'], ['link', 'Links'], ['button', 'Main button'], ['headingFont', 'Heading font'], ['headingWeight', 'Heading weight'], ['bodyFont', 'Body font'], ['radius', 'Button corner radius'], ['logo', 'Logo'], ['favicon', 'Favicon']]) {
      lines.push(`| ${label} | ${d[k] ?? 'not found'} |`);
    }
    lines.push('');
    if (Object.keys(d.vars).length) lines.push('Colour variables: ' + Object.entries(d.vars).slice(0, 20).map(([k, val]) => `\`${k}: ${val}\``).join(', '), '');
    lines.push('Most used colours: ' + d.top.join(', '), '');
    if (d.fonts.length) lines.push('Google Fonts links: ' + d.fonts.join(' '), '');
  }
} finally {
  await browser.close();
}

lines.push('## For images', '',
  '- Cover tokens (`assets/cover-template.html`): `--bg` from the page background or a light tint of it, `--ink` from the headings, `--accent` from the main button or links, `--font` from the heading font.',
  '- Image prompt palette (`assets/prompts/image-object.md`): the accent, a lighter tint of it, white, a light gray, and the heading colour for tiny accents.',
  '- Attach two or three images from the site as style references if the image model accepts them.',
  '- Confirm with the owner before the first cover: the site may use colours that are not the brand.', '');
writeFileSync(out, lines.join('\n'), 'utf8');
process.stdout.write(lines.join('\n') + `\nSaved to ${v.out}\n`);
