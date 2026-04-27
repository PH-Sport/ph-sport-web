#!/usr/bin/env node
/**
 * Genera el set de iconos y la imagen Open Graph desde los assets fuente:
 *   - apple-touch-icon.png  (180×180, logo gold sobre ph-black)
 *   - favicon-32.png        (fallback PNG para navegadores que ignoran SVG)
 *   - favicon-16.png        (fallback PNG pequeño)
 *   - mask-icon.svg         (Safari pinned tab: SVG monocromo sin atributo fill)
 *   - og-image.jpg          (1200×630, derivada de about-equipo.webp)
 *
 * El SVG `favicon.svg` original se mantiene tal cual como icono primario.
 *
 * Uso: node scripts/build-favicons.mjs
 */
import sharp from 'sharp';
import { readFile, writeFile, stat } from 'node:fs/promises';

const PUBLIC = 'public';
const SRC_SVG = `${PUBLIC}/favicon.svg`;
const SRC_OG = `${PUBLIC}/about-equipo.webp`;

const PH_BLACK = '#0d0f12';

const svgRaw = await readFile(SRC_SVG, 'utf8');

// 1) apple-touch-icon (180×180): fondo sólido + logo centrado con padding.
//    iOS NO redondea: pantalla Home aplica su propia máscara. Entregamos cuadrado lleno.
const APPLE_SIZE = 180;
const APPLE_LOGO_WIDTH = 120; // ~67% del ancho → ~30px de aire por lado

const appleLogoBuf = await sharp(Buffer.from(svgRaw))
  .resize({ width: APPLE_LOGO_WIDTH })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: APPLE_SIZE,
    height: APPLE_SIZE,
    channels: 4,
    background: PH_BLACK,
  },
})
  .composite([{ input: appleLogoBuf, gravity: 'center' }])
  .png()
  .toFile(`${PUBLIC}/apple-touch-icon.png`);

// 2) favicon-32.png y favicon-16.png: fondo transparente, logo centrado preservando aspecto.
for (const size of [32, 16]) {
  await sharp(Buffer.from(svgRaw))
    .resize({
      width: size,
      height: size,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(`${PUBLIC}/favicon-${size}.png`);
}

// 3) mask-icon.svg: Safari pinned tab. Requiere SVG sin atributo fill en el <svg>;
//    el color lo aplica el atributo `color` del <link rel="mask-icon">.
const maskSvg = svgRaw.replace(/\sfill="[^"]*"/, '');
await writeFile(`${PUBLIC}/mask-icon.svg`, maskSvg);

// 4) og-image.jpg (1200×630): cover desde about-equipo.webp.
//    JPG q85: ~máxima compatibilidad con parsers de redes sociales.
await sharp(SRC_OG)
  .resize({ width: 1200, height: 630, fit: 'cover', position: 'center' })
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(`${PUBLIC}/og-image.jpg`);

// Reporte
const outputs = [
  'apple-touch-icon.png',
  'favicon-32.png',
  'favicon-16.png',
  'mask-icon.svg',
  'og-image.jpg',
];
console.log('Generados:');
for (const f of outputs) {
  const s = (await stat(`${PUBLIC}/${f}`)).size;
  console.log(`  ${f.padEnd(22)} ${(s / 1024).toFixed(1).padStart(6)} KB`);
}
