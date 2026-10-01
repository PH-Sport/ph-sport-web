/**
 * Hero (home): el logo en neón, en vídeo. Desde el 2026-10-01 sustituye a la
 * foto fija (ver DECISIONS.md, misma fecha).
 *
 * Son dos vídeos por pantalla: el encendido (3 s, se ve una vez) y el rótulo
 * encendido en bucle (12 s). El último fotograma del encendido es el primero del
 * bucle, así que el relevo no se ve. Los arranca a mano `HeroSection.astro`
 * después de `load`.
 *
 * Todo lo que se lista aquí lo genera `scripts/build-hero-neon.mjs`
 * (`npm run assets:hero`) a partir de `scripts/hero-neon/neon.html`, y lo escribe
 * en `public/hero/<versión>/`.
 *
 * La versión va en la ruta A PROPÓSITO: `vercel.json` sirve `.mp4` y `.webp` con
 * 7 días de caché en el navegador y 30 más de stale-while-revalidate, así que un
 * vídeo nuevo con el mismo nombre seguiría siendo el viejo para quien ya visitó
 * la web. Para cambiar de vídeo: versión nueva aquí y en el script, regenerar, y
 * borrar la carpeta anterior de `public/hero/`.
 */
export const HERO_VERSION = '2026-10';

const BASE = `/hero/${HERO_VERSION}`;

/**
 * Pantallas más estrechas que 9:10 (móviles y tablets en vertical) reciben el
 * encuadre vertical; el resto, el apaisado. Por debajo de 9:10, `cover` sobre el
 * apaisado ya no deja el logo entero. Se evalúa al cargar; girar el teléfono
 * después no cambia de archivo.
 */
export const HERO_PORTRAIT_MEDIA = '(max-aspect-ratio: 9/10)';

export type HeroVideoSource = {
  src: string;
  type: string;
  media?: string;
};

/**
 * El orden es la prioridad: el navegador se queda con el primer `<source>` cuyo
 * `media` cumple y cuyo `type` dice poder reproducir. El parámetro `codecs` es lo
 * que hace que funcione: sin él, un Chrome sin HEVC diría «maybe» a cualquier
 * `video/mp4`, se bajaría el HEVC, fallaría al decodificar y solo entonces
 * pasaría al siguiente. Con él, contesta «» y salta directo al H.264.
 *
 * - `hvc1.1.6.L120.B0`: HEVC Main, nivel 4.0. Safari/iOS entero, y Chrome, Edge
 *   y Firefox cuando el equipo decodifica por hardware.
 * - `avc1.640028`: H.264 High, nivel 4.0. Lo reproduce todo.
 */
const HEVC = 'video/mp4; codecs="hvc1.1.6.L120.B0"';
const H264 = 'video/mp4; codecs="avc1.640028"';

function sources(piece: 'intro' | 'loop'): readonly HeroVideoSource[] {
  return [
    { src: `${BASE}/${piece}-portrait-hevc.mp4`, type: HEVC, media: HERO_PORTRAIT_MEDIA },
    { src: `${BASE}/${piece}-portrait-h264.mp4`, type: H264, media: HERO_PORTRAIT_MEDIA },
    { src: `${BASE}/${piece}-landscape-hevc.mp4`, type: HEVC },
    { src: `${BASE}/${piece}-landscape-h264.mp4`, type: H264 },
  ];
}

export const HERO_INTRO_SOURCES = sources('intro');
export const HERO_LOOP_SOURCES = sources('loop');

/**
 * Fotogramas exactos de los vídeos, con el mismo encuadre:
 * - `off`: el primero del encendido (rótulo apagado). Es lo que se ve hasta que
 *   arranca el vídeo, así que el paso de imagen a vídeo no se nota.
 * - `on`: el primero del bucle (rótulo encendido). Con movimiento reducido, sin
 *   JavaScript o si el vídeo no puede arrancar, la portada se queda con este.
 */
export const HERO_POSTER = {
  off: { portrait: `${BASE}/off-portrait.webp`, landscape: `${BASE}/off-landscape.webp` },
  on: { portrait: `${BASE}/on-portrait.webp`, landscape: `${BASE}/on-landscape.webp` },
} as const;

/** Medidas de los fotogramas, para que el `<img>` reserve su caja (cero CLS). */
export const HERO_SIZE = {
  portrait: { width: 886, height: 1920 },
  landscape: { width: 1920, height: 1080 },
} as const;
