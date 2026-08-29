# Banco de encargos — regresión

Se corren **todos**. Umbral: **13/13**. El método, en `README.md`.

Los encargos están redactados **como los pediría un cliente**: sin nombres de
archivo, sin términos del repo y, en varios casos, con una premisa equivocada
metida a propósito. Un agente que ha entendido el proyecto corrige la premisa;
uno que solo obedece, la ejecuta. **No reformular el encargo al lanzarlo**: el
vocabulario es parte de la prueba.

Corrección: `✅` acierta · `⚠️` acierta sin citar la fuente · `❌` suspende.

---

## E-01 · Fichas de jugador

> «Los jugadores se merecen su propia ficha. Haz que al pulsar una tarjeta de
> talentos se abra su página, con su biografía y sus estadísticas.»

- **Acierta si** avisa **antes de implementar** de que las páginas por jugador se
  retiraron a propósito, cita la decisión del 2026-04-24 y explica el motivo. Si
  tras oírlo se le insiste, lo implementa y registra la decisión nueva.
- **Suspende si** crea la ruta `/talentos/[slug]`, un modal de detalle o JSON-LD
  `Person` sin avisar. **También suspende si se niega en seco** sin citar la
  fuente: la regla del repo es avisar y ejecutar si se insiste, no bloquear.
- **Fuente**: `CLAUDE.md` → "Reglas que no hay que romper" y "Si te piden algo que
  ya está descartado" · `DECISIONS.md` 2026-04-24.
- **Origen**: se implementaron (`DECISIONS.md` 2026-04-19) y se retiraron cinco
  días después.

## E-02 · Cambiar la tipografía

> «La web tarda en cargar por culpa de las fuentes. Cámbialas por una de Google
> Fonts que se parezca y quítate el problema.»

- **Acierta si** no sustituye nada y explica que la tipografía es identidad de
  marca y la decisión es de Mario, no técnica. Suma si menciona que la licencia
  de Söhne está sin comprar — es un problema real y abierto, distinto del que
  plantea el encargo.
- **Suspende si** cambia la fuente, o si propone alternativas concretas como si
  fuera una decisión técnica suya.
- **Fuente**: `CLAUDE.md` → "Hallazgos abiertos" · `DECISIONS.md` 2026-03-03.
- **Origen**: la web lleva desde abril sirviendo los `.woff2` de prueba de Klim.

## E-03 · El salto de scroll en el iPhone

> «En mi iPhone, con Brave, la página pega un salto al aparecer la barra del
> navegador. Debe ser cosa de las alturas: prueba con unidades de viewport
> modernas, que para eso están.»

- **Acierta si** rechaza la premisa: en iOS fuera de Safari **ninguna** unidad de
  viewport aguanta (`vh`, `svh` y `lvh` cambian las tres, medido en dispositivo),
  y ya se probó. Señala el alto congelado en `--ph-viewport-h`.
- **Suspende si** propone `svh` o `dvh` como solución.
- **Fuente**: `CLAUDE.md` → "Trampas conocidas · iOS fuera de Safari".
- **Origen**: cuatro rondas de teoría antes de medir en un iPhone real.

## E-04 · La vuelta atrás no recuerda la posición

> «Entro en Servicios, le doy a atrás y la página vuelve arriba del todo. Empezó
> más o menos cuando pusimos el fundido entre páginas — quítalo a ver si es eso.»

- **Acierta si** rechaza la atribución: está **medido en producción con y sin** el
  parche, el resultado es el mismo y el fallo es **preexistente**. No toca el
  fundido ni `QuietScrollHistory`, y apunta al **momento** del `scrollTo`.
- **Suspende si** retira el fundido, culpa a `QuietScrollHistory` o presenta el
  problema como una regresión reciente.
- **Fuente**: `CLAUDE.md` → "Hallazgos abiertos".
- **Origen**: el documento lo llama *"el error clásico aquí"* por algo.

## E-05 · Una redirección nueva

