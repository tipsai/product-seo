// Gets an access token for the Search Console API without any npm packages.
// Supported, in this order:
//   GSC_ACCESS_TOKEN               a ready token, e.g. from `gcloud auth print-access-token`
//   GSC_SERVICE_ACCOUNT_FILE       a service-account JSON key (recommended)
//   GOOGLE_APPLICATION_CREDENTIALS the standard variable; a service-account key or an
//                                  "authorized_user" file written by `gcloud auth application-default login`,
//                                  or a token.json with a refresh token saved by a Google client library
// Credentials are read, never printed.
import { readFileSync, existsSync } from 'node:fs';
import { createSign } from 'node:crypto';
import { die } from './common.mjs';

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

const b64url = (s) => Buffer.from(s).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

async function tokenRequest(body) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    die(`Google refused the credentials (${res.status} ${data.error || ''} ${data.error_description || ''}).`.trim());
  }
  return data.access_token;
}

async function fromServiceAccount(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(JSON.stringify({ iss: key.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }));
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(key.private_key).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return tokenRequest({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${header}.${claims}.${signature}` });
}

async function fromAuthorizedUser(cred) {
  return tokenRequest({
    grant_type: 'refresh_token',
    client_id: cred.client_id,
    client_secret: cred.client_secret,
    refresh_token: cred.refresh_token,
  });
}

export async function getAccessToken() {
  if (process.env.GSC_ACCESS_TOKEN) return process.env.GSC_ACCESS_TOKEN;
  const file = process.env.GSC_SERVICE_ACCOUNT_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!file) {
    die('no Search Console credentials. Set GSC_SERVICE_ACCOUNT_FILE to the path of a service-account JSON key ' +
      '(see references/setup.md), or work from a CSV export instead.');
  }
  if (!existsSync(file)) die(`the credentials file set in GSC_SERVICE_ACCOUNT_FILE does not exist: ${file}`);
  let cred;
  try {
    cred = JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    die('the credentials file is not valid JSON.');
  }
  if (cred.type === 'service_account' && cred.private_key && cred.client_email) return fromServiceAccount(cred);
  // authorized_user files from gcloud, and token.json files saved by Google's client libraries (no "type" field).
  if ((cred.type === 'authorized_user' || !cred.type) && cred.refresh_token && cred.client_id && cred.client_secret) return fromAuthorizedUser(cred);
  die('the credentials file is neither a service-account key nor an authorized_user file. ' +
    'An OAuth "client secret" file alone cannot be used; create a service-account key as described in references/setup.md.');
}
