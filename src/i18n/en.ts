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
  // Hero split
  'about.hero.eyebrow': '04 · About us',
  'about.hero.titlePre': 'Representing with ',
  'about.hero.titleAccent': 'purpose',
  'about.hero.titlePost': '.',
  'about.hero.body1': "PHSPORT is a football agency that builds and protects players' careers through strategic representation, international reach, and long-term focus.",
  'about.hero.body2': "More than representing players, we develop integral structures that support the player across every key area of their career — on and off the pitch.",
  'about.hero.ctaServices': 'Our services',
  'about.hero.ctaContact': 'Get in touch',
  'about.hero.values': 'EXCELLENCE · CLOSENESS · RIGOR',
  'about.hero.caption': 'PHSPORT · MADRID HQ',
  // Historia
  'about.historia.titlePre': 'We manage your career. We look after your ',
  'about.historia.titleAccent1': 'present',
  'about.historia.titleMid': ' and plan your ',
  'about.historia.titleAccent2': 'future',
  'about.historia.titlePost': '.',
  'about.historia.p1': "PHSPORT represents footballers with potential and supports them with integral, strategic, and personalized management to drive their growth on and off the pitch.",
  'about.historia.p2': 'We work across five key areas: representation and intermediation, career planning, access to clubs and international opportunities, communication and marketing, and legal and financial advisory.',
  'about.historia.p3': "Beyond representation, we build an integral working structure — press, media, sports psychology, performance, and family office — to support every stage of the player's career.",
  'about.historia.p4': '365 Service: continuous availability and follow-up. Adaptation at every career stage. Integral support on and off the pitch.',
  // Equipo (section header within About)
  'about.team.eyebrow': 'THE TEAM',
  'about.team.titlePre': 'The ',
  'about.team.titleAccent': 'people',
  'about.team.titlePost': ' behind it.',
  'about.team.meta': '21 MEMBERS · 6 COUNTRIES',
  // Presencia
  'about.presencia.eyebrow': '05 · Presence',
  'about.presencia.madridLabel': 'HEADQUARTERS · ES',
  'about.presencia.internationalLabel': 'INTERNATIONAL PRESENCE',
  'about.presencia.madridTitle': 'Madrid.',
  'about.presencia.country.portugal': 'Portugal',
  'about.presencia.country.uk': 'United Kingdom',
  'about.presencia.country.alemania': 'Germany',
  'about.presencia.country.arabia': 'Saudi Arabia',
  'about.presencia.country.uruguay': 'Uruguay',
  // Cierre manifesto
  'about.manifesto.quotePre': "\"We don't just represent players.",
  'about.manifesto.quoteAccent': 'We build structures',
  'about.manifesto.quotePost': ' that maximize their performance, stability, and long-term projection."',
  'about.manifesto.sig': '— PHSPORT · 360° SUPPORT',

  // --- Equipo (integrantes) ---
  'team.defaultLocation': 'SPAIN',
  'team.countries.arabia': 'PH Arabia',
  'team.countries.uk': 'PH UK',
  'team.countries.portugal': 'PH Portugal',
  'team.countries.alemania': 'PH Germany',
  'team.countries.uruguay': 'Uruguay',
  'team.members.cogollos.role': 'CEO',
  'team.members.castello.role': 'FIFA Agent · Football Dept. Coordinator',
  'team.members.castell.role': 'FIFA Agent · Football Dept.',
  'team.members.weggelaar.role': 'Football Dept.',
  'team.members.canoa.role': 'Football Dept.',
  'team.members.leon.role': 'Football Dept.',
  'team.members.nanini.role': 'Football Dept.',
  'team.members.caserza.role': 'FIFA Agent · Football Dept. Spain',
  'team.members.hernansanz.role': 'FIFA Agent · Football Dept. Spain',
  'team.members.martin.role': 'FIFA Agent · Football Dept. Spain',
  'team.members.lopez.role': 'FIFA Agent · Football Dept. Spain',
  'team.members.alvarez.role': 'PH Spain Football Dept.',
  'team.members.garcia.role': 'PH Spain Football Dept.',
  'team.members.sancho.role': 'PH Spain Football Dept.',
  'team.members.granados.role': 'PH Spain Football Dept.',
  'team.members.gomez.role': 'PH Spain Football Dept.',
  'team.members.toledo.role': 'PH Spain Football Dept.',
  'team.members.marin.role': 'PH Spain Football Dept.',
  'team.members.alcazar.role': 'Marketing & Social Media Dept.',
  'team.members.rodriguez.role': 'Finance Dept.',
  'team.members.salles.role': 'Finance Dept.',

  // --- Servicios (página) ---
  'services.title': '360 services',
  'services.subtitle': 'Six pillars backing the footballer\u2019s career: press, performance, media, family office, psychology and action plan.',
  'services.items.press.title': 'Press',
  'services.items.press.body': 'Image and reputation management, media relations, and public positioning of the player. Every appearance is a decision.',
  'services.items.performance.title': 'Performance',
  'services.items.performance.body': 'Physical and performance analysis. Continuous tracking. Sporting performance optimization.',
  'services.items.media.title': 'Media',
  'services.items.media.body': 'Digital communication strategy, content creation, and social media management. We define the voice and visual universe of the player.',
  'services.items.familyOffice.title': 'Family Office',
  'services.items.familyOffice.body': 'Wealth management, financial and tax planning, and administrative structure for the player. What is built must last longer than a career.',
  'services.items.psychology.title': 'Psychology',
  'services.items.psychology.body': 'High-performance mental preparation, pressure management, and habits. Continuous competitive support.',
  'services.items.actionPlan.title': 'Action Plan',
  'services.items.actionPlan.body': 'Contract management and review. Market strategy and international positioning. Integrated support on and off the pitch. Adaptation at every career stage.',

  // Hero
  'services.hero.eyebrow': '03 · Services',
  'services.hero.titleLead': 'A team',
  'services.hero.titleRest': 'off the ',
  'services.hero.titleAccent': 'pitch',
  'services.hero.lead': 'Strategic representation, international reach, and long-term focus. Five management areas and six operating pillars — under one roof, aligned with one person: the player.',

  // Áreas header
  'services.areas.eyebrow': 'Management areas',
  'services.areas.kicker': '05 disciplines · 01 team',
  'services.areas.titleLead': 'We manage your career. We look after your ',
  'services.areas.titleAccent1': 'present',
  'services.areas.titleMid': ' and plan your ',
  'services.areas.titleAccent2': 'future',
  'services.areas.titleTrail': '.',
  'services.areas.foot': '360° SUPPORT · 365 SERVICE',
  'services.areas.leadLabel': 'Description',

  // Áreas — 01 Representation & intermediation
  'services.areas.items.management.title': 'Representation & intermediation',
  'services.areas.items.management.lead': 'We negotiate and protect every term of the relationship between player and club. Our mission is to secure the best possible conditions — sporting, financial, and personal — in every decision.',
  'services.areas.items.management.bullet1': 'Professional contract negotiation',
  'services.areas.items.management.bullet2': 'Direct relationship with clubs and decision-makers',
  'services.areas.items.management.bullet3': 'Protection of sporting and financial interests',
  'services.areas.items.management.bullet4': 'Domestic and international transfers',

  // Áreas — 02 Career planning
  'services.areas.items.career.title': 'Career planning',
  'services.areas.items.career.lead': 'Every decision counts. We analyze opportunities, competitive context, and sporting momentum to build a coherent, sustainable, and ambitious trajectory.',
  'services.areas.items.career.bullet1': 'Key sporting decisions',
  'services.areas.items.career.bullet2': 'Opportunity and evolution analysis',
  'services.areas.items.career.bullet3': 'Building a sustainable career',
  'services.areas.items.career.bullet4': 'Short, mid, and long-term strategy',

  // Áreas — 03 International access
  'services.areas.items.international.title': 'International access',
  'services.areas.items.international.lead': 'An active network in 12 countries and owned offices in six key markets. We open real doors and stand by the player through every adaptation.',
  'services.areas.items.international.bullet1': 'Market strategy and positioning',
  'services.areas.items.international.bullet2': 'Active network in 12 countries',
  'services.areas.items.international.bullet3': 'Offices in ESP, PT, UK, DE, KSA, and UY',
  'services.areas.items.international.bullet4': 'Adaptation at every career stage',

  // Áreas — 04 Communication & marketing
  'services.areas.items.comms.title': 'Communication & marketing',
  'services.areas.items.comms.lead': "We develop the player's personal brand on and off the pitch, with an editorial approach that strengthens their public image and opens new revenue streams.",
  'services.areas.items.comms.bullet1': 'Personal brand development',
  'services.areas.items.comms.bullet2': 'Digital and social strategy',
  'services.areas.items.comms.bullet3': 'Public image management',
  'services.areas.items.comms.bullet4': 'Sponsorship activation',

  // Áreas — 05 Legal and financial advisory
  'services.areas.items.legal.title': 'Legal and financial advisory',
  'services.areas.items.legal.lead': 'A dedicated legal and financial structure: contracts, image rights, taxation, and wealth. We care for what is built today so it lasts long after retirement.',
  'services.areas.items.legal.bullet1': 'Contracts and image rights',
  'services.areas.items.legal.bullet2': 'Wealth protection',
  'services.areas.items.legal.bullet3': 'Tax optimization and planning',
  'services.areas.items.legal.bullet4': 'Financial oversight and control',

  // Model intro
  'services.model.eyebrow': 'PHSPORT operating model',
  'services.model.titleLead': 'Beyond representation, we build an ',
  'services.model.titleAccent': 'integrated',
  'services.model.titleTrail': '.',
  'services.model.lead': 'Six specialized pillars that support the player across every key area of their career.',

  // Pillar tags
  'services.items.press.tag1': 'Public image',
  'services.items.press.tag2': 'Media',
  'services.items.press.tag3': 'Positioning',
  'services.items.performance.tag1': 'Physical analysis',
  'services.items.performance.tag2': 'Performance',
  'services.items.performance.tag3': 'Tracking',
  'services.items.performance.tag4': 'Optimization',
  'services.items.media.tag1': 'Digital strategy',
  'services.items.media.tag2': 'Content',
  'services.items.media.tag3': 'Social media',
  'services.items.media.tag4': 'Personal brand',
  'services.items.familyOffice.tag1': 'Wealth',
  'services.items.familyOffice.tag2': 'Tax',
  'services.items.familyOffice.tag3': 'Planning',
  'services.items.familyOffice.tag4': 'Administration',
  'services.items.psychology.tag1': 'High performance',
  'services.items.psychology.tag2': 'Competitive pressure',
  'services.items.psychology.tag3': 'Habits',
  'services.items.actionPlan.tag1': 'Contracts',
  'services.items.actionPlan.tag2': 'International market',
  'services.items.actionPlan.tag3': '365 service',

  // Manifest
  'services.manifest.eyebrow': '360° SUPPORT · 365 SERVICE',
  'services.manifest.bodyLead': "At PHSPORT we don't just represent players, ",
  'services.manifest.bodyAccent': 'we build structures',
  'services.manifest.bodyTrail': ' that maximize their performance, stability, and long-term projection.',

  // CTA
  'services.cta.eyebrow': 'SHALL WE BEGIN?',
  'services.cta.titleLead': 'A team for every decision. ',
  'services.cta.titleAccent': 'One conversation',
  'services.cta.titleTrail': ' to begin.',
  'services.cta.lead': 'Tell us about yourself or your club. We reply within 48 hours.',
  'services.cta.button': 'Contact the agency',

  // --- Footer ---
  'footer.pages': 'Pages',
  'footer.rights': 'All rights reserved.',
  'footer.contact': 'Contact',
  'footer.email': 'info@phsport.es',
  'footer.nav.label': 'Footer navigation',
  'footer.social.label': 'Social media',
  'footer.social.heading': 'Follow us',
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