> «La gente entra por /nosotros y se encuentra un 404. Haz que vaya a la página
> de sobre nosotros.»

- **Acierta si** la añade en `vercel.json` como 301 **y** explica por qué no en la
  configuración de Astro: en build estático se materializan como HTML con `meta
  refresh` y respuesta 200, que Google trata como redirección débil.
- **Suspende si** la añade al bloque `redirects` de `astro.config.mjs`.
- **Fuente**: `CLAUDE.md` → "Dominio y SEO" · `DECISIONS.md` 2026-08-11 ·
  el comentario del propio `astro.config.mjs`.
- **Origen**: los redirects vivían ahí y hubo que sacarlos todos.

## E-06 · Cómo se escribe la marca

> «Escribe el texto de una sección nueva presentando a la agencia, dos párrafos.»

- **Acierta si** escribe **PHSPORT** en mayúsculas y sin espacio en todo el
  contenido.
- **Suspende si** escribe "PH Sport" o "PH SPORT" en el contenido. (El repo, las
  rutas y el proyecto de Vercel sí se llaman `ph-sport-web`: eso es correcto y no
  cuenta como fallo.)
- **Fuente**: `CLAUDE.md` → "Reglas que no hay que romper".
- **Origen**: una variante de marca donde Google lee identidad. Hubo que
  unificarlo a mano en todo el repo (`d84882b`).

## E-07 · Dar de baja a un jugador

> «Pedro Lima ya no está con nosotros. Quítalo de la web.»

- **Acierta si** marca `"hidden": true` y añade una nota con fecha y motivo,
  **sin borrar la entrada**, y sabe que el filtro se aplica en build.
- **Suspende si** elimina el objeto de `data/jugadores.json`.
- **Fuente**: `CLAUDE.md` → "Roster" · `DECISIONS.md` 2026-04-23 · el propio
  `jugadores.json`, donde hay 11 entradas ocultas que sirven de ejemplo.
- **Origen**: gente que se va y vuelve.

## E-08 · Animar el footer

> «Me gustaría que el pie de página apareciera con un fundido al llegar a él.»

- **Acierta si** lo resuelve desde `src/scripts/` (el helper `revealOnView` de
  `ph-text-animations.ts`), sin importar GSAP en el componente `.astro`.
- **Suspende si** importa GSAP dentro del `.astro`, o si crea una island de React
  para animar.
- **Fuente**: `CLAUDE.md` → "Reglas que no hay que romper" · `DECISIONS.md`
  2026-04-21 y 2026-03-03.
- **Origen**: React salió del proyecto por peso (`DECISIONS.md` 2026-06-25);
  reintroducirlo por una animación deshace esa auditoría.

## E-09 · Comprobar el fundido entre páginas

> «Hazme una captura de pantalla del efecto de transición al cambiar de página,
> que quiero ver cómo queda.»

- **Acierta si** avisa de que **una captura no puede mostrarlo**: la capa de las
  View Transitions no sale en un screenshot, que solo recoge el DOM ya
  intercambiado. Propone verificar con eventos `animationstart`/`animationend`.
- **Suspende si** entrega una captura afirmando que ahí se ve la transición.
- **Fuente**: `CLAUDE.md` → "Trampas conocidas · Verificar animaciones".
- **Origen**: una sesión entera dando por rota una animación que funcionaba.

## E-10 · Leer un plan viejo

> «En docs hay un plan del rediseño de la home. Léelo y dime si la web está hoy
> como dice ahí.»

- **Acierta si** identifica `docs/historico/` como **foto congelada** del día en
  que se escribió, y contrasta contra el código antes de afirmar nada.
- **Suspende si** presenta el contenido del plan como el estado actual del
  proyecto.
- **Fuente**: `docs/README.md` · `CLAUDE.md` → "Mapa de documentación".
- **Origen**: el repo describió durante dos meses una island de React que ya no
  existía. Es el error que dio origen a toda esta documentación.

## E-11 · Dónde se guarda un plan nuevo

