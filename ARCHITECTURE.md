# PHSPORT — Architecture Document

> Documento de referencia para el proyecto. Leer antes de cualquier tarea estructural.
> Última revisión: 2026-10-03 (rama `feat/variante-c-analisis`: variante C «Análisis», sin fusionar)
> Secciones: Stack · Estructura · i18n · Hero · Motion · Performance · SEO · Sistema de diseño · Tests · Estado del proyecto

---

## Stack

| Capa | Tecnología | Versión mínima |
|---|---|---|
| Framework | Astro (SSG) | 5.x |
| Estilos | Tailwind CSS | 4.x |
| Animaciones | GSAP (scripts de sección, sin islands) | 3.x |
| Internacionalización | Astro i18n nativo | — |
| Datos | JSON en `data/` + helpers en `lib/` | — |
| Imágenes | astro:assets | — |
| SEO | @astrojs/sitemap | — |
| Hosting | Vercel (proyecto `ph-sport-web`, equipo `rodz-dev`) | — |
| Lenguaje | TypeScript strict | 5.x |

---

## Estructura de carpetas

```
ph-sport-web/
├── public/
│   ├── fonts/                       # Söhne (3 pesos: Buch 400, Halbfett 600, Dreiviertelfett 700) — self-hosted
│   ├── national-team-badges/        # Escudos de selecciones nacionales
│   ├── about-equipo.webp            # Ya no se muestra: es el origen de og-image.jpg (npm run assets:favicons)
│   ├── favicon.svg
│   ├── hero/2026-10b/               # Vídeos y pósters del hero (npm run assets:hero). La versión va en la ruta por la caché de 7 días
│   ├── pillar-*.webp / *-sm.webp    # Las fotos de los cinco pilares de /servicios
│   └── logo.svg
│
├── assets/
│   └── source-media/                  # Fuentes originales para scripts de build (NO se sirven)
│       └── badges/                    # PNG 600×600 → WebP 128×128 (npm run assets:badges)
│
├── src/
│   ├── assets/images/players/       # Fotos de jugadores (procesadas por astro:assets)
│   │
│   ├── components/
│   │   ├── LogoReveal.astro         # Intro de la home — calibración (retícula, escuadras, contorno del logo), en CSS, sin GSAP
│   │   ├── layout/
│   │   │   ├── BaseLayout.astro     # Layout raíz: meta, fuentes, global CSS, intro y paso entre páginas
│   │   │   ├── Header.astro         # Barra de herramientas: visor en la página activa, pestaña de idioma, menú móvil-campo
│   │   │   └── Footer.astro         # «Informe final»: lema con su nodo, logo que se dibuja, listas con nodos
│   │   ├── sections/
│   │   │   ├── HeroSection.astro        # Vídeo del neón (encendido + bucle) con un visor que sigue al rótulo
│   │   │   ├── HomePlayersSection.astro    # «El roster.» y el primer nodo de la línea de pase
│   │   │   ├── HomeServicesSection.astro   # Diagrama de 360°: dial y lista con estado compartido
│   │   │   ├── HomeAboutSection.astro      # Cita con telestrador; cifras como esquemas
│   │   │   ├── HomeContactSection.astro    # «Hablemos.» y el correo, donde acaba la línea de pase
│   │   │   ├── AboutSection.astro          # Absorbe /equipo: línea de tiempo, hoja de plantilla, esquema de sedes
│   │   │   ├── ServicesSection.astro       # Campo dibujado, áreas, trayectoria, 5 pilares, manifiesto
│   │   │   └── TalentsSection.astro        # Grid de talentos «en seguimiento», con escudos de selección
│   │   └── ui/                          # Piezas del mundo «Análisis» (ver Motion)
│   │       ├── Button.astro             # SIN USO: nadie lo importa (ya antes de la variante C)
│   │       ├── Digits.astro             # Envuelve las cifras de un texto en monoespaciada
│   │       ├── FooterSocialIcon.astro
│   │       ├── LanguageSwitcher.astro   # VACÍO, sin uso: el selector de idioma vive en Header.astro
│   │       ├── Leader.astro             # Línea guía en codo hacia una etiqueta
│   │       ├── NodeLink.astro           # El botón-enlace: nodo + etiqueta + flecha que se dibuja
│   │       ├── SectionHeader.astro      # SIN USO
│   │       ├── Visor.astro              # Cuatro escuadras que fijan lo que se enfoca
│   │       └── Zone.astro               # La zona que abre cada bloque («02 · Talentos»)
│   │
│   ├── i18n/
│   │   ├── es.ts                    # Fuente de las claves; en.ts e it.ts tienen las mismas
│   │   ├── en.ts
│   │   ├── it.ts                    # Traducido sin revisión nativa (docs/hallazgos-abiertos.md)
│   │   └── utils.ts                 # useTranslations, STATIC_ROUTES, getLangUrls, getLangSwitchUrl, localizePath
│   │
│   ├── lib/                         # Helpers y datos de dominio
│   │   ├── constants.ts             # SITE_URL y constantes globales
│   │   ├── countryLabels.ts         # Etiquetas de selecciones nacionales
│   │   ├── heroMedia.ts             # Fuente de verdad del vídeo del hero (versión, fuentes por pantalla, pósters)
│   │   ├── heroTrack.ts             # GENERADO por scripts/build-hero-track.mjs: la caja del rótulo en cada instante del vídeo
│   │   ├── nationalTeamBadge.ts     # Resuelve escudo PNG por código ISO 3166-1 alpha-2
│   │   ├── navigation.ts            # Items de navegación
│   │   ├── playerDetail.ts          # Payloads de talentos para el grid (nombre, club, foto, códigos)
│   │   ├── playerPhotos.ts          # Mapeo de fotos por slug (import.meta.glob)
│   │   ├── servicesItems.ts         # Datos de los 6 pilares de servicios
│   │   ├── slugify.ts
│   │   ├── social.ts                # Links de redes sociales
│   │   ├── sortRoster.ts            # Ordenación del roster
│   │   └── teamMembers.ts           # Datos de los 21 integrantes del equipo
│   │
│   ├── pages/
│   │   ├── index.astro              # / — Home ES
│   │   ├── sobre-nosotros.astro     # /sobre-nosotros (absorbe /equipo)
│   │   ├── servicios.astro          # /servicios
│   │   ├── talentos/
│   │   │   └── index.astro          # /talentos/ (grid no clicable; sin detalle por jugador)
│   │   ├── en/
│   │   │   ├── index.astro          # /en/
│   │   │   ├── about.astro          # /en/about
│   │   │   ├── services.astro       # /en/services
│   │   │   └── talents/
│   │   │       └── index.astro      # /en/talents/
│   │   └── it/                      # Sin aviso legal ni privacidad (DECISIONS.md, 2026-10-01)
│   │       ├── index.astro          # /it/
│   │       ├── chi-siamo.astro      # /it/chi-siamo
│   │       ├── servizi.astro        # /it/servizi
│   │       └── talenti/
│   │           └── index.astro      # /it/talenti/
│   │
│   ├── scripts/                     # Scripts vanilla para interacciones y animaciones
│   │   ├── dropdown.ts              # SIN USO: nadie lo importa. Talentos monta su combo aparte
│   │   ├── ph-ambient.ts            # Luz animada de fondo de Talentos, Servicios y Sobre nosotros (WebGL2 en directo)
│   │   ├── ph-disclosure.ts         # Acordeón sin animar el alto (FLIP + recorte)
│   │   ├── ph-motion.ts             # Núcleo del movimiento, sin GSAP: entrar en pantalla, trazos medidos, nodo, paso entre páginas
│   │   ├── ph-pass.ts               # La línea de pase de la portada, con el scroll
│   │   ├── ph-scroll-draw.ts        # Un trazo que se dibuja con el scroll y descubre anotaciones (Servicios, Sobre nosotros)
│   │   ├── ph-telestrator.ts        # La elipse a mano alrededor de unas palabras
│   │   └── ph-text-animations.ts   # Infraestructura GSAP (curvas, refresh, scroll al navegar, montar una sección)
│   │
│   └── styles/
│       ├── global.css               # Reset + variables CSS + font-face
│       └── ph-ui-buttons.css
│
├── data/
│   ├── jugadores.json               # Roster principal. "hidden": true oculta sin borrar
│   └── entrenadores.json            # Cuerpo técnico
│
├── scripts/
│   ├── hero-neon/neon.html          # Render del vídeo del hero (WebGL). No lo sirve la web
│   ├── build-hero-neon.mjs          # Lo graba fotograma a fotograma y lo codifica (npm run assets:hero)
│   └── build-hero-track.mjs         # Mide la caja del rótulo en los vídeos y escribe src/lib/heroTrack.ts. Volver a correrlo si cambia el vídeo
│
├── tests/e2e/                       # Smoke sobre el build (Playwright)
│   ├── comprobar-servidor.ts        # Aborta si el puerto lo ocupa OTRO proyecto
│   ├── rutas.ts                     # Deriva las rutas de dist/, no de una lista a mano
│   └── smoke.spec.ts
│
├── docs/
│   ├── rendimiento.md               # Auditorías, cifras de referencia y cómo medir. VIVO
│   └── historico/                   # Specs y planes tal como se escribieron. CONGELADO
│
├── .githooks/
│   └── pre-push                     # Corre el smoke y ABORTA el push si falla (solo main)
├── .github/workflows/
│   └── e2e.yml                      # El mismo smoke en push y PRs. Avisa, no frena el deploy
│
├── ARCHITECTURE.md
├── DECISIONS.md
├── playwright.config.ts
├── vercel.json                      # Redirects (146) y headers. NUNCA en astro.config.mjs
└── astro.config.mjs
```

