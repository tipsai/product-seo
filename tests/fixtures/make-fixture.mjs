// Builds a synthetic Search Console dataset for an invented site. No real data.
import { writeFileSync } from 'node:fs';
const site = 'https://example.com';
const pairs = [
  // query, page, daily impressions, position, ctr
  ['acme notes', '/', 40, 1.2, 0.45],                            // brand
  ['meeting notes template', '/blog/meeting-notes-template', 60, 11.5, 0.01], // striking distance
  ['meeting notes template', '/blog/notes-template-free', 40, 13.0, 0.008],  // competing page
  ['how to take meeting notes', '/blog/meeting-notes-template', 30, 4.5, 0.01], // ctr gap
  ['take notes during calls', '/blog/call-notes', 25, 4.2, 0.08],
  ['call notes app', '/blog/call-notes', 25, 4.8, 0.07],
  ['notes app for teams', '/features', 25, 4.6, 0.06],
  ['voice memo to text', '/blog/call-notes', 30, 15.0, 0.005],   // no dedicated page
];
const start = new Date('2026-09-01T00:00:00Z');
const lines = [];
for (let d = 0; d < 56; d++) {
  const date = new Date(start.getTime() + d * 86400000).toISOString().slice(0, 10);
  const after = date > '2026-09-29';
  for (const [query, path, impr, pos, ctr] of pairs) {
    let p = pos, c = ctr;
    if (path === '/blog/call-notes' && after) { p = pos + 3; c = ctr / 2.5; } // a rewrite that hurt
    const clicks = Math.round(impr * c);
    lines.push(JSON.stringify({ date, query, page: site + path, clicks, impressions: impr, ctr: clicks / impr, position: p }));
  }
}
writeFileSync(new URL('./rows.jsonl', import.meta.url), lines.join('\n') + '\n');
// A Search Console UI style export (queries table, decimal comma, Russian headers).
writeFileSync(new URL('./Queries.csv', import.meta.url),
  '﻿Популярные запросы,Клики,Показы,CTR,Позиция\n"meeting notes template",12,"5 600","0,21%","11,9"\nacme notes,1008,2240,"45%","1,2"\nvoice memo to text,8,1680,"0,48%",15\n');
writeFileSync(new URL('./draft.html', import.meta.url),
  '<html><head><title>Call notes: how to take notes during calls</title></head><body><h1>Take notes during calls</h1><h2>Best call notes app</h2><p>text</p></body></html>');
