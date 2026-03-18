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
  'nav.about': 'Sobre nosotros',
  'nav.contact': 'Contacto',
  'nav.lang': 'English',          // Texto del switch de idioma
  'nav.lang.href': '/en/',        // Destino del switch

  // --- Hero ---
  'hero.claim': 'Donde el talento construye su legado',
  'hero.tagline': 'Now. Next. Forever Football.',
  'hero.cta.primary': 'Conoce a nuestros jugadores',
  'hero.cta.secondary': 'Quiénes somos',

  // --- Jugadores ---
  'players.title': 'Nuestros jugadores',
  'players.subtitle': 'Una cartera de talento construida con criterio.',
  'players.cta': 'Ver perfil',
  'players.position.label': 'Posición',
  'players.club.label': 'Club',
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
  'a11y.player.photo': 'Foto de',   // Uso: `${t('a11y.player.photo')} ${player.name}`
} as const;

export default es;
export type TranslationKey = keyof typeof es;
