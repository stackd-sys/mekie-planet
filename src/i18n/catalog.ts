/* Tradução dos dados da loja (nomes, cores, categorias, detalhes). As chaves são o texto em português
   de src/data/products.ts: um texto novo que não esteja aqui aparece em português nas outras línguas. */
import type { Lang } from './index';
import type { Product, Category, Collection } from '../data/products';

type Tr = Record<string, [en: string, es: string]>;

const names: Tr = {
  'Hoodie Cogumelos': ['Mushroom Hoodie', 'Hoodie Setas'],
  'Hoodie Esqueleto': ['Skeleton Hoodie', 'Hoodie Esqueleto'],
  'Crewneck Mekie': ['Mekie Crewneck', 'Crewneck Mekie'],
  'Crewneck Planetas': ['Planets Crewneck', 'Crewneck Planetas'],
  'T-shirt Cogumelos': ['Mushroom T-shirt', 'Camiseta Setas'],
  'Cap Mekie': ['Mekie Cap', 'Gorra Mekie'],
  'Bucket Hat Mekie': ['Mekie Bucket Hat', 'Bucket Hat Mekie'],
  'Meias Mekie': ['Mekie Socks', 'Calcetines Mekie'],
  'Meias Esqueleto': ['Skeleton Socks', 'Calcetines Esqueleto'],
  'Scrunchie Mekie': ['Mekie Scrunchie', 'Scrunchie Mekie'],
  'Scrunchie Personalizado': ['Custom Scrunchie', 'Scrunchie Personalizado'],
  'Tote Bag Planetas': ['Planets Tote Bag', 'Tote Bag Planetas'],
  'Tote Bag Cogumelos': ['Mushroom Tote Bag', 'Tote Bag Setas'],
  'Cartão Presente': ['Gift Card', 'Tarjeta Regalo'],
};

const colors: Tr = {
  'Amarelo pastel': ['Pastel yellow', 'Amarillo pastel'],
  Preto: ['Black', 'Negro'],
  Cru: ['Ecru', 'Crudo'],
  Bege: ['Beige', 'Beige'],
  Cinza: ['Grey', 'Gris'],
  'Azul navy': ['Navy blue', 'Azul marino'],
  'Verde azeitona': ['Olive green', 'Verde oliva'],
  Castanho: ['Brown', 'Marrón'],
  Branco: ['White', 'Blanco'],
  'Branco e preto': ['Black and white', 'Blanco y negro'],
  Rosa: ['Pink', 'Rosa'],
  Dourado: ['Gold', 'Dorado'],
  'Cores à tua escolha': ['Colours of your choice', 'Colores a tu elección'],
};

