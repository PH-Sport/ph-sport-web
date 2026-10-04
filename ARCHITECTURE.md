# PHSPORT — Architecture Document

> Documento de referencia para el proyecto. Leer antes de cualquier tarea estructural.
> Última revisión: 2026-10-03 (rama `feat/variante-b-titulos`: variante B «Títulos», propuesta sin fusionar)
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
│   ├── icons/
│   ├── national-team-badges/        # Escudos de selecciones nacionales
│   ├── about-equipo.webp            # Ya no se muestra: es el origen de og-image.jpg (npm run assets:favicons)
│   ├── favicon.svg
│   ├── hero/2026-10b/               # Vídeos y pósters del hero (npm run assets:hero). La versión va en la ruta por la caché de 7 días
│   ├── logo-ph-3d.webp / *-sm.webp
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
│   │   ├── LogoReveal.astro         # Intro de la home — corte seco: hilo, el logo se abre desde la rendija y corta al neón. CSS, sin GSAP
│   │   ├── layout/
│   │   │   ├── BaseLayout.astro     # Layout raíz: meta, fuentes, global CSS
│   │   │   ├── Header.astro         # Casi invisible, scroll-hide, desplegable de idioma, menú móvil de palabras gigantes
│   │   │   └── Footer.astro         # Créditos finales: el lema que se asienta con el scroll y columnas suizas
│   │   ├── sections/
│   │   │   ├── HeroSection.astro        # Vídeo del neón (encendido + bucle) y la secuencia del lema, en una escena fijada
│   │   │   ├── HomePlayersSection.astro    # «El roster.» que viaja; corta al hero
│   │   │   ├── HomeServicesSection.astro   # Lectura cinética + índice tipográfico (acordeón)
│   │   │   ├── HomeAboutSection.astro      # Declaración que se enciende, 7 y 360° con enfoque
│   │   │   ├── HomeContactSection.astro    # «Hablemos.» con la foto dentro: la cámara entra por el punto
│   │   │   ├── AboutSection.astro          # Cabecera, Filosofía en cartones fijados, equipo en créditos, presencia
│   │   │   ├── ServicesSection.astro       # Índice de áreas, banda que viaja, 5 pilares como escenas
│   │   │   └── TalentsSection.astro        # Buscador en una línea de escritura y grid suizo 2/3/5 con persianas
│   │   └── ui/
│   │       ├── Button.astro             # Sin uso (anterior a «Títulos»)
│   │       ├── FooterSocialIcon.astro
│   │       ├── LanguageSwitcher.astro   # VACÍO, sin uso: el selector de idioma vive en Header.astro
│   │       ├── SceneLabel.astro         # Rótulo de escena: «02 · Talentos» arriba a la izquierda, con su hilo al borde
│   │       ├── SectionHeader.astro      # Sin uso (anterior a «Títulos»)
│   │       └── TitleLink.astro          # Enlace tipográfico: «Talentos →», letras que suben y subrayado que se dibuja
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
│   │   ├── dropdown.ts              # SIN USO: nadie lo importa
│   │   ├── ph-accordion.ts          # El índice tipográfico de las áreas (botón + panel), sin animar el alto
│   │   ├── ph-ambient.ts            # Fondo vivo de Talentos, Servicios y Sobre nosotros: la «proyección» (WebGL2 en directo)
│   │   ├── ph-motion.ts             # Núcleo de «Títulos» sin GSAP: entrar en pantalla, cartón entre páginas, letras
│   │   └── ph-text-animations.ts   # Infraestructura GSAP (refresh, scroll al navegar) y el vocabulario de «Títulos»
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
│   └── build-hero-neon.mjs          # Lo graba fotograma a fotograma y lo codifica (npm run assets:hero)
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

Vive en `Header.astro`. **En escritorio es un desplegable**: el botón muestra el
código del idioma actual («ES», con su hilo debajo) y abre los tres, como una lista
de títulos con el actual en oro. Sin banderas desde el 2026-10-03 (variante
«Títulos»). Es un botón que despliega
enlaces (patrón *disclosure*), no un `role="menu"`. El estado lo lleva
`aria-expanded` y el CSS abre el panel a partir de él; la animación va en CSS para
no cargar GSAP en las páginas legales por la cabecera. **En el menú móvil van los
tres en una línea pequeña al pie del menú**, sin desplegable dentro.

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

