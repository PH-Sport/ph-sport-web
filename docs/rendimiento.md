# Rendimiento — histórico y método

Consolidado el 2026-08-11 desde las notas de trabajo de las cuatro auditorías
(abril y junio de 2026). Sirve como línea base: qué se midió, qué se hizo, qué
se descartó y qué queda abierto. Las decisiones de arquitectura viven en
`DECISIONS.md`; esto son mediciones y trabajo de optimización.

## Estado

**Ronda del 2026-08 · la home** (build de producción servido con brotli, móvil
390×844, CPU ×4, 4G lenta 1,6 Mbps/150 ms, mediana de 5):

| | Antes | Después |
|---|---:|---:|
| Contenido visible | 4.978 ms | **1.832 ms** |
| Transferido | 1.254 KB | **259 KB** |
| LCP | 596 ms — pero **falso**, ver abajo | 1.692 ms (el titular del hero) |
| CLS | 0 | 0 |

El LCP de 596 ms que reportaba PageSpeed medía `SPAN.hero-scroll__label`, el
textito vertical «SCROLL» de la esquina, 700 px². El póster nunca era candidato
porque el telón de intro lo tapaba entero. **Por eso ninguna métrica dio la alarma
durante los cinco segundos de pantalla negra.** El número nuevo es más alto y es
el honesto: cuidado al comparar con históricos anteriores a esta ronda.

Lighthouse mobile tras la ronda del 2026-04-27 (single run, simulate throttling):

| Página | Antes | Después | LCP antes | LCP después |
|---|---:|---:|---:|---:|
| `/` | 94 | 91 | 1,98 s | 1,74 s |
| `/sobre-nosotros` | 99 | **100** | 1,60 s | **1,37 s** |
| `/talentos` | **64** | **95** | **5,37 s** | **1,68 s** |
| `/servicios` | 99 | 98 | 1,68 s | 1,65 s |

CLS = 0 en todas, antes y después.

Navegación SPA tras la ronda de junio (build de producción, CPU 4×, mediana de 5):
Servicios — tareas largas 668 → 438 ms (−34 %), peor frame 317 → 233 ms (−27 %).
Home en carga fría 224 → 118 ms (−47 %).

## Qué se hizo

**Abril · carga y LCP**
- Hero: variantes `mp4` 480/720 generadas por `scripts/build-hero-variants.mjs`, poster WebP real, `preload="metadata"`. VP9/webm probado y descartado — a esta duración salía más grande que h264.
- Banderas de selección: 9 PNG (1.186 KB) → WebP 128×128 q90 (62 KB), vía `scripts/build-badge-variants.mjs`.
- Fotos de jugadores: srcset 320/480/720 q85 con `sizes` alineado al grid de 2/3/5 columnas. La q85 se eligió comparando lado a lado; 240w se descartó por pérdida visible.
- Hero de talentos: era un `background-image` de CSS, invisible al preload scanner. `BaseLayout` acepta `preloadImage` y emite dos `<link rel="preload" media="...">` para bajar solo la variante que aplica.
- Masters de los scripts de build movidos a `assets/source-media/` para que dejen de copiarse a `dist/`.
- Söhne Extrafett 900 erradicada: no se usaba en `src/`, solo en su propio `@font-face`.

**Junio · fluidez de navegación**
- El problema no era la carga sino el microcorte **al navegar**: el init de GSAP corría durante el fundido de la View Transition. `afterTransitionPaint` espera a que terminen las animaciones y lanza el init en `requestIdleCallback`.
- Prefetch `load` en los enlaces del nav.
- `ScrollTrigger.config({ ignoreMobileResize: true })`.
- Grid de talentos: `IntersectionObserver` por tarjeta en vez de animar las 114 de golpe (eran 1,4-1,9 s de scriptEvaluation). Cambio visual intencional: de "pop" de sección a revelado progresivo.
- `updateScrollEffects` reorganizado en tres fases (leer → calcular → escribir) y throttled por frame: antes forzaba reflow de 19-48 ms.

**Agosto · el telón de intro y el vídeo** (decisión completa en `DECISIONS.md`, 2026-08-29)
- El reparto de los 5 s era: 1,6 s de descarga, 0,8 s esperando a `window.load` y **2,57 s de animación del logo**, que ni siquiera arrancaba hasta que había cargado todo. Más de la mitad del tiempo era la intro.
- Telón reescrito a CSS. Además de bajar a 1,26 s, deja de existir el modo de fallo: un overlay opaco que solo el JS podía retirar.
- Vídeo: `autoplay` fuera y `preload="none"`. **Quitar `autoplay` a secas no sirve de nada** — medido, Chrome se salta el `preload="metadata"` y descarga el vídeo igual desde el ms 217.
- Red de seguridad en CSS para el titular del hero, que estaba atado a `window.load` a través de GSAP.

## Abierto

- **Coste del snapshot del `ClientRouter`** en páginas pesadas, sobre todo `/talentos` con sus 116 tarjetas. Habría que aligerar o acotar la View Transition. **Alto riesgo y sin hacer a propósito**: no tocar sin supervisión de Mario.
- **Residual de jank en gama baja.** En dispositivos capaces ya no se nota. La vía sería repartir los inits entre frames en vez de concentrarlos.
- **DOM de 1.194 elementos en talentos.** Por debajo del umbral de Lighthouse (1.400) pero alto.
- **Tres fuentes Söhne en preload** (quedan tres, no cuatro). Revisar cuáles son de verdad above-the-fold. De paso: el CSS pide `font-weight: 500` **37 veces** y no existe ningún `@font-face` con ese peso — el navegador cae al 400 o lo sintetiza. Decidir si se añade el peso o se cambian los usos.

