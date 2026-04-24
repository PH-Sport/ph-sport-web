# PH Sport — Architecture Document

> Documento de referencia para el proyecto. Leer antes de cualquier tarea estructural.
> Última revisión: 2026-04-24
> Secciones: Stack · Estructura · i18n · Hero · Motion · Performance · SEO · Sistema de diseño · Estado del proyecto

---

## Stack

| Capa | Tecnología | Versión mínima |
|---|---|---|
| Framework | Astro (SSG + Islands) | 5.x |
| Estilos | Tailwind CSS | 4.x |
| Animaciones | GSAP (island + scripts de sección) | 3.x |
| Internacionalización | Astro i18n nativo | — |
| Datos | JSON en `data/` + helpers en `lib/` | — |
| Imágenes | astro:assets | — |
| SEO | @astrojs/sitemap | — |
| Hosting | Cloudflare Pages | — |
| Lenguaje | TypeScript strict | 5.x |

---

## Estructura de carpetas

```
ph-sport-web/
├── public/
│   ├── fonts/                       # Söhne (4 pesos) — self-hosted
│   ├── icons/
│   ├── national-team-badges/        # Escudos de selecciones nacionales
│   ├── about-equipo.webp / *-sm.webp
│   ├── favicon.svg
│   ├── hero-poster.webp             # Poster estático del vídeo hero (LCP real)
│   ├── logo-ph-3d.webp / *-sm.webp
│   ├── logo.svg
│   ├── services-hero.webp / *-sm.webp
│   ├── talents-hero.webp / *-sm.webp
│   └── video-ph-web.mp4 / *-720.mp4 / *-480.mp4   # 3 variantes de calidad
│
├── src/
│   ├── assets/images/players/       # Fotos de jugadores (procesadas por astro:assets)
│   │
│   ├── components/
│   │   ├── islands/
│   │   │   └── LogoReveal.tsx       # Única island GSAP — client:load justificado
│   │   ├── layout/
│   │   │   ├── BaseLayout.astro     # Layout raíz: meta, fuentes, global CSS
│   │   │   ├── Header.astro         # Flotante, scroll-hide, selector de idioma
│   │   │   └── Footer.astro         # V3 editorial, social links
│   │   ├── sections/
│   │   │   ├── HeroSection.astro        # Vídeo + poster, GSAP curtain reveal
│   │   │   ├── HomePlayersSection.astro
│   │   │   ├── HomeServicesSection.astro   # CSS accordion + GSAP
│   │   │   ├── HomeAboutSection.astro
│   │   │   ├── HomeContactSection.astro    # Layout 50/50 edge-to-edge
│   │   │   ├── AboutSection.astro          # V3 — absorbe /equipo
│   │   │   ├── ServicesSection.astro       # 6 pilares
│   │   │   └── TalentsSection.astro        # Grid de talentos con escudos de selección en hover
│   │   └── ui/
│   │       ├── Button.astro
│   │       ├── FooterSocialIcon.astro
│   │       ├── LanguageSwitcher.astro
│   │       └── SectionHeader.astro
│   │
│   ├── i18n/
│   │   ├── es.ts
│   │   ├── en.ts
│   │   └── utils.ts                 # useTranslations, getLangFromUrl, getAlternateLangUrl
│   │
│   ├── lib/                         # Helpers y datos de dominio
│   │   ├── constants.ts             # SITE_URL y constantes globales
│   │   ├── countryLabels.ts         # Etiquetas de selecciones nacionales
│   │   ├── heroMedia.ts             # Fuente de verdad del vídeo hero (variantes mp4)
│   │   ├── is-document-reload.ts    # Detección de F5 para re-trigger de LogoReveal
│   │   ├── nationalTeamBadge.ts     # Resuelve escudo PNG por código ISO 3166-1 alpha-2
│   │   ├── navigation.ts            # Items de navegación
│   │   ├── playerDetail.ts          # Payloads de talentos para el grid (nombre, club, foto, códigos)
│   │   ├── playerPhotos.ts          # Mapeo de fotos por slug (import.meta.glob)
│   │   ├── servicesItems.ts         # Datos de los 6 pilares de servicios
│   │   ├── slugify.ts
│   │   ├── social.ts                # Links de redes sociales
│   │   ├── sortRoster.ts            # Ordenación del roster
│   │   └── teamMembers.ts           # Datos de los 21 integrantes del equipo
│   │
│   ├── pages/
│   │   ├── index.astro              # / — Home ES
│   │   ├── sobre-nosotros.astro     # /sobre-nosotros (absorbe /equipo)
│   │   ├── servicios.astro          # /servicios
│   │   ├── talentos/
│   │   │   └── index.astro          # /talentos/ (grid no clicable; sin detalle por jugador)
│   │   └── en/
│   │       ├── index.astro          # /en/
│   │       ├── about.astro          # /en/about
│   │       ├── services.astro       # /en/services
│   │       └── talents/
│   │           └── index.astro      # /en/talents/
│   │
│   ├── scripts/                     # Scripts vanilla para interacciones y animaciones
│   │   ├── dropdown.ts              # Dropdown de filtro/sort en talentos
│   │   └── ph-text-animations.ts   # Sistema GSAP de sección (clipPath, stagger, magnético)
│   │
│   └── styles/
│       ├── global.css               # Reset + variables CSS + font-face
│       └── ph-ui-buttons.css
│
├── data/
│   ├── jugadores.json               # Roster principal. "hidden": true oculta sin borrar
│   └── entrenadores.json            # Cuerpo técnico
├── ARCHITECTURE.md
├── DECISIONS.md
└── astro.config.mjs
```

