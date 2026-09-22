#!/usr/bin/env node
/**
 * Genera las variantes del vídeo del hero a partir del master.
 *
 *   npm run assets:hero
 *
 * Entrada   assets/source-media/hero-<VERSION>.mp4
 *           El H.264 1080p25 tal como llega de edición, sin la pista de audio
 *           (la web lo reproduce siempre en silencio; se quita con `-c:v copy -an`).
 *
 * Salida    public/hero/<VERSION>/
 *           1080-hevc.mp4       escritorio y tablet: Safari/iOS, y Chrome/Edge/Firefox
 *                               cuando el equipo decodifica HEVC por hardware
 *           1080-h264.mp4       escritorio y tablet: todo lo demás
 *           mobile-hevc.mp4     móvil en vertical: recorte 2:3 centrado (720×1080)
 *           mobile-h264.mp4     móvil en vertical: todo lo demás
 *           poster.webp         primer fotograma, 1920×1080
 *           poster-mobile.webp  primer fotograma con el recorte móvil, 720×1080
 *
 * Qué pantalla recibe cada archivo lo decide `src/lib/heroMedia.ts`. VERSION tiene
 * que coincidir en los dos sitios: la ruta lleva la versión porque `vercel.json`
 * sirve estos archivos con 7 días de caché, y un vídeo nuevo con el mismo nombre
 * seguiría siendo el viejo para quien ya visitó la web. Al cambiar de vídeo,
 * carpeta nueva y borrar la anterior.
 *
 * Por qué estos ajustes (medido el 2026-09-22 sobre este master; cifras y
 * alternativas descartadas en DECISIONS.md):
 * - CRF y no bitrate fijo: calidad constante, y los planos quietos no gastan lo
 *   que no necesitan. Los CRF están emparejados por SSIM contra el master para
 *   que HEVC y H.264 den la misma calidad (≈0,989 en escritorio, ≈0,988 en
 *   móvil) y solo cambie el peso. Sin tope VBV: el pico por segundo es 2,5-2,7× la media y
 *   con descarga progresiva no bloquea.
 * - `-tag:v hvc1`: sin él ffmpeg escribe `hev1` y Safari no lo reproduce.
 * - Color BT.709 declarado en la salida: el master lo trae, y sin declararlo
 *   Safari/QuickTime lo interpretan con otra gamma.
 * - `-preset slow`: unos 25 s por variante en un Mac. Se ejecuta una vez.
 * - El recorte móvil es lo que `object-fit: cover` enseña en una pantalla
 *   vertical; no se manda lo que no se ve. Centrado: los planos del montaje
 *   tienen el motivo en el centro.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import ffmpegPath from 'ffmpeg-static';

/** Misma cadena que HERO_VERSION en src/lib/heroMedia.ts. */
const VERSION = '2026-09';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'assets', 'source-media', `hero-${VERSION}.mp4`);
const OUT_DIR = resolve(ROOT, 'public', 'hero', VERSION);

/** Recorte 2:3 centrado del master 1920×1080. */
const MOBILE_CROP = 'crop=720:1080:600:0';

const COLOR = ['-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709'];
const VIDEO_TAIL = ['-an', '-movflags', '+faststart'];

const h264 = (crf) => [
  '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf),
  '-profile:v', 'high', '-level', '4.0', '-pix_fmt', 'yuv420p',
];
const hevc = (crf) => [
  '-c:v', 'libx265', '-preset', 'slow', '-crf', String(crf),
  '-tag:v', 'hvc1', '-pix_fmt', 'yuv420p', '-x265-params', 'log-level=error',
];
const poster = (extraFilters = []) => [
  '-frames:v', '1', ...extraFilters, '-c:v', 'libwebp', '-quality', '80',
];

const OUTPUTS = [
  { label: 'Escritorio 1080p · HEVC', out: '1080-hevc.mp4', args: [...hevc(24), ...COLOR, ...VIDEO_TAIL] },
  { label: 'Escritorio 1080p · H.264', out: '1080-h264.mp4', args: [...h264(22), ...COLOR, ...VIDEO_TAIL] },
  { label: 'Móvil vertical 720×1080 · HEVC', out: 'mobile-hevc.mp4', args: ['-vf', MOBILE_CROP, ...hevc(25), ...COLOR, ...VIDEO_TAIL] },
  { label: 'Móvil vertical 720×1080 · H.264', out: 'mobile-h264.mp4', args: ['-vf', MOBILE_CROP, ...h264(23), ...COLOR, ...VIDEO_TAIL] },
  { label: 'Póster 1920×1080', out: 'poster.webp', args: poster() },
  { label: 'Póster móvil 720×1080', out: 'poster-mobile.webp', args: poster(['-vf', MOBILE_CROP]) },
];

if (!existsSync(SRC)) {
  console.error(`No existe el master: ${SRC.replace(ROOT, '')}`);
  process.exit(1);
}
mkdirSync(OUT_DIR, { recursive: true });

for (const { label, out, args } of OUTPUTS) {
  const target = resolve(OUT_DIR, out);
  console.log(`\n→ ${label}`);
  execFileSync(
    ffmpegPath,
    ['-y', '-v', 'error', '-i', SRC, ...args, target],
    { stdio: ['ignore', 'inherit', 'inherit'] },
  );
  const size = statSync(target).size;
  console.log(`   ${(size / 1024).toFixed(0)} KB · ${target.replace(ROOT, '')}`);
}
console.log('\nDone.');
