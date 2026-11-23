import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import node from '@astrojs/node';

/* O site continua estático. Só o CRM (/admin) e a API (/api) correm no servidor.
   Na Vercel usa funções da Vercel; em local (testes) usa um servidor Node. */
const adapter = process.env.VERCEL ? vercel() : node({ mode: 'standalone' });

/* IndexNow: no fim de cada deploy em produção, avisa o Bing (e o Yandex, Naver, Seznam) das páginas do site.
   O Bing alimenta a pesquisa do ChatGPT e do Copilot, por isso é importante que veja as mudanças depressa.
   A chave é pública por desenho: o ficheiro /7d3755918f5411ad3d0b877f6bfd9d28.txt prova que o site é nosso. Se o aviso falhar, o deploy continua. */
const INDEXNOW_KEY = '7d3755918f5411ad3d0b877f6bfd9d28';
const indexNow = () => ({
  name: 'mekie-indexnow',
  hooks: {
    'astro:build:done': async ({ pages, logger }) => {
      if (process.env.VERCEL_ENV !== 'production') return;
      const skip = ['admin', 'api', 'checkout', 'encomenda-recebida', 'order-received', 'pedido-recibido', 'newsletter', '404', 'teste-landing'];
      const urlList = pages.map((p) => `https://mekie-planet.com/${p.pathname}`).filter((u) => !skip.some((s) => u.includes(s))).slice(0, 9000);
      try {
        const res = await fetch('https://api.indexnow.org/indexnow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({ host: 'mekie-planet.com', key: INDEXNOW_KEY, keyLocation: `https://mekie-planet.com/${INDEXNOW_KEY}.txt`, urlList }),
          signal: AbortSignal.timeout(10000),
        });
        logger.info(`IndexNow: ${urlList.length} páginas enviadas (resposta ${res.status})`);
      } catch (e) {
        logger.warn(`IndexNow falhou (o deploy continua): ${e.message}`);
      }
    },
  },
});

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
        !['/404', '/checkout', '/admin', '/encomenda-recebida', '/order-received', '/pedido-recibido', '/newsletter/', '/teste-landing'].some((p) => page.includes(p)),
    }),
    indexNow(),
  ],
});
