import type { TranslationKey } from '@/i18n/es';
import type { Lang } from '@/i18n/utils';

export interface NavItem {
  labelKey: TranslationKey;
  href: Record<Lang, string>;
}

export const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.home',     href: { es: '/',               en: '/en/',         it: '/it/' } },
  { labelKey: 'nav.players',  href: { es: '/talentos/',      en: '/en/talents/', it: '/it/talenti/' } },
  { labelKey: 'nav.services', href: { es: '/servicios',      en: '/en/services', it: '/it/servizi' } },
  { labelKey: 'nav.about',    href: { es: '/sobre-nosotros', en: '/en/about',    it: '/it/chi-siamo' } },
];
