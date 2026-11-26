/* Campanhas da newsletter (Black November): três emails prontos, enviados a partir do CRM (Campanhas).
   Cada subscritor recebe na sua língua e cada campanha só sai uma vez por pessoa (tabela campaign_sends). */
import { site } from '../../data/site';
import { products, isSoldOut, type Product } from '../../data/products';
import { reviewsByName } from '../../data/reviews';
import { trName, trColor } from '../../i18n/catalog';
import { kindOf, type Kind } from '../../data/promo';
import { packs } from '../../data/packs';
import { layout, escapeHtml, sendBatch, sendMail } from './mail';
import { href, amount, type Lang } from '../../i18n';
import { useT } from '../../i18n/ui';
import { db } from './db';
import { pushNotify } from './push';

type Text = [string, string, string];
/* intro: abertura curta antes dos preços; malas: bloco da novidade; natal: nota sobre os prazos de Natal */
/* versão "loja" (sexta): imagem de abertura, peças com preço, últimas unidades, garantias, uma opinião e assinatura */
type Campaign = {
  id: string; date: string; label: string; subject: Text; title: Text; body: Text; button: Text;
  intro?: Text; malas?: boolean; natal?: Text;
  preheader?: Text; hero?: string; picks?: string[]; trust?: boolean; review?: [string, number]; sign?: Text;
};

export const campaigns: Campaign[] = [
  {
    id: 'bn-arranque',
    date: '2026-11-01',
    label: 'Arranque da Black November',
    subject: ['Black November: -15% o mês inteiro', 'Black November: 15% off all month', 'Black November: -15% todo el mes'],
    title: ['Começou a Black November', 'Black November is on', 'Ha empezado la Black November'],
    body: [
      'Durante todo o mês de novembro tens -15% em hoodies, t-shirts e crewnecks. E se juntares duas peças num pack, poupas ainda mais. O preço do pack aplica-se sozinho no carrinho.',
      'All through November you get 15% off hoodies, T-shirts and crewnecks. Put two pieces together in a bundle and you save even more. The bundle price is applied automatically in the cart.',
      'Durante todo noviembre tienes -15% en hoodies, camisetas y crewnecks. Y si juntas dos prendas en un pack, ahorras todavía más. El precio del pack se aplica solo en la cesta.',
    ],
    button: ['Ver a Black November', 'Shop Black November', 'Ver la Black November'],
  },
  {
    id: 'bn-black-friday',
    date: '2026-11-27',
    label: 'Fim de semana Black Friday',
    subject: ['Hoodies a 59€, só até segunda', 'Hoodies for €59, only until Monday', 'Hoodies a 59 €, solo hasta el lunes'],
    preheader: [
      'Black Friday Mekie: -15% em hoodies, crewnecks e t-shirts e packs até 22%. Acaba segunda à meia-noite.',
      'Mekie Black Friday: 15% off hoodies, crewnecks and T-shirts, bundles up to 22% off. Ends Monday at midnight.',
      'Black Friday Mekie: -15% en hoodies, crewnecks y camisetas y packs hasta un 22%. Termina el lunes a medianoche.',
    ],
    title: ['Black Friday: só até segunda', 'Black Friday: only until Monday', 'Black Friday: solo hasta el lunes'],
    hero: '/images/email/bf-hero.jpg',
    intro: [
      'Toda a gente te está a encher a caixa de correio com descontos. O nosso é simples: já está nos preços, não precisas de código e acaba segunda-feira à meia-noite.',
      'Everyone is filling your inbox with deals. Ours is simple: it is already in the prices, you need no code, and it ends Monday at midnight.',
      'Todo el mundo te está llenando el correo de descuentos. El nuestro es sencillo: ya está en los precios, no necesitas código y termina el lunes a medianoche.',
    ],
    body: [
      'Estas são as peças que mais saem. Bordadas, feitas para durar e com -15% até segunda.',
      'These are our most popular pieces. Embroidered, made to last, and 15% off until Monday.',
      'Estas son las prendas que más salen. Bordadas, hechas para durar y con -15% hasta el lunes.',
    ],
    button: ['Ver a Black Friday', 'Shop Black Friday', 'Ver la Black Friday'],
    picks: ['hoodie-cogumelos', 'hoodie-amarelo-pastel-esqueleto', 'crewneck-mekie-preta', 'tshirt-khaki-cogumelos', 'hoodie-amarelo-pastel-cogumelos', 'tshirt-black-cogumelos', 'hoodie-black-esqueleto'],
    trust: true,
    review: ['Hoodie Cogumelos', 0],
    sign: ['Até segunda,<br><strong>Rita e Rafael, da Mekie</strong>', 'See you Monday,<br><strong>Rita and Rafael, from Mekie</strong>', 'Hasta el lunes,<br><strong>Rita y Rafael, de Mekie</strong>'],
    malas: true,
    natal: [
      'A pensar no Natal? As encomendas feitas até segunda chegam muito antes do dia 24. E se o tamanho não servir, tens 14 dias para trocar.',
      'Thinking about Christmas? Orders placed by Monday arrive well before the 24th. And if the size is not right, you have 14 days to exchange it.',
      '¿Pensando en Navidad? Los pedidos hechos hasta el lunes llegan mucho antes del día 24. Y si la talla no es la tuya, tienes 14 días para cambiarla.',
    ],
  },
  {
    id: 'bn-ultimas-horas',
    date: '2026-11-29',
    label: 'Últimas horas',
    subject: ['Últimas horas da Black November', 'Last hours of Black November', 'Últimas horas de la Black November'],
    title: ['Acaba amanhã à meia-noite', 'It ends tomorrow at midnight', 'Termina mañana a medianoche'],
    body: [
      'É o último aviso: a Black November acaba amanhã, segunda-feira, à meia-noite. A partir de 1 de dezembro os preços voltam ao normal e os packs desaparecem.',
      'This is the last reminder: Black November ends tomorrow, Monday, at midnight. From 1 December prices go back to normal and the bundles are gone.',
      'Es el último aviso: la Black November termina mañana, lunes, a medianoche. A partir del 1 de diciembre los precios vuelven a la normalidad y los packs desaparecen.',
    ],
    button: ['Ver os packs', 'See the bundles', 'Ver los packs'],
  },
];

