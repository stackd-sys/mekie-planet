/* Preço e stock vindos do CRM. Usado na construção do site e nas funções do servidor.
   Se não houver base de dados (ou ainda estiver vazia), ficam os valores de src/data/products.ts. */
import { hasDb, sql } from './sql';

type Row = { id: number; price: number; stock: number | null; size_stock: Record<string, number> | null };
type Target = { id: number; price: number; stock?: number; sizeStock?: Record<string, number> };

export async function applyOverrides(list: Target[]) {
  if (!hasDb()) return;
  try {
    const rows = await sql()<Row[]>`select id, price, stock, size_stock from products_state`;
    const byId = new Map(rows.map((r) => [r.id, r]));
    for (const p of list) {
      const r = byId.get(p.id);
      if (!r) continue;
      p.price = Number(r.price);
      if (r.size_stock && p.sizeStock) p.sizeStock = { ...p.sizeStock, ...r.size_stock };
      else if (r.stock !== null && r.stock !== undefined) p.stock = r.stock;
    }
  } catch (e) {
    console.warn('[Mekie] Sem stock do CRM, uso os valores do código:', (e as Error).message);
  }
}
