# PHSPORT — Decision Log

Registro de decisiones de arquitectura no obvias.
Formato: fecha · decisión · alternativa considerada · motivo.
Orden: más reciente primero.

**Este documento es histórico y acumulativo: las entradas no se borran ni se
reescriben.** Cuando una decisión queda superada, se marca **in situ** con un
aviso al principio apuntando a la que la sustituye. Motivo: se llega aquí tanto
leyendo de arriba abajo como buscando un término suelto, y quien caiga en mitad
del documento tiene que saber si lo que está leyendo sigue vigente sin haber
leído el resto.

---

## 2026-08-12 · Smoke E2E con Playwright sobre el build, sin tests visuales

**Decisión**: se adopta **Playwright** (`@playwright/test`, solo Chromium) para un único smoke que prueba las 12 páginas del build. Vive en `tests/e2e/` y se lanza con `npm run test:e2e`. **No se añaden snapshots visuales ni tests de animación.**

**Alternativas consideradas**:
- **Seguir sin tests.** Era el estado desde abril. Se descarta porque con 116 tarjetas de roster y View Transitions frágiles, una regresión no la ve nadie hasta que está en producción.
- **Tests unitarios (Vitest) de los helpers de `src/lib/`.** Son funciones puras y fáciles de probar, pero ninguna de las regresiones que este proyecto ha sufrido de verdad vivía ahí: fueron marcado, hosting y timing. Habría dado cobertura donde no duele.
- **Capturas de referencia (snapshot visual).** Descartadas a propósito: con GSAP y `ScrollTrigger` el resultado depende del momento exacto en que se toma la captura, y darían falsos positivos hasta que alguien dejase de mirarlos. Un test que se ignora es peor que no tenerlo.

**Motivo de lo que sí cubre**: se eligieron comprobaciones sobre el **marcado servido**, que es estable, y en concreto las que protegen reglas que ya han costado tiempo:
- El JSON-LD `WebSite` **solo en la home**: 4 meses de "phsport" en minúsculas en la SERP (entrada del 2026-08-11). Era un comentario en el código; ahora es un test.
- **`hreflang` recíproco y hacia páginas existentes**: cuando una ruta no está en `STATIC_ROUTES`, `getAlternateLangUrl()` devuelve `/` sin avisar — el `console.warn` está bajo `import.meta.env.DEV`, así que en el build no se entera nadie.
- **Errores de consola y respuestas ≥400**, con lista explícita de warnings tolerados (hoy solo `apple-mobile-web-app-capable`, deprecado a propósito). Silenciar la consola entera habría hecho el test inútil el día que aparezca un error nuevo.

**Detalles que no son obvios**:
- Corre contra `dist/` vía `astro preview`, **no contra el dev server**: se verifica lo que se sube a Vercel.
- Puerto **4322**. El 4321 tiene `strictPort: true`, así que usarlo rompería los tests con `npm run dev` abierto.
- Las rutas se derivan de `dist/`, no de una lista escrita a mano: una página nueva entra en el smoke sola.
- `tests/e2e/rutas.ts` usa `process.cwd()` y no `import.meta.url` porque el `package.json` no declara `"type": "module"` y Playwright transpila a CommonJS.

**Verificación de que los tests sirven**: no basta con que pasen. Se rompió a propósito la condición `isHome` de `BaseLayout.astro` para emitir `WebSite` en todas las páginas: el smoke pasó de 38 verdes a **11 fallos** — las 11 páginas que no son la home— y la home siguió pasando. Después se revirtió.

**Fuera de alcance, y por qué**: los 146 redirects de `vercel.json` (los sirve Vercel, no `astro preview`), las View Transitions (viven en la `top-layer`: ni captura ni `getAnimations()` las ven) y los bugs de motor concreto en iOS, que siguen exigiendo dispositivo real.

---

## 2026-08-11 · Retiradas `lucide`, `marked` y `puppeteer` — restos sin uso

