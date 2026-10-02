# PHSPORT — Architecture Document

> Documento de referencia para el proyecto. Leer antes de cualquier tarea estructural.
> Última revisión: 2026-10-01
> Secciones: Stack · Estructura · i18n · Hero · Motion · Performance · SEO · Sistema de diseño · Tests · Estado del proyecto

---

## Stack

| Capa | Tecnología | Versión mínima |
|---|---|---|
| Framework | Astro (SSG) | 5.x |
| Estilos | Tailwind CSS | 4.x |
| Componentes y movimiento | Mochi (`mochi-ui`, etiqueta `v0.3.1`), dibujado en el servidor con `@astrojs/react`; la interacción en `src/scripts/ph-motion.ts`. Sin React ni GSAP en el navegador | 0.3.1 |
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
│   │   ├── LogoReveal.astro         # Intro de la home — animación en CSS, sin GSAP
│   │   ├── layout/
│   │   │   ├── BaseLayout.astro     # Layout raíz: meta, fuentes, global CSS
│   │   │   ├── Header.astro         # Flotante, scroll-hide, desplegable de idioma; logo en la vertical del texto
│   │   │   └── Footer.astro         # V3 editorial, social links
│   │   ├── sections/
│   │   │   ├── HeroSection.astro        # Vídeo del neón (encendido + bucle) y claim fijo
│   │   │   ├── HomePlayersSection.astro    # Titular, entradilla y botón a Talentos (sin jugadores)
│   │   │   ├── HomeServicesSection.astro   # Acordeón de áreas + Plan de acción en pestañas
│   │   │   ├── HomeAboutSection.astro      # Titular, texto y las cifras en una línea, sin contadores
│   │   │   ├── HomeContactSection.astro    # «Hablemos.», botón de email y copiar
│   │   │   ├── AboutSection.astro          # Filosofía, equipo y presencia — absorbe /equipo
│   │   │   ├── ServicesSection.astro       # Áreas en acordeón, cinco pilares y manifiesto
│   │   │   └── TalentsSection.astro        # Buscador, desplegables Ver/Orden y grid de tarjetas
│   │   └── ui/
│   │       ├── Button.astro
│   │       ├── FooterSocialIcon.astro
│   │       ├── LanguageSwitcher.astro   # VACÍO, sin uso: el selector de idioma vive en Header.astro
│   │       └── SectionHeader.astro
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
│   │   ├── servicesItems.ts         # Datos de los cinco pilares de servicios
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
│   │   ├── ph-ambient.ts            # Fondo animado: bombo de escenas en WebGL2, una al azar por página (no en las legales)
│   │   └── ph-motion.ts             # Interacción con el movimiento de Mochi: acordeón, pestañas, desplegable, etiquetas, copiar
│   │
│   └── styles/
│       ├── global.css               # Reset + variables CSS + font-face + cabecera de sección
│       ├── mochi-phsport.css        # Capa de marca sobre Mochi: paleta, Söhne, esquinas y sombras
│       ├── ph-ui.css                # Piezas compartidas con el lenguaje de Mochi (sus estilos)
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
- `data/entrenadores.json` — cuerpo técnico.

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

**Desde el 2026-10-01 las 51 tarjetas visibles llevan foto de la serie de estudio**
que prepara Mario: fondo oscuro con resplandor dorado suave, brazos cruzados y la
camiseta del club de la ficha. Los jugadores ocultos conservan su foto antigua; si
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
idioma actual (bandera y código) y abre los tres. Es un botón que despliega
enlaces (patrón *disclosure*), no un `role="menu"`. El estado lo lleva
`aria-expanded` y el CSS abre el panel a partir de él: el botón crece hasta ser
el panel (recorte animado desde su ancho, `--bw`) y las opciones entran después,
con las curvas de Mochi. **En el menú móvil van los tres en fila**, sin
desplegable dentro del menú.

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

### Logo Reveal

`LogoReveal.astro` tapa la home con un overlay negro mientras se dibuja el trazo del logo. **La animación es CSS puro, sin JavaScript**: arranca con el primer pintado y termina sola aunque el JS no llegue nunca. Duración 1,26 s.

Fue una island de React hasta el 2026-06-25 (`2b74656`), GSAP vanilla hasta el 2026-08-27; ver `DECISIONS.md`.

**Cuatro cosas que parecen arbitrarias y no lo son.** Cambiar cualquiera vuelve a romper lo que arreglaron:

