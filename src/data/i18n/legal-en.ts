import type { LegalPage } from '../legal';
import { site } from '../site';
import { giftCard } from '../giftcard';
import { shipping, packagingGrams } from '../shipping';

export const legalUpdatedEn = '16 October 2026';

const { company, email } = site;
const seller = [
  company.legalName,
  company.kind && 'sole trader (empresário em nome individual)',
  company.nif && `NIF ${company.nif}`,
  `registered at ${company.address}`,
]
  .filter(Boolean)
  .join(', ');
const pt = shipping.pt;
const eu = shipping.eu;
const price = (value: number) => `€${value.toFixed(2)}`;
const kg = (g: number) => (g >= 1000 ? `${g / 1000} kg` : `${g} g`);
/* Delivery times come from the numbers in the PT strings ("7 dias úteis", "10 a 15 dias úteis") */
const workingDays = (s: string) => {
  const n = s.match(/\d+/g) ?? [];
  if (n.length > 1) return `${n[0]} to ${n[1]} working days`;
  return `${n[0]} working day${n[0] === '1' ? '' : 's'}`;
};
const giftValidity = (() => {
  const m = giftCard.validityMonths;
  if (m % 12) return `${m} month${m === 1 ? '' : 's'}`;
  return m === 12 ? '1 year' : `${m / 12} years`;
})();
const giftValues = giftCard.values.map((v) => `€${v}`).join(', ').replace(/, (€\d+)$/, ' and $1');
/* Shipping table rows: one weight band per row */
const rateRows = (dest: string, z: typeof pt) =>
  z.bands.map((b, i) => [
    i === 0 ? dest : '',
    i === 0 ? `up to ${kg(b.upTo)}` : `${kg(z.bands[i - 1].upTo)} to ${kg(b.upTo)}`,
    price(b.price),
    i === 0 ? (z.freeFrom === null ? 'no free shipping' : `free over €${z.freeFrom}`) : '',
  ]);
const analytics = site.analytics;

