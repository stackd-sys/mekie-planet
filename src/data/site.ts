export const site = {
  name: 'Mekie Planet',
  shortName: 'Mekie',
  tagline: 'Bro, o básico nunca falha.',
  url: 'https://mekie-planet.com',
  email: 'geral@mekie-planet.com',
  // Identificação do vendedor nos Termos e Condições (obrigatória por lei)
  company: {
    legalName: 'Mekie Planet',
    kind: 'empresário em nome individual',
    nif: '185359922',
    address: 'Rua Dr. Eduardo Burnay 26B, 2655-420 Ericeira',
  },
  instagram: 'https://www.instagram.com/mekie_planet/',
  // Medição: só carregam depois de a pessoa aceitar no aviso de cookies. Vazio = desligado (e sem aviso).
  analytics: {
    ga4: 'G-1ZM3W7QS2T',
    metaPixel: '4063958257255357',
  },
  // Portes: valores em src/data/shipping.ts
  freeShippingFrom: 65,
  deliveryDays: 7,
  // Webhook que guarda os emails da newsletter e controla o uso do código (ver integrations/newsletter.gs e o README).
  // Pode ficar aqui ou na variável PUBLIC_NEWSLETTER_WEBHOOK da Vercel.
  newsletterWebhook: (import.meta.env.PUBLIC_NEWSLETTER_WEBHOOK as string | undefined) ?? '',
  // Código de boas-vindas mostrado depois de subscrever. Tem de existir também no sistema de pagamento.
  welcomeCode: 'MEKIE10',
  welcomeDiscount: 10,
  announcement: [
    'Últimas unidades',
    'Envio gratuito em Portugal acima de 65€',
    'Entrega em 7 dias úteis via CTT',
  ],
};

export const formatPrice = (value: number) =>
  `${value.toFixed(2).replace('.', ',')}€`;
