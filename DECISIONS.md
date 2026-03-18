# PH Sport - Decision Log

Registro de decisiones tecnicas no obvias.
Formato: fecha · decision · alternativa · motivo.
Orden: mas reciente primero (cronologico descendente).

---

## 2026-03-16 · Convencion unica para slugs de Content Collections

**Decision**: usar una unica convencion en todo el proyecto:

- Para rutas dinamicas de jugadores, el slug se obtiene con:
  - `entry.id.replace(/\.md$/, '')`

**Alternativa descartada**: mezclar criterios con `entry.slug` en parte del codigo/documentacion.

**Motivo**:

- Evita contradicciones entre documentos y codigo.
- Refleja el comportamiento actual que ya usa el proyecto en:
  - `src/pages/jugadores/[slug].astro`
  - `src/pages/en/players/[slug].astro`

**Regla resultante**:

- No documentar ni implementar una segunda via para slugs mientras esta convencion siga activa.

---

## 2026-03-16 · Overrides de seguridad en dependencias transitivas

**Decision**: fijar versiones parcheadas en `package.json` mediante `overrides`:

- `devalue: 5.6.4`
- `svgo: 4.0.1`

**Alternativa descartada**: esperar a que la cadena transitoria se actualice sola.

**Motivo**:

- Reducir riesgo en dependencias de produccion sin romper compatibilidad del stack actual (Astro 5.x).
- Eliminar la vulnerabilidad `high` reportada previamente en `svgo`.

---

## 2026-03-05 · Routing i18n con mapeo explicito ES<->EN

**Decision**: mapear rutas estaticas y dinamicas en `src/i18n/utils.ts`.

**Motivo**:

- Garantizar `hreflang` correcto y alternates validos.
- Evitar enlaces EN invalidos para rutas traducidas (por ejemplo, `/sobre-nosotros` -> `/en/about`).

---

## 2026-03-03 · i18n base: ES por defecto sin prefijo

**Decision**:

- Espanol como locale por defecto sin prefijo (`prefixDefaultLocale: false`)
- Ingles bajo `/en`

**Motivo**:

- URLs mas limpias para el idioma principal del proyecto.

---

## 2026-03-03 · GSAP restringido a interacciones justificadas

**Decision**:

- Usar GSAP solo donde aporta valor real de experiencia.
- Mantener `client:load` unicamente en `LogoReveal.tsx` como excepcion justificada.

**Motivo**:

- Controlar carga de JS cliente y mantener rendimiento.

# PH Sport — Decision Log

Registro de decisiones de arquitectura no obvias.
Formato: fecha · decisión · alternativa considerada · motivo.

---

## 2026-03-03 · Slug único para jugadores en ambos idiomas

**Decisión**: el slug de cada jugador (`carlos-garcia`) es el mismo en las rutas ES y EN.
- `/jugadores/carlos-garcia`
- `/en/players/carlos-garcia`

**Alternativa considerada**: slugs traducidos (`/en/players/charles-smith`).

**Motivo**: con ~60 jugadores, mantener dos slugs por jugador introduce riesgo de desincronización sin ningún beneficio real. Los nombres propios no se traducen.

---

## 2026-03-03 · `prefixDefaultLocale: false` (ES sin prefijo)

**Decisión**: el español, idioma principal de la agencia, no lleva prefijo de ruta.

**Alternativa considerada**: prefijo `/es/` para todos los idiomas (simetría total).

**Motivo**: URLs más limpias para el mercado principal. El tráfico orgánico principal será hispanohablante. Los bots de Google también prefieren URLs cortas.

---

## 2026-03-03 · Content Collections sobre CMS headless

**Decisión**: contenido gestionado en archivos Markdown en el propio repo.

**Alternativa considerada**: Sanity, Storyblok o Contentful.

**Motivo**: único editor técnico, sin necesidad de interfaz gráfica. Ventajas: sin coste de CMS, sin dependencia externa, tipado automático vía Zod, historial de cambios en Git.

**Condición de cambio**: si un editor no técnico necesita actualizar jugadores, migrar a Sanity. La estructura de Collections está diseñada para que esa migración sea directa.

---

## 2026-03-03 · GSAP restringido a Islands (`client:visible`)

