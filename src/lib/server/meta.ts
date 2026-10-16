/* Campanhas Meta (Instagram e Facebook) pela Marketing API, só leitura.
   Variáveis: META_ACCESS_TOKEN (token de utilizador de sistema com ads_read) e META_AD_ACCOUNT_ID (act_123...). */
export const hasMeta = () => Boolean(process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID);

const cache = new Map<string, { at: number; data: any }>();

export async function metaCampaigns(days: number) {
  const id = String(days);
  const hit = cache.get(id);
  if (hit && Date.now() - hit.at < 600_000) return hit.data as any[];
  const version = process.env.META_API_VERSION || 'v23.0';
  const account = (process.env.META_AD_ACCOUNT_ID || '').replace(/^(?!act_)/, 'act_');
  const until = new Date().toISOString().slice(0, 10);
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const params = new URLSearchParams({
    level: 'campaign',
    fields: 'campaign_name,spend,impressions,reach,clicks,ctr,actions,action_values',
    time_range: JSON.stringify({ since, until }),
    limit: '50',
    access_token: process.env.META_ACCESS_TOKEN || '',
  });
  const res = await fetch(`https://graph.facebook.com/${version}/${account}/insights?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Meta respondeu ${res.status}`);
  const pick = (list: any[] | undefined, type: string) => Number(list?.find((a) => a.action_type === type)?.value ?? 0);
  const out = (data.data ?? []).map((c: any) => {
    const purchases = pick(c.actions, 'offsite_conversion.fb_pixel_purchase') || pick(c.actions, 'purchase');
    const value = pick(c.action_values, 'offsite_conversion.fb_pixel_purchase') || pick(c.action_values, 'purchase');
    const spend = Number(c.spend || 0);
    return {
      name: c.campaign_name, spend, impressions: Number(c.impressions || 0), reach: Number(c.reach || 0),
      clicks: Number(c.clicks || 0), ctr: Number(c.ctr || 0),
      carts: pick(c.actions, 'offsite_conversion.fb_pixel_add_to_cart') || pick(c.actions, 'add_to_cart'),
      purchases, value, roas: spend ? value / spend : 0,
    };
  });
  cache.set(id, { at: Date.now(), data: out });
  return out;
}
