# PH Sport — Decision Log

Registro de decisiones de arquitectura no obvias.
Formato: fecha · decisión · alternativa considerada · motivo.
Orden: más reciente primero.

---

## 2026-04-24 · Eliminar páginas de detalle + renombrar ruta a `/talentos/` + escudos en la card

**Decisión**: retirar `/jugadores/[slug]` y `/en/players/[slug]`. El grid de `/talentos/` (antes `/jugadores/`) es la única vista de roster y las tarjetas no son clicables. Los escudos de selección nacional pasan a renderizarse en la esquina superior-derecha de cada card y la escuadra dorada (antes decorativa en hover) ahora los enmarca al hacer hover como énfasis.

**Alternativa considerada**: mantener la página de detalle sin enlaces desde la grid.

**Motivo**: decisión del cliente — el perfil individual no aporta valor actualmente (sin bio, sin stats, sin social) y abrir una URL para cada jugador pone una superficie de SEO que no queremos indexar. La escuadra ganaba en expresividad si se usaba para destacar información real (el escudo) en lugar de ser pura ornamentación.

**Cambios ejecutados**:
- Borradas las páginas `[slug].astro` en ambos idiomas.
- Borrado `components/players/PlayerDetailView.astro` y la carpeta entera.
- Carpeta `src/content/` eliminada (Content Collection `players` + 4 bios `.md`) — ya no se usaba fuera del detalle.
- Renombrado `/jugadores/` → `/talentos/` y `/en/players/` → `/en/talents/`. Actualizados `navigation.ts`, `i18n/utils.ts` (sin `DYNAMIC_ROUTES`), `HomePlayersSection.astro`, canonicals y hreflang.
- `playerDetail.ts` simplificado: sin `contentHtml`, `paths`, `ModalPayload`; solo los campos que consume el card.
- `TalentsSection.astro`: añadidos `<img class="talents__badge">` por cada `nationalTeamCodes`; `.talents__corner` escalada a 32×32 alrededor de los escudos con `data-badges="0|1|2"` ajustando el ancho.
- `PortraitCard.astro` y `scripts/smoke-interactions.mjs` (dead code desde V3) eliminados.

**Supersede**: la decisión de 2026-04-19 ("Páginas de jugador implementadas (PlayerDetailView)") queda revertida.

---

## 2026-04-24 · Roster en JSON plano (salida definitiva de Content Collections)

**Decisión**: el roster vive únicamente en `data/jugadores.json` + `data/entrenadores.json`. La Content Collection `players` (bios Markdown) se retira.

**Motivo**: los 4 bios existentes no se usaban en ningún sitio tras eliminar la vista de detalle. Mantener la collection añadía carga cognitiva (dos fuentes de verdad posibles) y requería el schema Zod sin beneficio. JSON + helper en `lib/playerDetail.ts` es más directo.

**Condición de cambio**: si vuelve a haber contenido editorial por jugador (bio, media, timeline) y se reintroduce una vista de detalle, reevaluar Content Collections o una tabla de contenido separada.

---

## 2026-04-23 · Jugadores ocultos con campo `hidden` en jugadores.json

**Decisión**: los jugadores pendientes de firma se marcan con `"hidden": true` en `data/jugadores.json`. `getAllRosterEntries()` en `playerDetail.ts` los filtra en build time — no llegan al navegador.

**Alternativas consideradas**: eliminarlos temporalmente del JSON, o moverlos a un archivo separado `jugadores_pendientes.json`.

**Motivo**: conservar los datos en el mismo archivo facilita activarlos en el futuro (basta con quitar `"hidden": true`). El filtro en build time es más limpio que hacerlo en cliente y no añade JS al bundle.

**Regla resultante**: para ocultar un jugador temporalmente, añadir `"hidden": true` a su entrada en `jugadores.json`. Para reactivarlo, eliminar el campo.

---

## 2026-04-22 · Hero con vídeo de fondo — 3 variantes mp4 + poster

**Decisión**: el hero usa vídeo de fondo con tres variantes de calidad servidas localmente (`video-ph-web-480.mp4`, `*-720.mp4`, `*.mp4`) y un poster estático (`hero-poster.webp`) como LCP real.

**Alternativa considerada**: una sola variante de vídeo.