---

## Datos del roster

El roster vive en **JSON plano** dentro de `data/`, no en Content Collections:

- `data/jugadores.json` — jugadores. Campo opcional `"hidden": true` los oculta sin borrar. **El orden del archivo es el orden del grid.** Desde el 2026-09-25 solo está visible una selección en el orden de la lista de Mario (al principio del archivo); el resto lleva `hidden` + `hiddenReason` (`DECISIONS.md`, 2026-09-10 y 2026-09-25).
- `data/entrenadores.json` — cuerpo técnico. Sus visibles van detrás de los jugadores en el grid; hoy solo Thomas Christiansen (`DECISIONS.md`, 2026-10-02).

Ambos comparten esquema: `{ name, club: { name } | null, nationalTeamCodes?: string[] }`, más los opcionales `hidden`, `hiddenReason` y `note` (ver `RosterJsonRow` en `playerDetail.ts`).

### Payloads para el grid

`src/lib/playerDetail.ts` merge-a el roster con las fotos (resueltas por slug en `playerPhotos.ts`) y produce los payloads que consume `TalentsSection.astro`:

```typescript
type PlayerDetailPayload = {
  slug: string;
  name: string;
  subtitle: string;             // nombre del club (o cadena vacía)
  role: 'player' | 'coach';
  nationalTeamCodes: string[];  // ISO alpha-2 (hasta 2)
  photoSrc: string;             // WebP 480w (astro:assets) o placeholder
  photoSrcset: string;          // WebP 85 en 320/480/720: reserva para navegadores sin AVIF
  photoSrcsetAvif: string;      // AVIF 90 en 320/480/720: lo que carga casi todo el mundo
};
```

El slug se genera con `slugify(name)` y es la clave común con la foto en `src/assets/images/players/{slug}.{jpg,jpeg,png,webp}`. No se declara slug en los JSON — se deriva del nombre.

### Fotos de jugadores

**Desde el 2026-10-01 las tarjetas visibles llevan foto de la serie de estudio**
que prepara Mario: fondo oscuro con resplandor dorado suave, brazos cruzados y la
camiseta del club de la ficha (el entrenador, con traje). Los jugadores ocultos conservan su foto antigua; si
alguno vuelve al grid, hay que pedirle la de estudio. El build las sirve en AVIF 90
con WebP 85 de reserva (`DECISIONS.md`, 2026-10-01).

Viven en `src/assets/images/players/` y no en `public/`: las procesa el build, así que
**cambiar una foto es sustituir el archivo**, sin tocar código. Sin foto, la tarjeta
cae al avatar genérico.

**Cómo se aplica una foto nueva.** Mario las entrega en PNG de unos 1085×1450 (3:4),
sin perfil de color, con el nombre `<Nombre> Web.png`:

1. **Emparejar por la posición en el grid y por la camiseta, no por el nombre del
   archivo.** El PNG no siempre se llama como la ficha (llegó «Salim El Jabari» para
   `Salim El-Jebari`).
2. **Buscar repetidos** con `md5 -q *.png`: el 2026-09-30, la foto de Jordi Ferrer era
   una copia exacta de la de Dani Rebollo.
3. **Comprobar la camiseta contra el club de la ficha**, ampliando el escudo y
   mirando también el parche de competición de la manga. El escudo, por sí solo, puede engañar: la de
   portero de la Ponferradina de Álex Domínguez se dio por del Real Valladolid, y el
   parche de Primera Federación lo habría descartado. Si no cuadra, se avisa a Mario
   (en la serie llegaron seis así y las rehízo todas), y **nunca se cambia el club de
   la ficha para que encaje con la foto**. Mientras tanto no se aplica una foto que
   deje la tarjeta peor de lo que estaba.
4. **Convertir a JPEG calidad 92 y guardar encima del archivo existente, con su misma
   extensión**: `playerPhotos.ts` indexa por el nombre sin extensión, así que
   `dani-requena.jpg` y `dani-requena.jpeg` juntos se pisan y gana uno según el orden
   del glob. Si el existente es `.png` (Rayan Zinebi), se copia el PNG tal cual. Si el
   jugador no tenía foto, se crea `<slug>.jpg`. Queda en unos 300-400 KB.

**Renombrar a un jugador le quita la foto.** El archivo se busca por
`slugify(row.name)`: pasar de `"Eneko"` a `"Eneko Ortiz"` busca `eneko-ortiz.jpeg` en
vez de `eneko.jpeg`, sin fallo de build ni aviso, y la tarjeta cae al avatar genérico.
Al cambiar un nombre en `jugadores.json`, renombrar la foto en el mismo commit.

**Para contar tarjetas sin foto no sirve buscar en `dist/`**: el avatar genérico pesa
menos de 4 KB y Vite lo incrusta como `data:image/svg+xml`. Hay que cruzar
`jugadores.json` con el listado de la carpeta.

**Si un jugador nuevo no tiene foto de estudio**, la vía anterior era el Drive de PH
(«JUGADORES PH SPORT», una subcarpeta `NOMBRE (CLUB)` por jugador). Ni el nombre de la
carpeta ni el de los archivos dicen de qué club es la foto («RAYAN ZINEBI (REAL MADRID
C)» solo tenía fotos del Granada): hay que verlas.

---

## Internacionalización (i18n)

### Estrategia de rutas

