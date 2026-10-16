/* Google Analytics 4 (Data API) com uma conta de serviço, só leitura.
   Variáveis: GA4_PROPERTY_ID (número da propriedade) e GOOGLE_SERVICE_ACCOUNT (o JSON da chave, ou em base64). */
import { createSign } from 'node:crypto';

export const hasGa = () => Boolean(process.env.GA4_PROPERTY_ID && process.env.GOOGLE_SERVICE_ACCOUNT);

type Key = { client_email: string; private_key: string };
let token: { value: string; exp: number } | null = null;

function key(): Key {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT || '';
  return JSON.parse(raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8'));
}

async function accessToken() {
  if (token && token.exp > Date.now() + 60_000) return token.value;
  const k = key();
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: k.client_email, scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  })}`;
  const sig = createSign('RSA-SHA256').update(unsigned).sign(k.private_key, 'base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Google recusou a chave: ${data.error_description || data.error}`);
  token = { value: data.access_token, exp: Date.now() + data.expires_in * 1000 };
  return token.value;
}

const cache = new Map<string, { at: number; data: any }>();

/** Relatório do GA4. Fica em memória 10 minutos. */
export async function gaReport(body: Record<string, unknown>) {
  const id = JSON.stringify(body);
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < 600_000) return hit.data;
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA4_PROPERTY_ID}:runReport`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Google Analytics respondeu ${res.status}`);
  cache.set(id, { at: Date.now(), data });
  return data;
}

/** Linhas do relatório como objetos { dimensão: valor, métrica: número } */
export function rows(report: any): Record<string, any>[] {
  const dims = (report.dimensionHeaders ?? []).map((h: any) => h.name);
  const mets = (report.metricHeaders ?? []).map((h: any) => h.name);
  return (report.rows ?? []).map((r: any) => ({
    ...Object.fromEntries(dims.map((d: string, i: number) => [d, r.dimensionValues[i].value])),
    ...Object.fromEntries(mets.map((m: string, i: number) => [m, Number(r.metricValues[i].value)])),
  }));
}

export const range = (days: number) => [{ startDate: `${days}daysAgo`, endDate: 'today' }];
