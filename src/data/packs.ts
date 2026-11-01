/* Packs da Black November vistos da loja: preço normal das duas peças e poupança.
   (Separado de promo.ts porque precisa da lista de produtos.) */
import { products } from './products';
import { promo, kindOf, type Kind, type Pack } from './promo';

/** preço normal (antes da promoção) da peça mais barata de cada tipo */
export const cheapestRegular = (k: Kind) => Math.min(...products.filter((p) => kindOf(p) === k).map((p) => p.regularPrice));

export const packInfo = (p: Pack) => {
  const [a, b] = [p.parts[0][0], p.parts[1][0]];
  const normal = cheapestRegular(a) + cheapestRegular(b);
  return { ...p, a, b, normal, pct: Math.round((1 - p.price / normal) * 100) };
};

export const packs = () => promo.packs.map(packInfo);
