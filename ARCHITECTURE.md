# PH Sport - Architecture

Documento vivo de arquitectura y estado real del proyecto.

- Ultima revision: 2026-03-16
- Estado: activo

## Stack actual

- Framework: Astro 5.x (SSG + Islands)
- Estilos: Tailwind CSS 4.x + `src/styles/global.css`
- Animaciones: GSAP (en Islands y scripts de seccion)
- i18n: ES por defecto + EN con prefijo `/en`
- Contenido: Astro Content Collections (`src/content/config.ts`)
- Render de islands TSX: `@astrojs/react`

## Estructura actual (resumen)

```text
ph-sport-web/
├── public/
│   ├── logo.svg
│   ├── logo-ph-3d.png
│   ├── favicon.svg
│   └── icons/
├── src/
│   ├── components/
│   │   ├── islands/LogoReveal.tsx
│   │   ├── layout/{BaseLayout,Header,Footer}.astro
│   │   ├── sections/{HeroSection,PlayersGrid,AboutSection}.astro
│   │   └── ui/{Button,PlayerCard}.astro
│   ├── content/
│   │   ├── config.ts
│   │   └── players/*.md
│   ├── i18n/{es,en,utils}.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── jugadores/{index,[slug]}.astro
│   │   ├── sobre-nosotros.astro
│   │   └── en/{index,about,players/{index,[slug]}}.astro
│   ├── scripts/ph-text-animations.ts
│   └── styles/global.css
├── ARCHITECTURE.md
├── DECISIONS.md
└── README.md
```

## Home y roadmap inmediato

- Implementado ahora:
  - Home con Hero + Logo Reveal
  - Sin grid completa de jugadores en la home
- Siguiente fase acordada:
  - Mantener Hero principal
  - Anadir bloque de jugadores destacados debajo del Hero (no la grid completa)

## Convenciones clave

- i18n:
  - ES sin prefijo (`/`)
  - EN con prefijo (`/en`)
- Slugs de jugadores:
  - Se generan desde el archivo Markdown de la coleccion
  - Para rutas dinamicas se usa `entry.id.replace(/\.md$/, '')`
- Animacion de entrada:
  - `LogoReveal.tsx` usa `client:load` como excepcion justificada

## Notas de seguridad/dependencias

- Dependencias de produccion: sin vulnerabilidades reportadas por `npm audit --omit=dev`
- Persisten avisos en tooling de desarrollo (`npm audit` completo)
- Se aplican overrides para dependencias transitivas:
  - `devalue: 5.6.4`
  - `svgo: 4.0.1`

## Pendientes de arquitectura

- Definir implementacion del bloque de destacados en home
- Completar paginas de jugador `[slug]` (ahora son stub)
- Revisar centralizacion de URL canonica por entorno (evitar hardcode duplicado)
# PH Sport — Architecture Document

> Documento de referencia para el proyecto. Leer antes de cualquier tarea estructural.
> Última revisión: 2026-03-05
> Secciones: Stack · Estructura · Content Collections · i18n · **Hero (Logo Reveal)** · Performance · SEO · Sistema de diseño · Decisiones

---

## Stack

| Capa | Tecnología | Versión mínima |
|---|---|---|
| Framework | Astro (SSG + Islands) | 5.x |
| Estilos | Tailwind CSS | 4.x |
| Animaciones | GSAP (solo islands) | 3.x |
| Internacionalización | Astro i18n nativo | — |
| Contenido | Astro Content Collections + Zod | — |
| Imágenes | astro:assets | — |
| SEO | @astrojs/sitemap | — |
| Hosting | Cloudflare Pages | — |
| Lenguaje | TypeScript strict | 5.x |

---

## Estructura de carpetas

