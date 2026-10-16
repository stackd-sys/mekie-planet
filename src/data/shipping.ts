/* Portes de envio (CTT). Os valores e as contas estão explicados no README, em "Portes de envio". */

export type Zone = 'pt' | 'eu';

type Band = { upTo: number; price: number };
type ZoneRates = {
  label: string;
  /** preço por peso total da encomenda (com embalagem), em gramas; o último escalão é o máximo de um volume */
  bands: Band[];
  /** envio grátis a partir deste valor em artigos, ou null quando não há */
  freeFrom: number | null;
  days: string;
};

export const shipping: Record<Zone, ZoneRates> = {
  pt: {
    label: 'Portugal (Continente, Açores e Madeira)',
    bands: [
      { upTo: 500, price: 5.9 },
      { upTo: 2000, price: 9.9 },
    ],
    freeFrom: 65,
    days: '7 dias úteis',
  },
  eu: {
    label: 'União Europeia',
    bands: [
      { upTo: 250, price: 9.9 },
      { upTo: 500, price: 12.9 },
      { upTo: 1000, price: 16.9 },
      { upTo: 2000, price: 24.9 },
    ],
    freeFrom: null,
    days: '10 a 15 dias úteis',
  },
};

/** Peso da embalagem somado a cada encomenda */
export const packagingGrams = 100;

export const destinations: { name: string; zone: Zone }[] = [
  { name: 'Portugal Continental', zone: 'pt' },
  { name: 'Açores', zone: 'pt' },
  { name: 'Madeira', zone: 'pt' },
  ...[
    'Alemanha', 'Áustria', 'Bélgica', 'Bulgária', 'Chipre', 'Croácia', 'Dinamarca', 'Eslováquia',
    'Eslovénia', 'Espanha', 'Estónia', 'Finlândia', 'França', 'Grécia', 'Hungria', 'Irlanda', 'Itália',
    'Letónia', 'Lituânia', 'Luxemburgo', 'Malta', 'Países Baixos', 'Polónia', 'Chéquia', 'Roménia', 'Suécia',
  ]
    .sort((a, b) => a.localeCompare(b, 'pt'))
    .map((name) => ({ name, zone: 'eu' as Zone })),
];

/** Preço mais baixo de uma zona (o primeiro escalão) */
export const fromPrice = (zone: Zone) => shipping[zone].bands[0].price;

/** Custo do envio para o subtotal (antes de descontos) e o peso dos artigos, em gramas.
 *  Acima do último escalão a encomenda segue em mais de um volume. */
export function shippingCost(zone: Zone, subtotal: number, grams: number): number {
  const z = shipping[zone];
  /* só artigos digitais (cartão presente): nada para enviar */
  if (grams <= 0) return 0;
  if (z.freeFrom !== null && subtotal >= z.freeFrom) return 0;
  const max = z.bands[z.bands.length - 1];
  let left = grams + packagingGrams;
  let cost = 0;
  while (left > max.upTo) {
    cost += max.price;
    left -= max.upTo;
  }
  return Math.round((cost + z.bands.find((b) => left <= b.upTo)!.price) * 100) / 100;
}
