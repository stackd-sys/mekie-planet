/* Checkout abandonado: quem chegou à página de pagamento e não pagou recebe um email,
   uma única vez, com o link para concluir a mesma encomenda (a página da Stripe fica aberta 24 horas).
   Corre sozinho, no máximo de 10 em 10 minutos, aproveitando as visitas ao site (não precisa de agendamento). */
import { db } from './db';
import { sendMail, layout, escapeHtml } from './mail';
import type { OrderLine } from './orders';
import { serverT, asLang } from '../../i18n/server';
import { products, totalStock, isSoldOut, type Product } from '../../data/products';
import { giftCatalog, giftImage, giftTitleFromPt } from '../../data/giftcard';
import { site } from '../../data/site';
import { href, money, amount, type Lang } from '../../i18n';
import { trProduct, trName, trColor } from '../../i18n/catalog';

const abs = (path: string) => new URL(path, site.url).href;
const small = (img: string) => abs(img.replace(/\.webp$/, '-sm.webp'));

/** Até 3 peças para sugerir: da mesma coleção ou categoria primeiro, com stock e que não estejam já na encomenda */
function related(lines: OrderLine[]) {
  const inOrder = new Set(lines.map((l) => l.id));
  const mine = products.filter((p) => inOrder.has(p.id));
  const free = (p: Product) => !inOrder.has(p.id) && !isSoldOut(p) && (totalStock(p) ?? 1) > 0;
  const score = (p: Product) =>
    (mine.some((m) => m.collection && m.collection === p.collection) ? 4 : 0) +
    (mine.some((m) => m.category === p.category) ? 2 : 0) +
    (p.category === 'hoodies-crewnecks' || p.category === 't-shirts' ? 1 : 0);
  /* uma cor de cada modelo, para não sugerir o mesmo hoodie três vezes */
  const seen = new Set<string>(mine.map((m) => m.name));
  return products.filter(free).sort((a, b) => score(b) - score(a))
    .filter((p) => (seen.has(p.name) ? false : (seen.add(p.name), true))).slice(0, 3);
}

