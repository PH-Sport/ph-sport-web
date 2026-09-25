/**
 * Hero (home): foto fija a pantalla completa. Desde el 2026-09-25 sustituye al
 * vídeo (ver DECISIONS.md, misma fecha).
 *
 * La imagen pasa por `astro:assets`, que genera en el build las variantes de
 * `HERO_IMAGE_WIDTHS` con nombre con hash bajo `/_astro/`. Eso la libra de la
 * caché de 7 días que `vercel.json` pone a todo lo de `public/`: una foto
 * nueva tiene otro hash y nadie ve la vieja. Para cambiarla basta con
 * sustituir el archivo; si el encuadre cambia, hay que volver a medir el logo
 * (ver `HeroSection.astro`, bloque de pantallas en vertical).
 */
import portada from '@/assets/images/hero/portada.png';

export const HERO_IMAGE = portada;

/**
 * El original mide 1672×941, así que no se genera nada más ancho: ampliar en el
 * build solo añade bytes, no detalle. En pantallas retina grandes se ve
 * ampliada; el arreglo es un original más grande (docs/hallazgos-abiertos.md).
 */
export const HERO_IMAGE_WIDTHS = [640, 960, 1280, 1672];

/**
 * WebP a calidad 90, y sin AVIF: comparado a 2× lado a lado con el original,
 * AVIF borra la textura de fieltro de la pared incluso a calidad 90 (301 KB),
 * y WebP 90 la conserva con 152 KB a 1672 px.
 */
export const HERO_IMAGE_QUALITY = 90;

/**
 * Ancho real al que se pinta la foto, para que el navegador elija variante:
 * - En vertical (más estrecha que 9:10) se pinta al 192 % del ancho: es lo que
 *   hace falta para que el logo, que ocupa el 45,7 % de la foto, llene el 88 %
 *   de la pantalla.
 * - En horizontal más ancha que la foto (16:9), llena el ancho: 100vw.
 * - En horizontal más estrecha, `object-fit: cover` la ajusta al alto y el
 *   ancho es el alto por 16/9: 178vh.
 */
export const HERO_IMAGE_SIZES =
  '(max-aspect-ratio: 9/10) 192vw, (min-aspect-ratio: 16/9) 100vw, 178vh';