### El lema: una escena fijada

Desde el 2026-10-03 (variante «Títulos», `DECISIONS.md`) el vídeo es el fondo de
la **secuencia del lema**: «Now.» arriba a la izquierda, «Next.» a la derecha y
«Forever Football.» en oro abajo (en el móvil, en dos líneas), a escala de
pantalla. Las palabras suben de su línea base justo después del corte de la
intro (`introRemaining()` en `HeroSection.astro`). La escena va fijada con
`position: sticky` en una pista de 2,5 pantallas: al bajar, «Now.» sale por la
izquierda, «Next.» por la derecha, «Forever Football.» crece, el neón se oscurece
y se acerca, y la escena de Talentos sube por encima con un borde duro (el corte).
Todo ligado al scroll (ScrollTrigger en modo scrub).

**El alto de la pista depende de `html.ph-anim`**, no del JS: así se decide antes
del primer pintado y la restauración del scroll al volver atrás cae en su sitio.
Sin movimiento, el hero mide una pantalla y nada se fija. El lema arranca oculto
con una red de seguridad en CSS: a 1,6 s se ve pase lo que pase.

### Logo Reveal

`LogoReveal.astro` tapa la home con un overlay negro al llegar. **La animación es
CSS puro, sin JavaScript**: arranca con el primer pintado y termina sola aunque el
JS no llegue nunca. Dura 1,24 s.

Desde el 2026-10-03 es **un corte seco de cine**: negro, un hilo dorado se dibuja
en el centro y el logo se abre desde esa rendija (`clip-path`), se sostiene y a
1,2 s el overlay desaparece de golpe sobre el neón, **en el mismo sitio y con el
mismo tamaño** que el rótulo del vídeo: un corte a juego. Dos detalles:

- **El ancho sale del encuadre del render** (`scale` en `scripts/hero-neon/neon.html`, con la cámara en la pose de arranque del encendido, distancia 1,22): `max(27,9vw, 49,6vh)` en apaisado y `max(57,4vw, 26,5vh)` por debajo de 9:10. Si cambia el encuadre del render, cambian estas cifras.
- **La animación de salida del overlay se sigue llamando `ph-intro-salir`**: el script del componente la busca por nombre para anotar que la intro ya se vio, y el del hero para saber cuándo corta.

Fue una island de React hasta el 2026-06-25 (`2b74656`), GSAP vanilla hasta el 2026-08-27 y una paleta de marcador del 2026-10-02 al 2026-10-03; ver `DECISIONS.md`.

**Tres cosas que parecen arbitrarias y no lo son.** Cambiar cualquiera vuelve a romper lo que arreglaron:

| Cómo está | Por qué |
|---|---|
| El overlay se monta desde `BaseLayout` (prop `intro`), **fuera de `<main>`** | `transition:name` en `<main>` crea un contexto de apilamiento, así que dentro el `z-index: 9999` no le ganaba al header y hacía falta un parche para ocultarlo. Fuera, el z-index manda solo |
| Su CSS va **en línea en el `<head>`**, no en el `<style>` del componente | Desde el componente viaja en el bundle común: medido, no se aplicaba hasta los 838 ms y el overlay se pintaba antes como un div suelto, sin tapar nada |
| Los estilos **nunca** en el atributo `style` del elemento | Una declaración inline gana a cualquier regla de hoja: la que oculta el overlay en visita repetida no se aplicaría, y la home se quedaría en negro |

**Cuándo sale**: la primera vez, y no vuelve hasta pasadas **18 h** (marca con `Date.now()` en `localStorage`, decidida por un script inline del `<head>` antes del primer pintado). El clic en el logo del header la fuerza siempre. Con `prefers-reduced-motion`, nunca.

---

## Sistema de animaciones (Motion)

**Variante B «Títulos»** (2026-10-03, propuesta en `feat/variante-b-titulos`; el
porqué y lo descartado en `DECISIONS.md`): la web es la secuencia de títulos de
crédito de una película sobre PHSPORT. La tipografía es la imagen; cada bloque es
una escena con un enunciado dominante y las escenas se suceden por cortes. El
movimiento explica algo en cada sitio —en qué orden se lee, qué ha cambiado,
adónde se va— y no adorna.

