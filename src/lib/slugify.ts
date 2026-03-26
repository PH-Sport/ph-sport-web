/**
 * Slug estable para rutas y nombres de archivo de foto (`slug.jpg` en `src/assets/images/players/`).
 */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
