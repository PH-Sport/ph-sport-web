#!/usr/bin/env node
/**
 * Prepara las fotos de la oficina de los pilares de Servicios y de la ventana de
 * Contacto: recorte 16:10, el ajuste de color ya aplicado y, para las que tienen
 * luz propia, la máscara de la zona donde actúa.
 *
 *   npm run assets:oficina
 *
 * Entrada   assets/source-media/oficina/   (originales, no se sirven)
 *           carpeta.jpg, sillones.jpg, tarjeta.jpg,    fotos de la sesión, 1600×1066
 *           escultura.jpg                              («Logo 2.jpeg» de la sesión)
 *           boligrafos.jpg, sala.jpg                   fotogramas de 1920×1080 del vídeo
 *                                                      de la oficina (el que estuvo en la
 *                                                      portada en septiembre)
 * Salida    src/assets/images/oficina/     (las procesa astro:assets: anchos y hash)
 *           <foto>.jpg                     16:10, con el ajuste de color
 *           <foto>-luz.png                 dónde cae la luz (blanco con alfa)
 *
 * Los fotogramas son el más nítido de cada plano de «Vídeo Web.mov» (13,95 s y
 * 5,55 s). Se sacaron con ffmpeg-static así, y el elegido es el de mayor varianza
 * del laplaciano:
 *   ffmpeg -ss 12.65 -t 1.3 -i "Vídeo Web.mov" -vf fps=10 -q:v 1 boli-%02d.jpg   → nº 14
 *   ffmpeg -ss 4.05  -t 1.7 -i "Vídeo Web.mov" -vf fps=10 -q:v 1 sala-%02d.jpg   → nº 16
 *
 * Las máscaras están medidas sobre ESTAS fotos (cajas, umbrales y las siluetas de la
 * mesa y de la escultura). Si llega otro original —más grande o con otro encuadre—, hay que revisar
 * sus cifras, no solo volver a pasar el script. Por qué así: DECISIONS.md
 * (2026-10-15, «Fotos de la oficina…»).
 */
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const IN = resolve(ROOT, 'assets', 'source-media', 'oficina');
const OUT = resolve(ROOT, 'src', 'assets', 'images', 'oficina');
mkdirSync(OUT, { recursive: true });

const luma = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * El ajuste de color de la maqueta que aprobó Mario: menos saturación, un punto de
 * contraste, algo más oscuro y un poco cálido. Es la misma cuenta que el filtro CSS
 * `saturate(0.8) contrast(1.06) brightness(0.94) sepia(0.1)`, en ese orden y en
 * sRGB, así que la foto sale igual que en la maqueta sin pagar el filtro en directo.
 * La viñeta va aparte, en CSS, para que no se mueva con la cámara.
 */
function grade(px) {
  const s = 0.8;
  const S = [
    [0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s],
    [0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s],
    [0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s],
  ];
  const k = 1 - 0.1;
  const P = [
    [0.393 + 0.607 * k, 0.769 - 0.769 * k, 0.189 - 0.189 * k],
    [0.349 - 0.349 * k, 0.686 + 0.314 * k, 0.168 - 0.168 * k],
    [0.272 - 0.272 * k, 0.534 - 0.534 * k, 0.131 + 0.869 * k],
  ];
  const mul = (M, v) => M.map((row) => clamp01(row[0] * v[0] + row[1] * v[1] + row[2] * v[2]));
  const out = Buffer.alloc(px.length);
  for (let i = 0; i < px.length; i += 3) {
    let v = [px[i] / 255, px[i + 1] / 255, px[i + 2] / 255];
    v = mul(S, v);
    v = v.map((c) => clamp01(((c - 0.5) * 1.06 + 0.5) * 0.94));
    v = mul(P, v);
    out[i] = Math.round(v[0] * 255);
    out[i + 1] = Math.round(v[1] * 255);
    out[i + 2] = Math.round(v[2] * 255);
  }
  return out;
}

/** Recorta, guarda la foto con el ajuste y devuelve los píxeles SIN ajustar, que
 *  son sobre los que están medidas las máscaras. */
async function photo(file, crop) {
  const { data, info } = await sharp(resolve(IN, file)).extract(crop).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  await sharp(grade(data), { raw: { width: info.width, height: info.height, channels: 3 } })
    .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(resolve(OUT, file));
  console.log(`→ ${file}  ${info.width}×${info.height}`);
  return { px: data, W: info.width, H: info.height };
}

/** Máscara blanca con alfa = m (0-1), suavizada. */
async function mask(name, { W, H }, m, blur) {
  const buf = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) {
    buf[i * 4] = buf[i * 4 + 1] = buf[i * 4 + 2] = 255;
    buf[i * 4 + 3] = Math.round(m[i] * 255);
  }
  await sharp(buf, { raw: { width: W, height: H, channels: 4 } }).blur(blur).png({ compressionLevel: 9 }).toFile(resolve(OUT, name));
  console.log(`→ ${name}`);
}

/** Lo que brilla dentro de una caja: el pan de oro de la tarjeta, la plata de la carpeta. */
function foil({ px, W, H }, box, lo, hi) {
  const m = new Float32Array(W * H);
  for (let y = box.y0; y < box.y1; y++) {
    for (let x = box.x0; x < box.x1; x++) {
      const i = y * W + x;
      m[i] = smooth(lo, hi, luma(px[i * 3], px[i * 3 + 1], px[i * 3 + 2]));
    }
  }
  return m;
}