---

## Datos del roster

El roster vive en **JSON plano** dentro de `data/`, no en Content Collections:

- `data/jugadores.json` — jugadores. Campo opcional `"hidden": true` los oculta sin borrar.
- `data/entrenadores.json` — cuerpo técnico.

Ambos comparten esquema: `{ name, club: { name } | null, nationalTeamCodes?: string[] }`.

### Payloads para el grid

`src/lib/playerDetail.ts` merge-a el roster con las fotos (resueltas por slug en `playerPhotos.ts`) y produce los payloads que consume `TalentsSection.astro`:

```typescript
type PlayerDetailPayload = {
  slug: string;
  name: string;
  subtitle: string;             // nombre del club (o cadena vacía)
  role: 'player' | 'coach';
  nationalTeamCodes: string[];  // ISO alpha-2 (hasta 2)
  photoSrc: string;             // URL webp optimizada (astro:assets) o placeholder
};
```

El slug se genera con `slugify(name)` y es la clave común con la foto en `src/assets/images/players/{slug}.{jpg,jpeg,png,webp}`. No se declara slug en los JSON — se deriva del nombre.

---

## Internacionalización (i18n)

### Estrategia de rutas

- **Español** = idioma por defecto → sin prefijo (`prefixDefaultLocale: false`)
- **Inglés** = prefijo `/en/`

| Página | ES (defecto) | EN |
|---|---|---|
| Inicio | `/` | `/en/` |
| Talentos | `/talentos/` | `/en/talents/` |
| Servicios | `/servicios` | `/en/services` |
| Sobre nosotros | `/sobre-nosotros` | `/en/about` |

Las rutas `/equipo` y `/en/team` redirigen a `/sobre-nosotros#equipo` y `/en/about#equipo` respectivamente (la sección de equipo fue absorbida por About en V3).

No hay páginas de detalle por jugador: el grid de `/talentos/` es no-clicable por diseño y la vista individual fue retirada.

### Mapeo de rutas

`getAlternateLangUrl()` en `src/i18n/utils.ts` usa `STATIC_ROUTES` como fuente única de verdad para los alternates. Al añadir una página nueva, declararla en esa lista.

---

## Hero — Vídeo + Logo Reveal

### Vídeo

El hero usa un vídeo de fondo con tres variantes de calidad servidas localmente:

| Archivo | Resolución | Uso |
|---|---|---|
| `video-ph-web-480.mp4` | 480p | Móvil |
| `video-ph-web-720.mp4` | 720p | Tablet |
| `video-ph-web.mp4` | Full | Desktop |

`src/lib/heroMedia.ts` es la fuente de verdad de las rutas y configuración del vídeo. `preload="metadata"` — no precarga el vídeo completo.

El poster `hero-poster.webp` se muestra mientras el vídeo carga y actúa como LCP real.

### Logo Reveal

`LogoReveal.tsx` ejecuta una animación de entrada de pantalla completa antes de mostrar el contenido:

1. Overlay `fixed` con fondo `#0d0f12` y `z-index: 9999`
2. Logo: fade in → escala de `1` a `8` con fade out simultáneo
3. Overlay: fade out y eliminación del DOM
4. Duración total: máximo 2 segundos

`client:load` es la única excepción permitida a la regla de `client:visible`. El reveal debe ejecutarse antes de que el usuario vea cualquier contenido.

**Re-trigger en F5**: `src/lib/is-document-reload.ts` detecta recargas de página para que el reveal se re-ejecute en F5 desde la home. En navegación interna (View Transitions) no se vuelve a ejecutar.

---

## Sistema de animaciones (Motion)

Las animaciones de sección están en `src/scripts/ph-text-animations.ts`. El sistema usa GSAP con `ScrollTrigger` y expone helpers reutilizables:

