# Rendimiento — histórico y método

Consolidado el 2026-08-11 desde las notas de trabajo de las cuatro auditorías
(abril y junio de 2026). Sirve como línea base: qué se midió, qué se hizo, qué
se descartó y qué queda abierto. Las decisiones de arquitectura viven en
`DECISIONS.md`; esto son mediciones y trabajo de optimización.

## Estado

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

## Abierto

- **Coste del snapshot del `ClientRouter`** en páginas pesadas, sobre todo `/talentos` con sus 116 tarjetas. Habría que aligerar o acotar la View Transition. **Alto riesgo y sin hacer a propósito**: no tocar sin supervisión de Mario.
- **Residual de jank en gama baja.** En dispositivos capaces ya no se nota. La vía sería repartir los inits entre frames en vez de concentrarlos.
- **DOM de 1.194 elementos en talentos.** Por debajo del umbral de Lighthouse (1.400) pero alto.
- **Cuatro fuentes Söhne en preload.** Revisar cuáles son de verdad above-the-fold y bajar a una o dos.

## Método (esto es lo reutilizable)

- **Medir sobre build de producción** (`astro build` + `astro preview`), nunca en dev.
- **CPU throttling 4×** vía CDP y **mediana de 5 tiradas como mínimo**. Las tiradas sueltas bajo throttle tienen muchísimo ruido: una de ellas dio un −71 % que en mediana resultó ser −34 %. No reportar cifras de una sola pasada.
- **Lighthouse single-run varía ±3-5 puntos.** Una diferencia menor de 5 no es señal.
- Para bugs de un motor concreto, medir **en ese motor y en dispositivo real** (ver `CLAUDE.md`, "Trampas conocidas").

## Diagnósticos que resultaron falsos

Se dejan escritos para no repetirlos:

- **"El HTML de `/talentos` pesa demasiado"** (196 KB en crudo). Con compresión estándar quedan 7,4 KB en brotli, ~1 KB más que la home: las 116 tarjetas repetitivas comprimen extraordinariamente bien. No había nada que arreglar.
- **"`svh` estabiliza el viewport en iOS"**. Falso fuera de Safari; ver `CLAUDE.md`.
