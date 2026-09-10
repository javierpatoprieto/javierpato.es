import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';

// Las taxonomías /proyectos/servicio/<x> con un solo caso van con noindex
// (lo emite [service].astro). Meterlas en el sitemap sería pedirle a Google
// que rastree lo que le estamos diciendo que no indexe: en Search Console
// eso sale como "Enviada, pero marcada como noindex". Así que se calculan
// aquí a partir del frontmatter y se excluyen.
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const taxonomiasFinas = (() => {
  const cuenta = new Map();
  for (const f of readdirSync('src/content/proyectos').filter((f) => f.endsWith('.md'))) {
    const fm = readFileSync(`src/content/proyectos/${f}`, 'utf8').split(/^---\s*$/m)[1] ?? '';
    // El frontmatter usa `services: ["A", "B"]` (flow), pero admito también la
    // lista con guiones por si mañana alguien la escribe así.
    const inline = fm.match(/^services:\s*\[([^\]]*)\]/m)?.[1];
    const bloque = fm.match(/^services:\s*\n((?:[ \t]*-[ \t].*\n)+)/m)?.[1];
    const crudos = inline
      ? inline.split(',')
      : (bloque ?? '').split('\n').map((l) => l.replace(/^[ \t]*-[ \t]*/, ''));
    for (const crudo of crudos) {
      const s = slugify(crudo.trim().replace(/^["']|["']$/g, ''));
      if (s) cuenta.set(s, (cuenta.get(s) ?? 0) + 1);
    }
  }
  return [...cuenta.entries()].filter(([, n]) => n < 2).map(([s]) => `/proyectos/servicio/${s}/`);
})();

// https://astro.build
export default defineConfig({
  site: 'https://javierpato.es',
  server: { port: 4385, host: true },
  build: { inlineStylesheets: 'auto' },
  // Híbrido: las páginas siguen siendo estáticas (prerender por defecto);
  // solo los endpoints con `export const prerender = false` corren en servidor.
  output: 'hybrid',
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) => !taxonomiasFinas.some((t) => new URL(page).pathname === t),
    }),
  ],
  // 301 de las 8 landings de municipio/sector que Google no indexaba
  // (184-223 palabras, misma plantilla) a la página comarcal consolidada.
  redirects: {
    '/diseno-web-astillero': '/diseno-web-cantabria/zonas#astillero',
    '/diseno-web-camargo': '/diseno-web-cantabria/zonas#camargo',
    '/diseno-web-pielagos': '/diseno-web-cantabria/zonas#pielagos',
    '/diseno-web-reinosa': '/diseno-web-cantabria/zonas#reinosa',
    '/diseno-web-laredo': '/diseno-web-cantabria/zonas#laredo',
    '/diseno-web-castro-urdiales': '/diseno-web-cantabria/zonas#castro-urdiales',
    '/diseno-web-peluquerias-estetica-cantabria': '/diseno-web-cantabria/zonas#peluquerias-estetica',
    '/diseno-web-turismo-rural-cantabria': '/diseno-web-cantabria/zonas#turismo-rural',
  },
});
