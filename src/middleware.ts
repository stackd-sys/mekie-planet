/* Protege o CRM: tudo em /admin precisa de sessão, menos a página de entrada. */
import { defineMiddleware } from 'astro:middleware';
import { site } from './data/site';

/* Com ADMIN_HOST (ex.: app.mekie-planet.com), o CRM vive nesse subdomínio e o /admin do site principal reencaminha para lá.
   O resto do subdomínio (página inicial, loja) é tratado em vercel.json. */
const mainHosts = [new URL(site.url).host, `www.${new URL(site.url).host}`];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  if (context.isPrerendered || !pathname.startsWith('/admin')) return next();
  const adminHost = process.env.ADMIN_HOST;
  const reqHost = context.request.headers.get('x-forwarded-host') || context.request.headers.get('host') || '';
  if (adminHost && mainHosts.includes(reqHost)) return context.redirect(`https://${adminHost}${pathname}${context.url.search}`, 308);
  /* formulários do CRM só aceites a partir do próprio site */
  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    const origin = context.request.headers.get('origin');
    const host = context.request.headers.get('x-forwarded-host') || context.request.headers.get('host');
    if (!origin || !host || new URL(origin).host !== host) return new Response('Pedido recusado.', { status: 403 });
  }
  if (pathname.startsWith('/admin/entrar')) return next();
  const { currentAdmin } = await import('./lib/server/auth');
  let email: string | null = null;
  try {
    email = await currentAdmin(context.cookies);
  } catch (e) {
    console.error('[Mekie] CRM sem base de dados:', (e as Error).message);
    return new Response('O CRM ainda não tem base de dados configurada. Vê o README, em "CRM".', { status: 503 });
  }
  if (!email) return context.redirect('/admin/entrar/');
  context.locals.admin = email;
  const res = await next();
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
});