/* Textos dos detalhes, composição, cuidados, notas de tamanho e descrições */
const texts: Tr = {
  'Hoodie unissexo com capuz e bolso canguru': ['Unisex hoodie with hood and kangaroo pocket', 'Hoodie unisex con capucha y bolsillo canguro'],
  'Bordado de cogumelos no peito, com acabamento detalhado': ['Embroidered mushrooms on the chest, with a detailed finish', 'Setas bordadas en el pecho, con acabado detallado'],
  'Bordado de esqueleto no peito, com acabamento detalhado': ['Embroidered skeleton on the chest, with a detailed finish', 'Esqueleto bordado en el pecho, con acabado detallado'],
  'Pormenor bordado a vermelho no punho': ['Red embroidered detail on the cuff', 'Detalle bordado en rojo en el puño'],
  'Cordão de ajuste no capuz': ['Drawstring hood', 'Cordón ajustable en la capucha'],
  'Punhos e barra em canelado, para um ajuste confortável': ['Ribbed cuffs and hem for a comfy fit', 'Puños y bajo de canalé, para un ajuste cómodo'],
  '80% algodão, 20% poliéster': ['80% cotton, 20% polyester', '80% algodón, 20% poliéster'],
  'Lavar na máquina a 40 °C no máximo': ['Machine wash at 40 °C max', 'Lavar a máquina a 40 °C como máximo'],
  'Não utilizar lixívia': ['Do not bleach', 'No usar lejía'],
  'Não utilizar máquina de secar': ['Do not tumble dry', 'No usar secadora'],
  'Passar a ferro a 110 °C no máximo': ['Iron at 110 °C max', 'Planchar a 110 °C como máximo'],
  'Não limpar a seco': ['Do not dry clean', 'No limpiar en seco'],
  'Lavar do avesso protege o bordado e ajuda a preservar a peça': ['Washing it inside out protects the embroidery and keeps the piece looking good', 'Lavar del revés protege el bordado y ayuda a conservar la prenda'],
  'Esta unidade não foi fabricada em Portugal.': ['This unit was not made in Portugal.', 'Esta unidad no se fabricó en Portugal.'],
  'Logótipo Mekie bordado no peito e na manga': ['Mekie logo embroidered on the chest and sleeve', 'Logo Mekie bordado en el pecho y en la manga'],
  'Logótipo Mekie bordado a branco no peito e na manga': ['Mekie logo embroidered in white on the chest and sleeve', 'Logo Mekie bordado en blanco en el pecho y en la manga'],
  'Crewneck unissexo de gola redonda clássica': ['Unisex crewneck with a classic round neck', 'Crewneck unisex de cuello redondo clásico'],
  'Gola, punhos e bainha em canelado com costura dupla': ['Ribbed collar, cuffs and hem with double stitching', 'Cuello, puños y bajo de canalé con doble costura'],
  '100% algodão': ['100% cotton', '100% algodón'],
  'Planetas bordados no peito e logótipo Mekie bordado na manga': ['Embroidered planets on the chest and Mekie logo embroidered on the sleeve', 'Planetas bordados en el pecho y logo Mekie bordado en la manga'],
  'T-shirt oversized unissexo, de corte descontraído': ['Unisex oversized T-shirt with a relaxed fit', 'Camiseta oversize unisex, de corte holgado'],
  'Pormenor bordado na manga': ['Embroidered detail on the sleeve', 'Detalle bordado en la manga'],
  'Gola redonda reforçada': ['Reinforced round neck', 'Cuello redondo reforzado'],
  'Cap de bombazina unissexo, de 6 painéis': ['Unisex 6-panel corduroy cap', 'Gorra de pana unisex, de 6 paneles'],
  'Fita interior e acabamentos em sarja de algodão': ['Inner band and finishes in cotton twill', 'Cinta interior y acabados en sarga de algodón'],
  'Aba curva com tira ajustável em bombazina': ['Curved peak with adjustable corduroy strap', 'Visera curva con tira ajustable de pana'],
  '100% algodão (bombazina)': ['100% cotton (corduroy)', '100% algodón (pana)'],
  'Aba clássica e perfil alto': ['Classic brim and high crown', 'Ala clásica y copa alta'],
  'Tecido respirável': ['Breathable fabric', 'Tejido transpirable'],
  'Sarja 100% algodão orgânico': ['100% organic cotton twill', 'Sarga 100% algodón orgánico'],
  'Algodão orgânico com certificação GOTS': ['GOTS certified organic cotton', 'Algodón orgánico con certificación GOTS'],
  'Tecido com certificação OEKO-TEX Standard 100': ['OEKO-TEX Standard 100 certified fabric', 'Tejido con certificación OEKO-TEX Standard 100'],
  'Meias de cano médio (crew), unissexo': ['Unisex mid-calf (crew) socks', 'Calcetines de caña media (crew), unisex'],
  'Perna em canelado': ['Ribbed leg', 'Caña de canalé'],
  'Estampado por sublimação, com cores nítidas que não desbotam': ['Sublimation print with sharp colours that do not fade', 'Estampado por sublimación, con colores nítidos que no destiñen'],
  '60% nylon, 22% algodão, 18% elastano': ['60% nylon, 22% cotton, 18% elastane', '60% nailon, 22% algodón, 18% elastano'],
  'Lavar do avesso ajuda a preservar a estampa e as cores por mais tempo': ['Washing them inside out keeps the print and colours looking good for longer', 'Lavar del revés ayuda a conservar el estampado y los colores durante más tiempo'],
  'Feito à mão em crochet': ['Handmade in crochet', 'Hecho a mano en ganchillo'],
  '59% nylon, 41% poliéster': ['59% nylon, 41% polyester', '59% nailon, 41% poliéster'],
  '98% algodão, 2% fibra metalizada': ['98% cotton, 2% metallic fibre', '98% algodón, 2% fibra metalizada'],
  'Escolhe as tuas cores e nós fazemos o scrunchie à mão.': ['Pick your colours and we make the scrunchie by hand.', 'Elige tus colores y te hacemos el scrunchie a mano.'],
  'Feito à mão em crochet, por encomenda': ['Handmade in crochet, made to order', 'Hecho a mano en ganchillo, por encargo'],
  'Escolhes a cor do corpo e a cor do rebordo': ['You choose the main colour and the edging colour', 'Eliges el color del cuerpo y el color del borde'],
  'Fio 100% algodão orgânico': ['100% organic cotton yarn', 'Hilo 100% algodón orgánico'],
  'Fio com certificação GOTS': ['GOTS certified yarn', 'Hilo con certificación GOTS'],
  'Alças duplas com 2,5 cm de largura e 62,2 cm de comprimento': ['Double handles, 2.5 cm wide and 62.2 cm long', 'Asas dobles de 2,5 cm de ancho y 62,2 cm de largo'],
  'Dimensões: 40,6 × 35,6 × 12,7 cm': ['Size: 40.6 × 35.6 × 12.7 cm', 'Medidas: 40,6 × 35,6 × 12,7 cm'],
  'Aguenta até 13,6 kg': ['Holds up to 13.6 kg', 'Aguanta hasta 13,6 kg'],
  'Algodão orgânico com certificações GOTS e OCS': ['Organic cotton, GOTS and OCS certified', 'Algodón orgánico con certificaciones GOTS y OCS'],
  'Certificação OEKO-TEX Standard 100': ['OEKO-TEX Standard 100 certified', 'Certificación OEKO-TEX Standard 100'],
  'Selo vegano aprovado pela PETA': ['PETA-Approved Vegan', 'Sello vegano aprobado por PETA'],
};

