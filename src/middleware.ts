/* Protege o CRM: tudo em /admin precisa de sessão, menos a página de entrada. */
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  if (context.isPrerendered || !pathname.startsWith('/admin')) return next();
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
