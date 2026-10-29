/* Chamado pela Vercel (vercel.json, "crons") no início e no fim da promoção:
   volta a construir o site para os preços e o banner mudarem nas páginas. */
export const prerender = false;
import type { APIRoute } from 'astro';
import { rebuildSite } from '../../../lib/server/deploy';

export const GET: APIRoute = async ({ request }) => {
  /* com CRON_SECRET na Vercel, a Vercel envia-o no cabeçalho; sem ele, só aceita o agendador da Vercel */
  const secret = process.env.CRON_SECRET;
  const ok = secret
    ? request.headers.get('authorization') === `Bearer ${secret}`
    : (request.headers.get('user-agent') || '').startsWith('vercel-cron');
  if (!ok) return new Response('Recusado.', { status: 401 });
  const done = await rebuildSite('Início ou fim da promoção');
  return new Response(done ? 'Site a reconstruir.' : 'Sem deploy hook.', { status: done ? 200 : 500 });
};
