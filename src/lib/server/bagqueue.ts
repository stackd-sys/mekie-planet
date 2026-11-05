/* Prazo das malas personalizadas: a cada 5 encomendas por fazer, mais 7 dias úteis em todas as malas.
   O prazo fica escrito nas páginas, por isso quando se passa um limite (para cima ou para baixo) o site volta a ser gerado. */
import { db } from './db';
import { products, bagQueue } from '../../data/products';
import { openOrdersWith } from './overrides';
import { rebuildSite } from './deploy';

const ids = products.filter((p) => p.category === 'malas' && p.customizable).map((p) => p.id);
export const touchesBagQueue = (lines: { id: number | string }[]) => lines.some((l) => ids.includes(Number(l.id)));
export const extraFor = (open: number) => Math.floor(open / bagQueue.every) * bagQueue.days;

export async function syncBagQueue() {
  try {
    const open = await openOrdersWith(ids);
    const extra = extraFor(open);
    const sql = await db();
    const [row] = await sql<any[]>`select value from settings where key = 'bag_queue'`;
    const before = row ? Number(row.value.extra) : bagQueue.extra;
    await sql`
      insert into settings (key, value) values ('bag_queue', ${sql.json({ open, extra })})
      on conflict (key) do update set value = excluded.value`;
    if (extra !== before) {
      await rebuildSite(`Prazo das malas: ${extra ? `mais ${extra} dias úteis` : 'prazo normal'} (${open} personalizadas por fazer)`);
    }
    return { open, extra };
  } catch (e) {
    console.error('[Mekie] Prazo das malas:', (e as Error).message);
    return null;
  }
}
