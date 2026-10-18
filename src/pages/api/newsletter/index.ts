/* Newsletter, códigos de desconto, cartões presente e avisos de reposição.
   Fala o mesmo "idioma" do antigo Google Apps Script (campo action), por isso o site não muda. */
export const prerender = false;
import type { APIRoute } from 'astro';
import { hasDb } from '../../../lib/server/sql';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async ({ request }) => {
  /* sem base de dados, o site comporta-se como antes (mostra o código, não guarda) */
  if (!hasDb()) return json({ status: 'unknown' });
  const p = new URLSearchParams((await request.text()).slice(0, 5000));
  const action = p.get('action') || 'subscribe';
  const { db } = await import('../../../lib/server/db');
  const { checkCode, giftBalance, isEmail } = await import('../../../lib/server/orders');
  const sql = await db();
  const email = (p.get('email') || '').trim().toLowerCase();
  const cut = (k: string, n = 200) => (p.get(k) || '').slice(0, n);
  const { asLang } = await import('../../../i18n/server');
  const lang = asLang(p.get('lang'));

  try {
    if (action === 'gift') return json(await giftBalance(cut('code', 40)));

    if (action === 'code') {
      const r = await checkCode(cut('code', 40), email, Number(p.get('goods')) || 0, lang);
      return json(r.ok ? { status: 'ok', code: r.code, kind: r.kind, value: r.value, welcome: r.welcome } : { status: 'invalid', message: r.message });
    }

    if (!isEmail(email)) return json({ status: 'error', error: 'email inválido' }, 400);

    if (action === 'notify') {
      const product = cut('product', 120), size = cut('size', 20);
      const [dup] = await sql`select 1 from notify_requests where email = ${email} and product = ${product} and size = ${size} and notified_at is null`;
      if (dup) return json({ status: 'exists' });
      await sql`insert into notify_requests (email, product, size, page, lang) values (${email}, ${product}, ${size}, ${cut('page')}, ${lang})`;
      return json({ status: 'new' });
    }

    const [sub] = await sql<any[]>`select * from subscribers where email = ${email}`;
    const subscribed = Boolean(sub && !sub.unsubscribed_at);
    const [welcome] = await sql<any[]>`select code from discount_codes where welcome = true and active = true limit 1`;
    const used = welcome ? Boolean((await sql`select 1 from code_uses u where code = ${welcome.code} and email = ${email} and not exists (select 1 from orders o where o.number = u.order_number and (o.status = 'cancelada' or (o.status = 'pendente' and o.stripe_session <> '')))`).length) : false;

    if (action === 'check') return json({ status: subscribed ? 'exists' : 'new', subscribed, used });
    /* o uso do código fica registado quando a encomenda é gravada */
    if (action === 'redeem') return json({ status: 'exists', subscribed, used: true });

    if (subscribed) return json({ status: 'exists', subscribed: true, used });
    await sql`
      insert into subscribers (email, source, page, consent, lang) values (${email}, ${cut('source', 40)}, ${cut('page')}, ${cut('consent', 10)}, ${lang})
      on conflict (email) do update set unsubscribed_at = null, consent = excluded.consent, lang = excluded.lang`;
    /* o email de boas-vindas só segue a quem ainda não teve o desconto */
    if (!sub && !used) {
      const { sendWelcome } = await import('../../../lib/server/newsletter');
      await sendWelcome(sql, email).catch((e) => console.error('[Mekie] Email de boas-vindas falhou:', e));
    }
    return json({ status: 'new', subscribed: true, used });
  } catch (e) {
    console.error('[Mekie] Erro na API da newsletter:', e);
    return json({ status: 'error' }, 500);
  }
};
