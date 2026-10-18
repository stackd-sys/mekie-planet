/* FAQ in English. Same groups and questions as src/data/faq.ts; values come from the same data. */
import type { FaqGroup } from '../faq';
import { site } from '../site';
import { shipping } from '../shipping';
import { giftCard } from '../giftcard';
import { products } from '../products';

const pt = shipping.pt;
const eu = shipping.eu;
const custom = products.find((p) => p.customizable);

/** €5.90 style */
const price = (value: number) => `€${value.toFixed(2)}`;
/** €65 for whole amounts, €5.90 otherwise */
const amount = (value: number) => (Number.isInteger(value) ? `€${value}` : price(value));
/** Delivery time from the numbers in the zone data: [7] → "7 working days", [10, 15] → "10 to 15 working days" */
const workingDays = (days: string) => {
  const n = (days.match(/\d+/g) ?? []).map(Number);
  return n.length > 1 ? `${n[0]} to ${n[n.length - 1]} working days` : `${n[0]} working day${n[0] === 1 ? '' : 's'}`;
};
const validity = (() => {
  const m = giftCard.validityMonths;
  if (m % 12) return `${m} month${m === 1 ? '' : 's'}`;
  return m === 12 ? '1 year' : `${m / 12} years`;
})();
const giftValues = giftCard.values.map(amount).join(', ').replace(/, ([^,]+)$/, ' or $1');

export const faqGroupsEn: FaqGroup[] = [
  {
    title: 'Shipping',
    items: [
      {
        q: 'How long will my order take to arrive?',
        a: `In mainland Portugal, the Azores and Madeira, up to ${workingDays(pt.days)} after your payment is confirmed. To the rest of the European Union, ${workingDays(eu.days)}. When your order ships, you'll get an email with the CTT tracking number.`,
      },
      {
        q: 'How much is shipping?',
        a: `In Portugal, shipping costs ${price(pt.bands[0].price)} for orders up to ${pt.bands[0].upTo} g (one t-shirt or accessories) and ${price(pt.bands[1].price)} above that, and it's free on orders from ${amount(pt.freeFrom ?? 0)}. To the European Union it starts at ${price(eu.bands[0].price)} and depends on weight. You'll see the exact amount at checkout once you pick your country. Check out the <a href="/en/shipping-policy/">full rates table</a>.`,
      },
      {
        q: 'Do you ship to the Azores and Madeira?',
        a: 'Yes, and you pay the same as on the mainland, with free shipping on the same terms.',
      },
      {
        q: 'Do you ship outside Portugal?',
        a: `We ship to every country in the European Union. For anywhere else, <a href="/en/contact/">get in touch</a> before you order and we'll sort out shipping with you.`,
      },
    ],
  },
  {
    title: 'Sizes and pieces',
    items: [
      {
        q: 'How do I know my size?',
        a: 'Our hoodies and t-shirts are unisex with a loose fit. For the oversized look, go with your usual size; for a closer fit, go one size down. If you\'re between two sizes, pick the bigger one. We explain it all in this <a href="/blog/como-escolher-o-tamanho-de-um-hoodie-oversized/">article about sizing</a> (in Portuguese), and if you\'re still not sure, <a href="/en/contact/">get in touch</a>.',
      },
      {
        q: 'The size I want is sold out. Will it be back?',
        a: 'On the product page, tap the sold-out size and leave your email. We\'ll let you know once, when it\'s back in stock.',
      },
      {
        q: 'How should I wash embroidered pieces?',
        a: 'Inside out, at up to 40 °C and no bleach. Don\'t tumble dry, and only iron on the reverse side. We put all our tips together <a href="/blog/como-lavar-roupa-bordada/">in this article</a> (in Portuguese).',
      },
      {
        q: 'How does the custom scrunchie work?',
        a: `You pick the main colour and the edge colour from the threads we have, and you see right away how it looks. We make it by hand, to order, and ship it in ${custom?.madeToOrderDays ?? 10} working days. Since it's made just for you, it can't be returned, but it's covered by the warranty if anything's wrong with it. <a href="/en/product/scrunchie-personalizado/">Make mine</a>.`,
      },
    ],
  },
  {
    title: 'Orders and payment',
    items: [
      {
        q: 'Which payment methods do you accept?',
        a: 'MB WAY, Multibanco and card. Prices include VAT.',
      },
      {
        q: `How do I use the ${site.welcomeDiscount}% newsletter code?`,
        a: `Sign up for the newsletter at the bottom of any page and you'll get the code ${site.welcomeCode}. Enter it at checkout using the same email you signed up with. It's worth ${site.welcomeDiscount}% off your first order, once per person, and can't be combined with other offers.`,
      },
      {
        q: 'Can I change or cancel an order?',
        a: `If it hasn't shipped yet, yes. Email us at <a href="mailto:${site.email}">${site.email}</a> with your order number as soon as you can.`,
      },
    ],
  },
  {
    title: 'Exchanges and returns',
    items: [
      {
        q: 'Can I swap for a different size?',
        a: 'Sure, within 14 days of receiving your order. Get in touch before sending anything so we can hold the new size for you. You pay to send the piece back to us, and we cover shipping on the new one.',
      },
      {
        q: 'How do I return something?',
        a: `You have 14 days to return it, no reason needed. Email <a href="mailto:${site.email}">${site.email}</a> with your order number and the pieces you're sending back. They need to be unworn and still have their tags. We refund the pieces and the original shipping cost. More details in our <a href="/en/returns-and-refunds-policy/">returns policy</a>.`,
      },
      {
        q: 'My piece arrived faulty. What now?',
        a: 'Sorry about that. Email us some photos and we\'ll sort it out at no cost to you. All our pieces come with the 3-year legal warranty.',
      },
    ],
  },
  {
    title: 'Gift card',
    items: [
      {
        q: 'How does the gift card work?',
        a: `You choose the amount (${giftValues}), write a message and, once payment goes through, we email the card with a unique code. Whoever gets it uses the code at checkout. <a href="/en/gift-card/">Give a gift card</a>.`,
      },
      {
        q: 'Does the gift card expire?',
        a: `Yes, ${validity} from the date of purchase. It can be used across several orders until the balance runs out.`,
      },
    ],
  },
];
