/* Campanhas da newsletter (Black November): três emails prontos, enviados a partir do CRM (Campanhas).
   Cada subscritor recebe na sua língua e cada campanha só sai uma vez por pessoa (tabela campaign_sends). */
import { site } from '../../data/site';
import { products } from '../../data/products';
import { kindOf, type Kind } from '../../data/promo';
import { packs } from '../../data/packs';
import { layout, escapeHtml, sendBatch, sendMail } from './mail';
import { href, amount, type Lang } from '../../i18n';
import { useT } from '../../i18n/ui';

type Text = [string, string, string];
type Campaign = { id: string; date: string; label: string; subject: Text; title: Text; body: Text; button: Text };

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
    subject: ['Fim de semana Black Friday na Mekie', 'Black Friday weekend at Mekie', 'Fin de semana Black Friday en Mekie'],
    title: ['É o fim de semana Black Friday', "It's Black Friday weekend", 'Es el fin de semana Black Friday'],
    body: [
      'Os -15% e os packs continuam, mas só até segunda-feira, 30 de novembro. Depois disso, tudo volta ao preço normal. Se andavas a pensar naquele hoodie, é agora. E há peças com poucas unidades em alguns tamanhos.',
      'The 15% off and the bundles are still on, but only until Monday 30 November. After that, everything goes back to full price. If you had your eye on that hoodie, now is the time. Some sizes are running low.',
      'El -15% y los packs siguen, pero solo hasta el lunes 30 de noviembre. Después, todo vuelve al precio normal. Si le tenías ganas a esa hoodie, es ahora. Y en algunas tallas quedan pocas unidades.',
    ],
    button: ['Aproveitar agora', 'Shop now', 'Aprovechar ahora'],
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
const show: Record<Kind, string> = { hoodie: 'hoodie-cogumelos', crewneck: 'crewneck-mekie-preta', tshirt: 'tshirt-black-cogumelos', cap: 'cap-mekie-black' };
const imageOf = (k: Kind) => (products.find((p) => p.slug === show[k]) ?? products.find((p) => kindOf(p) === k))!.images[0];

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
  const body = `
    <p style="margin:0 0 18px;padding:12px 14px;background:#e10600;color:#ffffff;font-weight:bold;text-align:center;letter-spacing:1px;font-size:14px">BLACK NOVEMBER · -15% · ${escapeHtml(t('bf.until').toUpperCase())}</p>
    <p>${escapeHtml(c.body[i])}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">${rows}</table>
    <p style="text-align:center;margin:26px 0 8px"><a href="${home}" style="display:inline-block;background:#e10600;color:#ffffff;text-decoration:none;padding:15px 30px;border-radius:999px;font-size:13px;letter-spacing:1.5px;font-weight:bold">${escapeHtml(c.button[i].toUpperCase())}</a></p>
    <p style="font-size:12px;color:#5c5c5c;margin-top:28px">${useT(lang)('bf.auto')}</p>
    <p style="font-size:12px;color:#5c5c5c">${whyText(lang, leave)}</p>`;
  return layout(c.title[i], body, lang);
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
