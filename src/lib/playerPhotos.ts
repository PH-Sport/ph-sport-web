import type { ImageMetadata } from 'astro';

/**
 * Fotos por jugador: `src/assets/images/players/{slug}.{jpg|jpeg|png|webp}`.
 * El slug coincide con `slugify(name)` desde los JSON en `data/`.
 */
const modules = import.meta.glob<ImageMetadata>(
  '../assets/images/players/*.{jpg,jpeg,png,webp}',
  { eager: true, import: 'default' },
);

function basenameSlug(path: string): string {
  const file = path.split('/').pop() ?? '';
  return file.replace(/\.(jpg|jpeg|png|webp)$/i, '').toLowerCase();
}

const photoBySlug = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(modules)) {
  photoBySlug.set(basenameSlug(path), mod);
}

export function getPlayerPhotoBySlug(slug: string): ImageMetadata | undefined {
  return photoBySlug.get(slug.toLowerCase());
}
