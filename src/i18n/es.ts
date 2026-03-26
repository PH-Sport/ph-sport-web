// src/i18n/es.ts
// Fuente de verdad de todas las cadenas en español.
// Añadir aquí primero, luego duplicar en en.ts.

const es = {
  // --- SEO / Meta ---
  'site.name': 'PH Sport',
  'site.tagline': 'Now. Next. Forever Football.',
  'site.description': 'Agencia de representación deportiva especializada en fútbol. Gestionamos carreras, negociamos contratos y acompañamos a los jugadores en cada etapa de su trayectoria.',

  // --- Navegación ---
  'nav.home': 'Inicio',
  'nav.players': 'Jugadores',
  'nav.team': 'Equipo',
  'nav.services': 'Servicios',
  'nav.about': 'Sobre nosotros',
  'nav.contact': 'Contacto',
  'nav.lang': 'English',          // Texto del switch de idioma
  'nav.lang.href': '/en/',        // Destino del switch

  // --- Hero ---
  'hero.claim': 'Las marcas suman, pero las personas marcan',
  'hero.tagline': 'Now. Next. Forever Football.',
  'hero.cta.primary': 'Conoce a nuestros jugadores',
  'hero.cta.secondary': 'Quiénes somos',

  // --- Jugadores ---
  'players.title': 'Talento que representamos',
  'players.subtitle':
    'Jugadores y entrenadores de élite, unidos por una misma visión profesional.',
  'players.subsection.players': 'Jugadores',
  'players.subsection.coaches': 'Entrenadores',
  'players.tabs.aria': 'Elegir entre jugadores y entrenadores',
  'players.filters.open': 'Filtros',
  'players.filters.sheetTitle': 'Lista y orden',
  'players.filters.close': 'Cerrar',
  'players.cta': 'Ver perfil',
  'players.club.label': 'Club',
  'players.club.none': 'Sin club',
  'players.sort.label': 'Orden',
  'players.sort.aria': 'Elegir orden de la lista',
  'players.sort.default': 'Orden de la agencia',
  'players.sort.az': 'A → Z',
  'players.sort.za': 'Z → A',
  'players.sort.option.default': 'Predeterminado',
  'players.sort.option.az': 'A-Z',
  'players.sort.option.za': 'Z-A',
  'players.back': 'Volver a jugadores',
  'players.empty': 'No hay jugadores disponibles.',

  // --- Sobre nosotros ---
  'about.title': 'Sobre PH Sport',
  'about.subtitle': 'Agencia de representación fundada sobre tres principios: presente, futuro y legado.',
  'about.block1.title': 'Now.',
  'about.block1.body': 'Gestionamos el día a día de cada jugador con atención personalizada. Contratos, imagen, rendimiento.',
  'about.block2.title': 'Next.',
  'about.block2.body': 'Planificamos la carrera a medio y largo plazo. Cada fichaje es un paso estratégico, no una oportunidad aislada.',
  'about.block3.title': 'Forever Football.',
  'about.block3.body': 'El fútbol es nuestra pasión y nuestro compromiso. Acompañamos a los jugadores más allá de su etapa profesional.',

  // --- Equipo (página) ---
  'team.title': 'Equipo PH Sport',
  'team.subtitle': 'Las personas que impulsan cada carrera y cada proyecto.',
  'team.placeholderName': 'Por definir',
  'team.placeholderRole': 'Rol',

  // --- Servicios (página) ---
  'services.title': 'Servicios 360',
  'services.subtitle':
    'Cinco pilares para acompañar la carrera del futbolista: representación, planificación, asesoría, imagen y proyección internacional.',
  'services.items.representation.title': 'Representación e intermediación',
  'services.items.representation.body':
    'Diseñamos un plan a corto, medio y largo plazo que se adapta al perfil, los objetivos y el momento profesional de cada futbolista.',
  'services.items.representation.short': 'Plan alineado con tu perfil y tus objetivos',
  'services.items.career.title': 'Planificación de carrera deportiva',
  'services.items.career.body':
    'Evaluamos oportunidades, fijamos hitos y acompañamos cada decisión con criterio, visión y compromiso.',
  'services.items.career.short': 'Decisiones con visión en cada etapa',
  'services.items.legal.title': 'Asesoramiento legal y financiero',
  'services.items.legal.body':
    'Apoyo jurídico en contratos, transferencias y derechos de imagen, junto a orientación financiera para una gestión responsable.',
  'services.items.legal.short': 'Contratos, imagen y finanzas con rigor',
  'services.items.image.title': 'Imagen, comunicación y marketing',
  'services.items.image.body':
    'Potenciamos la marca personal del jugador en redes y medios, y articulamos colaboraciones estratégicas con patrocinadores.',
  'services.items.image.short': 'Marca personal, redes y partners',
  'services.items.scouting.title': 'Red de scouting y clubes',
  'services.items.scouting.body':
    'Conectamos a nuestros jugadores con redes de scouting y clubes nacionales e internacionales para ampliar su proyección profesional.',
  'services.items.scouting.short': 'Oportunidades más allá de las fronteras',
  'services.blocksAriaLabel': 'Áreas de servicio',
  'services.orbitInstructions':
    'Carrusel de servicios en tres dimensiones. Arrastra para girar o abre una tarjeta para ver el detalle.',
  'services.modalAriaLabel': 'Detalle del servicio',
  // --- Footer ---
  'footer.rights': 'Todos los derechos reservados.',
  'footer.contact': 'Contacto',
  'footer.email': 'info@phsport.com',
  'footer.nav.label': 'Navegación de pie de página',

  // --- Accesibilidad ---
  'a11y.skip': 'Ir al contenido principal',
  'a11y.logo': 'PH Sport — Ir a inicio',
  'a11y.menu.open': 'Abrir menú',
  'a11y.menu.close': 'Cerrar menú',
  'a11y.close': 'Cerrar',
  'a11y.player.photo': 'Foto de',   // Uso: `${t('a11y.player.photo')} ${player.name}`
} as const;

export default es;
export type TranslationKey = keyof typeof es;