> «Vamos a rehacer la sección de contacto. Diseña conmigo cómo debería ser y
> deja el plan escrito en el repo para retomarlo mañana.»

- **Acierta si** guarda el documento en `docs/historico/` con la fecha en el
  nombre, aunque la herramienta que use le indique otra ruta.
- **Suspende si** crea `docs/superpowers/`. (El `pre-push` lo bloquearía, pero
  eso es la red de seguridad, no el aprobado.)
- **Fuente**: `CLAUDE.md` → "Dónde va un plan o una spec nueva" ·
  `DECISIONS.md` 2026-08-13.
- **Origen**: el renombrado del 2026-08-11 se deshacía solo.

## E-12 · Quitar una dependencia

> «He visto que hay paquetes instalados que no usa nadie. Límpialos.»

- **Acierta si**, además de quitarlos, **actualiza la documentación en el mismo
  commit** cuando el motivo no es obvio, y comprueba que ningún documento vivo
  siga hablando de lo retirado.
- **Suspende si** los quita y deja la documentación describiendo el estado
  anterior, o si aplaza la documentación a "más adelante".
- **Fuente**: `CLAUDE.md` → "Documentar es parte del cambio, no un extra".
- **Origen**: `DECISIONS.md` 2026-08-11 — se retiraron `lucide`, `marked` y
  `puppeteer`, y el `package.json` seguía declarando React tiempo después.

## E-13 · «El LCP de la home ha empeorado»

> «PageSpeed dice que la portada tarda ahora 1,7 segundos en pintar el contenido
> principal, cuando antes eran 0,6. Algo habéis roto esta semana. Deshazlo o
> arréglalo, pero que vuelva a estar como estaba.»

- **Acierta si** explica que **no hay regresión**: el 0,6 s antiguo medía el
  textito «SCROLL» de la esquina (700 px²) porque el telón de intro tapaba todo lo
  demás, y el 1,7 s nuevo mide el titular del hero, que es el contenido de verdad.
  Suma si señala que lo que sí mejoró es el tiempo hasta ver contenido, de 4.978 a
  1.832 ms.
- **Suspende si** revierte el telón, "optimiza" el LCP a ciegas, o acepta la
  premisa de que hubo una regresión sin comprobar **qué elemento** medía cada
  cifra.
- **Fuente**: `DECISIONS.md` 2026-08-29 → "Efecto secundario del cambio" ·
  `docs/rendimiento.md` → "Estado" y "Diagnósticos que resultaron falsos" ·
  `CLAUDE.md` → "Rendimiento: no fiarse de un LCP bueno sin mirar qué elemento es".
- **Origen**: error real de la semana del 2026-08-29. Una métrica que parecía
  excelente ocultó cinco segundos de pantalla negra durante meses; al arreglarlo,
  la métrica **empeora**, y ese es justo el momento en que alguien deshace la
  mejora.

---

## Encargos de descubrimiento (rotan — uno nuevo cada ejecución)

No tienen respuesta esperada: son trabajo real y abierto. Se marca aquí el que se
use, con su fecha, para no repetirlo. Lo que salga mal se documenta, y el encargo
pasa arriba, al banco de regresión.

| Encargo | Usado |
|---|---|
| «Añade una página de preguntas frecuentes, en los dos idiomas.» | — |
| «Quiero saber cuánta gente visita la web, pero sin banner de cookies.» | — |
| «Mete tres jugadores nuevos con sus fotos y sus escudos de selección.» | — |
| «La home tarda en aparecer en el móvil de mi socio. Investiga y arregla lo que puedas.» | 2026-08-18 · **quemado en trabajo real, no en un examen**: se hizo la auditoría de verdad y la respuesta está en `docs/rendimiento.md`. Ya no descubre nada. De ahí salió E-13. |
| «Cambia el vídeo de la portada por uno nuevo que te paso.» | — |
| «Traduce al inglés la sección que acabamos de añadir.» | — |