**Decisión**: GSAP solo puede existir en `src/components/islands/` con directiva `client:visible`.

**Alternativa considerada**: importar GSAP en componentes `.astro` con `<script>`.

**Motivo**: `client:visible` garantiza que GSAP no inicializa hasta que el elemento entra en viewport, eliminando su peso (~60KB gzip) del critical path. `<script>` en `.astro` no permite tree-shaking efectivo.

---

## 2026-03-03 · Fuentes servidas localmente

**Decisión**: las fuentes se descargan y sirven desde `/public/fonts/` via `@font-face` en `global.css`.

**Alternativa considerada**: Google Fonts con `<link>`.

**Motivo**: elimina un round-trip externo en cada carga. Cloudflare Pages sirve los assets con headers de caché óptimos. Mejora LCP y elimina riesgo de FOIT.

---

## 2026-03-03 · slug eliminado del schema de Content Collections

**Decisión**: el campo `slug` no se declara en el schema Zod ni en el frontmatter de los jugadores.

**Alternativa considerada**: declarar `slug: z.string()` en el schema para tener el valor tipado dentro de `entry.data`.

**Motivo**: `slug` es un campo reservado de Astro Content Collections. Se genera automáticamente del nombre del archivo `.md` y se accede via `entry.slug`, no via `entry.data.slug`. Declararlo en el schema provoca un error de validación (`slug: Required`) en el build.

**Regla resultante**: el nombre del archivo es el slug. `carlos-garcia.md` → `entry.slug === "carlos-garcia"`. Nunca añadir `slug` al frontmatter.

---

## 2026-03-03 · Sistema de diseño — paleta, tipografía y tokens

**Decisión**: tres colores únicos. `#0d0f12` como base, `#ffffff` para texto, `#D6B25E` como único acento. Sin colores secundarios adicionales.

**Motivo**: el brandboard y la estrategia de marca son explícitos — minimalismo premium, "charcoal authority". Añadir más colores diluiría el estándar visual.

**Regla resultante**: el oro `#D6B25E` se usa con criterio como acento, nunca como color de relleno o fondo.

---

## 2026-03-03 · Tipografía — Söhne + Helvetica

**Decisión**: Söhne (Klim Type Foundry) para títulos y claims. Helvetica para cuerpo y UI. Self-hosted en `/public/fonts/sohne/`.

**Corrección**: el brandboard indicaba Canela para títulos. Confirmado por el cliente que la fuente correcta es Söhne.

**Nota importante**: Söhne es una fuente de pago. Requiere licencia en https://klim.co.nz/retail-fonts/sohne/ antes de publicar en producción. Los archivos `.woff2` necesarios son: sohne-buch (400), sohne-halbfett (600), sohne-dreiviertelfett (700), sohne-extrafett (900).

**Motivo de self-hosting**: elimina round-trips externos, mejora LCP y permite `font-display: swap` con control total.

---

## 2026-03-03 · entry.id incluye extensión .md en Astro 5

**Decisión**: usar `player.id.replace(/\.md$/, '')` para generar slugs limpios en `getStaticPaths()`.

**Problema detectado**: en Astro 5 con Content Collections, `entry.id` devuelve `carlos-garcia.md` en lugar de `carlos-garcia`. Usar `entry.id` directamente genera URLs con extensión (`/jugadores/carlos-garcia.md`).

**Solución**: `player.id.replace(/\.md$/, '')` en ambos archivos de rutas dinámicas:
- `src/pages/jugadores/[slug].astro`
- `src/pages/en/players/[slug].astro`

**Detectado por**: Opus durante la implementación de `getStaticPaths()`.

---

## 2026-03-03 · Hero — Logo Reveal en lugar de vídeo

**Decisión**: el hero usa una animación de logo reveal (logo crece hasta llenar pantalla y hace fade out) en lugar de vídeo de fondo.

**Motivo**: no hay vídeo disponible en esta fase del proyecto.

**Alineación con marca**: encaja con el tono "túnel antes del partido" de la estrategia de marca — entrada cinematográfica, contenida y premium.

**Implementación**: Island GSAP `LogoReveal.tsx` con `client:load` — única excepción justificada a la regla de `client:visible`. El reveal debe ejecutarse antes de que el usuario vea cualquier contenido.

