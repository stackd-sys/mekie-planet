/* Dados estruturados (schema.org) para o Google: produtos, envios, devoluções e navegação */
import { site } from './site';
import { shippingCost, type Zone } from './shipping';
import { getCategory, totalStock, isSoldOut, fullName, weightOf, type Product } from './products';

const abs = (path: string) => new URL(path, site.url).href;

export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  '@id': abs('/#org'),
  name: site.name,
  alternateName: site.shortName,
  url: site.url,
  logo: abs('/images/site/logo.png'),
  image: abs('/images/site/hero.webp'),
  email: site.email,
  slogan: site.tagline,
  sameAs: [site.instagram],
  areaServed: ['PT', 'EU'],
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
  inLanguage: 'pt-PT',
  publisher: { '@id': abs('/#org') },
};

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

/** Caminho de navegação de uma categoria: Início > Loja > [Mãe] > Categoria */
export const categoryTrail = (slug: string) => {
  const trail = [{ name: 'Início', path: '/' }, { name: 'Loja', path: '/loja/' }];
  const cat = getCategory(slug);
  if (!cat) return trail;
  const parent = cat.parent && getCategory(cat.parent);
  if (parent) trail.push({ name: parent.name, path: `/loja/${parent.slug}/` });
  trail.push({ name: cat.name, path: `/loja/${cat.slug}/` });
  return trail;
};

/** Texto do produto para a meta description e para o Google */
export const productSummary = (p: Product) => {
  const feature = p.details?.features[0];
  return [`${fullName(p)}.`, feature && `${feature}.`, p.description].filter(Boolean).join(' ');
};

export const productLd = (p: Product) => {
  const total = totalStock(p);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: fullName(p),
    sku: String(p.id),
    url: abs(`/produto/${p.slug}/`),
    image: p.images.map(abs),
    description: [productSummary(p), ...(p.details?.features.slice(1) ?? [])].join(' '),
    color: p.color,
    category: getCategory(p.category)?.name,
    ...(p.details?.composition.length ? { material: p.details.composition.join(', ') } : {}),
    ...(p.sizes ? { size: p.sizes.join(', ') } : {}),
    brand: { '@type': 'Brand', name: site.name },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: p.price.toFixed(2),
      availability: isSoldOut(p)
        ? 'https://schema.org/OutOfStock'
        : p.madeToOrderDays && !total
          ? 'https://schema.org/MadeToOrder'
          : total !== undefined && total <= 3
            ? 'https://schema.org/LimitedAvailability'
            : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: abs(`/produto/${p.slug}/`),
      seller: { '@id': abs('/#org') },
      shippingDetails: (['pt', 'eu'] as Zone[]).map((z) => shippingLd(z, shippingCost(z, p.price, weightOf(p)))),
      hasMerchantReturnPolicy: returnPolicyLd,
    },
  };
};