- **`clipPathReveal`**: entrada de elementos con clip-path desde abajo — el efecto principal de cabeceras y claims.
- **`magneticHover`**: efecto magnético en CTAs y elementos interactivos.
- Stagger de cards y grids.
- Parallax en el hero.
- Respeta `prefers-reduced-motion` — todos los efectos se desactivan si el usuario lo ha configurado.

**Regla**: GSAP en componentes `.astro` va siempre en un `<script>` inline que importa de `ph-text-animations.ts`. Las Islands (`.tsx`) son solo para `LogoReveal.tsx`. No importar GSAP directamente en el markup de un `.astro`.

---

## Reglas de performance (no negociables)

| Regla | Motivo |
|---|---|
| Todas las imágenes con `<Image>` de `astro:assets` | WebP automático + width/height → cero CLS |
| `client:visible` para GSAP, nunca `client:load` | GSAP no inicializa hasta viewport |
| Excepción única: `LogoReveal.tsx` con `client:load` | Documentada y justificada |
| Named imports: `import { X } from 'lib'` | Tree-shaking efectivo |
| Fuentes self-hosted desde `/public/fonts/` | Elimina round-trips externos |
| `font-display: swap` en `@font-face` | Sin FOIT |
| `<Image loading="eager" fetchpriority="high">` solo en primer fold | El resto: lazy |
| Vídeo hero con `preload="metadata"` | No precarga el archivo completo |
| Hover prefetch en links de navegación | Precarga la siguiente página en hover |

---

## SEO checklist por página

- `<title>` único y descriptivo
- `<meta name="description">` entre 120-160 caracteres
- `<link rel="canonical">` apuntando a la URL canónica
- `<link rel="alternate" hreflang="es">` y `hreflang="en"` en todas las páginas
- `@astrojs/sitemap` genera `sitemap.xml` automáticamente en build

---

## Sistema de diseño

> Fuente de verdad visual del proyecto. Variables en `src/styles/global.css`.

### Paleta de colores

| Token | Variable CSS | Hex | Uso |
|---|---|---|---|
| `ph-black` | `--ph-black` | `#0d0f12` | Fondo base — charcoal authority |
| `ph-white` | `--ph-white` | `#ffffff` | Texto principal y contraste |
| `ph-gold` | `--ph-gold` | `#D6B25E` | Acento único — nunca como fondo o relleno |
| `ph-gold-muted` | `--ph-gold-muted` | `#a8893e` | Hover y estados activos del oro |
| `ph-white-60` | `--ph-white-60` | `rgba(255,255,255,0.60)` | Texto secundario y descripciones |
| `ph-white-20` | `--ph-white-20` | `rgba(255,255,255,0.20)` | Bordes sutiles y separadores |
| `ph-white-10` | `--ph-white-10` | `rgba(255,255,255,0.10)` | Fondos de cards sobre negro |
| `ph-black-80` | `--ph-black-80` | `rgba(13,15,18,0.80)` | Overlays sobre imágenes y vídeo |

**Regla de oro**: el acento dorado aparece en máximo un elemento por bloque visual. Si todo brilla, nada brilla.

### Tipografía

| Rol | Fuente | Pesos usados | Uso |
|---|---|---|---|
| Display | Söhne (Klim) | 700, 900 | Títulos, claims, taglines |
| Display medium | Söhne (Klim) | 400, 600 | Subtítulos, labels destacados |
| Body | Helvetica Neue | 400, 500 | Cuerpo, navegación, UI |

**Söhne**: fuente de pago — licencia en https://klim.co.nz/retail-fonts/sohne/
Archivos `.woff2` en `/public/fonts/sohne/`. Nombre de familia en código: `Sohne` (sin umlaut).

### Escala tipográfica

| Elemento | Font |
|---|---|
| Hero claim principal | display, `font-black tracking-tightest` |
| Título de sección | display, `font-bold tracking-tighter` |
| Body | body |
| Label en mayúsculas | clase `.ph-label` |

### Espaciado de secciones

```css
--ph-section-py: clamp(4rem, 8vw, 8rem);
--ph-section-px: clamp(1.5rem, 5vw, 6rem);
```

Usar siempre `.ph-section` o las variables CSS. No hardcodear valores de sección.

### Utilidades globales

| Clase | Descripción |
|---|---|
| `.ph-label` | Label en mayúsculas con tracking ancho, color dorado |
| `.ph-divider` | Línea decorativa dorada de 2.5rem × 2px |
| `.ph-accent` | Texto en color dorado |
| `.ph-section` | Contenedor de sección con padding responsivo y max-width |
| `.skip-link` | Enlace de accesibilidad "saltar al contenido" |

### Radios de borde

| Token CSS | Valor | Uso |
|---|---|---|
| `--ph-radius` | `0.375rem` (6px) | Botones, inputs, UI |
| `--ph-radius-card` | `0.5rem` (8px) | Cards y contenedores |

No superar `0.75rem`. La marca no es redondeada.