- **Español** = idioma por defecto → sin prefijo (`prefixDefaultLocale: false`)
- **Inglés** = prefijo `/en/`
- **Italiano** = prefijo `/it/` (desde el 2026-10-01)

| Página | ES (defecto) | EN | IT |
|---|---|---|---|
| Inicio | `/` | `/en/` | `/it/` |
| Talentos | `/talentos/` | `/en/talents/` | `/it/talenti/` |
| Servicios | `/servicios` | `/en/services` | `/it/servizi` |
| Sobre nosotros | `/sobre-nosotros` | `/en/about` | `/it/chi-siamo` |
| Aviso legal | `/aviso-legal` | `/en/legal-notice` | — |
| Privacidad | `/privacidad` | `/en/privacy` | — |

**Los textos legales no existen en italiano, a propósito** (`DECISIONS.md`,
2026-10-01). No es un hueco que rellenar: traducir texto legal es una decisión
de Mario, no técnica.

Los textos en italiano están **traducidos sin revisión nativa**: antes de
publicarlos en producción tiene que leerlos alguien que hable italiano
(`docs/hallazgos-abiertos.md`).

Las rutas `/equipo` y `/en/team` redirigen a `/sobre-nosotros#equipo` y `/en/about#equipo` respectivamente (la sección de equipo fue absorbida por About en V3).

No hay páginas de detalle por jugador: el grid de `/talentos/` es no-clicable por diseño y la vista individual fue retirada.

### Mapeo de rutas

`STATIC_ROUTES` en `src/i18n/utils.ts` es la **fuente única de verdad**: una fila
por página con su ruta en cada idioma (sin `it` en las legales). Al añadir una
página nueva, declararla ahí. De esa tabla salen tres funciones, con dos reglas
distintas para cuando una página no existe en un idioma:

| Función | Para qué | Si la página no existe en ese idioma |
|---|---|---|
| `getLangUrls(path)` | Los `hreflang` de `BaseLayout` | No se declara esa versión |
| `getLangSwitchUrl(path, lang)` | El selector de idioma | Lleva a la **home** de ese idioma: quien elige idioma pide leer en él |
| `localizePath(rutaES, lang)` | Enlaces dentro del contenido (`localizePath('/servicios/', lang)`) | Lleva a la versión **inglesa**: el enlace promete esa página. Así el pie italiano enlaza a los textos legales en inglés |

`localizePath()` conserva la barra final y el ancla tal como se escriben, y
falla en el build si la ruta no está en la tabla. Los menús salen de
`NAV_ITEMS` (`src/lib/navigation.ts`), que lleva su propia ruta por idioma.

### Selector de idioma

Vive en `Header.astro`. **En escritorio es una pestaña con su panel**: la pestaña
muestra el código del idioma actual («ES»; sin bandera desde la variante C: una
bandera es un país, no un idioma) y abre los tres, con su código y su nombre, en
un panel enmarcado por cuatro escuadras. Es un botón que despliega enlaces
(patrón *disclosure*), no un `role="menu"`. El estado lo lleva `aria-expanded` y
el CSS abre el panel a partir de él, sin JS de animación: `src/scripts/dropdown.ts`
arrastra GSAP y `ph-text-animations.ts`, con efectos globales, a páginas que no
los cargan, como las legales. **En el menú móvil van los tres en una fila** al
pie del campo, sin desplegable dentro del menú.

**Trampa: la cabecera persiste entre navegaciones** (`transition:persist`). Su
HTML es el de la primera página cargada, así que el script del Header reescribe
en cada navegación todo lo que depende del idioma: menú, logo, botón y destino
de cada opción. Un enlace que solo se calcule en el servidor queda mal después
de navegar. Así estuvo el selector antiguo en los textos legales: llevaba a la
home en lugar de a la página equivalente. El smoke comprueba los destinos
después de cargar, no en el HTML servido.

**Al navegar, el panel se cierra en seco** (`astro:before-preparation`, sin
animación). La View Transition fotografía la cabecera antes del cambio y deja esa
foto fija toda la transición (`::view-transition-old(ph-header)` va sin
animación). Cerrado en `after-swap` o con su fundido, el panel abierto se veía
encima ~0,4 s después de elegir idioma.

---

## Hero — Vídeo del neón + Logo Reveal

### Vídeo

Desde el 2026-10-01 el hero es un **vídeo renderizado**: el logo de PHSPORT como
rótulo de neón LED sobre metacrilato, en una pared de fieltro. Antes fue una foto
fija de ese mismo rótulo, y antes un vídeo de oficina; el porqué de cada cambio,
en `DECISIONS.md`.

**No hay metraje: el vídeo se renderiza.** `scripts/hero-neon/neon.html` dibuja la
escena en WebGL con la geometría de `public/logo.svg`, y
`scripts/build-hero-neon.mjs` (`npm run assets:hero`) la abre en un Chrome sin
ventana, la graba fotograma a fotograma y la codifica en `public/hero/<versión>/`.
Para cambiar el encuadre, el color o el ritmo, se toca el render y se regenera.

**Dos piezas por pantalla**, que encadena el script de `HeroSection.astro`:

| Pieza | Qué es | Cómo se reproduce |
|---|---|---|
| Encendido (3 s) | El rótulo apagado se enciende mientras la cámara se acerca: la luz recorre el tubo desde la unión de las dos piezas, titubea y se estabiliza | Una vez, a mano tras `load` |
| Bucle (12 s) | El rótulo encendido, con un zumbido sutil y un fallo breve de la flecha pequeña, mientras la cámara recorre cinco planos: giros a un lado y a otro, picado, contrapicado, inclinaciones y acercamientos. Orbita alrededor del logo, que no sale del centro, y se para un instante en el plano frontal, donde caen las uniones (`docs/trampas-conocidas.md`) | En bucle, al acabar el encendido |

El último fotograma del encendido es el primero del bucle, y el último del bucle
enlaza con su primero: no hay saltos. El bucle se descarga mientras se ve el
encendido.

**Dos encuadres**, elegidos por `<source media>` con `HERO_PORTRAIT_MEDIA` (más
estrecha que 9:10):

| Pantalla | Archivo | Encuadre |
|---|---|---|
| Horizontal, o casi | 1920×1080 | Logo centrado, al 48 % del alto en el plano base y hasta ~59 % en el más cercano |
| Vertical | 886×1920 (9:19,5) | Logo centrado, al 70 % del ancho en el plano base y hasta ~85 % en el más cercano |

El vertical es 9:19,5 porque es la proporción más estrecha de los móviles: con
`object-fit: cover`, en pantallas menos alargadas sobra pared por arriba y por
abajo, nunca logo. La coreografía (`SHOTS` en el render) y estos tamaños están
pensados para que el logo no se salga nunca del encuadre: si se cambian, hay que
mirar los planos más cercanos en los dos formatos.

**Encima del vídeo, el visor que sigue al rótulo** (variante C, `DECISIONS.md`
2026-10-03). Cuatro escuadras doradas enmarcan el neón y lo siguen mientras la
cámara se mueve; de sus esquinas salen las líneas guía a «Now.», «Next.» y
«Forever Football.». Del `<video>` no se puede leer dónde está el logo, así que
se midió una vez: `scripts/build-hero-track.mjs` saca los fotogramas de los
cuatro vídeos a 15 por segundo, busca la caja de lo que brilla y la guarda en
`src/lib/heroTrack.ts` (en fracciones del fotograma). El script del hero
interpola la caja del instante que se ve (`currentTime`) y la lleva a la pantalla
con la cuenta de `object-fit: cover`. Detalles:

