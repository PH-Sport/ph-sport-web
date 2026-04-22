/**
 * Hero (home): vídeo a pantalla completa con autoplay (muted + loop + playsInline).
 *
 * Variantes generadas con `scripts/build-hero-variants.mjs`. Mobile primero (con media
 * query) para que el navegador elija el archivo ligero en pantallas <=768px.
 */
export type HeroVideoSource = {
  src: string;
  type: string;
  media?: string;
};

export const HERO_VIDEO_SOURCES: readonly HeroVideoSource[] = [
  { src: '/video-ph-web-480.mp4', type: 'video/mp4', media: '(max-width: 768px)' },
  { src: '/video-ph-web-720.mp4', type: 'video/mp4' },
] as const;

export const HERO_VIDEO_POSTER = '/hero-poster.webp';

export const HERO_STATIC_IMAGE = '';