**Decisión**: las tres salen de `package.json`. Ninguna se importaba en `src/`, `scripts/` ni `astro.config.mjs`, y ninguna aparecía en el `dist/` construido.

**Alternativa considerada**: dejarlas. Son devDependencies y el sitio es estático, así que no llegan al usuario final. Se descartó porque el coste real no es el peso servido sino el engaño: una dependencia declarada se lee como "esto se usa", y lleva a conclusiones falsas sobre cómo funciona el proyecto (ver más abajo el caso de `puppeteer`).

**Motivo, uno por uno** — de dónde venía cada una, rastreado con `git log -S`:

- **`lucide`** (entró en `c994ae3`, con las secciones de servicios y equipo): los iconos acabaron siendo SVG inline y en `public/icons/`, pero la librería se quedó declarada.
- **`marked`** (entró en `144578f`, "modal flip, detail view, and grid payloads"): servía para renderizar la biografía en la **vista de detalle de jugador**, que se retiró a propósito el 2026-04-24 (ver esa entrada). Se fue la feature y quedó el renderizador de markdown.
- **`puppeteer`** (entró en `f64ee49`, el bootstrap inicial): nunca llegó a usarse en código versionado. Se usaba desde scripts de captura temporales en la raíz, que el `.gitignore` sigue excluyendo (`/capture-*.mjs`, `/check-*.mjs`). Al no haber rastro en el repo, la suposición natural es que lo usa `build-favicons.mjs` — **y no es cierto: ese script usa `sharp`**. Esa confusión es justo lo que motivó retirarla.

**Verificación**: `npm run build` (12 páginas) y `npm run astro -- check` (0 errores) después de la retirada.

**Regla resultante**: si una dependencia deja de usarse al retirar una feature, sale en el mismo commit que la feature. Para volver a necesitar Puppeteer (capturas, mediciones), instalarlo puntualmente en vez de dejarlo declarado sin consumidor en el repo.

---

## 2026-08-11 · Dominio canónico en el apex + todos los redirects en `vercel.json`

**Decisión**: `phsport.es` (apex) es el dominio que sirve la web; `www.phsport.es` redirige a él con **308 permanente**. Se configura en Vercel → Settings → Domains. Además, **todos** los redirects del proyecto viven en `vercel.json`, no en `astro.config.mjs`.

**Alternativa considerada**: dejar `www` como principal y cambiar `site` en `astro.config.mjs` para alinear el código con el hosting.

**Motivo**: durante 4 meses la SERP mostró el nombre del sitio como **"phsport"** en minúsculas (visible sobre todo en móvil, donde Google sustituye el título por el *site name*). La causa no estaba en el marcado — estaba bien desde el P0 de mayo (commit `ac8f35d`) — sino en la capa de hosting: **el apex devolvía 307 a `www`, así que Googlebot nunca recibía HTML de la raíz del dominio**. El *site name* es el único mecanismo de Google que se resuelve leyendo el marcado **en la raíz** ("the domain or subdomain level root URI"); por eso fallaba solo el nombre mientras títulos, descripciones e indexación iban bien.

Se eligió el apex porque todo el código ya lo declaraba (`site` en `astro.config`, canonical, sitemap, `robots.txt`, hreflang) y la propiedad de Search Console es `sc-domain:phsport.es`, que cubre ambos hosts. Girar la única pieza discordante (Vercel) en vez de reescribir las seis restantes.

**Por qué los redirects no van en `astro.config`**: en build estático Astro los materializa como HTML con `<meta http-equiv="refresh">` y **respuesta 200**, que Google trata como redirección débil. `/equipo` llevaba así desde siempre. En `vercel.json` son 301 reales a nivel de servidor.

