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

**Cómo se comprueba** (hecho por primera vez el 2026-08-11): se lanza un agente
sin acceso a memorias locales, con permiso para leer solo el repositorio, y se le
pide que responda qué haría y qué *no* sabría. Lo que no pueda contestar es un
hueco de documentación, no un fallo suyo. Aquel primer intento sacó 86/100 y
destapó dos meses describiendo una island de React que ya no existía.

## Mapa de documentación

| Archivo | Contiene |
|---|---|
| `README.md` | Scripts, rutas, stack |
| `ARCHITECTURE.md` | Estructura, i18n, hero, motion, performance, SEO, sistema de diseño |
| `DECISIONS.md` | Decisiones no obvias con su motivo y alternativas descartadas. Más reciente primero |
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

### iOS fuera de Safari (Brave, Chrome, Firefox)
**Ninguna unidad de viewport aguanta.** Medido en dispositivo real: al aparecer la
barra del navegador, `svh`, `lvh` y `vh` cambian los tres (630→717). La creencia
de que `svh` es estable ahí es falsa. El alto se congela en `--ph-viewport-h`
(px, en `global.css`) y solo se remide al cambiar el ancho. No intentar
arreglarlo cambiando de unidad: ya se probó y no puede funcionar.

### View Transitions
- **`var()` no hereda de forma fiable en el árbol de pseudos `::view-transition`.**
  Usar **valores literales** (duración y curva) en `::view-transition-old/new(...)`.
  Un `var()` ahí hace que la animación no aplique y salga un corte seco.
- Dar `transition:name` a `<main>` sin `transition:animate` permite definir las
  animaciones del grupo por CSS.

### Verificar animaciones
- **Las capturas de pantalla no fotografían la capa `top-layer` de las View
  Transitions**, solo el DOM ya intercambiado: el telón nunca sale en un
  screenshot. Verificar con eventos `animationstart`/`animationend` y su
  `elapsedTime`. `getAnimations()` tampoco expone esas pseudo-animaciones.
- **Medir timing con la extensión de Chrome no es fiable**: al operar, la pestaña
  pasa a segundo plano, `rAF` se pausa y `setTimeout` se throttlea a ~1s.

### Bugs de un motor concreto
Medir **en ese motor**, con el dispositivo real. Una página de laboratorio y
treinta segundos de un iPhone resolvieron lo que cuatro rondas de teoría no.

## Hallazgos abiertos

- **`.abt-closing__quote` no tiene markup.** Existe la regla CSS
  (`AboutSection.astro:587`) y un `querySelector` que lo busca (`:761`), pero
  ningún elemento lo usa: no se renderiza nada.
- **La restauración de scroll al pulsar atrás no funciona** (queda en `y≈2`), y
  es **preexistente**: medido el 2026-08-01 en producción *sin* el parche de
  `QuietScrollHistory` y con él, el resultado es el mismo. **No culpar al telón
  de transición ni a `QuietScrollHistory`** — es el error clásico aquí. La
  hipótesis viva es que el `scrollTo` de Astro ocurre cuando el documento
  recién intercambiado aún no tiene altura (contenido oculto por `[data-reveal]`,
  imágenes sin cargar) y el scroll se recorta. Si se aborda, atacar el **momento
  del `scrollTo`**, no el guardado en el historial.
- Sitelinks de Google mezclando ES y EN. El marcado está verificado correcto
  (`lang` por página, hreflang recíproco); los sitelinks los elige Google y no
  hay control directo.
- **Coste del snapshot del `ClientRouter`** en páginas pesadas (`/talentos`, 116
  tarjetas). Identificado en junio, **sin hacer a propósito por riesgo alto**:
  tocar la View Transition ahí puede romper la fluidez que costó dos auditorías.
  No abordarlo sin que Mario lo supervise. Detalle en `docs/rendimiento.md`.
- **SEO pendiente (P1/P2)**: analítica sin cookies (Plausible o GA4), un
  `public/llms.txt` para buscadores con IA, una página `/faq` con preguntas y
  respuestas literales, y auditar los `alt=""` de Header, Footer y Hero para
  confirmar que son decorativos.
- ⚠️ **Söhne se sirve en producción con los `.woff2` de prueba de Klim.** La
  licencia **no está comprada** (confirmado por Mario el 2026-08-11) y la web
  está publicada desde abril. Es un incumplimiento de licencia abierto, no un
  pendiente estético. Comprar en https://klim.co.nz/retail-fonts/sohne/ y
  sustituir los archivos de `public/fonts/sohne/`. **No tocar la tipografía ni
  proponer alternativas sin hablarlo con Mario**: cambiar de fuente altera la
  identidad de marca, y es decisión suya, no técnica.

## Convenciones

- Commits y comentarios de código **en español**, describiendo el efecto para el
  usuario, no la implementación.
- El proyecto hermano `ochoa-cokima` usa el mismo stack: sus `docs/` y commits
  traen arreglos ya validados que aplican tal cual aquí. Mirar antes de rederivar.
