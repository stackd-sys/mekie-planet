export const prerender = false;
import type { APIRoute } from 'astro';
import { db } from '../../../../lib/server/db';
import { csv, date } from '../../../../lib/server/format';

export const GET: APIRoute = async () => {
  const sql = await db();
  const rows = await sql<any[]>`select email, created_at, source from subscribers where unsubscribed_at is null order by created_at`;
  return new Response(csv([['Email', 'Desde', 'Origem'], ...rows.map((r) => [r.email, date(r.created_at), r.source])]), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="newsletter-mekie-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
};
