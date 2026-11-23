/* Respostas curtas e diretas sobre cada categoria (preço, tamanhos, material, entrega e devoluções).
   Aparecem no fundo da página da categoria e vão também no FAQPage. São calculadas a partir dos dados da loja,
   por isso estão sempre certas: se o preço ou o stock mudar no CRM, a resposta muda com ele.
   Servem as pessoas, o Google e os assistentes de IA (ChatGPT, Perplexity, Gemini), que citam respostas diretas. */
import { productsIn, getCategory, childCategories, type Product } from './products';
import { shipping } from './shipping';
import { site } from './site';
import { money, amount, type Lang } from '../i18n';
import { trCategory, trText } from '../i18n/catalog';
import { shipDays } from '../i18n/data';

const ORDER = ['XS', 'S', 'M', 'L', 'XL'];
type Qa = { q: string; a: string };

const L = <T,>(lang: Lang, pt: T, en: T, es: T) => (lang === 'en' ? en : lang === 'es' ? es : pt);

/* como se diz cada categoria numa pergunta: [pt, feminino?, en, es, feminino em es?] */
const NOUN: Record<string, [string, boolean, string, string, boolean]> = {
  'hoodies-crewnecks': ['os hoodies e as crewnecks', false, 'hoodies and crewnecks', 'las hoodies y crewnecks', true],
  't-shirts': ['as t-shirts', true, 'T-shirts', 'las camisetas', true],
  acessorios: ['os acessórios', false, 'accessories', 'los accesorios', false],
  caps: ['as caps', true, 'caps', 'las gorras', true],
  'bucket-hat': ['os bucket hats', false, 'bucket hats', 'los bucket hats', false],
  meias: ['as meias', true, 'socks', 'los calcetines', false],
  scrunchies: ['os scrunchies', false, 'scrunchies', 'los scrunchies', false],
  'tote-bag': ['as tote bags', true, 'tote bags', 'las tote bags', true],
  malas: ['as malas de crochet', true, 'crochet bags', 'los bolsos de ganchillo', false],
};

