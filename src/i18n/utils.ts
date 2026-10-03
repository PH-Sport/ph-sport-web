// src/i18n/utils.ts
// Helper central de traducciones. Único punto de acceso para todos los componentes.

import es, { type TranslationKey } from './es';
import en from './en';
import it from './it';

const translations = { es, en, it } as const;
export type Lang = keyof typeof translations;
export type { TranslationKey };

export const defaultLang: Lang = 'es';
export const supportedLangs: Lang[] = ['es', 'en', 'it'];

/** Nombre de cada idioma escrito en ese mismo idioma: así lo reconoce quien lo habla. */
export const LANG_NAMES: Record<Lang, string> = {
  es: 'Español',
  en: 'English',
  it: 'Italiano',
};

/**
 * Devuelve la función t() para el idioma indicado.
 * Si una clave no existe en el idioma solicitado, hace fallback al español.
 * Si tampoco existe en español, devuelve la clave como string (nunca rompe el build).
 *
 * Uso en páginas .astro:
 *   const t = useTranslations('es')
 *   t('nav.home') // → 'Inicio'
 */
export function useTranslations(lang: Lang) {
  return function t(key: TranslationKey): string {
    return (
      translations[lang][key] ??
      translations[defaultLang][key] ??
      key
    );
  };
}

/**
 * Extrae el idioma actual de la URL.
 * Uso: const lang = getLangFromUrl(Astro.url)
 */
export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  if (supportedLangs.includes(first as Lang)) {
    return first as Lang;
  }
  return defaultLang;
}

/**
 * Cada página y sus versiones en los otros idiomas.
 * FUENTE ÚNICA DE VERDAD: al añadir una página, añadir aquí su fila.
 *
 * Español e inglés existen siempre. El italiano falta a propósito en los textos
 * legales: no se traducen (DECISIONS.md, 2026-10-01).
 */
type RouteGroup = { es: string; en: string; it?: string };

const STATIC_ROUTES: RouteGroup[] = [
  { es: '/',               en: '/en/',              it: '/it/' },
  { es: '/sobre-nosotros', en: '/en/about',         it: '/it/chi-siamo' },
  { es: '/talentos/',      en: '/en/talents/',      it: '/it/talenti/' },
  { es: '/servicios',      en: '/en/services',      it: '/it/servizi' },
  { es: '/aviso-legal',    en: '/en/legal-notice' },
  { es: '/privacidad',     en: '/en/privacy' },
];

const HOME_ROUTES = STATIC_ROUTES[0] as Required<RouteGroup>;

function normalize(path: string): string {
  return path === '/' ? '/' : path.replace(/\/+$/, '');
}

function findRouteGroup(pathname: string): RouteGroup | undefined {
  const path = normalize(pathname);
  return STATIC_ROUTES.find((route) =>
    supportedLangs.some((code) => route[code] !== undefined && normalize(route[code]!) === path),
  );
}

/** Ruta de la home en cada idioma. */
export function getHomePath(lang: Lang): string {
  return HOME_ROUTES[lang];
}

/**
 * Las versiones que existen de la página actual, por idioma. Solo trae los
 * idiomas en que la página existe. Usado por BaseLayout (hreflang).
 *
 * /sobre-nosotros  → { es: '/sobre-nosotros', en: '/en/about', it: '/it/chi-siamo' }
 * /aviso-legal     → { es: '/aviso-legal', en: '/en/legal-notice' }
 */
export function getLangUrls(pathname: string): Partial<Record<Lang, string>> {
  const group = findRouteGroup(pathname);
  if (group) return group;

  if (import.meta.env.DEV) {
    console.warn(`[i18n] Ruta sin mapear: "${pathname}". Añádela a STATIC_ROUTES en utils.ts.`);
  }
  return HOME_ROUTES;
}

/**
 * Adónde lleva el selector de idioma: la misma página en ese idioma o, si no
 * existe en él, su home. Quien elige un idioma pide leer en ese idioma.
 */
export function getLangSwitchUrl(pathname: string, target: Lang): string {
  return getLangUrls(pathname)[target] ?? getHomePath(target);
}

/**
 * Traduce un enlace interno escrito en su ruta española, conservando la barra
 * final y el ancla tal como vienen. Si la página no existe en ese idioma, enlaza
 * a la versión inglesa: un enlace dentro del contenido promete esa página, y el
 * inglés es la variante pensada para quien no lee español.
 *
 * localizePath('/sobre-nosotros/', 'it') → '/it/chi-siamo/'
 * localizePath('/#contacto', 'en')       → '/en/#contacto'
 * localizePath('/aviso-legal', 'it')     → '/en/legal-notice'
 */
export function localizePath(esPath: string, lang: Lang): string {
  const [path, hash] = esPath.split('#');
  const group = STATIC_ROUTES.find((route) => normalize(route.es) === normalize(path));
  if (!group) {
    throw new Error(`[i18n] localizePath: "${esPath}" no está en STATIC_ROUTES.`);
  }
  const target = group[lang] ?? group.en;
  // La barra final sigue a la del enlace de entrada; la home la lleva siempre.
  const localized =
    normalize(path) === '/' ? target : `${normalize(target)}${path.endsWith('/') ? '/' : ''}`;
  return hash === undefined ? localized : `${localized}#${hash}`;
}
