# CLAUDE.md

Guía de entrada al proyecto: dónde está cada cosa y qué trampas ya nos han costado
tiempo. El detalle vive en los otros documentos — esto es el índice y las reglas.

## Para qué existe esta documentación (prioridad nº 1)

**Cualquier agente de IA —o persona— debe poder leer estos documentos sin ningún
contexto previo y saber tres cosas: hacia dónde va el proyecto, por qué está como
está, y qué no debe proponer.**

Ese es el estándar, y es exigente a propósito: el trabajo se reparte entre
dispositivos, sesiones y modelos distintos, y **no se puede contar con la memoria
de ningún agente concreto**. Lo que no esté escrito aquí, no existe.

De ahí se derivan dos obligaciones:

1. **Registrar el porqué, no solo el qué.** Un cambio sin motivo escrito es un
   cambio que alguien volverá a discutir dentro de tres meses. Y las alternativas
   descartadas valen tanto como la elegida: sin ellas, la siguiente persona
   propone lo que ya se probó y no funcionó.
2. **Un cambio no está terminado si deja la documentación en un estado donde
   alguien sin contexto sacaría una conclusión equivocada.** No es el último
   paso: es parte del cambio.

**Cómo se comprueba**: se examina a un agente sin contexto sobre un clon del repo.
El método, el banco de encargos y el historial están en **`docs/examen/`**. La
primera ejecución (2026-08-11, a ojo) sacó 86/100 y destapó dos meses describiendo
una island de React que ya no existía; de ahí salió toda esta documentación.

## Al empezar y al cerrar una sesión

El trabajo salta entre ordenadores, así que el contexto se pierde por vías
mecánicas antes que por documentación floja. Dos comprobaciones, treinta segundos:

**Al empezar** — `git fetch && git status -sb`. Saber en qué rama se está y si el
clon va por detrás de origin. Trabajar sobre un clon viejo produce conflictos que
parecen bugs.

**Al cerrar** — no dejar nada sin commitear ni sin subir. Un commit que se queda
en el portátil equivocado es contexto perdido, y no hay documento que lo rescate.
Si la tanda queda a medias, commitear igualmente en una rama y subirla: el trabajo
incompleto y visible vale más que el trabajo perfecto e invisible.

