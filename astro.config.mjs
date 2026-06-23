import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build
export default defineConfig({
  site: 'https://javierpato.es',
  server: { port: 4385, host: true },
  build: { inlineStylesheets: 'auto' },
  integrations: [sitemap()],
});
