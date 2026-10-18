/* Ficheiro de produtos para o Google Merchant Center (Shopping e resultados grátis do Google).
   Uma linha por tamanho, agrupadas por produto. Gerado em cada deploy, com o stock e os preços do CRM. */
import type { APIRoute } from 'astro';
import { products, categories, totalStock, fullName, weightOf, type Product } from '../../data/products';
import { packagingGrams } from '../../data/shipping';
import { productSummary } from '../../data/seo';
import { site } from '../../data/site';

const abs = (path: string) => new URL(path, site.url).href;
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);
const price = (v: number) => `${v.toFixed(2)} EUR`;
const trail = (p: Product) => {
  const c = categories.find((x) => x.slug === p.category);
  const parent = c?.parent ? categories.find((x) => x.slug === c.parent) : undefined;
  return [parent?.name, c?.name].filter(Boolean).join(' > ');
};

function item(p: Product, size?: string) {
  const stock = size && p.sizeStock ? p.sizeStock[size] ?? 0 : totalStock(p);
  const available = p.madeToOrderDays || p.customizable ? true : stock > 0;
  const onSale = p.regularPrice > p.price;
  const id = size ? `${p.id}-${size}` : String(p.id);
  const [image, ...more] = p.images;
  return `
  <item>
    <g:id>${esc(id)}</g:id>
    <g:item_group_id>${p.id}</g:item_group_id>
    <g:title>${esc(`${fullName(p)}${size ? ` (${size})` : ''}`)}</g:title>
    <g:description>${esc(productSummary(p))}</g:description>
    <g:link>${esc(abs(`/produto/${p.slug}/`))}</g:link>
    <g:image_link>${esc(abs(image))}</g:image_link>
    ${more.slice(0, 10).map((src) => `<g:additional_image_link>${esc(abs(src))}</g:additional_image_link>`).join('\n    ')}
    <g:availability>${available ? 'in_stock' : 'out_of_stock'}</g:availability>
    <g:price>${price(onSale ? p.regularPrice : p.price)}</g:price>
    ${onSale ? `<g:sale_price>${price(p.price)}</g:sale_price>` : ''}
    <g:brand>${esc(site.name)}</g:brand>
    <g:condition>new</g:condition>
    <g:identifier_exists>no</g:identifier_exists>
    <g:product_type>${esc(trail(p))}</g:product_type>
    ${p.customizable ? '' : `<g:color>${esc(p.color)}</g:color>`}
    ${size ? `<g:size>${esc(size)}</g:size>` : ''}
    <g:gender>unisex</g:gender>
    <g:age_group>adult</g:age_group>
    <g:shipping_weight>${weightOf(p) + packagingGrams} g</g:shipping_weight>
  </item>`;
}

export const GET: APIRoute = () => {
  const items = products.flatMap((p) => (p.sizes?.length ? p.sizes.map((s) => item(p, s)) : [item(p)])).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${esc(site.name)}</title>
  <link>${esc(site.url)}</link>
  <description>Produtos da loja ${esc(site.name)}</description>${items}
</channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
