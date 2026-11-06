import { applyOverrides, openOrdersWith } from '../lib/server/overrides';
import { promo, promoActive, promoPrice, kindOf } from './promo';

export type Category = {
  slug: string;
  name: string;
  /** Categoria-mãe (ex.: Caps dentro de Acessórios). */
  parent?: string;
  image: string;
  /** Título e texto para o Google e para o topo da página da categoria */
  seoTitle: string;
  intro: string;
};

export type Collection = {
  slug: string;
  name: string;
  intro: string;
  image: string;
};

export type ProductDetails = {
  features: string[];
  composition: string[];
  care?: string[];
};

export type CustomPart = 'main' | 'edge' | 'body' | 'ring';

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  collection?: string;
  color: string;
  regularPrice: number;
  price: number;
  sizes?: string[];
  /** Unidades em stock (produtos sem tamanhos). */
  stock?: number;
  /** Unidades em stock por tamanho. Tamanhos a 0 aparecem como esgotados. */
  sizeStock?: Record<string, number>;
  /** Nota mostrada quando se escolhe um tamanho (ex.: unidade de outro fabricante). */
  sizeNotes?: Record<string, string>;
  /** Feito por encomenda quando não há stock: prazo de entrega em dias úteis. */
  madeToOrderDays?: number;
  /** O cliente escolhe as cores (scrunchie e malas personalizadas). */
  customizable?: boolean;
  /** Fio das cores à escolha: algodão (scrunchie) ou merino (malas). */
  yarn?: 'algodao' | 'merino';
  /** Zonas que o cliente pinta, pela ordem do mapa (base, canal verde, canal azul). A alça das malas é da cor da mala. */
  customParts?: CustomPart[];
  /** Mapa da pré-visualização: sombra (vermelho), 2.ª zona (verde), 3.ª zona (azul) e recorte (alfa). */
  customMap?: string;
  /** Cores da pré-visualização antes de escolher (hex, pela ordem das zonas). */
  customDefaults?: string[];
  /** Peça pronta: endereço da versão personalizada ("Queres outras cores?"). */
  customSlug?: string;
  images: string[];
  badge?: string;
  /** desconto da promoção em curso, em % (mostrado na etiqueta em vez da conta exata) */
  promoPct?: number;
  description: string;
  details?: ProductDetails;
};

export const categories: Category[] = [
  {
    slug: 'hoodies-crewnecks', name: 'Hoodies & Crewnecks', image: '/images/lookbook/mushrooms-hoodie-yellow.webp',
    seoTitle: 'Hoodies e crewnecks bordadas',
    intro: 'Hoodies e crewnecks unissexo com os bordados Mekie: cogumelos, esqueleto, planetas e o logótipo. Do XS ao XL.',
  },
  {
    slug: 't-shirts', name: 'T-Shirts', image: '/images/lookbook/mushrooms-black.webp',
    seoTitle: 'T-shirts oversized bordadas',
    intro: 'T-shirts oversized unissexo em 100% algodão, com os cogumelos Mekie bordados no peito e o logótipo na manga.',
  },
  {
    slug: 'acessorios', name: 'Acessórios', image: '/images/lookbook/stack-leaves.webp',
    seoTitle: 'Acessórios: caps, meias, scrunchies e mais',
    intro: 'Caps de bombazina, bucket hat de algodão orgânico, meias, scrunchies de crochet feitos à mão e tote bags bordadas.',
  },
  {
    slug: 'caps', name: 'Caps', parent: 'acessorios', image: '/images/products/cap-black-1.webp',
    seoTitle: 'Caps de bombazina bordadas',
    intro: 'Caps de bombazina com o logótipo Mekie bordado. Tamanho único e ajustável.',
  },
  {
    slug: 'bucket-hat', name: 'Bucket Hat', parent: 'acessorios', image: '/images/products/bucket-white-1.webp',
    seoTitle: 'Bucket hat de algodão orgânico',
    intro: 'Bucket hat Mekie em sarja de algodão orgânico, com o logótipo bordado.',
  },
  {
    slug: 'meias', name: 'Meias', parent: 'acessorios', image: '/images/products/socks-mekie-1.webp',
    seoTitle: 'Meias Mekie',
    intro: 'Meias de cano médio com o logótipo e o esqueleto Mekie.',
  },
  {
    slug: 'scrunchies', name: 'Scrunchies', parent: 'acessorios', image: '/images/products/scrunchie-rosa-1.webp',
    seoTitle: 'Scrunchies de crochet feitos à mão',
    intro: 'Scrunchies de crochet feitos à mão por nós. Escolhe um dos prontos ou personaliza as cores do teu.',
  },
  {
    slug: 'tote-bag', name: 'Tote Bag', parent: 'acessorios', image: '/images/products/tote-planetas-black-1.webp',
    seoTitle: 'Tote bags de algodão orgânico bordadas',
    intro: 'Tote bags de algodão orgânico com os desenhos Mekie bordados: planetas e cogumelos.',
  },
  {
    slug: 'malas', name: 'Malas', parent: 'acessorios', image: '/images/products/mala-s-verde-1.webp',
    seoTitle: 'Malas de crochet feitas à mão',
    intro: 'Malas de crochet feitas à mão por nós. Leva uma das que já estão feitas ou escolhe as cores da tua.',
  },
];

