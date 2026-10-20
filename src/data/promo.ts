/* Promoção em curso (Black November): desconto por categoria e packs com preço fixo.
   Começa e acaba sozinha nas datas abaixo. O site é reconstruído nesses dias (vercel.json, "crons"),
   e o servidor confirma sempre os preços com a data do momento da compra.
   Para ver a promoção antes do tempo, em local: PROMO_PREVIEW=1 na construção do site. */

export type Kind = 'hoodie' | 'crewneck' | 'tshirt' | 'cap';

export type Pack = {
  id: string;
  /** peças que entram no pack: uma de cada grupo */
  parts: [Kind[], Kind[]];
  price: number;
};

export const promo = {
  id: 'black-november',
  name: 'Black November',
  /* hora de Lisboa (em novembro é igual a UTC) */
  start: '2026-11-01T00:00:00Z',
  end: '2026-12-01T00:00:00Z',
  /** desconto em % por categoria, arredondado ao euro para baixo */
  discounts: { 'hoodies-crewnecks': 15, 't-shirts': 15 } as Record<string, number>,
  /** do pack mais vantajoso para a Mekie para o menos: é por esta ordem que se juntam as peças */
  packs: [
    { id: 'hoodie-tshirt', parts: [['hoodie'], ['tshirt']], price: 95 },
    { id: 'crewneck-tshirt', parts: [['crewneck'], ['tshirt']], price: 90 },
    { id: 'hoodie-cap', parts: [['hoodie'], ['cap']], price: 80 },
    { id: 'tshirt-cap', parts: [['tshirt'], ['cap']], price: 65 },
  ] as Pack[],
};

const preview = () => {
  /* PROMO_PREVIEW=1 em local, ou as pré-visualizações da Vercel (ramos que não são o site oficial) */
  try { return typeof process !== 'undefined' && (process.env?.PROMO_PREVIEW === '1' || process.env?.VERCEL_ENV === 'preview'); } catch { return false; }
};

/** A promoção está ativa nesta data? */
export const promoActive = (now = new Date()) =>
  preview() || (now >= new Date(promo.start) && now < new Date(promo.end));

/** Preço com o desconto da categoria (preço normal se não houver promoção) */
export const promoPrice = (category: string, base: number, active: boolean) => {
  const pct = active ? promo.discounts[category] : 0;
  return pct ? Math.floor(base * (1 - pct / 100)) : base;
};

/** Tipo de peça para os packs, pela categoria e pelo endereço (que não muda com a língua) */
export function kindOf(p: { slug: string; category: string }): Kind | undefined {
  if (p.category === 'hoodies-crewnecks') return p.slug.startsWith('crewneck') ? 'crewneck' : 'hoodie';
  if (p.category === 't-shirts') return 'tshirt';
  if (p.category === 'caps') return 'cap';
  return undefined;
}

export type PackLine = { key: string; kind?: Kind; price: number; qty: number };
export type PackMatch = { pack: Pack; count: number; discount: number; keys: string[] };

/** Junta as peças do carrinho em packs. Cada unidade entra no máximo num pack.
    Devolve os packs formados e o desconto total (soma dos preços menos o preço do pack). */
export function matchPacks(lines: PackLine[], active: boolean) {
  const matches: PackMatch[] = [];
  if (!active) return { matches, discount: 0, packedKeys: new Set<string>() };
  /* uma entrada por unidade, das mais caras para as mais baratas */
  const units = lines.flatMap((l) => Array.from({ length: l.qty }, () => ({ key: l.key, kind: l.kind, price: l.price, used: false })))
    .sort((a, b) => b.price - a.price);
  for (const pack of promo.packs) {
    let count = 0, discount = 0;
    const keys = new Set<string>();
    for (;;) {
      const a = units.find((u) => !u.used && u.kind && pack.parts[0].includes(u.kind));
      const b = units.find((u) => !u.used && u !== a && u.kind && pack.parts[1].includes(u.kind));
      if (!a || !b || a.price + b.price <= pack.price) break;
      a.used = b.used = true;
      count++;
      discount += a.price + b.price - pack.price;
      keys.add(a.key).add(b.key);
    }
    if (count) matches.push({ pack, count, discount: Math.round(discount * 100) / 100, keys: [...keys] });
  }
  const packedKeys = new Set(matches.flatMap((m) => m.keys));
  return { matches, discount: Math.round(matches.reduce((n, m) => n + m.discount, 0) * 100) / 100, packedKeys };
}