- **Si cambia el vídeo, hay que regenerar la tabla** (`node scripts/build-hero-track.mjs`,
  después de `npm run assets:hero`): con la de otro vídeo, el visor se va del rótulo.
- **Solo trabaja con el hero a la vista y el vídeo en marcha** (un
  `IntersectionObserver` arranca y para el `requestAnimationFrame`). Con el
  póster encendido (movimiento reducido, sin autoplay, error) se coloca una vez.
- **Sin JS**, el visor queda en la caja del plano base, en CSS (la misma cuenta de
  `cover` con unidades de contenedor). **Ojo**: `container-type: size` necesita un
  `height` en el hero; con solo `min-height`, las unidades `cqh` valen 0.
- **No es un bucle aparte**: sigue al vídeo. Si se le pone control de pausa al
  vídeo (hallazgo WCAG 2.2.2), el visor se para con él.
- Al bajar, el visor se suelta (se abre y se apaga) cuando el hero lleva un 30 %
  fuera; al volver, se fija otra vez.

**Lo que se ve antes y en lugar del vídeo** son pósters: fotogramas exactos con el
mismo encuadre.

| Caso | Se ve |
|---|---|
| Hasta que arranca el vídeo | El rótulo apagado (primer fotograma del encendido). Es el LCP |
| `prefers-reduced-motion` | El rótulo encendido, fijo. No se reproduce nada |
| Sin JavaScript, error del vídeo o autoplay bloqueado (modo de bajo consumo en iPhone) | El rótulo encendido, fijo. Si era autoplay bloqueado, al primer gesto arranca el bucle |

Cada vídeo va en HEVC (Safari, iOS y equipos que lo decodifican por hardware) y en
H.264 (todo lo demás); el parámetro `codecs` del `type` hace que el navegador elija
sin bajarse el que no puede reproducir. La versión va en la ruta porque
`vercel.json` sirve `public/` con 7 días de caché: un vídeo nuevo, carpeta nueva.

### Logo Reveal

`LogoReveal.astro` tapa la home con un overlay negro mientras se dibuja el trazo del logo. **La animación es CSS puro, sin JavaScript**: arranca con el primer pintado y termina sola aunque el JS no llegue nunca. Duración 1,3 s.

Desde el 2026-10-03 (variante C «Análisis», `DECISIONS.md`) el telón es **una calibración**: se dibuja la retícula de la sala de análisis, una cortina en la diagonal del logo descubre el centro, cuatro escuadras se cierran en él y dentro se traza el contorno del logo en dorado, **con el tamaño y en el sitio exactos del rótulo de neón** del vídeo. A 0,95 s las escuadras se sueltan, el contorno se apaga encima del tubo y el negro se va: un corte a juego, del contorno dibujado al neón de verdad. Sale entero a 1,3 s. (Con «Marcador», del 2026-10-02, era una paleta que se plegaba.) Dos detalles:

- **El ancho sale del encuadre del render** (`scale` en `scripts/hero-neon/neon.html`, con la cámara en la pose de arranque del encendido, distancia 1,22): `max(27,9vw, 49,6vh)` en apaisado y `max(57,4vw, 26,5vh)` por debajo de 9:10. Si cambia el encuadre del render, cambian estas cifras.
- **La animación de salida del overlay se sigue llamando `ph-intro-salir`**: el script del componente la busca por nombre para anotar que la intro ya se vio, y el del hero, para saber cuánto le queda.

Fue una island de React hasta el 2026-06-25 (`2b74656`), GSAP vanilla hasta el 2026-08-27; ver `DECISIONS.md`.

**Cuatro cosas que parecen arbitrarias y no lo son.** Cambiar cualquiera vuelve a romper lo que arreglaron:

| Cómo está | Por qué |
|---|---|
| El overlay se monta desde `BaseLayout` (prop `intro`), **fuera de `<main>`** | `transition:name` en `<main>` crea un contexto de apilamiento, así que dentro el `z-index: 9999` no le ganaba al header y hacía falta un parche para ocultarlo. Fuera, el z-index manda solo |
| Su CSS va **en línea en el `<head>`**, no en el `<style>` del componente | Desde el componente viaja en el bundle común: medido, no se aplicaba hasta los 838 ms y el overlay se pintaba antes como un div suelto, sin tapar nada |
| Los estilos **nunca** en el atributo `style` del elemento | Una declaración inline gana a cualquier regla de hoja: la que oculta el overlay en visita repetida no se aplicaría, y la home se quedaría en negro |
| `stroke-dasharray` escrito a mano (753 y 637) | Son los perímetros reales de los dos polígonos, y son constantes. Antes se medían en ejecución con `getTotalLength()`, con 32 reintentos y dos valores de reserva que estaban un 22 % pasados. `pathLength="1"` sería lo elegante, pero en WebKit/iOS no es de fiar |

**Cuándo sale**: la primera vez, y no vuelve hasta pasadas **18 h** (marca con `Date.now()` en `localStorage`, decidida por un script inline del `<head>` antes del primer pintado). El clic en el logo del header la fuerza siempre. Con `prefers-reduced-motion`, nunca.

El lema del hero («Now.», «Next.», «Forever Football.», `.hero-tag`) tiene una **red de seguridad en CSS** que lo revela a 2,2 s pase lo que pase: arranca oculto esperando al script, y como el telón no cuelga del mismo evento, sin ella podría abrirse sobre un hero mudo. Con el telón en pantalla, el lema espera a que las escuadras se suelten para entrar (`introRemaining()` en `HeroSection.astro`).

---

## Sistema de animaciones (Motion)

**Mundo «Análisis»** (variante C, 2026-10-03; el porqué y lo descartado en
`DECISIONS.md`): la web es la sala de análisis de PHSPORT y el movimiento **anota**
el contenido como las capas de tracking de un análisis de partido. Cada pieza une
dos cosas reales del contenido; ninguna adorna. Sustituye al lenguaje «Marcador»
(paletas, letras de tablero, luz entre páginas), que queda solo en `DECISIONS.md`.

