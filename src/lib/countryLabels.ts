import type { Lang } from '@/i18n/utils';

/**
 * Etiqueta accesible con nombres de país según idioma (ISO 3166-1 alpha-2) para banderas de selección.
 */
export function formatNationalTeamAriaLabel(codes: string[], lang: Lang): string {
  if (!codes.length) return '';
  const dn = new Intl.DisplayNames([lang], { type: 'region' });
  return codes
    .map((c) => dn.of(c.toUpperCase()) ?? c.toUpperCase())
    .join(', ');
}
