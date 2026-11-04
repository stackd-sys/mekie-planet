/* Nomes simples para a origem das visitas e das vendas (utm_source ou o site de onde vieram). */
const NAMES: [RegExp, string][] = [
  [/^(fb|facebook|m\.facebook\.com|l\.facebook\.com|lm\.facebook\.com|facebook\.com)$/i, 'Facebook'],
  [/^(ig|instagram|l\.instagram\.com|instagram\.com)$/i, 'Instagram'],
  [/^(an|audience_network)$/i, 'Meta (outras apps)'],
  [/^(msg|messenger)$/i, 'Messenger'],
  [/^(threads|threads\.net)$/i, 'Threads'],
  [/^(google|www\.google\.[a-z.]+|google\.[a-z.]+)$/i, 'Google'],
  [/^(tiktok|tiktok\.com)$/i, 'TikTok'],
  [/^newsletter$/i, 'Newsletter'],
  [/^(bing|bing\.com)$/i, 'Bing'],
  [/^(direto|direct)$/i, 'Direto ou sem cookies'],
];
export const sourceName = (s: string | null | undefined) => {
  const v = String(s ?? '').trim();
  if (!v) return 'Direto ou sem cookies';
  return NAMES.find(([re]) => re.test(v))?.[1] ?? v;
};
/* tipo de tráfego pelo utm_medium */
export const mediumName = (m: string | null | undefined) => {
  const v = String(m ?? '').toLowerCase();
  if (!v) return '';
  if (/^(cpc|ppc|paid|paid_social|paidsocial|ads?)$/.test(v)) return 'Anúncio';
  if (/^(email|newsletter)$/.test(v)) return 'Email';
  if (/^(social|organic_social|bio|story|stories|post)$/.test(v)) return 'Redes (sem pagar)';
  if (/^(influencer|parceria|affiliate)$/.test(v)) return 'Parceria';
  return v;
};
