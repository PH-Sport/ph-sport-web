import type { Lang } from '@/i18n/utils';

export type SortMode = 'default' | 'az' | 'za';

export function parseSortParam(value: string | null): SortMode {
  if (value === 'az' || value === 'za') return value;
  return 'default';
}

function localeForLang(lang: Lang): string {
  return lang === 'en' ? 'en' : 'es';
}

/**
 * Orden por nombre (`localeCompare`); desempate estable por `slug`.
 * No muta el array de entrada.
 */
export function sortRosterByName<T extends { name: string; slug: string }>(
  items: T[],
  mode: SortMode,
  lang: Lang,
): T[] {
  if (mode === 'default') return [...items];
  const locale = localeForLang(lang);
  const copy = [...items];
  copy.sort((a, b) => {
    const byName = a.name.localeCompare(b.name, locale, { sensitivity: 'base' });
    if (byName !== 0) return mode === 'az' ? byName : -byName;
    const bySlug = a.slug.localeCompare(b.slug, locale, { sensitivity: 'base' });
    return mode === 'az' ? bySlug : -bySlug;
  });
  return copy;
}