export const legalPagesEn: LegalPage[] = [
  {
    slug: 'terms-and-conditions',
    title: 'Terms and Conditions',
    summary: 'Terms of sale for the Mekie Planet online store: orders, prices, payment, shipping, returns and warranty.',
    sections: [
      {
        heading: 'Who we are',
        body: [
          `The online store mekie-planet.com is run by ${seller}. You can reach us by email at ${email}.`,
          'These terms apply to every purchase made on the site. By placing an order, you accept these terms, the Shipping and Delivery Policy, the Returns and Refunds Policy and the Privacy Policy.',
          'These terms are a translation of the Portuguese original, and if there is any discrepancy between the two, the Portuguese version prevails.',
        ],
      },
      {
        heading: 'Products and stock',
        body: [
          'We show the real stock of every piece and every size. When a size sells out, it appears crossed out and cannot be ordered.',
          'Some pieces are handmade to order, such as the scrunchies. In those cases, the production time is shown on the product page and is added to the shipping time.',
          'The photos are of our own pieces, but colours may look slightly different depending on your screen.',
        ],
      },
      {
        heading: 'Prices',
        body: [
          'Prices are in euros and include VAT at the legal rate in force. Shipping costs are not included and are shown at checkout before you complete your order.',
          'If a price is wrong due to an obvious error, we will let you know before shipping the order, and you can choose to go ahead at the correct price or cancel with a full refund.',
        ],
      },
      {
        heading: 'Orders',
        body: [
          'Your order is confirmed when you receive our confirmation email. If a piece becomes unavailable after you order it, we will let you know and refund the amount for that piece within 14 days at most.',
        ],
      },
      {
        heading: 'Payment',
        body: [
          'We accept MB WAY, Multibanco reference, credit and debit cards, Apple Pay and Google Pay. Card payments are processed by a certified payment provider, and Mekie never sees or stores your card details.',
          'We ship your order once payment is confirmed.',
        ],
      },
      {
        heading: 'Discount codes',
        body: [
          `The code ${site.welcomeCode} gives newsletter subscribers ${site.welcomeDiscount}% off their first order. It can only be used once per person, with the email address you subscribed with.`,
          'Codes cannot be combined with each other or with other promotions, do not apply to shipping costs or to gift card purchases, and cannot be exchanged for cash.',
        ],
      },
      {
        heading: 'Gift cards',
        body: [
          {
            list: [
              `The gift card is digital, comes in values of ${giftValues} or any other amount from €${giftCard.custom.min} to €${giftCard.custom.max}, and is sent by email, with a unique code, within ${giftCard.sendDays} working day${giftCard.sendDays === 1 ? '' : 's'} of payment. There are no shipping costs.`,
              `It is valid for ${giftValidity} from the date of purchase, shown in the email.`,
              'It can be used across several orders in the online store until the balance runs out, and also together with a discount code. If the order costs more than the balance, you pay the difference.',
              'It cannot be exchanged for cash or used to buy other gift cards. Any balance left when it expires is not refunded.',
              'Keep the code safe: it works like cash, and we are not responsible for the use of a code you have shared or lost. If you think someone has used it without your permission, contact us right away.',
              'If you return a piece paid for with a gift card, the amount paid with the card goes back onto the card balance.',
              'You have 14 days to cancel the purchase of a gift card, as long as it has not been used yet. In that case we refund the full amount.',
            ],
          },
        ],
      },
      {
        heading: 'Shipping, returns and warranty',
        body: [
          'Shipping destinations, prices and delivery times are set out in the Shipping and Delivery Policy.',
          'You have 14 days to return a purchase without giving a reason, under the Returns and Refunds Policy. Personalised pieces, such as the scrunchie in the colours you choose, cannot be returned, but they are covered by the warranty.',
          'All pieces come with the 3-year legal guarantee of conformity from delivery, under Decree-Law No. 84/2021. If a piece is faulty, contact us and we will sort it out by repair, replacement, price reduction or refund, as provided by law.',
        ],
      },
      {
        heading: 'Intellectual property',
        body: [
          'The Mekie designs, logo, photos and texts on the site belong to us. They may not be copied or used without written permission.',
        ],
      },
      {
        heading: 'Applicable law and disputes',
        body: [
          'These terms are governed by Portuguese law. If you have a problem we cannot resolve with you, you can turn to the bodies listed on the Dispute Resolution page or to the Livro de Reclamações Eletrónico (the official Portuguese online complaints book).',
          `We may update these terms. The version that applies is the one published on the day of your order. Last updated: ${legalUpdatedEn}.`,
        ],
      },
    ],
  },
  {
    slug: 'shipping-policy',
    title: 'Shipping and Delivery Policy',
    summary: `CTT shipping to mainland Portugal, the Azores and Madeira from ${price(pt.bands[0].price)}, free over €${pt.freeFrom}, and to the European Union from ${price(eu.bands[0].price)}. Delivery times and tracking.`,
    sections: [
      {
        heading: 'Where we ship',
        body: [
          'We ship with CTT (Portuguese postal service) to mainland Portugal, the Azores, Madeira and every country in the European Union. For other countries, contact us before ordering.',
        ],
      },
      {
        heading: 'Prices',
        body: [
          {
            table: {
              head: ['Destination', 'Order weight', 'Shipping', 'Free shipping'],
              rows: [...rateRows('Mainland Portugal, Azores and Madeira', pt), ...rateRows('European Union', eu)],
            },
          },
          'The exact amount appears at checkout when you choose your country. Free shipping is based on the value of the items before discounts. The Azores and Madeira pay the same as the mainland.',
          `The weight includes the packaging (about ${packagingGrams} g). As a guide, a t-shirt weighs about 250 g, an accessory between 50 and 180 g and a hoodie about 700 g. Above ${kg(eu.bands[eu.bands.length - 1].upTo)}, the order ships in more than one parcel and the shipping costs are added together.`,
        ],
      },
      {
        heading: 'Delivery times',
        body: [
          {
            list: [
              `Mainland Portugal, Azores and Madeira: up to ${workingDays(pt.days)} after payment is confirmed.`,
              `European Union: ${workingDays(eu.days)} after payment is confirmed.`,
              'Made-to-order pieces: the production time shown on the product page is added to the shipping time.',
            ],
          },
          'During holidays or sales, delivery may take a little longer. If there is a delay, we will let you know by email.',
        ],
      },
      {
        heading: 'Order tracking',
        body: ['When your order ships, we send you an email with the CTT tracking number.'],
      },
      {
        heading: 'Address and delivery',
        body: [
          'Check your address carefully at checkout. If the order comes back to us because the address was incomplete or the parcel was not collected, we will send it again once you pay the new shipping costs, or refund the value of the items.',
          `If your order arrives damaged or something is missing, send photos to ${email} and we will fix it at no cost to you.`,
        ],
      },
      {
        heading: 'Taxes',
        body: ['Prices include VAT. There are no customs duties on shipments within the European Union.'],
      },
    ],
  },
  {
    slug: 'returns-and-refunds-policy',
    title: 'Returns and Refunds Policy',
    summary: 'You have 14 days to return without giving a reason. How to return, exchange a size and when you get your refund.',
    sections: [
      {
        heading: 'Right of withdrawal',
        body: [
          'You have 14 calendar days from the day you receive your order to cancel the purchase without giving a reason, under Decree-Law No. 24/2014.',
        ],
      },
      {
        heading: 'How to return',
        body: [
          {
            list: [
              `Email us at ${email} with your order number and the pieces you want to return. You can also use the withdrawal form at the end of this page.`,
              'We reply with the address to send them to.',
              'Send the pieces within 14 days of your email.',
            ],
          },
          'Return shipping costs are on you. We recommend a tracked service.',
        ],
      },
      {
        heading: 'Condition of the pieces',
        body: [
          'You can try the pieces on as you would in a shop. If a piece comes back worn, washed or with the tags removed, we may deduct the loss in value from the refund.',
        ],
      },
      {
        heading: 'Refund',
        body: [
          'We refund the value of the pieces and the original shipping costs (up to the cost of standard shipping) within 14 days of hearing from you, using the same payment method. We may wait until we receive the pieces or until you send us proof of shipment, whichever comes first.',
          'If you return only part of an order, the original shipping costs are not refunded.',
        ],
      },
      {
        heading: 'Size exchanges',
        body: [
          'To exchange a size, contact us before sending anything back. If it is in stock, we reserve the piece for you. You pay to send the piece to us, and we cover shipping for the new one.',
        ],
      },
      {
        heading: 'Personalised pieces',
        body: [
          'Personalised scrunchies are made in the colours you choose, so they are not covered by the right of withdrawal (Article 17 of Decree-Law No. 24/2014). They are still covered by the legal guarantee if they are faulty.',
        ],
      },
      {
        heading: 'Faulty pieces',
        body: [
          'If a piece is faulty or does not match your order, contact us. In that case we cover the shipping costs, and you have the 3-year legal guarantee.',
        ],
      },
      {
        heading: 'Withdrawal form',
        body: [
          'Copy this text into your email and fill it in:',
          `To: ${seller}, ${email}.`,
          'I hereby give notice that I withdraw from the contract for the purchase of the following pieces: [pieces]. Order No. [number], received on [date]. Name: [name]. Address: [address]. Date: [date].',
        ],
      },
    ],
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    summary: 'What personal data we collect, what for, who we share it with, how long we keep it and what your rights are.',
    sections: [
      {
        heading: 'Data controller',
        body: [`${seller}. For anything about your data, write to ${email}.`],
      },
      {
        heading: 'What data we collect and why',
        body: [
          {
            table: {
              head: ['Situation', 'Data', 'Purpose and legal basis'],
              rows: [
                ['Order', 'Name, email, mobile number, address, NIF (optional) and items', 'Processing, invoicing and shipping the order. Performance of the contract and tax obligations.'],
                ['Newsletter', 'Email and subscription date', 'Sending news and the welcome code, and checking the code is only used once. Consent.'],
                ['Contact', 'Name, email and message', 'Replying to your request. Steps taken at your request.'],
                ['Back-in-stock alert', 'Email, product and size', 'Letting you know once when the piece is back in stock. Steps taken at your request.'],
                ['Gift card', 'Name of the giver, name and email of the recipient (optional) and message', 'Sending the card and keeping track of the balance. Performance of the contract.'],
                ['Statistics', 'Pages viewed, pieces viewed and added to cart, device type, approximate city', 'Understanding how the site is used and improving it. Consent, given in the cookie notice.'],
                ['Advertising', 'Browser identifier, pages and pieces viewed, checkouts started', 'Measuring Mekie ads and showing them to people who have already visited the site. Consent, given in the cookie notice.'],
              ],
            },
          },
          'We do not make automated decisions about you. Statistics and advertising only work if you accept them in the cookie notice, and you can change your mind at any time in Cookie settings, at the bottom of every page.',
          'Regardless of cookies, we count visits to the site anonymously: which pages are viewed, which site or campaign people come from, the type of device (mobile or computer), the checkout steps, and whether the person accepted, refused or did not answer the cookie notice. We do not use cookies or store the IP address or any identifier: each visit just adds one to daily totals, which cannot be used to identify anyone.',
        ],
      },
      {
        heading: 'Who we share it with',
        body: [
          'Only with those we need for the store to work, and only the data they need:',
          {
            list: [
              'CTT, to deliver your order.',
              'The payment provider (Stripe), to process your payment securely.',
              'Vercel, which hosts the site, and Neon, which holds the database of orders, customers and newsletter (servers in the European Union).',
              'Resend, which sends the store emails (order confirmation, shipping, gift cards and alerts).',
              'Google, if you accept, for statistics (Google Analytics).',
              'Meta (Facebook and Instagram), if you accept advertising cookies (Meta Pixel).',
              'Our accountant, for invoicing.',
            ],
          },
          'Some of these services may process data outside the European Union. In those cases, the transfer is protected by the EU-U.S. Data Privacy Framework or by standard contractual clauses approved by the European Commission.',
          'Google and Meta also process statistics and advertising data for their own purposes, under their own privacy policies. Details of each cookie are in the Cookie Policy.',
        ],
      },
      {
        heading: 'How long we keep it',
        body: [
          {
            list: [
              'Order and invoice data: 10 years, as required by tax law.',
              'Newsletter: until you unsubscribe. Every email has a link to do so.',
              'Contact messages: up to 2 years after the last contact.',
              'Back-in-stock alerts: deleted after the alert is sent or after 1 year.',
              'Gift cards: until the card expires, and after that for as long as needed for invoicing.',
              'Statistics (Google Analytics): 14 months.',
              'Your choice in the cookie notice: 6 months, then we ask again.',
            ],
          },
        ],
      },
      {
        heading: 'Your rights',
        body: [
          `You can ask for access to, correction, erasure, restriction or portability of your data, object to its processing and withdraw your consent at any time. Just write to ${email}. We reply within one month at most.`,
          'You can also lodge a complaint with the Comissão Nacional de Proteção de Dados (the Portuguese data protection authority, www.cnpd.pt).',
        ],
      },
      {
        heading: 'Security and minors',
        body: [
          'The site uses a secure connection (HTTPS) and only those who need it have access to the data. The newsletter is intended for people aged 16 and over.',
          `Last updated: ${legalUpdatedEn}.`,
        ],
      },
    ],
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    summary: 'Which cookies the Mekie site uses, what for, for how long and how you accept, refuse or change your mind.',
    sections: [
      {
        heading: 'What cookies are',
        body: [
          'Cookies are small files a site stores in your browser. There is also local storage (localStorage), which works in a similar way. This policy covers both.',
        ],
      },
      {
        heading: 'How you choose',
        body: [
          'On your first visit we show a notice where you can accept, refuse or choose by type. Statistics and advertising cookies are only switched on if you accept. If you refuse, the site works just the same.',
          'You can change your choice at any time in Cookie settings, at the bottom of every page. We keep your choice for 6 months and then ask again.',
          'To know how many people visit the site, we also run an anonymous count that uses no cookies and stores nothing in your browser: we just add the visit to daily totals, with no IP address or identifiers (see the Privacy Policy).',
        ],
      },
      {
        heading: 'Necessary',
        body: [
          'These make the store work and remember your choices. They do not need consent and are not shared with anyone.',
          {
            table: {
              head: ['Name', 'Purpose', 'Duration'],
              rows: [
                ['mekie-cart-v1', 'Keep your cart', 'Until you empty your cart'],
                ['mekie-consent', 'Keep your cookie choice', '6 months'],
                ['mekie-code-applied', 'Remember the discount code you applied', 'Until you remove it'],
                ['mekie-newsletter, mekie-newsletter-outcome, mekie-newsletter-emails', 'Know you have already subscribed to the newsletter, so the pop-up is not shown again', 'Until you clear your browser data'],
                ['mekie-popup-closed', 'Not show the pop-up again for 7 days after you close it', '7 days'],
                ['mekie-grid', 'Remember whether you prefer to see the store in 2 or 4 columns', 'Until you clear your browser data'],
              ],
            },
          },
        ],
      },
      {
        heading: 'Statistics (only with your consent)',
        body: [
          'We use Google Analytics, by Google, to know how many people visit the site, which pages and pieces they view and where they come from. The IP address is not stored.',
          {
            table: {
              head: ['Name', 'From', 'Purpose', 'Duration'],
              rows: [
                ['_ga', 'Google', 'Tell visitors apart', '2 years'],
                [`_ga_${analytics.ga4.replace(/^G-/, '') || 'ID'}`, 'Google', 'Keep the state of the visit', '2 years'],
                ['mekie-utm', 'Mekie (in your browser)', 'Know which post, ad or partnership you came from, to add it to the order', '30 days'],
              ],
            },
          },
        ],
      },
      {
        heading: 'Advertising (only with your consent)',
        body: [
          'We use the Meta Pixel, by Meta (Facebook and Instagram), to measure the results of our ads and show them to people who have already visited the store. If you accept, Google may also use statistics data to measure ads.',
          {
            table: {
              head: ['Name', 'From', 'Purpose', 'Duration'],
              rows: [
                ['_fbp', 'Meta', 'Identify the browser to measure and show ads', '3 months'],
                ['_fbc', 'Meta', 'Keep the ad you clicked to reach the site', '3 months'],
              ],
            },
          },
          'Google and Meta may process this data outside the European Union, under the EU-U.S. Data Privacy Framework. More information at policies.google.com/privacy and facebook.com/privacy/policy.',
        ],
      },
      {
        heading: 'Payments',
        body: [
          'When you pay by card, MB WAY or Multibanco, payment takes place on a secure page of the payment provider (Stripe), which may use its own cookies to prevent fraud. Those cookies are Stripe\'s responsibility and are described in its cookie policy.',
        ],
      },
      {
        heading: 'How to delete them',
        body: [
          'As well as Cookie settings, you can delete cookies and site data in your browser settings, under Privacy or Browsing data. If you do, your cart will be emptied and we will ask for your choice again.',
          `Last updated: ${legalUpdatedEn}.`,
        ],
      },
    ],
  },
  {
    slug: 'dispute-resolution',
    title: 'Dispute Resolution',
    summary: 'Alternative consumer dispute resolution bodies and the Livro de Reclamações Eletrónico.',
    sections: [
      {
        body: [
          `If you have a problem with a purchase, please contact us first by email at ${email}. We always try to sort things out directly.`,
          'If we cannot reach an agreement, you can turn to an alternative consumer dispute resolution body, under Law No. 144/2015:',
          {
            list: [
              'CNIACC, Centro Nacional de Informação e Arbitragem de Conflitos de Consumo (National Centre for Consumer Dispute Information and Arbitration, www.cniacc.pt).',
              'Centro de Arbitragem de Conflitos de Consumo de Lisboa (www.centroarbitragemlisboa.pt).',
            ],
          },
          'More information on the Portal do Consumidor (www.consumidor.gov.pt). You can also file a complaint in the Livro de Reclamações Eletrónico (the official Portuguese online complaints book, www.livroreclamacoes.pt).',
        ],
      },
    ],
  },
];