**Mejora futura**: cuando el vídeo esté disponible, se integrará como capa de fondo en `HeroSection` sin afectar al reveal.

---

## 2026-03-03 · @astrojs/react añadido a astro.config.mjs

**Decisión**: integrar `@astrojs/react` como renderer de framework en Astro.

**Motivo**: Astro requiere un renderer explícito para hidratar componentes `.tsx` como Islands. Sin esta integración, `client:load` en `LogoReveal.tsx` no funciona — Astro no sabe cómo procesar React en el cliente.

**Detectado por**: Opus durante la implementación de `LogoReveal.tsx`.

**Cambio en `astro.config.mjs`**: añadida una línea de import y `react()` en el array de integraciones.

**Implicación**: cualquier Island futura en `.tsx` ya tiene soporte sin configuración adicional.

---

## 2026-03-05 · Normalización de nombre de familia tipográfica (Sohne)

**Decisión**: usar `Sohne` (sin umlaut) como nombre único de `font-family` en `@font-face`, variables CSS y `tailwind.config.mjs`.

**Alternativa considerada**: mantener `"Söhne"` en Tailwind y `'Sohne'` en `@font-face`.

**Motivo**: cuando lleguen los `.woff2`, el nombre de familia debe coincidir exactamente entre definición y consumo para evitar fallback silencioso a Helvetica.

**Regla resultante**: cualquier referencia a la fuente display en código debe usar `Sohne`.

---

## 2026-03-05 · Menú mobile en Header con script vanilla (sin island)

**Decisión**: implementar el menú mobile en `Header.astro` con HTML/CSS + script vanilla (`data-menu-toggle`, overlay fullscreen, cierre por Escape y click en links), sin crear una Island React.

**Alternativa considerada**: crear `src/components/islands/MobileMenu.tsx` e hidratar con `client:load`.

**Motivo**: el comportamiento es un toggle simple de UI. Usar React para esto aumentaría JS cliente innecesario y rompería la regla práctica de mantener Islands para casos justificados (como `LogoReveal.tsx` con GSAP).

**Regla resultante**: para interacciones simples de layout/navigation, preferir script vanilla en componentes `.astro`; reservar Islands para casos de lógica/animación compleja.

---

## 2026-03-05 · Mapeo de rutas ES ↔ EN con fuente única de verdad

**Problema**: `getAlternateLangUrl()` solo añadía/quitaba el prefijo `/en/` sin traducir los segmentos de ruta. Resultado: `/sobre-nosotros` generaba `/en/sobre-nosotros` (no existe) en vez de `/en/about`. Los hreflang de todas las páginas apuntaban a URLs incorrectas.

**Decisión**: definir los pares de rutas ES ↔ EN en dos listas declarativas (`STATIC_ROUTES` y `DYNAMIC_ROUTES`) dentro de `src/i18n/utils.ts`. Los mapas de búsqueda se generan automáticamente desde esas listas. `getAlternateLangUrl()` consulta los mapas para estáticas y recorre `DYNAMIC_ROUTES` para dinámicas (p. ej. `/jugadores/:slug` ↔ `/en/players/:slug`).

**Alternativa considerada**: dos mapas ES→EN y EN→ES escritos a mano (solución intermedia que se descartó por riesgo de desincronización).

**Motivo**: una sola fuente de verdad. Para añadir una página nueva se añade un objeto a una lista; los mapas se derivan solos. Trailing slash normalizado en un solo sitio (la función). Warning en consola en desarrollo si una ruta no está mapeada.

**Cambios realizados**:
- `src/i18n/utils.ts`: reescrita `getAlternateLangUrl()` con `STATIC_ROUTES`, `DYNAMIC_ROUTES` y mapas derivados.
- `src/components/layout/Header.astro`: el selector de idioma ahora usa `getAlternateLangUrl(Astro.url)` en lugar de `t('nav.lang.href')`, para que el enlace respete la página actual.

**Regla resultante**: toda ruta nueva debe añadirse a `STATIC_ROUTES` o `DYNAMIC_ROUTES` en `utils.ts`. Si no, en desarrollo aparece un warning en consola.