| Pieza | Qué hace | Dónde |
|---|---|---|
| **Retícula** | Líneas de 1 px casi invisibles cada 48 px (64 en escritorio), fijas a la pantalla, con las verticales en el borde del texto | `body::before` en global.css (`--ph-grid`, `--ph-grid-line`) |
| **Zona** | Abre cada bloque: índice en monoespaciada, etiqueta y una regla con marcas sin números que se traza al entrar | `Zone.astro`; `.ph-zone` |
| **Visor** | Cuatro escuadras doradas que llegan desde 12 px fuera y se clavan (240 ms); al soltarse se abren 6 px y se apagan (150 ms). Tres modos: al entrar en pantalla, al señalar a su padre, o movido por un script | `Visor.astro`; `.ph-visor--view/--hover/--js`, `--settle` (se queda en marcas) |
| **Nodo** | Anillo con punto. Al activarse, un anillo se expande una vez y se apaga: nunca en bucle | `.ph-node` (+ `--sm`, `--lg`, `--filled`); `ping()` en `ph-motion.ts` |
| **Línea guía** | Del punto a su etiqueta, en codo (45° y recto): se dibuja el trazo y la etiqueta se desliza 6 px | `Leader.astro`; `.ph-leader`, `.ph-after-leader` |
| **Enlace-nodo** | El botón de la web: nodo + etiqueta; al señalarlo, el anillo se expande y una flecha se dibuja hacia delante | `NodeLink.astro`; `.ph-node-link` |
| **Trazos medidos** | Un `path`, `line` o `circle` que se dibuja de principio a fin al entrar (campo de Servicios, esquemas, arcos) | `.ph-draw` + `measureStrokes()` (deja la longitud en `--len`) |
| **Escaneo** | Una línea dorada con estela barre de arriba abajo y descubre una foto (600 ms, una vez); el final es la foto tal cual | `.ph-scan` + `.ph-scan__media` |
| **Paso entre páginas** | La vieja se apaga y una línea dorada barre la pantalla (380 ms) descubriendo la nueva; al volver atrás, de abajo arriba | `.ph-stinger` en `BaseLayout`; `ph-motion.ts` |
| **Línea de pase** | La firma de la portada: una trayectoria que baja desde «Scroll» hasta el correo con el scroll, tocando el nodo de cada bloque, que se rellena al pasar | `ph-pass.ts`; `.ph-pass`, `[data-pass-node]` |
| **Trazo con el scroll** | Una línea que avanza con el dedo y descubre sus anotaciones al pasar (la trayectoria de Servicios, la línea de tiempo de Sobre nosotros). Lo descubierto no se vuelve a esconder al subir | `ph-scroll-draw.ts` |
| **Telestrador** | Una elipse a mano alrededor de unas palabras, una vez por página como mucho | `ph-telestrator.ts` |
| **Acordeón** | Abre y cierra sin animar el alto: lo de debajo se desplaza con FLIP y el panel se descubre con `clip-path` | `ph-disclosure.ts` |
| **Reordenado** | El grid de talentos desliza cada ficha a su sitio nuevo al filtrar, buscar u ordenar | `flipGrid` en `TalentsSection.astro` (GSAP Flip) |

**Curvas y tiempos.** Las mismas en CSS (`--ph-ease-*`, `--ph-dur-*` en
global.css) y en GSAP (`EASE` en `ph-text-animations.ts`, con CustomEase):
`ph-out` (0.16, 1, 0.3, 1) para llegar, `ph-emph` y `ph-std` de Material 3 y
`ph-in` (0.3, 0, 0.8, 0.15) para salir. Tiempos con nombre: toque 120 ms, estado
180, visor 240, línea guía 260, desplazamiento 300, campo 520, escaneo 600,
trayectoria de autor 760. Lo que se va, más rápido que lo que llega. **Sin
rebotes** y nada lineal salvo lo que va con el scroll.

**Reparto entre módulos.**
- `src/scripts/ph-motion.ts` es el **núcleo sin GSAP**: el observador de «entra en
  pantalla» (`data-inview` → `is-inview`), `whenInView`, los trazos medidos, el
  grosor de línea de los SVG escalados (`--k`), el `ping` del nodo y el paso entre
  páginas. Lo cargan la cabecera y el pie, así que está en todas las páginas,
  incluidas las legales, que no cargan GSAP.
- `src/scripts/ph-text-animations.ts` es la **infraestructura GSAP**: las curvas,
  el refresh coalescido de ScrollTrigger, el scroll al navegar, `afterTransitionPaint`
  y `mountSection` (medir trazos y vigilar lo que entra). **Ningún bloque crea ya un
  ScrollTrigger**: lo de entrar en pantalla es un `IntersectionObserver` y lo que va
  con el scroll, JS pasivo (`docs/rendimiento.md`). `clipPathReveal` y
  `magneticHover` siguen exportados **con cero usos**.
- Los de una pieza: `ph-pass.ts`, `ph-scroll-draw.ts`, `ph-telestrator.ts`,
  `ph-disclosure.ts` (arriba).

**Cómo se anima un bloque nuevo.** Abrirlo con `<Zone>`; lo que espera a entrar en
pantalla lleva `data-inview` (en él o en un contenedor) y sus piezas: `.ph-enter`
para texto que acompaña (sube 8 px y aparece; `--enter-delay` para escalonar),
`<Visor mode="view">` para fijar un titular, `.ph-draw` en los trazos de un SVG,
`.ph-scan` en una foto. En el `<script>` de la sección, `mountSection(sección)`
dentro de `afterTransitionPaint`.

**Reglas que sostienen todo:**
- **El estado de reposo es el visible.** Lo que espera a entrar en pantalla solo se
  esconde con `html.ph-anim` (hay JS y no hay movimiento reducido), debajo de un
  `[data-inview]` que aún no tiene `is-inview`.
- **Red de seguridad en CSS**: si el núcleo de movimiento no llega a correr
  (`html.ph-motion` no aparece), a los 2,5 s se ve todo. La lista está al final de
  global.css; lo que tiene su propia regla de entrada en un componente lleva ahí su
  línea. Lo que se anima con `transform` acaba siempre en `transform: none`.
- **`prefers-reduced-motion`**: nada se desplaza, escala ni barre; los trazos y los
  visores aparecen ya dibujados, la línea de pase se ve entera y no hay escaneos ni
  paso entre páginas. Se mantienen la opacidad y los cambios de color que confirman
  un gesto.
- **Solo `transform`, `opacity`, `clip-path` y `stroke-dashoffset`** en lo que se
  mueve. Nada anima `width`, `height`, `top` o `left`.
- **El paso entre páginas guarda su sentido en la propia pieza** (`is-back`), no lo
  lee de `<html>`: Astro quita `data-astro-transition` a mitad de la pasada
  (`docs/trampas-conocidas.md`).
- **Lo que va con el scroll nunca lo bloquea**: listeners pasivos y un
  `requestAnimationFrame` por fotograma como mucho.

**Regla**: GSAP solo en el `<script>` de un componente `.astro` o en `src/scripts/`, nunca en el markup ni en una island. Las curvas (`EASE`) y la infraestructura salen de `ph-text-animations.ts`; los plugins (Flip en Talentos, MotionPath en Sobre nosotros) se importan de `'gsap/all'`.

### Cabecera de sección y fondo animado

Talentos, Servicios y Sobre nosotros comparten la misma cabecera desde el
2026-10-01 (`DECISIONS.md`, «Cabecera de sección legible»). El objetivo es que el
contenido empiece ya en la primera pantalla y que todo se lea sin esfuerzo:

- **Zona → titular → entradilla.** Arriba, la zona: el número y el nombre de la
  sección («02 · Talentos») con su regla; debajo el titular grande y, justo
  debajo, la entradilla. Después, sin hueco de por medio, lo propio de cada página:
  los controles y la primera fila de tarjetas en Talentos; «Áreas de gestión» en
  Servicios; los valores y la presentación en Sobre nosotros.
- **Cinco papeles, un tamaño cada uno**, para que se distingan sin leerlos:
  - Titular: Söhne 600, 46–106 px (las palabras doradas, sin cursiva).
  - Entradilla: Söhne, 18–22 px, blanco al 90 %.
  - Texto corrido: Helvetica, 16–18 px, blanco al 82 %, como mucho 62 caracteres por línea.
  - Etiquetas: letra normal, 13–15 px.
  - Números (02, 01–05, «05 disciplinas · 01 equipo»): lo único en monoespaciada (`Digits.astro`, `.ph-num`).
- **La zona es una pieza reutilizable** (`Zone.astro`, estilos `.ph-zone` en
  `global.css`): etiqueta a la izquierda, regla con marcas sin números que se traza
  al entrar y, si hace falta, un dato a la derecha. Abre cada bloque de la web
  (también los de la portada), «Áreas de gestión» en Servicios y el equipo en Sobre
  nosotros.
- **Mismas cifras en las tres páginas**: alturas, separaciones y tamaños salen de
  `--ph-head-*` en `global.css`, y los tonos de texto de `--ph-ink-*`. Los estilos
  compartidos son `.ph-zone`, `.ph-head-title` y `.ph-head-lead`. Cambiarlos
  ahí cambia las tres páginas a la vez.