```
ph-sport/
├── public/
│   ├── fonts/                  # Fuentes servidas localmente
│   ├── hero-poster.webp        # Imagen estática del hero (LCP real)
│   └── hero.mp4                # Vídeo de fondo (carga diferida)
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── BaseLayout.astro       # Layout raíz: meta, fuentes, global CSS
│   │   │   ├── Header.astro           # Navegación + selector de idioma
│   │   │   └── Footer.astro
│   │   ├── sections/
│   │   │   ├── HeroSection.astro      # Hero con vídeo/poster
│   │   │   ├── PlayersGrid.astro      # Grid de cards de jugadores
│   │   │   └── AboutSection.astro     # Storytelling de la agencia
│   │   ├── ui/
│   │   │   ├── PlayerCard.astro       # Card individual de jugador
│   │   │   ├── Button.astro           # Botón reutilizable
│   │   │   └── ...                    # UI atoms adicionales si se necesitan
│   │   └── islands/
│   │       └── HeroAnimation.tsx      # GSAP — client:visible únicamente
│   │
│   ├── content/
│   │   ├── config.ts                  # Schemas Zod de todas las collections
│   │   └── players/
│   │       ├── carlos-garcia.md       # Un archivo por jugador
│   │       └── ...                    # ~60 archivos totales
│   │
│   ├── i18n/
│   │   ├── es.ts                      # Todas las cadenas en español
│   │   ├── en.ts                      # Todas las cadenas en inglés
│   │   └── utils.ts                   # Helper: useTranslations(lang)
│   │
│   ├── pages/
│   │   ├── index.astro                # / → Inicio (ES, defecto)
│   │   ├── jugadores/
│   │   │   ├── index.astro            # /jugadores/
│   │   │   └── [slug].astro           # /jugadores/carlos-garcia
│   │   ├── sobre-nosotros.astro       # /sobre-nosotros
│   │   └── en/
│   │       ├── index.astro            # /en/
│   │       ├── players/
│   │       │   ├── index.astro        # /en/players/
│   │       │   └── [slug].astro       # /en/players/carlos-garcia
│   │       └── about.astro            # /en/about
│   │
│   ├── assets/
│   │   └── images/
│   │       └── players/               # Fotos de jugadores (procesadas por astro:assets)
│   │
│   └── styles/
│       └── global.css                 # Reset + variables CSS + font-face
│
├── .cursor/
│   └── rules                          # Reglas inyectadas en cada sesión de Cursor
├── ARCHITECTURE.md                    # Este archivo
├── DECISIONS.md                       # Log de decisiones no obvias
├── astro.config.mjs
├── tailwind.config.mjs
└── tsconfig.json
```

---

## Content Collections — Schemas Zod

### `src/content/config.ts`

```typescript
import { defineCollection, z } from 'astro:content';

const players = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      // Datos principales (siempre requeridos)
      name: z.string(),

      // NOTA: slug es un campo reservado de Astro Content Collections.
      // Se genera automáticamente del nombre del archivo .md.
      // carlos-garcia.md → slug: "carlos-garcia"
      // No declarar en el schema ni en el frontmatter.

      position: z.object({
        es: z.string(),   // "Delantero centro"
        en: z.string(),   // "Center Forward"
      }),
      club: z.object({
        name: z.string(),
        country: z.string().optional(),
      }),
      photo: image(),     // Procesada por astro:assets — requiere ({ image })

      // Opcionales — reservados para crecimiento futuro
      featured: z.boolean().default(false),
      nationality: z.string().optional(),
      age: z.number().int().positive().optional(),
      social: z.object({
        instagram: z.string().url().optional(),
        twitter: z.string().url().optional(),
      }).optional(),
    }),
});

export const collections = { players };
```

### Ejemplo de archivo de jugador

```markdown
---
# src/content/players/carlos-garcia.md
# El nombre del archivo ES el slug. No añadir campo slug en el frontmatter.

name: "Carlos García"
position:
  es: "Delantero centro"
  en: "Center Forward"
club:
  name: "RC Deportivo"
  country: "España"
photo: "../../assets/images/players/carlos-garcia.jpg"
featured: true
nationality: "Española"
age: 24
social:
  instagram: "https://instagram.com/carlosgarcia"
---
```

