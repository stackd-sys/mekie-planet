/* Landing de teste (arara de verão): as peças vêm dos dados reais da loja, com preço, stock e fotografias atuais. */
import sharp from 'sharp';
import { products, variantsOf, cartInfo, totalStock, isSoldOut, type Product } from '../../data/products';

/* onde começa a peça dentro da fotografia (as fotos têm margem transparente): para a pendurar no cabide certo */
async function topOf(src: string) {
  try {
    const { data, info } = await sharp(`${process.cwd()}/public${src}`).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x += 2) if (data[y * info.width + x] > 40) return y / info.height;
    }
  } catch {}
  return 0.08;
}

/* 8 peças de verão, pela ordem em que aparecem na arara */
const SLUGS = [
  'tshirt-khaki-cogumelos',
  'mala-crochet-s-verde',
  'bucket-hat-mekie',
  'tshirt-black-cogumelos',
  'scrunchie-rosa',
  'cap-mekie-dark-olive',
  'mala-crochet-m-rosa',
  'tote-bag-cogumelos-bege',
];
/* se alguma estiver esgotada, entra a seguinte desta lista (fica sempre com 8 peças) */
const EXTRA = ['tote-bag-planetas-preta', 'cap-mekie-blue-navy', 'meias-mekie', 'scrunchie-dourado'];

/* tipo de cabide: as t-shirts vestem o cabide, o resto fica preso por molas ou pendurado no gancho */
export type HangerKind = 'shirt' | 'clips' | 'hook';
const hangerOf = (p: Product): HangerKind =>
  p.category === 't-shirts' ? 'shirt' : ['malas', 'tote-bag', 'scrunchies'].includes(p.category) ? 'hook' : 'clips';

const sentence = (s: string) => (/[.!?]$/.test(s) ? s : `${s}.`);

const list = [...SLUGS, ...EXTRA].map((slug) => products.find((p) => p.slug === slug))
  .filter((p): p is Product => !!p && !isSoldOut(p))
  .slice(0, 8)
  .map((p) => {
    const sizes = p.sizes?.map((s) => ({ size: s, ok: !p.sizeStock || p.sizeStock[s] > 0 })) ?? [];
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      color: p.color,
      price: p.price,
      regular: p.regularPrice,
      image: p.images[0],
      hanger: hangerOf(p),
      text: [p.description, ...(p.details?.features ?? [])].filter(Boolean).map(sentence).join(' '),
      composition: p.details?.composition ?? [],
      sizes,
      others: variantsOf(p).filter((o) => o.id !== p.id && !isSoldOut(o)).map((o) => o.color),
      stock: totalStock(p),
      cart: { ...cartInfo(p), href: `/produto/${p.slug}/` },
    };
  });

export const pieces = await Promise.all(list.map(async (p) => ({ ...p, top: await topOf(p.image) })));

export type Piece = (typeof pieces)[number];
