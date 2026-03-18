// src/i18n/en.ts
// Traducciones al inglés. Debe tener las mismas claves que es.ts.
// Si una clave falta, useTranslations() hace fallback al español automáticamente.

import type { TranslationKey } from './es';

const en: Record<TranslationKey, string> = {
  // --- SEO / Meta ---
  'site.name': 'PH Sport',
  'site.tagline': 'Now. Next. Forever Football.',
  'site.description': 'Sports representation agency specialised in football. We manage careers, negotiate contracts and support players at every stage of their journey.',

  // --- Navegación ---
  'nav.home': 'Home',
  'nav.players': 'Players',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.lang': 'Español',
  'nav.lang.href': '/',

  // --- Hero ---
  'hero.claim': 'Where talent builds its legacy',
  'hero.tagline': 'Now. Next. Forever Football.',
  'hero.cta.primary': 'Meet our players',
  'hero.cta.secondary': 'Who we are',

  // --- Jugadores ---
  'players.title': 'Our players',
  'players.subtitle': 'A portfolio of talent built with purpose.',
  'players.cta': 'View profile',
  'players.position.label': 'Position',
  'players.club.label': 'Club',
  'players.back': 'Back to players',
  'players.empty': 'No players available.',

  // --- Sobre nosotros ---
  'about.title': 'About PH Sport',
  'about.subtitle': 'A representation agency built on three principles: present, future and legacy.',
  'about.block1.title': 'Now.',
  'about.block1.body': 'We manage the day-to-day for every player with personalised attention. Contracts, image, performance.',
  'about.block2.title': 'Next.',
  'about.block2.body': 'We plan careers over the mid and long term. Every transfer is a strategic step, not an isolated opportunity.',
  'about.block3.title': 'Forever Football.',
  'about.block3.body': 'Football is our passion and our commitment. We stand by our players beyond their professional careers.',

  // --- Footer ---
  'footer.rights': 'All rights reserved.',
  'footer.contact': 'Contact',
  'footer.email': 'info@phsport.com',
  'footer.nav.label': 'Footer navigation',

  // --- Accesibilidad ---
  'a11y.skip': 'Skip to main content',
  'a11y.logo': 'PH Sport — Go to home',
  'a11y.menu.open': 'Open menu',
  'a11y.menu.close': 'Close menu',
  'a11y.player.photo': 'Photo of',
};

export default en;