const ix = (lang: Lang) => (lang === 'en' ? 1 : lang === 'es' ? 2 : 0);
const utm = (id: string) => `utm_source=newsletter&utm_medium=email&utm_campaign=${id}`;
const show: Partial<Record<Kind, string>> = { hoodie: 'hoodie-cogumelos', crewneck: 'crewneck-mekie-preta', tshirt: 'tshirt-black-cogumelos', cap: 'cap-mekie-black' };
/* nos emails vão as versões em JPG (o Outlook e alguns programas de email não mostram WebP) */
const jpg = (src: string) => src.replace(/^\/images\/(products|lookbook)\/(.+)\.webp$/, '/images/meta/$1/$2.jpg');
const imageOf = (k: Kind) => jpg((products.find((p) => p.slug === show[k]) ?? products.find((p) => kindOf(p) === k))!.images[0]);
const MALAS = {
  kicker: ['Novidade', 'New', 'Novedad'],
  title: ['Malas de crochet', 'Crochet bags', 'Bolsos de ganchillo'],
  text: [
    'Feitas à mão, ponto a ponto, uma a uma. A S leva-se na mão e cabe o básico. A M vai ao ombro e leva mais uns extras. Escolhe uma das que já estão feitas ou cria a tua com as cores que quiseres.',
    'Handmade, stitch by stitch, one at a time. The S is carried in your hand and fits the basics. The M goes on your shoulder and takes a few extras. Pick one that is ready or make yours in the colours you want.',
    'Hechos a mano, punto a punto, uno a uno. El S se lleva en la mano y cabe lo básico. El M va al hombro y lleva unos cuantos extras. Elige uno de los que ya están hechos o crea el tuyo con los colores que quieras.',
  ],
  from: ['Desde 25€', 'From €25', 'Desde 25 €'],
  button: ['Ver as malas', 'See the bags', 'Ver los bolsos'],
};

