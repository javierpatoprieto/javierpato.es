// Genera la imagen Open Graph de marca (1200x630) → public/og.jpg
// Paleta real del sitio: ciruela-carbón #1a1019 · fucsia #e6197f · crema #f7f4ee
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'og.jpg');

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="82%" cy="12%" r="65%">
      <stop offset="0%" stop-color="#e6197f" stop-opacity="0.38"/>
      <stop offset="55%" stop-color="#1a1019" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#1a1019"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <g font-family="Segoe UI, Arial, sans-serif" fill="#f7f4ee">
    <circle cx="74" cy="70" r="9" fill="#e6197f"/>
    <text x="94" y="78" font-size="30" font-weight="700" letter-spacing="1">Javier Pato</text>
    <text x="1126" y="78" font-size="26" font-weight="600" text-anchor="end" fill="#cbbfc8" letter-spacing="3">CANTABRIA</text>

    <text x="72" y="320" font-size="124" font-weight="800" letter-spacing="-3">Diseño web</text>
    <text x="72" y="446" font-size="124" font-weight="800" letter-spacing="-3" fill="#ff3d97">que vende.</text>

    <text x="74" y="566" font-size="32" font-weight="600" fill="#d8cdd5">Desde 299&#8364; · Entrega en 1 semana</text>
    <text x="1126" y="566" font-size="30" font-weight="700" text-anchor="end" fill="#e6197f">javierpato.es</text>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(out);
console.log('OG generada →', out);