### Acceso al slug en páginas

```typescript
// El slug se obtiene de entry.id, no de entry.slug ni del frontmatter
// IMPORTANTE: en Astro 5, entry.id incluye la extensión .md
// Usar siempre replace para obtener URLs limpias
const players = await getCollection('players');

export async function getStaticPaths() {
  const players = await getCollection('players');
  return players.map(player => ({
    params: { slug: player.id.replace(/\.md$/, '') },  // → "carlos-garcia"
    props: { player },
  }));
}

// player.id → "carlos-garcia.md"
// player.id.replace(/\.md$/, '') → "carlos-garcia"  ← URL correcta
// player.data.name → "Carlos García"
```

---

## Internacionalización (i18n)

### Estrategia de rutas

- **Español** = idioma por defecto → sin prefijo de ruta (`prefixDefaultLocale: false`)
- **Inglés** = prefijo `/en/`
- El slug del jugador es el **mismo en ambas rutas** (nombre propio, idioma-neutral)

| Página | ES (defecto) | EN |
|---|---|---|
| Inicio | `/` | `/en/` |
| Jugadores | `/jugadores/` | `/en/players/` |
| Jugador | `/jugadores/carlos-garcia` | `/en/players/carlos-garcia` |
| Sobre nosotros | `/sobre-nosotros` | `/en/about` |

### `astro.config.mjs`

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

### Helper de traducciones (`src/i18n/utils.ts`)

```typescript
import es, { type TranslationKey } from './es';
import en from './en';

const translations = { es, en } as const;
export type Lang = keyof typeof translations;

export const defaultLang: Lang = 'es';

export function useTranslations(lang: Lang) {
  return function t(key: TranslationKey): string {
    return translations[lang][key] ?? translations['es'][key] ?? key;
  };
}

export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  if (['es', 'en'].includes(first)) return first as Lang;
  return defaultLang;
}
```

### Uso en páginas

```astro
---
import { useTranslations, getLangFromUrl } from '@/i18n/utils';
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
---
<h1>{t('players.title')}</h1>
```

---

## Estrategia de hero — Logo Reveal

El hero usa una animación de entrada tipo **logo reveal** en lugar de vídeo.
Decisión tomada por ausencia de vídeo en esta fase y alineación con el tono "túnel antes del partido" de la estrategia de marca.

### Flujo de animación

1. Overlay `fixed` de pantalla completa con fondo `#0d0f12` y `z-index: 9999`
2. Logo aparece centrado con fade in (0 → 1, 0.4s)
3. Logo escala de `1` a `8` con fade out simultáneo (1 → 0, 0.6s), `ease: power2.in`
4. Overlay hace fade out (0.3s) y se elimina del DOM
5. Duración total: máximo 2 segundos

### Archivos implicados

| Archivo | Tipo | Rol |
|---|---|---|
| `src/components/islands/LogoReveal.tsx` | Island GSAP | Animación de entrada — único caso de `client:load` |
| `src/components/sections/HeroSection.astro` | Componente | Contenido del hero visible tras el reveal |

### Por qué `client:load` en este caso

`client:load` es la única excepción permitida a la regla de `client:visible`.
El reveal debe ejecutarse antes de que el usuario vea cualquier contenido — si se difiere, el usuario ve el contenido sin animación y el efecto se rompe.
Esta excepción está comentada explícitamente en el código.

### Nota sobre vídeo

El vídeo de fondo queda como mejora futura. Cuando esté disponible, se integrará como capa detrás del hero sin afectar al reveal. Los archivos `hero-poster.webp` y `hero.mp4` en `public/` son placeholders reservados para ese momento.

### Contenido del HeroSection