| Cómo está | Por qué |
|---|---|
| El overlay se monta desde `BaseLayout` (prop `intro`), **fuera de `<main>`** | `<main>` era siempre un contexto de apilamiento por `transition:name` (desde el 2026-10-02, solo mientras se navega), así que dentro el `z-index: 9999` no le ganaba al header y hacía falta un parche para ocultarlo. Fuera, el z-index manda solo |
| Su CSS va **en línea en el `<head>`**, no en el `<style>` del componente | Desde el componente viaja en el bundle común: medido, no se aplicaba hasta los 838 ms y el overlay se pintaba antes como un div suelto, sin tapar nada |
| Los estilos **nunca** en el atributo `style` del elemento | Una declaración inline gana a cualquier regla de hoja: la que oculta el overlay en visita repetida no se aplicaría, y la home se quedaría en negro |
| `stroke-dasharray` escrito a mano (753 y 637) | Son los perímetros reales de los dos polígonos, y son constantes. Antes se medían en ejecución con `getTotalLength()`, con 32 reintentos y dos valores de reserva que estaban un 22 % pasados. `pathLength="1"` sería lo elegante, pero en WebKit/iOS no es de fiar |

**Cuándo sale**: la primera vez, y no vuelve hasta pasadas **18 h** (marca con `Date.now()` en `localStorage`, decidida por un script inline del `<head>` antes del primer pintado). El clic en el logo del header la fuerza siempre. Con `prefers-reduced-motion`, nunca.

El titular del hero se ve desde el primer pintado: ya no entra palabra a palabra ni depende de ningún script (2026-10-01).

---

## Sistema de diseño y movimiento (Mochi)

Desde el 2026-10-01 la web usa el lenguaje de **Mochi** (`mochi-ui`), el sistema
de diseño propio de Mario, con su movimiento de muelles de rebote mínimo. La forma
es de PHSPORT: rectángulos con una esquina sutil de 6 px, sin filo y con sombra
(2026-10-02). La marca
no cambia: negro y oro, Söhne, logos y textos. El porqué y lo descartado, en
`DECISIONS.md` («Rediseño con el lenguaje de Mochi»).

**Tres capas:**

| Capa | Archivo | Qué pone |
|---|---|---|
| Mochi | `mochi-ui/styles.css` (importado en `BaseLayout`) | Tokens `--mochi-*`, curvas `--mochi-ease-*`, tiempos `--mochi-duration-*` y los botones (`LinkButton`, `Button`) |
| Marca | `src/styles/mochi-phsport.css` | Los tokens de Mochi con la paleta PHSPORT (tema oscuro: `data-theme="dark"` en `<html>`; el oro hace de acento), Söhne, esquinas `--ph-r-*` y sombras en dos capas (`--mochi-shadow-*`, `--ph-sh-*`). Al final, un bloque **provisional** que corrige lo que Mochi aún no permite (`docs/hallazgos-abiertos.md`) |
| Piezas | `src/styles/ph-ui.css` + `src/scripts/ph-motion.ts` | Lo interactivo, hecho aquí porque Mochi lo resuelve con React en el navegador |

**React solo al construir.** Los componentes de Mochi son de React: Astro los
dibuja en el servidor (`@astrojs/react`) y el navegador recibe HTML y CSS.
**Ninguno lleva `client:`.** Añadir una directiva metería React en el navegador, y
eso es una decisión nueva que se registra en `DECISIONS.md`, no la aplicación de
un patrón. Uso:

```astro
import { LinkButton, ArrowRightIcon } from 'mochi-ui';
<LinkButton href={href} variant="surface">{texto}<ArrowRightIcon slot="icon" /></LinkButton>
```

`LinkButton` para ir a otra página o al correo; las acciones dentro de la página
son un `<button>` con las piezas de abajo. `variant="accent"` es el dorado: uno por
pantalla como mucho.

**Piezas compartidas.** Estilos en `ph-ui.css`; comportamiento en `ph-motion.ts`,
que arranca en cada `astro:page-load` y lo desmonta en `astro:before-swap`:

| Pieza | Marcado | Qué hace |
|---|---|---|
| Acordeón | `.ph-acc` + `data-ph-accordion` | Uno abierto a la vez. El hueco se abre con la curva `morph` y el texto entra 60 ms después con un desenfoque corto. Flechas del teclado entre cabeceras |
| Pestañas | `.ph-seg` + `data-ph-tabs`, paneles `data-ph-panel` | El indicador se desliza (un borde tira y el otro sigue) y el contenido llega desde el lado hacia el que vas |
| Desplegable | `.ph-select` + `data-ph-select` | El botón crece hasta ser la lista. Emite `ph:select` con `{ value, label }` |
| Etiqueta que viaja | `data-ph-tip-group` + `data-tip` | Una sola etiqueta que se desplaza de un icono a otro (pie de página) |
| Copiar | `data-ph-copy`, aviso en `data-ph-copy-live` | El icono se convierte en un check dibujado y vuelve |
| Tarjeta de jugador | `.ph-player` | Al pasar el ratón se eleva y la foto crece un poco |

**Reglas del movimiento** (las de Mochi):

- **Solo como respuesta** a pulsar, abrir, pasar el ratón o cambiar de pestaña.
  Nada se anima al cargar ni al hacer scroll: todo se ve desde el primer pintado.
- **Siempre las curvas y tiempos de Mochi** (`var(--mochi-ease-morph)`,
  `var(--mochi-duration-morph)`…).
- Pulsar: `scale(0.965)` con `press`; la vuelta, con `snappy`.
- `prefers-reduced-motion`: sin movimiento.
- **En los pseudos `::view-transition` la curva va escrita literal**, no con
  `var()` (`docs/trampas-conocidas.md`). Así viaja el indicador del menú entre
  páginas (`ph-nav-indicator`).

**Lo que se anima sin que nadie lo pida**, por decisión expresa: el vídeo del
hero, la intro del logo (`LogoReveal`), el fundido entre páginas y las luces de
fondo de Talentos, Servicios y Sobre nosotros.

**Sin JavaScript todo se lee**: `html:not(.ph-js)` deja abiertos acordeones y
paneles. La clase `ph-js` la pone el script inline del `<head>` en la primera
carga y, al navegar, `ph-motion.ts` la copia al documento entrante **antes** del
swap. Si se pone después, la página llega con los acordeones abiertos, se cierran
animándose y el scroll al pulsar atrás acaba decenas de píxeles desplazado.

**El scroll suave se apaga durante la navegación** (al final de `ph-motion.ts`).
Antes vivía en el módulo de GSAP; si se quita, al pulsar atrás la restauración
vuelve a animarse (`docs/trampas-conocidas.md`).

**La cabecera** (`Header.astro`) es una cápsula flotante que, al bajar, se
estrecha y se vuelve sólida. Lleva:

- Un indicador bajo el enlace activo: una cápsula que sigue al ratón y vuelve
  al activo. Sin subrayado dorado desde el 2026-10-02.
- El selector de idioma.
- Un botón dorado de contacto que lleva a `#contacto` de la portada.

En móvil, el menú crece desde la propia cápsula.

### Cabecera de sección y fondo animado

Talentos, Servicios y Sobre nosotros comparten la misma cabecera desde el
2026-10-01 (`DECISIONS.md`, «Cabecera de sección legible»). El objetivo es que el
contenido empiece ya en la primera pantalla y que todo se lea sin esfuerzo:

- **Titular → entradilla.** El titular grande y, justo debajo, la entradilla.
  Después, sin hueco de por medio, lo propio de cada página: los controles y las
  tarjetas en Talentos; «Áreas de gestión» en Servicios; la presentación en Sobre
  nosotros. **Sin rótulo encima** desde el 2026-10-02: la fila índice («02 ·
  Talentos») y las filas de datos en mayúsculas se quitaron por leerse como
  plantilla (`DECISIONS.md`).
- **Cinco papeles, un tamaño cada uno**, para que se distingan sin leerlos:
  - Titular: Söhne, 46–106 px.
  - Entradilla: Söhne, 18–22 px, blanco al 90 %.
  - Texto corrido: Helvetica, 16–18 px, blanco al 82 %, como mucho 62 caracteres por línea.
  - Etiquetas: letra normal, 13–15 px.
  - **Sin letra monoespaciada** en ninguna parte (2026-10-02): los números van en
    la letra del texto que acompañan.
- **Mismas cifras en las tres páginas**: alturas, separaciones y tamaños salen de
  `--ph-head-*` en `global.css`, y los tonos de texto de `--ph-ink-*`. Los estilos
  compartidos son `.ph-head-title` y `.ph-head-lead`. Cambiarlos ahí cambia las
  tres páginas a la vez.
