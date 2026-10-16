import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mekie-planet.com',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/checkout'),
    }),
  ],
});