- Fondo `ph-black`, altura mínima `100vh`
- Logo o nombre centrado (hasta tener assets reales)
- Tagline con `t('hero.tagline')` y clase `ph-accent`
- Dos CTAs: `t('hero.cta.primary')` y `t('hero.cta.secondary')`

---

## Reglas de performance (no negociables)

| Regla | Motivo |
|---|---|
| Todas las imágenes con `<Image>` de `astro:assets` | WebP automático + width/height → cero CLS |
| `client:visible` para GSAP, nunca `client:load` | GSAP no se inicializa hasta entrar en viewport |
| Named imports en todo: `import { X } from 'lib'` | Tree-shaking efectivo |
| Fuentes servidas localmente desde `/public/fonts/` | Elimina round-trips externos |
| `font-display: swap` en `@font-face` | Sin FOIT (flash of invisible text) |
| `<Image loading="eager" fetchpriority="high">` solo en el primer fold | El resto: lazy |

---

## SEO checklist por página

- `<title>` único y descriptivo
- `<meta name="description">` entre 120-160 caracteres
- `<link rel="canonical">` apuntando a la URL canónica
- `<link rel="alternate" hreflang="es">` y `hreflang="en"` en todas las páginas
- `@astrojs/sitemap` genera `sitemap.xml` automáticamente en build

---

## Sistema de diseño

> Fuente de verdad visual del proyecto. Definido en `tailwind.config.mjs` y `src/styles/global.css`.
> Última revisión: 2026-03-03
> Secciones: Stack · Estructura · Content Collections · i18n · **Hero (Logo Reveal)** · Performance · SEO · Sistema de diseño · Decisiones

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
Archivos `.woff2` en `/public/fonts/sohne/`:
- `sohne-buch.woff2` (weight 400)
- `sohne-halbfett.woff2` (weight 600)
- `sohne-dreiviertelfett.woff2` (weight 700)
- `sohne-extrafett.woff2` (weight 900)

**Hasta tener Söhne**: Helvetica Neue actúa como fallback completo. El sistema funciona.

### Escala tipográfica recomendada por elemento

| Elemento | Clase Tailwind | Font |
|---|---|---|
| Hero claim principal | `text-7xl font-black tracking-tightest` | display |
| Título de sección | `text-4xl lg:text-5xl font-bold tracking-tighter` | display |
| Subtítulo | `text-xl font-semibold` | display |
| Cuerpo | `text-base` | body |
| Label en mayúsculas | clase `.ph-label` | body |
| Navegación | `text-sm font-medium tracking-wide` | body |

### Espaciado de secciones

Usar siempre la clase `.ph-section` o las variables CSS para padding de secciones:

```css
--ph-section-py: clamp(4rem, 8vw, 8rem);   /* Vertical — responsivo */
--ph-section-px: clamp(1.5rem, 5vw, 6rem); /* Horizontal — responsivo */
```

Esto garantiza consistencia vertical en toda la web sin hardcodear valores.

### Utilidades globales disponibles

Estas clases están definidas en `global.css` y disponibles en cualquier componente sin importar nada:

| Clase | Descripción |
|---|---|
| `.ph-label` | Label en mayúsculas con tracking ancho, color dorado |
| `.ph-divider` | Línea decorativa dorada de 2.5rem × 2px |
| `.ph-accent` | Texto en color dorado |
| `.ph-section` | Contenedor de sección con padding responsivo y max-width |
| `.skip-link` | Enlace de accesibilidad "saltar al contenido" |

### Estilo visual — principios de aplicación

Extraídos de la estrategia de marca y el brandboard:

- **Clima**: túnel antes del partido, no palco VIP. Energía contenida.
- **Fondo**: siempre `ph-black` como base. Sin blancos de fondo.
- **Espaciado**: generoso. El espacio en blanco (negro) es parte del diseño.
- **Bordes**: ligeramente redondeados con radio consistente (`--ph-radius: 6px` para UI, `--ph-radius-card: 8px` para cards). No usar radios grandes (≥ 12px) — la marca no es redondeada.
- **Animaciones**: lentas y controladas. Nada de rebotes ni efectos llamativos.
- **Fotografía**: high-contrast sobre fondo oscuro. Ratio portrait `3:4` para jugadores.
- **Degradados**: acento puntual, nunca protagonistas. Máximo uno por sección.