- **Encabezados que no se ven:** donde la fila índice era el `h2` de una sección
  (Filosofía y Presencia en Sobre nosotros), el `h2` sigue en el HTML con
  `sr-only`, para que la jerarquía no salte de `h1` a `h3`.

**El fondo animado es un «bombo» de escenas** (desde el 2026-10-02; `DECISIONS.md`,
«Bombo de fondos»).

- **Dónde:** en todas las páginas salvo los textos legales, que van planos.
  `BaseLayout` monta un único `<canvas class="ph-ambient" data-ambient>` dentro
  de `<div class="ph-page-bg">`; una página lo apaga con `ambient={false}`.
- **Qué escena:** en cada carga de página, `src/scripts/ph-ambient.ts` elige una
  al azar del bombo (`POOL`), sin repetir la de la página anterior. La última se
  recuerda en memoria y en `sessionStorage`.
- **Para revisar una escena concreta,** `?fondo=<escena>` en la URL.

Cada escena es un shader de WebGL2 que se dibuja en directo:

| Escena | Qué se ve | Con el ratón (ordenador) |
|---|---|---|
| `velo` | La red de luz que deja un cristal al sol, a 45°, muy tenue y lenta | Apenas se concentra (10 % de fuerza) |
| `neon` | El contorno del logo en grande, con ecos paralelos; una luz recorre el tubo | Se encienden los trazos cercanos |
| `trayectorias` | Líneas finas a 45° por las que suben destellos dorados | Líneas y destellos se avivan |
| `estructura` | La retícula a 45° del logo con un barrido de luz que enciende sus cruces | Una linterna enciende la retícula |
| `calidez` (fuera del bombo desde el 2026-10-02; se ve con `?fondo=calidez`) | Un haz de luz cálida que se mece, con motas de polvo | El haz se inclina hacia el cursor |

Para quitar o añadir una escena del bombo, basta con la lista `POOL`. Se probaron y
descartaron otras diez; están en `DECISIONS.md`.

Cómo convive con la página, todo dentro del módulo:

- **Es el fondo de toda la página**: `.ph-page-bg` va fijo a la pantalla
  (`position: fixed`, `z-index: -1` dentro de `<main>`) y el contenido pasa por
  encima al hacer scroll. Las secciones tienen el fondo transparente; si una
  vuelve a llevar fondo opaco, tapa la luz.
- **Los paneles son translúcidos y esmerilados** (`--ph-panel*`, 60 %) para que la
  luz se vea pasar por detrás. Para que el esmerilado funcione, `<main>` no lleva
  nombre de View Transition en reposo: `page-main` se le pone solo mientras se
  navega. Y para que el fondo se vea, el negro de la página lo pone `<html>` (el
  `body` es transparente) y `<main>` no lleva `isolation`
  (`docs/trampas-conocidas.md`, «View Transitions»). Los desplegables y el menú móvil van al 90 %, y los
  botones, opacos. Con `prefers-reduced-transparency` los paneles son opacos.
- **La luz es la misma en toda la pantalla**, con las intensidades del prototipo
  que aprobó Mario. Bajo el menú se apaga siempre (`stageMask`). Hasta el
  2026-10-02 bajaba al 32 % fuera del titular; se quitó porque lo aprobado se vio
  sin esa regla.
- **El ratón** solo cuenta con puntero fino (`(hover: hover) and (pointer:
  fine)`). Llega amortiguado por un muelle crítico, sin saltos, y su presencia
  sube y baja suave al entrar y salir de la ventana. En táctil no hay reacción.
- **Dibuja mientras la pestaña está visible**, a la frecuencia de la pantalla. El
  coste en un móvil real está sin medir (ver `docs/hallazgos-abiertos.md`).
- **`prefers-reduced-motion`**: un fotograma fijo, sin animación.
- **Se suma al fondo**: salida premultiplicada, así que no tapa nada.
- **ClientRouter**: al cambiar de página destruye el contexto de WebGL de la que se
  va (el navegador tiene un tope de contextos vivos) y la nueva elige escena.
- **Sin WebGL2**: el canvas queda transparente y se ve un halo dorado de CSS
  (`.ph-ambient:not(.is-live)`); con la animación en marcha lleva `is-live` y el
  halo desaparece.
- **Densidad**: resolución interna con tope de 1,5 px por px CSS, y menos en las
  escenas suaves (`scale` de cada una). Más no se nota en algo tan tenue y cuesta
  GPU.

