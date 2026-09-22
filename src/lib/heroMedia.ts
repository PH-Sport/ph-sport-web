/**
 * Hero (home): vídeo a pantalla completa (muted + loop + playsInline), arrancado a
 * mano tras `load` desde `HeroSection.astro`.
 *
 * Todo lo que se lista aquí lo genera `scripts/build-hero-variants.mjs` a partir
 * del master `assets/source-media/hero-<versión>.mp4`, y lo escribe en
 * `public/hero/<versión>/`.
 *
 * La versión va en la ruta A PROPÓSITO: `vercel.json` sirve `.mp4` y `.webp` con
 * 7 días de caché en el navegador y 30 más de stale-while-revalidate, así que un
 * vídeo nuevo con el mismo nombre seguiría siendo el viejo para quien ya visitó
 * la web. Para cambiar de vídeo: master nuevo, misma versión nueva aquí y en el
 * script, regenerar, y borrar la carpeta anterior de `public/hero/`.
 */
export const HERO_VERSION = '2026-09';

const BASE = `/hero/${HERO_VERSION}`;

/**
 * Móvil en vertical recibe un recorte 2:3 centrado del master (720×1080): es lo
 * que `object-fit: cover` enseñaría de todos modos en una pantalla vertical, pero
 * sin pagar los dos tercios de píxeles que quedan fuera. Se evalúa una sola vez
 * al cargar; girar el teléfono después no cambia el archivo (ver DECISIONS.md,
 * 2026-09-22).
 */
export const HERO_MOBILE_MEDIA = '(max-width: 768px) and (orientation: portrait)';

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
export const HERO_VIDEO_SOURCES: readonly HeroVideoSource[] = [
  { src: `${BASE}/mobile-hevc.mp4`, type: 'video/mp4; codecs="hvc1.1.6.L120.B0"', media: HERO_MOBILE_MEDIA },
  { src: `${BASE}/mobile-h264.mp4`, type: 'video/mp4; codecs="avc1.640028"', media: HERO_MOBILE_MEDIA },
  { src: `${BASE}/1080-hevc.mp4`, type: 'video/mp4; codecs="hvc1.1.6.L120.B0"' },
  { src: `${BASE}/1080-h264.mp4`, type: 'video/mp4; codecs="avc1.640028"' },
] as const;

/** Primer fotograma del master, con el mismo recorte que el vídeo de cada pantalla. */
export const HERO_POSTER = {
  mobile: `${BASE}/poster-mobile.webp`,
  desktop: `${BASE}/poster.webp`,
} as const;