**Motivo**: las tres variantes permiten servir resolución adecuada según dispositivo sin sobrecargar móviles. `preload="metadata"` evita que el browser descargue el vídeo completo en page load.

**Fuente de verdad**: `src/lib/heroMedia.ts` centraliza rutas y configuración del vídeo. Las páginas/secciones no hardcodean rutas directamente.

**Nota**: el Logo Reveal (`LogoReveal.tsx`) coexiste con el vídeo — ejecuta la animación de entrada sobre el vídeo, no en lugar de él.

---

## 2026-04-22 · LogoReveal re-trigger en F5 via is-document-reload.ts

**Decisión**: detectar recargas de página (F5) con `src/lib/is-document-reload.ts` para re-ejecutar el Logo Reveal en esos casos.

**Problema**: con View Transitions (ClientRouter), el reveal se ejecutaba correctamente en la primera visita pero no en F5 desde la home ni en cold-load, porque el estado del componente React persistía.

**Motivo**: la experiencia de entrada es parte de la marca — el reveal debe verse siempre que el usuario llegue "de cero" a la home.

**Regla resultante**: el helper lee `performance.navigation.type` para distinguir recarga de navegación interna. En navegación interna (SPA transitions) el reveal no se re-ejecuta.

---

## 2026-04-21 · Sistema de animaciones en scripts/ (GSAP fuera de islands)

**Decisión**: ampliar el uso de GSAP a `src/scripts/ph-text-animations.ts`, importado como `<script>` vanilla desde componentes `.astro`. La regla anterior de "GSAP solo en islands" queda actualizada.

**Alternativa considerada**: mantener islands React para cada sección animada.

**Motivo**: crear una island por sección (HomeAbout, HomeServices, Talents…) es overhead innecesario cuando la animación no necesita estado React. Un `<script>` vanilla con `import` de GSAP es suficiente y más ligero.

**Regla actualizada**: GSAP puede vivir en `scripts/ph-text-animations.ts` (importado desde `<script>` en `.astro`) O en islands `.tsx` para casos que requieran estado React. `LogoReveal.tsx` sigue siendo la única island GSAP activa. No importar GSAP directamente en el markup de un `.astro` — siempre a través de `ph-text-animations.ts` o una island.

---

## 2026-04-20 · About V3 — absorción de /equipo en #equipo

**Decisión**: eliminar las páginas `/equipo` y `/en/team` como rutas independientes. El contenido del equipo (21 integrantes) pasa a ser una sección dentro de `/sobre-nosotros` y `/en/about`, con anchor `#equipo`.

**Alternativa considerada**: mantener `/equipo` como página separada.

**Motivo**: el equipo es parte de la identidad de la agencia, no un producto separado. Unificarlo en About refuerza el storytelling y evita que el usuario tenga que navegar a otra página para ver algo que forma parte de "quiénes somos".

**Cambios**:
- `TeamSection.astro` eliminado.
- Las rutas `/equipo` y `/en/team` redirigen a `#equipo`.
- `src/lib/teamMembers.ts` creado como fuente de verdad de los 21 integrantes.
- Nav: la entrada "Equipo/Team" eliminada.

---

## 2026-04-20 · Datos de dominio centralizados en lib/

**Decisión**: crear `src/lib/` como capa de datos y helpers de dominio. Las páginas y secciones consumen estos módulos; no acceden directamente a Content Collections salvo en las páginas de jugador.

**Módulos creados**:
- `playerDetail.ts` — payloads enriquecidos de jugadores (foto, paths i18n, metadata)
- `teamMembers.ts` — 21 integrantes del equipo
- `servicesItems.ts` — 6 pilares de servicios
- `heroMedia.ts` — configuración del vídeo hero
- `navigation.ts` — items de navegación
- `social.ts`, `countryLabels.ts`, `nationalTeamBadge.ts`, etc.

**Motivo**: evitar que cada página tenga su propia lógica de acceso a datos. Un cambio en la estructura de un jugador o un servicio se hace en un solo lugar.

---

## 2026-04-19 · Páginas de jugador implementadas (PlayerDetailView)

**Decisión**: implementar `/jugadores/[slug]` y `/en/players/[slug]` con `PlayerDetailView.astro`. Los datos se preparan en `playerDetail.ts` y se pasan como props.

