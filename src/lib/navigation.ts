import type { TranslationKey } from '@/i18n/es';

export interface NavItem {
  labelKey: TranslationKey;
  href: { es: string; en: string };
}

export const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.home',     href: { es: '/',               en: '/en/' } },
  { labelKey: 'nav.players',  href: { es: '/jugadores/',     en: '/en/players/' } },
  { labelKey: 'nav.services', href: { es: '/servicios',      en: '/en/services' } },
  { labelKey: 'nav.about',    href: { es: '/sobre-nosotros', en: '/en/about' } },
];

export const PLAYERS_HREFS = ['/jugadores/', '/en/players/'] as const;
