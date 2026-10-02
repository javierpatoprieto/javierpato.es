import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
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


// lastmod real por URL: fecha del último commit que tocó el fichero fuente de
// la página (contenido .md o .astro). En los posts cuenta también
// updatedDate/pubDate del frontmatter. Si no hay historial git (o el fichero
// no está commiteado), se cae a la fecha del build.
const buildDate = new Date();
const gitDate = (...files) => {
  const fechas = files
    .filter((f) => existsSync(f))
    .map((f) => {
      try {
        const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', f], { encoding: 'utf8' }).trim();
        return out ? new Date(out) : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  return fechas.length ? new Date(Math.max(...fechas)) : null;
};
const fmDate = (file, key) => {
  if (!existsSync(file)) return null;
  const v = readFileSync(file, 'utf8').match(new RegExp(`^${key}:\\s*["']?([0-9]{4}-[0-9]{2}-[0-9]{2})`, 'm'))?.[1];
  return v ? new Date(`${v}T12:00:00+02:00`) : null;
};
const md = (dir) => readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => `${dir}/${f}`);
const max = (...ds) => {
  const ok = ds.filter(Boolean);
  return ok.length ? new Date(Math.max(...ok)) : null;
};
const lastmodFor = (pathname) => {
  const seg = pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
  if (seg.length === 0) return gitDate('src/pages/index.astro', ...readdirSync('src/components').map((f) => `src/components/${f}`));
  if (seg[0] === 'blog' && seg.length === 1) return gitDate('src/pages/blog/index.astro', ...md('src/content/blog'));
  if (seg[0] === 'blog') {
    const f = `src/content/blog/${seg[1]}.md`;
    return max(gitDate(f), fmDate(f, 'updatedDate'), fmDate(f, 'pubDate'));
  }
  if (seg[0] === 'proyectos' && seg.length === 1) return gitDate('src/pages/proyectos.astro', ...md('src/content/proyectos'));
  if (seg[0] === 'proyectos' && seg[1] === 'servicio') return gitDate('src/pages/proyectos/servicio/[service].astro', ...md('src/content/proyectos'));
  if (seg[0] === 'proyectos') return gitDate(`src/content/proyectos/${seg[1]}.md`);
  const page = `src/pages/${seg.join('/')}.astro`;
  if (existsSync(page)) return gitDate(page);
  return gitDate(`src/content/landings/${seg[0]}.md`);
};

// https://astro.build
export default defineConfig({
  site: 'https://javierpato.es',
  server: { port: 4385, host: true },
  build: { inlineStylesheets: 'auto' },
  // Híbrido: las páginas siguen siendo estáticas (prerender por defecto);
  // solo los endpoints con `export const prerender = false` corren en servidor.
  // Una sola forma de URL: con barra final. Canonical, sitemap y enlaces internos
  // ya la usan; el adaptador de Vercel añade un 308 de /ruta a /ruta/ (los
  // endpoints /api/* no se tocan).
  trailingSlash: 'always',
  output: 'hybrid',
  adapter: vercel(),
  integrations: [
    sitemap({
      filter: (page) => !taxonomiasFinas.some((t) => new URL(page).pathname === t),
      serialize: (item) => {
        const fecha = lastmodFor(new URL(item.url).pathname) ?? buildDate;
        return { ...item, lastmod: fecha.toISOString() };
      },
    }),
  ],
  // 301 de las 8 landings de municipio/sector que Google no indexaba
  // (184-223 palabras, misma plantilla) a la página comarcal consolidada.
  redirects: {
    '/diseno-web-astillero': '/diseno-web-cantabria/zonas/#astillero',
    '/diseno-web-camargo': '/diseno-web-cantabria/zonas/#camargo',
    '/diseno-web-pielagos': '/diseno-web-cantabria/zonas/#pielagos',
    '/diseno-web-reinosa': '/diseno-web-cantabria/zonas/#reinosa',
    '/diseno-web-laredo': '/diseno-web-cantabria/zonas/#laredo',
    '/diseno-web-castro-urdiales': '/diseno-web-cantabria/zonas/#castro-urdiales',
    '/diseno-web-peluquerias-estetica-cantabria': '/diseno-web-cantabria/zonas/#peluquerias-estetica',
    '/diseno-web-turismo-rural-cantabria': '/diseno-web-cantabria/zonas/#turismo-rural',
  },
});
