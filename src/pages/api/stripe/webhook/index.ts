/* Avisos da Stripe: pagamento confirmado, Multibanco pago ou por pagar, página de pagamento expirada.
   No painel da Stripe: Programadores > Webhooks > endpoint .../api/stripe/webhook/ com os eventos
   checkout.session.completed, checkout.session.async_payment_succeeded,
   checkout.session.async_payment_failed, checkout.session.expired e charge.refunded (reembolsos). */
export const prerender = false;
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const { verifyWebhook } = await import('../../../../lib/server/stripe');
  const payload = await request.text();
  let event: any;
  try {
    event = verifyWebhook(payload, request.headers.get('stripe-signature'));
  } catch (e) {
    console.warn('[Mekie] Webhook Stripe recusado:', (e as Error).message);
    return new Response('Assinatura inválida', { status: 400 });
  }
  const s = event.data?.object ?? {};

  /* reembolso feito na Stripe (ou pelo CRM): guarda o total já devolvido */
  if (event.type === 'charge.refunded') {
    const pi = typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id;
    if (!pi) return new Response('ok');
    const { db } = await import('../../../../lib/server/db');
    const sql = await db();
    const total = Number(s.amount_refunded || 0) / 100;
    const [o] = await sql<any[]>`update orders set refunded = ${total} where stripe_payment_intent = ${pi} and refunded < ${total} returning id, number`;
    if (o) {
      await sql`insert into order_events (order_id, text, by) values (${o.id}, ${`Reembolsado pela Stripe: ${euro(s.amount_refunded)} no total`}, 'stripe')`;
      const { afterRefund } = await import('../../../../lib/server/orders');
      await afterRefund(o.number, 'stripe');
    }
    return new Response('ok');
  }

  const number: string = s.metadata?.order || s.client_reference_id || '';
  if (!number) return new Response('ok');

  const { db } = await import('../../../../lib/server/db');
  const { setStatus, sendOrderPaid } = await import('../../../../lib/server/orders');
  const sql = await db();
  const [o] = await sql<any[]>`select * from orders where number = ${number}`;
  if (!o) return new Response('ok');
  const note = (text: string) => sql`insert into order_events (order_id, text, by) values (${o.id}, ${text}, 'stripe')`;
  const method = (s.payment_method_types ?? [])[0] ?? '';

  try {
    if ((event.type === 'checkout.session.completed' && s.payment_status === 'paid') || event.type === 'checkout.session.async_payment_succeeded') {
      if (o.status === 'pendente' || o.status === 'cancelada') {
        await sql`update orders set payment_method = ${s.payment_method_types?.join(',') ?? ''}, stripe_payment_intent = ${typeof s.payment_intent === 'string' ? s.payment_intent : ''} where id = ${o.id}`;
        const paid = await setStatus(number, 'paga', 'stripe');
        await note(`Pagamento confirmado pela Stripe (${euro(s.amount_total)})`);
        await sendOrderPaid(paid);
      }
    } else if (event.type === 'checkout.session.completed') {
      await sql`update orders set payment_method = ${method} where id = ${o.id}`;
      await note('A aguardar pagamento por referência Multibanco');
    } else if (event.type === 'checkout.session.async_payment_failed' || event.type === 'checkout.session.expired') {
      if (o.status === 'pendente') {
        await setStatus(number, 'cancelada', 'stripe');
        await note(event.type === 'checkout.session.expired' ? 'Pagamento não concluído (a página de pagamento expirou)' : 'Pagamento Multibanco não foi feito a tempo');
      }
    }
  } catch (e) {
    console.error('[Mekie] Erro no webhook Stripe:', e);
    return new Response('Erro', { status: 500 });
  }
  return new Response('ok');
};

const euro = (cents: number) => `${(Number(cents || 0) / 100).toFixed(2).replace('.', ',')}€`;