| Pieza | Qué hace | Dónde |
|---|---|---|
| **Titular que sube** | Cada palabra (o letra) sube desde su línea base enmascarada, 600-800 ms, `ph-emph`, escalón de 40-60 ms. Solo en titulares de escena | `riseWords`, `riseLetters` (`ph-text-animations.ts`); máscaras `.ph-m` |
| **Lectura cinética** | Cada palabra de una frase pasa de 0,16 a 1 de opacidad según avanza el scroll: quien lee marca el ritmo | `kinetic`; elementos con `data-kinetic` |
| **Tipografía que viaja** | Una línea más ancha que la pantalla se desplaza en horizontal con el scroll para leerse entera, en un contenedor con `overflow-x: clip` | `travel` |
| **Lema que se asienta** | Las dos líneas del lema del pie entran desplazadas desde lados opuestos y quedan alineadas al llegar al final de la página, donde se leen enteras: su cuerpo es el que hace caber «Forever Football.» en el ancho. Sin GSAP, porque el pie está también en las legales | `Footer.astro` |
| **Corte** | La escena siguiente sube por encima de la fijada con un borde duro; su contenido va un poco por detrás del borde (se lee como una máscara) | `position: sticky` + scrub en el hero, Filosofía y los pilares |
| **Rendija** | Una imagen se abre desde una línea horizontal hasta llenar su rectángulo (`clip-path: inset()`), ligada al scroll | Pilares de Servicios; la intro |
| **Persiana** | Cada foto del grid se abre de abajo arriba al entrar en pantalla, con escalón por columna | `.tl-card__photo` (`TalentsSection.astro`) |
| **Enfoque** | Las cifras entran de desenfoque (10 px) y escala 1,15 a nítidas, 700 ms | `rackFocus` |
| **La cámara entra en la palabra** | «Hablemos.» con la foto dentro de las letras; al bajar, la capa se acerca al punto final hasta que la foto llena la pantalla | `HomeContactSection.astro` |
| **Cartón de título** | Al navegar, un cartón negro con el nombre de la página de destino sube y tapa (100 ms), el router espera a que tape, y sale por arriba sobre la página nueva (160 ms) | `.ph-stinger` en `BaseLayout`; `ph-motion.ts` |
| **Reflujo** | Al abrir o cerrar un panel, lo que tiene debajo se desliza a su sitio nuevo (FLIP) en vez de saltar | `reflow`; `ph-accordion.ts`. En Talentos, GSAP Flip al buscar |
| **Interfaz** | Al señalar un enlace, sus letras suben 2 px en cascada de 10 ms y el subrayado se dibuja (120-200 ms) | `.ph-tlink`, `.nav-link`; `setLetters` |

**Curvas y tiempos.** Las mismas en CSS (`--ph-ease-*`, `--ph-dur-*` en
global.css) y en GSAP (`EASE`, `DUR` en `ph-text-animations.ts`, con CustomEase):
`ph-out` (0.16, 1, 0.3, 1), `ph-emph` (0.05, 0.7, 0.1, 1), `ph-std` (0.2, 0, 0, 1)
y `ph-in` (0.3, 0, 0.8, 0.15) para salir. Microinteracción 100-150 ms; cambio de
estado 150-300; panel o página 300-350 (400 de techo); momentos de autor 500-800.
Lo ligado al scroll avanza al ritmo del dedo y no cuenta como espera, pero nunca
bloquea el scroll ni cambia su velocidad. Lo que se va, más rápido que lo que
llega. **Sin rebotes.**

**Escenas fijadas.** Se fijan con `position: sticky` dentro de una pista más alta
que la pantalla, y GSAP solo mueve lo de dentro según el avance (ScrollTrigger con
`scrub`), **no con el `pin` de GSAP**: sin contenedor añadido que cambie el alto
de la página al refrescar o al navegar, y sin JS la escena se ve igual. El alto
de cada pista depende de `html.ph-anim`, que se decide antes del primer pintado
(ver «Reglas que sostienen todo»). Recorridos: hero 1,5 pantallas, contacto 1,6,
cada cartón de Filosofía 1,4.

**Reparto entre módulos.**
- `src/scripts/ph-motion.ts`, el **núcleo sin GSAP**: el observador de «entra en
  pantalla» (`data-inview` → `is-inview`), el cartón entre páginas y `setLetters`.
  Lo cargan la cabecera y el pie, así que está en todas las páginas, incluidas las
  legales, que no cargan GSAP.
