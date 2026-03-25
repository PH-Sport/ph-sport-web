// src/i18n/utils.ts
// Helper central de traducciones. Único punto de acceso para todos los componentes.

import es, { type TranslationKey } from './es';
import en from './en';

const translations = { es, en } as const;
export type Lang = keyof typeof translations;

export const defaultLang: Lang = 'es';
export const supportedLangs: Lang[] = ['es', 'en'];

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
 * Mapa de rutas ES ↔ EN.
 * FUENTE ÚNICA DE VERDAD: al añadir una página, añadir aquí un par.
 * Los mapas de búsqueda se generan automáticamente.
 */
const STATIC_ROUTES: Array<{ es: string; en: string }> = [
  { es: '/',               en: '/en/' },
  { es: '/sobre-nosotros', en: '/en/about' },
  { es: '/jugadores/',     en: '/en/players/' },
  { es: '/equipo',         en: '/en/team' },
  { es: '/servicios',      en: '/en/services' },
];

const DYNAMIC_ROUTES: Array<{ es: string; en: string }> = [
  { es: '/jugadores/:slug', en: '/en/players/:slug' },
];

function normalize(path: string): string {
  return path === '/' ? '/' : path.replace(/\/+$/, '');
}

const estoEnMap = new Map<string, string>();
const entoEsMap = new Map<string, string>();

for (const route of STATIC_ROUTES) {
  estoEnMap.set(normalize(route.es), route.en);
  entoEsMap.set(normalize(route.en), route.es);
}

/**
 * Devuelve el pathname equivalente en el otro idioma.
 * Usado por BaseLayout (hreflang) y por el selector de idioma del Header.
 *
 * Rutas estáticas: se buscan en los mapas generados desde STATIC_ROUTES.
 * Rutas dinámicas: se resuelven con DYNAMIC_ROUTES (mismo slug en ambos idiomas).
 *
 * /sobre-nosotros              → /en/about
 * /en/about                    → /sobre-nosotros
 * /jugadores/carlos-garcia     → /en/players/carlos-garcia
 * /en/players/carlos-garcia    → /jugadores/carlos-garcia
 */
export function getAlternateLangUrl(url: URL): string {
  const path = normalize(url.pathname);

  // 1. Buscar en rutas estáticas
  if (estoEnMap.has(path)) return estoEnMap.get(path)!;
  if (entoEsMap.has(path)) return entoEsMap.get(path)!;

  // 2. Buscar en rutas dinámicas
  for (const route of DYNAMIC_ROUTES) {
    const esPrefix = normalize(route.es.replace(':slug', ''));
    const enPrefix = normalize(route.en.replace(':slug', ''));

    if (path.startsWith(esPrefix + '/')) {
      const slug = path.slice(esPrefix.length + 1);
      return `${enPrefix}/${slug}`;
    }
    if (path.startsWith(enPrefix + '/')) {
      const slug = path.slice(enPrefix.length + 1);
      return `${esPrefix}/${slug}`;
    }
  }

  // 3. Fallback: ruta no mapeada (aviso en desarrollo)
  if (import.meta.env.DEV) {
    console.warn(`[i18n] Ruta sin mapear: "${url.pathname}". Añádela a STATIC_ROUTES o DYNAMIC_ROUTES en utils.ts.`);
  }
  return '/';
}
