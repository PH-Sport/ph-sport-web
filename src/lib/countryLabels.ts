import type { Lang } from '@/i18n/utils';

/**
 * Etiqueta accesible con nombres de país según idioma (ISO 3166-1 alpha-2).
 */
export function formatNationalityAriaLabel(codes: string[], lang: Lang): string {
  if (!codes.length) return '';
  const locale = lang === 'en' ? 'en' : 'es';
  const dn = new Intl.DisplayNames([locale], { type: 'region' });
  return codes
    .map((c) => dn.of(c.toUpperCase()) ?? c.toUpperCase())
    .join(', ');
}