export const collections: Collection[] = [
  {
    slug: 'cogumelos',
    name: 'Cogumelos',
    intro: 'Três cogumelos bordados no peito e o logótipo Mekie na manga.',
    image: '/images/lookbook/mushrooms-duo.webp',
  },
  {
    slug: 'esqueleto',
    name: 'Esqueleto',
    intro: 'O esqueleto Mekie bordado em hoodies e estampado em meias.',
    image: '/images/lookbook/esqueleto-black-hood.webp',
  },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const img = (name: string) => `/images/products/${name}.webp`;
const look = (name: string) => `/images/lookbook/${name}.webp`;

const careEmbroidery = [
  'Lavar na máquina a 40 °C no máximo',
  'Não utilizar lixívia',
  'Não utilizar máquina de secar',
  'Passar a ferro a 110 °C no máximo',
  'Não limpar a seco',
  'Lavar do avesso protege o bordado e ajuda a preservar a peça',
];

const tshirt = (motif: string): ProductDetails => ({
  features: [
    'T-shirt oversized unissexo, de corte descontraído',
    `Bordado de ${motif} no peito, com acabamento detalhado`,
    'Pormenor bordado na manga',
    'Gola redonda reforçada',
  ],
  composition: ['100% algodão', '190 g'],
  care: careEmbroidery,
});

const hoodie = (motif: string): ProductDetails => ({
  features: [
    'Hoodie unissexo com capuz e bolso canguru',
    `Bordado de ${motif} no peito, com acabamento detalhado`,
    'Pormenor bordado a vermelho no punho',
    'Cordão de ajuste no capuz',
    'Punhos e barra em canelado, para um ajuste confortável',
  ],
  composition: ['80% algodão, 20% poliéster', '320 g'],
  care: careEmbroidery,
});

const cap: ProductDetails = {
  features: [
    'Cap de bombazina unissexo, de 6 painéis',
    'Fita interior e acabamentos em sarja de algodão',
    'Aba curva com tira ajustável em bombazina',
  ],
  composition: ['100% algodão (bombazina)'],
};

const bucket: ProductDetails = {
  features: [
    'Aba clássica e perfil alto',
    'Tecido respirável',
  ],
  composition: [
    'Sarja 100% algodão orgânico',
    'Algodão orgânico com certificação GOTS',
    'Tecido com certificação OEKO-TEX Standard 100',
  ],
};

const sweatshirt = (embroidery: string): ProductDetails => ({
  ...sweatshirtDetails,
  features: [embroidery, ...sweatshirtDetails.features],
  care: careEmbroidery,
});

export const sweatshirtDetails: ProductDetails = {
  features: [
    'Crewneck unissexo de gola redonda clássica',
    'Gola, punhos e bainha em canelado com costura dupla',
  ],
  composition: ['100% algodão', '288 g/m²'],
};

const toteDetails: ProductDetails = {
  features: [
    'Alças duplas com 2,5 cm de largura e 62,2 cm de comprimento',
    'Dimensões: 40,6 × 35,6 × 12,7 cm',
    'Aguenta até 13,6 kg',
  ],
  composition: [
    'Algodão orgânico com certificações GOTS e OCS',
    'Certificação OEKO-TEX Standard 100',
    'Selo vegano aprovado pela PETA',
  ],
};

/* Fio Rosários 4 Bio Love: as cores que dá para escolher no scrunchie personalizado */
export const yarnColors = [
  { code: '01', name: 'Branco', hex: '#ebe8e5' },
  { code: '02', name: 'Cru', hex: '#e2dcc4' },
  { code: '03', name: 'Mostarda', hex: '#d9a95c' },
  { code: '05', name: 'Rosa claro', hex: '#ecd6dc' },
  { code: '06', name: 'Rosa pó', hex: '#ecd4cd' },
  { code: '07', name: 'Rosa velho', hex: '#c9a09d' },
  { code: '09', name: 'Azul gelo', hex: '#c8dadf' },
  { code: '10', name: 'Azul céu', hex: '#97afbf' },
  { code: '11', name: 'Azul acinzentado', hex: '#718a95' },
  { code: '12', name: 'Azul petróleo', hex: '#2c4d5c' },
  { code: '14', name: 'Verde água claro', hex: '#cbd9d4' },
  { code: '15', name: 'Verde menta', hex: '#b4d2cb' },
  { code: '16', name: 'Verde água', hex: '#6e9e9f' },
  { code: '18', name: 'Bege rosado', hex: '#cbb8b4' },
  { code: '19', name: 'Malva', hex: '#a88e8d' },
  { code: '20', name: 'Chocolate', hex: '#5e433d' },
  { code: '21', name: 'Lilás acinzentado', hex: '#c6c3d1' },
  { code: '22', name: 'Cinza azulado', hex: '#818596' },
  { code: '23', name: 'Cinza escuro', hex: '#6e6e7a' },
  { code: '24', name: 'Preto', hex: '#171518' },
  { code: '25', name: 'Pêssego', hex: '#efc4a3' },
  { code: '26', name: 'Laranja', hex: '#d6893f' },
  { code: '27', name: 'Terracota', hex: '#c25a36' },
  { code: '29', name: 'Coral', hex: '#e1767e' },
  { code: '30', name: 'Vermelho', hex: '#c80c36' },
  { code: '31', name: 'Bordeaux', hex: '#94052b' },
  { code: '33', name: 'Lilás claro', hex: '#d3b3c5' },
  { code: '34', name: 'Lilás', hex: '#ab7caf' },
  { code: '35', name: 'Roxo', hex: '#523d7c' },
  { code: '', name: 'Amarelo palha', hex: '#d8cb8a' },
  { code: '', name: 'Lima', hex: '#a69a3c' },
  { code: '', name: 'Verde', hex: '#5a703e' },
];

const scrunchieCustom: ProductDetails = {
  features: ['Feito à mão em crochet, por encomenda', 'Escolhes a cor do corpo e a cor do rebordo'],
  composition: ['Fio 100% algodão orgânico', 'Fio com certificação GOTS'],
};

const scrunchieRosa: ProductDetails = {
  features: ['Feito à mão em crochet'],
  composition: ['59% nylon, 41% poliéster'],
};

const scrunchieDourado: ProductDetails = {
  features: ['Feito à mão em crochet'],
  composition: ['98% algodão, 2% fibra metalizada'],
};

/* Fio Katia Merino Aran: as cores que dá para escolher nas malas personalizadas */
export const merinoColors = [
  { code: '03', name: 'Cru', hex: '#ebe7e0' },
  { code: '', name: 'Vermelho vivo', hex: '#e3243b' },
  { code: '05', name: 'Preto', hex: '#2b2a33' },
  { code: '10', name: 'Bege', hex: '#cab7a4' },
  { code: '11', name: 'Pérola', hex: '#d8cfc8' },
  { code: '12', name: 'Cinza pérola', hex: '#b5a9a8' },
  { code: '14', name: 'Cinza escuro', hex: '#555459' },
  { code: '23', name: 'Bordeaux', hex: '#7d2640' },
  { code: '37', name: 'Caramelo', hex: '#905636' },
  { code: '41', name: 'Ocre', hex: '#c78f2f' },
  { code: '44', name: 'Petróleo', hex: '#1f5a63' },
  { code: '46', name: 'Chocolate', hex: '#5e4740' },
  { code: '', name: 'Castanho', hex: '#806459' },
  { code: '50', name: 'Laranja telha', hex: '#ce4635' },
  { code: '51', name: 'Vermelho', hex: '#991423' },
  { code: '53', name: 'Rosa claro', hex: '#d9c0c2' },
  { code: '54', name: 'Rosa velho', hex: '#a46b7d' },
  { code: '', name: 'Rosa bebé', hex: '#f0bfcc' },
  { code: '56', name: 'Azul petróleo', hex: '#2f6b7d' },
  { code: '65', name: 'Verde acinzentado', hex: '#5c8b84' },
  { code: '68', name: 'Azul bebé', hex: '#a8c8e6' },
  { code: '69', name: 'Cinza', hex: '#767174' },
  { code: '70', name: 'Verde azeitona', hex: '#5c5733' },
  { code: '', name: 'Camelo', hex: '#b39383' },
  { code: '80', name: 'Amarelo', hex: '#e6b33c' },
  { code: '82', name: 'Verde garrafa', hex: '#18534c' },
  { code: '87', name: 'Amarelo lima', hex: '#c9b93a' },
  { code: '91', name: 'Verde menta', hex: '#b7c8c0' },
  { code: '', name: 'Azul royal', hex: '#1e4081' },
  { code: '101', name: 'Laranja', hex: '#d67146' },
  { code: '102', name: 'Roxo', hex: '#6f5a93' },
  { code: '103', name: 'Verde água', hex: '#45a58f' },
  { code: '105', name: 'Fúcsia', hex: '#a03f84' },
  { code: '106', name: 'Areia', hex: '#d6cbb2' },
  { code: '107', name: 'Morango', hex: '#d63048' },
  { code: '108', name: 'Grafite', hex: '#4a4b50' },
  { code: '109', name: 'Verde lima', hex: '#78c040' },
  { code: '110', name: 'Tijolo', hex: '#8e4a40' },
  { code: '111', name: 'Malva', hex: '#8a6a85' },
  { code: '112', name: 'Rosa pó', hex: '#ecd2cc' },
  { code: '113', name: 'Azul', hex: '#3a86c8' },
  { code: '', name: 'Azul acinzentado', hex: '#6b9499' },
  { code: '', name: 'Verde salva', hex: '#a9bf8c' },
  { code: '', name: 'Mostarda', hex: '#d2b74f' },
  { code: '', name: 'Salmão', hex: '#e2875a' },
];

const bagYarn = ['52% lã merino superwash, 48% acrílico', 'Fio Katia Merino Aran'];
const bagS: ProductDetails = {
  features: ['Feita à mão em crochet', 'Mala de mão pequena', 'Base: 16 cm', 'Corpo: 10 cm', 'Alça: 26 cm'],
  composition: bagYarn,
};
const bagM: ProductDetails = {
  features: ['Feita à mão em crochet', 'Mala de ombro, com a alça mais comprida', 'Base: 24 cm', 'Corpo: 15 cm', 'Alça: 46 cm'],
  composition: bagYarn,
};
const custom = (d: ProductDetails): ProductDetails => ({
  ...d,
  features: ['Feita à mão em crochet, por encomenda', 'Escolhes a cor da mala e a cor do anel', ...d.features.slice(1)],
});

const socks: ProductDetails = {
  features: [
    'Meias de cano médio (crew), unissexo',
    'Perna em canelado',
    'Estampado por sublimação, com cores nítidas que não desbotam',
  ],
  composition: ['60% nylon, 22% algodão, 18% elastano'],
  care: ['Lavar do avesso ajuda a preservar a estampa e as cores por mais tempo'],
};

export const products: Product[] = [
  {
    id: 3572,
    slug: 'hoodie-amarelo-pastel-cogumelos',
    name: 'Hoodie Cogumelos',
    category: 'hoodies-crewnecks',
    collection: 'cogumelos',
    color: 'Amarelo pastel',
    regularPrice: 70,
    price: 70,
    sizes: SIZES,
    sizeStock: { XS: 0, S: 0, M: 2, L: 5, XL: 2 },
    images: [img('hoodie-cogumelos-yellow-1'), look('mushrooms-hoodie-yellow'), look('stack-leaves')],
    description: '',
    details: hoodie('cogumelos'),
  },
  {
    id: 3565,
    slug: 'hoodie-cogumelos',
    name: 'Hoodie Cogumelos',
    category: 'hoodies-crewnecks',
    collection: 'cogumelos',
    color: 'Preto',
    regularPrice: 70,
    price: 70,
    sizes: SIZES,
    sizeStock: { XS: 0, S: 1, M: 3, L: 2, XL: 2 },
    sizeNotes: { S: 'Esta unidade não foi fabricada em Portugal.' },
    images: [img('hoodie-cogumelos-black-1'), look('hoodie-black-cuff')],
    description: '',
    details: hoodie('cogumelos'),
  },
  {
    id: 3558,
    slug: 'hoodie-amarelo-pastel-esqueleto',
    name: 'Hoodie Esqueleto',
    category: 'hoodies-crewnecks',
    collection: 'esqueleto',
    color: 'Amarelo pastel',
    regularPrice: 70,
    price: 70,
    sizes: SIZES,
    sizeStock: { XS: 0, S: 0, M: 6, L: 7, XL: 2 },
    images: [img('hoodie-esqueleto-yellow-1'), look('esqueleto-duo')],
    description: '',
    details: hoodie('esqueleto'),
  },
  {
    id: 3301,
    slug: 'hoodie-black-esqueleto',
    name: 'Hoodie Esqueleto',
    category: 'hoodies-crewnecks',
    collection: 'esqueleto',
    color: 'Preto',
    regularPrice: 70,
    price: 70,
    sizes: SIZES,
    sizeStock: { XS: 0, S: 1, M: 3, L: 4, XL: 0 },
    sizeNotes: { S: 'Esta unidade não foi fabricada em Portugal.' },
    images: [img('hoodie-skeleton-1'), look('esqueleto-black-hood'), look('hoodie-black-cuff')],
    description: '',
    details: hoodie('esqueleto'),
  },
  {
    id: 9010,
    slug: 'crewneck-mekie-cru',
    name: 'Crewneck Mekie',
    category: 'hoodies-crewnecks',
    color: 'Cru',
    regularPrice: 65,
    price: 65,
    sizes: SIZES,
    sizeStock: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
    images: [img('sweat-mekie-cru-1'), look('sweat-cru-lake'), look('sweat-cru-bucket-tote'), look('cap-brown-sweat-duo')],
    description: '',
    details: sweatshirt('Logótipo Mekie bordado no peito e na manga'),
  },
  {
    id: 9014,
    slug: 'crewneck-mekie-preta',
    name: 'Crewneck Mekie',
    category: 'hoodies-crewnecks',
    color: 'Preto',
    regularPrice: 65,
    price: 65,
    sizes: SIZES,
    sizeStock: { XS: 0, S: 1, M: 0, L: 1, XL: 0 },
    /* estas unidades não foram feitas em Portugal */
    sizeNotes: { S: 'Esta unidade não foi fabricada em Portugal.', L: 'Esta unidade não foi fabricada em Portugal.' },
    images: [img('sweat-mekie-black-1'), look('sweat-mekie-black-sunglasses')],
    description: '',
    details: sweatshirt('Logótipo Mekie bordado a branco no peito e na manga'),
  },
  {
    id: 9011,
    slug: 'crewneck-planetas-preta',
    name: 'Crewneck Planetas',
    category: 'hoodies-crewnecks',
    color: 'Preto',
    regularPrice: 65,
    price: 65,
    sizes: SIZES,
    sizeStock: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
    images: [img('sweat-planetas-black-1'), look('sweat-planetas-black-scrunchie'), look('sweat-planetas-duo')],
    description: '',
    details: sweatshirt('Planetas bordados no peito e logótipo Mekie bordado na manga'),
  },
  {
    id: 9012,
    slug: 'crewneck-planetas-cru',
    name: 'Crewneck Planetas',
    category: 'hoodies-crewnecks',
    color: 'Cru',
    regularPrice: 65,
    price: 65,
    sizes: SIZES,
    sizeStock: { XS: 0, S: 0, M: 0, L: 0, XL: 0 },
    images: [img('sweat-planetas-cru-1'), look('sweat-planetas-cru'), look('sweat-planetas-duo')],
    description: '',
    details: sweatshirt('Planetas bordados no peito e logótipo Mekie bordado na manga'),
  },
  {
    id: 3222,
    slug: 'tshirt-khaki-cogumelos',
    name: 'T-shirt Cogumelos',
    category: 't-shirts',
    collection: 'cogumelos',
    color: 'Bege',
    regularPrice: 50,
    price: 50,
    sizes: SIZES,
    sizeStock: { XS: 0, S: 0, M: 6, L: 0, XL: 0 },
    images: [
      img('tshirt-khaki-mushrooms-1'),
      look('mushrooms-duo'),
      look('mushrooms-sleeve'),
    ],
    description: '',
    details: tshirt('cogumelos'),
  },
  {
    id: 299,
    slug: 'tshirt-black-cogumelos',
    name: 'T-shirt Cogumelos',
    category: 't-shirts',
    collection: 'cogumelos',
    color: 'Cinza',
    regularPrice: 50,
    price: 50,
    sizes: SIZES,
    sizeStock: { XS: 0, S: 1, M: 8, L: 0, XL: 0 },
    images: [
      img('tshirt-black-mushrooms-1'),
      look('mushrooms-black'),
      look('cap-olive-tee-black'),
      look('mushrooms-duo'),
      look('cap-brown-sweat-duo'),
    ],
    description: '',
    details: tshirt('cogumelos'),
  },
  {
    id: 3590,
    slug: 'cap-mekie-black',
    name: 'Cap Mekie',
    category: 'caps',
    color: 'Preto',
    regularPrice: 30,
    price: 30,
    stock: 1,
    images: [img('cap-black-1'), look('cap-black-sweat')],
    description: '',
    details: cap,
  },
  {
    id: 3589,
    slug: 'cap-mekie-blue-navy',
    name: 'Cap Mekie',
    category: 'caps',
    color: 'Azul navy',
    regularPrice: 30,
    price: 30,
    stock: 1,
    images: [img('cap-navy-1'), look('cap-navy-couple')],
    description: '',
    details: cap,
  },
  {
    id: 3585,
    slug: 'cap-mekie-dark-olive',
    name: 'Cap Mekie',
    category: 'caps',
    color: 'Verde azeitona',
    regularPrice: 30,
    price: 30,
    stock: 1,
    images: [img('cap-olive-1'), look('cap-olive-tee-black')],
    description: '',
    details: cap,
  },
  {
    id: 9003,
    slug: 'cap-mekie-castanho',
    name: 'Cap Mekie',
    category: 'caps',
    color: 'Castanho',
    regularPrice: 30,
    price: 30,
    stock: 0,
    images: [img('cap-brown-1'), look('cap-brown-sweat-duo')],
    description: '',
    details: cap,
  },
  {
    id: 3583,
    slug: 'bucket-hat-mekie',
    name: 'Bucket Hat Mekie',
    category: 'bucket-hat',
    color: 'Branco',
    regularPrice: 30,
    price: 30,
    stock: 1,
    images: [img('bucket-white-1'), look('bucket-tee'), look('sweat-cru-bucket-tote')],
    details: bucket,
    description: '',
  },
  {
    id: 9013,
    slug: 'bucket-hat-mekie-preto',
    name: 'Bucket Hat Mekie',
    category: 'bucket-hat',
    color: 'Preto',
    regularPrice: 30,
    price: 30,
    stock: 0,
    images: [img('bucket-black-1'), look('bucket-black-duo')],
    details: bucket,
    description: '',
  },
  {
    id: 3294,
    slug: 'meias-mekie',
    name: 'Meias Mekie',
    category: 'meias',
    color: 'Branco e preto',
    regularPrice: 20,
    price: 20,
    stock: 1,
    images: [img('socks-mekie-1'), look('socks-lake'), img('socks-mekie-2')],
    description: '',
    details: socks,
  },
  {
    id: 3542,
    slug: 'meias-esqueleto',
    name: 'Meias Esqueleto',
    category: 'meias',
    collection: 'esqueleto',
    color: 'Branco e preto',
    regularPrice: 20,
    price: 20,
    stock: 1,
    images: [img('socks-esqueleto-1'), look('socks-esqueleto-tee-khaki')],
    description: '',
    details: socks,
  },
  {
    id: 9001,
    slug: 'scrunchie-rosa',
    name: 'Scrunchie Mekie',
    category: 'scrunchies',
    color: 'Rosa',
    regularPrice: 15,
    price: 15,
    stock: 1,
    madeToOrderDays: 10,
    images: [img('scrunchie-rosa-1'), look('scrunchie-couple')],
    details: scrunchieRosa,
    description: '',
  },
  {
    id: 9002,
    slug: 'scrunchie-dourado',
    name: 'Scrunchie Mekie',
    category: 'scrunchies',
    color: 'Dourado',
    regularPrice: 15,
    price: 15,
    stock: 1,
    madeToOrderDays: 10,
    images: [img('scrunchie-dourado-1'), look('scrunchie-dourado-tote'), look('sweat-planetas-black-scrunchie')],
    details: scrunchieDourado,
    description: '',
  },
  {
    id: 9008,
    slug: 'scrunchie-personalizado',
    name: 'Scrunchie Personalizado',
    category: 'scrunchies',
    color: 'Cores à tua escolha',
    regularPrice: 15,
    price: 15,
    stock: 0,
    madeToOrderDays: 10,
    customizable: true,
    yarn: 'algodao',
    customParts: ['main', 'edge'],
    customMap: '/images/products/scrunchie-personalizado-mapa.webp',
    customDefaults: ['#de5378', '#d8c0cc'],
    images: [img('scrunchie-personalizado-1'), img('scrunchie-rosa-1'), img('scrunchie-dourado-1')],
    details: scrunchieCustom,
    description: 'Escolhe as tuas cores e nós fazemos o scrunchie à mão.',
  },
  {
    id: 9004,
    slug: 'tote-bag-planetas-preta',
    name: 'Tote Bag Planetas',
    category: 'tote-bag',
    color: 'Preto',
    regularPrice: 25,
    price: 25,
    stock: 1,
    images: [img('tote-planetas-black-1'), look('tote-planetas-lake')],
    description: '',
    details: toteDetails,
  },
  {
    id: 9005,
    slug: 'tote-bag-planetas-bege',
    name: 'Tote Bag Planetas',
    category: 'tote-bag',
    color: 'Bege',
    regularPrice: 25,
    price: 25,
    stock: 0,
    images: [img('tote-planetas-beige-1'), look('tote-planetas-bege-detail')],
    description: '',
    details: toteDetails,
  },
  {
    id: 9006,
    slug: 'tote-bag-cogumelos-bege',
    name: 'Tote Bag Cogumelos',
    category: 'tote-bag',
    collection: 'cogumelos',
    color: 'Bege',
    regularPrice: 25,
    price: 25,
    stock: 1,
    images: [img('tote-cogumelos-beige-1'), look('scrunchie-dourado-tote')],
    description: '',
    details: toteDetails,
  },
  {
    id: 9007,
    slug: 'tote-bag-cogumelos-preta',
    name: 'Tote Bag Cogumelos',
    category: 'tote-bag',
    collection: 'cogumelos',
    color: 'Preto',
    regularPrice: 25,
    price: 25,
    stock: 0,
    images: [img('tote-cogumelos-black-1'), look('sweat-cru-bucket-tote')],
    description: '',
    details: toteDetails,
  },
  {
    id: 9015,
    slug: 'mala-crochet-s-verde',
    name: 'Mala de Crochet S',
    category: 'malas',
    color: 'Verde',
    regularPrice: 25,
    price: 25,
    stock: 1,
    madeToOrderDays: 10,
    customSlug: 'mala-crochet-s-personalizada',
    images: [img('mala-s-verde-1'), look('mala-s-verde-crewneck')],
    details: bagS,
    description: '',
  },
  {
    id: 9016,
    slug: 'mala-crochet-m-rosa',
    name: 'Mala de Crochet M',
    category: 'malas',
    color: 'Rosa',
    regularPrice: 35,
    price: 35,
    stock: 1,
    madeToOrderDays: 10,
    customSlug: 'mala-crochet-m-personalizada',
    images: [img('mala-m-rosa-v2-1'), look('mala-m-rosa-ombro')],
    details: bagM,
    description: '',
  },
  {
    id: 9017,
    slug: 'mala-crochet-s-personalizada',
    name: 'Mala de Crochet S Personalizada',
    category: 'malas',
    color: 'Cores à tua escolha',
    regularPrice: 25,
    price: 25,
    stock: 0,
    madeToOrderDays: 10,
    customizable: true,
    yarn: 'merino',
    customParts: ['body', 'ring'],
    customMap: '/images/products/mala-s-mapa-v2.webp',
    customDefaults: ['#3a86c8', '#e6b33c'],
    images: [img('mala-s-personalizada-v2-1'), img('mala-s-cores-v2-1'), img('mala-s-verde-1')],
    details: custom(bagS),
    description: 'Escolhe as tuas cores e nós fazemos a mala à mão.',
  },
  {
    id: 9018,
    slug: 'mala-crochet-m-personalizada',
    name: 'Mala de Crochet M Personalizada',
    category: 'malas',
    color: 'Cores à tua escolha',
    regularPrice: 35,
    price: 35,
    stock: 0,
    madeToOrderDays: 10,
    customizable: true,
    yarn: 'merino',
    customParts: ['body', 'ring'],
    customMap: '/images/products/mala-m-mapa-v2.webp',
    customDefaults: ['#6f5a93', '#f0bfcc'],
    images: [img('mala-m-personalizada-v2-1'), img('mala-m-cores-v2-1'), img('mala-m-rosa-v2-1')],
    details: custom(bagM),
    description: 'Escolhe as tuas cores e nós fazemos a mala à mão.',
  },
];

/* Preço e stock atuais, geridos no CRM (quando há base de dados). Sem base de dados ficam os valores acima. */
await applyOverrides(products);
/* Malas: são feitas à mão, uma a uma. A cada 5 encomendas personalizadas por fazer (pagas e ainda não enviadas),
   o prazo de todas as malas cresce 7 dias úteis. O site volta a ser gerado quando se passa um destes limites. */
export const bagQueue = { every: 5, days: 7, open: 0, extra: 0 };
bagQueue.open = await openOrdersWith(products.filter((p) => p.category === 'malas' && p.customizable).map((p) => p.id));
bagQueue.extra = Math.floor(bagQueue.open / bagQueue.every) * bagQueue.days;
for (const p of products) if (p.category === 'malas' && p.madeToOrderDays) p.madeToOrderDays += bagQueue.extra;

/* promoção em curso: o preço do CRM passa a ser o preço riscado */
const promoOn = promoActive();
for (const p of products) {
  p.regularPrice = p.price;
  p.price = promoPrice(p.category, p.price, promoOn);
  if (p.price < p.regularPrice) p.promoPct = promo.discounts[p.category];
}

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);
export const childCategories = (slug: string) => categories.filter((c) => c.parent === slug);
export const topCategories = categories.filter((c) => !c.parent);
/** Produtos da categoria e das suas subcategorias. */
export const productsIn = (slug: string) => {
  const slugs = [slug, ...childCategories(slug).map((c) => c.slug)];
  return products.filter((p) => slugs.includes(p.category));
};
export const productsInCollection = (slug: string) => products.filter((p) => p.collection === slug);
/** Total em stock (soma dos tamanhos), ou undefined quando não é controlado. */
export const totalStock = (p: Product) =>
  p.sizeStock ? Object.values(p.sizeStock).reduce((n, v) => n + v, 0) : p.stock;
