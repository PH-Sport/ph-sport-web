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
  'players.club.none': 'No club',
  'players.back': 'Back to players',
  'players.empty': 'No players available.',
  'players.detail.bioEmpty': 'More about this profile coming soon.',

  // --- Talents (page V3) ---
  'talents.eyebrow': '— Talents',
  'talents.title': 'The ',
  'talents.titleAccent': 'roster',
  'talents.lead': 'Elite footballers with international projection. Each career, a distinct project.',
  'talents.search.placeholder': 'Search by name…',
  'talents.search.label': 'Search players',
  'talents.search.clear': 'Clear search',
  'talents.sort.label': 'Sort',
  'talents.sort.default': 'Default',
  'talents.sort.az': 'A-Z',
  'talents.sort.za': 'Z-A',
  'talents.empty.filter': 'No results for your search.',
  'talents.reset': 'Clear filters',

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
  'services.subtitle': 'Six pillars backing the footballer\u2019s career: press, performance, media, family office, psychology and action plan.',
  'services.items.press.title': 'Press',
  'services.items.press.body': 'Public image, media relations and strategic positioning of the player at every stage.',
  'services.items.press.short': 'Image, media and positioning',
  'services.items.performance.title': 'Performance',
  'services.items.performance.body': 'Physical analysis, continuous monitoring and optimisation of athletic performance.',
  'services.items.performance.short': 'Physical analysis and optimisation',
  'services.items.media.title': 'Media',
  'services.items.media.body': 'Digital strategy, content creation and social media management to build the personal brand.',
  'services.items.media.short': 'Content, socials and personal brand',
  'services.items.familyOffice.title': 'Family Office',
  'services.items.familyOffice.body': 'Wealth management, tax planning and financial structure for the player and their family.',
  'services.items.familyOffice.short': 'Wealth, tax and structure',
  'services.items.psychology.title': 'Sport Psychology',
  'services.items.psychology.body': 'Mental preparation, pressure management and competitive support throughout the season.',
  'services.items.psychology.short': 'Mental prep and pressure management',
  'services.items.actionPlan.title': 'Action Plan',
  'services.items.actionPlan.body': 'Short, medium and long-term career plan with clear milestones and decisions taken with judgment.',
  'services.items.actionPlan.short': 'Career milestones, with judgment',
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
