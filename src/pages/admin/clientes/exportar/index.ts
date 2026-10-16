export const prerender = false;
import type { APIRoute } from 'astro';
import { listCustomers } from '../../../../lib/server/customers';
import { csv, date } from '../../../../lib/server/format';

export const GET: APIRoute = async ({ url }) => {
  const rows = await listCustomers(url.searchParams.get('grupo') || '', url.searchParams.get('q') || '');
  const body = csv([
    ['Nome', 'Email', 'Telemóvel', 'Encomendas', 'Total gasto', 'Última compra', 'Newsletter'],
    ...rows.map((c) => [c.name, c.email, c.phone, c.orders, Number(c.spent).toFixed(2).replace('.', ','), date(c.last_order), c.newsletter ? 'Sim' : 'Não']),
  ]);
  return new Response(body, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="clientes-mekie-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
};