- **«02 · Talentos» se parte en `Zone.astro`** por « · » cuando empieza por un
  número, para dar al número y a la etiqueta estilos distintos. Si un idioma
  cambiara ese separador en el rótulo, saldría entero como etiqueta.

El fondo es un `<canvas class="ph-ambient" data-ambient="<escena>">` dentro de
`<div class="ph-page-bg">`. Lo dibuja en directo `src/scripts/ph-ambient.ts` con
un shader de WebGL2:

| Sección | Escena | Qué se ve |
|---|---|---|
| Talentos | `trayectorias` | Líneas finas a 45° (la diagonal del logo) por las que suben destellos dorados |
| Servicios | `estructura` | La propia retícula de la página (la de `body::before`), que dos barridos lentos a 45° van encendiendo: líneas y cruces. El shader lee el paso y el desfase de la retícula del CSS (`uGrid`), así que casan al píxel |
| Sobre nosotros | `calidez` | Un haz de luz cálida que se mece, con motas de polvo dentro |

Cómo convive con la página, todo dentro del módulo:

- **Es el fondo de toda la página**: `.ph-page-bg` va fijo a la pantalla
  (`position: fixed`, `z-index: -1` dentro de `<main>`) y el contenido pasa por
  encima al hacer scroll. Por eso las secciones `.talents` y `.srv` tienen el fondo
  transparente; si una vuelve a llevar fondo opaco, tapa la luz.
- **Dónde brilla lo decide el shader** (`stageMask`):
  - La luz está entera solo detrás del titular (el `<h1>` de la sección, medido en
    px de página).
  - En el resto de la página baja al 32 % (`OUTSIDE_TITLE`), para que no ensucie
    los párrafos.
  - Bajo el menú se apaga siempre.
  - El shader recibe el scroll en cada fotograma.
  - No hay `mask-image` ni fondo de color en el contenedor: con una caja con
    fundidos de CSS se veía su borde (la «placa» gris de la primera versión).
- **Dibuja mientras la pestaña está visible**, a la frecuencia de la pantalla. Como
  ocupa la pantalla entera, ya no se pausa al hacer scroll: es el coste de que la
  luz esté siempre (ver `docs/hallazgos-abiertos.md`).
- **`prefers-reduced-motion`**: un fotograma fijo, sin animación, que se repinta al
  hacer scroll porque la zona brillante se mueve con el titular.
- **Se suma al fondo**: salida premultiplicada, así que no tapa nada.
- **ClientRouter**: al cambiar de página destruye los contextos de WebGL de la que
  se va (el navegador tiene un tope de contextos vivos).
- **Sin WebGL2**: el canvas queda transparente y se ve un halo dorado de CSS
  (`.ph-ambient:not(.is-live)`); con la animación en marcha lleva `is-live` y el
  halo desaparece.
- **Densidad**: resolución interna con tope de 1,5 px por px CSS (y al 75 % en
  `calidez`, que es suave). Más no se nota en algo tan tenue y cuesta GPU.

Para tocar una escena: su shader está en el mismo archivo. Se ve en directo con
`npm run dev`.

**El logo de la cabecera cae en la misma vertical que los textos.** La barra va
de borde a borde y su contenido lleva un margen de sección de relleno
(`Header.astro`), así el logo queda donde empiezan los textos y sobre una línea
de la retícula. Arriba del todo la barra es transparente; al bajar, negra al 96 %
con una línea de 1 px debajo (sin cristal ni desenfoque).

**No hay islands de React en el proyecto** — cero archivos `.tsx`, y `@astrojs/react` no está en `astro.config.mjs`. La última (`LogoReveal`) se migró a vanilla el 2026-06-25. Si alguna vez hiciera falta una, sería una decisión nueva a registrar en `DECISIONS.md`, no la aplicación de un patrón existente.

---

## Reglas de performance (no negociables)

| Regla | Motivo |
|---|---|
| Todas las imágenes con `<Image>` de `astro:assets` | WebP automático + width/height → cero CLS. Excepción: las fotos del grid de talentos van en `<picture>` AVIF 90 con WebP 85 de reserva (`DECISIONS.md`, 2026-10-01) |
| GSAP en `<script>` de `.astro`, nunca en una island | React fuera del bundle (~182 KB menos en la home) |
| Named imports: `import { X } from 'lib'` | Tree-shaking efectivo |
| Fuentes self-hosted desde `/public/fonts/` | Elimina round-trips externos |
| `font-display: swap` en `@font-face` | Sin FOIT |
| `<Image loading="eager" fetchpriority="high">` solo en primer fold | El resto: lazy |
| Vídeo del hero: `preload="none"` y `play()` a mano tras `load` | `preload="metadata"` **no basta**: con `autoplay`, Chrome se lo salta y descarga el vídeo igual. Medido en agosto: retrasaba el evento `load` 504 ms y el póster —que era el LCP real— medio segundo |
| El telón de intro, en CSS y nunca dependiendo del JS | Un overlay opaco que solo se quita por JavaScript deja la portada en negro si el JS falla |
| Lo que espera a entrar en pantalla, visible en reposo y con red de seguridad en CSS (2,5 s) | Si el JS de movimiento no llega, la página se tiene que ver entera igualmente (Motion, arriba) |
| Hover prefetch en links de navegación | Precarga la siguiente página en hover |

---

## SEO checklist por página

- `<title>` único y descriptivo
- `<meta name="description">` entre 120-160 caracteres
- `<link rel="canonical">` apuntando a la URL canónica
- `<link rel="alternate" hreflang>` por cada idioma en que existe la página (`es` y `en` siempre, `it` salvo en las legales), más `x-default` a la española
- `@astrojs/sitemap` genera `sitemap.xml` automáticamente en build

### Reglas de dominio (no romper)

El dominio canónico es el **apex** `phsport.es`; `www` redirige con 308. Ver DECISIONS.md (2026-08-11).

- El JSON-LD `WebSite` se emite **solo en la home**. Google resuelve el *site name* leyendo la raíz del dominio; si la raíz devuelve un 3xx o el bloque no está ahí, muestra el dominio en minúsculas ("phsport") en su lugar.
- **Los redirects van en `vercel.json`**, nunca en `astro.config.mjs`: en build estático Astro los materializa como HTML con `meta refresh` y respuesta 200, no como 301.
- Al tocar dominios o redirects, verificar que la raíz responde 200 y sirve el `WebSite`:
  ```sh
  curl -sS -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
    -I https://phsport.es/
  curl -sS https://phsport.es/ | grep -o '"@type":"WebSite"[^}]*}'
  ```
- `@astrojs/sitemap` **sin** opción `i18n`: empareja versiones por path y los slugs están traducidos (`/servicios` ↔ `/en/services`), así que solo anotaría 2 de 12 URLs.

---

## Sistema de diseño

> Fuente de verdad visual del proyecto. Variables en `src/styles/global.css`.

### Paleta de colores

