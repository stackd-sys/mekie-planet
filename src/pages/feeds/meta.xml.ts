/* Catálogo para a Meta (Facebook e Instagram): anúncios de catálogo e loja do Instagram.
   Uma linha por produto (cor), com o mesmo número que o Pixel envia (content_ids), para a Meta saber
   que peça cada pessoa viu. Fotografias em JPG (public/images/meta/, geradas por scripts/meta-images.mjs).
   Durante a promoção entram também os packs, com o preço do pack.
   Gerado em cada deploy, com o stock e os preços do CRM. */
import type { APIRoute } from 'astro';
import { products, categories, collections, totalStock, isSoldOut, fullName, type Product } from '../../data/products';
import { promo, promoActive, kindOf } from '../../data/promo';
import { packs } from '../../data/packs';
import { productSummary } from '../../data/seo';
import { site } from '../../data/site';

const abs = (p: string) => new URL(p, site.url).href;
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);
const price = (v: number) => `${v.toFixed(2)} EUR`;
/* /images/products/x.webp → /images/meta/products/x.jpg */
const jpg = (src: string) => src.replace(/^\/images\/(products|lookbook)\/(.+)\.webp$/, '/images/meta/$1/$2.jpg');
const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* categoria do Google, que a Meta também usa para perceber o que é cada peça */
const googleCategory: Record<string, string> = {
  'hoodies-crewnecks': 'Apparel & Accessories > Clothing > Shirts & Tops',
  't-shirts': 'Apparel & Accessories > Clothing > Shirts & Tops',
  caps: 'Apparel & Accessories > Clothing Accessories > Hats',
  'bucket-hat': 'Apparel & Accessories > Clothing Accessories > Hats',
  meias: 'Apparel & Accessories > Clothing > Underwear & Socks > Socks',
  scrunchies: 'Apparel & Accessories > Clothing Accessories > Hair Accessories',
  'tote-bag': 'Apparel & Accessories > Handbags, Wallets & Cases > Handbags',
  malas: 'Apparel & Accessories > Handbags, Wallets & Cases > Handbags',
};
const trail = (p: Product) => {
  const c = categories.find((x) => x.slug === p.category);
  const parent = c?.parent ? categories.find((x) => x.slug === c.parent) : undefined;
  return [parent?.name, c?.name].filter(Boolean).join(' > ');
};
const description = (p: Product) =>
  [productSummary(p), ...(p.details?.features.slice(1) ?? []).map((x) => (/[.!?]$/.test(x) ? x : `${x}.`))].join(' ').slice(0, 4900);

function productItem(p: Product) {
  const on = promoActive();
  const onSale = p.regularPrice > p.price;
  const volume = on && promo.volume.some((v) => v.kind === kindOf(p));
  const stock = totalStock(p);
  const available = !isSoldOut(p) && (p.madeToOrderDays || p.customizable || stock === undefined || stock > 0);
  const [image, ...more] = p.images;
  const sizes = p.sizes?.filter((s) => !p.sizeStock || p.sizeStock[s] > 0) ?? [];
  const collection = collections.find((c) => c.slug === p.collection)?.name;
  const labels = [
    categories.find((c) => c.slug === p.category)?.name,
    on && (onSale || volume) ? 'Black November' : '',
    collection ?? '',
    !p.madeToOrderDays && stock !== undefined && stock > 0 && stock <= 3 ? 'Últimas unidades' : '',
    volume ? 'Leva 4, paga 3' : '',
  ];
  return `
  <item>
    <g:id>${p.id}</g:id>
    <g:item_group_id>${esc(slugify(p.name))}</g:item_group_id>
    <g:title>${esc(fullName(p))}</g:title>
    <g:description>${esc(description(p))}</g:description>
    <g:link>${esc(abs(`/produto/${p.slug}/`))}</g:link>
    <g:image_link>${esc(abs(jpg(image)))}</g:image_link>
    ${more.slice(0, 9).map((src) => `<g:additional_image_link>${esc(abs(jpg(src)))}</g:additional_image_link>`).join('\n    ')}
    <g:availability>${available ? 'in stock' : 'out of stock'}</g:availability>
    <g:condition>new</g:condition>
    <g:price>${price(onSale ? p.regularPrice : p.price)}</g:price>
    ${onSale ? `<g:sale_price>${price(p.price)}</g:sale_price>` : ''}
    ${onSale && on ? `<g:sale_price_effective_date>${promo.start}/${promo.end}</g:sale_price_effective_date>` : ''}
    <g:brand>${esc(site.name)}</g:brand>
    ${googleCategory[p.category] ? `<g:google_product_category>${esc(googleCategory[p.category])}</g:google_product_category>` : ''}
    <g:product_type>${esc(trail(p))}</g:product_type>
    ${p.customizable ? '' : `<g:color>${esc(p.color)}</g:color>`}
    ${sizes.length ? `<g:size>${esc(sizes.join(', '))}</g:size>` : ''}
    ${p.details?.composition.length ? `<g:material>${esc(p.details.composition[0])}</g:material>` : ''}
    <g:gender>unisex</g:gender>
    <g:age_group>adult</g:age_group>
    ${labels.map((l, i) => (l ? `<g:custom_label_${i}>${esc(l)}</g:custom_label_${i}>` : '')).join('\n    ')}
  </item>`;
}

/* packs da promoção: duas peças por um preço, com a página do pack */
function packItem(p: ReturnType<typeof packs>[number]) {
  const name = { 'hoodie-tshirt': 'Pack Hoodie + T-shirt', 'crewneck-tshirt': 'Pack Crewneck + T-shirt', 'hoodie-cap': 'Pack Hoodie + Cap', 'tshirt-cap': 'Pack T-shirt + Cap' }[p.id] ?? `Pack ${p.id}`;
  return `
  <item>
    <g:id>pack-${esc(p.id)}</g:id>
    <g:title>${esc(`${name} · Black November`)}</g:title>
    <g:description>${esc(`Escolhe as duas peças, com o modelo, a cor e o tamanho que quiseres, e levas as duas por ${p.price}€ em vez de ${p.normal}€. Envio grátis em Portugal. Só até 30 de novembro.`)}</g:description>
    <g:link>${esc(abs(`/pack/${p.id}/`))}</g:link>
    <g:image_link>${esc(abs(`/images/meta/packs/${p.id}.jpg`))}</g:image_link>
    <g:availability>in stock</g:availability>
    <g:condition>new</g:condition>
    <g:price>${price(p.normal)}</g:price>
    <g:sale_price>${price(p.price)}</g:sale_price>
    <g:sale_price_effective_date>${promo.start}/${promo.end}</g:sale_price_effective_date>
    <g:brand>${esc(site.name)}</g:brand>
    <g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>
    <g:product_type>Packs</g:product_type>
    <g:gender>unisex</g:gender>
    <g:age_group>adult</g:age_group>
    <g:custom_label_0>Packs</g:custom_label_0>
    <g:custom_label_1>Black November</g:custom_label_1>
  </item>`;
}

export const GET: APIRoute = () => {
  const items = [...products.map(productItem), ...(promoActive() ? packs().map(packItem) : [])].join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${esc(site.name)}</title>
  <link>${esc(site.url)}</link>
  <description>Catálogo ${esc(site.name)} para a Meta</description>${items}
</channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