export function categoryAnswers(slug: string, lang: Lang = 'pt'): Qa[] {
  const cat = getCategory(slug);
  if (!cat) return [];
  const items = productsIn(slug).filter((p) => !p.hidden);
  if (!items.length) return [];
  const name = trCategory(cat, lang).name;
  const [nPt, femPt, nEn, nEs, femEs] = NOUN[slug] ?? [`as peças de ${name.toLowerCase()}`, true, name, `las prendas de ${name.toLowerCase()}`, true];
  const prices = items.map((p) => p.price);
  const min = Math.min(...prices), max = Math.max(...prices);
  const models = new Set(items.map((p) => p.name)).size;
  const out: Qa[] = [];
  /* categoria-mãe (Acessórios): mistura peças diferentes, por isso só preço, entrega e devoluções */
  const parent = childCategories(slug).length > 0;

  /* preço */
  out.push({
    q: L(lang, `Quanto custam ${nPt} da Mekie?`, `How much do Mekie ${nEn} cost?`, `¿Cuánto cuestan ${nEs} de Mekie?`),
    a: min === max
      ? L(lang, `Custam ${money(min, lang)}.`, `They cost ${money(min, lang)}.`, `Cuestan ${money(min, lang)}.`)
      : L(lang, `Entre ${money(min, lang)} e ${money(max, lang)}, em ${models} ${models === 1 ? 'modelo' : 'modelos'}.`,
        `Between ${money(min, lang)} and ${money(max, lang)}, across ${models} ${models === 1 ? 'design' : 'designs'}.`,
        `Entre ${money(min, lang)} y ${money(max, lang)}, en ${models} ${models === 1 ? 'modelo' : 'modelos'}.`)
      + (min >= site.freeShippingFrom ? L(lang, ' O envio em Portugal é grátis.', ' Shipping in Portugal is free.', ' El envío en Portugal es gratis.') : ''),
  });

  /* tamanhos */
  const sizes = ORDER.filter((s) => items.some((p) => p.sizes?.includes(s)));
  if (parent) {
    /* sem tamanhos nem material: cada subcategoria responde por si */
  } else if (slug === 'malas') {
    out.push({
      q: L(lang, 'Que tamanhos têm as malas?', 'What sizes are the bags?', '¿Qué tamaños tienen los bolsos?'),
      a: L(lang,
        'Há dois tamanhos. A S tem 16 cm de base, 10 cm de corpo e alça de 26 cm, e leva-se na mão ou no pulso. A M tem 24 cm de base, 15 cm de corpo e alça de 46 cm, e leva-se ao ombro.',
        'There are two sizes. The S has a 16 cm base, 10 cm body and 26 cm handle, to carry in your hand or on your wrist. The M has a 24 cm base, 15 cm body and 46 cm handle, to wear on your shoulder.',
        'Hay dos tamaños. El S tiene 16 cm de base, 10 cm de cuerpo y asa de 26 cm, y se lleva en la mano o en la muñeca. El M tiene 24 cm de base, 15 cm de cuerpo y asa de 46 cm, y se lleva al hombro.'),
    });
  } else {
    out.push({
      q: L(lang, `Em que tamanhos há ${nPt} da Mekie?`, `What sizes do Mekie ${nEn} come in?`, `¿En qué tallas hay ${nEs} de Mekie?`),
      a: sizes.length
        ? L(lang, `Do ${sizes[0]} ao ${sizes[sizes.length - 1]}, com corte unissexo. Se estiveres entre dois tamanhos, escreve-nos e ajudamos a escolher.`,
          `From ${sizes[0]} to ${sizes[sizes.length - 1]}, unisex fit. If you are between two sizes, write to us and we will help you choose.`,
          `De la ${sizes[0]} a la ${sizes[sizes.length - 1]}, corte unisex. Si dudas entre dos tallas, escríbenos y te ayudamos.`)
        : L(lang, 'Tamanho único.', 'One size.', 'Talla única.'),
    });
  }

  /* material */
  const comp = [...new Set(items.map((p) => p.details?.composition[0]).filter(Boolean) as string[])].slice(0, 3);
  const handmade = items.some((p) => p.details?.features.some((f) => /feit[oa] à mão/i.test(f)));
  if (comp.length && !parent) {
    const list = comp.map((c) => trText(c, lang)).join(L(lang, '; ', '; ', '; '));
    out.push({
      q: L(lang, `De que são feit${femPt ? 'as' : 'os'} ${nPt} da Mekie?`, `What are Mekie ${nEn} made of?`, `¿De qué están hech${femEs ? 'as' : 'os'} ${nEs} de Mekie?`),
      a: (comp.length > 1 ? L(lang, 'Depende do modelo: ', 'Depends on the design: ', 'Depende del modelo: ') : '') + `${list}.`
        + (handmade ? L(lang, ` São feit${femPt ? 'as' : 'os'} à mão por nós, ${femPt ? 'uma a uma' : 'um a um'}.`, ' We make them by hand, one at a time.', ` L${femEs ? 'as' : 'os'} hacemos a mano, ${femEs ? 'una a una' : 'uno a uno'}.`) : ''),
    });
  }

  /* entrega */
  const made = items.filter((p) => p.madeToOrderDays).map((p) => p.madeToOrderDays!);
  const pt = shipping.pt, eu = shipping.eu;
  out.push({
    q: L(lang, `Quanto tempo demora a entrega ${femPt ? 'das' : 'dos'} ${nPt.replace(/^(os|as) /, '').replace(' e as ', ' e das ')} e quanto custa o envio?`, `How long does delivery of Mekie ${nEn} take and how much is shipping?`, `¿Cuánto tarda la entrega de ${nEs} y cuánto cuesta el envío?`),
    a: L(lang,
      `Em Portugal Continental, nos Açores e na Madeira entregamos em ${shipDays('pt', lang)} pelos CTT. O envio custa a partir de ${money(pt.bands[0].price, lang)} e é grátis a partir de ${amount(site.freeShippingFrom, lang)}. Para a União Europeia, ${shipDays('eu', lang)}, a partir de ${money(eu.bands[0].price, lang)}.`,
      `In mainland Portugal, the Azores and Madeira we deliver in ${shipDays('pt', lang)} with CTT. Shipping starts at ${money(pt.bands[0].price, lang)} and is free over ${amount(site.freeShippingFrom, lang)}. To the European Union, ${shipDays('eu', lang)}, from ${money(eu.bands[0].price, lang)}.`,
      `En Portugal continental, Azores y Madeira entregamos en ${shipDays('pt', lang)} con CTT. El envío cuesta desde ${money(pt.bands[0].price, lang)} y es gratis a partir de ${amount(site.freeShippingFrom, lang)}. A la Unión Europea, ${shipDays('eu', lang)}, desde ${money(eu.bands[0].price, lang)}.`)
      + (made.length ? L(lang, ` As peças feitas por encomenda demoram cerca de ${Math.min(...made)} dias úteis.`, ` Made-to-order pieces take about ${Math.min(...made)} working days.`, ` Las piezas por encargo tardan unos ${Math.min(...made)} días laborables.`) : ''),
  });

  /* devoluções */
  const custom = items.some((p: Product) => p.customizable);
  out.push({
    q: L(lang, `Posso trocar ou devolver ${nPt} da Mekie?`, `Can I exchange or return Mekie ${nEn}?`, `¿Puedo cambiar o devolver ${nEs} de Mekie?`),
    a: L(lang, 'Sim. Tens 14 dias depois de receberes para trocar ou devolver, sem precisar de explicar porquê, desde que a peça esteja como chegou.',
      'Yes. You have 14 days after delivery to exchange or return, no reason needed, as long as the item is as it arrived.',
      'Sí. Tienes 14 días desde que lo recibes para cambiar o devolver, sin dar explicaciones, si la prenda está como llegó.')
      + (custom ? L(lang, ' As peças personalizadas não têm devolução, porque são feitas para ti, mas têm garantia.', ' Custom pieces cannot be returned, since they are made for you, but they are covered by the warranty.', ' Las piezas personalizadas no admiten devolución, porque se hacen para ti, pero tienen garantía.') : ''),
  });
  return out;
}
