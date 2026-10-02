// Post-build: corrige el config.json que genera @astrojs/vercel con
// trailingSlash: 'always'.
// 1) La ruta dinámica raíz ([slug].astro) produce un 308 genérico
//    '/([^/]+?)' -> '/$1/' que también atrapa ficheros de la raíz
//    (robots.txt, sitemap-index.xml, favicon.svg, og.jpg) y los rompería.
//    Los slugs nunca llevan punto, así que se excluye el punto.
// 2) Los 301 de las landings antiguas van antes que los 308 de barra final,
//    y aceptan la barra opcional: un solo salto, también para /ruta/.
// 3) Los endpoints /api/* solo existen con barra (así los compila Astro); la
//    versión sin barra hace 308 (conserva el método POST) por si algún cliente
//    antiguo la llama.
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../.vercel/output/config.json', import.meta.url);
const config = JSON.parse(readFileSync(file, 'utf8'));
const routes = config.routes;

const isSlash308 = (r) => r.status === 308 && r.headers?.Location?.endsWith('/');
const isOld301 = (r) => r.status === 301 && typeof r.src === 'string' && !r.src.startsWith('^');

for (const r of routes) {
  if (isSlash308(r)) r.src = r.src.replaceAll('([^/]+?)', '([^/.]+?)');
  if (isOld301(r)) r.src = `${r.src.replace(/\/$/, '')}/?`;
}
const api308 = routes
  .filter((r) => r.dest === '_render' && /^\^\\\/api\\\//.test(r.src))
  .map((r) => {
    const path = r.src.replace(/^\^/, '').replace(/\\\/\$$/, '').replaceAll('\\/', '/');
    return { src: path, headers: { Location: `${path}/` }, status: 308 };
  });
const old301 = routes.filter(isOld301);
const resto = routes.filter((r) => !isOld301(r));
const primero308 = resto.findIndex(isSlash308);
resto.splice(primero308 === -1 ? 0 : primero308, 0, ...old301, ...api308);
config.routes = resto;
writeFileSync(file, JSON.stringify(config, null, 2));
console.log(`[fix-vercel-routes] ${old301.length} redirects 301 adelantados; 308 sin ficheros; ${api308.length} endpoints /api con 308 a la barra.`);
