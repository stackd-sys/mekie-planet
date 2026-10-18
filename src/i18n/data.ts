/* Dados da loja na língua da página: produtos, categorias, coleções, páginas legais, FAQ, portes. */
import { type Lang, money, amount } from './index';
import { trProduct, trCategory, trCollection, trName, trColor } from './catalog';
import * as data from '../data/products';
import { legalPages, legalUpdated } from '../data/legal';
import { legalPagesEn, legalUpdatedEn } from '../data/i18n/legal-en';
import { legalPagesEs, legalUpdatedEs } from '../data/i18n/legal-es';
import { faqGroups } from '../data/faq';
import { faqGroupsEn } from '../data/i18n/faq-en';
import { faqGroupsEs } from '../data/i18n/faq-es';
import { giftCard, giftValidity, giftCatalog } from '../data/giftcard';
import { shipping, destinations, type Zone } from '../data/shipping';

export function shop(lang: Lang) {
  const products = data.products.map((p) => trProduct(p, lang));
  const categories = data.categories.map((c) => trCategory(c, lang));
  const collections = data.collections.map((c) => trCollection(c, lang));
  const byId = new Map(products.map((p) => [p.id, p]));
  const local = (list: data.Product[]) => list.map((p) => byId.get(p.id)!);
  const childCategories = (slug: string) => categories.filter((c) => c.parent === slug);
  return {
    products,
    categories,
    collections,
    topCategories: categories.filter((c) => !c.parent),
    childCategories,
    getCategory: (slug: string) => categories.find((c) => c.slug === slug),
    productsIn: (slug: string) => local(data.productsIn(slug)),
    productsInCollection: (slug: string) => local(data.productsInCollection(slug)),
    lowStock: () => local(data.lowStock()),
    variantsOf: (p: data.Product) => local(data.variantsOf(data.products.find((o) => o.id === p.id)!)),
    /** produto na língua da página a partir do produto em português */
    tr: (p: data.Product) => byId.get(p.id) ?? p,
  };
}

export const legalFor = (lang: Lang) => (lang === 'en' ? legalPagesEn : lang === 'es' ? legalPagesEs : legalPages);
export const legalUpdatedFor = (lang: Lang) => (lang === 'en' ? legalUpdatedEn : lang === 'es' ? legalUpdatedEs : legalUpdated);
export const faqFor = (lang: Lang) => (lang === 'en' ? faqGroupsEn : lang === 'es' ? faqGroupsEs : faqGroups);

/** Prazo de entrega por zona: "7 dias úteis", "7 working days", "7 días laborables" */
export function shipDays(zone: Zone, lang: Lang) {
  const pt = shipping[zone].days;
  if (lang === 'pt') return pt;
  const [a, b] = pt.match(/\d+/g) ?? [];
  const unit = lang === 'en' ? 'working days' : 'días laborables';
  return b ? (lang === 'en' ? `${a} to ${b} ${unit}` : `de ${a} a ${b} ${unit}`) : `${a} ${unit}`;
}

/** Validade do cartão presente: "1 ano", "1 year", "1 año" */
export function giftValidityFor(lang: Lang) {
  if (lang === 'pt') return giftValidity;
  const m = giftCard.validityMonths;
  if (m % 12) return lang === 'en' ? `${m} months` : `${m} meses`;
  const y = m / 12;
  return lang === 'en' ? (y === 1 ? '1 year' : `${y} years`) : y === 1 ? '1 año' : `${y} años`;
}

/** Lista de valores do cartão: "25, 50, 75 ou 100€" */
export function giftValues(lang: Lang) {
  const v = giftCard.values.map((n) => (lang === 'pt' ? String(n) : money(n, lang).replace(/[.,]00/, '')));
  const last = v.pop();
  const or = lang === 'en' ? 'or' : lang === 'es' ? 'o' : 'ou';
  const other = { pt: `, ou outro valor a partir de ${giftCard.custom.min}€`, en: `, or any amount from ${amount(giftCard.custom.min, lang)}`, es: `, u otro importe desde ${amount(giftCard.custom.min, lang)}` }[lang];
  return `${v.join(', ')} ${or} ${last}${lang === 'pt' ? '€' : ''}${other}`;
}

/** Cartões presente com nome e descrição na língua (os títulos dos cartões ficam em português: estão impressos na imagem) */
export const giftCatalogFor = (lang: Lang) =>
  giftCatalog.map((g) => ({ ...g, name: trName(g.name, lang), color: g.variable ? g.title : `${money(g.value, lang).replace(/[.,]00/, '')} · ${g.title}` }));

/* Países de entrega: o valor do formulário fica em português (é o que o CRM guarda), o texto na língua da página */
const iso: Record<string, string> = {
  Alemanha: 'DE', Áustria: 'AT', Bélgica: 'BE', Bulgária: 'BG', Chipre: 'CY', Croácia: 'HR', Dinamarca: 'DK', Eslováquia: 'SK',
  Eslovénia: 'SI', Espanha: 'ES', Estónia: 'EE', Finlândia: 'FI', França: 'FR', Grécia: 'GR', Hungria: 'HU', Irlanda: 'IE', Itália: 'IT',
  Letónia: 'LV', Lituânia: 'LT', Luxemburgo: 'LU', Malta: 'MT', 'Países Baixos': 'NL', Polónia: 'PL', Chéquia: 'CZ', Roménia: 'RO', Suécia: 'SE',
};
const islands: Record<string, [string, string]> = {
  'Portugal Continental': ['Mainland Portugal', 'Portugal continental'],
  Açores: ['Azores (Portugal)', 'Azores (Portugal)'],
  Madeira: ['Madeira (Portugal)', 'Madeira (Portugal)'],
};
export function destinationsFor(lang: Lang) {
  if (lang === 'pt') return destinations.map((d) => ({ ...d, label: d.name }));
  const names = new Intl.DisplayNames([lang], { type: 'region' });
  const list = destinations.map((d) => ({ ...d, label: islands[d.name]?.[lang === 'en' ? 0 : 1] ?? names.of(iso[d.name]) ?? d.name }));
  /* as três zonas de Portugal primeiro, depois a UE por ordem alfabética na língua */
  return [...list.slice(0, 3), ...list.slice(3).sort((a, b) => a.label.localeCompare(b.label, lang))];
}

/** Nome completo do produto (com a cor) na língua, a partir dos campos em português guardados na encomenda */
export const lineName = (name: string, color: string, lang: Lang) =>
  [trName(name, lang), color && trColor(color, lang)].filter(Boolean).join(', ');