**Alternativa considerada**: modal en la grid de jugadores.

**Motivo**: las páginas de detalle tienen URL propia — mejor para SEO, enlaces directos y compartir perfiles. El modal se descartó porque no permite indexación.

**Regla resultante**: `buildPlayerDetailPayloadsForLang(lang)` en `playerDetail.ts` es el punto de entrada para datos de jugador. No reconstruir esa lógica en las páginas.

---

## 2026-04-18 · V3 redesign — estructura del home

**Decisión**: rediseñar el home con una estructura editorial — Hero (vídeo + claim grande) → Players → Services (accordion) → About → Contact. Se eliminan secciones experimentales anteriores (Stats Strip, Manifesto, 360).

**Alternativa considerada**: mantener la estructura del intento anterior en `feat/homepage-redesign-v2` (Stats → Players → Manifesto → Services → 360 → About).

**Motivo**: la estructura de la rama anterior era demasiado densa para una primera visita. La V3 prioriza claridad y jerarquía: primero el producto (jugadores), luego la propuesta (servicios), luego quiénes somos.

---

## 2026-04-17 · /servicios como página independiente con 6 pilares

**Decisión**: crear `/servicios` y `/en/services` como páginas propias con `ServicesSection.astro`. Los 6 pilares del servicio (prensa, rendimiento, media, family office, psicólogo, plan de acción) son la estructura definitiva.

**Alternativa considerada**: mantener servicios solo en el home.

**Motivo**: los servicios son el producto principal de la agencia — merecen URL propia, SEO independiente y espacio para desarrollar cada pilar. El home tiene una versión resumida (accordion) que enlaza a la página completa.

---

## 2026-04-15 · ClientRouter en lugar de ViewTransitions

**Decisión**: usar `<ClientRouter />` de `astro:transitions` en lugar del import anterior de `ViewTransitions`.

**Motivo**: cambio de API en Astro 5 — `ViewTransitions` fue renombrado a `ClientRouter`. El comportamiento es idéntico; es solo una actualización de nombre requerida para evitar warnings de deprecación.

---

## 2026-03-16 · Convención única para slugs de Content Collections

**Decisión**: usar una única convención en todo el proyecto:
- Para rutas dinámicas de jugadores, el slug se obtiene con `entry.id.replace(/\.md$/, '')`

**Alternativa descartada**: mezclar criterios con `entry.slug` en parte del código/documentación.

**Motivo**: evita contradicciones entre documentos y código. Refleja el comportamiento actual que ya usa el proyecto.

**Regla resultante**: no documentar ni implementar una segunda vía para slugs mientras esta convención siga activa.

---

## 2026-03-16 · Overrides de seguridad en dependencias transitivas

**Decisión**: fijar versiones parcheadas en `package.json` mediante `overrides`:
- `devalue: 5.6.4`
- `svgo: 4.0.1`

**Alternativa descartada**: esperar a que la cadena transitoria se actualice sola.

**Motivo**: reducir riesgo en dependencias de producción sin romper compatibilidad del stack actual (Astro 5.x). Eliminar la vulnerabilidad `high` reportada en `svgo`.

---

## 2026-03-05 · Routing i18n con mapeo explícito ES ↔ EN

**Decisión**: mapear rutas estáticas y dinámicas en `src/i18n/utils.ts` con `STATIC_ROUTES` y `DYNAMIC_ROUTES`.

**Motivo**: garantizar `hreflang` correcto y alternates válidos. Evitar enlaces EN inválidos para rutas traducidas (por ejemplo, `/sobre-nosotros` → `/en/about`).

**Regla resultante**: toda ruta nueva debe añadirse a `STATIC_ROUTES` o `DYNAMIC_ROUTES` en `utils.ts`.

---

## 2026-03-05 · Menú mobile en Header con script vanilla (sin island)

**Decisión**: implementar el menú mobile en `Header.astro` con HTML/CSS + script vanilla, sin crear una Island React.

**Alternativa considerada**: `src/components/islands/MobileMenu.tsx` con `client:load`.

**Motivo**: el comportamiento es un toggle simple de UI. Usar React aumentaría JS cliente innecesario.

**Regla resultante**: para interacciones simples de layout/navigation, preferir script vanilla en `.astro`. Reservar Islands para lógica/animación compleja.