### Sombras disponibles

| Token Tailwind | Uso |
|---|---|
| `shadow-ph-sm` | Cards y elementos flotantes sutiles |
| `shadow-ph` | Modales y elementos destacados |
| `shadow-ph-lg` | Hero y secciones de impacto |
| `shadow-gold` | Halo dorado para highlights y elementos seleccionados |

### Radios de borde

| Token CSS | Valor | Uso |
|---|---|---|
| `--ph-radius` | `0.375rem` (6px) | Botones, inputs, menu-toggle y elementos UI |
| `--ph-radius-card` | `0.5rem` (8px) | Cards de jugadores y contenedores |

**Regla**: usar siempre `var(--ph-radius)` o `var(--ph-radius-card)` en lugar de valores hardcodeados. No superar `0.75rem` — radio contenido, nunca pill ni completamente circular.


---

## Decisiones de diseño clave

Ver `DECISIONS.md` para el histórico completo. Resumen:

- **Slug automático**: Astro genera el slug del nombre del archivo. No se declara en frontmatter ni en el schema.
- **entry.id con .md**: en Astro 5, usar `player.id.replace(/\.md$/, '')` para URLs limpias.
- **Slug único para jugadores**: misma cadena en ES y EN para evitar desincronización con 60 jugadores.
- **Content Collections sobre CMS headless**: solo hay un editor técnico. Migración a Sanity posible cuando se necesite.
- **`prefixDefaultLocale: false`**: URLs más limpias en español (idioma principal de la agencia).
- **GSAP solo en `islands/`**: ningún componente `.astro` importa GSAP directamente.
- **`client:load` solo en `LogoReveal.tsx`**: única excepción justificada y documentada.
- **@astrojs/react**: necesario para hidratar Islands `.tsx` en el cliente.
- **Hero minimalista**: solo logo y eslogan. Sin CTAs. Silencio elegante alineado con la estrategia de marca.

---

## Estado del proyecto

> Actualizar esta sección tras cada sesión de trabajo.
> Última actualización: 2026-03-05

### Componentes

| Componente | Estado | Notas |
|---|---|---|
| `BaseLayout.astro` | ✅ Completo | SEO, hreflang, preload fuentes, scroll header |
| `Header.astro` | ✅ Completo | i18n, estado activo, blur en scroll, menú mobile accesible (toggle + overlay) |
| `Footer.astro` | ✅ Completo | Logo SVG, design system, i18n, nav, email, copyright |
| `LogoReveal.tsx` | ✅ Completo | Island GSAP, logo reveal en entrada |
| `HeroSection.astro` | ✅ Completo | Fondo radial, halo de logo, scroll indicator, fade in con `--ph-ease` |
| `PlayersGrid.astro` | ✅ Completo | Grid 2/3/4 col, header consistente + separador visual, Content Collections |
| `PlayerCard.astro` | ⏳ Parcial | Borde/hover refinados + overlay legible. `href="#"` — pendiente decidir si hay página individual |
| `AboutSection.astro` | ✅ Completo | Storytelling Now / Next / Forever, números watermark, layout editorial 1:2 |
| `Button.astro` | ✅ Completo | Primary (gold border) / secondary (ghost), angular, `<a>` o `<button>` |
| `LanguageSwitcher.astro` | — | Integrado en `Header.astro` (no existe como archivo separado) |

### Páginas