const TXT = {
  off: ['-15%', '-15%', '-15%'],
  buy: ['Comprar', 'Buy', 'Comprar'],
  packs: ['Ou leva duas peças num pack', 'Or take two pieces in a bundle', 'O llévate dos prendas en un pack'],
  last: ['Últimas unidades', 'Almost gone', 'Últimas unidades'],
  left: (n: number, size: string, name: string, lang: Lang) => [
    `${name}: ${n === 1 ? 'só resta 1' : `só restam ${n}`} no tamanho ${size}`,
    `${name}: only ${n} left in size ${size}`,
    `${name}: ${n === 1 ? 'solo queda 1' : `solo quedan ${n}`} en la talla ${size}`,
  ][ix(lang)],
  trust: [
    ['Envio grátis em Portugal a partir de 65€', '14 dias para trocar ou devolver', 'MB WAY, Multibanco e cartão'],
    ['Free shipping in Portugal over €65', '14 days to exchange or return', 'MB WAY, Multibanco and card'],
    ['Envío gratis en Portugal desde 65 €', '14 días para cambiar o devolver', 'MB WAY, Multibanco y tarjeta'],
  ],
  banner: ['-15% EM HOODIES, CREWNECKS E T-SHIRTS', '15% OFF HOODIES, CREWNECKS AND T-SHIRTS', '-15% EN HOODIES, CREWNECKS Y CAMISETAS'],
  ends: ['Acaba segunda, 30 de novembro, às 23:59', 'Ends Monday 30 November at 23:59', 'Termina el lunes 30 de noviembre a las 23:59'],
};

/* peças em destaque: as da lista que não estão esgotadas, até 4 */
function pickProducts(slugs: string[]) {
  return slugs.map((s) => products.find((p) => p.slug === s)).filter((p): p is Product => !!p && !isSoldOut(p)).slice(0, 4);
}
/* tamanhos com 1 ou 2 unidades nas peças em promoção (até 3 linhas) */
function lowStockLines(lang: Lang) {
  const out: string[] = [];
  for (const p of products) {
    if (!p.sizeStock || !(p.price < p.regularPrice)) continue;
    for (const [size, n] of Object.entries(p.sizeStock)) {
      if (n > 0 && n <= 2) out.push(TXT.left(n, size, `${trName(p.name, lang)} ${trColor(p.color, lang)}`, lang));
    }
  }
  return out.slice(0, 3);
}