- `src/scripts/ph-text-animations.ts`, la **infraestructura GSAP** (refresh
  coalescido de ScrollTrigger, el scroll al navegar, `data-reveal`, refresh cuando
  cambia el alto de la página) más el vocabulario: `riseWords`, `riseLetters`,
  `fadeUp`, `kinetic`, `travel`, `rackFocus`, `reflow` y `mountSection`.
- `src/scripts/ph-accordion.ts`, el índice tipográfico (portada y Servicios).
- Las escenas propias (el lema del hero, «Hablemos.», Filosofía, los pilares)
  viven en el `<script>` de su sección.

**Cómo se anima un bloque nuevo.** Rótulo con `SceneLabel.astro` y enlace con
`TitleLink.astro` (los dos se animan solos al entrar en pantalla). Titular con
`data-reveal` si está en la primera pantalla y, en el `<script>` de la sección,
`riseWords(titular)`; una frase para leer con `data-kinetic` y `kinetic(el)`;
textos con `fadeUp`. Al final, `mountSection(sección)`.

**El cartón entre páginas.** `.ph-stinger` tiene su propio nombre de View
Transition y va por encima de la página y del menú móvil, por debajo de la
cabecera (que persiste y desliza su hilo mientras tanto). En
`astro:before-preparation` se le pone el nombre de la página de destino (el mapa
ruta → etiqueta lo pinta BaseLayout en `data-titles`: las etiquetas del menú y,
para los legales, las del pie) y **se envuelve el `loader` del evento** para que
la navegación espere a que el cartón tape. En `astro:before-swap` el cartón de la
página nueva arranca tapando y con `is-out` (sale por arriba). Como el cartón tapa
el cambio, `page-main` no se funde: la foto vieja se oculta y la nueva aparece tal
cual. Con movimiento reducido no hay cartón y la página hace un fundido corto.

**Reglas que sostienen todo:**
- **El estado de reposo es el visible.** Lo que espera a entrar en pantalla solo se
  esconde con `html.ph-anim` (hay JS y no hay movimiento reducido).
- **Red de seguridad en CSS**: si el núcleo de movimiento no llega a correr
  (`html.ph-motion` no aparece), a los 2,5 s se ve todo y las líneas que viajan
  vuelven a caber enteras. `data-reveal` se destapa a los 2,5 s pase lo que pase.
- **Los altos que cambian el layout dependen de `html.ph-anim`, nunca del JS**
  (pistas de las escenas fijadas, el tamaño de las líneas que viajan): si
  dependieran del JS, la página cambiaría de alto después de que el router
  restaure el scroll al volver atrás. Aun así, en WebKit los CSS de componente
  llegan después de esa restauración: la posición buena se reafirma desde
  `history.state` (`docs/trampas-conocidas.md`, «El scroll suave se apaga…»).
- **`prefers-reduced-motion`**: nada se fija ni se desplaza; las escenas se
  componen en su estado final (el lema entero, «Hablemos.» quieto con la foto en
  un rectángulo debajo, los cartones de Filosofía apilados) y las frases
  cinéticas, enteras. Se mantienen los cambios de color que confirman un gesto.
- **Solo `transform`, `opacity`, `clip-path` y `filter` acotado** en lo que se
  mueve. Nada anima `height`: los acordeones abren con FLIP.
- **Nada se mueve solo más de 5 s**: el hilo de «Scroll» se dibuja y lo recorre una
  luz dos veces; el resto va ligado al scroll o a un gesto. Excepciones ya
  anotadas en `hallazgos-abiertos.md`: el bucle del vídeo y el grano del fondo.

**Regla**: GSAP en componentes `.astro` va siempre en un `<script>` que importa de `ph-text-animations.ts` (o de `gsap` con los plugins registrados ahí). No importar GSAP directamente en el markup de un `.astro`.

### Cabecera de sección y fondo vivo

Talentos, Servicios y Sobre nosotros abren igual: **rótulo de escena → titular
gigante → entradilla**, y el contenido de la página empieza ya en la primera
pantalla (en Talentos asoma la primera fila de fotos; en Servicios, el rótulo de
las áreas).