**Backlog medido en la auditoría del 2026-08-18** (informe completo con cifras; lo
que sigue está verificado, no estimado):

- **`Header.astro` importa los diccionarios `i18n` enteros** (`es` + `en`) para usar **ocho cadenas** de navegación. El 66 % de ese chunk son literales de texto que viajan en **todas** las páginas. Extraer solo las etiquetas: 36,8 → 21,2 KB. El tree-shaking no puede hacerlo porque el acceso es dinámico.
- **ScrollTrigger (45 KB) se carga en las cuatro páginas y `ScrollTrigger.create()` se usa UNA vez en todo el sitio** (el parallax del claim del hero). El resto son fades y `revealOnView`, que hace `{ start: 'top 85%', once: true }` — exactamente lo que hace un `IntersectionObserver`. Cambiarlo lo saca de Talentos, Servicios y About.
- **Tirón de 217-359 ms al entrar en `/sobre-nosotros`.** Perfilado: 292 ms de self-time en GSAP. Causa: `splitWords` parte tres párrafos del hero y tres del manifiesto en **135 spans** y los anima con `filter: blur(6px)`. Animar un desenfoque obliga a rasterizar cada span en cada fotograma. Quitar el blur y dejar `opacity` + `y`.
- **Fuga de listeners en la home**: los de `scroll` sobre `document` van de 3 → 4 → 6 tras tres visitas. `initHeroScrollCue` registra una función nueva en cada `astro:page-load` sin quitar la anterior, y las viejas apuntan a nodos desconectados.
- **Cuatro imágenes con margen, recomprimidas de verdad**: `contact-image.webp` 76 → 16 KB a 800w (no tiene variante móvil y se sirve la de 1600), `hero-poster.webp` 142 → 53 KB a 800w (tampoco la tiene, y es el LCP), `logo-ph-3d.webp` 427 → 199 KB en AVIF, `talents-hero.webp` 142 → 94 KB a q72 sin cambiar dimensiones.
- **Vídeo del hero a CRF 30** en `scripts/build-hero-variants.mjs`: 2.849 → 1.436 KB (−50 %) con el mismo códec. A CRF 32, −62 %. Es un fondo de 8 s bajo un degradado oscuro.
- **Código muerto**: `src/scripts/dropdown.ts` (4,3 KB, no lo importa nadie), y `clipPathReveal` + `magneticHover` en `ph-text-animations.ts` (cero usos).

## Método (esto es lo reutilizable)

- **Medir sobre build de producción** (`astro build` + `astro preview`), nunca en dev.
- **CPU throttling 4×** vía CDP y **mediana de 5 tiradas como mínimo**. Las tiradas sueltas bajo throttle tienen muchísimo ruido: una de ellas dio un −71 % que en mediana resultó ser −34 %. No reportar cifras de una sola pasada.
- **Lighthouse single-run varía ±3-5 puntos.** Una diferencia menor de 5 no es señal.
- Para bugs de un motor concreto, medir **en ese motor y en dispositivo real** (ver `CLAUDE.md`, "Trampas conocidas").

## Diagnósticos que resultaron falsos

Se dejan escritos para no repetirlos:

- **"El HTML de `/talentos` pesa demasiado"** (196 KB en crudo). Con compresión estándar quedan 7,4 KB en brotli, ~1 KB más que la home: las 116 tarjetas repetitivas comprimen extraordinariamente bien. No había nada que arreglar.
- **"`svh` estabiliza el viewport en iOS"**. Falso fuera de Safari; ver `CLAUDE.md`.
- **"El LCP de la home es bueno (596 ms)"**. Medía un texto de 700 px² en la esquina, no el contenido. Un LCP sospechosamente bueno en una página con overlay merece que se mire **qué elemento** eligió, no solo la cifra.
- **"Quitar `autoplay` evita que el vídeo se descargue"**. No. Hay que poner `preload="none"`; con `metadata`, Chrome lo baja igual.
- **"`content-visibility` mejorará el scroll de `/talentos`"**. Probado con las 116 tarjetas y CPU ×4: no cambia nada medible. El scroll ya iba a 17 ms de mediana con cero fotogramas por encima de 50 ms.
- **"ScrollTrigger tiene una fuga de listeners"** — llama a `addEventListener('resize')` 32 veces por navegación, pero pasa siempre la misma función y el navegador los deduplica. Contados los listeners reales con el inspector: 4, 4 y 4. **Contar llamadas no es contar listeners.**
- **"WebM/VP9 pesará menos que el H.264"**. Medido sobre el master real: sale peor, entre 2.003 y 3.933 KB según el CRF, frente a 2.849 KB. Ya se había descartado en abril por lo mismo; conviene no volver a proponerlo.

## Trampas del instrumental (perdieron horas, no eran bugs del sitio)

- **En headless, el navegador no pinta fotogramas.** `paints` sale vacío, el LCP no se registra y las animaciones se quedan congeladas (con el vídeo avanzando 0,89 s en 11 s de reloj). Hay que forzar el render con `Page.startScreencast` + su `ack`. Dos tandas de medición se perdieron por esto.
- **El puerto 4322 lo puede ocupar otro proyecto de esta máquina.** `playwright.config.ts` usa `reuseExistingServer` en local, así que los tests corren contra la web equivocada sin avisar. Comprobar el `<title>` de lo que se está midiendo antes de fiarse de una cifra.
- **`document.querySelector('a[href="/"]')` devuelve el logo del header, no el enlace «Inicio» del menú.** Y el logo fuerza la intro a propósito, así que una prueba escrita así parece encontrar un bug que no existe. Usar `getByRole('link', { name: 'Inicio' })`.
