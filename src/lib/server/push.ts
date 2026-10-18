/* Notificações da app do CRM (Web Push). As chaves VAPID são criadas sozinhas e ficam na base de dados,
   por isso não há nada para configurar na Vercel. Cada aparelho escolhe que avisos quer receber. */
import webpush from 'web-push';
import { db } from './db';
import { site } from '../../data/site';

/** Tipos de aviso, com o valor por defeito quando se liga um aparelho */
export const KINDS = {
  paga: { label: 'Encomenda paga', hint: 'Quando um cliente paga uma encomenda.', on: true },
  nova: { label: 'Encomenda criada, por pagar', hint: 'Quando alguém chega à página de pagamento. Muitas acabam por não ser pagas.', on: false },
  reembolso: { label: 'Reembolso', hint: 'Quando é feito um reembolso, no CRM ou na Stripe.', on: true },
  stock: { label: 'Stock a acabar', hint: 'Quando uma peça fica com 1 unidade ou esgota depois de uma venda.', on: true },
  newsletter: { label: 'Nova subscrição da newsletter', hint: 'Quando alguém subscreve.', on: false },
  aviso: { label: 'Pedido de "Avisa-me quando voltar"', hint: 'Quando alguém pede aviso de uma peça esgotada.', on: false },
} as const;
export type Kind = keyof typeof KINDS;
export const defaultPrefs = () => Object.fromEntries(Object.entries(KINDS).map(([k, v]) => [k, v.on])) as Record<Kind, boolean>;

let keys: { publicKey: string; privateKey: string } | null = null;

/** Chaves VAPID: as da Vercel (VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY), se existirem, ou as criadas pelo CRM */
export async function vapid() {
  if (keys) return keys;
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    keys = { publicKey: process.env.VAPID_PUBLIC_KEY.trim(), privateKey: process.env.VAPID_PRIVATE_KEY.trim() };
    return keys;
  }
  const sql = await db();
  const [row] = await sql<any[]>`select value from settings where key = 'vapid'`;
  if (row) return (keys = row.value);
  const fresh = webpush.generateVAPIDKeys();
  await sql`insert into settings (key, value) values ('vapid', ${sql.json(fresh)}) on conflict (key) do nothing`;
  const [saved] = await sql<any[]>`select value from settings where key = 'vapid'`;
  return (keys = saved.value);
}

/** Envia a um aparelho. Devolve false se falhar; apaga o aparelho se já não aceitar avisos. */
export async function sendOne(endpoint: string, title: string, body: string, url = '/admin/', tag = `mekie-${Date.now()}`, urgent = false) {
  const sql = await db();
  const [s] = await sql<any[]>`select * from push_subs where endpoint = ${endpoint}`;
  if (!s) return false;
  const k = await vapid();
  try {
    await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, JSON.stringify({ title, body, url, tag }), {
      vapidDetails: { subject: `mailto:${site.email}`, publicKey: k.publicKey, privateKey: k.privateKey },
      TTL: 60 * 60 * 24,
      urgency: urgent ? 'high' : 'normal',
    });
    await sql`update push_subs set last_ok = now() where endpoint = ${s.endpoint}`;
    return true;
  } catch (e: any) {
    /* aparelho que já não aceita avisos (app apagada, permissão retirada) */
    if (e?.statusCode === 404 || e?.statusCode === 410) await sql`delete from push_subs where endpoint = ${s.endpoint}`;
    else console.error('[Mekie] Notificação falhou:', e?.statusCode, e?.body || e?.message);
    return false;
  }
}

/** Envia um aviso a todos os aparelhos que o querem receber. Nunca falha: um aviso perdido não pode estragar uma encomenda. */
export async function pushNotify(kind: Kind, title: string, body: string, url = '/admin/') {
  try {
    const sql = await db();
    const subs = await sql<any[]>`select endpoint from push_subs where coalesce((prefs->>${kind})::boolean, ${KINDS[kind].on})`;
    const tag = `${kind}-${Date.now()}`;
    const res = await Promise.all(subs.map((s) => sendOne(s.endpoint, title, body, url, tag, kind === 'paga')));
    return res.filter(Boolean).length;
  } catch (e) {
    console.error('[Mekie] Notificações indisponíveis:', (e as Error).message);
    return 0;
  }
}
