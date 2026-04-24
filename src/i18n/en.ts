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
  'nav.players': 'Talents',
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
  'home.players.cta': 'Talents',

  // --- Home: Talents (mini section) ---
  'home.players.eyebrow': '02 · Talent',
  'home.players.title': 'The roster.',
  'home.players.titleAccent': 'roster',
  'home.players.lead': 'Talent in every category. A unique project for every career.',

  // --- Home: Services (accordion) ---
  'home.services.eyebrow': '03 · Services',
  'home.services.title': 'Representation with purpose.',
  'home.services.lead': 'Five management areas and an integrated action plan supporting the player\u2019s career.',

  // Accordion areas (short hints, not full descriptions)
  'home.services.area.management.title': 'Representation & intermediation',
  'home.services.area.management.body': 'We negotiate and protect every term of the player\u2013club relationship.',
  'home.services.area.career.title': 'Career planning',
  'home.services.area.career.body': 'Context and sporting momentum to shape a coherent, ambitious trajectory.',
  'home.services.area.international.title': 'International access',
  'home.services.area.international.body': 'Owned offices in six key markets and connections around the world.',
  'home.services.area.comms.title': 'Communication & marketing',
  'home.services.area.comms.body': 'The player\u2019s personal brand on and off the pitch, built with an editorial approach.',
  'home.services.area.legal.title': 'Legal & financial advisory',
  'home.services.area.legal.body': 'Contracts, image, taxation and wealth \u2014 one dedicated structure.',

  // Action plan (featured row + sub-areas grid on expand)
  'home.services.actionPlan.eyebrow': 'In addition',
  'home.services.actionPlan.title': 'Action plan',
  'home.services.actionPlan.press.title': 'Press',
  'home.services.actionPlan.press.b1': 'Image and reputation management',
  'home.services.actionPlan.press.b2': 'Media relations',
  'home.services.actionPlan.press.b3': 'Player positioning',
  'home.services.actionPlan.media.title': 'Media',
  'home.services.actionPlan.media.b1': 'Digital communication strategy',
  'home.services.actionPlan.media.b2': 'Content creation',
  'home.services.actionPlan.media.b3': 'Social media management',
  'home.services.actionPlan.psych.title': 'Psychology',
  'home.services.actionPlan.psych.b1': 'High-performance mental preparation',
  'home.services.actionPlan.psych.b2': 'Pressure and habits management',
  'home.services.actionPlan.psych.b3': 'Competitive support',
  'home.services.actionPlan.performance.title': 'Performance',
  'home.services.actionPlan.performance.b1': 'Physical and performance analysis',
  'home.services.actionPlan.performance.b2': 'Continuous monitoring',
  'home.services.actionPlan.performance.b3': 'Performance optimization',
  'home.services.actionPlan.familyOffice.title': 'Family Office',
  'home.services.actionPlan.familyOffice.b1': 'Wealth management',
  'home.services.actionPlan.familyOffice.b2': 'Financial and tax planning',
  'home.services.actionPlan.familyOffice.b3': 'Player\u2019s administrative structure',
  'home.services.cta': 'Services',

  // --- Home: About (editorial block) ---
  'home.about.eyebrow': '04 · About PHSPORT',
  'home.about.title': 'Brands add up,',
  'home.about.titleAccent': 'but people make the mark.',
  'home.about.body': 'We are a football-only representation agency. We build and protect the career of every player with closeness, rigour and excellence.',
  'home.about.cta': 'Get to know us',
  'home.about.stats.aria': 'PHSPORT figures',
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
  'home.contact.email': 'info@phsport.es',
  'home.contact.emailLabel': 'Direct email',

  // --- Jugadores ---
  'players.title': 'Talent we represent',
  'players.subtitle': 'Players and coaches united by the same vision.',
  'players.back': 'Back to talents',
  'players.empty': 'No players available.',
  'players.detail.bioEmpty': 'More about this profile coming soon.',

  // --- Talents (page V3) ---
  'talents.eyebrow': '02 · Talents',
  'talents.title': 'The ',
  'talents.titleAccent': 'roster',
  'talents.lead': 'Talent in every category. A unique project for every career.',
  'talents.search.placeholder': 'Search by name…',
  'talents.search.label': 'Search talents',
  'talents.search.clear': 'Clear search',
  'talents.search.close': 'Close search',
  'talents.role.label': 'Role',
  'talents.role.trigger': 'View',
  'talents.role.all': 'All',
  'talents.role.players': 'Players',
  'talents.role.coaches': 'Coaches',
  'talents.sort.label': 'Sort',
  'talents.sort.trigger': 'Sort',
  'talents.sort.default': 'Default',
  'talents.sort.az': 'A-Z',
  'talents.sort.za': 'Z-A',
  'talents.empty.filter': 'No results for your search.',
  'talents.reset': 'Clear filters',

  // --- Sobre nosotros ---
  'about.title': 'About PHSPORT',
  'about.subtitle': 'Strategic representation, international reach, and long-term focus.',
  // Hero split
  'about.hero.eyebrow': '04 · About us',
  'about.hero.titlePre': 'Representing with ',
  'about.hero.titleAccent': 'purpose',
  'about.hero.titlePost': '.',
  'about.hero.body1': "PHSPORT is a football agency that builds and protects players' careers through strategic representation, international reach, and long-term focus.",
  'about.hero.body2': "Beyond representation, we build an integral working structure that supports the player across every key area of their career.",
  'about.hero.ctaServices': 'Our services',
  'about.hero.ctaContact': 'Get in touch',
  'about.hero.values': 'EXCELLENCE · CLOSENESS · RIGOR',
  'about.hero.caption': 'PHSPORT · IDENTITY',
  'about.hero.imageAlt': 'The PHSPORT team facing the illuminated PH logo',
  // Historia
  'about.historia.titlePre': 'We manage your career. We look after your ',
  'about.historia.titleAccent1': 'present',
  'about.historia.titleMid': ' and plan your ',
  'about.historia.titleAccent2': 'future',
  'about.historia.titlePost': '.',
  'about.historia.p1': "PHSPORT represents footballers with potential and supports them with integral, strategic, and personalized management to drive their growth on and off the pitch.",
  'about.historia.p2': 'We work across five key areas: representation and intermediation, career planning, access to clubs and international opportunities, communication and marketing, and legal and financial advisory.',
  'about.historia.p3': "Beyond representation, we build an integral working structure — press, media, sports psychology, performance, and family office — to support every stage of the player's career.",
  'about.historia.p4': "At PHSPORT we don't just represent players — we build structures that maximize their performance, stability, and long-term projection.",
  // Equipo (section header within About)
  'about.team.eyebrow': 'THE TEAM',
  'about.team.titlePre': '',
  'about.team.titleAccent': 'Who',
  'about.team.titlePost': ' we are.',
  'about.team.meta': '21 MEMBERS · 6 COUNTRIES',
  // Presencia
  'about.presencia.eyebrow': '05 · Presence',
  'about.presencia.madridLabel': 'HEADQUARTERS · ES',
  'about.presencia.internationalLabel': 'INTERNATIONAL PRESENCE WITH OFFICES IN:',
  'about.presencia.madridTitle': 'Madrid.',
  'about.presencia.country.portugal': 'Portugal',
  'about.presencia.country.uk': 'United Kingdom',
  'about.presencia.country.alemania': 'Germany',
  'about.presencia.country.arabia': 'Saudi Arabia',
  'about.presencia.country.uruguay': 'Uruguay',

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
  'services.hero.lead': 'Strategic representation, international reach, and long-term focus. Five management areas and six operating pillars to support the player at every stage of their career.',

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
  'services.areas.items.international.lead': 'Owned offices in six key markets. We open real doors and stand by the player through every adaptation.',
  'services.areas.items.international.bullet1': 'Market strategy and positioning',
  'services.areas.items.international.bullet2': 'Presence across 6 countries',
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
  'services.manifest.bodyLead': 'At PHSPORT we represent careers',
  'services.manifest.bodyAccent': 'with vision, judgment, and long-term commitment',
  'services.manifest.bodyTrail': '.',


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
