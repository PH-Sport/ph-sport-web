/**
 * Entradas del carrusel de Instagram en Inicio.
 * Sustituye cada `href` por el permalink del post/reel cuando lo tengas.
 * Opcional: `imageSrc` para miniatura local o remota.
 */
export type InstagramHomePost = {
  href: string;
  imageSrc?: string;
};

export const INSTAGRAM_HOME_POSTS: readonly InstagramHomePost[] = [
  { href: 'https://www.instagram.com/' },
  { href: 'https://www.instagram.com/' },
  { href: 'https://www.instagram.com/' },
  { href: 'https://www.instagram.com/' },
  { href: 'https://www.instagram.com/' },
  { href: 'https://www.instagram.com/' },
] as const;