| Página | Estado | Notas |
|---|---|---|
| `/` | ✅ Funcional | Hero con reveal + grid de jugadores |
| `/jugadores/` | ✅ Funcional | Grid completo |
| `/jugadores/[slug]` | ⏳ Stub | `getStaticPaths()` implementado, sin contenido |
| `/sobre-nosotros` | ✅ Funcional | AboutSection con i18n |
| `/en/` | ✅ Funcional | Hero con reveal (mirror de ES) |
| `/en/players/` | ✅ Funcional | Grid completo (paridad con ES) |
| `/en/players/[slug]` | ⏳ Stub | `getStaticPaths()` implementado, sin contenido |
| `/en/about` | ✅ Funcional | AboutSection con i18n |

### Assets y contenido

| Item | Estado | Notas |
|---|---|---|
| Logo SVG | ✅ En `/public/logo.svg` | Aplicado en header y reveal |
| Fotos jugadores | ⏳ Placeholder | 3 jugadores reales: Pedro Lima, Juan Cruz, Dani Requena |
| Fuente Söhne | ✅ Integrada | 4 pesos en `/public/fonts/sohne/` — archivos test de Klim |
| Jugadores reales | ⏳ Parcial | 3 de ~60 en Content Collections |

---

## Próximos pasos

Orden recomendado:

1. ~~**`AboutSection.astro`** — storytelling con Now / Next / Forever.~~ ✅ Completado 2026-03-05.
2. ~~**`Footer.astro`** definitivo — contenido real, links, email de contacto.~~ ✅ Completado 2026-03-05.
3. ~~**Primera pasada de estilos** — refinar Header, Hero, Cards y About con el design system completo.~~ ✅ Completado 2026-03-05.
4. ~~**`Button.astro`** — componente reutilizable antes de añadir CTAs.~~ ✅ Completado 2026-03-05.
5. ~~**Söhne** — integrar cuando el equipo pase los archivos `.woff2`.~~ ✅ Integrada 2026-03-05 (archivos test de Klim).
6. **Fotos reales** de los 60 jugadores + datos completos en Content Collections.
7. **Páginas de jugador** `[slug].astro` — contenido real con foto, posición, club.
8. **Animaciones de refinamiento** — scroll reveal en secciones, transiciones entre páginas.

### Pendientes bloqueados por decisión externa

| Pendiente | Bloqueado por |
|---|---|
| Dominio definitivo → actualizar `SITE_URL` en `BaseLayout` | Cliente / equipo |
| OG image 1200×630px | Diseño |
| GA4 — Measurement ID `G-XXXXXXXXXX` | Decisión de si se integra y cómo |
| Vídeo hero `.mp4` | Producción de vídeo |
| Söhne `.woff2` | Equipo pasa la licencia |
| Página individual por jugador vs. solo grid | Decisión de producto |

### Mejoras y correcciones identificadas (lista de vista)

1. **SITE_URL duplicado** — Definido en 5 páginas; centralizar (p. ej. `Astro.site` o un único módulo).
2. ~~**getAlternateLangUrl no traduce rutas**~~ ✅ Resuelto 2026-03-05. Ver DECISIONS.md.
3. **PlayerCard con href="#"** — Usar `slug` y `lang` para enlazar a `/jugadores/[slug]` o `/en/players/[slug]`.
4. **Home sin grid de jugadores** — ARCHITECTURE dice "Hero + grid"; la home solo tiene Hero; alinear código o doc.
5. **Preload de 4 fuentes** — Preload solo 700 y 900; 400 y 600 cargar bajo demanda.

---

## Flujo de trabajo con agentes

| Tarea | Agente recomendado |
|---|---|
| Decisiones de arquitectura, briefings, documentación | Claude.ai (claude.ai) |
| Componentes complejos, SEO, i18n, revisión crítica | Opus en Cursor |
| Scaffolding, copiar archivos, ejecutar comandos, stubs | Codex en Cursor |
| Edits acotados, componentes simples, cambios de estilo | Sonnet / auto en Cursor |

**Regla**: antes de cualquier componente importante, definir el briefing en Claude.ai. Llegar a Cursor con instrucciones precisas, no con preguntas abiertas.