import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import node from '@astrojs/node';

/* O site continua estático. Só o CRM (/admin) e a API (/api) correm no servidor.
   Na Vercel usa funções da Vercel; em local (testes) usa um servidor Node. */
const adapter = process.env.VERCEL ? vercel() : node({ mode: 'standalone' });

export default defineConfig({
  site: 'https://mekie-planet.com',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always' },
  adapter,
  /* a proteção contra pedidos de outros sites no CRM está em src/middleware.ts */
  security: { checkOrigin: false },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/404') && !page.includes('/checkout') && !page.includes('/admin') && !page.includes('/encomenda-recebida') && !page.includes('/teste-pagamento'),
    }),
  ],
});
