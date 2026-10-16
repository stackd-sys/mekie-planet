/* Ligação ao webhook da newsletter (ver integrations/newsletter.gs).
   O webhook responde em JSON e é ele que sabe se um email já está inscrito
   e se já usou o código de boas-vindas. */
const ENDPOINT = document.documentElement.dataset.newsletterEndpoint || '';
export const CODE = (document.documentElement.dataset.welcomeCode || '').toUpperCase();
export const hasWebhook = () => ENDPOINT !== '';

export type Status = {
  /** new: inscrito agora; exists: já estava na lista; unknown: o webhook não respondeu em JSON */
  status: 'new' | 'exists' | 'unknown';
  subscribed?: boolean;
  /** o código de boas-vindas já foi usado numa encomenda com este email */
  used?: boolean;
};

const normalise = (email: string) => email.trim().toLowerCase();

/* Emails inscritos neste browser, para avisar logo sem esperar pelo webhook */
const LOCAL = 'mekie-newsletter-emails';
const localList = (): string[] => {
  try { return JSON.parse(localStorage.getItem(LOCAL) || '[]'); } catch { return []; }
};
export const knownLocally = (email: string) => localList().includes(normalise(email));
export const rememberLocally = (email: string) => {
  try {
    const list = new Set(localList());
    list.add(normalise(email));
    localStorage.setItem(LOCAL, JSON.stringify([...list]));
  } catch {}
};

async function call<T extends { status: string } = Status>(params: Record<string, string>): Promise<T | ({ status: 'unknown' } & Partial<T>)> {
  if (!ENDPOINT) {
    console.warn('[Mekie] Sem webhook configurado em site.newsletterWebhook: o email não foi guardado.');
    return { status: 'unknown' };
  }
  const body = new URLSearchParams(params);
  let res: Response;
  try {
    /* pedido simples (form-urlencoded, sem cabeçalhos extra), por isso não há preflight */
    res = await fetch(ENDPOINT, { method: 'POST', body });
  } catch {
    /* webhook sem CORS: o pedido chega na mesma, só não conseguimos ler a resposta */
    return { status: 'unknown' };
  }
  if (!res.ok) throw new Error(`Webhook respondeu ${res.status}`);
  try {
    const data = await res.json();
    if (data && typeof data.status === 'string') return data as T;
  } catch {}
  return { status: 'unknown' };
}

export const subscribe = (email: string, source: string) =>
  call({
    action: 'subscribe',
    email: normalise(email),
    consent: 'true',
    source,
    page: location.pathname,
    code: CODE,
    created_at: new Date().toISOString(),
  });

/** Confirma se o email pode usar o código de boas-vindas. */
export const check = (email: string) => call({ action: 'check', email: normalise(email) });

export type GiftStatus = {
  /** ok: válido com saldo; empty: sem saldo; expired: fora de prazo; invalid: não existe */
  status: 'ok' | 'empty' | 'expired' | 'invalid';
  balance?: number;
  expires?: string;
};

/** Saldo de um cartão presente. Só consulta: o saldo é descontado à mão quando a encomenda é paga. */
export const giftCheck = (code: string) => call<GiftStatus>({ action: 'gift', code: code.trim().toUpperCase() });

/** Pedido de aviso quando um tamanho ou produto esgotado voltar. */
export const notify = (email: string, product: string, size: string) =>
  call<{ status: 'new' | 'exists' }>({
    action: 'notify',
    email: normalise(email),
    product,
    size,
    page: location.pathname,
    created_at: new Date().toISOString(),
  });

/** Marca o código como usado por este email. */
export const redeem = (email: string, order: string) =>
  call({ action: 'redeem', email: normalise(email), code: CODE, order, created_at: new Date().toISOString() });
