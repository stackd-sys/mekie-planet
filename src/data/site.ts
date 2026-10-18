export const site = {
  name: 'Mekie Planet',
  shortName: 'Mekie',
  tagline: 'Bro, o básico nunca falha.',
  url: 'https://mekie-planet.com',
  email: 'geral@mekie-planet.com',
  // Caixa onde a Mekie lê o correio: respostas dos clientes aos emails e avisos de encomendas
  inbox: 'mekieplanet@gmail.com',
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
  // Onde o site guarda newsletter, avisos e consulta códigos e cartões: a API do CRM.
  // PUBLIC_NEWSLETTER_WEBHOOK na Vercel só serve para usar outro sistema (ex.: o antigo Google Apps Script).
  newsletterWebhook: (import.meta.env.PUBLIC_NEWSLETTER_WEBHOOK as string | undefined) || '/api/newsletter/',
  // Código de boas-vindas mostrado depois de subscrever. Tem de existir também no sistema de pagamento.
  welcomeCode: 'MEKIE10',
  welcomeDiscount: 10,
  /* a barra de avisos do topo está em src/i18n/ui.ts (announce.*), nas três línguas */
};

export const formatPrice = (value: number) =>
  `${value.toFixed(2).replace('.', ',')}€`;
