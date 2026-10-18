/* Recebe a encomenda do checkout. Preços, portes e descontos são recalculados aqui.
   Com a Stripe ligada, devolve o endereço da página de pagamento. */
export const prerender = false;
import type { APIRoute } from 'astro';
import { hasDb } from '../../../lib/server/sql';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async ({ request, url }) => {
  if (!hasDb()) return json({ error: 'sem-crm' }, 503);
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 50_000) return json({ error: 'Pedido demasiado grande.' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: 'Pedido inválido.' }, 400);
  }
  try {
    const { createOrder, setStatus, sendOrderPaid } = await import('../../../lib/server/orders');
    const { hasStripe, createCheckout } = await import('../../../lib/server/stripe');
    const { db } = await import('../../../lib/server/db');
    const stripe = hasStripe();
    /* com a Stripe, os emails saem só quando o pagamento é confirmado */
    const res = await createOrder(body, { emails: !stripe });
    if ('error' in res) return json(res, 422);
    if (!stripe) return json(res);

    const sql = await db();
    const [o] = await sql<any[]>`select * from orders where number = ${res.number!}`;
    if (Number(o.total) <= 0) {
      /* pago por inteiro com cartão presente: não há nada a cobrar */
      const paid = await setStatus(o.number, 'paga', 'site');
      await sql`update orders set payment_method = 'cartao_presente' where id = ${o.id}`;
      await sendOrderPaid(paid);
      return json({ ...res, paid: true });
    }
    let session;
    try {
      session = await createCheckout({ number: o.number, email: o.email, total: Number(o.total), lines: o.lines }, url.origin);
    } catch (e) {
      /* sem página de pagamento a encomenda nunca vai ser paga: cancela já, para não ficar pendente para sempre */
      console.error('[Mekie] Stripe não abriu o pagamento:', e);
      await setStatus(o.number, 'cancelada', 'site');
      await sql`insert into order_events (order_id, text, by) values (${o.id}, ${`A Stripe não abriu a página de pagamento: ${(e as Error).message.replace(/^Stripe: /, '').slice(0, 200)}`}, 'site')`;
      return json({ error: 'O pagamento não está disponível neste momento. Tenta outra vez daqui a pouco ou escreve-nos.' }, 502);
    }
    await sql`update orders set stripe_session = ${session.id} where id = ${o.id}`;
    return json({ ...res, payUrl: session.url });
  } catch (e) {
    console.error('[Mekie] Erro ao gravar encomenda:', e);
    return json({ error: 'Não conseguimos gravar a encomenda.' }, 500);
  }
};