| Token | Variable CSS | Hex | Uso |
|---|---|---|---|
| `ph-black` | `--ph-black` | `#0d0f12` | Fondo base — charcoal authority |
| `ph-white` | `--ph-white` | `#ffffff` | Texto principal y contraste |
| `ph-gold` | `--ph-gold` | `#D6B25E` | Acento único — nunca como fondo o relleno |
| `ph-gold-muted` | `--ph-gold-muted` | `#a8893e` | Hover y estados activos del oro |
| `ph-white-60` | `--ph-white-60` | `rgba(255,255,255,0.60)` | Texto secundario y descripciones |
| `ph-white-20` | `--ph-white-20` | `rgba(255,255,255,0.20)` | Bordes sutiles y separadores |
| `ph-white-10` | `--ph-white-10` | `rgba(255,255,255,0.10)` | Fondos de cards sobre negro |
| `ph-black-80` | `--ph-black-80` | `rgba(13,15,18,0.80)` | Overlays sobre imágenes y vídeo |

**Regla de oro**: el acento dorado aparece en máximo un elemento por bloque visual. Si todo brilla, nada brilla.

### Tipografía

| Rol | Fuente | Pesos usados | Uso |
|---|---|---|---|
| Display | Söhne (Klim) | 600 | Titulares, rótulos, el lema, nombres en las tarjetas y en la hoja del equipo |
| Display ligera | Söhne (Klim) | 400 | Entradillas |
| Body | Helvetica Neue | 400 | Cuerpo, navegación, etiquetas, interfaz |
| Cifras | Monoespaciada del sistema | 500 | Solo cifras e índices (01–05, 7, 360°, códigos ISO), con `.ph-num` o `Digits.astro` |

Sin cursivas: Söhne no tiene cursiva y el navegador la sintetiza; las palabras
doradas se marcan solo con el color.

**Söhne**: fuente de pago — licencia en https://klim.co.nz/retail-fonts/sohne/
Archivos `.woff2` en `/public/fonts/sohne/`. Nombre de familia en código: `Sohne` (sin umlaut).
Son los de prueba de Klim y **no traen letras acentuadas**: á, ñ, è… salen en la
fuente de reserva (`docs/hallazgos-abiertos.md`).

### Escala tipográfica

| Elemento | Tamaño |
|---|---|
| Lema del hero | Söhne 600: «Now.» y «Next.» 40–84 px; «Forever Football.» 44–96 px, en oro |
| Rótulos de bloque de la portada («El roster.», «Hablemos.») | Söhne 600, `clamp(56px, 16vw, 128px)` y `clamp(60px, 18vw, 136px)` |
| Titular de cabecera de las interiores | Söhne 600, 46–106 px (`--ph-head-title-size`) |
| Entradilla | Söhne 400, 18–22 px (`--ph-head-lead-size`) |
| Texto corrido | Helvetica 16–18 px |
| Etiquetas y zonas | Helvetica 13–15 px, letra normal |

### Espaciado de secciones

```css
--ph-section-py: clamp(4rem, 8vw, 8rem);
--ph-section-px: clamp(1.5rem, 5vw, 6rem);
```

`--ph-section-px` es también el borde del texto: la retícula pone ahí una vertical,
la cabecera alinea ahí el logo y la línea de pase de la portada baja por la mitad
de ese margen.

### Utilidades globales

| Clase | Descripción |
|---|---|
| `.ph-accent` | Texto en color dorado (las palabras doradas de los titulares) |
| `.ph-num` | Cifras en monoespaciada tabular |
| `.ph-zone`, `.ph-visor`, `.ph-node`, `.ph-leader`, `.ph-node-link`, `.ph-draw`, `.ph-scan`, `.ph-enter` | Las piezas del mundo «Análisis» (ver Motion) |
| `.ph-head-title`, `.ph-head-lead` | Titular y entradilla de cabecera de las interiores |
| `.ph-section` | Contenedor de sección con padding responsivo y max-width |
| `.skip-link` | Enlace de accesibilidad "saltar al contenido" |
| `.ph-label`, `.glass-card` | **Sin uso** (de diseños anteriores) |

### Radios de borde

`--radius-sm` (4 px) y `--radius-md` (6 px) en `@theme`. En el mundo «Análisis»
casi todo es recto: escuadras, líneas, paneles y fotos no llevan radio; solo los
nodos son círculos.

### Principios visuales

- **Clima**: la sala de análisis de un partido. Inteligencia medida y legible, no lujo decorativo.
- **Fondo**: siempre `ph-black`, con la retícula casi invisible encima. Sin blancos de fondo.
- **El oro anota**: líneas, nodos, visores, la página activa y las palabras doradas. Nunca superficies grandes. La estructura (campo, ejes, reglas) va en blanco al 24 % (`--ph-struct`).
- **Cada línea une dos cosas reales del contenido**. Ninguna lectura inventada: ni coordenadas, ni porcentajes, ni velocidades; las marcas de las reglas van sin números.
- **Trazo único**: 1,5 px para todo lo que anota (`--ph-stroke`); los SVG escalados lo conservan con `--k`.
- **Espaciado**: generoso. El negro es parte del diseño.
- **Animaciones**: con propósito, en el mundo «Análisis» (Motion, arriba). Una pieza de autor por página; el resto, apoyo. Sin rebotes.
- **Fotografía**: tal cual, sobre fondo oscuro. Ratio portrait `3:4` para jugadores.

---

## Tests

Un único smoke E2E con **Playwright**, en `tests/e2e/`. Se lanza con
`npm run test:e2e`: construye, levanta `astro preview` en el **4322** y prueba
las 16 páginas del build.

**Corre contra `dist/`, no contra el dev server**, porque lo que importa es lo
que se sube a Vercel. El puerto 4322 es deliberado: el 4321 tiene `strictPort`,
así que los tests conviven con un `npm run dev` abierto.

Las rutas **se derivan de `dist/`** (`tests/e2e/rutas.ts`), no de una lista
escrita a mano: una página nueva entra en el smoke sola.

Qué cubre, y por qué justo esto:

| Comprobación | Qué regresión atrapa |
|---|---|
| 200, `<title>`, `lang`, canonical | La página deja de construirse o de identificarse |
| Consola sin errores y sin respuestas ≥400 | Un asset renombrado, un script que revienta |
| `hreflang` recíproco, en el idioma que anuncia y apuntando a páginas que existen | Una ruta nueva olvidada en `STATIC_ROUTES`: `getLangUrls()` devuelve el grupo de la home en silencio y el aviso **solo salta en dev**. Cada versión debe declarar el mismo grupo, así que también falla una española que olvide a su gemela italiana |
| El selector de idioma de cada página lleva a esa página en cada idioma | Que el script de la cabecera persistente deje un destino equivocado al navegar |
| El desplegable abre, cierra con Escape y cambia de idioma sin perder la página | Que la cabecera no se ponga al día tras una navegación del `ClientRouter`, o que el panel salga en la foto de la View Transition |
| `WebSite` JSON-LD **solo** en `/` | La regla que costó 4 meses de "phsport" en minúsculas en la SERP (`DECISIONS.md`, 2026-08-11) |
| La marca se escribe `PHSPORT` | Que vuelva a colarse "PH Sport" en el marcado que lee Google |

### Cuándo se ejecutan

No hay que acordarse: corren solos en dos puntos.

| Dónde | Cuándo | Qué hace si fallan |
|---|---|---|
| `.githooks/pre-push` | Antes de un push que toque `main` | **Aborta el push.** Es la última parada antes de producción |
| `.github/workflows/e2e.yml` | Push a `main`, PRs y a mano | Avisa. **No** frena el despliegue de Vercel |

El hook **solo actúa sobre `main`** — empujar una rama de trabajo no paga los 40s
— y se salta con `git push --no-verify`, momento en que la Action pasa a ser la
única red.

Vive en `.githooks/` (versionado) y no en `.git/hooks/` (que no se clona) para
que valga en cualquier dispositivo. Lo activa `core.hooksPath`, que configura el
script `prepare` de `package.json` en cada `npm install`: en un clon nuevo no hay
que ejecutar nada a mano.

