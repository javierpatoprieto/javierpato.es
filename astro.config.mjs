import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build
export default defineConfig({
  site: 'https://javierpato.es',
  server: { port: 4385, host: true },
  build: { inlineStylesheets: 'auto' },
  // Híbrido: las páginas siguen siendo estáticas (prerender por defecto);
  // solo los endpoints con `export const prerender = false` corren en servidor.
  output: 'hybrid',
  adapter: vercel(),
  integrations: [sitemap()],
});