Y antes de cerrar, la pregunta de siempre: **¿lo que acabo de cambiar deja algún
documento vivo diciendo algo que ya no es cierto?** (ver "Documentar es parte del
cambio").

## Mapa de documentación

| Archivo | Contiene |
|---|---|
| `README.md` | Scripts, rutas, stack |
| `ARCHITECTURE.md` | Estructura, i18n, hero, motion, performance, SEO, sistema de diseño |
| `DECISIONS.md` | Decisiones no obvias con su motivo y alternativas descartadas. Más reciente primero |
| `docs/trampas-conocidas.md` | El porqué largo de las trampas indexadas abajo: mediciones y **qué se probó ya sin éxito** |
| `docs/hallazgos-abiertos.md` | Detalle y estado de los bugs sin arreglar y del trabajo medido sin hacer |
| `docs/rendimiento.md` | Histórico de las auditorías, cifras de referencia, **cómo medir** y qué diagnósticos resultaron falsos |
| `docs/historico/` | Specs y planes de features concretas. **Histórico, no estado actual**: describen el proyecto tal como era el día que se escribieron y no se actualizan. Para saber cómo está algo hoy, mirar el código o los tres documentos de arriba |
| `docs/examen/` | El examen al agente frío: comprueba que todo lo necesario viaja en el repo y no en memorias locales. Método, banco de encargos e historial |
| `docs/README.md` | Qué hay en `docs/` y cuál de sus dos mitades es fiable hoy |

**Antes de proponer un cambio de arquitectura, buscar en `DECISIONS.md`**: puede
estar ya decidido y descartado, con el motivo escrito.

### Dónde va un plan o una spec nueva

En `docs/historico/plans/` y `docs/historico/specs/`, con la fecha en el nombre
(`AAAA-MM-DD-tema.md`). **Esto manda sobre la ruta que traiga la herramienta que
lo genere.**

Las skills de `superpowers` (`brainstorming`, `writing-plans`) llevan escrito en
su propio `SKILL.md` que guardan en `docs/superpowers/`. Aquí no: esa carpeta se
renombró el 2026-08-11 porque su nombre decía **qué herramienta** escribió los
documentos, y lo único que importa saber antes de leerlos es **que están
congelados** — describen el proyecto del día que se escribieron. Un agente que
lea un plan de abril como si fuera el estado de hoy propone cosas imposibles.

Si aparece un `docs/superpowers/`, el documento está en el sitio equivocado:
moverlo a `docs/historico/` y borrar la carpeta. El hook de pre-push y la Action
lo comprueban, así que no depende de que nadie se acuerde.

No confundir con `.superpowers/` en la raíz: **esa sí es del plugin** (su espacio
de trabajo de ejecución, ignorado por Git) y no se toca ni se renombra.

## Si te piden algo que ya está descartado

Va a pasar: quien pide no siempre recuerda por qué se descartó, y algunas de
estas decisiones se han pedido más de una vez. El comportamiento correcto **no
es ejecutar en silencio, ni negarse a secas**:

1. **Decirlo antes de empezar**, citando la entrada de `DECISIONS.md` y el
   motivo original. No "eso no se hace", sino "esto se retiró el día X porque Y".
2. **Si tras oírlo se mantiene la petición, se hace.** Deja de ser una regla
   rota y pasa a ser una **decisión nueva**: se ejecuta y se registra en
   `DECISIONS.md` con la fecha, quién la pidió y qué ha cambiado respecto a la
   vez anterior.

Lo que no puede ocurrir es que se rehaga algo ya descartado sin que quede
escrito por qué se cambió de opinión. Un descarte no es eterno; lo que es
innegociable es dejar rastro del cambio.

## Documentar es parte del cambio, no un extra

La documentación se actualiza **en el mismo commit** que el cambio que la
invalida. Nunca "más adelante": más adelante es cuando ya se ha perdido el
*porqué* y solo queda el *qué*.

Esto no es una recomendación. Una doc desactualizada es **peor que no tener
doc**: un hueco se nota y se pregunta, pero una afirmación falsa se cree y se
actúa sobre ella. En agosto de 2026 este repo describía durante dos meses una
island de React que ya no existía, y cualquier agente que la leyera habría
propuesto un patrón imposible.

**Disparadores.** Si el cambio toca algo de esta lista, el documento se actualiza
antes de commitear:

| El cambio… | Actualizar |
|---|---|
| Toma una decisión de arquitectura o descarta una alternativa | `DECISIONS.md` (entrada nueva arriba) |
| Migra, elimina o renombra un componente, o cambia un patrón | `DECISIONS.md` + `ARCHITECTURE.md` |
| Toca plataforma, dominio, redirects o build | `ARCHITECTURE.md` + este archivo |
| Resuelve una trampa que costó más de una hora | `CLAUDE.md` → "Trampas conocidas", con el porqué |
| Deja un bug conocido sin arreglar | `CLAUDE.md` → "Hallazgos abiertos" |
| Añade o quita una dependencia por un motivo no obvio | `DECISIONS.md` |

**Comprobación antes de cerrar una tanda de trabajo** — el paso que habría
evitado el caso de la island fantasma:

```sh
# ¿Queda documentación viva hablando de lo que acabas de borrar o renombrar?
grep -rn "NombreQueYaNoExiste" README.md CLAUDE.md ARCHITECTURE.md
```

Si aparece, la documentación miente. Arreglarlo entra en el mismo commit.

`DECISIONS.md` y `docs/historico/` quedan fuera de esa comprobación **a
propósito**: son registro histórico. Que un plan de abril mencione un archivo ya
borrado es correcto — así fue. Lo que no puede ocurrir es que la documentación
viva describa como presente algo que ya no existe.

## Comandos

```sh
npm run dev      # localhost:4321 (strictPort: falla si está ocupado, no salta a 4322)
npm run build    # build de producción
npm run preview  # previsualización del build

# Smoke E2E (Playwright). Construye y levanta el preview él solo en el 4322,
# así que convive con `npm run dev` abierto en el 4321.
npm run test:e2e

# Regeneración de assets — a mano, solo al cambiar un original de assets/source-media/.
# La salida se versiona en public/, así que NO forman parte del build.
npm run assets:badges    # escudos PNG -> WebP 128x128
npm run assets:hero      # master del vídeo -> variantes 480p y 720p
npm run assets:favicons  # favicons, apple-touch-icon y og-image.jpg
```

Despliegue: **Vercel** (proyecto `ph-sport-web`, equipo `rodz-dev`), push a `main`
despliega a producción.

**Un push a `main` dispara el smoke E2E y se aborta si falla** (`.githooks/pre-push`,
~40s; las ramas de trabajo no lo pagan). No es un cuelgue: está construyendo y
probando. Si hay que subir igualmente, `git push --no-verify` — pero entonces la
Action de GitHub es la única red y avisa **después** de que Vercel haya
desplegado. El hook se activa solo: el script `prepare` de `package.json` apunta
`core.hooksPath` a `.githooks/` en cada `npm install`.

## Reglas que no hay que romper

**La marca se escribe `PHSPORT`**, en mayúsculas y sin espacio. Nunca "PH Sport"
ni "PH SPORT". Es el nombre que emiten el JSON-LD `Organization`, el
`og:site_name` y el `apple-mobile-web-app-title`, y el que se espera ver en la
SERP; escribirlo de otra forma en contenido nuevo introduce una variante de marca
donde Google lee identidad. `alternateName` es `PHSPORT Management`. El repo, el
proyecto de Vercel y las rutas de archivos siguen llamándose `ph-sport-web` — eso
es correcto y no se toca.

**Dominio y SEO** — el canónico es el apex `phsport.es`; `www` redirige con 308.
Ver la sección "Reglas de dominio" en `ARCHITECTURE.md` y la entrada del
2026-08-11 en `DECISIONS.md`. En corto:
- El JSON-LD `WebSite` se emite **solo en la home**. Si la raíz del dominio
  devuelve un 3xx, Google muestra el dominio en minúsculas ("phsport") como
  nombre del sitio, por perfecto que sea el marcado. Costó 4 meses descubrirlo.
- **Los redirects van en `vercel.json`**, nunca en `astro.config.mjs`: en build
  estático Astro los materializa como HTML con `meta refresh` y respuesta 200.

**Roster** — `data/jugadores.json` y `data/entrenadores.json` son la fuente de
verdad. Para dar de baja a alguien: `"hidden": true` + nota con el motivo, **no
borrar la entrada** (ver commits `c589e3c`, `031a1a9`). El filtro está en
`getAllRosterEntries()` de `src/lib/playerDetail.ts`.

**No hay páginas individuales por jugador.** `/talentos/` es un grid único y las
tarjetas no son clicables. No proponer rutas `/talentos/[slug]`, modales de
detalle ni JSON-LD `Person` — se retiró a propósito (`DECISIONS.md`, 2026-04-24).

**GSAP vive en `src/scripts/`, fuera de las islands de React.**

## Trampas conocidas

Cada línea dice **qué pasa si se ignora**. El porqué, las mediciones y lo que ya se
probó sin éxito están en **[`docs/trampas-conocidas.md`](docs/trampas-conocidas.md)**:
leerlo antes de tocar el fichero que se nombra.

- **`LogoReveal.astro` — nunca estilos en el atributo `style` del overlay** → una
  declaración inline gana a la regla que lo oculta en visita repetida y **la home se
  queda en negro**, en el camino más frecuente.
- **`LogoReveal.astro` — su CSS va en línea en el `<head>` de `BaseLayout`**, no en el
  `<style>` del componente → desde el componente no se aplica hasta los 838 ms y el
  overlay se pinta sin tapar nada.
- **`LogoReveal.astro` — el overlay va fuera de `<main>`** → dentro, `transition:name`
  crea un contexto de apilamiento y su `z-index` no le gana al header.
- **`animationend` burbujea** → un listener `{ once: true }` en el overlay se gasta en
  la primera animación de un hijo.
- **iOS fuera de Safari: ninguna unidad de viewport aguanta**, `svh` incluido → el alto
  se congela en `--ph-viewport-h`. **No arreglarlo cambiando de unidad: ya se probó.**
- **`var()` no hereda en el árbol de pseudos `::view-transition`** → usar valores
  literales, o la animación no aplica y sale un corte seco.
- **Las capturas de pantalla no fotografían la capa `top-layer`** → el telón nunca sale
  en un screenshot; verificar con `animationstart`/`animationend`, no con capturas.
- **Un LCP bueno puede estar midiendo el elemento equivocado** → mirar siempre
  `entry.element`, no solo la cifra. Más diagnósticos falsos en `docs/rendimiento.md`.
- **El smoke puede estar midiendo otra web** → si falla de forma masiva y rara, mirar
  primero **qué ocupa el puerto 4322**, no el código.
- **Bugs de un motor concreto: medir en ese motor**, con el dispositivo real.

## Hallazgos abiertos

Bugs conocidos sin arreglar y trabajo medido sin hacer. Detalle, cifras y estado en
**[`docs/hallazgos-abiertos.md`](docs/hallazgos-abiertos.md)**.

Lo que hay que saber **antes de tocar nada**:

- ⚠️ **Söhne se sirve en producción sin licencia comprada.** Incumplimiento de
  licencia abierto, no un pendiente estético. **No tocar la tipografía ni proponer
  alternativas sin hablarlo con Mario**: es decisión suya, no técnica.
- **La restauración de scroll al pulsar atrás está rota, y es preexistente.** **No
  culpar al telón de transición ni a `QuietScrollHistory`** — es el error clásico aquí.
- **El coste del snapshot del `ClientRouter` en `/talentos` está sin hacer a
  propósito**, por riesgo alto. No abordarlo sin que Mario lo supervise.
- **Los sitelinks ES/EN los elige Google.** El marcado está verificado correcto; no hay
  control directo. No perseguirlo.

Pendientes sin trampa asociada, en `docs/hallazgos-abiertos.md`: backlog de rendimiento
del 2026-08-18, fuga de listeners de scroll en la home, `.abt-closing__quote` sin markup
y SEO P1/P2.

## Convenciones

- Commits y comentarios de código **en español**, describiendo el efecto para el
  usuario, no la implementación.
- El proyecto hermano `ochoa-cokima` usa el mismo stack: sus `docs/` y commits
  traen arreglos ya validados que aplican tal cual aquí. Mirar antes de rederivar.
