#!/usr/bin/env node
/**
 * Genera el vídeo del hero renderizando scripts/hero-neon/neon.html fotograma a
 * fotograma en un Chrome sin ventana (Playwright) y codificándolo con ffmpeg-static.
 *
 *   npm run assets:hero              genera public/hero/<VERSION>/
 *   npm run assets:hero -- --ssim    además mide SSIM de cada variante contra una
 *                                    referencia casi sin pérdida (más lento)
 *
 * No hay master: la fuente es el propio neon.html, y el render es determinista.
 *
 * Salida    public/hero/<VERSION>/
 *           intro-<f>-hevc.mp4  encendido, 3 s, se ve una vez
 *           intro-<f>-h264.mp4
 *           loop-<f>-hevc.mp4   rótulo encendido, 12 s, en bucle
 *           loop-<f>-h264.mp4
 *           off-<f>.webp        primer fotograma del encendido (rótulo apagado):
 *                               lo que se ve hasta que arranca el vídeo
 *           on-<f>.webp         primer fotograma del bucle (rótulo encendido):
 *                               para movimiento reducido y si el vídeo no arranca
 *           con <f> = landscape (1920×1080) y portrait (886×1920, 9:19,5).
 *
 * Qué pantalla recibe cada archivo lo decide `src/lib/heroMedia.ts`. VERSION tiene
 * que coincidir en los dos sitios: la ruta lleva la versión porque `vercel.json`
 * sirve estos archivos con 7 días de caché, y un vídeo nuevo con el mismo nombre
 * seguiría siendo el viejo para quien ya visitó la web. Al cambiar de vídeo,
 * carpeta nueva y borrar la anterior.
 *
 * Por qué estos ajustes (cifras en DECISIONS.md, 2026-10-01):
 * - Vertical a 9:19,5 y no 9:16: es la proporción más estrecha de los móviles
 *   actuales. Con `object-fit: cover`, en una pantalla 9:16 sobra por arriba y por
 *   abajo (pared), nunca por los lados (logo).
 * - CRF y no bitrate fijo, emparejados por SSIM entre códecs, como en el vídeo
 *   anterior (2026-09-22).
 * - `-tag:v hvc1`: sin él ffmpeg escribe `hev1` y Safari no lo reproduce.
 * - Los fotogramas llegan en RGB: se convierten a YUV con la matriz BT.709 y se
 *   declara BT.709. Si no, ffmpeg convierte con BT.601 y Safari los pinta con
 *   otra gamma.
 * - Requiere los navegadores de Playwright (`npx playwright install chromium`).
 *   En Mac usa la GPU (Metal); sin GPU funciona, pero mucho más lento.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, statSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import ffmpegPath from 'ffmpeg-static';
import { chromium } from '@playwright/test';

/** Misma cadena que HERO_VERSION en src/lib/heroMedia.ts. */
const VERSION = '2026-10';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = pathToFileURL(resolve(ROOT, 'scripts', 'hero-neon', 'neon.html')).href;
const OUT_DIR = resolve(ROOT, 'public', 'hero', VERSION);
const MEASURE = process.argv.includes('--ssim');

const FPS = 30;
/** Mismas cifras que INTRO_T y LOOP_T en neon.html. */
const INTRO_T = 3;
const LOOP_T = 12;

const FORMATS = [
  { name: 'landscape', w: 1920, h: 1080, crf: { hevc: 24, h264: 22 } },
  { name: 'portrait', w: 886, h: 1920, crf: { hevc: 24, h264: 22 } },
];

const COLOR = [
  '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
];
const TAIL = ['-an', '-movflags', '+faststart'];
const h264 = (crf) => [
  '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf),
  '-profile:v', 'high', '-level', '4.0',
];
const hevc = (crf) => [
  '-c:v', 'libx265', '-preset', 'slow', '-crf', String(crf),
  '-tag:v', 'hvc1', '-x265-params', 'log-level=error',
];

function run(args, input) {
  return new Promise((ok, fail) => {
    const p = spawn(ffmpegPath, ['-y', '-v', 'error', ...args], {
      stdio: [input ? 'pipe' : 'ignore', 'pipe', 'inherit'],
    });
    let out = '';
    p.stdout.on('data', (d) => { out += d; });
    p.on('close', (code) => (code === 0 ? ok(out) : fail(new Error(`ffmpeg salió con ${code}`))));
    if (input) input(p.stdin);
  });
}

const kb = (file) => `${(statSync(file).size / 1024).toFixed(0)} KB`;

const tmp = mkdtempSync(join(tmpdir(), 'ph-hero-neon-'));
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: process.platform === 'darwin' ? ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] : [],
});

try {
  for (const f of FORMATS) {
    const page = await browser.newPage({ viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => { throw e; });
    await page.goto(`${PAGE}?render&w=${f.w}&h=${f.h}&frame=${f.name}`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 30000 });
    const clip = { x: 0, y: 0, width: f.w, height: f.h };
    const frameAt = async (t, i) => {
      await page.evaluate(([t, i]) => window.renderAt(t, i), [t, i]);
      return page.screenshot({ type: 'png', clip });
    };

    // Pósters: fotogramas exactos, para que el paso de imagen a vídeo no se vea.
    for (const [label, t] of [['off', 0], ['on', INTRO_T]]) {
      const png = join(tmp, `${label}-${f.name}.png`);
      const buf = await frameAt(t, 0);
      await run(['-f', 'image2pipe', '-i', '-', png], (stdin) => stdin.end(buf));
      const out = resolve(OUT_DIR, `${label}-${f.name}.webp`);
      await run(['-i', png, '-c:v', 'libwebp', '-quality', '80', out]);
      console.log(`→ ${label}-${f.name}.webp  ${kb(out)}`);
    }

    for (const [piece, t0, dur] of [['intro', 0, INTRO_T], ['loop', INTRO_T, LOOP_T]]) {
      const outs = {
        hevc: resolve(OUT_DIR, `${piece}-${f.name}-hevc.mp4`),
        h264: resolve(OUT_DIR, `${piece}-${f.name}-h264.mp4`),
        ref: join(tmp, `${piece}-${f.name}-ref.mp4`),
      };
      const args = ['-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
        ...COLOR, ...hevc(f.crf.hevc), ...TAIL, outs.hevc,
        ...COLOR, ...h264(f.crf.h264), ...TAIL, outs.h264];
      if (MEASURE) args.push(...COLOR, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '4', outs.ref);
      const frames = Math.round(dur * FPS);
      console.log(`\n→ ${piece} · ${f.name} ${f.w}×${f.h} · ${frames} fotogramas`);
      await run(args, async (stdin) => {
        for (let i = 0; i < frames; i++) {
          const buf = await frameAt(t0 + i / FPS, i);
          if (!stdin.write(buf)) await new Promise((r) => stdin.once('drain', r));
        }
        stdin.end();
      });
      for (const codec of ['hevc', 'h264']) {
        let line = `   ${codec.padEnd(4)}  crf ${f.crf[codec]}  ${kb(outs[codec])}`;
        if (MEASURE) {
          const log = await run(['-i', outs[codec], '-i', outs.ref, '-lavfi', 'ssim=stats_file=-', '-f', 'null', '-']);
          const all = [...log.matchAll(/All:([\d.]+)/g)].map((m) => +m[1]);
          line += `  SSIM ${(all.reduce((a, b) => a + b, 0) / all.length).toFixed(4)}`;
        }
        console.log(line);
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}
console.log(`\nListo: ${OUT_DIR.replace(ROOT, '')}`);
