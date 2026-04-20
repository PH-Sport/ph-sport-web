// src/i18n/en.ts
// Traducciones al inglés. Debe tener las mismas claves que es.ts.
// Si una clave falta, useTranslations() hace fallback al español automáticamente.

import type { TranslationKey } from './es';

const en: Record<TranslationKey, string> = {
  // --- SEO / Meta ---
  'site.name': 'PHSPORT',
  'site.tagline': 'Now. Next. Forever Football.',
  'site.description': 'Sports representation agency specialised in football. We manage careers, negotiate contracts and support players at every stage of their journey.',

  // --- Navegación ---
  'nav.home': 'Home',
  'nav.players': 'Players',
  'nav.team': 'Team',
  'nav.services': 'Services',
  'nav.about': 'About',
  'nav.aria.main': 'Main navigation',
  'nav.aria.mobile': 'Mobile navigation',
  'nav.lang.switch': 'Cambiar a español',
  'nav.lang.label': 'ES',
  'nav.lang.labelMobile': 'Español',

  // --- Hero ---
  'hero.claim': 'Brands add up, but people make the mark',
  'hero.tagline': 'Now. Next. Forever Football.',

  // --- Hero (redesign V3) ---
  'hero.claim.lead': 'Now. Next.',
  'hero.claim.accent': 'Forever Football.',
  'hero.scroll.label': 'Scroll',

  // --- Inicio (secciones) ---
  'home.players.cta': 'View all players',

  // --- Home: Talents (mini section) ---
  'home.players.eyebrow': '02 · Talent',
  'home.players.title': 'The roster.',
  'home.players.titleAccent': 'roster',
  'home.players.lead': 'Professional footballers with international projection. Each career, its own project.',

  // --- Home: Services (accordion) ---
  'home.services.eyebrow': '03 · Services',
  'home.services.title': 'Representation with purpose.',
  'home.services.lead': 'Six pillars behind every player\u2019s career. Explore each area.',
  'home.services.cta': 'See all services',

  // --- Home: About (editorial block) ---
  'home.about.eyebrow': '04 · About PHSPORT',
  'home.about.title': 'Brands add up,',
  'home.about.titleAccent': 'but people make the mark.',
  'home.about.body': 'We are a football-only representation agency. We manage the present, future and legacy of every player with closeness, rigour and excellence.',
  'home.about.cta': 'Get to know us',
  'home.about.stats.aria': 'PHSPORT figures',
  'home.about.stats.team.value': '21',
  'home.about.stats.team.label': 'Team members',
  'home.about.stats.countries.value': '6',
  'home.about.stats.countries.label': 'Countries',
  'home.about.stats.service.value': '360°',
  'home.about.stats.service.label': 'Support',
  'home.about.values.aria': 'PHSPORT values',
  'home.about.values.v1': 'Excellence',
  'home.about.values.v2': 'Closeness',
  'home.about.values.v3': 'Rigour',

  // --- Home: Contact ---
  'home.contact.eyebrow': '05 · Contact',
  'home.contact.title': 'Let\u2019s talk.',
  'home.contact.lead': 'Whether you represent a player, a club, or a brand, drop us a line. We reply within 48 hours.',
  'home.contact.email': 'info@phsport.es',
  'home.contact.emailLabel': 'Direct email',
  'home.contact.form.name': 'Name',
  'home.contact.form.email': 'Email',
  'home.contact.form.role': 'Role',
  'home.contact.form.role.player': 'Player',
  'home.contact.form.role.club': 'Club',
  'home.contact.form.role.brand': 'Brand / Sponsor',
  'home.contact.form.role.other': 'Other',
  'home.contact.form.message': 'Message',
  'home.contact.form.submit': 'Send',

  // --- Jugadores ---
  'players.title': 'Talent we represent',
  'players.subtitle':
    'Elite players and coaches united by the same professional vision.',
  'players.subsection.players': 'Players',
  'players.subsection.coaches': 'Coaches',
  'players.tabs.aria': 'Choose between players and coaches',
  'players.club.none': 'No club',
  'players.sort.label': 'Order',
  'players.sort.aria': 'Choose list order',
  'players.sort.option.default': 'Default',
  'players.sort.option.az': 'A-Z',
  'players.sort.option.za': 'Z-A',
  'players.back': 'Back to players',
  'players.empty': 'No players available.',
  'players.detail.bioEmpty': 'More about this profile coming soon.',

  // --- Sobre nosotros ---
  'about.title': 'About PHSPORT',
  'about.subtitle': 'A representation agency built on three principles: present, future and legacy.',
  'about.block1.title': 'Now.',
  'about.block1.body': 'We manage the day-to-day for every player with personalised attention. Contracts, image, performance.',
  'about.block2.title': 'Next.',
  'about.block2.body': 'We plan careers over the mid and long term. Every transfer is a strategic step, not an isolated opportunity.',
  'about.block3.title': 'Forever Football.',
  'about.block3.body': 'Football is our passion and our commitment. We stand by our players beyond their professional careers.',

  // --- Equipo (página) ---
  'team.title': 'PHSPORT team',
  'team.subtitle': 'The people behind every career and every project.',
  'team.placeholderName': 'TBC',
  'team.placeholderRole': 'Role',

  // --- Servicios (página) ---
  'services.title': '360 services',
  'services.subtitle':
    'Five pillars to support a player\u2019s career: representation, planning, advisory, brand, and international reach.',
  'services.items.representation.title': 'Representation and intermediation',
  'services.items.representation.body':
    'We build short-, mid-, and long-term plans tailored to each player\u2019s profile, goals, and stage of their career.',
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
    'We grow the player\u2019s personal brand across social and traditional media, and shape strategic sponsor partnerships.',
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
  'footer.pages': 'Pages',
  'footer.rights': 'All rights reserved.',
  'footer.contact': 'Contact',
  'footer.email': 'info@phsport.es',
  'footer.nav.label': 'Footer navigation',
  'footer.social.label': 'Social media',
  'footer.social.instagram': 'Instagram',
  'footer.social.linkedin': 'LinkedIn',
  'footer.social.x': 'X',

  // --- Accesibilidad ---
  'a11y.skip': 'Skip to main content',
  'a11y.logo': 'PHSPORT — Go to home',
  'a11y.menu.open': 'Open menu',
  'a11y.menu.close': 'Close menu',
  'a11y.close': 'Close',
};

export default en;