**Cambios ejecutados**:
- Vercel: apex a `Connect to an environment / Production`; `www` a `Redirect to Another Domain / 308 Permanent`.
- `BaseLayout.astro`: el JSON-LD `WebSite` se emite **solo en la home** (`Astro.url.pathname === '/'`) — Google lo exige en la raíz del dominio e ignora el nivel de subdirectorio, así que en las otras 11 páginas era ruido. `url` con barra final para casar exacto con el canonical.
- `vercel.json`: 146 redirects 301 para el legado del WordPress anterior (inventario vía Wayback CDX: 538 URLs). 130 fichas de jugador y las taxonomías (`/category/*`, `/cl_team/*`, `/tag/*`) → `/talentos/`; `/contacto/` y `/equipo/` → `/sobre-nosotros`; homes antiguas y `/author/*` → `/`. Las `/wp-*` (350) quedan fuera a propósito: son ficheros internos, no páginas indexables.
- `astro.config.mjs`: retirado el bloque `redirects`.
- `Header.astro`: `hreflang` en los enlaces del selector de idioma (commit `6a0aabf`).

**Regla resultante**:
- Cualquier redirect nuevo va a `vercel.json`, nunca a `astro.config.mjs`.
- Al tocar dominios, verificar SIEMPRE con `curl -A "…Googlebot…" -I https://phsport.es/` que la raíz devuelve **200** y sirve el `WebSite` JSON-LD. Un 3xx ahí rompe el site name aunque el marcado sea perfecto.
- El sitemap de `@astrojs/sitemap` **no** debe llevar la opción `i18n`: empareja versiones por path y aquí los slugs están traducidos (`/servicios` ↔ `/en/services`), así que solo anota 2 de 12 URLs. El hreflang vive en el HTML, completo y recíproco.

**Pendiente de verificar (desde ~2026-08-25)**: que la SERP móvil muestre "PHSPORT". Los sitelinks que mezclan ES/EN no tienen control directo — los elige Google y la herramienta para degradarlos se retiró de Search Console hace años.

---

## 2026-06-25 · LogoReveal de island React a vanilla — React sale del proyecto

> Registrada retroactivamente el 2026-08-11. El cambio se hizo en junio (commit `2b74656`) y no llegó a documentarse: durante dos meses `ARCHITECTURE.md` describió una island que ya no existía.

**Decisión**: `LogoReveal` deja de ser una island de React (`LogoReveal.tsx` con `client:load`) y pasa a ser `src/components/LogoReveal.astro` con un `<script>` GSAP. Se retira la integración `@astrojs/react` de `astro.config.mjs`. **El proyecto se queda sin ninguna island de React.**

**Alternativa considerada**: mantener la island y optimizar su carga.

**Motivo**: era el único island del proyecto y arrastraba React al bundle de la home (~182 KB). El overlay se renderiza en servidor, así que cubre la pantalla desde el primer paint igual que hacía el SSR del island, y el `<script>` reproduce la intro en `astro:page-load` — el mismo patrón que ya usaban todas las secciones. Comportamiento preservado: reveal en cold-load, F5 y navegación SPA a la home.

**Regla resultante**:
- Todo el JS de cliente vive en `<script>` de componentes `.astro`, con GSAP importado desde `src/scripts/ph-text-animations.ts`.
- **No existe ningún patrón de island vigente en el repo.** Si en el futuro hiciera falta una (estado de React genuino), es una decisión nueva que se registra aquí — no la aplicación de un patrón existente.
- Queda **superada** la regla de 2026-04-21 en la parte que decía "`LogoReveal.tsx` sigue siendo la única island GSAP activa".

**Cierre (2026-08-11)**: `react`, `react-dom`, `@astrojs/react`, `@types/react` y `@types/react-dom` **retirados** de `package.json`. Verificado antes de borrarlos: cero imports en `src/`, y `npm ls react` confirmaba que solo se necesitaban entre ellos. Tras quitarlos, el build produce los mismos 401 archivos y un HTML idéntico salvo hashes; la única diferencia en los JS eran 5 bytes de alias del minificador, porque `@astrojs/react` arrastraba una copia duplicada de `esbuild`. `package-lock.json` adelgaza 1.157 líneas. Preview verificado: las 6 rutas responden 200 y todos los JS de la home resuelven.

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

## 2026-04-22 · Hero con vídeo de fondo — 2 variantes mp4 + poster

