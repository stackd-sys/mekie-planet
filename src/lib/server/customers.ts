/* Base de clientes: junta encomendas e newsletter, com grupos simples */
import { db } from './db';

export const SEGMENTS: Record<string, string> = {
  '': 'Todos',
  novos: 'Uma compra',
  recorrentes: 'Voltaram a comprar',
  inativos: 'Sem comprar há 6 meses',
  newsletter: 'Só newsletter',
};

const VALID = "status in ('paga','enviada','entregue')";

export async function listCustomers(segment: string, q: string) {
  const sql = await db();
  const like = `%${q}%`;
  if (segment === 'newsletter') {
    return sql<any[]>`
      select null as id, s.email, '' as name, '' as phone, 0 as orders, 0 as spent, null as last_order, s.created_at as since, true as newsletter
      from subscribers s
      where s.unsubscribed_at is null and not exists (select 1 from customers c where c.email = s.email)
        and (${q} = '' or s.email ilike ${like})
      order by s.created_at desc limit 1000`;
  }
  return sql<any[]>`
    with stats as (
      select customer_id, count(*)::int as orders, coalesce(sum(total), 0) as spent, max(created_at) as last_order
      from orders where ${sql.unsafe(VALID)} group by customer_id
    )
    select c.id, c.email, c.name, c.phone, c.created_at as since,
      coalesce(st.orders, 0) as orders, coalesce(st.spent, 0) as spent, st.last_order,
      exists (select 1 from subscribers s where s.email = c.email and s.unsubscribed_at is null) as newsletter
    from customers c left join stats st on st.customer_id = c.id
    where (${q} = '' or c.email ilike ${like} or c.name ilike ${like} or c.phone ilike ${like})
      and (${segment} = ''
        or (${segment} = 'novos' and coalesce(st.orders, 0) = 1)
        or (${segment} = 'recorrentes' and coalesce(st.orders, 0) >= 2)
        or (${segment} = 'inativos' and st.last_order < now() - interval '180 days'))
    order by coalesce(st.last_order, c.created_at) desc limit 1000`;
}
