/* Entrada no CRM: link por email (sem palavra-passe), só para os emails em ADMIN_EMAILS. */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';
import { db } from './db';
import { sendMail, layout, escapeHtml } from './mail';
import { site } from '../../data/site';

export const COOKIE = 'mekie_admin';
const SESSION_DAYS = 30;
const TOKEN_MINUTES = 20;

const hash = (s: string) => createHash('sha256').update(s).digest('hex');
const admins = () =>
  (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
export const isAdminEmail = (email: string) => admins().includes(email.trim().toLowerCase());

/** Pede um link de entrada. Responde sempre igual, para não revelar que emails têm acesso. */
export async function requestLogin(email: string, origin: string) {
  email = email.trim().toLowerCase();
  if (!isAdminEmail(email)) return;
  const sql = await db();
  const [{ n }] = await sql<{ n: number }[]>`
    select count(*)::int as n from admin_tokens where email = ${email} and created_at > now() - interval '15 minutes'`;
  if (n >= 5) return;
  const token = randomBytes(32).toString('base64url');
  await sql`insert into admin_tokens (hash, email, expires_at) values (${hash(token)}, ${email}, now() + ${TOKEN_MINUTES + ' minutes'}::interval)`;
  const link = `${origin}/admin/entrar/?t=${token}`;
  const sent = await sendMail(
    email,
    'Entrar no CRM da Mekie',
    layout('Entrar no CRM', `<p>Carrega no botão para entrar. O link funciona uma vez, durante ${TOKEN_MINUTES} minutos.</p>
      <p><a href="${escapeHtml(link)}" style="display:inline-block;background:#1f1f1f;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none">Entrar no CRM</a></p>
      <p style="font-size:13px;color:#5c5c5c">Se não foste tu a pedir, ignora este email.</p>`),
  );
  /* sem email configurado, o link aparece no registo do servidor (útil em testes) */
  if (!sent) console.warn(`[Mekie] Link de entrada para ${email}: ${link}`);
}

/** Troca um link válido por uma sessão. Devolve o email ou null. */
export async function consumeToken(token: string, cookies: AstroCookies) {
  if (!token) return null;
  const sql = await db();
  const rows = await sql<{ email: string }[]>`
    update admin_tokens set used_at = now()
    where hash = ${hash(token)} and used_at is null and expires_at > now()
    returning email`;
  const email = rows[0]?.email;
  if (!email || !isAdminEmail(email)) return null;
  await startSession(email, cookies);
  return email;
}

async function startSession(email: string, cookies: AstroCookies) {
  const sql = await db();
  const session = randomBytes(32).toString('base64url');
  await sql`insert into admin_sessions (hash, email, expires_at) values (${hash(session)}, ${email}, now() + ${SESSION_DAYS + ' days'}::interval)`;
  cookies.set(COOKIE, session, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: !/localhost|127\.0\.0\.1/.test(site.url) && process.env.NODE_ENV === 'production',
    maxAge: SESSION_DAYS * 86400,
  });
}

/** Alternativa enquanto o email não está configurado: ADMIN_PASSWORD na Vercel. */
export async function passwordLogin(email: string, password: string, cookies: AstroCookies) {
  const expected = process.env.ADMIN_PASSWORD || '';
  email = email.trim().toLowerCase();
  if (!expected || expected.length < 12 || !isAdminEmail(email)) return false;
  const a = Buffer.from(hash(password)), b = Buffer.from(hash(expected));
  if (!timingSafeEqual(a, b)) return false;
  await startSession(email, cookies);
  return true;
}

export async function currentAdmin(cookies: AstroCookies) {
  const session = cookies.get(COOKIE)?.value;
  if (!session) return null;
  const sql = await db();
  const rows = await sql<{ email: string }[]>`
    select email from admin_sessions where hash = ${hash(session)} and expires_at > now()`;
  const email = rows[0]?.email;
  return email && isAdminEmail(email) ? email : null;
}

export async function logout(cookies: AstroCookies) {
  const session = cookies.get(COOKIE)?.value;
  if (session) await (await db())`delete from admin_sessions where hash = ${hash(session)}`;
  cookies.delete(COOKIE, { path: '/' });
}
