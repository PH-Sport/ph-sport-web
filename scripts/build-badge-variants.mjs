#!/usr/bin/env node
/**
 * Convierte las banderas PNG 600×600 (master en `assets/source-media/badges/`)
 * a WebP 128×128 q90 servidas desde `public/national-team-badges/`.
 * Tamaño objetivo: ~5-10 KB por bandera (vs 80-180 KB del PNG).
 *
 * Uso: node scripts/build-badge-variants.mjs
 */
import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';

const SRC_DIR = 'assets/source-media/badges';
const OUT_DIR = 'public/national-team-badges';
const TARGET_WIDTH = 128;
const QUALITY = 90;

const entries = await readdir(SRC_DIR);
const pngs = entries.filter((f) => extname(f).toLowerCase() === '.png');

let totalIn = 0;
let totalOut = 0;

for (const file of pngs) {
  const inPath = join(SRC_DIR, file);
  const outPath = join(OUT_DIR, basename(file, '.png') + '.webp');
  const inSize = (await stat(inPath)).size;

  await sharp(inPath)
    .resize({ width: TARGET_WIDTH, height: TARGET_WIDTH })
    .webp({ quality: QUALITY })
    .toFile(outPath);

  const outSize = (await stat(outPath)).size;
  totalIn += inSize;
  totalOut += outSize;
  console.log(
    `  ${file.padEnd(8)} ${(inSize / 1024).toFixed(0).padStart(4)}KB → ${basename(outPath).padEnd(8)} ${(outSize / 1024).toFixed(1).padStart(5)}KB`,
  );
}

console.log('');
console.log(
  `Total: ${(totalIn / 1024).toFixed(0)}KB → ${(totalOut / 1024).toFixed(1)}KB (ahorro ${(((totalIn - totalOut) / totalIn) * 100).toFixed(1)}%)`,
);
