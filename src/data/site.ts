export const site = {
  name: 'Mekie Planet',
  shortName: 'Mekie',
  tagline: 'Bro, o básico nunca falha.',
  url: 'https://mekie-planet.com',
  email: 'geral@mekie-planet.com',
  instagram: 'https://www.instagram.com/mekie_planet/',
  freeShippingFrom: 65,
  deliveryDays: 7,
  // Webhook que guarda os emails da newsletter e controla o uso do código (ver integrations/newsletter.gs e o README).
  newsletterWebhook: '',
  // Código de boas-vindas mostrado depois de subscrever. Tem de existir também no sistema de pagamento.
  welcomeCode: 'MEKIE10',
  welcomeDiscount: 10,
  announcement: [
    'Últimas unidades',
    'Envio gratuito em encomendas acima de 65€',
    'Entrega em 7 dias úteis via CTT',
  ],
};

export const formatPrice = (value: number) =>
  `${value.toFixed(2).replace('.', ',')}€`;
