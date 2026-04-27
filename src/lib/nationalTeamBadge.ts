/**
 * Rutas locales de escudos para `nationalTeamCodes` (ISO 3166-1 alpha-2).
 * WebP 128×128 q90 en /public/national-team-badges/, generadas a partir de
 * los PNG master en /assets/source-media/badges/ (regenerar con
 * `node scripts/build-badge-variants.mjs` si se añaden PNG fuente nuevos).
 * Objetivo: escudos de selección (p. ej. ES = escudo camiseta), no solo marca de federación.
 */

const BADGE_CODES = new Set([
  'ES',
  'PE',
  'HR',
  'MK',
  'MA',
  'BO',
  'RO',
  'PA',
  'BR',
]);

export function nationalTeamBadgeSrc(isoCode: string): string | null {
  const upper = isoCode.toUpperCase();
  if (!BADGE_CODES.has(upper)) return null;
  return `/national-team-badges/${upper.toLowerCase()}.webp`;
}
