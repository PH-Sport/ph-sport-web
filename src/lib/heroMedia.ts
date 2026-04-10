/**
 * Hero (home): vídeo a pantalla completa con autoplay (muted + loop + playsInline).
 *
 * Vídeo: `public/video-ph-web.mp4`. Opcional: añadir `hero.webm` y más entradas en el array.
 *
 * Opcional: `HERO_VIDEO_POSTER` — ruta a JPG/WebP bajo `public/` para el frame antes de cargar.
 */
export const HERO_VIDEO_SOURCES = [{ src: '/video-ph-web.mp4', type: 'video/mp4' }] as const;

/** Vacío = sin atributo poster (evita 404 si no hay imagen). */
export const HERO_VIDEO_POSTER = '';

export const HERO_STATIC_IMAGE = '';
