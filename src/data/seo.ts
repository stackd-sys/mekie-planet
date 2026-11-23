/* Dados estruturados (schema.org) para o Google: produtos, envios, devoluções e navegação */
import { promo, promoActive } from './promo';
import { site } from './site';
import { shippingCost, type Zone } from './shipping';
import { reviewsOf, ratingOf } from './reviews';
import { getCategory, totalStock, isSoldOut, fullName, weightOf, type Product } from './products';
import { href, type Lang } from '../i18n';
import { trCategory } from '../i18n/catalog';
import { useT } from '../i18n/ui';

const abs = (path: string) => new URL(path, site.url).href;

export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  '@id': abs('/#org'),
  name: site.name,
  alternateName: site.shortName,
  url: site.url,
  logo: { '@type': 'ImageObject', url: abs('/images/site/logo.png'), width: 800, height: 267 },
  image: abs('/images/site/hero.webp'),
  description: 'Marca portuguesa de roupa e acessórios com um mood descontraído: hoodies, crewnecks e t-shirts bordados, caps, bucket hats, meias, tote bags e scrunchies e malas de crochet feitos à mão. Loja online com envio para Portugal e para a União Europeia.',
  email: site.email,
  slogan: site.tagline,
  foundingDate: '2024-11-03',
  founder: [
    { '@type': 'Person', name: 'Rita Silva' },
    { '@type': 'Person', name: 'Rafael Marques' },
  ],
  address: { '@type': 'PostalAddress', addressLocality: 'Ericeira', postalCode: '2655-420', addressCountry: 'PT' },
  contactPoint: {
    '@type': 'ContactPoint', contactType: 'customer service', email: site.email,
    availableLanguage: ['Portuguese', 'English', 'Spanish'], areaServed: ['PT', 'EU'],
  },
  knowsAbout: ['roupa bordada', 'streetwear', 'hoodies', 't-shirts oversized', 'crochet feito à mão', 'malas de crochet', 'scrunchies'],
  sameAs: [site.instagram],
  areaServed: ['PT', 'EU'],
  currenciesAccepted: 'EUR',
  paymentAccepted: 'MB WAY, Multibanco, Visa, Mastercard, Apple Pay, Google Pay',
  get hasMerchantReturnPolicy() {
    return returnPolicyLd;
  },
};

export const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': abs('/#website'),
  name: site.name,
  url: site.url,
  inLanguage: ['pt-PT', 'en', 'es'],
  description: 'Loja online da Mekie Planet: roupa bordada e acessórios feitos à mão, com envio para Portugal e para a União Europeia.',
  publisher: { '@id': abs('/#org') },
};

/** Página de categoria: a lista das peças (para o Google e para os assistentes de IA perceberem o que há em cada uma) */
export const collectionLd = (name: string, description: string, path: string, items: Product[], lang: Lang = 'pt') => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name,
  description,
  url: abs(path),
  inLanguage: lang === 'pt' ? 'pt-PT' : lang,
  isPartOf: { '@id': abs('/#website') },
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      '@type': 'ListItem', position: i + 1, url: abs(href(lang, `/produto/${p.slug}/`)), name: fullName(p),
    })),
  },
});

/** Perguntas e respostas (página de perguntas frequentes e categorias) */
export const faqPageLd = (items: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((x) => ({
    '@type': 'Question', name: x.q,
    acceptedAnswer: { '@type': 'Answer', text: x.a.replace(/<[^>]+>/g, '') },
  })),
});

export const returnPolicyLd = {
  '@type': 'MerchantReturnPolicy',
  '@id': abs('/#returns'),
  applicableCountry: 'PT',
  returnPolicyCountry: 'PT',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 14,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
  merchantReturnLink: abs('/politica-de-devolucoes-e-reembolsos/'),
};

const euCountries = ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'RO', 'SE', 'SI', 'SK'];
const transit: Record<Zone, [number, number]> = { pt: [2, 4], eu: [6, 12] };