/** Corpo do email: peças com fotografia, total, botão, sugestões e vantagens */
function body(o: any, url: string, lang: Lang) {
  const t = serverT(lang);
  const eur = (v: unknown) => money(Number(v ?? 0), lang);
  const lines = o.lines as OrderLine[];
  const imgOf = (l: OrderLine) => {
    const g = giftCatalog.find((x) => x.id === l.id);
    if (g) return small(giftImage(g.variable ? 'custom' : g.value, lang));
    const p = products.find((x) => x.id === l.id);
    return p ? small(p.images[0]) : '';
  };
  const nameOf = (l: OrderLine) => {
    const g = giftCatalog.find((x) => x.id === l.id);
    if (g) return `${trName(l.name, lang)} ${amount(l.price, lang)} · ${giftTitleFromPt(l.color.split(' · ')[1] ?? '', lang)}`;
    return trName(l.name, lang);
  };
  const cell = 'padding:12px 0;border-bottom:1px solid #e2e2df;vertical-align:middle';
  const items = lines.map((l) => `
    <tr>
      <td style="${cell};width:84px"><div style="width:72px;height:72px;line-height:72px;text-align:center;background:#ebe7e1;border-radius:4px"><img src="${imgOf(l)}" alt="" height="66" style="height:66px;width:auto;max-width:72px;vertical-align:middle"></div></td>
      <td style="${cell};padding-left:14px">
        <strong style="font-size:14px">${escapeHtml(nameOf(l))}</strong><br>
        <span style="font-size:12.5px;color:#5c5c5c">${[l.color && !giftCatalog.some((g) => g.id === l.id) ? escapeHtml(trColor(l.color, lang)) : '', l.size ? escapeHtml(l.size) : '', l.qty > 1 ? `× ${l.qty}` : ''].filter(Boolean).join(' · ')}</span>
      </td>
      <td style="${cell};text-align:right;font-size:14px;white-space:nowrap">${eur(l.qty * l.price)}</td>
    </tr>`).join('');
  const row = (label: string, value: string, bold = false) =>
    `<tr><td colspan="2" style="padding:6px 0;font-size:14px${bold ? ';font-weight:700' : ''}">${label}</td><td style="padding:6px 0;text-align:right;font-size:14px${bold ? ';font-weight:700' : ''}">${value}</td></tr>`;
  const totals = [
    Number(o.pack_discount) ? row(escapeHtml(o.pack_label || 'Packs'), `-${eur(o.pack_discount)}`) : '',
    Number(o.discount) ? row(t('m.discount', { code: escapeHtml(o.discount_code) }), `-${eur(o.discount)}`) : '',
    row(t('m.shipping'), Number(o.shipping) ? eur(o.shipping) : t('m.free')),
    Number(o.gift_amount) ? row(t('m.gift'), `-${eur(o.gift_amount)}`) : '',
    row('Total', eur(o.total), true),
  ].join('');
  const button = (label: string) =>
    `<a href="${escapeHtml(url)}" style="display:inline-block;background:#1f1f1f;color:#fff;text-decoration:none;padding:15px 30px;border-radius:999px;font-size:13px;letter-spacing:1.5px;font-weight:600">${label}</a>`;
  const picks = related(lines).map((p) => {
    const lp = trProduct(p, lang);
    const was = p.price < p.regularPrice ? ` <span style="text-decoration:line-through;color:#8a8a86;font-size:12px">${eur(p.regularPrice)}</span>` : '';
    return `<td style="width:33.33%;padding:0 6px;vertical-align:top;text-align:center">
      <a href="${abs(href(lang, `/produto/${p.slug}/`))}" style="color:#1f1f1f;text-decoration:none">
        <div style="height:160px;line-height:160px;text-align:center;background:#ebe7e1;border-radius:4px;margin:0 0 10px"><img src="${small(p.images[0])}" alt="${escapeHtml(lp.name)}" height="148" style="height:148px;width:auto;max-width:100%;vertical-align:middle"></div>
        <span style="display:block;font-size:13px;font-weight:600">${escapeHtml(lp.name)}</span>
        <span style="display:block;font-size:12px;color:#5c5c5c;margin:2px 0 4px">${escapeHtml(lp.color)}</span>
        <span style="display:block;font-size:13px">${eur(p.price)}${was}</span>
      </a></td>`;
  }).join('');
  const free = site.freeShippingFrom;
  return `
    <p style="margin:0 0 20px">${t('m.abandon')}</p>
    <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 6px">${items}${totals}</table>
    <p style="text-align:center;margin:28px 0 8px">${button(t('m.abandonBtn'))}</p>
    <p style="text-align:center;font-size:12.5px;color:#5c5c5c;margin:0 0 34px">${t('m.abandonLink')}</p>
    <table role="presentation" style="width:100%;border-collapse:collapse;background:#ffffff;border-radius:6px;margin:0 0 34px">
      <tr>${[t('m.perkFree', { n: amount(free, lang) }), t('m.perkReturns'), t('m.perkSecure')].map((x) =>
        `<td style="width:33.33%;padding:16px 8px;text-align:center;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:#1f1f1f">${x}</td>`).join('')}</tr>
    </table>
    ${picks ? `<p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin:0 0 14px;text-align:center">${t('m.related')}</p>
    <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 30px"><tr>${picks}</tr></table>` : ''}
    <p style="font-size:13px;color:#5c5c5c;margin:0">${t('m.abandonNote')}</p>`;
}

/** espera antes de escrever ao cliente, e até quando ainda vale a pena (a Stripe fecha a página às 24 horas) */
const AFTER = '1 hour';
const UNTIL = '20 hours';

/** Corre a recuperação se a última vez foi há mais de 10 minutos. Nunca falha. */
export async function maybeRecoverCheckouts() {
  try {
    const sql = await db();
    /* só uma execução de cada vez: quem conseguir mudar a data é que corre */
    const [lock] = await sql<any[]>`
      insert into settings (key, value) values ('recovery_last', ${sql.json({ at: new Date().toISOString() })})
      on conflict (key) do update set value = excluded.value
      where (settings.value->>'at')::timestamptz < now() - interval '10 minutes'
      returning key`;
    if (!lock) return 0;
    return await recoverCheckouts();
  } catch (e) {
    console.error('[Mekie] Recuperação de checkouts falhou:', (e as Error).message);
    return 0;
  }
}

export async function recoverCheckouts() {
  const sql = await db();
  const orders = await sql<any[]>`
    select o.* from orders o
    /* só encomendas com o link guardado: as antigas (algumas eram de bots, com emails de outras pessoas) ficam de fora */
    where o.status = 'pendente' and o.source = 'site' and o.stripe_url <> '' and o.recovery_sent_at is null
      and o.created_at < now() - ${AFTER}::interval and o.created_at > now() - ${UNTIL}::interval
      /* se a pessoa já voltou e fez outra encomenda, não incomodamos */
      and not exists (select 1 from orders n where n.email = o.email and n.created_at > o.created_at)
    order by o.created_at limit 20`;
  let sent = 0;
  for (const o of orders) {
    /* marca primeiro: mesmo que o email falhe, nunca sai duas vezes */
    const [claimed] = await sql`update orders set recovery_sent_at = now() where id = ${o.id} and recovery_sent_at is null returning id`;
    if (!claimed) continue;
    const url = o.stripe_url as string;
    const lang = asLang(o.lang);
    const t = serverT(lang);
    const first = String(o.name).split(' ')[0];
    const ok = await sendMail(o.email, t('m.abandonSubject'), layout(t('m.abandonTitle', { name: escapeHtml(first) }), body(o, url, lang), lang));
    if (ok) {
      sent++;
      await sql`insert into order_events (order_id, text, by) values (${o.id}, 'Email de checkout abandonado enviado ao cliente', 'site')`;
    }
  }
  return sent;
}
