/* Cartão presente: digital, enviado por email. Os códigos e o saldo vivem no CRM (/admin/cartoes/). */

export const giftCard = {
  name: 'Cartão Presente',
  slug: 'cartao-presente',
  /** validade em meses, a contar da data de compra */
  validityMonths: 12,
  /** prazo para enviarmos o cartão por email depois do pagamento */
  sendDays: 1,
  values: [25, 50, 75, 100],
  /** nome de cada cartão, também impresso na imagem */
  names: { 25: 'Não sejas fuinha', 50: 'Tá-se bem', 75: 'Mekie bro', 100: 'Estás um mãos largas' } as Record<number, string>,
  /** cartão com o valor escolhido pelo cliente (euros inteiros, entre o mínimo e o máximo) */
  custom: { id: 9105, title: 'À tua medida', min: 25, max: 500 },
  /** nomes impressos nos cartões em inglês e espanhol (as imagens têm o sufixo -en / -es) */
  i18n: {
    en: { 25: "Don't be stingy", 50: 'All good', 75: 'Mekie bro', 100: 'Big spender', custom: 'Your call' },
    es: { 25: 'No seas rácano', 50: 'Todo bien', 75: 'Mekie bro', 100: 'Estás hecho un manirroto', custom: 'A tu medida' },
  } as Record<'en' | 'es', Record<number | 'custom', string>>,
};

type CardLang = 'pt' | 'en' | 'es';
/** Nome do cartão (o impresso na imagem) na língua: giftTitle(50, 'en') → "All good" */
export const giftTitle = (value: number | 'custom', lang: CardLang = 'pt') =>
  lang === 'pt' ? (value === 'custom' ? giftCard.custom.title : giftCard.names[value]) : giftCard.i18n[lang][value];
/** Nome em português → nome na língua (para os textos guardados nas encomendas) */
export const giftTitleFromPt = (pt: string, lang: CardLang) => {
  if (lang === 'pt') return pt;
  const key = pt === giftCard.custom.title ? 'custom' : Number(Object.entries(giftCard.names).find(([, n]) => n === pt)?.[0]);
  return key === 'custom' || key ? giftTitle(key as number | 'custom', lang) : pt;
};

const slugify = (t: string) => t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/** O nome do cartão vai no nome do ficheiro: se a imagem mudar, muda também o nome (e a cache) */
/** Validade em texto: 12 → "1 ano", 9 → "9 meses", 24 → "2 anos" */
export const giftValidity = (() => {
  const m = giftCard.validityMonths;
  if (m % 12) return `${m} meses`;
  return m === 12 ? '1 ano' : `${m / 12} anos`;
})();

export const giftImage = (value: number | 'custom', lang: CardLang = 'pt') =>
  `/images/products/cartao-presente-${value === 'custom' ? '' : `${value}-`}${slugify(giftTitle(value, lang))}${lang === 'pt' ? '' : `-${lang}`}.webp`;

/** Entradas do catálogo do carrinho, uma por valor (o id fixa o preço). */
export const giftCatalog = giftCard.values.map((value, i) => ({
  id: 9101 + i,
  slug: giftCard.slug,
  href: `/${giftCard.slug}/`,
  name: giftCard.name,
  color: `${value}€ · ${giftCard.names[value]}`,
  value,
  title: giftCard.names[value],
  price: value,
  image: giftImage(value),
  grams: 0,
  digital: true,
  variable: false,
})).concat({
  /* valor à escolha: o preço vem da linha do carrinho e é validado no servidor */
  id: giftCard.custom.id,
  slug: giftCard.slug,
  href: `/${giftCard.slug}/`,
  name: giftCard.name,
  color: giftCard.custom.title,
  value: giftCard.custom.min,
  title: giftCard.custom.title,
  price: giftCard.custom.min,
  image: giftImage('custom'),
  grams: 0,
  digital: true,
  variable: true,
});

/** Valor do cartão à medida: euros inteiros dentro dos limites, ou null */
export const customGiftValue = (v: unknown) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= giftCard.custom.min && n <= giftCard.custom.max ? n : null;
};