export const isSoldOut = (p: Product) => !p.madeToOrderDays && totalStock(p) === 0;
export const lowStock = () =>
  products.filter((p) => { const t = totalStock(p); return t !== undefined && t > 0 && t <= 3 && !p.madeToOrderDays; });
/** Nome completo com a cor (o personalizado não tem cor fixa) */
export const fullName = (p: Product) => (p.customizable ? p.name : `${p.name} ${p.color}`);

/** Peso aproximado de cada peça (g), para calcular os portes. Convém pesar e acertar. */
const gramsByCategory: Record<string, number> = {
  'hoodies-crewnecks': 700, 't-shirts': 250, caps: 150, 'bucket-hat': 120, meias: 80, scrunchies: 50, 'tote-bag': 180, malas: 250,
};
export const weightOf = (p: Product) => gramsByCategory[p.category] ?? 300;

/** Dados que o carrinho precisa de cada produto. */
export const cartInfo = (p: Product) => ({
  id: p.id, slug: p.slug, name: p.name, color: p.color, price: p.price, image: p.images[0],
  stock: p.stock, sizeStock: p.sizeStock, madeToOrderDays: p.madeToOrderDays, grams: weightOf(p),
  /* para os packs e para saber se a peça já está com desconto */
  kind: kindOf(p), onSale: p.price < p.regularPrice,
});
export const variantsOf = (p: Product) => products.filter((o) => o.name === p.name);
export const discount = (p: Product) =>
  p.promoPct ?? (p.regularPrice > p.price ? Math.round((1 - p.price / p.regularPrice) * 100) : 0);
