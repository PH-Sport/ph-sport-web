// src/i18n/it.ts
// Traducciones al italiano. Debe tener las mismas claves que es.ts.
// Si una clave falta, useTranslations() hace fallback al español automáticamente.
//
// Traducción hecha desde el español sin revisión nativa: pendiente de que la lea
// alguien que hable italiano antes de publicarla (docs/hallazgos-abiertos.md).

import type { TranslationKey } from './es';

const it: Record<TranslationKey, string> = {
  // --- SEO / Meta ---
  'site.name': 'PHSPORT',
  'site.tagline': 'Now. Next. Forever Football.',
  'site.description': 'Agenzia di rappresentanza sportiva specializzata nel calcio. Gestiamo carriere, negoziamo contratti e accompagniamo i giocatori in ogni fase del loro percorso.',

  // --- Navegación ---
  'nav.home': 'Home',
  'nav.players': 'Talenti',
  'nav.services': 'Servizi',
  'nav.about': 'Chi siamo',
  'nav.aria.main': 'Navigazione principale',
  'nav.aria.mobile': 'Navigazione mobile',
  'nav.lang.menu': 'Cambia lingua',

  // --- Hero ---
  // «Segnare» es marcar un gol y dejar huella, como el «marcan» del original.
  'hero.claim': 'I marchi contano, ma sono le persone a segnare',
  'hero.tagline': 'Now. Next. Forever Football.',

  // --- Hero (redesign V3) ---
  'hero.claim.lead': 'Now. Next.',
  'hero.claim.accent': 'Forever Football.',
  'hero.scroll.label': 'Scroll',

  // --- Inicio (secciones) ---
  'home.players.cta': 'Talenti',

  // --- Home: Talenti (mini-sección) ---
  'home.players.eyebrow': '02 · Talenti',
  'home.players.title': 'Il roster.',
  'home.players.titleAccent': 'roster',
  'home.players.lead': 'Talento in ogni categoria. Un progetto unico per ogni carriera.',

  // --- Home: Servizi (acordeón) ---
  'home.services.eyebrow': '03 · Servizi',
  'home.services.title': 'Rappresentiamo con uno scopo.',
  'home.services.lead': 'Cinque aree di gestione e un piano integrato a sostegno della carriera del giocatore.',
  'home.services.cta': 'Servizi',

  // Áreas del acordeón (hints cortos, no descripción completa)
  'home.services.area.management.title': 'Rappresentanza e intermediazione',
  'home.services.area.management.body': 'Negoziamo e tuteliamo ogni termine del rapporto tra giocatore e club.',
  'home.services.area.career.title': 'Pianificazione della carriera',
  'home.services.area.career.body': 'Contesto e momento sportivo per tracciare un percorso coerente e ambizioso.',
  'home.services.area.international.title': 'Accesso internazionale',
  'home.services.area.international.body': 'Uffici propri in sette mercati chiave e contatti in tutto il mondo.',
  'home.services.area.comms.title': 'Comunicazione e marketing',
  'home.services.area.comms.body': 'Il brand personale del giocatore dentro e fuori dal campo, con un approccio editoriale.',
  'home.services.area.legal.title': 'Consulenza legale e finanziaria',
  'home.services.area.legal.body': 'Contratti, immagine, fiscalità e patrimonio con una struttura dedicata.',

  // Plan de Acción (fila destacada + grid de sub-áreas al desplegar)
  'home.services.actionPlan.eyebrow': 'Inoltre',
  'home.services.actionPlan.title': 'Piano d’azione',
  'home.services.actionPlan.press.title': 'Stampa',
  'home.services.actionPlan.press.b1': 'Gestione dell’immagine e della reputazione',
  'home.services.actionPlan.press.b2': 'Rapporti con i media',
  'home.services.actionPlan.press.b3': 'Posizionamento del giocatore',
  'home.services.actionPlan.media.title': 'Media',
  'home.services.actionPlan.media.b1': 'Strategia di comunicazione digitale',
  'home.services.actionPlan.media.b2': 'Creazione di contenuti',
  'home.services.actionPlan.media.b3': 'Gestione dei social media',
  'home.services.actionPlan.psych.title': 'Psicologia',
  'home.services.actionPlan.psych.b1': 'Preparazione mentale ad alto rendimento',
  'home.services.actionPlan.psych.b2': 'Gestione della pressione e delle abitudini',
  'home.services.actionPlan.psych.b3': 'Supporto in competizione',
  'home.services.actionPlan.performance.title': 'Performance',
  'home.services.actionPlan.performance.b1': 'Analisi fisica e della performance',
  'home.services.actionPlan.performance.b2': 'Monitoraggio continuo',
  'home.services.actionPlan.performance.b3': 'Ottimizzazione della performance',
  'home.services.actionPlan.familyOffice.title': 'Family Office',
  'home.services.actionPlan.familyOffice.b1': 'Gestione patrimoniale',
  'home.services.actionPlan.familyOffice.b2': 'Pianificazione finanziaria e fiscale',
  'home.services.actionPlan.familyOffice.b3': 'Struttura amministrativa del giocatore',

  // --- Home: Chi siamo (bloque editorial) ---
  'home.about.eyebrow': '04 · Chi è PHSPORT',
  'home.about.title': 'I marchi contano,',
  'home.about.titleAccent': 'ma sono le persone a segnare.',
  'home.about.body': 'Siamo un’agenzia di rappresentanza specializzata nel calcio. Costruiamo e tuteliamo la carriera di ogni giocatore con vicinanza, rigore ed eccellenza.',
  'home.about.cta': 'Scopri chi siamo',
  'home.about.stats.aria': 'I numeri di PHSPORT',
  'home.about.stats.countries.value': '7',
  'home.about.stats.countries.label': 'Paesi',
  'home.about.stats.service.value': '360°',
  'home.about.stats.service.label': 'Accompagnamento',
  'home.about.values.aria': 'I valori di PHSPORT',
  'home.about.values.v1': 'Eccellenza',
  'home.about.values.v2': 'Vicinanza',
  'home.about.values.v3': 'Rigore',

  // --- Home: Contatti ---
  'home.contact.eyebrow': '05 · Contatti',
  'home.contact.title': 'Parliamone.',
  'home.contact.email': 'info@phsport.es',
  'home.contact.emailLabel': 'Email diretta',

  // --- Jugadores ---
  'players.title': 'I talenti che rappresentiamo',
  'players.subtitle': 'Giocatori e allenatori uniti da un’unica visione.',
  'players.back': 'Torna ai talenti',
  'players.empty': 'Nessun giocatore disponibile.',
  'players.detail.bioEmpty': 'Presto più informazioni su questo profilo.',

  // --- Talenti (página V3) ---
  'talents.eyebrow': '02 · Talenti',
  'talents.title': 'Il ',
  'talents.titleAccent': 'roster',
  'talents.lead': 'Talento in ogni categoria. Un progetto unico per ogni carriera.',
  'talents.search.placeholder': 'Cerca per nome…',
  'talents.search.label': 'Cerca talenti',
  'talents.search.clear': 'Cancella la ricerca',
  'talents.search.close': 'Chiudi la ricerca',
  'talents.role.label': 'Ruolo',
  'talents.role.trigger': 'Mostra',
  'talents.role.all': 'Tutti',
  'talents.role.players': 'Giocatori',
  'talents.role.coaches': 'Allenatori',
  'talents.sort.label': 'Ordine',
  'talents.sort.trigger': 'Ordina',
  'talents.sort.default': 'Predefinito',
  'talents.sort.az': 'A-Z',
  'talents.sort.za': 'Z-A',
  'talents.empty.filter': 'Nessun risultato per la tua ricerca.',
  'talents.reset': 'Cancella i filtri',

  // --- Chi siamo ---
  'about.title': 'Chi è PHSPORT',
  'about.subtitle': 'Rappresentanza strategica, visione internazionale e approccio a lungo termine.',
  // Hero split
  'about.hero.eyebrow': '04 · Chi siamo',
  'about.hero.titlePre': '',
  'about.hero.titleAccent': 'Rappresentare',
  'about.hero.titlePost': ' con uno scopo.',
  'about.hero.body1': 'PHSPORT è un’agenzia specializzata nella gestione integrale dei calciatori, nata per accompagnare il talento ambizioso dentro e fuori dal campo.',
  'about.hero.body2': 'Il nostro team riunisce specialisti in rappresentanza, scouting, marketing, analisi e sviluppo professionale, e offre al giocatore tutto ciò di cui ha bisogno per competere al massimo livello.',
  'about.hero.body3': 'Lavoriamo con una visione internazionale e una mentalità moderna, mettendo in contatto talento, opportunità e strategia in un contesto sempre più competitivo. Non ci limitiamo ad accompagnare carriere sportive: aiutiamo a costruire percorsi con un’identità propria, ambizione e uno scopo.',
  'about.hero.values': 'ECCELLENZA · VICINANZA · RIGORE',
  'about.hero.caption': 'PHSPORT · IDENTITÀ',
  'about.hero.imageAlt': 'Il team PHSPORT davanti al logo PH illuminato',
  // Manifesto — desempaque del eslogan Now / Next / Forever Football
  'about.manifesto.eyebrow': 'Filosofia',
  'about.manifesto.blocks.now.idx': '01',
  'about.manifesto.blocks.now.title': 'Now.',
  'about.manifesto.blocks.now.body': 'Seguiamo ogni carriera in modo personalizzato, unendo strategia sportiva e una struttura professionale orientata a tutelare il presente del giocatore.',
  'about.manifesto.blocks.next.idx': '02',
  'about.manifesto.blocks.next.title': 'Next.',
  'about.manifesto.blocks.next.body': 'Creiamo opportunità internazionali e pianifichiamo ogni passo guardando al futuro, costruendo carriere che crescono senza perdere la rotta.',
  'about.manifesto.blocks.forever.idx': '03',
  'about.manifesto.blocks.forever.title': 'Forever Football.',
  'about.manifesto.blocks.forever.body': 'Crediamo che il talento abbia bisogno di una direzione, di decisioni intelligenti e di persone preparate ad accompagnarlo in ogni fase.',
  // Equipo (cabecera del bloque dentro de About)
  'about.team.eyebrow': 'IL TEAM',
  'about.team.titlePre': 'Chi ',
  'about.team.titleAccent': 'siamo',
  'about.team.titlePost': '.',
  // Ver la nota en es.ts: los países son donde opera PHSPORT, no las
  // nacionalidades de la plantilla, y qué más cambiar con ellos.
  'about.team.meta': '21 PERSONE · 7 PAESI',
  // Presencia
  'about.presencia.eyebrow': '05 · Presenza',
  'about.presencia.madridLabel': 'SEDE CENTRALE · ES',
  'about.presencia.internationalLabel': 'PRESENZA INTERNAZIONALE CON SEDI IN:',
  'about.presencia.madridTitle': 'Madrid.',
  'about.presencia.country.portugal': 'Portogallo',
  'about.presencia.country.uk': 'Regno Unito',
  'about.presencia.country.alemania': 'Germania',
  'about.presencia.country.italia': 'Italia',
  'about.presencia.country.arabia': 'Arabia Saudita',
  'about.presencia.country.uruguay': 'Uruguay',

  // --- Equipo (integrantes) ---
  'team.defaultLocation': 'SPAGNA',
  'team.countries.arabia': 'Arabia',
  'team.countries.uk': 'UK',
  'team.countries.portugal': 'Portogallo',
  'team.countries.alemania': 'Germania',
  'team.countries.uruguay': 'Uruguay',
  'team.countries.italia': 'Italia',
  'team.members.cogollos.role': 'CEO',
  'team.members.castello.role': 'Agente FIFA · Coordinatore Area Calcio',
  'team.members.castell.role': 'Agente FIFA · Area Calcio',
  'team.members.weggelaar.role': 'Area Calcio',
  'team.members.canoa.role': 'Area Calcio',
  'team.members.leon.role': 'Area Calcio',
  'team.members.armari.role': 'Area Calcio',
  'team.members.caserza.role': 'Agente FIFA · Area Calcio',
  'team.members.hernansanz.role': 'Agente FIFA · Area Calcio',
  'team.members.martin.role': 'Agente FIFA · Area Calcio',
  'team.members.lopez.role': 'Agente FIFA · Area Calcio',
  'team.members.alvarez.role': 'Area Calcio',
  'team.members.garcia.role': 'Area Calcio',
  'team.members.sancho.role': 'Area Calcio',
  'team.members.granados.role': 'Area Calcio',
  'team.members.gomez.role': 'Area Calcio',
  'team.members.toledo.role': 'Area Calcio',
  'team.members.marin.role': 'Area Calcio',
  'team.members.alcazar.role': 'Area Marketing e Social Media',
  'team.members.rodriguez.role': 'Area Finanza',
  'team.members.salles.role': 'Area Finanza',

  // --- Servizi (página) ---
  'services.title': 'Servizi 360',
  'services.subtitle': 'Sei pilastri per accompagnare la carriera del calciatore: stampa, performance, media, family office, psicologia e piano d’azione.',
  'services.items.press.title': 'Stampa',
  'services.items.press.body': 'Gestione dell’immagine e della reputazione, rapporti con i media e posizionamento pubblico del giocatore. Ogni apparizione è una scelta.',
  'services.items.performance.title': 'Performance',
  'services.items.performance.body': 'Analisi fisica e della performance. Monitoraggio continuo. Ottimizzazione del rendimento sportivo.',
  'services.items.media.title': 'Media',
  'services.items.media.body': 'Strategia di comunicazione digitale, creazione di contenuti e gestione dei social media. Definiamo la voce e l’universo visivo del giocatore.',
  'services.items.familyOffice.title': 'Family Office',
  'services.items.familyOffice.body': 'Gestione patrimoniale, pianificazione finanziaria e fiscale, struttura amministrativa del giocatore. Ciò che si costruisce deve durare più di una carriera.',
  'services.items.psychology.title': 'Psicologia',
  'services.items.psychology.body': 'Preparazione mentale ad alto rendimento, gestione della pressione e delle abitudini. Supporto continuo in competizione.',
  'services.items.actionPlan.title': 'Piano d’azione',
  'services.items.actionPlan.body': 'Gestione e revisione dei contratti. Strategia di mercato e posizionamento internazionale. Supporto integrato dentro e fuori dal campo. Adattamento a ogni fase della carriera.',

  // Hero
  'services.hero.eyebrow': '03 · Servizi',
  'services.hero.titleLead': 'Una squadra',
  'services.hero.titleRest': 'fuori dal ',
  'services.hero.titleAccent': 'campo',
  'services.hero.lead': 'Rappresentanza strategica, visione internazionale e approccio a lungo termine. Cinque aree di gestione e sei pilastri del modello operativo per accompagnare il giocatore in ogni fase della sua carriera.',

  // Áreas header
  'services.areas.eyebrow': 'Aree di gestione',
  'services.areas.kicker': '05 discipline · 01 squadra',
  'services.areas.titleLead': 'Gestiamo la tua carriera. Ci prendiamo cura del tuo ',
  'services.areas.titleAccent1': 'presente',
  'services.areas.titleMid': ' e pianifichiamo il tuo ',
  'services.areas.titleAccent2': 'futuro',
  'services.areas.titleTrail': '.',
  'services.areas.foot': 'ACCOMPAGNAMENTO 360º · SERVIZIO 365',
  'services.areas.leadLabel': 'Descrizione',

  // Áreas — 01 Rappresentanza e intermediazione
  'services.areas.items.management.title': 'Rappresentanza e intermediazione',
  'services.areas.items.management.lead': 'Negoziamo e tuteliamo tutti i termini del rapporto tra giocatore e club. La nostra missione è garantire le migliori condizioni possibili — sportive, economiche e personali — in ogni decisione.',
  'services.areas.items.management.bullet1': 'Negoziazione di contratti professionistici',
  'services.areas.items.management.bullet2': 'Rapporto diretto con club e dirigenti',
  'services.areas.items.management.bullet3': 'Tutela degli interessi sportivi ed economici',
  'services.areas.items.management.bullet4': 'Trasferimenti nazionali e internazionali',

  // Áreas — 02 Pianificazione della carriera
  'services.areas.items.career.title': 'Pianificazione della carriera',
  'services.areas.items.career.lead': 'Ogni decisione conta. Analizziamo opportunità, contesto competitivo e momento sportivo per costruire un percorso coerente, sostenibile e ambizioso.',
  'services.areas.items.career.bullet1': 'Decisioni sportive chiave',
  'services.areas.items.career.bullet2': 'Analisi delle opportunità e dell’evoluzione',
  'services.areas.items.career.bullet3': 'Costruzione di una carriera sostenibile',
  'services.areas.items.career.bullet4': 'Strategia a breve, medio e lungo termine',

  // Áreas — 03 Accesso internazionale
  'services.areas.items.international.title': 'Accesso internazionale',
  'services.areas.items.international.lead': 'Uffici propri in sette mercati chiave. Apriamo porte reali e accompagniamo il giocatore in ogni fase di adattamento.',
  'services.areas.items.international.bullet1': 'Strategia di mercato e posizionamento',
  'services.areas.items.international.bullet2': 'Presenza in 7 paesi',
  'services.areas.items.international.bullet3': 'Uffici in ESP, PT, UK, DE, IT, KSA e UY',
  'services.areas.items.international.bullet4': 'Adattamento a ogni fase della carriera',

  // Áreas — 04 Comunicazione e marketing
  'services.areas.items.comms.title': 'Comunicazione e marketing',
  'services.areas.items.comms.lead': 'Sviluppiamo il brand personale del giocatore dentro e fuori dal campo, con un approccio editoriale che rafforza la sua immagine pubblica e apre nuove fonti di reddito.',
  'services.areas.items.comms.bullet1': 'Sviluppo del brand personale',
  'services.areas.items.comms.bullet2': 'Strategia digitale e social media',
  'services.areas.items.comms.bullet3': 'Gestione dell’immagine pubblica',
  'services.areas.items.comms.bullet4': 'Attivazione delle sponsorizzazioni',

  // Áreas — 05 Consulenza legale e finanziaria
  'services.areas.items.legal.title': 'Consulenza legale e finanziaria',
  'services.areas.items.legal.lead': 'Una struttura legale e finanziaria dedicata: contratti, immagine, fiscalità e patrimonio. Tuteliamo ciò che si costruisce oggi perché duri ben oltre il ritiro.',
  'services.areas.items.legal.bullet1': 'Contratti e diritti d’immagine',
  'services.areas.items.legal.bullet2': 'Tutela del patrimonio',
  'services.areas.items.legal.bullet3': 'Ottimizzazione e pianificazione fiscale',
  'services.areas.items.legal.bullet4': 'Supervisione e controllo finanziario',

  // Model intro
  'services.model.eyebrow': 'Modello operativo PHSPORT',
  'services.model.titleLead': 'Oltre la rappresentanza, sviluppiamo una struttura ',
  'services.model.titleAccent': 'integrata',
  'services.model.titleTrail': '.',
  'services.model.lead': 'Sei pilastri specializzati che accompagnano il giocatore in tutte le aree chiave della sua carriera.',

  // Pillar tags
  'services.items.press.tag1': 'Immagine pubblica',
  'services.items.press.tag2': 'Media',
  'services.items.press.tag3': 'Posizionamento',
  'services.items.performance.tag1': 'Analisi fisica',
  'services.items.performance.tag2': 'Performance',
  'services.items.performance.tag3': 'Monitoraggio',
  'services.items.performance.tag4': 'Ottimizzazione',
  'services.items.media.tag1': 'Strategia digitale',
  'services.items.media.tag2': 'Contenuti',
  'services.items.media.tag3': 'Social media',
  'services.items.media.tag4': 'Brand personale',
  'services.items.familyOffice.tag1': 'Patrimonio',
  'services.items.familyOffice.tag2': 'Fiscalità',
  'services.items.familyOffice.tag3': 'Pianificazione',
  'services.items.familyOffice.tag4': 'Amministrazione',
  'services.items.psychology.tag1': 'Alto rendimento',
  'services.items.psychology.tag2': 'Pressione competitiva',
  'services.items.psychology.tag3': 'Abitudini',
  'services.items.actionPlan.tag1': 'Contratti',
  'services.items.actionPlan.tag2': 'Mercato internazionale',
  'services.items.actionPlan.tag3': 'Servizio 365',

  // Manifest
  'services.manifest.eyebrow': 'ACCOMPAGNAMENTO 360º · SERVIZIO 365',
  'services.manifest.bodyLead': 'In PHSPORT rappresentiamo carriere',
  'services.manifest.bodyAccent': 'con rigore, criterio e impegno',
  'services.manifest.bodyTrail': ' a lungo termine.',


  // --- Footer ---
  'footer.pages': 'Pagine',
  'footer.rights': 'Tutti i diritti riservati.',
  'footer.contact': 'Contatti',
  'footer.email': 'info@phsport.es',
  'footer.nav.label': 'Navigazione del piè di pagina',
  'footer.social.label': 'Social media',
  'footer.social.heading': 'Seguici',
  'footer.social.instagram': 'Instagram',
  'footer.social.linkedin': 'LinkedIn',
  'footer.legal.label': 'Note legali e privacy',
  'footer.legal.notice': 'Note legali',
  'footer.legal.privacy': 'Privacy',

  // --- Aviso Legal ---
  // Sin uso hoy: los textos legales no tienen versión italiana y el pie enlaza a
  // la inglesa (DECISIONS.md, 2026-10-01). Se rellenan porque el tipo exige todas
  // las claves.
  'legal.title': 'Note legali',
  'legal.description': 'Informazioni legali sul titolare di phsport.es ai sensi della legge spagnola LSSI-CE.',

  // --- Privacidad ---
  'privacy.title': 'Informativa sulla privacy',
  'privacy.description': 'Informazioni sul trattamento dei dati personali su phsport.es ai sensi del GDPR e della LOPDGDD.',

  // --- Accesibilidad ---
  'a11y.skip': 'Vai al contenuto principale',
  'a11y.logo': 'PHSPORT — Vai alla home',
  'a11y.menu.open': 'Apri il menu',
  'a11y.menu.close': 'Chiudi il menu',
  'a11y.close': 'Chiudi',
  'a11y.copyEmail': 'Copia email',
};

export default it;
