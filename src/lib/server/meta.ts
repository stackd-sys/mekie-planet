/* Meta (Instagram e Facebook) pela Graph API, só leitura.
   Variáveis: META_ACCESS_TOKEN (token de utilizador de sistema) e META_AD_ACCOUNT_ID (act_123... ou só o número).
   Permissões do token: ads_read (anúncios); read_insights, pages_read_engagement e pages_show_list (Página);
   instagram_basic e instagram_manage_insights (Instagram). Cada parte funciona sozinha: se faltar uma permissão,
   só essa secção mostra o aviso. */
export const hasMeta = () => Boolean(process.env.META_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID);

const API = () => `${process.env.META_API_BASE || 'https://graph.facebook.com'}/${process.env.META_API_VERSION || 'v23.0'}`;
const account = () => (process.env.META_AD_ACCOUNT_ID || '').trim().replace(/^(?!act_)/, 'act_');

async function graph(path: string, params: Record<string, string> = {}, token = process.env.META_ACCESS_TOKEN || '') {
  const qs = new URLSearchParams({ ...params, access_token: token.trim() });
  const res = await fetch(`${API()}/${path}${path.includes('?') ? '&' : '?'}${qs}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(data.error?.message || `Meta respondeu ${res.status}`);
  return data;
}
/** Segue a paginação até `max` registos */
async function graphAll(path: string, params: Record<string, string>, max = 200, token?: string) {
  const out: any[] = [];
  let data = await graph(path, params, token);
  out.push(...(data.data ?? []));
  while (data.paging?.next && out.length < max) {
    const res = await fetch(data.paging.next);
    data = await res.json();
    if (data.error) break;
    out.push(...(data.data ?? []));
  }
  return out.slice(0, max);
}

const cache = new Map<string, { at: number; data: any }>();
async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 600_000) return hit.data as T;
  const data = await fn();
  cache.set(key, { at: Date.now(), data });
  return data;
}
const settle = async <T>(p: Promise<T>): Promise<{ ok: true; data: T } | { ok: false; error: string }> => {
  try { return { ok: true, data: await p }; } catch (e) { return { ok: false, error: (e as Error).message }; }
};

const day = (d: Date) => d.toISOString().slice(0, 10);
const span = (days: number) => ({ since: day(new Date(Date.now() - (days - 1) * 86400000)), until: day(new Date()) });

/* ---------- Anúncios ---------- */

/** Primeiro tipo de ação que existir (o Pixel e a Meta usam nomes diferentes para a mesma coisa) */
const act = (list: any[] | undefined, ...types: string[]) => {
  for (const t of types) {
    const v = list?.find((a) => a.action_type === t)?.value;
    if (v !== undefined) return Number(v);
  }
  return 0;
};
const PURCHASE = ['offsite_conversion.fb_pixel_purchase', 'omni_purchase', 'purchase'];
const CART = ['offsite_conversion.fb_pixel_add_to_cart', 'omni_add_to_cart', 'add_to_cart'];
const CHECKOUT = ['offsite_conversion.fb_pixel_initiate_checkout', 'omni_initiated_checkout', 'initiate_checkout'];
const VIEW = ['offsite_conversion.fb_pixel_view_content', 'omni_view_content', 'view_content'];
const LEAD = ['offsite_conversion.fb_pixel_lead', 'lead', 'offsite_conversion.fb_pixel_complete_registration'];

const METRICS = 'spend,impressions,reach,frequency,clicks,inline_link_clicks,ctr,inline_link_click_ctr,cpc,cpm,actions,action_values';

/** Converte uma linha de estatísticas da Meta em números com nomes claros */
function shape(r: any) {
  const spend = Number(r.spend || 0);
  const purchases = act(r.actions, ...PURCHASE);
  const value = act(r.action_values, ...PURCHASE);
  const linkClicks = Number(r.inline_link_clicks || 0);
  return {
    spend, purchases, value,
    impressions: Number(r.impressions || 0),
    reach: Number(r.reach || 0),
    frequency: Number(r.frequency || 0),
    clicks: Number(r.clicks || 0),
    linkClicks,
    ctr: Number(r.inline_link_click_ctr || r.ctr || 0),
    cpc: linkClicks ? spend / linkClicks : 0,
    cpm: Number(r.cpm || 0),
    landing: act(r.actions, 'landing_page_view', 'omni_landing_page_view'),
    views: act(r.actions, ...VIEW),
    carts: act(r.actions, ...CART),
    checkouts: act(r.actions, ...CHECKOUT),
    leads: act(r.actions, ...LEAD),
    engagement: act(r.actions, 'post_engagement', 'page_engagement'),
    videoViews: act(r.actions, 'video_view'),
    roas: spend ? value / spend : 0,
    cpa: purchases ? spend / purchases : 0,
  };
}
export type AdStats = ReturnType<typeof shape>;

const insights = (params: Record<string, string>, days: number) =>
  graphAll(`${account()}/insights`, { fields: METRICS, time_range: JSON.stringify(span(days)), limit: '200', ...params });

export async function metaAds(days: number) {
  return cached(`ads:${days}`, async () => {
    const [total, daily, campaigns, campaignInfo, ads, age, platform, country, device] = await Promise.all([
      insights({}, days),
      insights({ time_increment: '1', fields: 'spend,impressions,inline_link_clicks,actions,action_values' }, days),
      insights({ level: 'campaign', fields: `campaign_id,campaign_name,${METRICS}` }, days),
      settle(graphAll(`${account()}/campaigns`, { fields: 'id,name,effective_status,objective,daily_budget,lifetime_budget,start_time,stop_time', limit: '100' })),
      settle(insights({ level: 'ad', fields: `ad_id,ad_name,campaign_name,${METRICS}`, sort: 'spend_descending', limit: '12' }, days)),
      settle(insights({ breakdowns: 'age,gender' }, days)),
      settle(insights({ breakdowns: 'publisher_platform,platform_position' }, days)),
      settle(insights({ breakdowns: 'country' }, days)),
      settle(insights({ breakdowns: 'impression_device' }, days)),
    ]);
    const info = new Map((campaignInfo.ok ? campaignInfo.data : []).map((c: any) => [c.id, c]));

    /* miniaturas dos anúncios com mais gasto */
    const topAds = ads.ok ? ads.data.slice(0, 12) : [];
    let thumbs: Record<string, string> = {};
    if (topAds.length) {
      const t = await settle(graph('', { ids: topAds.map((a: any) => a.ad_id).join(','), fields: 'creative{thumbnail_url,image_url}' }));
      if (t.ok) thumbs = Object.fromEntries(Object.entries(t.data).map(([id, a]: [string, any]) => [id, a.creative?.image_url || a.creative?.thumbnail_url || '']));
    }
    const rows = (r: { ok: boolean; data?: any[] }) => (r.ok ? r.data! : []);
    return {
      total: shape(total[0] ?? {}),
      daily: daily.map((d: any) => ({ date: d.date_start, ...shape(d) })),
      campaigns: campaigns.map((c: any) => ({ id: c.campaign_id, name: c.campaign_name, status: info.get(c.campaign_id)?.effective_status ?? '', objective: info.get(c.campaign_id)?.objective ?? '', ...shape(c) }))
        .sort((a: any, b: any) => b.spend - a.spend),
      active: (campaignInfo.ok ? campaignInfo.data : []).filter((c: any) => c.effective_status === 'ACTIVE').length,
      ads: topAds.map((a: any) => ({ id: a.ad_id, name: a.ad_name, campaign: a.campaign_name, thumb: thumbs[a.ad_id] || '', ...shape(a) })),
      age: rows(age).map((r: any) => ({ age: r.age, gender: r.gender, ...shape(r) })),
      platform: rows(platform).map((r: any) => ({ platform: r.publisher_platform, position: r.platform_position, ...shape(r) })),
      country: rows(country).map((r: any) => ({ country: r.country, ...shape(r) })),
      device: rows(device).map((r: any) => ({ device: r.impression_device, ...shape(r) })),
    };
  });
}

/* ---------- Página do Facebook e Instagram (orgânico) ---------- */

async function pageInsight(pageId: string, token: string, metric: string, days: number) {
  const d = await graph(`${pageId}/insights`, { metric, period: 'day', ...span(days) }, token);
  const values = d.data?.[0]?.values ?? [];
  return values.reduce((n: number, v: any) => n + (typeof v.value === 'number' ? v.value : 0), 0);
}

export async function metaPage(days: number) {
  return cached(`page:${days}`, async () => {
    const pages = await graph('me/accounts', { fields: 'id,name,access_token,fan_count,followers_count,link,picture{url}', limit: '10' });
    const page = pages.data?.[0];
    if (!page) throw new Error('O utilizador de sistema não tem nenhuma Página atribuída.');
    const token = page.access_token;
    /* as métricas da Meta mudam com frequência: cada uma é pedida à parte e as que falharem ficam de fora */
    const metricNames = ['page_impressions_unique', 'page_post_engagements', 'page_views_total', 'page_follows', 'page_daily_follows_unique'];
    const metrics = await Promise.all(metricNames.map((m) => settle(pageInsight(page.id, token, m, days))));
    const m = Object.fromEntries(metricNames.map((n, i) => [n, metrics[i].ok ? (metrics[i] as any).data : null]));
    const posts = await settle(graph(`${page.id}/posts`, {
      fields: 'message,created_time,permalink_url,full_picture,shares,reactions.summary(total_count).limit(0),comments.summary(total_count).limit(0)',
      limit: '10',
    }, token));
    return {
      id: page.id, name: page.name, link: page.link, picture: page.picture?.data?.url ?? '',
      fans: Number(page.fan_count || 0), followers: Number(page.followers_count || 0),
      reach: m.page_impressions_unique, engagement: m.page_post_engagements, views: m.page_views_total, newFollows: m.page_daily_follows_unique ?? m.page_follows,
      posts: posts.ok ? (posts.data.data ?? []).map((p: any) => ({
        text: p.message ?? '', date: p.created_time, link: p.permalink_url, image: p.full_picture ?? '',
        reactions: p.reactions?.summary?.total_count ?? 0, comments: p.comments?.summary?.total_count ?? 0, shares: p.shares?.count ?? 0,
      })) : [],
      postsError: posts.ok ? '' : posts.error,
      pageToken: token,
    };
  });
}

export async function metaInstagram(days: number) {
  return cached(`ig:${days}`, async () => {
    const page = await metaPage(days);
    const p = await graph(page.id, { fields: 'instagram_business_account{id,username,name,followers_count,follows_count,media_count,profile_picture_url,biography}' }, page.pageToken);
    const ig = p.instagram_business_account;
    if (!ig) throw new Error('A Página não tem uma conta de Instagram profissional ligada, ou falta a permissão instagram_basic.');
    /* totais do período (as métricas de conta só aceitam até 30 dias de cada vez) */
    const s = span(Math.min(days, 30));
    const since = String(Math.floor(Date.parse(s.since) / 1000)), until = String(Math.floor(Date.now() / 1000));
    const metricNames = ['reach', 'views', 'profile_views', 'accounts_engaged', 'total_interactions', 'website_clicks', 'follows_and_unfollows'];
    const metrics = await Promise.all(metricNames.map((m) => settle(graph(`${ig.id}/insights`, { metric: m, period: 'day', metric_type: 'total_value', since, until }, page.pageToken))));
    const val = (i: number) => {
      const r = metrics[i];
      if (!r.ok) return null;
      const t = (r.data as any).data?.[0]?.total_value;
      return t?.value ?? (t?.breakdowns?.[0]?.results ?? []).reduce((n: number, x: any) => n + Number(x.value || 0), 0) ?? null;
    };
    const media = await settle(graph(`${ig.id}/media`, {
      fields: 'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
      limit: '12',
    }, page.pageToken));
    const list = media.ok ? (media.data.data ?? []) : [];
    /* alcance e guardados de cada publicação (pode falhar em publicações antigas) */
    const per = await Promise.all(list.map((x: any) => settle(graph(`${x.id}/insights`, { metric: 'reach,saved,shares,views' }, page.pageToken))));
    return {
      username: ig.username, name: ig.name, picture: ig.profile_picture_url ?? '', bio: ig.biography ?? '',
      followers: Number(ig.followers_count || 0), follows: Number(ig.follows_count || 0), mediaCount: Number(ig.media_count || 0),
      periodDays: Math.min(days, 30),
      reach: val(0), views: val(1), profileViews: val(2), engaged: val(3), interactions: val(4), websiteClicks: val(5),
      media: list.map((x: any, i: number) => {
        const ins = per[i].ok ? Object.fromEntries(((per[i] as any).data.data ?? []).map((d: any) => [d.name, d.values?.[0]?.value ?? 0])) : {};
        return {
          type: x.media_product_type === 'REELS' ? 'Reel' : x.media_type === 'CAROUSEL_ALBUM' ? 'Carrossel' : x.media_type === 'VIDEO' ? 'Vídeo' : 'Foto',
          caption: x.caption ?? '', image: x.thumbnail_url || x.media_url || '', link: x.permalink, date: x.timestamp,
          likes: Number(x.like_count || 0), comments: Number(x.comments_count || 0),
          reach: ins.reach ?? null, saved: ins.saved ?? null, shares: ins.shares ?? null, views: ins.views ?? null,
        };
      }),
    };
  });
}

/** Resumo para o Painel (só campanhas) */
export async function metaCampaigns(days: number) {
  return (await metaAds(days)).campaigns;
}
