/* Pagamentos pela Stripe (página de pagamento da Stripe, "Checkout").
   Variáveis: STRIPE_SECRET_KEY (sk_test_... ou sk_live_...) e STRIPE_WEBHOOK_SECRET (whsec_...).
   Os métodos de pagamento (MB WAY, Multibanco, cartão, Apple Pay, Google Pay) ligam-se no painel da Stripe. */
import { createHmac, timingSafeEqual } from 'node:crypto';

export const hasStripe = () => Boolean(process.env.STRIPE_SECRET_KEY);
const API = () => process.env.STRIPE_API_BASE || 'https://api.stripe.com';

/** Codifica objetos aninhados no formato que a API da Stripe espera (a[b][0][c]=...) */
function encode(obj: Record<string, unknown>, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((item, i) => (typeof item === 'object' ? encode(item as Record<string, unknown>, `${key}[${i}]`, out) : out.append(`${key}[${i}]`, String(item))));
    else if (typeof v === 'object') encode(v as Record<string, unknown>, key, out);
    else out.append(key, String(v));
  }
  return out;
}

async function call(method: 'GET' | 'POST', path: string, body?: Record<string, unknown>) {
  const res = await fetch(`${API()}/v1/${path}`, {
    method,
    headers: { Authorization: `Bearer ${(process.env.STRIPE_SECRET_KEY || '').trim()}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body ? encode(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Stripe: ${data.error?.message || res.status}`);
  return data;
}

const cents = (eur: number) => Math.round(eur * 100);

/** Cria a página de pagamento para uma encomenda já gravada no CRM. */
export async function createCheckout(o: { number: string; email: string; total: number; lines: { qty: number; name: string; color?: string; size?: string }[] }, origin: string) {
  const summary = o.lines.map((l) => `${l.qty}× ${l.name}${l.color ? ` ${l.color.split(' · ')[0]}` : ''}${l.size ? ` ${l.size}` : ''}`).join(', ');
  return call('POST', 'checkout/sessions', {
    mode: 'payment',
    locale: 'pt',
    customer_email: o.email,
    client_reference_id: o.number,
    metadata: { order: o.number },
    payment_intent_data: { metadata: { order: o.number }, description: `Encomenda ${o.number}` },
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'eur',
        unit_amount: cents(o.total),
        product_data: { name: `Encomenda ${o.number} · Mekie Planet`, description: summary.slice(0, 500) },
      },
    }],
    success_url: `${origin}/encomenda-recebida/?n=${encodeURIComponent(o.number)}&pago=1&t=${encodeURIComponent(o.total.toFixed(2))}`,
    cancel_url: `${origin}/checkout/?cancelado=${encodeURIComponent(o.number)}`,
  }) as Promise<{ id: string; url: string }>;
}

export const getSession = (id: string) => call('GET', `checkout/sessions/${encodeURIComponent(id)}?expand[]=payment_intent`);

/** Confirma a assinatura do webhook (cabeçalho Stripe-Signature) e devolve o evento. */
export function verifyWebhook(payload: string, header: string | null, toleranceSec = 300) {
  const secret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
  if (!secret || !header) throw new Error('Webhook sem assinatura');
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=') as [string, string]).filter((p) => p.length === 2));
  const t = Number(parts.t);
  const sigs = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  if (!t || !sigs.length) throw new Error('Assinatura inválida');
  if (Math.abs(Date.now() / 1000 - t) > toleranceSec) throw new Error('Assinatura fora de prazo');
  const expected = createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex');
  const ok = sigs.some((s) => s.length === expected.length && timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
  if (!ok) throw new Error('Assinatura não confere');
  return JSON.parse(payload);
}