### Principios visuales

- **Clima**: túnel antes del partido. Energía contenida, no palco VIP.
- **Fondo**: siempre `ph-black`. Sin blancos de fondo.
- **Espaciado**: generoso. El negro es parte del diseño.
- **Animaciones**: lentas y controladas. Sin rebotes ni efectos llamativos.
- **Fotografía**: high-contrast sobre fondo oscuro. Ratio portrait `3:4` para jugadores.

---

## Estado del proyecto

> Última actualización: 2026-04-24

### Componentes

| Componente | Estado | Notas |
|---|---|---|
| `BaseLayout.astro` | ✅ Completo | SEO, hreflang, preload fuentes, ClientRouter |
| `Header.astro` | ✅ Completo | Flotante, scroll-hide, i18n, mobile accesible |
| `Footer.astro` | ✅ Completo | V3 editorial, social links, i18n |
| `LogoReveal.tsx` | ✅ Completo | GSAP island, re-trigger en F5 |
| `HeroSection.astro` | ✅ Completo | Vídeo (3 variantes) + poster, curtain reveal GSAP |
| `HomePlayersSection.astro` | ✅ Completo | Stagger + scale GSAP |
| `HomeServicesSection.astro` | ✅ Completo | CSS accordion + GSAP |
| `HomeAboutSection.astro` | ✅ Completo | Head + counters GSAP |
| `HomeContactSection.astro` | ✅ Completo | Layout 50/50 edge-to-edge, GSAP |
| `AboutSection.astro` | ✅ Completo | V3 — historia, equipo (21 integrantes) |
| `ServicesSection.astro` | ✅ Completo | 6 pilares + hero |
| `TalentsSection.astro` | ✅ Completo | Grid 3:4 no clicable, escudo de selección en hover enmarcado por escuadra dorada |
| `Button.astro` | ✅ Completo | Primary / secondary, `<a>` o `<button>` |
| `SectionHeader.astro` | ✅ Completo | |
| `LanguageSwitcher.astro` | ✅ Completo | Integrado en Header |
| `FooterSocialIcon.astro` | ✅ Completo | |

### Páginas

| Página | Estado | Notas |
|---|---|---|
| `/` | ✅ Funcional | V3: Hero → Talentos → Servicios → About → Contact |
| `/sobre-nosotros` | ✅ Funcional | V3 — absorbe /equipo (sección #equipo) |
| `/talentos/` | ✅ Funcional | Grid 3:4 no clicable, búsqueda + filtro rol + orden |
| `/servicios` | ✅ Funcional | 6 pilares + hero |
| `/en/` | ✅ Funcional | Mirror de ES |
| `/en/about` | ✅ Funcional | Mirror de ES |
| `/en/talents/` | ✅ Funcional | Mirror de ES |
| `/en/services` | ✅ Funcional | Mirror de ES |

### Assets y contenido

| Item | Estado | Notas |
|---|---|---|
| Logo SVG | ✅ En `/public/logo.svg` | |
| Vídeo hero | ✅ 3 variantes en `/public/` | 480p, 720p, full |
| Fotos jugadores | ⏳ 71 de ~114 | Falta lote pendiente del cliente |
| Escudos de selección | ✅ 9 en `/public/national-team-badges/` | ES, PE, HR, MK, MA, BO, RO, PA, BR |
| Fuente Söhne | ✅ Integrada | Archivos test de Klim — pendiente licencia |
| OG image (1200×630px) | ❌ Pendiente | |

### Pendientes

| Pendiente | Bloqueado por |
|---|---|
| Fotos del resto del roster (~43 jugadores) | Cliente |
| Dominio definitivo → actualizar `SITE_URL` en `lib/constants.ts` | Cliente |
| OG image 1200×630px | Diseño |
| GA4 — Measurement ID | Decisión de si se integra |
| Söhne `.woff2` con licencia de producción | Compra de licencia |

---

## Convenciones clave

- **Slug del jugador**: se deriva del nombre con `slugify(name)`. Este mismo slug nombra la foto en `src/assets/images/players/{slug}.{jpg,jpeg,png,webp}`.
- **Foto por jugador**: cualquier jugador sin foto coincidente recibe el placeholder SVG automáticamente.
- **Ocultar un talento**: `"hidden": true` en `jugadores.json`. `getAllRosterEntries()` lo filtra en build.
- **GSAP en secciones**: siempre a través de `ph-text-animations.ts`, nunca importado directamente en `.astro`.
- **`client:load` solo en `LogoReveal.tsx`**: única excepción, documentada y justificada.
- **Datos de dominio en `lib/`**: `playerDetail`, `teamMembers`, `servicesItems`, etc. son la fuente de verdad. Las páginas y secciones los consumen.

Ver `DECISIONS.md` para el histórico completo de decisiones no obvias.
