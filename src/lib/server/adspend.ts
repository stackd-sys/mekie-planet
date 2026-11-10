/* Gasto em anúncios, mês a mês, para as Finanças: Meta (pela API de anúncios) e Google Ads (pelo Google Analytics,
   que recebe o custo das campanhas quando o Google Ads está ligado). Se uma das ligações faltar ou falhar, fica de fora
   e a página diz porquê, sem deixar de abrir. */
import { hasMeta, metaSpendByMonth } from './meta';
import { hasGa, gaReport, rows } from './google';

export type AdSpend = { meta: Record<number, number> | null; google: Record<number, number> | null; errors: string[] };

export async function adSpendByMonth(year: number): Promise<AdSpend> {
  const errors: string[] = [];
  const thisYear = new Date().getFullYear();
  if (year > thisYear) return { meta: null, google: null, errors };
  const [meta, google] = await Promise.all([
    hasMeta()
      ? metaSpendByMonth(year).catch((e: Error) => { errors.push(`Meta: ${e.message}`); return null; })
      : Promise.resolve(null),
    hasGa()
      ? gaReport({
          dateRanges: [{ startDate: `${year}-01-01`, endDate: year === thisYear ? 'today' : `${year}-12-31` }],
          dimensions: [{ name: 'yearMonth' }],
          metrics: [{ name: 'advertiserAdCost' }],
        })
          .then((r: any) => Object.fromEntries(rows(r).map((x) => [Number(String(x.yearMonth).slice(4, 6)), Number(x.advertiserAdCost) || 0])) as Record<number, number>)
          .catch((e: Error) => { errors.push(`Google Ads: ${e.message}`); return null; })
      : Promise.resolve(null),
  ]);
  return { meta, google, errors };
}
