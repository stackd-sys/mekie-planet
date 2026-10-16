/* Cartão presente: digital, enviado por email. Os códigos e o saldo vivem na Google Sheet do webhook
   (folha "Cartoes"), ver integrations/newsletter.gs. */

export const giftCard = {
  name: 'Cartão Presente',
  slug: 'cartao-presente',
  /** validade a contar da data de compra */
  validityYears: 2,
  /** prazo para enviarmos o cartão por email depois do pagamento */
  sendDays: 1,
  values: [25, 50, 75, 100],
};

export const giftImage = (value: number) => `/images/products/cartao-presente-${value}.webp`;

/** Entradas do catálogo do carrinho, uma por valor (o id fixa o preço). */
export const giftCatalog = giftCard.values.map((value, i) => ({
  id: 9101 + i,
  slug: giftCard.slug,
  href: `/${giftCard.slug}/`,
  name: giftCard.name,
  color: `${value}€`,
  price: value,
  image: giftImage(value),
  grams: 0,
  digital: true,
}));
