/* Consentimento de cookies e medição (Google Analytics 4 e Meta Pixel).
   Nada de estatísticas ou publicidade é carregado antes de a pessoa aceitar. */

type Choice = { analytics: boolean; marketing: boolean; at: string; v: number };

const KEY = 'mekie-consent';
const VERSION = 1;
const root = document.documentElement;
const GA4 = root.dataset.ga4 || '';
const PIXEL = root.dataset.pixel || '';
export const trackingEnabled = Boolean(GA4 || PIXEL);

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { callMethod?: Function; queue?: unknown[]; loaded?: boolean; version?: string; push?: unknown };
    _fbq?: unknown;
  }
}

export function getChoice(): Choice | null {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || 'null') as Choice | null;
    /* a escolha vale 6 meses; depois voltamos a perguntar */
    const fresh = c && Date.now() - Date.parse(c.at) < 182 * 24 * 3600 * 1000;
    return c && c.v === VERSION && fresh ? c : null;
  } catch {
    return null;
  }
}

function load(src: string) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

let gaLoaded = false;
let pixelLoaded = false;

/* Origem da visita (utm_* dos links com etiqueta), para o CRM saber que campanha trouxe cada venda.
   Só com consentimento de estatísticas. Fica a primeira origem durante 30 dias. */
const UTM_KEY = 'mekie-utm';
function rememberVisit() {
  try {
    const q = new URLSearchParams(location.search);
    const utm = Object.fromEntries(['source', 'medium', 'campaign', 'content', 'term'].map((k) => [k, q.get(`utm_${k}`) || '']).filter(([, v]) => v));
    const ref = document.referrer && new URL(document.referrer).host !== location.host ? new URL(document.referrer).host : '';
    if (!Object.keys(utm).length && !ref) return;
    const prev = JSON.parse(localStorage.getItem(UTM_KEY) || 'null');
    if (prev && Date.now() - Date.parse(prev.at) < 30 * 86400000) return;
    localStorage.setItem(UTM_KEY, JSON.stringify({ ...utm, ...(ref ? { ref } : {}), landing: location.pathname, at: new Date().toISOString() }));
  } catch {}
}
/** Origem guardada (ou null), para juntar à encomenda */
export function visitSource() {
  try {
    const v = JSON.parse(localStorage.getItem(UTM_KEY) || 'null');
    return v && getChoice()?.analytics && Date.now() - Date.parse(v.at) < 30 * 86400000 ? v : null;
  } catch {
    return null;
  }
}

function apply(c: Choice) {
  if (c.analytics) rememberVisit();
  if (GA4 && c.analytics && !gaLoaded) {
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied',
    });
    window.gtag('js', new Date());
    window.gtag('config', GA4, { anonymize_ip: true });
    load(`https://www.googletagmanager.com/gtag/js?id=${GA4}`);
  }
  if (PIXEL && c.marketing && !pixelLoaded) {
    pixelLoaded = true;
    const f = function (...args: unknown[]) {
      f.callMethod ? f.callMethod(...args) : f.queue!.push(args);
    } as NonNullable<Window['fbq']>;
    f.push = f;
    f.loaded = true;
    f.version = '2.0';
    f.queue = [];
    window.fbq = window._fbq = f;
    load('https://connect.facebook.net/en_US/fbevents.js');
    f('init', PIXEL);
    f('track', 'PageView');
  }
}

export function setChoice(analytics: boolean, marketing: boolean) {
  const prev = getChoice();
  const c: Choice = { analytics, marketing, at: new Date().toISOString(), v: VERSION };
  try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
  if (!analytics) try { localStorage.removeItem(UTM_KEY); } catch {}
  /* retirar um consentimento já dado só tem efeito com a página limpa */
  if (prev && ((prev.analytics && !analytics) || (prev.marketing && !marketing))) {
    location.reload();
    return;
  }
  apply(c);
  document.dispatchEvent(new CustomEvent('mekie:consent'));
}

