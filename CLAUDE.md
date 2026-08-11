# CLAUDE.md

Guía de entrada al proyecto: dónde está cada cosa y qué trampas ya nos han costado
tiempo. El detalle vive en los otros documentos — esto es el índice y las reglas.

## Mapa de documentación

| Archivo | Contiene |
|---|---|
| `README.md` | Scripts, rutas, stack |
| `ARCHITECTURE.md` | Estructura, i18n, hero, motion, performance, SEO, sistema de diseño |
| `DECISIONS.md` | Decisiones no obvias con su motivo y alternativas descartadas. Más reciente primero |
| `docs/superpowers/` | Specs y planes de features concretas |

**Antes de proponer un cambio de arquitectura, buscar en `DECISIONS.md`**: puede
estar ya decidido y descartado, con el motivo escrito.

## Comandos

```sh
npm run dev      # localhost:4321 (strictPort: falla si está ocupado, no salta a 4322)
npm run build    # build de producción
npm run preview  # previsualización del build
```

Despliegue: **Vercel** (proyecto `ph-sport-web`, equipo `rodz-dev`), push a `main`
despliega a producción.

## Reglas que no hay que romper

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
- Sitelinks de Google mezclando ES y EN. El marcado está verificado correcto
  (`lang` por página, hreflang recíproco); los sitelinks los elige Google y no
  hay control directo.

## Convenciones

- Commits y comentarios de código **en español**, describiendo el efecto para el
  usuario, no la implementación.
- El proyecto hermano `ochoa-cokima` usa el mismo stack: sus `docs/` y commits
  traen arreglos ya validados que aplican tal cual aquí. Mirar antes de rederivar.
