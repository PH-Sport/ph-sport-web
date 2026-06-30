# Telón de transición entre páginas + barra dorada fluida

**Fecha:** 2026-06-30
**Estado:** Aprobado (pendiente de plan de implementación)

## Problema

Al navegar entre páginas (SPA vía `ClientRouter` de Astro / View Transitions API)
se perciben microcortes ("tironcillos"). Dos síntomas:

1. **Contenido:** el fundido actual del `<main>` es de solo `0.15s` — un parpadeo
   demasiado corto para disimular el tirón de layout/paint/init de la página
   destino.
2. **Barra dorada (desktop):** el indicador de navegación (`.nav-indicator`) no se
   desliza de forma fluida; se nota un microcorte.

## Objetivo

- Añadir un "telón" de **fundido a oscuro** (~350ms) al cambiar de página que
  enmascare el tirón.
- Mantener la **barra dorada de la topbar deslizándose POR ENCIMA del telón**
  (aislada de él), tanto visualmente como temporalmente.
- Eliminar el microcorte de la barra dorada.

## Decisiones de diseño (acordadas)

- **Estilo del telón:** fundido a oscuro (sale el viejo → fondo oscuro → entra el
  nuevo), sin solape.
- **Intensidad:** medio, ~350ms total (≈175ms salida + ≈175ms entrada).
- **Enfoque técnico:** afinar la View Transition existente. **No** se toca el
  mecanismo de snapshot del `ClientRouter` (marcado como alto riesgo en sesiones
  previas, ver memoria de fluidity audit).

## Estado actual del código (contexto)

- `src/components/layout/BaseLayout.astro`
  - `<ClientRouter />` en `<head>`.
  - `<main transition:name="page-main" transition:animate={fade({ duration: '0.15s' })}>`.
  - Fondo del `body` oscuro → al fundir `main` a opacidad 0 se ve el fondo oscuro.
- `src/components/layout/Header.astro`
  - `<header data-header transition:persist>` con `.header-shell` que tiene
    `view-transition-name: ph-header` (su animación de VT está anulada con
    `animation: none` en `<style is:global>` → header estático/nítido durante la
    transición).
  - `.nav-indicator` con `view-transition-name: ph-nav-indicator` → su morph de
    geometría (vieja→nueva) ES el deslizamiento, y ocurre por encima del telón.
  - El indicador se posiciona en JS animando `left` y `width`
    (`setIndicatorToLink`, líneas ~779-785), con una transición CSS
    `.nav-indicator.is-animated { transition: left/width 0.4s ... }`.
  - Posicionamiento disparado en `astro:page-load` (carga inicial / fallback) y
    `astro:after-swap` (navegación SPA, antes de capturar el snapshot nuevo).
  - `resize` reposiciona el indicador.
- `src/styles/global.css`: `--ph-duration: 400ms`, `--ease-ph: cubic-bezier(0.16, 1, 0.3, 1)`.

## Diseño

Tres piezas independientes.

### Pieza 1 — Telón (fundido a oscuro)

Sustituir el fundido corto de `page-main` por un fundido **secuenciado** definido
con keyframes en CSS global (mismo patrón que el bloque `is:global` de
`Header.astro` que customiza `ph-header` / `ph-nav-indicator`).

- `::view-transition-old(page-main)`: `opacity 1 → 0`, ≈175ms, curva de salida.
- `::view-transition-new(page-main)`: `opacity 0 → 1`, ≈175ms, **retardo ≈175ms**,
  curva de entrada.
- En el punto medio solo se ve el fondo oscuro del `body` = el telón.

Detalles:
- Mantener `transition:name="page-main"` en `<main>`. Sustituir el
  `transition:animate={fade(...)}` por keyframes propios (definir explícitamente
  old **y** new para no depender de defaults de Astro/UA).
- El footer queda fuera de escena durante una navegación desde el top, así que no
  necesita tratamiento específico; el telón sobre `page-main` es suficiente
  visualmente. (Si en verificación se ve necesario, se evalúa extender al grupo
  `root`.)
