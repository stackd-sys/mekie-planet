/* Chamado pela Vercel (vercel.json, "crons") todos os dias às 00:05.
   Só volta a construir o site nos dias em que alguma coisa muda sozinha:
   início ou fim da promoção, Halloween, artigos do blog agendados e notas nos artigos. */
export const prerender = false;
import type { APIRoute } from 'astro';
import { rebuildSite } from '../../../lib/server/deploy';
import { promo } from '../../../data/promo';
import { halloween } from '../../../data/season';
import { blogChangeDays } from '../../../data/blog';

const day = (iso: string) => iso.slice(0, 10);
const changeDays = () => new Set([day(promo.start), day(promo.end), ...seasonDays(), ...blogChangeDays]);
const seasonDays = () => [day(halloween.start), day(halloween.end)];

export const GET: APIRoute = async ({ request }) => {
  /* com CRON_SECRET na Vercel, a Vercel envia-o no cabeçalho; sem ele, só aceita o agendador da Vercel */
  const secret = process.env.CRON_SECRET;
  const ok = secret
    ? request.headers.get('authorization') === `Bearer ${secret}`
    : (request.headers.get('user-agent') || '').startsWith('vercel-cron');
  if (!ok) return new Response('Recusado.', { status: 401 });
  const today = new Date().toISOString().slice(0, 10);
  if (!changeDays().has(today) && !new URL(request.url).searchParams.has('forcar')) return new Response('Nada para mudar hoje.');
  const done = await rebuildSite('Mudança agendada (promoção, época ou blog)');
  return new Response(done ? 'Site a reconstruir.' : 'Sem deploy hook.', { status: done ? 200 : 500 });
};
