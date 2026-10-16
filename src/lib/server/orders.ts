/* Encomendas: preço calculado no servidor, estados, stock, cartões presente e emails ao cliente. */
import { randomInt } from 'node:crypto';
import { db } from './db';
import { sendMail, layout, escapeHtml } from './mail';
import { euro, trackingUrl } from './format';
import { products, weightOf } from '../../data/products';
import { giftCatalog, giftCard } from '../../data/giftcard';
import { destinations, shippingCost, type Zone } from '../../data/shipping';
import { site } from '../../data/site';
import { rebuildSite } from './deploy';

export type OrderLine = {
  id: number; slug: string; name: string; color: string; size: string; custom: string;
  qty: number; price: number; grams: number; digital: boolean; madeToOrder: boolean;
};

export type Customer = {
  email: string; phone: string; nome: string; apelido: string; nif: string; notas: string;
  morada: string; codigo_postal: string; localidade: string; pais: string;
};

const round = (n: number) => Math.round(n * 100) / 100;
const clean = (v: unknown, max = 200) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
export const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 160;

/* ---------- Códigos de desconto ---------- */

export type CodeCheck =
  | { ok: true; code: string; kind: 'percent' | 'fixed'; value: number; welcome: boolean }
  | { ok: false; message: string };

export async function checkCode(rawCode: string, email: string, goods: number): Promise<CodeCheck> {
  const code = clean(rawCode, 40).toUpperCase();
  if (!code) return { ok: false, message: 'Escreve um código.' };
  const sql = await db();
  const [c] = await sql<any[]>`select * from discount_codes where upper(code) = ${code}`;
  if (!c || !c.active) return { ok: false, message: 'Este código não é válido.' };
  const today = new Date().toISOString().slice(0, 10);
  const day = (d: unknown) => (d ? new Date(d as string).toISOString().slice(0, 10) : '');
  if (c.starts_at && day(c.starts_at) > today) return { ok: false, message: 'Este código ainda não está ativo.' };
  if (c.ends_at && day(c.ends_at) < today) return { ok: false, message: 'Este código já expirou.' };
  if (goods > 0 && goods < Number(c.min_subtotal)) return { ok: false, message: `Este código é para compras a partir de ${euro(c.min_subtotal)}.` };
  if (c.max_uses) {
    const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from code_uses where code = ${c.code}`;
    if (n >= c.max_uses) return { ok: false, message: 'Este código já esgotou.' };
  }
  const mail = email.trim().toLowerCase();
  if (c.welcome && mail) {
    const [s] = await sql<any[]>`select 1 from subscribers where email = ${mail} and unsubscribed_at is null`;
    if (!s) return { ok: false, message: `O código ${c.code} é para quem subscreve a newsletter. Usa o email com que subscreveste ou subscreve no fundo da página.` };
  }
  if (c.once_per_email && mail) {
    const [u] = await sql<any[]>`select 1 from code_uses where code = ${c.code} and email = ${mail}`;
    if (u) return { ok: false, message: `O código ${c.code} já foi usado numa encomenda com este email.` };
  }
  return { ok: true, code: c.code, kind: c.kind, value: Number(c.value), welcome: c.welcome };
}

/* ---------- Cartões presente ---------- */

export async function giftBalance(rawCode: string) {
  const code = clean(rawCode, 40).toUpperCase();
  if (!code) return { status: 'invalid' as const };
  const sql = await db();
  const [g] = await sql<any[]>`select balance, expires_at from gift_cards where upper(code) = ${code}`;
  if (!g) return { status: 'invalid' as const };
  const expires = new Date(g.expires_at).toISOString();
  if (new Date(g.expires_at).getTime() + 86400000 < Date.now()) return { status: 'expired' as const, balance: Number(g.balance), expires };
  if (Number(g.balance) <= 0) return { status: 'empty' as const, balance: 0, expires };
  return { status: 'ok' as const, balance: Number(g.balance), expires };
}

const giftCode = () => {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const s = Array.from({ length: 8 }, () => abc[randomInt(abc.length)]).join('');
  return `MEKIE-${s.slice(0, 4)}-${s.slice(4)}`;
};

export async function createGiftCard(input: { value: number; buyer?: string; recipient_name?: string; recipient_email?: string; message?: string; order_number?: string; notes?: string }) {
  const sql = await db();
  const expires = new Date();
  expires.setMonth(expires.getMonth() + giftCard.validityMonths);
  for (let i = 0; i < 5; i++) {
    const code = giftCode();
    const rows = await sql`
      insert into gift_cards (code, value, balance, expires_at, buyer, recipient_name, recipient_email, message, order_number, notes)
      values (${code}, ${input.value}, ${input.value}, ${expires.toISOString().slice(0, 10)}, ${input.buyer ?? ''},
        ${input.recipient_name ?? ''}, ${input.recipient_email ?? ''}, ${input.message ?? ''}, ${input.order_number ?? ''}, ${input.notes ?? ''})
      on conflict (code) do nothing returning code`;
    if (rows.length) {
      await sql`insert into gift_movements (code, amount, order_number, note) values (${code}, ${input.value}, ${input.order_number ?? ''}, 'Cartão criado')`;
      return code;
    }
  }
  throw new Error('Não foi possível gerar um código único.');
}

export async function sendGiftCard(code: string) {
  const sql = await db();
  const [g] = await sql<any[]>`select * from gift_cards where code = ${code}`;
  if (!g) return false;
  const to = g.recipient_email || (await sql<any[]>`select email from orders where number = ${g.order_number}`)[0]?.email;
  if (!to) return false;
  const name = giftCard.names[Number(g.value)] ?? giftCard.name;
  const ok = await sendMail(to, `${g.buyer ? `${g.buyer} ofereceu-te` : 'Tens'} um cartão presente Mekie`, layout(
    `${name}: ${euro(g.value)} para gastar na Mekie`,
    `${g.recipient_name ? `<p>Olá ${escapeHtml(g.recipient_name)},</p>` : ''}
     ${g.buyer ? `<p><strong>${escapeHtml(g.buyer)}</strong> ofereceu-te um cartão presente Mekie.</p>` : ''}
     ${g.message ? `<p style="font-style:italic">"${escapeHtml(g.message)}"</p>` : ''}
     <p style="font-size:22px;letter-spacing:.08em;font-weight:700;background:#f5f5f4;padding:14px;text-align:center">${escapeHtml(g.code)}</p>
     <p>Escreve este código no checkout em <a href="${site.url}/loja/">${site.url.replace('https://', '')}</a>. Podes usá-lo em várias compras até acabar o saldo. É válido até ${new Date(g.expires_at).toLocaleDateString('pt-PT')}.</p>`,
  ));
  if (ok) await sql`update gift_cards set sent_at = now() where code = ${code}`;
  return ok;
}

/* ---------- Preço da encomenda ---------- */

type RawLine = { id?: unknown; qty?: unknown; size?: unknown; custom?: unknown };

export async function priceOrder(raw: RawLine[], country: string, codeRaw: string, giftRaw: string, email: string) {
  const sql = await db();
  const state = new Map((await sql<any[]>`select id, price, stock, size_stock from products_state`).map((r) => [r.id, r]));
  const lines: OrderLine[] = [];
  const errors: string[] = [];

  for (const r of (Array.isArray(raw) ? raw : []).slice(0, 40)) {
    const id = Number(r.id), qty = Math.max(1, Math.min(20, Math.floor(Number(r.qty) || 1)));
    const size = clean(r.size, 10), custom = clean(r.custom, 400);
    const gift = giftCatalog.find((g) => g.id === id);
    if (gift) {
      lines.push({ id, slug: gift.slug, name: gift.name, color: gift.color, size: '', custom, qty, price: gift.price, grams: 0, digital: true, madeToOrder: false });
      continue;
    }
    const p = products.find((x) => x.id === id);
    if (!p) { errors.push('Um dos artigos já não existe.'); continue; }
    const s = state.get(id);
    const price = s ? Number(s.price) : p.price;
    if (p.sizes && !p.sizes.includes(size)) { errors.push(`Escolhe um tamanho válido para ${p.name}.`); continue; }
    const stock = p.sizeStock ? Number((s?.size_stock ?? p.sizeStock)[size] ?? 0) : s?.stock ?? p.stock;
    if (!p.madeToOrderDays && stock !== undefined && stock !== null && qty > stock) {
      errors.push(stock > 0 ? `Só temos ${stock} de ${p.name} ${p.color}${size ? ` (${size})` : ''}.` : `${p.name} ${p.color}${size ? ` (${size})` : ''} esgotou.`);
      continue;
    }
    lines.push({ id, slug: p.slug, name: p.name, color: p.customizable ? '' : p.color, size, custom, qty, price, grams: weightOf(p), digital: false, madeToOrder: Boolean(p.madeToOrderDays) });
  }

  const dest = destinations.find((d) => d.name === country) ?? destinations[0];
  const subtotal = round(lines.reduce((n, l) => n + l.qty * l.price, 0));
  const goods = round(lines.reduce((n, l) => n + (l.digital ? 0 : l.qty * l.price), 0));
  const grams = lines.reduce((n, l) => n + l.qty * l.grams, 0);
  const shipping = shippingCost(dest.zone as Zone, goods, grams);

  let discount = 0, discountCode = '', codeError = '';
  if (clean(codeRaw)) {
    const c = await checkCode(codeRaw, email, goods);
    if (c.ok) {
      discountCode = c.code;
      discount = round(c.kind === 'percent' ? goods * c.value / 100 : Math.min(c.value, goods));
    } else codeError = c.message;
  }

  const beforeGift = round(subtotal - discount + shipping);
  let giftAmount = 0, giftCodeUsed = '', giftError = '';
  if (clean(giftRaw)) {
    const g = await giftBalance(giftRaw);
    if (g.status === 'ok') {
      giftCodeUsed = clean(giftRaw, 40).toUpperCase();
      giftAmount = round(Math.min(g.balance, beforeGift));
    } else giftError = g.status === 'empty' ? 'Este cartão já não tem saldo.' : g.status === 'expired' ? 'Este cartão já passou a validade.' : 'Não encontrámos este cartão presente.';
  }

  return { lines, errors, dest, subtotal, goods, shipping, discount, discountCode, codeError, giftAmount, giftCode: giftCodeUsed, giftError, total: round(beforeGift - giftAmount) };
}

/* ---------- Criar encomenda ---------- */

/** Origem da visita (campanha, parceria) guardada pelo site, só com consentimento */
const cleanUtm = (u: Record<string, unknown>) =>
  Object.fromEntries(['source', 'medium', 'campaign', 'content', 'term', 'ref', 'landing', 'at']
    .filter((k) => u[k]).map((k) => [k, clean(u[k], 120)]));

export async function createOrder(body: any, opts: { source?: string; emails?: boolean } = {}) {
  const source = opts.source ?? 'site';
  const c: Customer = {
    email: clean(body?.customer?.email, 160).toLowerCase(),
    phone: clean(body?.customer?.phone, 40),
    nome: clean(body?.customer?.nome, 80),
    apelido: clean(body?.customer?.apelido, 80),
    nif: clean(body?.customer?.nif, 20),
    notas: clean(body?.customer?.notas, 1000),
    morada: clean(body?.customer?.morada, 200),
    codigo_postal: clean(body?.customer?.codigo_postal, 20),
    localidade: clean(body?.customer?.localidade, 80),
    pais: clean(body?.customer?.pais, 60),
  };
  if (!isEmail(c.email)) return { error: 'O email não parece válido.' };
  if (!c.nome || !c.phone) return { error: 'Preenche o nome e o telemóvel.' };

  const priced = await priceOrder(body?.lines, c.pais, body?.code ?? '', body?.gift ?? '', c.email);
  if (priced.errors.length) return { error: priced.errors.join(' ') };
  if (!priced.lines.length) return { error: 'O carrinho está vazio.' };
  if (priced.codeError) return { error: priced.codeError, field: 'code' };
  if (priced.giftError) return { error: priced.giftError, field: 'gift' };
  const physical = priced.lines.some((l) => !l.digital);
  const hasAddress = Boolean(c.morada && c.codigo_postal && c.localidade);
  /* no site a morada é obrigatória; numa venda registada à mão (em mão, feira) pode não haver */
  if (physical && !hasAddress && source === 'site') return { error: 'Preenche a morada completa.' };
  /* venda entregue em mão: sem portes */
  if (physical && !hasAddress && priced.shipping) {
    priced.total = round(Math.max(0, priced.total - priced.shipping));
    priced.shipping = 0;
  }

  const sql = await db();
  const name = `${c.nome} ${c.apelido}`.trim();
  const order = await sql.begin(async (tx: any) => {
    const [cust] = await tx`
      insert into customers (email, name, phone, nif) values (${c.email}, ${name}, ${c.phone}, ${c.nif})
      on conflict (email) do update set name = excluded.name, phone = excluded.phone,
        nif = case when excluded.nif <> '' then excluded.nif else customers.nif end, updated_at = now()
      returning id`;
    const [{ n }] = await tx`select nextval('order_number_seq') as n`;
    const number = `MK-${n}`;
    const address = physical && hasAddress ? { morada: c.morada, codigo_postal: c.codigo_postal, localidade: c.localidade, pais: priced.dest.name, zone: priced.dest.zone } : null;
    const [o] = await tx`
      insert into orders (number, customer_id, email, name, phone, nif, address, lines, subtotal, discount, discount_code,
        shipping, gift_code, gift_amount, total, customer_notes, source, utm)
      values (${number}, ${cust.id}, ${c.email}, ${name}, ${c.phone}, ${c.nif}, ${address ? tx.json(address) : null}, ${tx.json(priced.lines)},
        ${priced.subtotal}, ${priced.discount}, ${priced.discountCode}, ${priced.shipping}, ${priced.giftCode}, ${priced.giftAmount},
        ${priced.total}, ${c.notas}, ${source}, ${body?.utm && typeof body.utm === 'object' ? tx.json(cleanUtm(body.utm)) : null})
      returning *`;
    await tx`insert into order_events (order_id, text) values (${o.id}, ${source === 'site' ? 'Encomenda recebida no site' : 'Encomenda registada no CRM'})`;
    if (priced.discountCode) await tx`insert into code_uses (code, email, order_number) values (${priced.discountCode}, ${c.email}, ${number})`;
    return o;
  });

  if (opts.emails !== false) await Promise.allSettled([sendOrderReceived(order), notifyShop(order)]);
  return { ok: true, number: order.number, total: Number(order.total) };
}

/* ---------- Emails da encomenda ---------- */

const linesHtml = (o: any) => `<table style="width:100%;border-collapse:collapse;font-size:14px">${(o.lines as OrderLine[]).map((l) => `
  <tr><td style="padding:6px 0;border-bottom:1px solid #e2e2df">${l.qty}× ${escapeHtml(l.name)}${l.color ? `, ${escapeHtml(l.color)}` : ''}${l.size ? `, ${escapeHtml(l.size)}` : ''}${l.custom ? `<br><span style="color:#5c5c5c">${escapeHtml(l.custom)}</span>` : ''}</td>
  <td style="padding:6px 0;border-bottom:1px solid #e2e2df;text-align:right">${euro(l.qty * l.price)}</td></tr>`).join('')}
  ${Number(o.discount) ? `<tr><td style="padding:6px 0">Desconto ${escapeHtml(o.discount_code)}</td><td style="text-align:right">-${euro(o.discount)}</td></tr>` : ''}
  <tr><td style="padding:6px 0">Envio</td><td style="text-align:right">${Number(o.shipping) ? euro(o.shipping) : 'Grátis'}</td></tr>
  ${Number(o.gift_amount) ? `<tr><td style="padding:6px 0">Cartão presente</td><td style="text-align:right">-${euro(o.gift_amount)}</td></tr>` : ''}
  <tr><td style="padding:8px 0;font-weight:700">Total</td><td style="text-align:right;font-weight:700">${euro(o.total)}</td></tr></table>`;

async function sendOrderReceived(o: any) {
  const first = String(o.name).split(' ')[0];
  await sendMail(o.email, `Recebemos a tua encomenda ${o.number}`, layout(`Obrigado, ${escapeHtml(first)}!`,
    `<p>Recebemos a tua encomenda <strong>${o.number}</strong>. ${Number(o.total) > 0 ? 'Vamos enviar-te em breve os dados de pagamento (MB WAY, Multibanco ou cartão).' : 'Vamos tratar dela já.'}</p>
     ${linesHtml(o)}
     ${o.address ? `<p style="color:#5c5c5c">Envio para: ${escapeHtml(o.address.morada)}, ${escapeHtml(o.address.codigo_postal)} ${escapeHtml(o.address.localidade)} (${escapeHtml(o.address.pais)})</p>` : ''}
     <p>Qualquer dúvida, responde a este email.</p>`));
}

async function notifyShop(o: any) {
  const to = process.env.ORDERS_EMAIL || site.email;
  await sendMail(to, `Nova encomenda ${o.number}: ${euro(o.total)}`, layout(`Nova encomenda ${o.number}`,
    `<p><strong>${escapeHtml(o.name)}</strong> · ${escapeHtml(o.email)} · ${escapeHtml(o.phone)}</p>${linesHtml(o)}
     ${o.customer_notes ? `<p>Notas: ${escapeHtml(o.customer_notes)}</p>` : ''}
     <p><a href="${site.url}/admin/encomendas/${o.number}/">Abrir no CRM</a></p>`), o.email);
}

export async function sendShipped(o: any) {
  const url = o.tracking ? trackingUrl(o.tracking) : '';
  return sendMail(o.email, `A tua encomenda ${o.number} já vai a caminho`, layout('Já vai a caminho!',
    `<p>A tua encomenda <strong>${o.number}</strong> saiu hoje pelos CTT.</p>
     ${o.tracking ? `<p>Número de seguimento: <strong>${escapeHtml(o.tracking)}</strong><br><a href="${escapeHtml(url)}">Seguir a encomenda nos CTT</a></p>` : ''}
     ${linesHtml(o)}<p>Obrigado por escolheres a Mekie. Bro, o básico nunca falha.</p>`));
}

/* ---------- Estados e stock ---------- */

/** Tira (sign = -1) ou devolve (sign = 1) ao stock as peças físicas. Devolve true se mudou algum stock. */
export async function moveStock(tx: any, items: { id: number; size?: string; qty: number; digital?: boolean }[], sign: 1 | -1) {
  let changed = false;
  for (const l of items) {
    if (l.digital) continue;
    const p = products.find((x) => x.id === l.id);
    if (!p || p.customizable) continue;
    if (p.sizeStock && l.size) {
      await tx`
        update products_state set size_stock = jsonb_set(coalesce(size_stock, '{}'::jsonb), ${[l.size]}::text[],
          to_jsonb(greatest(0, coalesce((size_stock->>${l.size})::int, 0) + ${sign * l.qty}))), updated_at = now()
        where id = ${l.id}`;
      changed = true;
    } else {
      const r = await tx`update products_state set stock = greatest(0, stock + ${sign * l.qty}), updated_at = now() where id = ${l.id} and stock is not null returning id`;
      if (r.length) changed = true;
    }
  }
  return changed;
}

const STOCK_OUT = ['paga', 'enviada', 'entregue'];

export async function setStatus(number: string, status: string, by: string, extra: { tracking?: string; notify?: boolean } = {}) {
  const sql = await db();
  let stockChanged = false;
  const o = await sql.begin(async (tx: any) => {
    const [cur] = await tx`select * from orders where number = ${number} for update`;
    if (!cur) throw new Error('Encomenda não encontrada');
    const tracking = extra.tracking !== undefined ? clean(extra.tracking, 40).toUpperCase() : cur.tracking;
    const [o] = await tx`
      update orders set status = ${status}, tracking = ${tracking},
        paid_at = case when ${status} in ('paga','enviada','entregue') and paid_at is null then now() else paid_at end,
        shipped_at = case when ${status} in ('enviada','entregue') and shipped_at is null then now() else shipped_at end,
        delivered_at = case when ${status} = 'entregue' and delivered_at is null then now() else delivered_at end
      where id = ${cur.id} returning *`;
    if (status !== cur.status) await tx`insert into order_events (order_id, text, by) values (${cur.id}, ${`Estado: ${status}`}, ${by})`;
    /* stock: sai quando a encomenda é paga, volta se for cancelada */
    if (STOCK_OUT.includes(status) && !cur.stock_applied) {
      stockChanged = await moveStock(tx, cur.lines, -1);
      await tx`update orders set stock_applied = true where id = ${cur.id}`;
    } else if (status === 'cancelada' && cur.stock_applied) {
      stockChanged = await moveStock(tx, cur.lines, 1);
      await tx`update orders set stock_applied = false where id = ${cur.id}`;
    }
    /* cartão presente usado nesta encomenda: desconta o saldo quando é paga */
    if (STOCK_OUT.includes(status) && cur.gift_code && Number(cur.gift_amount) > 0) {
      const [done] = await tx`select 1 from gift_movements where code = ${cur.gift_code} and order_number = ${cur.number} and amount < 0`;
      if (!done) {
        await tx`update gift_cards set balance = greatest(0, balance - ${cur.gift_amount}) where code = ${cur.gift_code}`;
        await tx`insert into gift_movements (code, amount, order_number, note) values (${cur.gift_code}, ${-Number(cur.gift_amount)}, ${cur.number}, 'Usado na encomenda')`;
      }
    }
    return o;
  });

  /* cartões presente comprados nesta encomenda: criados e enviados quando é paga */
  if (STOCK_OUT.includes(status)) {
    const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from gift_cards where order_number = ${number}`;
    const giftLines = (o.lines as OrderLine[]).filter((l) => l.digital);
    const wanted = giftLines.reduce((k, l) => k + l.qty, 0);
    if (n < wanted) {
      let made = n;
      for (const l of giftLines) {
        const m = /Para ([^·(]+?)(?: \(([^)]+)\))? ·/.exec(l.custom + ' ·');
        const from = /De ([^·]+?) ·/.exec(l.custom + ' ·')?.[1] ?? '';
        const msg = /"(.*)"/.exec(l.custom)?.[1] ?? '';
        for (let i = 0; i < l.qty && made < wanted; i++, made++) {
          const code = await createGiftCard({ value: l.price, buyer: from || o.name, recipient_name: m?.[1]?.trim() ?? '', recipient_email: m?.[2] ?? '', message: msg, order_number: o.number });
          await sendGiftCard(code);
        }
      }
    }
  }

  if (status === 'enviada' && extra.notify) {
    if (await sendShipped(o)) await sql`insert into order_events (order_id, text, by) values (${o.id}, 'Email de envio enviado ao cliente', ${by})`;
  }
  if (stockChanged) await rebuildSite('Stock mudou com a encomenda ' + number);
  return o;
}