- `@media (prefers-reduced-motion: reduce)`: anular el telón (cambio instantáneo,
  `animation: none` en old/new de `page-main`).

Tokens de duración: introducir variables (p. ej. `--ph-telon-dur`,
`--ph-telon-half`) para poder ajustar el feel sin tocar varios sitios.

### Pieza 2 — Aislamiento de la barra dorada

Ya resuelto en gran parte por los grupos `ph-header` y `ph-nav-indicator`. No
requiere código nuevo; sí **verificar** que tras la Pieza 1 y la Pieza 3:

- El header sigue estático y nítido por encima del telón.
- La barra dorada se desliza por encima **durante** el telón (no antes ni después).

Por eso la Pieza 3 **mantiene** `view-transition-name: ph-nav-indicator` (es lo
que permite el morph concurrente con el telón). Quitarlo haría que la barra se
deslizara *después* del telón → no deseado.

### Pieza 3 — Barra dorada fluida (eliminar microcorte)

**Causa raíz:** animar `left`/`width` fuerza recálculo de layout por frame (no va
por compositor), y ese trabajo coincide con la captura del snapshot de la VT y el
init de la página destino. No es la descarga (las páginas se prefetchean).

**Cambio:** posicionar el indicador con `transform` (compositor/GPU), no con
`left`/`width`.

- Base CSS del indicador: `left: 0; width: 100px; transform-origin: left center;`
  (ancho base de referencia fijo para acotar la distorsión del `border-radius` al
  escalar).
- `setIndicatorToLink(link)` calcula `x = linkRect.left - wrapRect.left` y
  `w = linkRect.width`, y aplica
  `indicator.style.transform = translateX(${x}px) scaleX(${w / 100})`.
  - Con `transform-origin: left`, el borde izquierdo cae en `x` y el ancho
    renderizado es `w`.
  - Estado "sin activo": `scaleX(0)` (equivale a width 0).
- Transición: `.nav-indicator.is-animated { transition: transform 0.4s var(curva) }`
  (sustituye la transición de `left`/`width`).
- Se **mantiene** `view-transition-name: ph-nav-indicator` y el bloque global que
  ajusta duración/curva del morph (la barra sigue deslizándose durante el telón).
- Adaptar los tres disparadores existentes al nuevo método (solo cambia *cómo* se
  posiciona, no *cuándo*):
  - `astro:page-load` (primera carga: posicionar sin animación, luego activar
    `.is-animated`).
  - `astro:after-swap` (SPA: fijar geometría nueva antes del snapshot).
  - `resize`.
- `@media (prefers-reduced-motion: reduce)`: sin transición (la barra salta).
  Mantener la anulación existente del morph de VT bajo reduced-motion.

> Nota: si tras el cambio quedara un microhitch *al arrancar* el deslizamiento,
> su origen sería el coste de capturar el snapshot de la home (página pesada), que
> el telón ya enmascara en buena parte. Se reporta tras la verificación.

## Verificación

Levantar el dev server y comprobar en navegador real:

- Navegación entre todas las páginas en **es** y **en**.
- **Desktop:** telón a oscuro + barra dorada deslizándose por encima, fluida, sin
  microcorte perceptible; header estático y nítido.
- **Móvil:** telón a oscuro correcto (sin barra dorada visible).
- **`prefers-reduced-motion`:** sin telón y sin deslizamiento (cambios
  instantáneos), sin parpadeos.
- Sin regresiones en el menú móvil, el efecto solid/hide-on-scroll del header, ni
  el `LogoReveal`.

## Fuera de alcance

- Tocar el mecanismo de snapshot del `ClientRouter` (P4 / alto riesgo).
- Overlay/telón manual interceptando la navegación (pelea con el ClientRouter).
- Cambios en la animación del `LogoReveal` o del menú móvil.

## Archivos afectados (previsión)

- `src/components/layout/BaseLayout.astro` — keyframes del telón (`page-main`),
  ajuste del `<main>`, tokens de duración, reduced-motion.
- `src/components/layout/Header.astro` — indicador a `transform`, adaptar JS de
  posicionamiento y transición CSS, reduced-motion.