Para tocar una escena: su shader está en el mismo archivo. Se ve en directo con
`npm run dev` y `?fondo=<escena>`.

**El logo del menú cae en la misma vertical que los textos.** La cápsula del
menú se aparta medio margen de sección del borde y deja medio margen de relleno
(`Header.astro`), así el logo queda a un margen completo, como los textos.

**No hay islands de React en el proyecto.** `@astrojs/react` está en `astro.config.mjs` solo para dibujar Mochi al construir (ver «Sistema de diseño y movimiento»); ningún componente lleva `client:`. La última island (`LogoReveal`) se migró a vanilla el 2026-06-25. Si alguna vez hiciera falta una, sería una decisión nueva a registrar en `DECISIONS.md`, no la aplicación de un patrón existente.

---

## Reglas de performance (no negociables)

| Regla | Motivo |
|---|---|
| Todas las imágenes con `<Image>` de `astro:assets` | WebP automático + width/height → cero CLS. Excepción: las fotos del grid de talentos van en `<picture>` AVIF 90 con WebP 85 de reserva (`DECISIONS.md`, 2026-10-01) |
| Ningún componente con `client:`: React solo al construir | React fuera del bundle del navegador (~182 KB en la home cuando había una island) |
| Named imports: `import { X } from 'lib'` | Tree-shaking efectivo |
| Fuentes self-hosted desde `/public/fonts/` | Elimina round-trips externos |
| `font-display: swap` en `@font-face` | Sin FOIT |
| `<Image loading="eager" fetchpriority="high">` solo en primer fold | El resto: lazy |
| Vídeo del hero: `preload="none"` y `play()` a mano tras `load` | `preload="metadata"` **no basta**: con `autoplay`, Chrome se lo salta y descarga el vídeo igual. Medido en agosto: retrasaba el evento `load` 504 ms y el póster —que era el LCP real— medio segundo |
| El telón de intro, en CSS y nunca dependiendo del JS | Un overlay opaco que solo se quita por JavaScript deja la portada en negro si el JS falla |
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
| Display | Söhne (Klim) | 700, 900 | Títulos, claims, taglines |
| Display medium | Söhne (Klim) | 400, 600 | Subtítulos, labels destacados |
| Body | Helvetica Neue | 400, 500 | Cuerpo, navegación, UI |

**Söhne**: fuente de pago — licencia en https://klim.co.nz/retail-fonts/sohne/
Archivos `.woff2` en `/public/fonts/sohne/`. Nombre de familia en código: `Sohne` (sin umlaut).
Son los de prueba de Klim y **no traen letras acentuadas**: á, ñ, è… salen en la
fuente de reserva (`docs/hallazgos-abiertos.md`).

### Escala tipográfica

| Elemento | Font |
|---|---|
| Hero claim principal | display, `font-black tracking-tightest` |
| Título de sección | display, `font-bold tracking-tighter` |
| Body | body |
| Label en mayúsculas | clase `.ph-label` |

### Espaciado de secciones

```css
--ph-section-py: clamp(4rem, 8vw, 8rem);
--ph-section-px: clamp(1.5rem, 5vw, 6rem);
```

Usar siempre `.ph-section` o las variables CSS. No hardcodear valores de sección.

### Utilidades globales

| Clase | Descripción |
|---|---|
| `.ph-label` | Label en mayúsculas con tracking ancho, color dorado |
| `.ph-divider` | Línea decorativa dorada de 2.5rem × 2px |
| `.ph-accent` | Texto en color dorado |
| `.ph-section` | Contenedor de sección con padding responsivo y max-width |
| `.skip-link` | Enlace de accesibilidad "saltar al contenido" |

### Radios de borde

Desde el 2026-10-02, **rectángulo con una esquina sutil: 6 px en todo**
(decisión de Mario; del 2026-10-01 al 02 fueron de 8 a 28 px, y antes de Mochi
6–8 px). Tokens en `src/styles/mochi-phsport.css`, todos a 6 px. Se mantienen
los nombres por tamaño por si vuelven a separarse:

| Token CSS | Uso |
|---|---|
| `--ph-r-xs` / `--ph-r-sm` | Piezas pequeñas: opciones de lista, etiquetas |
| `--ph-r-btn-sm` / `--ph-r-btn` / `--ph-r-btn-lg` | Botones por tamaño, campos de búsqueda |
| `--ph-r-md` | Paneles, desplegables, la cápsula de la cabecera y el menú móvil |
| `--ph-r-lg` / `--ph-r-xl` | Tarjetas, huecos de foto |

