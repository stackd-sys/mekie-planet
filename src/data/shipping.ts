/* Portes de envio (CTT). Os valores e as contas estão explicados no README, em "Portes de envio". */

export type Zone = 'pt' | 'eu';

export const shipping = {
  pt: {
    label: 'Portugal (Continente, Açores e Madeira)',
    price: 4.9,
    freeFrom: 65,
    days: '7 dias úteis',
  },
  eu: {
    label: 'União Europeia',
    /** preço por peso total da encomenda (com embalagem), em gramas */
    bands: [
      { upTo: 1000, price: 12.9 },
      { upTo: Infinity, price: 19.9 },
    ],
    freeFrom: 150,
    days: '10 a 15 dias úteis',
  },
} as const;

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

/** Custo do envio para o subtotal (antes de descontos) e o peso dos artigos, em gramas. */
export function shippingCost(zone: Zone, subtotal: number, grams: number): number {
  if (zone === 'pt') return subtotal >= shipping.pt.freeFrom ? 0 : shipping.pt.price;
  if (subtotal >= shipping.eu.freeFrom) return 0;
  const total = grams + packagingGrams;
  return shipping.eu.bands.find((b) => total <= b.upTo)!.price;
}
