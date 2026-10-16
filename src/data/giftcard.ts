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
};

const slugify = (t: string) => t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
/** O nome do cartão vai no nome do ficheiro: se a imagem mudar, muda também o nome (e a cache) */
/** Validade em texto: 12 → "1 ano", 9 → "9 meses", 24 → "2 anos" */
export const giftValidity = (() => {
  const m = giftCard.validityMonths;
  if (m % 12) return `${m} meses`;
  return m === 12 ? '1 ano' : `${m / 12} anos`;
})();

export const giftImage = (value: number) => `/images/products/cartao-presente-${value}-${slugify(giftCard.names[value])}.webp`;

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
}));
