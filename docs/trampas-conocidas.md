# Trampas conocidas

Cosas que ya costaron tiempo y que **no se deducen leyendo el código**. Cada una
está aquí porque alguien la descubrió por las malas.

El índice corto vive en `CLAUDE.md`; este documento tiene el porqué, las
mediciones y —lo más importante— **qué se probó ya sin éxito**, para que nadie
repita el intento.

## El telón de intro (`LogoReveal.astro`)

Cuatro cosas que cuestan una tarde cada una si se tocan sin saber por qué están.

### Nunca poner estilos en el atributo `style` del overlay

Una declaración inline gana a cualquier regla de hoja sin `!important`, así que la
regla que lo oculta en visita repetida deja de aplicarse y **la home se queda en
negro** — justo en el camino más frecuente.

### Su CSS va en línea en el `<head>` de `BaseLayout`

No en el `<style>` del componente. Desde el componente viaja en el bundle común:
medido, no se aplicaba hasta los **838 ms** y el overlay se pintaba antes como un
div suelto, sin tapar nada.

### El overlay va fuera de `<main>`

`transition:name` crea un contexto de apilamiento *siempre*, no solo durante una
transición, así que dentro su `z-index: 9999` no le gana al header.

### `animationend` burbujea

Escuchar con `{ once: true }` en el overlay gasta el listener en la primera
animación de un hijo. Y no vale colgarse de `astro:page-load` (= `window.load`),
que puede llegar *después* de que la animación haya terminado: se pregunta con
`getAnimations()` y `.finished`.

## iOS fuera de Safari (Brave, Chrome, Firefox)

**Ninguna unidad de viewport aguanta.** Medido en dispositivo real: al aparecer la
barra del navegador, `svh`, `lvh` y `vh` cambian los tres (630→717). La creencia de
que `svh` es estable ahí es falsa.

El alto se congela en `--ph-viewport-h` (px, en `global.css`) y solo se remide al
cambiar el ancho. **No intentar arreglarlo cambiando de unidad: ya se probó y no
puede funcionar.**

## View Transitions

- **`var()` no hereda de forma fiable en el árbol de pseudos `::view-transition`.**
  Usar **valores literales** (duración y curva) en `::view-transition-old/new(...)`.
  Un `var()` ahí hace que la animación no aplique y salga un corte seco.
- Dar `transition:name` a `<main>` sin `transition:animate` permite definir las
  animaciones del grupo por CSS.

## Verificar animaciones

- **Las capturas de pantalla no fotografían la capa `top-layer` de las View
  Transitions**, solo el DOM ya intercambiado: el telón nunca sale en un
  screenshot. Verificar con eventos `animationstart`/`animationend` y su
  `elapsedTime`. `getAnimations()` tampoco expone esas pseudo-animaciones.
- **Medir timing con la extensión de Chrome no es fiable**: al operar, la pestaña
  pasa a segundo plano, `rAF` se pausa y `setTimeout` se throttlea a ~1s.

## Rendimiento: no fiarse de un LCP bueno sin mirar qué elemento es

La home reportaba 596 ms y medía el textito «SCROLL» de la esquina, porque el telón
tapaba todo lo demás. Cinco segundos de pantalla negra que ninguna métrica
denunciaba. Mirar siempre `entry.element`, no solo la cifra.

Más diagnósticos falsos —y las trampas del instrumental de medida— en
[`rendimiento.md`](rendimiento.md).

## El smoke puede estar midiendo otra web

`playwright.config.ts` usa `reuseExistingServer` en local: si algo responde ya en el
puerto, lo da por bueno **sin mirar qué sirve**. El 2026-08-29 un `astro preview` de
otro proyecto ocupaba el 4322, el smoke midió esa web, dio 37 fallos y abortó un
push a main. Los fallos no tenían nada que ver con el código, y ese camino termina
en alguien usando `--no-verify` sin comprobar nada.

Ahora un `globalSetup` (`tests/e2e/comprobar-servidor.ts`) lo detecta y aborta
diciendo qué está sirviendo el puerto. La salida es `PH_E2E_PORT=4488 npm run
test:e2e`.

**Si el smoke falla de forma masiva y rara, mirar primero qué hay en el puerto**, no
el código.

## Bugs de un motor concreto

Medir **en ese motor**, con el dispositivo real. Una página de laboratorio y treinta
segundos de un iPhone resolvieron lo que cuatro rondas de teoría no.
