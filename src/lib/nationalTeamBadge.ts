/**
 * Rutas locales de escudos para `nationalTeamCodes` (ISO 3166-1 alpha-2).
 * PNG uniformes en /public/national-team-badges/ (ver `npm run badges:png`).
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
  return `/national-team-badges/${upper.toLowerCase()}.png`;
}