Los recortes animados (`clip-path: … round`) de los desplegables y del menú
móvil usan las mismas variables; el de `.ph-select` lee el radio del propio
botón.

### Principios visuales

- **Clima**: túnel antes del partido. Energía contenida, no palco VIP.
- **Fondo**: siempre `ph-black`. Sin blancos de fondo.
- **Espaciado**: generoso. El negro es parte del diseño.
- **Movimiento**: solo como respuesta a lo que hace la persona, con muelles de
  rebote mínimo y las curvas de Mochi. Nada entra al cargar ni al hacer scroll
  («Sistema de diseño y movimiento»).
- **Tarjetas solo en lo que se toca** (2026-10-02): acordeones, pestañas,
  desplegables y tarjetas de jugador. Lo que solo se lee (Filosofía, Presencia,
  pilares, cifras, manifiesto, datos legales) va sobre el fondo, con líneas finas.
  Una caja en todo se lee como plantilla.
- **Oro**: el logo, la palabra destacada del titular, un solo botón por pantalla,
  el club de cada tarjeta de jugador, las rayas de las viñetas y los separadores
  de las listas (2026-10-02). Números y códigos de país, en blanco tenue.
- **Sin rótulos encima de los titulares ni letra monoespaciada** (2026-10-02): el
  titular se sostiene solo.
- **Sin filo, con sombra** (2026-10-02): lo que flota es un recuadro de color,
  «como la ventanilla de una puerta sin marco» (Mario), con profundidad.
  - Tarjetas, paneles, desplegables, botones y la cápsula del menú llevan un tono
    un punto más claro que el fondo (`--mochi-surface` `#1a1d22`, `--mochi-solid`
    `#21252b`) y una sombra en dos capas: una corta y densa y otra larga y difusa.
    Sobre un fondo casi negro una sombra suave sola no se ve: es el tono del
    recuadro el que lo despega.
  - Al pasar el ratón, la sombra crece (`--ph-sh-raise`) y el relleno se aclara.
  - Sin sombra: los huecos de foto (son huecos, no piezas) y el buscador (un
    campo va hundido).
  - Se quedan las líneas finas que separan filas por dentro (acordeón, equipo,
    pilares) y el anillo dorado del foco del teclado.
- **Paneles translúcidos y esmerilados** (2026-10-02): tarjetas, acordeones, el
  Plan de acción, la cápsula del menú y el estado vacío de Talentos van al 60 %
  con desenfoque de lo de detrás (`--ph-panel`, `--ph-panel-solid`,
  `--ph-panel-blur`), para que el fondo animado se vea pasar. Los desplegables y
  el menú móvil, al 90 % (`--ph-panel-strong`). Los botones, las tarjetas de
  jugador y los huecos de foto siguen opacos. También en móvil, por decisión de
  Mario.
- **Fotografía**: high-contrast sobre fondo oscuro. Ratio portrait `3:4` para jugadores.

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

- **Nada visual.** Sin capturas de referencia: con vídeo, luces de fondo en
  directo y View Transitions serían falsos positivos constantes.
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

