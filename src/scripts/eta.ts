/* Data de entrega estimada: soma dias úteis a hoje, sem fins de semana nem feriados nacionais. */

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher) */
function easter(year: number) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

const key = (d: Date) => `${d.getMonth() + 1}-${d.getDate()}`;
const cache = new Map<number, Set<string>>();

/** Feriados nacionais obrigatórios em Portugal */
function holidays(year: number) {
  if (!cache.has(year)) {
    const fixed = ['1-1', '4-25', '5-1', '6-10', '8-15', '10-5', '11-1', '12-1', '12-8', '12-25'];
    const e = easter(year);
    const shift = (days: number) => key(new Date(year, e.getMonth(), e.getDate() + days));
    cache.set(year, new Set([...fixed, shift(-2), shift(60)])); // Sexta-feira Santa e Corpo de Deus
  }
  return cache.get(year)!;
}

export const isWorkingDay = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6 && !holidays(d.getFullYear()).has(key(d));

/** Último dia da entrega: o n-ésimo dia útil depois de hoje */
export function deliveryBy(workingDays: number, from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let left = workingDays;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (isWorkingDay(d)) left--;
  }
  return d;
}

/** "quinta-feira, 23 de outubro" */
export const formatDay = (d: Date) =>
  d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