const PHOTO = { left: 0, top: 33, width: 1600, height: 1000 };
const FRAME = { left: 96, top: 0, width: 1728, height: 1080 };

// IV · Family Office: el logo plateado de la carpeta.
const carpeta = await photo('carpeta.jpg', PHOTO);
await mask('carpeta-luz.png', carpeta, foil(carpeta, { x0: 600, x1: 970, y0: 450, y1: 600 }, 45, 85), 0.8);

// Contacto: el logo dorado de la tarjeta.
const tarjeta = await photo('tarjeta.jpg', PHOTO);
await mask('tarjeta-luz.png', tarjeta, foil(tarjeta, { x0: 655, x1: 972, y0: 368, y1: 620 }, 55, 100), 0.8);

// V · Psicólogo: lo que se ve del patio a través del cristal, sin los sillones, la
// mesita, los marcos ni lo desenfocado de primer plano.
{
  const s = await photo('sillones.jpg', PHOTO);
  const { px, W, H } = s;
  const m = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const r = px[i * 3], g = px[i * 3 + 1], b = px[i * 3 + 2];
      const yo = y + PHOTO.top;
      let v = smooth(240, 262, x);
      if (r > 90 && r > 1.3 * g && r > 1.35 * b) v = 0; // sillones y mesita
      v *= smooth(50, 75, luma(r, g, b)); // marcos y sombras
      if (x < 460 && yo > 690) v = 0; // sillón verde y mesa de abajo
      if (x > 625 && x < 1005 && yo > 570 && yo < 668 && r - g > 18) v = 0; // tablero rosado de la mesita
      if (x > 660 && x < 820 && yo > 960 && g > 1.25 * b) v = 0; // mancha desenfocada de abajo
      if (x > 1320 && yo > 680) v = 0; // planta desenfocada de la derecha
      m[i] = v;
    }
  }
  await mask('sillones-luz.png', s, m, 3);
}

// I · Prensa: los clips y las anillas de cobre de los bolígrafos.
{
  const s = await photo('boligrafos.jpg', FRAME);
  const { px, W, H } = s;
  const m = new Float32Array(W * H);
  for (let y = 60; y < 640; y++) {
    for (let x = 380; x < 1380; x++) {
      const i = y * W + x;
      const r = px[i * 3], g = px[i * 3 + 1], b = px[i * 3 + 2];
      m[i] = smooth(95, 140, luma(r, g, b)) * smooth(28, 55, r - b) * (r >= g ? 1 : 0);
    }
  }
  await mask('boligrafos-luz.png', s, m, 1);
}

// II · Rendimiento: la escultura del logo en el jardín, donde cae el sol. Es su
// silueta medida sobre la foto recortada (con la peana), menos los árboles que se
// ven por los huecos, que son más oscuros. La pieza es casi blanca: un brillo no se
// notaría, el sol la tiñe.
{
  const s = await photo('escultura.jpg', PHOTO);
  const { px, W, H } = s;
  const SCULPTURE = [
    [513, 150], [615, 100], [925, 185], [1015, 350], [945, 395], [1035, 375], [1225, 655],
    [1020, 658], [1105, 830], [1293, 833], [1293, 846], [227, 846], [227, 833], [480, 830],
    [495, 555], [700, 352], [508, 318],
  ];
  const inside = (x, y) => {
    let c = false;
    for (let i = 0, j = SCULPTURE.length - 1; i < SCULPTURE.length; j = i++) {
      const [xi, yi] = SCULPTURE[i];
      const [xj, yj] = SCULPTURE[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const m = new Float32Array(W * H);
  for (let y = 90; y < 860; y++) {
    for (let x = 220; x < 1300; x++) {
      if (!inside(x, y)) continue;
      const i = y * W + x;
      m[i] = smooth(130, 175, luma(px[i * 3], px[i * 3 + 1], px[i * 3 + 2]));
    }
  }
  await mask('escultura-luz.png', s, m, 3);
}

// III · Media: el tablero de la mesa de reuniones, donde cae el sol de la cristalera.
// Es la silueta del tablero medida sobre el fotograma (px del fotograma entero),
// menos las sillas amarillas y lo oscuro que hay encima.
{
  const s = await photo('sala.jpg', FRAME);
  const { px, W, H } = s;
  const TABLE = [
    [0, 587], [133, 540], [400, 455], [667, 433], [933, 440], [1200, 480], [1250, 500],
    [1250, 525], [1100, 615], [950, 700], [800, 778], [667, 838], [500, 912], [400, 958], [200, 1010], [0, 1045],
  ].map(([x, y]) => [x - FRAME.left, y]);
  const inside = (x, y) => {
    let c = false;
    for (let i = 0, j = TABLE.length - 1; i < TABLE.length; j = i++) {
      const [xi, yi] = TABLE[i];
      const [xj, yj] = TABLE[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  };
  const m = new Float32Array(W * H);
  for (let y = 400; y < H; y++) {
    for (let x = 0; x < 1300; x++) {
      if (!inside(x, y)) continue;
      const i = y * W + x;
      const r = px[i * 3], g = px[i * 3 + 1], b = px[i * 3 + 2];
      const yellow = g > 1.35 * b && r > 1.35 * b;
      m[i] = yellow ? 0 : smooth(80, 120, luma(r, g, b));
    }
  }
  await mask('sala-luz.png', s, m, 3);
}

console.log(`\nListo: ${OUT.replace(ROOT, '')}`);
