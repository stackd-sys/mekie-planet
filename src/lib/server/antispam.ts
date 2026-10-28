/* Defesas contra bots na newsletter e no "Avisa-me quando voltar".
   Um pedido suspeito recebe a mesma resposta de sucesso (o bot não percebe que foi travado),
   mas nada é guardado e não sai nenhum email. As tentativas ficam contadas no CRM. */
import { createHash } from 'node:crypto';
import { promises as dns } from 'node:dns';
import { site } from '../../data/site';

/** pedidos por endereço de rede numa hora, antes de começar a recusar */
const PER_HOUR = 4;
/** tempo mínimo com a página aberta antes de subscrever (ms): as pessoas demoram mais a escrever o email */
const MIN_MS = 2500;

const hosts = () => {
  const main = new URL(site.url).host;
  return [main, `www.${main}`, process.env.ADMIN_HOST, process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL].filter(Boolean) as string[];
};

/** Endereço de rede reduzido a um código que muda todos os dias (não guardamos o IP) */
const ipHash = (request: Request) => {
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.headers.get('x-real-ip') || '';
  return createHash('sha256').update(`${ip}|${new Date().toISOString().slice(0, 10)}|mekie`).digest('hex').slice(0, 24);
};

/** O domínio do email recebe correio? (os bots inventam domínios) */
async function acceptsMail(email: string) {
  const domain = email.split('@')[1] || '';
  try {
    const mx = await Promise.race([dns.resolveMx(domain), new Promise<never>((_, no) => setTimeout(() => no(new Error('timeout')), 2500))]);
    return mx.length > 0;
  } catch (e) {
    /* só trava quando o domínio não existe ou não tem correio; problemas de rede deixam passar,
       para não perder uma pessoa real */
    return !['ENOTFOUND', 'ENODATA'].includes((e as NodeJS.ErrnoException).code ?? '');
  }
}

/** Gmail ignora os pontos: os bots enchem o nome de pontos para repetir o mesmo email (r.a.s.h.e.i.k.a@gmail.com) */
export const dottedGmail = (email: string) => {
  const [local, domain] = email.split('@');
  return /^(gmail|googlemail)\.com$/.test(domain || '') && (local.match(/\./g) || []).length >= 3;
};

/** Devolve o motivo para travar o pedido, ou '' se parecer uma pessoa */
export async function spamReason(sql: any, request: Request, p: URLSearchParams, email: string) {
  const hash = ipHash(request);
  const origin = request.headers.get('origin');
  let reason = '';
  if (p.get('hp')) reason = 'armadilha';
  else if (!p.has('ms') || Number(p.get('ms')) < MIN_MS) reason = 'rápido demais';
  else if (origin && ![...hosts(), request.headers.get('x-forwarded-host'), request.headers.get('host')].includes(new URL(origin).host)) reason = 'outro site';
  else if (dottedGmail(email)) reason = 'gmail com pontos';
  else {
    const [{ n }] = await sql`select count(*)::int as n from signup_attempts where ip_hash = ${hash} and at > now() - interval '1 hour'`;
    if (n >= PER_HOUR) reason = 'demasiados pedidos';
    else if (!(await acceptsMail(email))) reason = 'domínio sem email';
  }
  await sql`insert into signup_attempts (ip_hash, email_domain, blocked) values (${hash}, ${email.split('@')[1] || ''}, ${reason})`;
  /* limpeza: só guardamos 30 dias */
  if (Math.random() < 0.05) await sql`delete from signup_attempts where at < now() - interval '30 days'`;
  return reason;
}

/** Texto de bot: palavras compridas com maiúsculas soltas no meio ("LrPsyfUDsavRrCPhwvgaAob") */
export const gibberish = (s: string) =>
  s.split(/[\s·,]+/).some((w) => w.length >= 12 && !/[0-9@.]/.test(w) && (w.slice(1).match(/[A-Z]/g) || []).length >= 3);

/** NIF: português (9 algarismos) ou de outro país (letras do país e números); os bots escrevem letras ao acaso */
const validNif = (nif: string) => {
  const v = nif.replace(/[\s.-]/g, '').toUpperCase();
  return !v || /^\d{9}$/.test(v) || (/^[A-Z]{0,2}[0-9A-Z]{6,14}$/.test(v) && (v.match(/\d/g) || []).length >= 6);
};

/** encomendas por endereço de rede numa hora */
const ORDERS_PER_HOUR = 5;
/** tempo mínimo na página do checkout antes de encomendar (ms) */
const ORDER_MIN_MS = 3000;

/** Encomenda de bot? Devolve o motivo, ou '' se parecer uma pessoa. */
export async function orderSpamReason(sql: any, request: Request, body: any) {
  const hash = ipHash(request);
  const origin = request.headers.get('origin');
  const c = body?.customer ?? {};
  const texts = [c.nome, c.apelido, c.notas, c.morada, c.localidade, ...(Array.isArray(body?.lines) ? body.lines.map((l: any) => l?.custom) : [])]
    .map((x) => String(x ?? ''));
  let reason = '';
  if (body?.hp) reason = 'armadilha';
  else if (!body?.ms || Number(body.ms) < ORDER_MIN_MS) reason = 'rápido demais';
  else if (origin && ![...hosts(), request.headers.get('x-forwarded-host'), request.headers.get('host')].includes(new URL(origin).host)) reason = 'outro site';
  else if (texts.some(gibberish)) reason = 'texto ao acaso';
  else if (!validNif(String(c.nif ?? ''))) reason = 'NIF inválido';
  else {
    const [{ n }] = await sql`select count(*)::int as n from signup_attempts where ip_hash = ${hash} and blocked like 'encomenda%' and at > now() - interval '1 hour'`;
    if (n >= ORDERS_PER_HOUR) reason = 'demasiadas encomendas';
  }
  await sql`insert into signup_attempts (ip_hash, email_domain, blocked) values (${hash}, ${String(c.email ?? '').split('@')[1] || ''}, ${reason ? `encomenda: ${reason}` : 'encomenda'})`;
  return reason;
}
