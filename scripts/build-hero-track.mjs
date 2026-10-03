#!/usr/bin/env node
/**
 * Tabla de seguimiento del rótulo de neón del hero → src/lib/heroTrack.ts
 *
 * El visor del hero (cuatro escuadras doradas) sigue al rótulo mientras la
 * cámara del vídeo se mueve. No hay forma de leer la posición del logo desde el
 * <video>, así que se mide aquí, una vez: se sacan los fotogramas de los cuatro
 * vídeos (encendido y bucle, apaisado y vertical) a 15 por segundo, se busca en
 * cada uno la caja de lo que brilla (el tubo encendido) y se guarda como tabla.
 * En la web, el script del hero interpola la caja del instante que se está
 * viendo (`HeroSection.astro`).
 *
 * Hay que volver a ejecutarlo SIEMPRE que cambie el vídeo del hero (después de
 * `npm run assets:hero`): una tabla de otro vídeo pondría el visor fuera del
 * rótulo. Uso:
 *
 *     node scripts/build-hero-track.mjs
 *
 * Necesita ffmpeg-static y sharp, que ya son dependencias de desarrollo.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const FPS = 15;
/** Ancho al que se reducen los fotogramas para medir: sobra para un rótulo. */
const SAMPLE_W = 480;
/** Luminancia a partir de la cual un píxel es tubo encendido (0-255). */
const THRESHOLD = 150;

const heroMedia = readFileSync(join(ROOT, 'src/lib/heroMedia.ts'), 'utf8');
const version = /HERO_VERSION\s*=\s*'([^']+)'/.exec(heroMedia)?.[1];
if (!version) throw new Error('No encuentro HERO_VERSION en src/lib/heroMedia.ts');
const VIDEO_DIR = join(ROOT, 'public/hero', version);

/** Cajas por fotograma, normalizadas al fotograma (0-1): [x0, y0, x1, y1] o null. */
async function measure(file) {
  const dir = mkdtempSync(join(tmpdir(), 'ph-track-'));
  try {
    execFileSync(ffmpegPath, [
      '-loglevel', 'error', '-i', join(VIDEO_DIR, file),
      '-vf', `fps=${FPS},scale=${SAMPLE_W}:-1`, join(dir, 'f%04d.png'),
    ]);
    const boxes = [];
    for (const f of readdirSync(dir).sort()) {
      const { data, info } = await sharp(join(dir, f)).greyscale().raw().toBuffer({ resolveWithObject: true });
      let x0 = Infinity; let y0 = Infinity; let x1 = -1; let y1 = -1; let n = 0;
      for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
          if (data[y * info.width + x] < THRESHOLD) continue;
          n++;
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
      boxes.push(n > 20 ? [x0 / info.width, y0 / info.height, (x1 + 1) / info.width, (y1 + 1) / info.height] : null);
    }
    return boxes;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Media móvil de 3 fotogramas: quita el temblor del umbral sin retrasar la caja. */
function smooth(boxes, circular) {
  const n = boxes.length;
  return boxes.map((_, i) => {
    const idx = [i - 1, i, i + 1].map((j) => (circular ? (j + n) % n : Math.min(n - 1, Math.max(0, j))));
    return [0, 1, 2, 3].map((k) => idx.reduce((s, j) => s + boxes[j][k], 0) / idx.length);
  });
}

const perMille = (boxes) => boxes.flat().map((v) => Math.round(v * 1000));

async function format(name, frameAspect) {
  const intro = await measure(`intro-${name}-h264.mp4`);
  const loop = await measure(`loop-${name}-h264.mp4`);
  if (loop.some((b) => !b)) throw new Error(`Hay fotogramas del bucle ${name} sin rótulo encendido`);

  // El encendido empieza apagado y la luz recorre el tubo: el rótulo está
  // entero cuando la proporción de su caja (en píxeles) ya es la del final.
  const ratio = (b) => ((b[2] - b[0]) * frameAspect) / (b[3] - b[1]);
  const last = intro[intro.length - 1];
  const litIndex = intro.findIndex((b) => b && Math.abs(ratio(b) / ratio(last) - 1) < 0.04);
  if (litIndex < 0) throw new Error(`No encuentro el rótulo encendido en el encendido ${name}`);
  // Antes de encenderse no hay visor: se rellena con la primera caja buena.
  const introFilled = intro.map((b, i) => (i < litIndex ? intro[litIndex] : b));

  return {
    litAt: +(litIndex / FPS).toFixed(3),
    intro: perMille(smooth(introFilled, false)),
    loop: perMille(smooth(loop, true)),
  };
}

const landscape = await format('landscape', 1920 / 1080);
const portrait = await format('portrait', 886 / 1920);

const body = `/**
 * GENERADO por scripts/build-hero-track.mjs a partir de public/hero/${version}/.
 * No editar a mano: si cambia el vídeo del hero, se vuelve a generar.
 *
 * La caja del rótulo de neón en cada fotograma de los vídeos del hero, para que
 * el visor (las escuadras doradas) lo siga mientras se mueve la cámara. Cada
 * caja son cuatro números en milésimas del fotograma (x0, y0, x1, y1), a ${FPS}
 * fotogramas por segundo. \`litAt\` es el segundo del encendido en que el tubo ya
 * está entero: antes no hay nada que fijar.
 */
export interface HeroTrackFormat {
  /** Segundo del vídeo de encendido en que el rótulo está entero. */
  litAt: number;
  intro: readonly number[];
  loop: readonly number[];
}

export const HERO_TRACK_FPS = ${FPS};

export const HERO_TRACK: { landscape: HeroTrackFormat; portrait: HeroTrackFormat } = {
  landscape: {
    litAt: ${landscape.litAt},
    intro: [${landscape.intro.join(',')}],
    loop: [${landscape.loop.join(',')}],
  },
  portrait: {
    litAt: ${portrait.litAt},
    intro: [${portrait.intro.join(',')}],
    loop: [${portrait.loop.join(',')}],
  },
};
`;

writeFileSync(join(ROOT, 'src/lib/heroTrack.ts'), body);
console.log(
  `heroTrack.ts: apaisado ${landscape.loop.length / 4} + ${landscape.intro.length / 4} fotogramas (encendido a ${landscape.litAt} s),`,
  `vertical ${portrait.loop.length / 4} + ${portrait.intro.length / 4} (encendido a ${portrait.litAt} s)`,
);