---

## 2026-03-05 · Normalización de nombre de familia tipográfica (Sohne)

**Decisión**: usar `Sohne` (sin umlaut) como nombre único de `font-family` en `@font-face`, variables CSS y Tailwind.

**Motivo**: el nombre de familia debe coincidir exactamente entre definición y consumo para evitar fallback silencioso a Helvetica.

**Regla resultante**: cualquier referencia a la fuente display en código debe usar `Sohne`.

---

## 2026-03-03 · Slug único para jugadores en ambos idiomas

**Decisión**: el slug de cada jugador es el mismo en las rutas ES y EN.

**Alternativa considerada**: slugs traducidos (`/en/players/charles-smith`).

**Motivo**: con ~60 jugadores, mantener dos slugs por jugador introduce riesgo de desincronización sin ningún beneficio real. Los nombres propios no se traducen.

---

## 2026-03-03 · `prefixDefaultLocale: false` (ES sin prefijo)

**Decisión**: el español, idioma principal de la agencia, no lleva prefijo de ruta.

**Alternativa considerada**: prefijo `/es/` para todos los idiomas.

**Motivo**: URLs más limpias para el mercado principal.

---

## 2026-03-03 · Content Collections sobre CMS headless

**Decisión**: contenido gestionado en archivos Markdown en el propio repo.

**Alternativa considerada**: Sanity, Storyblok o Contentful.

**Motivo**: único editor técnico, sin necesidad de interfaz gráfica. Sin coste de CMS, tipado automático vía Zod, historial en Git.

**Condición de cambio**: si un editor no técnico necesita actualizar jugadores, migrar a Sanity. La estructura de Collections está diseñada para que esa migración sea directa.

---

## 2026-03-03 · GSAP restringido — regla original

**Decisión original (2026-03-03)**: GSAP solo en `src/components/islands/` con `client:visible`.

**Actualización (2026-04-21)**: regla ampliada — GSAP también puede usarse en `src/scripts/ph-text-animations.ts` importado como `<script>` vanilla desde `.astro`. Ver decisión de 2026-04-21.

---

## 2026-03-03 · Fuentes servidas localmente

**Decisión**: fuentes desde `/public/fonts/` via `@font-face` en `global.css`.

**Alternativa considerada**: Google Fonts.

**Motivo**: elimina round-trips externos. Cloudflare Pages sirve los assets con headers de caché óptimos. Mejora LCP, elimina FOIT.

---

## 2026-03-03 · slug eliminado del schema de Content Collections

**Decisión**: el campo `slug` no se declara en el schema Zod ni en el frontmatter.

**Motivo**: `slug` es un campo reservado de Astro Content Collections — declararlo provoca error de validación en el build.

**Regla resultante**: el nombre del archivo es el slug. `carlos-garcia.md` → slug `carlos-garcia`. En Astro 5, `entry.id` incluye la extensión `.md` — usar siempre `entry.id.replace(/\.md$/, '')`.

---

## 2026-03-03 · Sistema de diseño — paleta y tokens

**Decisión**: tres colores únicos. `#0d0f12` base, `#ffffff` texto, `#D6B25E` acento único.

**Motivo**: brandboard explícito — minimalismo premium, "charcoal authority". Más colores diluirían el estándar visual.

**Regla resultante**: el oro se usa como acento, nunca como relleno o fondo.

---

## 2026-03-03 · Tipografía — Söhne + Helvetica

**Decisión**: Söhne (Klim) para títulos. Helvetica para cuerpo y UI. Self-hosted.

**Corrección**: el brandboard indicaba Canela. El cliente confirmó que la fuente correcta es Söhne.

**Nota**: Söhne es de pago. Licencia en https://klim.co.nz/retail-fonts/sohne/ — obligatoria antes de producción. Los archivos actuales son de prueba.

---

## 2026-03-03 · @astrojs/react en astro.config.mjs

**Decisión**: integrar `@astrojs/react` como renderer.

**Motivo**: Astro requiere un renderer explícito para hidratar `.tsx` como Islands. Sin esto, `client:load` en `LogoReveal.tsx` no funciona.

**Implicación**: cualquier Island futura en `.tsx` ya tiene soporte sin configuración adicional.
