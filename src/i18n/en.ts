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
  'hero.cta.primary': 'Meet our players',
  'hero.cta.secondary': 'Who we are',

  // --- Inicio (secciones) ---
  'home.players.cta': 'View all players',
  'home.services.title': 'How we support your career',
  'home.services.subtitle':
    'Three pillars of our 360 service. See the rest in full detail.',
  'home.services.cta': 'View all services',
  'home.about.title': 'PHSPORT in essence',
  'home.about.subtitle': 'Present, future, and legacy in one vision.',
  'home.about.lead':
    'We are a football-focused representation agency: contracts, image, and career planning.',
  'home.about.body':
    'On the About page we go deeper into our values and how we work with you every day.',
  'home.about.cta': 'About us',
  'home.about.statement': 'We manage your career, your present and your future.',
  'home.instagram.title': 'Instagram',
  'home.instagram.postAria': 'Open post on Instagram',

  // --- Home: Stats Strip ---
  'home.stats.aria': 'PHSPORT figures',
  'home.stats.players.value': '+100',
  'home.stats.players.label': 'Players',
  'home.stats.countries.value': '12',
  'home.stats.countries.label': 'Countries',
  'home.stats.service.value': '360°',
  'home.stats.service.label': 'Support',

  // --- Home: Manifesto ---
  'home.manifesto.eyebrow': 'Representing with purpose',
  'home.manifesto.statement': 'We build and protect the careers of our players through strategic representation, international vision and a long-term approach.',
  'home.manifesto.value1': 'Rigour',
  'home.manifesto.value2': 'Closeness',
  'home.manifesto.value3': 'Excellence',
  'home.manifesto.values.aria': 'PHSPORT values',

  // --- Home: 360° ---
  'home.360.label': '360° Support',
  'home.360.title': 'Beyond representation',
  'home.360.subtitle': 'We build a comprehensive structure that accompanies the player across every key area of their career.',
  'home.360.pillar1.title': 'Press',
  'home.360.pillar1.body': 'Public image, media relations and player positioning.',
  'home.360.pillar2.title': 'Media',
  'home.360.pillar2.body': 'Digital strategy, content creation and social media management.',
  'home.360.pillar3.title': 'Sports psychology',
  'home.360.pillar3.body': 'Mental preparation, pressure management and competitive support.',
  'home.360.pillar4.title': 'Performance',
  'home.360.pillar4.body': 'Physical analysis, ongoing monitoring and performance optimisation.',
  'home.360.pillar5.title': 'Family Office',
  'home.360.pillar5.body': 'Wealth management, tax planning and financial structure for the player.',
  'home.360.aria': 'The five pillars of PHSPORT support',

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
  'footer.pages': 'Pages',
  'footer.rights': 'All rights reserved.',
  'footer.contact': 'Contact',
  'footer.email': 'info@phsport.com',
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
