/* Recebe a encomenda do checkout. Preços, portes e descontos são recalculados aqui. */
export const prerender = false;
import type { APIRoute } from 'astro';
import { hasDb } from '../../../lib/server/sql';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

export const POST: APIRoute = async ({ request }) => {
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
    const { createOrder } = await import('../../../lib/server/orders');
    const res = await createOrder(body);
    return json(res, 'error' in res ? 422 : 200);
  } catch (e) {
    console.error('[Mekie] Erro ao gravar encomenda:', e);
    return json({ error: 'Não conseguimos gravar a encomenda.' }, 500);
  }
};