/* ---------- Contagem anónima (sem cookies, para toda a gente) ---------- */
const consentState = () => {
  const c = getChoice();
  return !c ? 'sem' : c.analytics ? 'sim' : 'nao';
};
function beacon(data: Record<string, string>) {
  try {
    const body = JSON.stringify({ ...data, c: consentState() });
    if (!navigator.sendBeacon?.('/api/stats/', new Blob([body], { type: 'application/json' })))
      fetch('/api/stats/', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {});
  } catch {}
}
{
  let ref = '';
  try { ref = document.referrer ? new URL(document.referrer).host : ''; } catch {}
  beacon({ t: 'pageview', p: location.pathname, r: ref, u: new URLSearchParams(location.search).get('utm_source') || '' });
}

/** Conta já o evento na contagem anónima, quando o envio para o Analytics fica à espera da resposta aos cookies */
const preCounted = new Set<string>();
export function countEvent(event: string) {
  preCounted.add(event);
  beacon({ t: 'event', e: event });
}

/* ---------- Eventos de comércio ---------- */
export type TrackItem = { id: number | string; name: string; price: number; qty?: number; variant?: string; category?: string };

const gaItems = (items: TrackItem[]) =>
  items.map((i) => ({ item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.qty ?? 1, item_variant: i.variant, item_category: i.category }));
const value = (items: TrackItem[]) => Math.round(items.reduce((n, i) => n + i.price * (i.qty ?? 1), 0) * 100) / 100;

const PIXEL_EVENT: Record<string, string> = {
  view_item: 'ViewContent',
  add_to_cart: 'AddToCart',
  begin_checkout: 'InitiateCheckout',
  purchase: 'Purchase',
  sign_up: 'Lead',
};

export function track(event: 'view_item' | 'add_to_cart' | 'begin_checkout' | 'purchase' | 'sign_up', items: TrackItem[] = [], extra: Record<string, unknown> = {}) {
  if (preCounted.has(event)) preCounted.delete(event);
  else beacon({ t: 'event', e: event });
  if (!trackingEnabled) return;
  const v = value(items);
  window.gtag?.('event', event, items.length ? { currency: 'EUR', value: v, items: gaItems(items), ...extra } : extra);
  window.fbq?.(
    'track',
    PIXEL_EVENT[event],
    items.length
      ? { currency: 'EUR', value: v, content_type: 'product', content_ids: items.map((i) => String(i.id)), contents: items.map((i) => ({ id: String(i.id), quantity: i.qty ?? 1 })), num_items: items.reduce((n, i) => n + (i.qty ?? 1), 0) }
      : 'value' in extra ? { currency: 'EUR', value: extra.value } : {},
  );
}

/* ---------- Aviso de cookies ---------- */
function initBanner() {
  const banner = document.querySelector<HTMLElement>('[data-consent]');
  if (!banner) return;
  const prefs = banner.querySelector<HTMLElement>('[data-consent-prefs]');
  const boxA = banner.querySelector<HTMLInputElement>('[name=consent-analytics]');
  const boxM = banner.querySelector<HTMLInputElement>('[name=consent-marketing]');

  const open = (withPrefs: boolean) => {
    const c = getChoice();
    if (boxA) boxA.checked = !!c?.analytics;
    if (boxM) boxM.checked = !!c?.marketing;
    if (prefs) prefs.hidden = !withPrefs;
    banner.hidden = false;
  };
  const done = (a: boolean, m: boolean) => {
    banner.hidden = true;
    setChoice(a, m);
  };

  banner.querySelector('[data-consent-all]')?.addEventListener('click', () => done(true, true));
  banner.querySelector('[data-consent-none]')?.addEventListener('click', () => done(false, false));
  banner.querySelector('[data-consent-save]')?.addEventListener('click', () => done(!!boxA?.checked, !!boxM?.checked));
  banner.querySelector('[data-consent-custom]')?.addEventListener('click', () => { if (prefs) prefs.hidden = !prefs.hidden; });
  document.querySelectorAll('[data-consent-open]').forEach((b) =>
    b.addEventListener('click', (e) => { e.preventDefault(); open(true); }),
  );

  if (!getChoice()) open(false);
}

if (trackingEnabled) {
  const c = getChoice();
  if (c) apply(c);
  initBanner();
}

/** true quando já não há aviso de cookies por responder */
export const consentSettled = () => !trackingEnabled || getChoice() !== null;
