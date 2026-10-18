/* Ligações da página Notificações ao servidor: ligar e desligar um aparelho, escolher avisos, enviar um teste. */
export const prerender = false;
import type { APIRoute } from 'astro';
import { db } from '../../../lib/server/db';
import { vapid, sendOne, KINDS, defaultPrefs, type Kind } from '../../../lib/server/push';

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

/** Nome do aparelho para a lista: "iPhone · Safari", "Mac · Chrome" */
function deviceName(ua: string) {
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : 'Computador';
  const br = /Edg\//.test(ua) ? 'Edge' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : '';
  return [os, br].filter(Boolean).join(' · ');
}

export const GET: APIRoute = async () => json({ publicKey: (await vapid()).publicKey });

export const POST: APIRoute = async ({ request, locals }) => {
  const body = await request.json().catch(() => ({}));
  const sql = await db();
  const endpoint = String(body.endpoint ?? body.subscription?.endpoint ?? '').slice(0, 1000);
  if (!/^https:\/\//.test(endpoint)) return json({ error: 'Aparelho inválido.' }, 400);

  if (body.action === 'subscribe') {
    const keys = body.subscription?.keys;
    if (!keys?.p256dh || !keys?.auth) return json({ error: 'Aparelho inválido.' }, 400);
    await sql`
      insert into push_subs (endpoint, keys, email, device, prefs)
      values (${endpoint}, ${sql.json({ p256dh: keys.p256dh, auth: keys.auth })}, ${locals.admin ?? ''}, ${deviceName(request.headers.get('user-agent') || '')}, ${sql.json(defaultPrefs())})
      on conflict (endpoint) do update set keys = excluded.keys, email = excluded.email`;
  }
  const [sub] = await sql<any[]>`select * from push_subs where endpoint = ${endpoint}`;
  if (!sub) return json({ subscribed: false });

  if (body.action === 'prefs' && body.prefs && typeof body.prefs === 'object') {
    const prefs = Object.fromEntries((Object.keys(KINDS) as Kind[]).map((k) => [k, Boolean(body.prefs[k])]));
    await sql`update push_subs set prefs = ${sql.json(prefs)} where endpoint = ${endpoint}`;
  }
  if (body.action === 'unsubscribe') {
    await sql`delete from push_subs where endpoint = ${endpoint}`;
    return json({ subscribed: false });
  }
  if (body.action === 'test') {
    /* só para este aparelho */
    const ok = await sendOne(endpoint, 'Notificações ligadas', 'Vais receber aqui os avisos da Mekie que escolheste.', '/admin/notificacoes/');
    return json({ subscribed: true, sent: ok });
  }
  const [cur] = await sql<any[]>`select prefs, device from push_subs where endpoint = ${endpoint}`;
  return json({ subscribed: true, prefs: { ...defaultPrefs(), ...cur.prefs }, device: cur.device });
};