| Componente | Estado | Notas |
|---|---|---|
| `BaseLayout.astro` | ✅ Completo | SEO, hreflang, preload fuentes, ClientRouter |
| `Header.astro` | ✅ Completo | Cápsula flotante que se estrecha al bajar, indicador que sigue al ratón, desplegable de idioma que crece desde el botón, botón de contacto, menú móvil que crece desde la cápsula |
| `Footer.astro` | ✅ Completo | Sello en grande, columnas legibles, redes como iconos con etiqueta que viaja |
| `LogoReveal.astro` | ✅ Completo | Animación en CSS, sin JS. Una vez cada 18 h |
| `HeroSection.astro` | ✅ Completo | Vídeo del neón (encendido y bucle) con encuadre apaisado y vertical; claim fijo, sin entrada animada ni botón «Scroll» (2026-10-02) |
| `HomePlayersSection.astro` | ✅ Completo | Titular, entradilla y botón a Talentos. Sin jugadores (2026-10-02) |
| `HomeServicesSection.astro` | ✅ Completo | Acordeón de las cinco áreas + Plan de acción en pestañas |
| `HomeAboutSection.astro` | ✅ Completo | Titular, texto y las cifras en una sola línea (sin cajas ni contadores) |
| `HomeContactSection.astro` | ✅ Completo | «Hablemos.», botón de email y botón de copiar. A la derecha, el hueco de la foto (`contactImage`), hoy vacío a la vista |
| `AboutSection.astro` | ✅ Completo | Cabecera, Filosofía en filas (Now. Next. Forever Football.), equipo en tabla sin numerar (21 integrantes) y Presencia como lista con Madrid de encabezado |
| `ServicesSection.astro` | ✅ Completo | Cabecera, áreas de gestión en acordeón, modelo operativo con cinco pilares (texto y hueco de foto, alternando lados) y manifiesto. Los huecos (`pillarArt`) se ven vacíos hasta que lleguen las fotos |
| `TalentsSection.astro` | ✅ Completo | Buscador (en móvil, icono que se despliega), desplegables Ver y Orden (`.ph-select`) y grid 3:4 no clicable con escudos de selección siempre visibles |
| `Button.astro` | ⚠️ Sin uso | Nadie lo importa. Los botones son `LinkButton` de Mochi (2026-10-01) |
| `SectionHeader.astro` | ✅ Completo | |
| `LanguageSwitcher.astro` | ✅ Completo | Integrado en Header |
| `FooterSocialIcon.astro` | ✅ Completo | |

### Páginas

| Página | Estado | Notas |
|---|---|---|
| `/` | ✅ Funcional | V3: Hero → Talentos → Servicios → About → Contact |
| `/sobre-nosotros` | ✅ Funcional | V3 — absorbe /equipo (sección #equipo) |
| `/talentos/` | ✅ Funcional | Grid 3:4 no clicable, búsqueda + filtro rol + orden |
| `/servicios` | ✅ Funcional | Áreas de gestión, cinco pilares y manifiesto |
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
| Fotos jugadores | ✅ 51 de los 51 visibles | Serie de estudio de Mario, todas con la camiseta del club de la ficha (2026-10-01). Ver «Fotos de jugadores» arriba |
| Escudos de selección | ✅ 9 WebP en `/public/national-team-badges/` | ES, PE, HR, MK, MA, BO, RO, PA, BR. Master PNG en `/assets/source-media/badges/` |
| Fuente Söhne | ✅ Integrada | Archivos test de Klim — pendiente licencia. Sin letras acentuadas: se pintan con la fuente de reserva |
| OG image (1200×630px) | ❌ Pendiente | |
| Fotos de Servicios y Contacto | ❌ Pendientes | Las ilustraciones generadas por IA se quitaron el 2026-10-02. Sus huecos se ven vacíos; cómo poner una foto, en el comentario de `pillarArt` y `contactImage` |

### Pendientes

| Pendiente | Bloqueado por |
|---|---|
| Revisión nativa de los textos en italiano (2026-10-01) | Alguien que hable italiano |
| OG image 1200×630px | Diseño |
| Fotos reales de la agencia para los cinco pilares de Servicios y para Contacto (2026-10-02) | Cliente (Mario) |
| GA4 — Measurement ID | Decisión de si se integra |
| ⚠️ Söhne `.woff2` con licencia de producción — **sigue sin comprar a 2026-08-11**, y la web está publicada desde abril con los archivos de prueba | Compra de licencia (Mario) |

---

## Convenciones clave

- **Slug del jugador**: se deriva del nombre con `slugify(name)`. Este mismo slug nombra la foto en `src/assets/images/players/{slug}.{jpg,jpeg,png,webp}`.
- **Foto por jugador**: cualquier jugador sin foto coincidente recibe el placeholder SVG automáticamente.
- **Ocultar un talento**: `"hidden": true` en `jugadores.json`. `getAllRosterEntries()` lo filtra en build.
- **Movimiento**: con las curvas y tiempos de Mochi, solo como respuesta a lo que hace la persona. Lo interactivo compartido va en `src/scripts/ph-motion.ts` («Sistema de diseño y movimiento»). No hay GSAP desde el 2026-10-01.
- **Sin islands de React**: Mochi se dibuja en el servidor, sin `client:`. El JS de cliente va en `<script>` de componentes `.astro` o en `src/scripts/`.
- **Datos de dominio en `lib/`**: `playerDetail`, `teamMembers`, `servicesItems`, etc. son la fuente de verdad. Las páginas y secciones los consumen.

Ver `DECISIONS.md` para el histórico completo de decisiones no obvias.