- **El rótulo de escena** (`SceneLabel.astro`, estilos `.ph-scene` en global.css)
  lleva el antetítulo del contenido («02 · Talentos»): el número en monoespaciada
  (es un índice), la etiqueta en Helvetica 13-14 px, siempre arriba a la
  izquierda de su escena, con un hilo corto que lo une al borde de la pantalla. Un
  dato opcional va a la derecha («05 disciplinas · 01 equipo»). **«02 · Talentos»
  se parte por « · »**: si un idioma cambiara ese separador, saldría entero como
  etiqueta.
- **Titular** en Söhne 700 a escala de pantalla, con el tamaño de cada escena
  (dimensionado por la palabra más larga del idioma más largo: «Rappresentare» a
  360 px). **Entradilla** en Helvetica 18-22 px, blanco al 90 % (`.ph-lead`).
  **Texto** en Helvetica 16-18 px al 82 % (`.ph-body`). **Datos** a 13-14 px.
- La cabecera empieza a `--ph-head-top` del borde superior (global.css).

El fondo es un `<canvas class="ph-ambient" data-ambient="proyeccion">` dentro de
`<div class="ph-page-bg">`, dibujado en directo por `src/scripts/ph-ambient.ts`
con un shader de WebGL2: **la proyección**, la pantalla de cine de un mundo de
títulos de crédito. Grano de película que cambia a 24 fotogramas por segundo y un
halo cálido, muy tenue, que respira detrás del titular y lo sigue al hacer scroll;
cuando el titular sale por arriba, el halo se queda en el borde, más tenue.

Cómo convive con la página, todo dentro del módulo:

- **Es el fondo de toda la página**: `.ph-page-bg` va fijo a la pantalla
  (`position: fixed`, `z-index: -1` dentro de `<main>`) y el contenido pasa por
  encima. Por eso las secciones `.tl`, `.sv` y `.ab` tienen el fondo
  transparente; lo que lleva fondo opaco (los cartones de Filosofía) tapa el grano.
- **Dibuja solo lo necesario**: el bucle mira cada fotograma de la pantalla, pero
  solo pinta cuando cambia el fotograma de cine (24 fps) o cuando la página se ha
  movido (para que el halo vaya pegado al titular). Con la pestaña oculta, nada.
- **`prefers-reduced-motion`**: un fotograma fijo, que se repinta al hacer scroll.
- **Se suma al fondo**: salida premultiplicada, así que no tapa nada.
- **ClientRouter**: al cambiar de página destruye los contextos de WebGL de la que
  se va (el navegador tiene un tope de contextos vivos).
- **Sin WebGL2**: el canvas queda transparente y se ve un halo de CSS
  (`.ph-ambient:not(.is-live)`).
- **Densidad**: resolución interna con tope de 1,5 px por px CSS.

Para tocar la escena: su shader está en el mismo archivo. Se ve en directo con
`npm run dev`.

**El logo de la cabecera cae en la misma vertical que los textos**: la cabecera
no tiene cápsula y su relleno lateral es el margen de sección.

**No hay islands de React en el proyecto** — cero archivos `.tsx`, y `@astrojs/react` no está en `astro.config.mjs`. La última (`LogoReveal`) se migró a vanilla el 2026-06-25. Si alguna vez hiciera falta una, sería una decisión nueva a registrar en `DECISIONS.md`, no la aplicación de un patrón existente.

---

## Reglas de performance (no negociables)

| Regla | Motivo |
|---|---|
| Todas las imágenes con `<Image>` de `astro:assets` | WebP automático + width/height → cero CLS. Excepciones: las fotos del grid de talentos van en `<picture>` AVIF 90 con WebP 85 de reserva (`DECISIONS.md`, 2026-10-01); las de los pilares y la del contacto, que viven en `public/`, en `<img>` con `width`/`height`, `srcset` (los pilares tienen variante `-sm`) y `loading="lazy"` |
| GSAP en `<script>` de `.astro`, nunca en una island | React fuera del bundle (~182 KB menos en la home) |
| Named imports: `import { X } from 'lib'` | Tree-shaking efectivo |
| Fuentes self-hosted desde `/public/fonts/` | Elimina round-trips externos |
| `font-display: swap` en `@font-face` | Sin FOIT |
| `<Image loading="eager" fetchpriority="high">` solo en primer fold | El resto: lazy |
| Vídeo del hero: `preload="none"` y `play()` a mano tras `load` | `preload="metadata"` **no basta**: con `autoplay`, Chrome se lo salta y descarga el vídeo igual. Medido en agosto: retrasaba el evento `load` 504 ms y el póster —que era el LCP real— medio segundo |
| El telón de intro, en CSS y nunca dependiendo del JS | Un overlay opaco que solo se quita por JavaScript deja la portada en negro si el JS falla |
| Lo que espera a entrar en pantalla, visible en reposo y con red de seguridad en CSS (2,5 s) | Si el JS de movimiento no llega, la página se tiene que ver entera igualmente (Motion, arriba) |
| Lo que se mueve: `transform`, `opacity`, `clip-path` y `filter` acotado; nunca `height`, `width`, `top` ni `left` | Los acordeones abren con FLIP (`reflow`); las escenas fijadas, con `position: sticky` y scrub |
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
| Gigante | Söhne (Klim) | 700 | Titulares de escena, cifras, el lema, el cartón entre páginas |
| Intermedio | Söhne (Klim) | 600 | Filas del índice, nombres, enlaces, el buscador |
| Texto e interfaz | Helvetica Neue | 400 | Entradillas, texto corrido, rótulos, datos |
| Índices | Monoespaciada del sistema | 400 | Solo índices pequeños (01-05, el equipo, códigos ISO) |