**Decisión**: el hero usa vídeo de fondo con dos variantes de calidad servidas localmente (`video-ph-web-480.mp4` para móvil, `*-720.mp4` para tablet/desktop) y un poster estático (`hero-poster.webp`) como LCP real. El master `video-ph-web.mp4` vive en `assets/source-media/` y solo se usa como input de `scripts/build-hero-variants.mjs`.

**Alternativa considerada**: una sola variante de vídeo.

**Motivo**: dos variantes permiten servir resolución adecuada según dispositivo sin sobrecargar móviles. `preload="metadata"` evita que el browser descargue el vídeo completo en page load.

**Fuente de verdad**: `src/lib/heroMedia.ts` centraliza rutas y configuración del vídeo. Las páginas/secciones no hardcodean rutas directamente.

**Nota**: el Logo Reveal (`LogoReveal.tsx`) coexiste con el vídeo — ejecuta la animación de entrada sobre el vídeo, no en lugar de él.

> Aclaración 2026-08-11: esta decisión del hero **sigue vigente**; solo cambió el archivo del reveal, que hoy es `LogoReveal.astro` (ver 2026-06-25).

---

## 2026-04-22 · LogoReveal re-trigger en F5 via is-document-reload.ts

**Decisión**: detectar recargas de página (F5) con `src/lib/is-document-reload.ts` para re-ejecutar el Logo Reveal en esos casos.

**Problema**: con View Transitions (ClientRouter), el reveal se ejecutaba correctamente en la primera visita pero no en F5 desde la home ni en cold-load, porque el estado del componente React persistía.

**Motivo**: la experiencia de entrada es parte de la marca — el reveal debe verse siempre que el usuario llegue "de cero" a la home.

**Regla resultante**: el helper lee `performance.navigation.type` para distinguir recarga de navegación interna. En navegación interna (SPA transitions) el reveal no se re-ejecuta.

---

## 2026-04-21 · Sistema de animaciones en scripts/ (GSAP fuera de islands)

> ⚠️ **SUPERADA PARCIALMENTE por la decisión de 2026-06-25.** La parte de esta entrada que habla de islands `.tsx` ya no aplica: no queda ninguna en el repo. Lo vigente es que **todo** el GSAP va en `<script>` de `.astro`.

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

> Aclaración 2026-08-11: la decisión de `src/lib/` como capa de datos **sigue vigente**. La salvedad ya no aplica: ni las Content Collections ni las páginas de jugador existen desde el 2026-04-24. Hoy `src/lib/` es la única vía de acceso a los datos.

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

> ⚠️ **REVERTIDA por la decisión de 2026-04-24.** No hay páginas individuales por jugador: `/talentos/` es un grid único con tarjetas no clicables. `PlayerDetailView.astro` y las rutas `[slug]` están borradas. **No proponer resucitarlas.**

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

> ⚠️ **OBSOLETA desde 2026-04-24.** Las Content Collections se retiraron (`src/content/` ya no existe). El roster vive en `data/*.json` y el slug se deriva con `slugify(name)` en `src/lib/playerDetail.ts`.

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

> ⚠️ **SUPERADA por la decisión de 2026-04-24.** Se salió de Content Collections: el roster es JSON plano en `data/`. La conclusión de fondo (no meter un CMS headless) sigue vigente; el mecanismo elegido, no.

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

> ⚠️ **OBSOLETA desde 2026-04-24.** Ya no hay Content Collections ni schema Zod en el proyecto.

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

> ⚠️ **REVERTIDA por la decisión de 2026-06-25.** `@astrojs/react` ya no está en `astro.config.mjs`, y el paquete se retiró de `package.json` el 2026-08-11. No hay renderer de React en el proyecto.

**Decisión**: integrar `@astrojs/react` como renderer.

**Motivo**: Astro requiere un renderer explícito para hidratar `.tsx` como Islands. Sin esto, `client:load` en `LogoReveal.tsx` no funciona.

**Implicación**: cualquier Island futura en `.tsx` ya tiene soporte sin configuración adicional.