const categoryTr: Record<string, Record<'en' | 'es', Pick<Category, 'name' | 'seoTitle' | 'intro'>>> = {
  'hoodies-crewnecks': {
    en: { name: 'Hoodies & Crewnecks', seoTitle: 'Embroidered hoodies and crewnecks', intro: 'Unisex hoodies and crewnecks with Mekie embroidery: mushrooms, skeleton, planets and the logo. From XS to XL.' },
    es: { name: 'Hoodies y Crewnecks', seoTitle: 'Hoodies y crewnecks bordadas', intro: 'Hoodies y crewnecks unisex con los bordados Mekie: setas, esqueleto, planetas y el logo. De la XS a la XL.' },
  },
  't-shirts': {
    en: { name: 'T-Shirts', seoTitle: 'Embroidered oversized T-shirts', intro: 'Unisex oversized T-shirts in 100% cotton, with the Mekie mushrooms embroidered on the chest and the logo on the sleeve.' },
    es: { name: 'Camisetas', seoTitle: 'Camisetas oversize bordadas', intro: 'Camisetas oversize unisex 100% algodón, con las setas Mekie bordadas en el pecho y el logo en la manga.' },
  },
  acessorios: {
    en: { name: 'Accessories', seoTitle: 'Accessories: caps, bucket hats, socks, scrunchies and tote bags', intro: 'Corduroy caps, an organic cotton bucket hat, socks, handmade crochet scrunchies and embroidered tote bags.' },
    es: { name: 'Accesorios', seoTitle: 'Accesorios: gorras, bucket hats, calcetines, scrunchies y tote bags', intro: 'Gorras de pana, bucket hat de algodón orgánico, calcetines, scrunchies de ganchillo hechos a mano y tote bags bordadas.' },
  },
  caps: {
    en: { name: 'Caps', seoTitle: 'Embroidered corduroy caps', intro: 'Corduroy caps with the Mekie logo embroidered. One size, adjustable.' },
    es: { name: 'Gorras', seoTitle: 'Gorras de pana bordadas', intro: 'Gorras de pana con el logo Mekie bordado. Talla única y ajustable.' },
  },
  'bucket-hat': {
    en: { name: 'Bucket Hat', seoTitle: 'Organic cotton bucket hat', intro: 'Mekie bucket hat in organic cotton twill, with the embroidered logo.' },
    es: { name: 'Bucket Hat', seoTitle: 'Bucket hat de algodón orgánico', intro: 'Bucket hat Mekie en sarga de algodón orgánico, con el logo bordado.' },
  },
  meias: {
    en: { name: 'Socks', seoTitle: 'Mekie socks', intro: 'Mid-calf socks with the Mekie logo and skeleton.' },
    es: { name: 'Calcetines', seoTitle: 'Calcetines Mekie', intro: 'Calcetines de caña media con el logo y el esqueleto Mekie.' },
  },
  scrunchies: {
    en: { name: 'Scrunchies', seoTitle: 'Handmade crochet scrunchies', intro: 'Crochet scrunchies we make by hand. Pick a ready-made one or choose the colours of yours.' },
    es: { name: 'Scrunchies', seoTitle: 'Scrunchies de ganchillo hechos a mano', intro: 'Scrunchies de ganchillo hechos a mano por nosotros. Elige uno de los que ya están hechos o personaliza los colores del tuyo.' },
  },
  'tote-bag': {
    en: { name: 'Tote Bag', seoTitle: 'Embroidered organic cotton tote bags', intro: 'Organic cotton tote bags with Mekie designs embroidered: planets and mushrooms.' },
    es: { name: 'Tote Bag', seoTitle: 'Tote bags bordadas de algodón orgánico', intro: 'Tote bags de algodón orgánico con los diseños Mekie bordados: planetas y setas.' },
  },
};

