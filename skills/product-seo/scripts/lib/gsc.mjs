// Search Console Search Analytics API, paged.
import { getAccessToken } from './google-auth.mjs';
import { die } from './common.mjs';

const API = 'https://searchconsole.googleapis.com/webmasters/v3/sites';
const PAGE = 25000;

export async function fetchRows({ site, start, end, dims, pageContains, queryContains, type = 'web', fresh = false, log = () => {} }) {
  if (!site) die('no property. Pass --site or set GSC_SITE (for example sc-domain:example.com or https://example.com/).');
  const token = await getAccessToken();
  const filters = [];
  if (pageContains) filters.push({ dimension: 'page', operator: 'contains', expression: pageContains });
  if (queryContains) filters.push({ dimension: 'query', operator: 'contains', expression: queryContains });
  const rows = [];
  for (let startRow = 0; ; startRow += PAGE) {
    const body = { startDate: start, endDate: end, dimensions: dims, rowLimit: PAGE, startRow, type, dataState: fresh ? 'all' : 'final' };
    if (filters.length) body.dimensionFilterGroups = [{ groupType: 'and', filters }];
    const res = await fetch(`${API}/${encodeURIComponent(site)}/searchAnalytics/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error?.message || res.statusText;
      if (res.status === 403) {
        die(`Search Console said 403: ${msg}\nCheck that the service account's email is added as a user of ${site} ` +
          '(Settings, Users and permissions) and that the property is written exactly as in Search Console.');
      }
      die(`Search Console API error ${res.status}: ${msg}`);
    }
    const batch = data.rows || [];
    for (const r of batch) {
      const row = {};
      dims.forEach((d, i) => { row[d] = r.keys[i]; });
      row.clicks = r.clicks;
      row.impressions = r.impressions;
      row.ctr = r.ctr;
      row.position = r.position;
      rows.push(row);
    }
    log(`  fetched ${rows.length} rows`);
    if (batch.length < PAGE) break;
  }
  return rows;
}

// Search Console data lags by about two days; "final" data by about three.
export function lastAvailableDate(fresh = false) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - (fresh ? 2 : 3));
  return d.toISOString().slice(0, 10);
}

export function shiftDate(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