/** HTML do email numa língua; `leave` é o link pessoal para sair da newsletter */
export function campaignHtml(c: Campaign, lang: Lang, leave: string) {
  const t = useT(lang);
  const i = ix(lang);
  const home = `${site.url}${href(lang, '/')}?${utm(c.id)}`;
  const cell = (p: ReturnType<typeof packs>[number]) => {
    const url = `${site.url}${href(lang, `/pack/${p.id}/`)}?${utm(c.id)}`;
    const img = (k: Kind) => `<img src="${site.url}${imageOf(k)}" width="110" height="110" alt="" style="display:inline-block;width:110px;height:110px;object-fit:contain;background:#e9e8e4;border-radius:4px;margin:0 2px">`;
    return `<td width="50%" style="padding:6px;vertical-align:top">
      <a href="${url}" style="display:block;background:#111111;color:#ffffff;text-decoration:none;text-align:center;padding:16px 8px;border-radius:4px">
        <span style="display:inline-block;background:#e10600;color:#ffffff;font-size:12px;font-weight:bold;padding:3px 8px;margin-bottom:10px">-${p.pct}%</span><br>
        ${img(p.a)}${img(p.b)}
        <span style="display:block;font-size:13px;font-weight:bold;margin-top:10px">${escapeHtml(t(`pack.${p.id}` as never))}</span>
        <span style="display:block;font-size:24px;font-weight:bold;color:#ff3b30;margin-top:4px">${amount(p.price, lang)}</span>
        <span style="display:block;font-size:12px;color:#9d9d98">${t('bf.instead', { n: `<s>${amount(p.normal, lang)}</s>` })}</span>
      </a></td>`;
  };
  const list = packs();
  const rows = [list.slice(0, 2), list.slice(2, 4)].map((r) => `<tr>${r.map(cell).join('')}</tr>`).join('');
  const shopBtn = (label: string, url = home, color = '#e10600') =>
    `<p style="text-align:center;margin:22px 0 6px"><a href="${url}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;padding:15px 32px;border-radius:999px;font-size:13px;letter-spacing:1.5px;font-weight:bold">${escapeHtml(label.toUpperCase())}</a></p>`;
  if (c.picks) {
    const picks = pickProducts(c.picks);
    const card = (p: Product) => {
      const url = `${site.url}${href(lang, `/produto/${p.slug}/`)}?${utm(c.id)}`;
      const sale = p.price < p.regularPrice;
      return `<td width="50%" style="padding:6px;vertical-align:top">
        <a href="${url}" style="display:block;text-decoration:none;color:#1f1f1f;background:#ffffff;border:1px solid #e2e2df;border-radius:6px;overflow:hidden">
          <span style="display:block;background:#f2f1ed;position:relative">
            <img src="${site.url}${jpg(p.images[0])}" width="260" alt="${escapeHtml(`${trName(p.name, lang)} ${trColor(p.color, lang)}`)}" style="display:block;width:100%;height:auto;border:0">
          </span>
          <span style="display:block;padding:12px 12px 14px">
            <span style="display:block;font-size:14px;font-weight:bold">${escapeHtml(trName(p.name, lang))}</span>
            <span style="display:block;font-size:12px;color:#5c5c5c;margin-top:2px">${escapeHtml(trColor(p.color, lang))}</span>
            <span style="display:block;margin-top:8px;font-size:18px;font-weight:bold;color:${sale ? '#e10600' : '#1f1f1f'}">${amount(p.price, lang)}${sale ? ` <s style="font-size:13px;color:#9d9d98;font-weight:normal">${amount(p.regularPrice, lang)}</s> <span style="display:inline-block;background:#e10600;color:#fff;font-size:11px;padding:2px 6px;vertical-align:middle">${TXT.off[i]}</span>` : ''}</span>
            <span style="display:inline-block;margin-top:10px;font-size:12px;letter-spacing:1px;font-weight:bold;text-decoration:underline">${TXT.buy[i].toUpperCase()}</span>
          </span>
        </a></td>`;
    };
    const pickRows = [picks.slice(0, 2), picks.slice(2, 4)].filter((r) => r.length).map((r) => `<tr>${r.map(card).join('')}${r.length === 1 ? '<td width="50%"></td>' : ''}</tr>`).join('');
    const low = lowStockLines(lang);
    const rv = c.review ? reviewsByName[c.review[0]]?.[c.review[1]] : undefined;
    const body = `
    ${c.hero ? `<a href="${home}"><img src="${site.url}${c.hero}" width="520" alt="" style="display:block;width:100%;height:auto;border:0;border-radius:6px;margin:0 0 16px"></a>` : ''}
    <p style="margin:0 0 18px;padding:13px 14px;background:#e10600;color:#ffffff;font-weight:bold;text-align:center;letter-spacing:1px;font-size:14px;line-height:1.4">${TXT.banner[i]}<br><span style="font-weight:normal;font-size:12.5px;letter-spacing:.5px">${TXT.ends[i]}</span></p>
    ${c.intro ? `<p style="font-size:17px;line-height:1.55;margin:0 0 6px">${escapeHtml(c.intro[i])}</p>` : ''}
    ${shopBtn(c.button[i])}
    <p style="margin:26px 0 8px">${escapeHtml(c.body[i])}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 6px">${pickRows}</table>
    ${low.length ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:14px 0 0;background:#fff4f3;border:1px solid #f3c7c3;border-radius:6px"><tr><td style="padding:12px 14px;font-size:13.5px;line-height:1.6">
      <strong style="color:#e10600;letter-spacing:1px;font-size:12px">${TXT.last[i].toUpperCase()}</strong><br>${low.map((l) => escapeHtml(l)).join('<br>')}</td></tr></table>` : ''}
    <p style="margin:30px 0 8px;font-size:16px;font-weight:bold">${TXT.packs[i]}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 6px">${rows}</table>
    <p style="font-size:12px;color:#5c5c5c;margin:6px 0 0">${t('bf.auto')}</p>
    ${shopBtn(c.button[i])}
    ${c.trust ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 0;border-top:1px solid #e2e2df;border-bottom:1px solid #e2e2df"><tr>${TXT.trust[i].map((x) => `<td width="33%" style="padding:14px 6px;text-align:center;font-size:12px;line-height:1.4;color:#1f1f1f">${x}</td>`).join('')}</tr></table>` : ''}
    ${rv ? `<p style="margin:26px 0 0;text-align:center;font-size:15px;line-height:1.6;font-style:italic">“${escapeHtml(rv.text)}”</p><p style="margin:6px 0 0;text-align:center;font-size:12.5px;color:#5c5c5c"><span style="color:#e1a400;letter-spacing:2px">★★★★★</span> ${escapeHtml(rv.author)}, ${escapeHtml(trName(c.review![0], lang))}</p>` : ''}
    ${c.malas ? malasBlock(c, lang) : ''}
    ${c.natal ? `<p style="margin:28px 0 0;padding:14px 16px;border-left:3px solid #1f1f1f;background:#f5f5f4;font-size:14.5px;line-height:1.55">${escapeHtml(c.natal[i])}</p>` : ''}
    ${c.sign ? `<p style="margin:30px 0 0;font-size:15px;line-height:1.6">${c.sign[i]}</p>` : ''}
    <p style="font-size:12px;color:#5c5c5c;margin-top:28px">${whyText(lang, leave)}</p>`;
    return layout(c.title[i], body, lang, c.preheader?.[i] ?? '');
  }
  const body = `
    <p style="margin:0 0 18px;padding:12px 14px;background:#e10600;color:#ffffff;font-weight:bold;text-align:center;letter-spacing:1px;font-size:14px">BLACK NOVEMBER · -15% · ${escapeHtml(t('bf.until').toUpperCase())}</p>
    ${c.intro ? `<p style="font-size:17px;line-height:1.55;margin:0 0 16px">${escapeHtml(c.intro[i])}</p>` : ''}
    <p>${escapeHtml(c.body[i])}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">${rows}</table>
    <p style="text-align:center;margin:26px 0 8px"><a href="${home}" style="display:inline-block;background:#e10600;color:#ffffff;text-decoration:none;padding:15px 30px;border-radius:999px;font-size:13px;letter-spacing:1.5px;font-weight:bold">${escapeHtml(c.button[i].toUpperCase())}</a></p>
    ${c.malas ? malasBlock(c, lang) : ''}
    ${c.natal ? `<p style="margin:28px 0 0;padding:14px 16px;border-left:3px solid #1f1f1f;background:#f5f5f4;font-size:14.5px;line-height:1.55">${escapeHtml(c.natal[i])}</p>` : ''}
    <p style="font-size:12px;color:#5c5c5c;margin-top:28px">${useT(lang)('bf.auto')}</p>
    <p style="font-size:12px;color:#5c5c5c">${whyText(lang, leave)}</p>`;
  return layout(c.title[i], body, lang);
}

function malasBlock(c: Campaign, lang: Lang) {
  const i = ix(lang);
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:34px 0 0;background:#f2f1ed;border-radius:6px"><tr><td align="center" style="padding:24px 20px 26px">
      <p style="margin:0 0 6px"><span style="display:inline-block;background:#1f1f1f;color:#ffffff;font-size:11px;letter-spacing:2px;text-transform:uppercase;padding:4px 9px">${MALAS.kicker[i]}</span></p>
      <p style="margin:0 0 12px;font-size:24px;font-weight:bold;text-transform:uppercase;letter-spacing:.5px">${MALAS.title[i]}</p>
      <a href="${site.url}${href(lang, '/loja/malas/')}?${utm(c.id)}"><img src="${site.url}/images/meta/products/mala-personalizada-1.jpg" width="360" alt="${escapeHtml(MALAS.title[i])}" style="display:block;width:100%;max-width:360px;height:auto;border:0;margin:0 auto"></a>
      <p style="margin:14px 0 6px;font-size:15px;line-height:1.55">${MALAS.text[i]}</p>
      <p style="margin:0 0 16px;font-weight:bold">${MALAS.from[i]}</p>
      <a href="${site.url}${href(lang, '/loja/malas/')}?${utm(c.id)}" style="display:inline-block;background:#1f1f1f;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:999px;font-size:12px;letter-spacing:1.5px;font-weight:bold">${MALAS.button[i].toUpperCase()}</a>
    </td></tr></table>`;
}

const whyText = (lang: Lang, leave: string) => [
  `Recebeste este email porque subscreveste a newsletter em ${site.url.replace('https://', '')}. Se não quiseres receber mais, <a href="${leave}" style="color:#5c5c5c">sai da newsletter aqui</a>.`,
  `You got this email because you subscribed to the newsletter on ${site.url.replace('https://', '')}. If you no longer want to receive it, <a href="${leave}" style="color:#5c5c5c">unsubscribe here</a>.`,
  `Has recibido este email porque te suscribiste a la newsletter en ${site.url.replace('https://', '')}. Si no quieres recibir más, <a href="${leave}" style="color:#5c5c5c">date de baja aquí</a>.`,
][ix(lang)];

const leaveUrl = (token: string, lang: Lang) => `${site.url}/newsletter/sair/?t=${token}${lang === 'pt' ? '' : `&l=${lang}`}`;
const asLang = (l: string): Lang => (l === 'en' || l === 'es' ? l : 'pt');

/** Envio de teste para um endereço (não fica registado) */
export async function sendCampaignTest(id: string, to: string, lang: Lang = 'pt') {
  const c = campaigns.find((x) => x.id === id);
  if (!c) return false;
  return sendMail(to, `[Teste] ${c.subject[ix(lang)]}`, campaignHtml(c, lang, `${site.url}/newsletter/sair/`));
}

/** Envia a campanha a todos os subscritores ativos que ainda não a receberam */
export async function sendCampaign(sql: any, id: string) {
  const c = campaigns.find((x) => x.id === id);
  if (!c) return { sent: 0, total: 0 };
  /* marca primeiro (para dois cliques não enviarem duas vezes) e desmarca o que não sair */
  const subs = await sql<{ email: string; token: string; lang: string }[]>`
    insert into campaign_sends (campaign, email)
    select ${id}, s.email from subscribers s
    where s.unsubscribed_at is null
      and not exists (select 1 from campaign_sends cs where cs.campaign = ${id} and cs.email = s.email)
    on conflict do nothing
    returning email, (select token from subscribers where email = campaign_sends.email) as token,
      (select lang from subscribers where email = campaign_sends.email) as lang`;
  const mails = subs.map((s: { email: string; token: string; lang: string }) => {
    const lang = asLang(s.lang);
    const leave = leaveUrl(s.token, lang);
    return { to: s.email, subject: c.subject[ix(lang)], html: campaignHtml(c, lang, leave), unsubscribe: leave };
  });
  const sent = await sendBatch(mails);
  if (sent < mails.length) {
    const failed = mails.slice(sent).map((m: { to: string }) => m.to);
    await sql`delete from campaign_sends where campaign = ${id} and email = any(${failed})`;
  }
  return { sent, total: mails.length };
}

/** Estado de cada campanha: quantos já receberam e quando saiu pela última vez */
export async function campaignStats(sql: any) {
  const rows = await sql<{ campaign: string; n: number; last: Date }[]>`
    select campaign, count(*)::int as n, max(sent_at) as last from campaign_sends group by campaign`;
  return Object.fromEntries(rows.map((r: { campaign: string; n: number; last: Date }) => [r.campaign, r]));
}

/* ---------- Agendamento ---------- */

/** "2026-11-27T10:00" em hora de Lisboa para a data certa (trata a mudança de hora) */
export function lisbonToDate(local: string) {
  const guess = new Date(`${local}:00Z`);
  if (Number.isNaN(guess.getTime())) return null;
  const inLisbon = new Date(guess.toLocaleString('en-US', { timeZone: 'Europe/Lisbon' }));
  const inUtc = new Date(guess.toLocaleString('en-US', { timeZone: 'UTC' }));
  return new Date(guess.getTime() - (inLisbon.getTime() - inUtc.getTime()));
}
/** Data para o campo do formulário (hora de Lisboa) */
export const toLisbonInput = (d: Date) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Lisbon', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    .format(d).replace(' ', 'T');

export async function scheduleCampaign(sql: any, id: string, at: Date, by: string) {
  await sql`insert into campaign_schedule (campaign, send_at, created_by) values (${id}, ${at}, ${by})
    on conflict (campaign) do update set send_at = excluded.send_at, created_by = excluded.created_by, created_at = now(), done_at = null, result = ''`;
}
export async function cancelSchedule(sql: any, id: string) {
  await sql`delete from campaign_schedule where campaign = ${id} and done_at is null`;
}
export async function schedules(sql: any) {
  const rows = await sql<any[]>`select * from campaign_schedule`;
  return Object.fromEntries(rows.map((r: any) => [r.campaign, r]));
}

/** Envia as campanhas cuja hora já chegou. Corre nas visitas ao site (no máximo de 5 em 5 minutos) e no agendador diário. */
export async function maybeSendScheduled() {
  try {
    const sql = await db();
    const [lock] = await sql<any[]>`
      insert into settings (key, value) values ('campaigns_last', ${sql.json({ at: new Date().toISOString() })})
      on conflict (key) do update set value = excluded.value
      where (settings.value->>'at')::timestamptz < now() - interval '5 minutes'
      returning key`;
    if (!lock) return 0;
    /* fica marcada antes de enviar, para duas visitas ao mesmo tempo não a enviarem duas vezes */
    const due = await sql<any[]>`
      update campaign_schedule set done_at = now()
      where done_at is null and send_at <= now()
      returning campaign`;
    for (const d of due) {
      const { sent, total } = await sendCampaign(sql, d.campaign);
      const label = campaigns.find((c) => c.id === d.campaign)?.label ?? d.campaign;
      const result = total === 0 ? 'Não havia subscritores por enviar.' : sent === total ? `Enviada a ${sent}.` : `Saíram ${sent} de ${total}.`;
      await sql`update campaign_schedule set result = ${result} where campaign = ${d.campaign}`;
      await pushNotify('campanha', `Campanha: ${label}`, result, '/admin/campanhas/');
    }
    return due.length;
  } catch (e) {
    console.error('[Mekie] Campanhas agendadas falharam:', (e as Error).message);
    return 0;
  }
}