const collectionTr: Record<string, Record<'en' | 'es', Pick<Collection, 'name' | 'intro'>>> = {
  cogumelos: {
    en: { name: 'Mushrooms', intro: 'Three mushrooms embroidered on the chest and the Mekie logo on the sleeve.' },
    es: { name: 'Setas', intro: 'Tres setas bordadas en el pecho y el logo Mekie en la manga.' },
  },
  esqueleto: {
    en: { name: 'Skeleton', intro: 'The Mekie skeleton, embroidered on hoodies and printed on socks.' },
    es: { name: 'Esqueleto', intro: 'El esqueleto Mekie bordado en hoodies y estampado en calcetines.' },
  },
};

/* Cores do fio do scrunchie personalizado */
const yarn: Tr = {
  Branco: ['White', 'Blanco'], Cru: ['Ecru', 'Crudo'], Mostarda: ['Mustard', 'Mostaza'], 'Rosa claro': ['Light pink', 'Rosa claro'],
  'Rosa pó': ['Powder pink', 'Rosa empolvado'], 'Rosa velho': ['Dusty rose', 'Rosa palo'], 'Azul gelo': ['Ice blue', 'Azul hielo'],
  'Azul céu': ['Sky blue', 'Azul cielo'], 'Azul acinzentado': ['Greyish blue', 'Azul grisáceo'], 'Azul petróleo': ['Petrol blue', 'Azul petróleo'],
  'Verde água claro': ['Light aqua', 'Verde agua claro'], 'Verde menta': ['Mint green', 'Verde menta'], 'Verde água': ['Aqua green', 'Verde agua'],
  'Bege rosado': ['Rosy beige', 'Beige rosado'], Malva: ['Mauve', 'Malva'], Chocolate: ['Chocolate', 'Chocolate'],
  'Lilás acinzentado': ['Greyish lilac', 'Lila grisáceo'], 'Cinza azulado': ['Bluish grey', 'Gris azulado'], 'Cinza escuro': ['Dark grey', 'Gris oscuro'],
  Preto: ['Black', 'Negro'], Pêssego: ['Peach', 'Melocotón'], Laranja: ['Orange', 'Naranja'], Terracota: ['Terracotta', 'Terracota'],
  Coral: ['Coral', 'Coral'], Vermelho: ['Red', 'Rojo'], Bordeaux: ['Burgundy', 'Burdeos'], 'Lilás claro': ['Light lilac', 'Lila claro'],
  Lilás: ['Lilac', 'Lila'], Roxo: ['Purple', 'Morado'], 'Amarelo palha': ['Straw yellow', 'Amarillo paja'], Lima: ['Lime', 'Lima'], Verde: ['Green', 'Verde'],
};

const pick = (table: Tr, pt: string, lang: Lang) => (lang === 'pt' ? pt : table[pt]?.[lang === 'en' ? 0 : 1] ?? pt);

export const trName = (pt: string, lang: Lang) => pick(names, pt, lang);
export const trColor = (pt: string, lang: Lang) => pick(colors, pt, lang);
export const trText = (pt: string, lang: Lang) => pick(texts, pt, lang);
export const trYarn = (pt: string, lang: Lang) => pick(yarn, pt, lang);

/** Produto com os textos na língua pedida (ids, slugs, preços e stock iguais) */
export function trProduct(p: Product, lang: Lang): Product {
  if (lang === 'pt') return p;
  const list = (a?: string[]) => a?.map((t) => trText(t, lang));
  return {
    ...p,
    name: trName(p.name, lang),
    color: trColor(p.color, lang),
    description: p.description && trText(p.description, lang),
    sizeNotes: p.sizeNotes && Object.fromEntries(Object.entries(p.sizeNotes).map(([k, v]) => [k, trText(v, lang)])),
    details: p.details && { features: list(p.details.features)!, composition: list(p.details.composition)!, care: list(p.details.care) },
  };
}

export const trCategory = (c: Category, lang: Lang): Category =>
  lang === 'pt' ? c : { ...c, ...categoryTr[c.slug]?.[lang] };

export const trCollection = (c: Collection, lang: Lang): Collection =>
  lang === 'pt' ? c : { ...c, ...collectionTr[c.slug]?.[lang] };