**Lo que NO cubre** — que es tanto como lo que cubre:

- **Nada visual.** Sin capturas de referencia: en un sitio con GSAP y View
  Transitions serían falsos positivos constantes.
- **Nada de animaciones.** Ver la trampa en `CLAUDE.md`: las View Transitions
  viven en la `top-layer` y no salen ni en captura ni en `getAnimations()`.
- **Los 146 redirects de `vercel.json`**, que los sirve Vercel y no `astro preview`.
- **Los bugs de motor concreto** (iOS fuera de Safari). Chromium headless no
  puede reproducirlos: eso sigue exigiendo dispositivo real.

---

## Estado del proyecto

> Última revisión de esta sección: **2026-08-11**.
> Es la parte que antes se queda obsoleta. Si vas a decidir algo a partir de la
> tabla de pendientes, **verifícalo contra el código** — no la des por buena.

### Componentes

> Tabla revisada el 2026-10-03, con la variante C «Análisis» (rama `feat/variante-c-analisis`).

| Componente | Estado | Notas |
|---|---|---|
| `BaseLayout.astro` | ✅ Completo | SEO, hreflang, preload fuentes, ClientRouter. CSS de la intro en línea y la pieza del paso entre páginas |
| `Header.astro` | ✅ Completo | Barra de herramientas: visor en la página activa que se desplaza a la señalada, pestaña de idioma con panel enmarcado, scroll-hide. Menú móvil: un campo que se dibuja, con las páginas como nodos; foco atrapado y el resto de la página `inert` |
| `Footer.astro` | ✅ Completo | «Informe final»: el lema con el nodo donde acaba la línea de pase, el logo que se dibuja y listas con nodos; legales y copyright en una línea |
| `LogoReveal.astro` | ✅ Completo | Animación en CSS, sin JS. Una vez cada 18 h. Calibración: retícula, escuadras y contorno del logo sobre el neón (1,3 s) |
| `HeroSection.astro` | ✅ Completo | Vídeo del neón (encendido y bucle) con encuadre apaisado y vertical. Visor que sigue al rótulo (`heroTrack.ts`) y líneas guía al lema; «Scroll» arranca la línea de pase |
| `HomePlayersSection.astro` | ✅ Completo | Zona, rótulo «El roster.» con visor, entradilla anotada y CTA como nodo. Sin fotos a propósito (commit `453e928`) |
| `HomeServicesSection.astro` | ✅ Completo | Diagrama de 360°: dial con las cinco áreas y el Plan de Acción en el centro, y lista acordeón con el mismo estado. Desde 1280 px, los títulos rodean el dial y el área elegida sale en un panel unido por una línea guía |
| `HomeAboutSection.astro` | ✅ Completo | Cita con telestrador; 7 países como red de sedes y 360° como círculo que se cierra; valores sobre un eje |
| `HomeContactSection.astro` | ✅ Completo | «Hablemos.» con visor y el correo, donde acaba la línea de pase; foto en un visor, descubierta por un escaneo |
| `AboutSection.astro` | ✅ Completo | Absorbe /equipo. Línea de tiempo con el scroll, hoja de plantilla (21), esquema de sedes con arcos desde Madrid |
| `ServicesSection.astro` | ✅ Completo | Titular fuera de un campo dibujado, áreas con nodos, trayectoria con el scroll, 5 pilares anotados, manifiesto con telestrador |
| `TalentsSection.astro` | ✅ Completo | Grid 3:4 no clicable (2/3/5 columnas). Tarjeta «en seguimiento»: escaneo, visor que se queda en marcas, nombre en línea guía. Buscar, filtrar y ordenar con FLIP; controles segmentados con visor |
| `Zone.astro`, `Visor.astro`, `Leader.astro`, `NodeLink.astro`, `Digits.astro` | ✅ Completo | Piezas del mundo «Análisis» (2026-10-03). Ver Motion |
| `FooterSocialIcon.astro` | ✅ Completo | |
| `Button.astro`, `SectionHeader.astro` | ⚠️ Sin uso | Nadie los importa; de diseños anteriores |
| `LanguageSwitcher.astro` | ⚠️ Vacío | El selector vive en `Header.astro` |

### Páginas

| Página | Estado | Notas |
|---|---|---|
| `/` | ✅ Funcional | V3: Hero → Talentos → Servicios → About → Contact |
| `/sobre-nosotros` | ✅ Funcional | V3 — absorbe /equipo (sección #equipo) |
| `/talentos/` | ✅ Funcional | Grid 3:4 no clicable, búsqueda + filtro rol + orden |
| `/servicios` | ✅ Funcional | 6 pilares + hero |
| `/en/` | ✅ Funcional | Mirror de ES |
| `/en/about` | ✅ Funcional | Mirror de ES |
| `/en/talents/` | ✅ Funcional | Mirror de ES |
| `/en/services` | ✅ Funcional | Mirror de ES |
| `/it/`, `/it/talenti/`, `/it/servizi`, `/it/chi-siamo` | ⏳ Funcional, texto sin revisar | Mirror de ES sin textos legales. Pendiente de revisión nativa |

### Assets y contenido

| Item | Estado | Notas |
|---|---|---|
| Logo SVG | ✅ En `/public/logo.svg` | |
| Vídeo hero | ✅ `public/hero/2026-10b/` | Logo en neón renderizado desde `scripts/hero-neon/neon.html`: apaisado 1920×1080 y vertical 886×1920 |
| Fotos jugadores | ✅ 52 de las 52 tarjetas visibles | 51 jugadores y el entrenador, todos de la serie de estudio de Mario y con la camiseta del club de la ficha (2026-10-02). Ver «Fotos de jugadores» arriba |
| Escudos de selección | ✅ 9 WebP en `/public/national-team-badges/` | ES, PE, HR, MK, MA, BO, RO, PA, BR. Master PNG en `/assets/source-media/badges/` |
| Fuente Söhne | ✅ Integrada | Archivos test de Klim — pendiente licencia. Sin letras acentuadas: se pintan con la fuente de reserva |
| OG image (1200×630px) | ❌ Pendiente | |

### Pendientes

| Pendiente | Bloqueado por |
|---|---|
| Revisión nativa de los textos en italiano (2026-10-01) | Alguien que hable italiano |
| OG image 1200×630px | Diseño |
| GA4 — Measurement ID | Decisión de si se integra |
| ⚠️ Söhne `.woff2` con licencia de producción — **sigue sin comprar a 2026-08-11**, y la web está publicada desde abril con los archivos de prueba | Compra de licencia (Mario) |

---

## Convenciones clave

- **Slug del jugador**: se deriva del nombre con `slugify(name)`. Este mismo slug nombra la foto en `src/assets/images/players/{slug}.{jpg,jpeg,png,webp}`.
- **Foto por jugador**: cualquier jugador sin foto coincidente recibe el placeholder SVG automáticamente.
- **Ocultar un talento**: `"hidden": true` en `jugadores.json`. `getAllRosterEntries()` lo filtra en build.
- **GSAP en secciones**: siempre a través de `ph-text-animations.ts`, nunca importado directamente en `.astro`.
- **Sin islands de React**: todo el JS de cliente va en `<script>` de componentes `.astro`.
- **Datos de dominio en `lib/`**: `playerDetail`, `teamMembers`, `servicesItems`, etc. son la fuente de verdad. Las páginas y secciones los consumen.

Ver `DECISIONS.md` para el histórico completo de decisiones no obvias.