const shippingLd = (zone: Zone, price: number) => ({
  '@type': 'OfferShippingDetails',
  shippingRate: { '@type': 'MonetaryAmount', value: price.toFixed(2), currency: 'EUR' },
  shippingDestination: zone === 'pt'
    ? { '@type': 'DefinedRegion', addressCountry: 'PT' }
    : euCountries.map((c) => ({ '@type': 'DefinedRegion', addressCountry: c })),
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: transit[zone][0], maxValue: transit[zone][1], unitCode: 'DAY' },
  },
});

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
});

/** Caminho de navegação de uma categoria: Início > Loja > [Mãe] > Categoria (caminhos já na língua) */
export const categoryTrail = (slug: string, lang: Lang = 'pt') => {
  const t = useT(lang);
  const h = (p: string) => href(lang, p);
  const trail = [{ name: t('home'), path: h('/') }, { name: t('shop'), path: h('/loja/') }];
  const found = getCategory(slug);
  if (!found) return trail;
  const cat = trCategory(found, lang);
  const parentPt = cat.parent && getCategory(cat.parent);
  const parent = parentPt && trCategory(parentPt, lang);
  if (parent) trail.push({ name: parent.name, path: h(`/loja/${parent.slug}/`) });
  trail.push({ name: cat.name, path: h(`/loja/${cat.slug}/`) });
  return trail;
};

const sentence = (x: string) => (/[.!?]$/.test(x.trim()) ? x.trim() : `${x.trim()}.`);

/** Texto do produto para a meta description e para o Google */
export const productSummary = (p: Product) => {
  const feature = p.details?.features[0];
  return [`${fullName(p)}.`, feature && `${feature}.`, p.description].filter(Boolean).join(' ');
};

const reviewsLd = (p: Product) => {
  const rating = ratingOf(p);
  if (!rating) return {};
  return {
    aggregateRating: { '@type': 'AggregateRating', ratingValue: rating.value, reviewCount: rating.count, bestRating: 5, worstRating: 1 },
    review: reviewsOf(p).map((rv) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: rv.author },
      reviewRating: { '@type': 'Rating', ratingValue: rv.rating, bestRating: 5, worstRating: 1 },
      reviewBody: rv.text,
    })),
  };
};

/** Produto já na língua da página (os textos vêm de p) */
export const productLd = (p: Product, lang: Lang = 'pt') => {
  const total = totalStock(p);
  const cat = getCategory(p.category);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: fullName(p),
    sku: String(p.id),
    url: abs(href(lang, `/produto/${p.slug}/`)),
    image: p.images.map(abs),
    /* cada pormenor numa frase própria, com ponto final */
    description: [productSummary(p), ...(p.details?.features.slice(1) ?? []).map(sentence)].join(' '),
    color: p.color,
    category: cat && trCategory(cat, lang).name,
    ...(p.details?.composition.length ? { material: p.details.composition.join(', ') } : {}),
    ...(p.sizes ? { size: p.sizes.join(', ') } : {}),
    brand: { '@type': 'Brand', name: site.name },
    ...reviewsLd(p),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: p.price.toFixed(2),
      /* em promoção: preço antigo riscado e data de fim, para o Google mostrar o desconto */
      ...(p.price < p.regularPrice && promoActive()
        ? {
          priceValidUntil: new Date(new Date(promo.end).getTime() - 86400000).toISOString().slice(0, 10),
          priceSpecification: [
            { '@type': 'UnitPriceSpecification', price: p.price.toFixed(2), priceCurrency: 'EUR' },
            { '@type': 'UnitPriceSpecification', priceType: 'https://schema.org/StrikethroughPrice', price: p.regularPrice.toFixed(2), priceCurrency: 'EUR' },
          ],
        }
        : {}),
      availability: isSoldOut(p)
        ? 'https://schema.org/OutOfStock'
        : p.madeToOrderDays && !total
          ? 'https://schema.org/MadeToOrder'
          : total !== undefined && total <= 3
            ? 'https://schema.org/LimitedAvailability'
            : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: abs(href(lang, `/produto/${p.slug}/`)),
      seller: { '@id': abs('/#org') },
      shippingDetails: (['pt', 'eu'] as Zone[]).map((z) => shippingLd(z, shippingCost(z, p.price, weightOf(p)))),
      hasMerchantReturnPolicy: returnPolicyLd,
    },
  };
};