**Söhne**: fuente de pago — licencia en https://klim.co.nz/retail-fonts/sohne/
Archivos `.woff2` en `/public/fonts/sohne/`. Nombre de familia en código: `Sohne` (sin umlaut).
Son los de prueba de Klim y **no traen letras acentuadas**: á, ñ, è… salen en la
fuente de reserva (`docs/hallazgos-abiertos.md`).

### Escala tipográfica

Dos escalas y casi nada en medio (variante «Títulos», `DECISIONS.md` 2026-10-03).
Variables y clases en `global.css`:

| Papel | Clase / variable | Medida |
|---|---|---|
| Gigante | `.ph-giant` (cada escena pone su `font-size`) | Söhne 700, interlineado 0,86, interletraje `--ph-giant-track` (−0,045 em); a escala de pantalla, por la palabra más larga del idioma más largo |
| Intermedio | `.ph-mid`, `--ph-mid` | Söhne 600, 20-40 px |
| Entradilla | `.ph-lead`, `--ph-lead` | Helvetica 18-22 px, blanco al 90 % |
| Texto | `.ph-body`, `--ph-body` | Helvetica 16-18 px, blanco al 82 %, 62 caracteres como mucho |
| Rótulos y datos | `.ph-meta`, `.ph-scene`, `--ph-small` | Helvetica 13-14 px; nunca por debajo de 13 |
| Índices | `.ph-index` | Monoespaciada 13 px |

### Espaciado de secciones

```css
--ph-section-py: clamp(4rem, 8vw, 8rem);
--ph-section-px: clamp(1.5rem, 5vw, 6rem);
```

Usar siempre `.ph-section` o las variables CSS. No hardcodear valores de sección.

### Utilidades globales

| Clase | Descripción |
|---|---|
| `.ph-grid` | Retícula suiza: 4 columnas en el móvil, 12 desde 1024 px, con `--ph-gutter` |
| `.ph-giant`, `.ph-mid`, `.ph-lead`, `.ph-body`, `.ph-meta`, `.ph-index` | Las escalas (arriba) |
| `.ph-gold` | El acento de la escena: una palabra o una frase, en oro y sin cursiva |
| `.ph-scene` | Rótulo de escena (`SceneLabel.astro`) |
| `.ph-tlink` | Enlace tipográfico (`TitleLink.astro`) |
| `.ph-rule` | Hilo de 1 px que marca un borde de escena y se dibuja al entrar |
| `.ph-section` | Contenedor de sección con padding responsivo (los textos legales) |
| `.skip-link` | Enlace de accesibilidad "saltar al contenido" |
| `.ph-label`, `.ph-divider`, `.ph-accent`, `.ph-glass`, `.glass-card` | Anteriores; hoy sin uso en las páginas |

### Radios de borde

| Token CSS | Valor | Uso |
|---|---|---|
| `--ph-radius` | `0.375rem` (6px) | Botones, inputs, UI |
| `--ph-radius-card` | `0.5rem` (8px) | Cards y contenedores |

No superar `0.75rem`. La marca no es redondeada.

### Principios visuales

