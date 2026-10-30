/* Contagem anónima de visitas: conta páginas, entradas e passos da compra de toda a gente,
   incluindo quem recusou ou não respondeu ao aviso de cookies. Não usa cookies nem guarda
   IP, identificadores ou o browser: só soma +1 a totais do dia. */
export const prerender = false;
import type { APIRoute } from 'astro';
import { hasDb } from '../../../lib/server/sql';

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|headless|lighthouse|pingdom|monitor/i;
const EVENTS = ['view_item', 'add_to_cart', 'begin_checkout', 'purchase', 'sign_up'];
const CONSENT = ['sim', 'nao', 'sem'];
const clip = (v: unknown, n: number) => String(v ?? '').trim().toLowerCase().slice(0, n);
const ok = () => new Response(null, { status: 204 });

export const POST: APIRoute = async ({ request, url }) => {
  if (!hasDb()) return ok();
  const ua = request.headers.get('user-agent') || '';
  if (!ua || BOT.test(ua)) return ok();
  let b: any;
  try { b = JSON.parse((await request.text()).slice(0, 2000)); } catch { return ok(); }
  const consent = CONSENT.includes(b?.c) ? b.c : 'sem';
  const rows: [string, string][] = [];

  if (b?.t === 'pageview') {
    const path = clip(b.p, 120).split('?')[0] || '/';
    if (!path.startsWith('/') || path.startsWith('/admin') || path.startsWith('/api')) return ok();
    rows.push(['pagina', path]);
    const ref = clip(b.r, 80).replace(/^www\./, '');
    const own = url.host.replace(/^www\./, '');
    /* entrada no site: veio de fora (ou abriu diretamente), não de outra página da loja */
    if (ref !== own) {
      const source = clip(b.u, 40) || (ref ? ref.replace(/^(l|m|lm)\.(facebook|instagram)\.com$/, '$2.com') : 'direto');
      rows.push(['entrada', source], ['aparelho', /Mobi|Android|iPhone|iPod/i.test(ua) ? 'telemóvel' : /iPad|Tablet/i.test(ua) ? 'tablet' : 'computador']);
    }
  } else if (b?.t === 'event' && EVENTS.includes(b.e)) {
    rows.push(['evento', b.e]);
  } else return ok();

  try {
    const { db } = await import('../../../lib/server/db');
    const sql = await db();
    const day = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Lisbon' });
    await sql`insert into stats ${sql(rows.map(([metric, dim]) => ({ day, metric, dim, consent, n: 1 })))}
      on conflict (day, metric, dim, consent) do update set n = stats.n + 1`;
  } catch (e) {
    console.error('[Mekie] Estatística não gravada:', (e as Error).message);
  }
  /* aproveita a visita para lembrar quem deixou o pagamento a meio (no máximo de 10 em 10 minutos) */
  const { maybeRecoverCheckouts } = await import('../../../lib/server/recovery');
  await maybeRecoverCheckouts();
  return ok();
};
