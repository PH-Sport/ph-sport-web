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
  'nav.team': 'Team',
  'nav.services': 'Services',
  'nav.about': 'About',
  'nav.contact': 'Contact',
  'nav.lang': 'Español',
  'nav.lang.href': '/',

  // --- Hero ---
  'hero.claim': 'Brands add up, but people make the mark',
  'hero.tagline': 'Now. Next. Forever Football.',
  'hero.cta.primary': 'Meet our players',
  'hero.cta.secondary': 'Who we are',

  // --- Jugadores ---
  'players.title': 'Talent we represent',
  'players.subtitle':
    'Elite players and coaches united by the same professional vision.',
  'players.subsection.players': 'Players',
  'players.subsection.coaches': 'Coaches',
  'players.tabs.aria': 'Choose between players and coaches',
  'players.cta': 'View profile',
  'players.club.label': 'Club',
  'players.club.none': 'No club',
  'players.sort.label': 'Order',
  'players.sort.aria': 'Choose list order',
  'players.sort.default': 'Agency order',
  'players.sort.az': 'A → Z',
  'players.sort.za': 'Z → A',
  'players.sort.option.default': 'Default',
  'players.sort.option.az': 'A-Z',
  'players.sort.option.za': 'Z-A',
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

  // --- Equipo (página) ---
  'team.title': 'PH Sport team',
  'team.subtitle': 'The people behind every career and every project.',
  'team.placeholderName': 'TBC',
  'team.placeholderRole': 'Role',

  // --- Servicios (página) ---
  'services.title': '360 services',
  'services.subtitle':
    'Five pillars to support a player’s career: representation, planning, advisory, brand, and international reach.',
  'services.items.representation.title': 'Representation and intermediation',
  'services.items.representation.body':
    'We build short-, mid-, and long-term plans tailored to each player’s profile, goals, and stage of their career.',
  'services.items.representation.short': 'A plan aligned with your profile and ambitions',
  'services.items.career.title': 'Career planning',
  'services.items.career.body':
    'We assess opportunities, set milestones, and support every decision with judgement, vision, and commitment.',
  'services.items.career.short': 'Clear direction at every step',
  'services.items.legal.title': 'Legal and financial advisory',
  'services.items.legal.body':
    'Support on contracts, transfers, and image rights, plus financial guidance for responsible management.',
  'services.items.legal.short': 'Contracts, image rights, and sound finances',
  'services.items.image.title': 'Image, communications, and marketing',
  'services.items.image.body':
    'We grow the player’s personal brand across social and traditional media, and shape strategic sponsor partnerships.',
  'services.items.image.short': 'Brand, channels, and sponsors',
  'services.items.scouting.title': 'Scouting and club network',
  'services.items.scouting.body':
    'We connect players with scouting networks and clubs at home and abroad to broaden their professional horizon.',
  'services.items.scouting.short': 'Opportunities beyond borders',
  'services.blocksAriaLabel': 'Service areas',
  'services.orbitInstructions':
    'Three-dimensional service carousel. Drag to rotate or open a card for details.',
  'services.modalAriaLabel': 'Service details',

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
  'a11y.close': 'Close',
  'a11y.player.photo': 'Photo of',
};

export default en;