- **Clima**: túnel antes del partido. Energía contenida, no palco VIP.
- **Fondo**: siempre `ph-black`. Sin blancos de fondo.
- **Espaciado**: generoso. El negro es parte del diseño.
- **Mundo**: la secuencia de títulos de crédito de una película (Motion, arriba). La tipografía es la imagen; cada bloque, una escena con un enunciado dominante; las escenas se suceden por cortes.
- **Animaciones**: con propósito. El interfaz responde en 100-300 ms y los momentos de autor van de 500 a 800 ms; lo ligado al scroll, al ritmo del dedo. Sin rebotes.
- **Retícula**: suiza y visible por alineación (4/12 columnas); asimetría deliberada. Hilos de 1 px al 10 % de blanco marcan bordes de escena y líneas base.
- **Oro**: una palabra o frase por escena, la que ya marca el contenido; también estados activos y piezas pequeñas (el logo, un hilo). Nunca superficies grandes.
- **Etiquetas**: una sola escala, 13-14 px en letra normal; las mayúsculas, con poco interletraje. La monoespaciada, solo para índices pequeños.
- **Fotografía**: rectángulos duros, a sangre o de columna; se abren con máscara (rendija, persiana) o se ven a través de las letras (una sola vez, en Contacto). Ratio `3:4` para jugadores, sin recortar.

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

> Última revisión de esta sección: **2026-10-03** (componentes, en la rama `feat/variante-b-titulos`).
> Es la parte que antes se queda obsoleta. Si vas a decidir algo a partir de la
> tabla de pendientes, **verifícalo contra el código** — no la des por buena.

### Componentes

| Componente | Estado | Notas |
|---|---|---|
| `BaseLayout.astro` | ✅ Completo | SEO, hreflang, preload fuentes, ClientRouter. El cartón de título entre páginas con su mapa ruta → nombre (2026-10-03) |
| `Header.astro` | ✅ Completo | Casi invisible (sin cápsula), scroll-hide, letras que suben al señalar, hilo dorado bajo la página actual, desplegable de idioma tipográfico, menú móvil de palabras gigantes con el foco dentro (2026-10-03) |
| `Footer.astro` | ✅ Completo | Créditos finales: el lema entra desde los lados con el scroll y se asienta entero al final (sin GSAP), columnas suizas, el logo que se dibuja (2026-10-03) |
| `LogoReveal.astro` | ✅ Completo | Animación en CSS, sin JS. Una vez cada 18 h. Corte seco: hilo, rendija, corte a juego sobre el neón (2026-10-03) |
| `HeroSection.astro` | ✅ Completo | Vídeo del neón (encendido y bucle). Secuencia del lema en una escena fijada que se descompone al bajar (2026-10-03) |
| `HomePlayersSection.astro` | ✅ Completo | Corta al hero; «El roster.» más ancho que la pantalla viaja con el scroll. Sin fotos a propósito (commit `453e928`) |
| `HomeServicesSection.astro` | ✅ Completo | Titular en lectura cinética e índice tipográfico de áreas (botón + panel, `ph-accordion.ts`) con el Plan de Acción en columnas |
| `HomeAboutSection.astro` | ✅ Completo | Declaración en lectura cinética; 7 y 360° con enfoque, en composición asimétrica; valores en una línea |
| `HomeContactSection.astro` | ✅ Completo | «Hablemos.» con la foto dentro de las letras y la cámara entrando por el punto final; el correo sobre la foto (2026-10-03) |
| `AboutSection.astro` | ✅ Completo | Cabecera, Filosofía en tres cartones de título fijados, el equipo como créditos, Presencia con los países entrando desde su lado |
| `ServicesSection.astro` | ✅ Completo | Índice de áreas, banda que viaja, 5 pilares como escenas (imagen desde una rendija), manifiesto |
| `TalentsSection.astro` | ✅ Completo | Grid 3:4 no clicable en 2/3/5 columnas, siempre en el orden del archivo: sin filtro de rol ni orden (`DECISIONS.md`, 2026-10-04). Buscador en una línea de escritura, a la vista también en el móvil; persianas; foco de escena; la búsqueda recoloca con FLIP |
| `SceneLabel.astro`, `TitleLink.astro` | ✅ Completo | Piezas de «Títulos» (2026-10-03). Ver Motion y Sistema de diseño |
| `FooterSocialIcon.astro` | ✅ Completo | |
| `Button.astro`, `SectionHeader.astro`, `LanguageSwitcher.astro` | ⚠️ Sin uso | Anteriores; nadie los importa |

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
