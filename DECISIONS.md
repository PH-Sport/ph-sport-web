# PHSPORT — Decision Log

Registro de decisiones de arquitectura no obvias.
Formato: fecha · decisión · alternativa considerada · motivo.
Orden: más reciente primero.

**Este documento es histórico y acumulativo: las entradas no se borran ni se
reescriben.** Cuando una decisión queda superada, se marca **in situ** con un
aviso al principio apuntando a la que la sustituye. Motivo: se llega aquí tanto
leyendo de arriba abajo como buscando un término suelto, y quien caiga en mitad
del documento tiene que saber si lo que está leyendo sigue vigente sin haber
leído el resto.

---

## 2026-10-05 · Velo, con el doble de luz

> **Estado: en la rama `feat/variante-a-retransmision`**, sin fusionar.

**Qué pidió Mario.** Al ver el bombo (entrada siguiente): de Velo le gustan el
movimiento y la reacción al ratón, pero «la neblina como tal apenas se nota».

**Qué cambia.** Toda la luz de Velo se multiplica por 2 (`GAIN` en su shader), por
igual, así que el movimiento y la reacción al ratón no cambian. En Mochi, Mario
la había pedido «aligerada» (2026-10-02); con la regla del tercio de las páginas
interiores y sin los paneles esmerilados de Mochi, se quedaba corta.

**Medido** con todo el contenido oculto, en una pantalla de 1440 × 900. Es el brillo
del 1 % de píxeles más vivos, con el negro de la página en 14,6:

| | Portada (luz entera) | Página interior (fuera del titular) |
|---|---|---|
| Antes | 23,9 | 18,9 |
| Ahora | 34,9 | 22,0 |
| Las otras escenas | 16,8–38,2 | 16,9–23,9 |

Queda a la par que las demás, sin pasar a Calidez, la más viva.

---

## 2026-10-05 · La A estrena el bombo de fondos: cinco escenas al azar en todas las páginas, con Neón y Velo

> **Estado: en la rama `feat/variante-a-retransmision`**, sin fusionar en `preview` ni
> en `main`.

**Qué pidió Mario.** Que Neón y Velo, dos fondos del rediseño «Mochi», pasen a la A.
Para decidir dónde se le ofrecieron dos formas, y eligió **«bombo en todas»**, como en
Mochi. La otra era «turnos en la portada»: las páginas interiores con su fondo fijo, y
Neón y Velo alternándose solo en la portada.

**Qué cambia.**

- **Cinco escenas**: Velo (una red de luz tenue, como la del agua al sol), Neón (el
  contorno del logo con ecos y una luz que recorre el tubo) y las tres que ya tenía la
  A: Trayectorias, Estructura y Calidez. Los shaders vienen de Mochi tal cual; las
  tres de siempre solo cambian en que reaccionan al ratón.
- **El bombo**: en cada carga de página sale una escena al azar, nunca la de la
  página anterior (memoria y `sessionStorage`). `?fondo=<escena>` fuerza una para
  revisarla.
- **Dónde**: lo monta `BaseLayout` en todas las páginas, también en la portada bajo
  el vídeo. Las legales van planas (`ambient={false}`), como pidió Mario en Mochi.
  Talentos, Servicios y Sobre nosotros dejan de montar su propio fondo, y los bloques
  de la portada pierden su negro opaco para que se vea.
- **Ratón**: en ordenador, la luz reacciona al cursor con un muelle, sin saltos.
  Velo, al 10 % de la fuerza de las demás (decisión de Mario en Mochi).
- **La luz**:
  - En las páginas interiores se queda como estaba aprobada en la A: entera
    detrás del titular y al 32 % en el resto.
  - En la portada va entera en toda la página, como en Mochi. Su titular es el lema
    del hero, que tapa el vídeo; con la regla del tercio, el fondo apenas se veía
    bajo el vídeo (comprobado con capturas).
- **Calidez está en el bombo** porque la opción que eligió Mario decía «uno de los
  cinco». En Mochi la había sacado el 2026-10-02. Quitarla es borrarla de `POOL`.

**De dónde viene.** Del rediseño «Mochi» (rama `feat/rediseno-mochi`, borrada el
2026-10-05; último commit `39bc41e`). Allí, el 2026-10-02, Mario decidió el bombo,
la reacción al ratón, Velo al 10 % y las legales planas. De Mochi no se traen sus
paneles esmerilados ni la luz entera en las páginas interiores.

**Alternativas descartadas.**

- *Turnos solo en la portada*: Mario eligió el bombo.
- *Luz entera también en las páginas interiores, como en Mochi*: se quedó la regla
  aprobada para la A. Cambiarlo es poner `OUTSIDE_TITLE` a 1.

**Consecuencias.**

- Hay movimiento continuo en todas las páginas salvo las legales
  (`docs/hallazgos-abiertos.md`, WCAG 2.2.2).
- La GPU trabaja también en la portada.
- `ph-ambient.ts` (5,6 KB con gzip) se carga en todas las páginas, también en las
  legales, donde no hace nada.
- Sin medir en un móvil real.

---

## 2026-10-05 · El equipo se queda con la variante A

> **Estado: decidido.** La A sigue en su rama (`feat/variante-a-retransmision`), sin
> fusionar en `preview` ni en `main`.

**Qué se decidió.** Mario, el 2026-10-05: el equipo se queda con la **variante A
«Retransmisión»**.

- Se conservan, sin borrar: las variantes B («Títulos») y C («Análisis»), el
  «Marcador» (`feat/rediseno-motion`) y `preview`.
- Se borra el rediseño «Mochi» (`feat/rediseno-mochi`, último commit `39bc41e`),
  después de traer a la A sus dos fondos que se quedan (entrada de arriba).

---

## 2026-10-05 · Contacto sin la imagen del sobre dorado: el hueco espera la nueva

> **Estado: en las tres variantes** (`feat/variante-a-retransmision`,
> `feat/variante-b-titulos` y `feat/variante-c-analisis`), sin fusionar. `preview` y
> `main` siguen mostrándola en phsport.es.

**Qué se decidió.** Fuera de la sección de contacto de la portada la imagen del sobre
negro con filo y sello dorados (`public/contact-image.webp`), y fuera también el
archivo. Su sitio se queda: el marco, el tamaño y la animación siguen, con el tono
de espera de las fotos (`#15171b`) dentro, hasta que llegue la imagen nueva.

**Quién y por qué.** Mario, el 2026-10-05: le han ordenado retirar esa imagen en
concreto y pondrá otra. El motivo de la orden no consta.

**Consecuencia.** No volver a usar esa imagen: sigue en el historial de git y en
`preview` y `main`. La nueva va como fondo de `.replay__img` en `HomeContactSection.astro` (la ventana de
repetición), encima del tono de espera. La anterior era decorativa (sin texto
alternativo); si la nueva aporta información, necesita su texto en los tres idiomas.

---

## 2026-10-04 · Talentos sin «Ver» ni «Orden»: el grid sale siempre en el orden del archivo

> **Estado: en las tres variantes** (`feat/variante-a-retransmision`,
> `feat/variante-b-titulos` y `feat/variante-c-analisis`), sin fusionar. `preview` y
> `main` siguen con los dos controles.

**Qué se decidió.** La página de Talentos pierde el filtro de rol («Ver»: Todos /
Jugadores / Entrenadores) y el orden («Orden»: Predeterminado / A-Z / Z-A). El grid
se ve siempre en el orden del archivo, que es el de la lista de Mario (entrada del
2026-09-25). Se queda el buscador por nombre, con su aviso de «sin resultados» y el
botón que lo vacía.

**Quién y por qué.** Mario, el 2026-10-04, por dirección del equipo: «El orden es el
que es, y se queda así». El orden del grid es editorial —quién sale antes lo decide
PH— y un A-Z lo deshacía con un clic. El filtro de rol se retira en la misma
decisión.

**Alternativa descartada.** Mantenerlos, como pedía el encargo común de las variantes
y como sigue teniéndolos la web publicada.

**Qué cambia.**
- Sin los dos controles y sin sus textos en los tres idiomas (`talents.role.*`,
  `talents.sort.*`).
- **El buscador ya no se pliega en el móvil.** Se plegaba en una lupa para compartir
  fila con el orden; sin esa fila se ve entero y ocupa el mismo alto. Con ello sobra
  el aspa que lo cerraba (`talents.search.close`).
- El botón del aviso de vacío sigue diciendo «Limpiar filtros» (los textos no se
  cambian) y ahora solo vacía la búsqueda.
- El grid sigue animando con FLIP los cambios de la búsqueda.

**Consecuencia.** No proponer volver a poner un orden o un filtro de rol sin hablarlo
con el equipo: es una decisión editorial, no un olvido.

---

## 2026-10-03 · Variante A «Retransmisión»: la web como la realización de un partido en televisión

> **Estado: propuesta en la rama `feat/variante-a-retransmision`, sin fusionar.** Sale
> de `feat/rediseno-motion` (commit `e0c6360`, el «Marcador») y es una de tres
> variantes completas que Mario pidió para elegir (las otras dos, en sus ramas). Si
> no se elige, esta entrada se queda en esta rama y no existe en `preview` ni en
> `main`.

**Qué pidió Mario.** El rediseño «Marcador» (entrada siguiente) solo cambió el
movimiento y dejó la maquetación casi igual. Mario lo aclaró el 2026-10-03:
«secciones» significaba no tocar las cuatro rutas (con sus idiomas), pero **sí** la
distribución del contenido dentro de ellas; los textos son los mismos y era en el
diseño donde pedía innovar. Pidió tres variantes completas, con todas las
secciones, funcionalidades y clics, en el lenguaje de los motion graphics, móvil
primero, con sus cuatro principios de Motion UI (propósito, curvas naturales,
100-350 ms, coreografía) y con las decisiones de diseño delegadas.

**La idea.** Cada bloque es un grafismo de retransmisión deportiva —placas,
rótulos inferiores, el marcador de la esquina, la tabla de estadísticas, la cinta
inferior— que entra barriendo en la diagonal de 45° del logo PH, con la precisión
de un paquete gráfico de Champions o Premier. Lo que se recuerda: «el marcador
arriba diciéndome dónde estaba, los rótulos entrando en diagonal y una cortinilla
dorada entre páginas». Cómo está hecho, en `ARCHITECTURE.md` («Sistema de
animaciones», «Cabecera de sección», «Hero»).

**El sistema** (global.css, «Retransmisión»; componentes en `src/components/ui/`):

- **Placa** (`Plate.astro`): negro casi opaco, filo blanco al 12 % y el borde
  derecho cortado a 45°; encima, la **pestaña dorada** que marca lo activo. Entra
  creciendo desde su borde izquierdo con el corte delante (320 ms) y su texto sube
  dentro (240 ms, +80 ms). Si un rótulo no cabe en una línea, **cada línea pasa a
  ser su placa** (`data-plate-lines`, partido en `ph-motion.ts`).
- **Rótulo inferior** (placas apiladas en escalera), **bug** (`Bug.astro`: celda
  con el número en monoespaciada y filo dorado + etiqueta en placa), **placa llave**
  (`KeyPlate.astro`: el botón, la única placa blanca, que barre en oro al
  señalarla), **cinta** (`Ticker.astro`: texto ligado al scroll), **tabla de
  estadísticas** (fila con barra segmentada), **revelado en diagonal** de fotos y
  vídeo desde la esquina de abajo a la izquierda (520 ms + escala 1,06 → 1).
- **Cortinilla** entre páginas: dos bandas a 45° (blanca fina y dorada) y una placa
  negra que tapa la pantalla en el centro del barrido, se para un instante y sale;
  380 ms, al revés al volver atrás. Reaprovecha `.ph-stinger` con su nombre de View
  Transition (no se toca `page-main`).
- **Cabecera = marcador de esquina** (logo + placa con el nombre de la página, que
  rueda al navegar), **barra de canales** en escritorio y **menú móvil** con una
  banda dorada que lo cruza. **Pie = tablero de cierre.** **Intro = cortinilla de
  canal**: el logo se dibuja en el sitio del neón y una banda dorada barre el negro
  y lo descubre (sigue siendo CSS en línea en el `<head>`, con las reglas de
  `docs/trampas-conocidas.md`; la salida se sigue llamando `ph-intro-salir`).

**Qué cambia en cada página** (mismas rutas, mismos textos, mismo orden de bloques):

- **Portada.** El lema como rótulo inferior sobre la señal del neón; al bajar, las
  placas salen hacia la izquierda y el bug «Scroll» llena su línea, todo ligado al
  scroll. Talentos: «El roster.» en placa de hasta 144 px y la placa llave.
  Servicios: «la alineación» —las cinco áreas como filas numeradas— y en
  escritorio, al lado del titular; el Plan de Acción va aparte, a todo lo ancho, con
  sus cinco sub-áreas en cinco columnas. Sobre: la frase en dos placas, la tabla de
  cifras (7 con siete segmentos, 360° con barra continua) y los valores en la cinta.
  Contacto (⚠️ *sin imagen desde el 2026-10-05: el hueco espera la nueva; entrada
  «Contacto sin la imagen del sobre dorado», arriba*): «Hablemos.», el correo como
  placa llave grande y la imagen en una ventana de repetición con marco de placa.
- **Talentos.** ⚠️ *Rol y orden se retiraron el 2026-10-04 y el buscador ya no se
  pliega en el móvil (entrada «Talentos sin «Ver» ni «Orden»», arriba).* Barra de
  filtros de realización: buscador en placa (plegable en el móvil) y rol y orden
  como **controles segmentados** (grupos de radios nativos; caben a 360 px en
  italiano). Ficha = rótulo inferior sobre la foto (nombre y club
  en placas, escudos en placas cuadradas). Filtrar y ordenar con FLIP; las que
  salen se apagan en 150 ms, las que entran se descubren en diagonal.
- **Servicios.** «Un equipo / fuera del campo.» en escalera; las áreas como
  alineación con panel de dos columnas (descripción y viñetas numeradas); la cinta;
  el modelo como **corte de segmento** (una banda cruza el bloque con el scroll); los
  pilares como segmentos (imagen a sangre que se descubre y empuja despacio, rótulo
  solapado que alterna de lado); el manifiesto en placas.
- **Sobre nosotros.** Hero en placas con los valores y el pie como dos bugs; los
  párrafos en paneles; Filosofía en tres **cartones de título**; el equipo como
  **hoja de alineación**; la presencia como **lista de señales** con el código ISO en
  su celda.

**Alternativas descartadas** (al construirlo):

- *Placas «inline» con `box-decoration-break: clone`* (cada línea de un texto
  partido, con su fondo): el corte a 45° habría que pintarlo con degradados (sin
  filo en la diagonal y dentado a 1×) y `transform` no se aplica a cajas en línea.
  Se parten las líneas con JS y, sin JS, se ve la placa de varias líneas.
- *Crecer la placa con `scaleX`*, como decía la dirección: deforma el corte y el
  texto. Se recorta con `clip-path` y el frente avanza con la misma diagonal.
- *Entradas con GSAP*: las legales no cargan GSAP y la red de seguridad sería
  doble. Las entradas son CSS (`is-inview` + retardos); GSAP queda para lo ligado al
  scroll, el FLIP y el acordeón.
- *Acordeones animando `height`* (el Marcador lo hacía): recalcula el layout en cada
  fotograma. El panel cambia de alto de una vez y lo de debajo se desliza con
  `transform`, midiendo qué se mueve (`ph-disclosure.ts`).
- *Desplegables (listbox) para rol y orden*: la dirección los dejaba como
  alternativa si los segmentos no cabían. Caben a 360 px en italiano.
- *Mantener las paletas del Marcador para las cifras*: dos mundos en una página.
  Las cifras van en celdas de bug o en monoespaciada, sin animarse por su cuenta.

**Qué deja obsoleto de la entrada «Marcador»** (que queda abajo como registro):
las paletas (`Flap`, `FlapText`), la fila índice (`Slate`, `.ph-rowline`), la tecla
(`Key`), las costuras (`.ph-seam`), el revelado por tonos (`.ph-develop`), el
destello (`glint`), las letras de tablero (`cycleText`), los titulares que ruedan
(`rollIn`, `riseIn`, `stage`, `wrapWords`) y la intro en paleta. Se borraron
también `clipPathReveal` y `magneticHover`, exportados sin uso, y el guardián
`data-reveal`. Se conservan `ph-ambient.ts`, `.ph-stinger`, la red de seguridad y la
infraestructura de scroll de `ph-text-animations.ts`.

**Preferencias anotadas de Mario (2026-10-01):**

- **Se mantienen**: el contenido empieza en la primera pantalla (en Talentos asoma
  la primera fila de fichas a 390×844 y a 1440×900); entradillas de 18-21 px casi
  blancas; nada por debajo de 13 px; el **fondo vivo** (el shader de
  `ph-ambient.ts` tal cual, que con las placas encima brilla alrededor de ellas); el
  grid de 2/3/5 columnas; titulares de cabecera de 106 px como máximo y rótulos de
  hasta 144 px.
- **Cambia**: los bugs y las etiquetas de placa van en **mayúsculas** a 13-14 px con
  0,05 em de espaciado (la dirección lo pide así; no son las mayúsculas diminutas de
  10-11 px y 0,25 em que Mario rechazó). El margen lateral baja a
  `clamp(16px, 5vw, 96px)` (antes 24 px de mínimo): sin eso, los rótulos en placa no
  caben en una línea a 360 px en italiano. Afecta también a las legales.
- **Movimiento reducido**: la dirección pedía que placas y fotos aparecieran con un
  fundido de 150 ms. Se dejan **en su sitio desde el principio, sin fundido**: un
  estado oculto a la espera de entrar en pantalla, también con movimiento reducido,
  arriesga contenido que no aparece. Los cambios de estado (menú, paneles, la placa
  llave) sí usan fundidos de 150 ms, y la cortinilla pasa a un fundido corto.

**Costes y riesgos** (medido en el build):

- JS comprimido: GSAP + infraestructura 49,2 KB (el Marcador, 49,8 KB), núcleo
  `ph-motion` 1,7 KB (2,0 KB), `ph-disclosure` 1,0 KB (nuevo), Flip en `/talentos`
  11,0 KB (9,7 KB). Por página: portada 71,9 KB, `/talentos` 83,3 KB, `/servicios`
  74,6 KB, `/sobre-nosotros` 72,8 KB, legales 20,9 KB.
- ScrollTrigger pasa a usarse de verdad (cintas, salida del rótulo del hero, banda
  del modelo, empuje de los pilares): el punto 2 del backlog de rendimiento
  (sustituirlo por un `IntersectionObserver`) deja de aplicar en esta rama.
- `clip-path` animado no va por la tarjeta gráfica en todos los navegadores: en
  `/talentos` entran hasta ~10 fichas a la vez (foto + dos placas cada una). En
  Chromium y WebKit sin cabeza va fluido; **no se ha probado en un móvil real**
  (`docs/hallazgos-abiertos.md`).
- Partir las placas por líneas mide el texto al cargar y al cambiar el ancho
  (~110 placas en `/talentos`, la mayoría de una línea, que no se tocan).

---

## 2026-10-02 · Lenguaje de movimiento «Marcador»: la web se mueve como el marcador de un estadio

> ⚠️ **En la rama `feat/variante-a-retransmision`, sustituido por la «Variante A ·
> Retransmisión»** (entrada de arriba). Lo que se conserva y lo que no, ahí. El resto
> de esta entrada describe el Marcador tal como se hizo.

> **Estado: propuesta en la rama `feat/rediseno-motion`, sin fusionar.** Se hizo en
> una rama paralela a `preview` a petición de Mario, para verla sin mezclarla con el
> trabajo en curso. Si no se fusiona, esta entrada se queda en esa rama y no existe
> en `preview` ni en `main`.

**Decisión** (pedido por Mario: rediseñar la web «como un showreel» en el lenguaje
de los motion graphics, móvil primero, sin tocar textos, secciones, paleta,
tipografías ni fotos de jugadores, y con las decisiones de diseño delegadas): todo
el movimiento de la web pasa a un solo lenguaje, el de un **marcador de estadio de
noche** bajo el rótulo de neón de la portada. Cómo funciona, en
`ARCHITECTURE.md` («Sistema de animaciones»). En corto:

- **Los datos caen en paletas** (split-flap): los números de sección, de las filas,
  las cifras de la home (7, 360°), los romanos de los pilares (cuentan I → II →
  III en una sola paleta) y los códigos de país. Las paletas caen con gravedad y
  frenan contra el tope; las letras de los tableros (valores, sedes) pasan por el
  abecedario hasta la suya.
- **Los titulares entran rodando** palabra a palabra por su ranura; **las líneas
  del tablero se dibujan** de izquierda a derecha, en cascada; **las fotos se
  revelan** saliendo del negro, por filas.
- **Una sola luz** dorada viaja en la diagonal del logo, hacia arriba a la
  derecha: el destello de las palabras doradas, el de las tecla y el del logo al
  señalarlos, y la banda que cruza la pantalla al cambiar de página (al revés al
  volver atrás).
- **La intro de la portada es una paleta a pantalla completa**: el logo se dibuja
  con el tamaño y en el sitio exactos del rótulo de neón del vídeo, y las dos
  mitades se pliegan hacia la bisagra y descubren el neón en el mismo sitio (un
  corte a juego). Sigue siendo CSS puro, con las reglas de `docs/trampas-conocidas.md`.
- **El grid de talentos se reordena con FLIP** (GSAP Flip) al filtrar, buscar u
  ordenar: cada ficha se desliza a su sitio nuevo en vez de saltar.

**Cómo se eligió.** Se investigaron los principios (Material 3, Apple HIG, los 12
de *UX in Motion*, los de animación de Disney aplicados a motion design y los
paquetes gráficos de televisión de Premier League, Champions y LaLiga). De ahí las
curvas y tiempos: las de Material 3 más la de la marca, dos velocidades (interfaz
120-320 ms; momentos de autor 600-800 ms) y salidas más rápidas que entradas. La
dirección se eligió entre siete tradiciones gráficas del fútbol, ordenadas por lo
que resuenan con este público: el túnel de vestuarios con su espectáculo de luces,
el paquete gráfico de retransmisión, la pizarra de análisis táctico, el álbum de
cromos, los gráficos del cierre de mercado, **el marcador de paletas** y las vallas
LED del estadio. Se construyó la sexta por sorteo (el método de la skill de diseño
`impeccable`, que obliga a no quedarse con la primera idea de la categoría), y se
reforzó con lo mejor de las otras: pasos mecánicos en vez de transiciones suaves en
las letras, fotos que se revelan en vez de fundirse, una sola escala para las
etiquetas, un solo sentido para toda la luz, y las costuras del tablero dibujadas.

**Por qué el marcador encaja con el contenido**: la web está llena de datos
tabulares —números de sección y de área, cifras, un equipo de 21 con cargo y
sede, siete sedes con su código— que en un marcador tienen su forma natural. El
movimiento explica algo en cada sitio: qué ha cambiado (filtros, cifras), en qué
orden se lee (cascadas) y hacia dónde se navega (la luz entre páginas).

**Alternativas descartadas**:

- *El paquete de retransmisión al uso* (barras, cortinillas en diagonal, rótulos
  inferiores): la dirección que cualquiera esperaría para una web de fútbol;
  quedó segunda.
- *Cortinilla geométrica en el propio cambio de página* (recortar la página nueva
  con `clip-path` en la View Transition). Descartada al leer el router de Astro:
  la foto de la página nueva se toma **después** de restaurar el scroll, así que al
  volver atrás o al ir a un ancla (`/#contacto`) la página está desplazada y el
  recorte barre una zona que no se ve. La luz va en una pieza fija a la pantalla
  con su propio nombre de View Transition, que no depende del scroll. Tampoco se
  tocó el nombre `page-main` ni su fundido: es la zona que `hallazgos-abiertos.md`
  pide no tocar sin Mario.
- *Paletas 3D también en los titulares*: ilegible y pesado; los titulares ruedan.
- *Animaciones guiadas por scroll en CSS* (`animation-timeline`): en octubre de 2026
  Firefox aún no las trae por defecto, y el proyecto ya tiene GSAP y un
  IntersectionObserver para lo mismo.
- *Rebotes y elásticos*: la marca no rebota. Se cambió también la curva con rebote
  que tenía la barrita dorada del menú.

**Qué cambia además** (decidido al construirlo):

- **Piezas nuevas**: `Flap`, `FlapText`, `Slate` (la fila índice de cada bloque,
  que antes se escribía a mano en tres secciones) y `Key` (el botón-enlace), en
  `src/components/ui/`; y `src/scripts/ph-motion.ts`, el núcleo sin GSAP.
- **Las etiquetas pasan a una sola escala** (13-15 px, letra normal) y la
  monoespaciada queda solo para las cifras y códigos de las paletas, como se
  decidió el 2026-10-01. Los antetítulos de la home y de Sobre nosotros, que eran
  monoespaciada en mayúsculas, pasan a la fila índice; los valores, los cargos y
  las sedes, a letra normal.
- **Rótulos hasta 9rem (144 px).** Los titulares de una o dos palabras que son el
  bloque («El roster.» en la home, «Hablemos.», «Madrid.») van a escala de
  rótulo: es el recurso de tipografía en movimiento del lenguaje. La revisión de
  diseño propuso el tope habitual de 6rem; se dejó en 9rem, por debajo de los 200
  px que llegó a tener el primer montaje. **Los titulares de cabecera de
  Talentos, Servicios y Sobre nosotros no cambian**: siguen en el máximo de 106 px
  de la entrada del 2026-10-01.
- **La fila índice se queda en cada bloque.** La revisión de diseño la marca como
  antetítulo (un patrón que su sistema veta), pero su texto es contenido que no
  se toca y la fila es la cabecera que eligió Mario el 2026-10-01. Pendiente de
  que Mario diga si la quiere en todos los bloques o solo en las cabeceras de
  página.
- **El menú móvil pierde los números 01-04** delante de cada página: repetían el
  orden del menú sin decir nada más. Quedan las filas con su línea y la cascada.
  Tampoco se repite ya «05 · Contacto» sobre la foto de contacto, al lado de su
  propia fila índice.
- **Sobre nosotros**: los párrafos ya no entran palabra a palabra con desenfoque
  (era el tirón medido en `rendimiento.md`); la tabla del equipo pasa a cuatro
  columnas (la sede caía en una línea aparte debajo del número desde antes de
  este cambio).
- **Portada**: la imagen de contacto se ve también en el móvil, en franja; el
  marcador de cifras va a dos columnas solo desde 1200 px.
- **Se arregla la fuga de listeners de scroll de la home** (`hallazgos-abiertos.md`).
- **Se retiran** `revealOnView`, `trackingReveal`, `counterReveal`, `splitWords` y
  `scrambleReveal` de `ph-text-animations.ts`: este cambio dejó de usarlas.

**Consecuencias**:

- Red de seguridad en CSS para todo lo que espera a entrar en pantalla: si el JS
  no llega, a los 2,5 s se ve todo. Ahora cubre también `data-reveal`, que antes
  solo tenía red en JS.
- Peso: +3 KB comprimidos de JS en las páginas animadas (las curvas a medida de
  GSAP) y +10 KB en `/talentos` (Flip). El núcleo de movimiento (2 KB) se carga
  ahora también en las páginas legales, por la cabecera y el pie. Cifras en
  `docs/rendimiento.md`.
- **No se ha probado en un móvil real** (`docs/hallazgos-abiertos.md`).

---

## 2026-10-02 · El entrenador vuelve al grid de `/talentos`, al final

**Decisión**: Thomas Christiansen (Seleccionador de Panamá) vuelve a mostrarse en
`/talentos`, detrás de los 51 jugadores. Lo pidió Mario el 2026-10-02. Basta con
quitarle `hidden` y `hiddenReason` en `data/entrenadores.json`:
`getAllRosterEntries()` ya pone los entrenadores después de los jugadores, y el
filtro «Entrenadores» del grid ya existía. Su foto es de la misma serie de estudio
que la de los jugadores, con traje en vez de camiseta.

**Qué cambia respecto a la vez anterior.** El 2026-09-21 Mario lo sacó para que el
grid fuera solo de jugadores (entrada de ese día, «Mantener al entrenador en el
grid», descartada). Ahora el grid tiene la selección de jugadores cerrada y con foto
de estudio, y Mario quiere al seleccionador al final. Se le recordó la decisión
anterior antes de hacerlo y la mantuvo.

**Consecuencias**: 52 tarjetas. Cierra en móvil (2 columnas), y deja una suelta en
tablet (3) y dos en escritorio (5); con 51 eran una en móvil, ninguna en tablet y
una en escritorio. Nacho Castro, el otro entrenador, sigue oculto (`on-hold`).

---

## 2026-10-01 · Cabecera de sección legible: el contenido empieza en la primera pantalla y la luz es el fondo de toda la página

**Decisión** (de Mario, sobre la cabecera «Escenario» de la entrada siguiente):

- **Lo que pidió:**
  - No le convencía dónde iban los textos.
  - Quería que la sección empezara ya en la primera pantalla, sin tener que hacer
    scroll para ver contenido (en Talentos, que asomen los jugadores).
  - Quería la animación de fondo «constantemente, nada de solo un trozo arriba y
    luego fondo negro».
  - Sobre la versión compacta: «leer los textos tal y como están ahora es
    horroroso».
- **Cómo se decidió:** sobre un lienzo de diseño con propuestas, en este orden:
  1. A · Eje central, todo centrado.
  2. B · Cartel, titular gigante abajo.
  3. C · Ficha, el texto a un lado y la luz en un panel.
  4. B compacta.
  5. B legible, la elegida.
- **La cabecera:** fila índice («02 · Talentos») → titular → entradilla debajo →
  contenido de la página, sin hueco. Descripción completa en `ARCHITECTURE.md`,
  «Cabecera de sección y fondo animado».

**Por qué se leía mal** (revisión tipográfica y detector, 2026-10-01):

- **No había un tamaño intermedio entre el titular y el texto.** La entradilla iba
  a 16 px en gris al 72 %, al lado de un titular de más de 100 px. Ahora va a
  18–22 px en Söhne, casi blanca, justo debajo del titular.
- **Las etiquetas eran demasiado pequeñas.** Rótulos, clubes y valores iban en
  mayúsculas monoespaciadas a 10–11 px, con hasta 0,25 em de espaciado; el detector
  marcaba los clubes por debajo del mínimo legible. Ahora van en letra normal a
  13–15 px, y la monoespaciada queda solo para números.
- **El orden de lectura era raro:** la entradilla iba arriba a la derecha, antes
  del titular.
- **La luz ensuciaba los párrafos:** pasaba por detrás con la misma fuerza que
  detrás del titular. Ahora brilla entera solo detrás del titular y baja al 32 % en
  el resto.

**Qué cambia**:

- **Fondo de toda la página**: el canvas va fijo a la pantalla (`.ph-page-bg`) y
  el contenido pasa por encima. Las secciones `.talents` y `.srv` pierden su fondo
  opaco. El shader recibe el scroll y la posición del `<h1>` para saber dónde
  brillar.
- **El rótulo deja de ser un «eyebrow».** El rótulo diminuto encima del titular es
  un patrón que el sistema de diseño de referencia (impeccable) veta. Pasa a ser
  una fila índice con línea, como un índice de revista, y el texto es el mismo.
  Esa misma pieza ordena «Áreas de gestión» y la franja de valores.
- **Titular** a `clamp(46px, 5.6vw + 26px, 106px)`: en escritorio, el mismo tamaño
  que tenía la web; en móvil, algo mayor. Medido en ES/EN/IT de 360 a 1440 px sin
  desbordes («Rappresentare» es la palabra más larga).
- **Servicios**: desaparece la línea que cerraba la cabecera; la fila índice de
  Áreas hace de separador. El titular de Áreas y las filas del acordeón bajan un
  poco de tamaño para que el primer servicio asome en escritorio.
- **Sobre nosotros**: los párrafos 2 y 3 pasan a dos columnas anchas (1-6 y 7-12)
  a 18 px.

**Alternativas descartadas**: las cuatro del lienzo.

- A centrada: la entradilla larga de Servicios, centrada en cuatro líneas, se lee
  peor.
- C con panel: buena lectura, pero no era la dirección que eligió Mario.
- B tal cual: cabecera alta y contenido debajo de la primera pantalla.
- B compacta: resolvía el espacio, pero no la lectura.

**Coste**: la luz se dibuja mientras la página está abierta, no solo con la
cabecera a la vista. No está medido en un móvil real (`docs/hallazgos-abiertos.md`).

---

## 2026-10-01 · Cabecera «Escenario» para Talentos, Servicios y Sobre nosotros, y logo en la vertical del texto

> ⚠️ **Superada el mismo día** por «Cabecera de sección legible» (entrada
> anterior): la cabecera alta con los textos abajo y la luz solo en ella se
> sustituyó por una compacta con la luz en toda la página. Lo del logo en la
> vertical del texto sigue vigente.

**Decisión** (de Mario, tras ver en el móvil los fondos animados: «hay unos
difuminados un poco feos en los bordes» y «los textos no están ubicados de manera
atractiva»; pidió el mismo texto con una organización más profesional): las tres
cabeceras pasan a un sistema común, «Escenario». La luz animada llena toda la
cabecera, desde detrás del menú hasta una línea que la cierra, y se apaga sola
hacia el texto. Los textos se apoyan abajo en una rejilla de 12 columnas, con el
titular a la izquierda y la introducción a la derecha. Descripción completa en
`ARCHITECTURE.md`, «Cabecera «Escenario» y fondos animados».

**Qué se midió antes de decidir** (revisión de diseño y detector, 2026-10-01):

- **Los «difuminados feos» eran una placa.** Los contenedores de la versión
  anterior conservaban el fondo de respaldo de las fotos: `#15171b` opaco más un
  halo dorado que se pintaba siempre. Dentro de la caja la luminancia era 24-33
  frente a 14,8 de la página: se veía un rectángulo más claro, de esquinas
  redondeadas por los dos `mask-image` cruzados, con un «techo» a 70 px del menú.
- **La caja iba por el alto de la pantalla, no por el contenido.** En Servicios, a
  1920×1080, acababa 359 px por debajo de la cabecera y cruzaba la línea divisoria
  y el titular de Áreas. En Talentos se metía entre las tarjetas. En Sobre nosotros,
  el punto más brillante de la luz lo cortaba en seco el borde inferior.
- **Tres sistemas distintos**: titulares de 112, 108 y 84 px, separaciones y
  estructuras diferentes, y el logo del menú el doble de metido que el texto.

**Qué cambia**:

- Los fundidos pasan al shader (`stageMask`); el contenedor ya no tiene fondo ni
  máscaras, así que no hay borde de caja que ver. El halo de CSS queda solo para
  cuando no hay WebGL2.
- Mismas cifras en las tres (`--ph-stage-*` en `global.css`); titular a
  `clamp(44px, 7.4vw, 108px)`.
- **Sobre nosotros** deja las dos columnas (texto y foto). El primer párrafo es la
  introducción; valores y pie forman una franja bajo la línea (el pie pierde su
  etiqueta flotante); los párrafos 2 y 3 van debajo, en dos columnas. Mismo texto
  y mismo orden.
- **Talentos**: el buscador, que medía más de 1.000 px para 51 nombres, se queda
  en 520 px en escritorio, con los filtros a la derecha.
- **Servicios**: la línea que cierra la cabecera no se había visto nunca (el CSS la
  deja a ancho 0 y GSAP la animaba `from` 0, de 0 a 0). Ahora se dibuja de borde a
  borde y hace de separador con Áreas, que pierde su borde superior para no
  duplicarla.
- **Logo**: la cápsula del menú se aparta medio margen del borde y deja medio
  margen de relleno, así el logo cae en la vertical del texto en toda la web
  (antes, un margen completo cada uno).

**Alternativas consideradas** (se le propusieron a Mario con capturas y medidas):

- *«Vitrina»*: la animación en un marco limpio a la derecha, sin fundidos. Más
  segura, pero pierde la atmósfera que justificaba el cambio de las fotos.
- *«Índice editorial»*: columna estrecha con número y sección, y una columna de
  luz a la derecha. Aire de revista; la más arriesgada y la que más se aleja del
  resto de la web.

**Lo que no se toca**: los textos y la tipografía (Söhne; su licencia es una
decisión pendiente de Mario). Al revisar se vio que las cursivas de los titulares
son sintéticas, porque no hay archivo de Söhne cursiva: queda anotado en
`docs/hallazgos-abiertos.md`.

---

## 2026-10-01 · PHSPORT opera en Italia: los países pasan de 6 a 7

**Decisión** (de Mario): con la entrada de Tommaso Armari en el equipo, en el
departamento de fútbol en Italia, Italia se suma a los países donde opera PHSPORT.
No es automático: los países no se derivan de la plantilla (entrada del
2026-08-29), así que se preguntó y Mario confirmó que Italia cuenta.

**Qué cambia**, en los tres idiomas: el rótulo del equipo («7 PAÍSES»), la cifra
de países de la home, los «siete mercados clave» y «Presencia en 7 países» de
Servicios, la lista de oficinas (se añade IT) y la lista de Presencia de Sobre
nosotros (Italia, entre Alemania y Arabia Saudí). Todo está escrito a mano en
varios sitios; la lista de qué tocar al cambiarlo está en el comentario de
`about.team.meta` en `src/i18n/es.ts`.

**Alternativa considerada**: dejar los 6 y tener a Tommaso como un integrante
más, como Uruguay en sentido contrario (país sin nadie asignado). Descartada por
Mario.

---

## 2026-10-01 · Italiano como tercer idioma, sin textos legales y con selector desplegable

**Decisión** (pedida por Mario): la web se publica también en italiano, bajo
`/it/` y con las rutas traducidas como en inglés: `/it/`, `/it/talenti/`,
`/it/servizi` y `/it/chi-siamo`. Funcionamiento en `ARCHITECTURE.md`, «i18n».
Cuatro decisiones de Mario, tomadas al plantearlo:

- **Los textos los tradujo un agente de IA desde el español y tiene que
  revisarlos un nativo antes de producción.** Hasta entonces es un pendiente
  abierto (`docs/hallazgos-abiertos.md`).
- **El aviso legal y la privacidad no se traducen.** Siguen en español y en
  inglés. Traducir texto legal sin revisión jurídica es un riesgo, y el aviso ya
  dice que rige la ley española.
- **En escritorio, el selector de idioma pasa a ser un desplegable**: un botón
  con el idioma actual que abre los tres.
- **En el menú móvil, los tres idiomas van en lista**, sin desplegable dentro
  del menú, que ya es un panel que se abre.

Dos detalles que decidió el agente al implementarlo, aceptados por Mario al
aprobar el diseño:

- **El pie de las páginas italianas enlaza a los textos legales en inglés**, la
  variante pensada para quien no lee español. Los enlaces lo declaran con
  `hreflang="en"`.
- **Desde una página legal, elegir «Italiano» lleva a la home italiana**,
  porque esa página no existe en italiano.

De ahí salen dos reglas distintas en `src/i18n/utils.ts`. Un enlace dentro del
contenido cae a la versión inglesa, porque promete esa página. El selector cae a
la home del idioma elegido, porque quien elige idioma pide leer en él.

**Alternativas descartadas**:
- *Los tres idiomas en fila en la cabecera* (ES · EN · IT): un clic menos, pero
  más ancho en la cápsula. Mario eligió el desplegable.
- *Traducir también los textos legales*: descartado por el riesgo jurídico. Es la
  única pieza de la web donde un matiz de traducción tiene consecuencias.
- *Reutilizar `src/scripts/dropdown.ts`* para el desplegable, que era el plan
  inicial. Importa GSAP y `ph-text-animations.ts`, que registra listeners
  globales de navegación y scroll. Meterlo en la cabecera, que está en todas las
  páginas, lo cargaría también en las legales, que hoy no lo cargan, y tocaría
  la gestión del scroll al navegar (`docs/trampas-conocidas.md`). Se copió su
  animación en CSS.

**Consecuencias**:
- **Arregla un fallo que ya existía**: en el aviso legal y la privacidad, el
  botón de idioma llevaba a la home en vez de a la página equivalente. El script
  de la cabecera persistente solo conocía las cuatro rutas del menú y pisaba el
  enlace bueno del servidor. Ahora lee la tabla completa y el smoke comprueba el
  destino de cada opción en las 16 páginas.
- El `contactPoint` del JSON-LD sigue declarando `availableLanguage: Spanish,
  English`. Publicar páginas en italiano no implica que el equipo atienda en
  italiano; si lo hace, hay que añadirlo.
- La tipografía Söhne de prueba no trae letras acentuadas, ni italianas ni
  españolas. No es nuevo ni lo agrava el italiano: el detalle está en
  `docs/hallazgos-abiertos.md`.

---

## 2026-10-01 · Fondos animados en directo para Talentos, Servicios y Sobre nosotros

> ⚠️ **En la variante A, superado el 2026-10-05**: las escenas ya no van fijas por
> página; sale una al azar en cada página, de un bombo de cinco (entrada «La A
> estrena el bombo de fondos»).

> ⚠️ **Composición SUPERADA el mismo día** por la entrada «Cabecera «Escenario»…»
> (arriba): el fondo ya no va en el contenedor de las fotos, sino en toda la
> cabecera, y los fundidos los hace el shader. Las escenas, el motivo de hacerlo
> en directo y lo que se retira siguen vigentes.

**Decisión** (de Mario: «las fotos se han quedado anticuadas»; pidió animaciones
en bucle, de alta tasa de refresco, que acompañen sin quitar atención y con la
paleta de la marca): las fotos de cabecera de esas tres páginas
(`talents-hero`, `services-hero` y `about-equipo`, interiores generados por
ordenador) se sustituyen por fondos abstractos dibujados en directo con WebGL2
(`src/scripts/ph-ambient.ts`). Cada página tiene su escena —`trayectorias`,
`estructura` y `calidez`—, todas con el lenguaje del logo (la diagonal a 45°) y
en dorado sobre negro. Funcionamiento en `ARCHITECTURE.md`, «Fondos animados de
sección».

**Por qué en directo y no en vídeo, como el hero.** «Alta tasa de refresco»: un
vídeo va a 30 fps (60 duplicaría el peso) y una pantalla de 120 Hz lo nota; un
shader va a la frecuencia de la pantalla. Además pesa unos KB de código en lugar
de 100-150 KB de foto (o más de vídeo), y se ve nítido a cualquier tamaño. En el
hero manda lo contrario: es una escena realista y costosa (luz integrada por
tramo, bloom en varias pasadas) que no conviene calcular en un móvil.

**Alternativa considerada — CSS puro** (degradados y formas animadas con
`transform`). Cero JavaScript, pero no da para líneas finas con destellos que
recorren su trazo ni para partículas sin cientos de elementos, y animar
`stroke-dashoffset` en SVG repinta en cada fotograma.

**Lo que cuesta.** Mientras la cabecera está en pantalla, la GPU trabaja a la
frecuencia de la pantalla. Para acotarlo: se pausa fuera de la vista y con la
pestaña oculta, resolución interna con tope, contexto `low-power` y fotograma
fijo con movimiento reducido. **No se ha medido en un móvil real**
(`docs/hallazgos-abiertos.md`).

**Lo que se retira**: `talents-hero.webp` y `services-hero.webp` con sus `-sm`,
`about-equipo-sm.webp` y la precarga de la foto de Talentos. **Se queda
`about-equipo.webp`**: ya no se muestra, pero es el origen de `og-image.jpg`
(`npm run assets:favicons`). Para recuperar las fotos: el commit anterior a este,
sobre esas rutas y las tres secciones.

---

## 2026-10-01 · Los vídeos del hero pasan a `public/hero/2026-10b/`

**Decisión**: la carpeta de versión del hero cambia de `2026-10` a `2026-10b`, sin
tocar los vídeos. **Motivo**: las tres versiones del día se subieron con el mismo
nombre, con el argumento de que solo habían estado en preview y cada despliegue
tiene su propia URL. Es falso: la rama tiene un enlace fijo
(`ph-sport-web-git-preview-rodz-dev.vercel.app`) que sirve `public/` con la misma
caché de 7 días. Mario seguía viendo el tirón después del arreglo; en su
navegador, a través de ese enlace, podía seguir el vídeo de la primera visita. Se
cumple la regla de siempre: vídeo nuevo, carpeta nueva, también en preview
(`docs/trampas-conocidas.md`).

---

## 2026-10-01 · El hero: la cámara se para en el plano frontal

**Problema** (Mario, en escritorio): «pega un salto un poco raro». Medido con
`requestVideoFrameCallback` sobre el build: el vídeo no tiene ningún salto (el
cambio entre fotogramas en las uniones es como cualquier otro), pero el navegador
congela la imagen en el relevo del encendido al bucle (Chromium 83 ms, WebKit
66 ms) y en cada vuelta del `loop` nativo (Chromium 68 ms), saltándose un
fotograma. Con la deriva casi quieta de la primera versión no se notaba; con la
coreografía, la cámara pasaba por ahí a unos 5° por segundo y se veía el tirón.

**Decisión**: la cámara se para un instante en la pose frontal (tangente nula en
la pose 0), que es donde caen las dos uniones. El cambio de imagen a través de la
congelación baja de 0,60 a 0,29 (media de diferencia, fotogramas desenfocados
para quitar el grano), por debajo de un fotograma normal a mitad del bucle (0,31).
La congelación sigue existiendo; ahora cae sobre una imagen quieta. Los pesos
de los vídeos apenas cambian (±1 % respecto a la entrada de abajo).

**Alternativas no probadas**: arrancar el bucle por script unos fotogramas antes
de que acabe el encendido, o alternar dos `<video>` del bucle para no depender
del `loop` nativo. Las dos dependen de tiempos que cada navegador gestiona a su
manera y arreglarían solo una de las uniones; la parada de cámara cubre las dos
en todos los navegadores sin código.

**Consecuencia**: cualquier coreografía nueva tiene que dejar quieta la pose 0
(`docs/trampas-conocidas.md`).

En la misma tanda se arregló que, en WebKit, el vídeo se quedaba parado al volver
a la home con el `ClientRouter`; el porqué está en `docs/trampas-conocidas.md`.

---

## 2026-10-01 · El hero: logo centrado, menos brillo y cámara con coreografía

**Decisión** (de Mario, al ver en preview la versión de la entrada de abajo): el
logo pasa al centro de la pantalla, el resplandor baja y la cámara deja la deriva
casi quieta por una coreografía. Lo demás de esa entrada sigue igual: dos piezas
por pantalla, pósters, códecs y arranque.

**La cámara.** El encendido se acerca desde un plano más abierto y algo girado.
El bucle recorre cinco poses (`SHOTS` en `scripts/hero-neon/neon.html`): giros
de hasta 18° a un lado y a otro, picado, contrapicado, inclinaciones de hasta
3,5° y acercamientos, con un pulso leve de cámara en mano. Las une una curva
Catmull-Rom cerrada, sin esquinas, y el encendido llega a la primera pose con su
misma velocidad: el bucle y el relevo entre vídeos siguen sin saltos. La cámara
orbita alrededor del centro del logo, por eso este no sale del centro aunque
gire.

**El brillo.** Bajan el halo cercano (−34 %), el velo amplio (−42 %), la luz
sobre la pared (−20 %), el bloom (−30 %) y la emisión del tubo (−20 %). **Rodeo:**
el primer ajuste bajó más (halo −48 %, pared −31 %) y la pared perdió casi toda
la luz cálida, que es lo que hace que se lea como un rótulo real. Se quedó en el
punto intermedio.

**Lo que se acepta al centrar.** El encuadre de la entrada de abajo ponía el logo
arriba a la derecha para que el titular no lo pisara. Centrado, en portátiles
16:10, la parte baja del logo pasa por detrás del titular en los planos más
cercanos; el degradado oscuro de abajo lo suaviza. Decisión de Mario.

**Cifras** (mismos CRF; SSIM contra referencia casi sin pérdida):

| Archivo | HEVC | H.264 | SSIM HEVC / H.264 |
|---|---:|---:|---|
| Encendido apaisado (3 s) | 151 KB | 492 KB | 0,981 / 0,980 |
| Bucle apaisado (12 s) | 433 KB | 1.323 KB | 0,981 / 0,980 |
| Encendido vertical (3 s) | 144 KB | 441 KB | 0,980 / 0,979 |
| Bucle vertical (12 s) | 411 KB | 1.198 KB | 0,981 / 0,980 |

Más movimiento de cámara es menos parecido entre fotogramas: el bucle en HEVC
pesa un 70 % más que con la deriva quieta, y en H.264 un 20 %. Un iPhone baja
unos 565 KB y un Android unos 1,65 MB (escritorio: 590 KB en Safari, 1,8 MB en
Chrome).

> ⚠️ **El párrafo siguiente es ERRÓNEO**: la rama de preview tiene un enlace fijo
> con la misma caché. Corregido en la entrada «Los vídeos del hero pasan a
> `public/hero/2026-10b/`».

**Por qué la carpeta sigue siendo `2026-10`** aunque cambian los archivos: los
anteriores no llegaron a producción. Solo estuvieron en un despliegue de preview,
y cada despliegue de Vercel tiene su propia URL, así que nadie tiene en caché la
versión vieja con la dirección nueva.

---

## 2026-10-01 · El hero vuelve a ser vídeo: el rótulo de neón, renderizado, que se enciende una vez y queda encendido

> ⚠️ **Encuadre, brillo y cámara SUPERADOS el mismo día** por la entrada de
> arriba (logo centrado, menos brillo, coreografía de cámara). Las cifras de
> peso de esta entrada son de la primera versión. El resto sigue vigente.

**Decisión** (de Mario): la foto fija del 2026-09-25 se sustituye por un vídeo
del mismo motivo —el logo como rótulo de neón LED sobre metacrilato, en la pared
de fieltro—, generado por ordenador y no filmado. Dos piezas por pantalla: el
encendido (3 s: la luz recorre el tubo desde la unión de las dos piezas, titubea
y se estabiliza), que se ve una vez, y el rótulo encendido en bucle (12 s), con
un zumbido sutil, un fallo breve de la flecha pequeña y un movimiento lento de
cámara. Funcionamiento en `ARCHITECTURE.md`, «Hero».

**Qué cambia respecto al 2026-09-25.** Aquel día se pasó a la foto porque Mario
la pidió en lugar del vídeo de oficina; el motivo no era técnico, y se le avisó
antes de empezar de que esto lo deshacía. El vídeo es del mismo rótulo de la
foto y cierra los dos hallazgos que esta dejó: el titular ya no cae sobre el
trazo inferior (el render encuadra el logo arriba a la derecha) y la nitidez ya
no depende de un original de 1672 px.

**Por qué renderizado.** `scripts/hero-neon/neon.html` dibuja la escena en
WebGL con la geometría de `public/logo.svg`, y `scripts/build-hero-neon.mjs` la
graba fotograma a fotograma. Encuadre, color, ritmo o resolución se cambian
tocando un parámetro y regenerando (unos 7 minutos en un Mac con GPU), sin
volver a filmar. Nació de la foto del rótulo real, rectificada; la geometría se
pasó al SVG porque la medida en la foto salía un 2-3 % más estrecha.

**Alternativa considerada — dibujarlo en directo en la página, con WebGL.**
Unos 30 KB de JS y nitidez a cualquier tamaño, pero tira de la GPU del móvil
todo el tiempo que la portada está a la vista (batería, calor), no se ha medido
en un iPhone y no hay fallback tan simple como un póster. Mario eligió el vídeo:
rendimiento predecible y las reglas de vídeo en portada ya medidas en septiembre.

**Alternativa considerada — el ciclo completo del prototipo** (encendido, fallo
y apagado cada 10 s). Deja el titular sobre negro 1,6 s de cada 10. Descartada.

**Alternativa considerada — un solo vídeo con el encendido dentro, saltando
atrás al acabar.** No se probó: un salto (`currentTime`) en un MP4 progresivo
puede congelar fotogramas en cada vuelta, y el `loop` nativo del segundo vídeo
no tiene ese riesgo. Coste: un archivo más por pantalla.

**Por qué el póster es el rótulo apagado.** Con el póster encendido, el
encendido arrancaría sobre un rótulo ya encendido: se vería apagarse de golpe y
volver a encenderse. Para que el apagado no se quede fijo, todos los casos en
que el vídeo no va a arrancar usan el póster encendido: movimiento reducido
(por `<source media>`), sin JavaScript (`<noscript>`), error del vídeo y autoplay
bloqueado (por script).

**Cifras** (CRF 24 en HEVC y 22 en H.264, los del vídeo del 2026-09-22; SSIM
contra una referencia casi sin pérdida):

| Archivo | HEVC | H.264 | SSIM HEVC / H.264 |
|---|---:|---:|---|
| Encendido apaisado (1920×1080, 3 s) | 154 KB | 533 KB | 0,981 / 0,980 |
| Bucle apaisado (12 s) | 256 KB | 1.090 KB | 0,982 / 0,980 |
| Encendido vertical (886×1920, 3 s) | 160 KB | 485 KB | 0,981 / 0,980 |
| Bucle vertical (12 s) | 256 KB | 996 KB | 0,982 / 0,980 |

Con los pósters (9-10 KB apagados, 22 KB encendidos), un iPhone baja unos
425 KB y un Android unos 1,5 MB (en escritorio, 420 KB en Safari y 1,6 MB en
Chrome); el vídeo anterior eran ~1 MB en móvil. El SSIM
queda por debajo del 0,989 de septiembre por el grano: es ruido distinto en cada
fotograma y el compresor se come parte (el HEVC más). Mirado con el contraste
multiplicado por 3,2 sobre el halo: sin escalones, y los niveles se conservan
(7,75 → 7,74 en la pared más oscura). El grano del render va al 1,4 %, menos
que en el prototipo (3 %), para que comprima: el prototipo, 10 s a 1080p en
H.264 con CRF 20, pesaba 11 MB (no es una comparación en igualdad de ajustes).

**Diagnóstico falso, para no repetirlo.** Al comparar fotogramas extraídos con
ffmpeg, el vídeo parecía 2 niveles más oscuro en todo el rango. No era el vídeo:
el paso rápido de YUV a RGB de ffmpeg redondea hacia abajo. Extrayendo con
`scale=…:flags=accurate_rnd+full_chroma_int` los niveles coinciden. Los
navegadores no usan ese camino.

**Lo que se retira**: `src/assets/images/hero/portada.png`. **Para recuperar la
foto**: `git checkout 3ad0d88 --` sobre ella, `src/lib/heroMedia.ts` y
`src/components/sections/HeroSection.astro`. `ffmpeg-static` vuelve a tener uso
(lo usa el script).

**Consecuencias.** La portada se ve con el rótulo apagado hasta `load` más el
arranque del vídeo; en la primera visita lo tapa el telón de `LogoReveal`
(1,26 s). El LCP es ese póster apagado (9-10 KB). Sin probar en un iPhone real
(`docs/hallazgos-abiertos.md`).

---

## 2026-10-01 · Fotos de las tarjetas de talentos en AVIF 90, con WebP 85 de reserva

**Decisión**: las fotos del grid de `/talentos` se sirven en un `<picture>` con
un `<source>` AVIF calidad 90 y, dentro, el `<img>` WebP calidad 85 de siempre
como reserva para navegadores sin AVIF. Mismos tres anchos (320, 480 y 720) y
mismo `sizes`. El resto de imágenes de la web no cambia. Lo pidió Mario al ver
las fotos de la serie de estudio más blandas en la web que en el original.

**Dónde se perdía calidad.** No en el paso de PNG a JPEG 92 con que entran al
repo (SSIM 0,991 contra el PNG), sino en el WebP 85 del build: el humo dorado
del fondo salía a bloques y las pestañas, los bordes del escudo y las letras del
patrocinador, blandos. Medido sobre cuatro fotos (Carlos Guirao, Owen Emeka,
Lawson Sunderland y José Rey), codificando igual que Astro
(`toFormat(formato, { quality })` de sharp sobre el JPEG del repo), con SSIM
medio contra el PNG reducido sin comprimir, en recortes de la cara y del pecho
(escudo y patrocinador):

| Salida | Cara · pecho a 480 px | Cara · pecho a 720 px | Peso 480 / 720 |
|---|---|---|---:|
| WebP 85 (lo de antes) | 0,952 · 0,910 | 0,959 · 0,908 | 27 / 51 KB |
| WebP 95 | 0,967 · 0,934 | 0,973 · 0,932 | 53 / 108 KB |
| JPEG 85 | 0,947 · 0,880 | 0,955 · 0,887 | 38 / 75 KB |
| JPEG 95 | 0,968 · 0,919 | 0,972 · 0,922 | 74 / 153 KB |
| AVIF 80 | 0,984 · 0,963 | 0,980 · 0,952 | 32 / 59 KB |
| **AVIF 90** | **0,989 · 0,971** | **0,984 · 0,959** | 57 / 109 KB |

Comparado además a ojo, ampliado a 4× lado a lado: AVIF 90 y JPEG 95 son
prácticamente iguales al original en ojos, barba, escudo, letras y malla de la
camiseta; AVIF 80 alisa algo la malla y la piel.

**Esto no contradice la entrada del hero (2026-09-25)**, donde AVIF borraba la
textura de fieltro de la pared incluso a 90. Allí la textura era toda la foto;
aquí lo que importa es cara y letras, y a calidad 90 la malla de la camiseta se
conserva en la comparación a ojo. Se mantiene la lección de aquella entrada: la
decisión se tomó mirando, no solo con el SSIM.

**Por qué la reserva en WebP.** El `<img>` servía un único formato. Un
navegador sin AVIF (iOS anterior al 16, por ejemplo) habría dejado la tarjeta
vacía. Con el `<picture>` ese navegador ignora el `<source>` y carga el WebP 85,
que es exactamente el mismo archivo que se servía antes.

**Alternativas descartadas**:
- *JPEG 85*, que fue la primera recomendación a Mario, hecha mirando solo el humo
  y la tela. En cara y letras sale peor que el WebP 85 que había.
- *JPEG 95*: misma fidelidad que AVIF 90 con un 40 % más de peso.
- *AVIF 80*: mejora clara casi sin añadir peso, pero alisa algo la tela y la
  piel. Mario prefirió la máxima fidelidad.
- *Subir el WebP a 90 o 95*: mejora poco en cara y letras para el peso que añade.

**Consecuencias**:
- **Peso algo más del doble.** Media sobre las 47 fotos del build: 56 → 119 KB
  por foto en la variante de 720 px (móvil) y 30 → 63 KB en la de 480
  (ordenador retina). Recorrer el grid entero en un iPhone descarga unos
  5,5 MB de fotos en vez de 2,6 (las tarjetas cargan en diferido, según se ve).
- **La compilación en frío pasa de ~3 s a ~21 s** en local, porque codificar
  AVIF es lento. Con la caché de imágenes de Astro (`node_modules/.astro`)
  vuelve a ser rápida. **En Vercel, el primer despliegue con AVIF tardó unos
  6 min y medio** (el anterior, 25 s); el siguiente, 15 s, porque Vercel
  conserva esa caché entre despliegues. Solo se vuelve lento si se pierde la
  caché: lo normal es que cada tanda de fotos nuevas codifique solo las suyas.
- El `<picture>` lleva `display: contents` para que la foto siga midiéndose
  contra `.talents__photo`, como antes.

## 2026-09-25 · El hero pasa de vídeo a foto fija, servida por `astro:assets`

> ⚠️ **SUPERADA el 2026-10-01**: el hero es un vídeo renderizado del mismo
> rótulo (ver esa entrada). La foto se borró del árbol y se recupera del commit
> `3ad0d88` (`src/assets/images/hero/portada.png`, con `src/lib/heroMedia.ts` y
> `src/components/sections/HeroSection.astro`). Las mediciones de formato de
> imagen siguen valiendo para fotos con textura.

**Decisión**: la portada deja el vídeo montado el 2026-09-22 y muestra una foto
fija: el logo PH en neón sobre una pared oscura de fieltro
(`src/assets/images/hero/portada.png`). Se la pidieron a Mario ese mismo día.
Llegó como PNG de **1672×941**, sin perfil de color ni metadatos. Se sirve con
`<Image>` de `astro:assets` en WebP calidad 90, en cuatro anchos (640, 960,
1280 y 1672 px: 22, 53, 103 y 174 KB).

**Por qué `astro:assets` y no `public/`, como el póster y el vídeo.** Da nombre
con hash, así que la foto no sufre la caché de 7 días que `vercel.json` pone a
`public/` (`docs/trampas-conocidas.md`): cambiarla es sustituir el archivo. Y
genera los anchos en el build, sin script propio. Es además lo que pide la
tabla de reglas de rendimiento de `ARCHITECTURE.md`. El póster anterior estaba
en `public/` porque tenía que ser el primer fotograma exacto del vídeo; sin
vídeo, ese motivo desaparece.

**Por qué WebP 90 y no AVIF**, que sería lo esperable. Medido sobre la foto, a
1672 px, con SSIM contra el original (1 = idéntico):

| Formato · calidad | Peso | SSIM |
|---|---:|---:|
| AVIF 60 | 36 KB | 0,928 |
| AVIF 80 | 126 KB | 0,964 |
| AVIF 90 | 301 KB | 0,984 |
| WebP 85 | 91 KB | 0,939 |
| WebP 90 | 152 KB | 0,956 |

El SSIM da ganador a AVIF, pero **comparado a 2× lado a lado, AVIF borra la
textura de fieltro de la pared incluso a calidad 90**, y WebP 90 la conserva
con la mitad de peso. El fieltro es casi ruido: un códec que lo aplana a una
superficie lisa puntúa mejor que uno que conserva una textura parecida pero no
idéntica píxel a píxel. **En texturas así, no elegir calidad solo por SSIM.**
(En el build, el WebP de 1672 px sale a 174 KB y no a 152: el codificador de
Astro no usa los mismos ajustes que la prueba.)

**Por qué no se generan anchos mayores que el original.** Ampliar en el build
solo añade bytes, no detalle. En un portátil retina la foto se pinta ampliada
1,7× y se ve algo blanda; el arreglo es un original más grande
(`docs/hallazgos-abiertos.md`).

**Por qué dos encuadres con la misma imagen.** El logo ocupa el 45,7 % del
ancho de la foto y el 86 % del alto (medido sobre los píxeles del neón). En
horizontal, `object-fit: cover` centrado en el logo lo enseña entero. En
vertical no: `cover` ajusta al alto y en un iPhone solo se vería el centro del
logo, ampliado 2,7×. Así que en pantallas más estrechas que 9:10 la foto se
pinta en una franja al 192 % del ancho, con el logo entero ocupando el 88 % de
la pantalla, el centro en el 42 % del alto (por encima del titular) y los
bordes de arriba y abajo fundidos con el fondo. El `sizes` declara esos anchos
reales (192vw en vertical, 178vh en horizontal más estrecha que 16:9), porque
con el `100vw` de siempre el navegador elegiría una variante pequeña y la
ampliaría.

**Alternativa considerada — `cover` también en vertical**, que es lo que había
con el vídeo. Descartada: con el vídeo daba igual porque era metraje de
oficina, pero aquí el motivo es el logo, y cortado a un fragmento central deja
de reconocerse.

**Alternativa considerada — un recorte vertical aparte**, como el del vídeo.
Descartada: el logo es más ancho que cualquier recorte vertical de 941 px de
alto, así que el recorte también lo cortaría.

**Alternativa considerada — dejar la foto como póster del vídeo.** No era lo
pedido: la foto sustituye al vídeo.

**Lo que se retira**: los seis archivos de `public/hero/2026-09/`, el master
`assets/source-media/hero-2026-09.mp4`, `scripts/build-hero-variants.mjs` y el
script `npm run assets:hero`. **Para recuperar el vídeo**: `git checkout
95e6af0 --` sobre esas rutas y sobre `src/lib/heroMedia.ts` y
`src/components/sections/HeroSection.astro`, más la línea de `package.json`.
`ffmpeg-static` se queda en las dependencias de desarrollo aunque ya no lo usa
ningún script: quitarlo toca el lockfile y no hace falta para esto.

**Lo que se ve y no se ha tocado**: en pantallas horizontales, «Forever
Football.» pasa por delante del trazo inferior del neón. Se lee gracias al
degradado, pero compiten. Recolocar el titular o reencuadrar es decisión de
diseño, anotada en `docs/hallazgos-abiertos.md`.

**Actualización del mismo día — segunda versión de la foto.** Horas después
llegó otra `Portada Web.png`, con el mismo nombre y el mismo tamaño, que
sustituye a la primera. Mismo encuadre: el logo está en la misma posición al
píxel (centro 53,1 % × 50,9 %, 45,7 % del ancho, del 7,8 % al 93,9 % del alto),
así que las cifras del encuadre vertical no cambian. Cambia el acabado: la
pared es más lisa y desaparecen los tornillos del metacrilato.

Dos cosas de este archivo que no se ven a simple vista:

- **Venía con transparencia en toda la imagen**, un 96 % de opacidad casi
  uniforme (valores entre 233 y 251 sobre 255), sin viñeteado: un resto de la
  exportación. Se guarda en el repo **sin el canal alfa** y con los colores
  idénticos al original (comprobado píxel a píxel). Con la transparencia, el
  fondo dorado del hero se habría transparentado un poco a través de la foto.
- **El formato se volvió a medir**, porque el motivo de descartar AVIF era la
  textura de la pared. Con la pared lisa:

  | Formato · calidad | Peso | SSIM |
  |---|---:|---:|
  | AVIF 80 | 46 KB | 0,982 |
  | AVIF 86 | 68 KB | 0,984 |
  | AVIF 90 | 113 KB | 0,987 |
  | WebP 85 | 50 KB | 0,975 |
  | WebP 90 | 73 KB | 0,979 |
  | WebP 94 | 106 KB | 0,981 |

  Mirado con el contraste multiplicado por 3,2 sobre el halo del neón, que es
  donde saldrían escalones: ninguno los hace, y las diferencias entre ellos
  solo se ven forzando la imagen. AVIF ya no pierde nada visible, pero tampoco
  gana lo bastante para añadir un segundo formato. **Se queda WebP 90.** En el
  build: 20, 35, 52 y 77 KB (antes 22, 53, 103 y 174).

---

## 2026-09-25 · `/talentos` sigue el orden de la lista de Mario, no los bloques por categoría

**Decisión**: el grid enseña **51 jugadores en el orden exacto de la lista de
notas de Mario** (su listado de 126 posiciones, que no está en el repo). Entran
todos los de las cinco categorías —1ª España, 2ª España, 1ª Fuera, 2ª Fuera y
1ª RFEF— y, de los escudos importantes, **solo los que su lista coloca por
delante de jugadores de una categoría superior**. El resto de escudos queda
oculto (`on-hold`). Sustituye al orden por bloques del 2026-09-21.

**Qué cambió respecto al 2026-09-21**: aquel criterio agrupaba por categoría y,
dentro de cada bloque, respetaba la lista. Al comparar con la lista completa,
Mario prefirió que mande la lista: si él pone a alguien arriba, va arriba aunque
su categoría sea menor. El ejemplo que lo disparó fue Thiago Helguera, séptimo
en su lista y en el filial del Atlético. De ahí salen dos diferencias con los
bloques: Javi Hernández y Alberto Del Moral (1ª Fuera) vuelven a ir delante de
los de 2ª España, y ocho escudos entran intercalados.

**Los ocho escudos que entran, con su posición en la lista**: Thiago Helguera
(7), Rayan Zinebi (27), Aimar García (28), Jorge Rajado (29), Hugo Ríos (32),
Iker Vidal (33), José Rey (34) y Mauro Valeiro (35). Todos van por delante de
algún jugador de 1ª RFEF. José Rey y Mauro Valeiro son del juvenil del Depor, no
del Fabril.

**Los que se añaden de 1ª RFEF**, en orden de lista: Raúl Alarcón (40), Víctor
García (41), Oriol Soldevila (42), Pere Haro (43), Alejandro Gil (44), Santi
Pallarés (45), Boston Billups (46), Álex Domínguez (47), Lucas Macazaga (48),
Víctor Villote (49), Jesús Bernal (50) y Zéno Stassin (118). Con ellos, las
posiciones 1 a 50 de la lista están enteras en la web y Zéno cierra en el 51.
Boston Billups (FC Cartagena, cedido por el Eldense) y Álex Domínguez (SD
Ponferradina) son altas nuevas. Santi Pallarés pasa de UD Las Palmas a CE
Europa, que es lo que dice el campograma. Jesús Bernal está en la lista de
Mario pero no en el campograma.

**Los escudos importantes** son ahora Real Madrid, Barcelona, Atlético,
Valencia, Betis y Getafe; el Depor y el Málaga ya no figuran en la lista de
Mario. No cambia nada en la web: los cuatro del Depor que entran lo hacen por
posición, no por escudo.

**Alternativas descartadas**:
- *Seguir con los bloques por categoría.* Contradice la lista de Mario en los
  puestos 5 a 12 y deja fuera a jugadores que él pone en el top 40.
- *Tope de 40 jugadores.* Mario lo planteó, pero las cinco categorías ya suman
  43 sin escudos; eligió meter a todos los de 1ª RFEF.
- *Cortar en 50 sacando a Zéno Stassin*, que cerraría el grid en móvil y
  escritorio. No se pidió: Zéno es de 1ª RFEF y entra por la regla.

**Consecuencias**: con 51 queda una tarjeta suelta al final en móvil (2
columnas) y en escritorio (5). El orden ya no se deduce de la categoría, solo
de la lista de Mario: para meter o sacar a alguien hay que preguntarle su
posición. Siete visibles no tienen foto: Abde Raihani, Dani Rebollo, Gonzalo
Rodríguez, Fran Manzanara, Santi Pallarés, Boston Billups y Álex Domínguez.

**Lo que no cambia**: cero líneas de código. El orden del grid sigue siendo el
del archivo y el filtro sigue siendo `hidden`.

## 2026-09-22 · Vídeo nuevo del hero: 1080p en HEVC y H.264, recorte vertical para móvil, carpeta versionada

> ⚠️ **SUPERADA el 2026-09-25**: el hero ya no tiene vídeo, es una foto fija (ver
> esa entrada). Los archivos que se describen aquí están borrados del árbol y se
> recuperan del commit `95e6af0`. Las mediciones de códecs siguen valiendo si
> algún día vuelve un vídeo.

**Decisión**: el hero pasa del vídeo de 8 s a 720p al nuevo de edición (17,7 s,
1920×1080, 25 fps; llegó como `.mov` H.264 a 11,7 Mbps con audio PCM de 24 bits
y pista de timecode). Se sirve en **cuatro archivos** desde `public/hero/2026-09/`:
1080p en HEVC y en H.264 para escritorio y tablet, y un **recorte 2:3 centrado**
(720×1080) en los mismos dos códecs para móvil en vertical. Dos pósteres (primer
fotograma, mismo recorte que su vídeo) en un `<picture>`, y el `<video>` pierde el
atributo `poster`. El master se guarda sin audio en
`assets/source-media/hero-2026-09.mp4` (copia del stream de vídeo, sin
recodificar: 26 MB). Lo pidió Mario: máxima calidad en todos los dispositivos sin
descuidar la carga ni la navegación.

**Cómo se eligió la calidad** — codificando el master con cada códec a varios CRF
y midiendo SSIM contra el original (canal Y/U/V, media «All»; 1 = idéntico). Los
CRF se eligieron **por parejas**, para que quien recibe HEVC y quien recibe H.264
vean lo mismo y solo cambie el peso:

| Variante | Códec · CRF | Peso | SSIM | Antes (vídeo de 8 s) |
|---|---|---:|---:|---|
| Escritorio 1920×1080 | HEVC 24 | 3.765 KB (213 KB/s) | 0,9890 | 720p H.264 CRF 25 · 2.849 KB (356 KB/s) |
| Escritorio 1920×1080 | H.264 22 | 6.715 KB (380 KB/s) | 0,9894 | ídem |
| Móvil 720×1080 | HEVC 25 | 1.278 KB (72 KB/s) | 0,9879 | 480p H.264 CRF 28 · 1.019 KB (127 KB/s) |
| Móvil 720×1080 | H.264 23 | 2.116 KB (120 KB/s) | 0,9881 | ídem |

Por segundo de vídeo, el móvil recibe **menos bytes que antes con 2,25× más
resolución vertical**, y el escritorio en HEVC también menos. En H.264 de
escritorio sube un 7 % por segundo a cambio de pasar de 720p a 1080p. El pico por
segundo es 2,5-2,7× la media (el primer plano, la hierba a pleno sol); con descarga
progresiva no bloquea, así que no se pone tope VBV. Como referencia de la escala:
H.264 a CRF 20 da 0,9911 con 9.015 KB, y a CRF 24 da 0,9873 con 5.065 KB.

**Por qué HEVC además de H.264.** La mitad de bytes a igual SSIM, y lo decodifica
por hardware todo iPhone desde el 6s (2015), todo Mac, y casi todo Android. Chrome,
Edge y Firefox solo lo aceptan cuando hay decodificador por hardware, y por eso el
`type` de cada `<source>` lleva el parámetro `codecs` (`hvc1.1.6.L120.B0`,
`avc1.640028`): con él, un navegador sin HEVC contesta «no» y pasa al H.264 sin
descargar nada; sin él, contesta «maybe», se baja el HEVC, falla y solo entonces
sigue. Hace falta `-tag:v hvc1` al codificar: ffmpeg escribe `hev1` por defecto y
Safari no lo reproduce. Y H.264 pasa de perfil Main a High (nivel 4.0): un 10 %
menos de bytes, y lo reproduce cualquier dispositivo de la última década.

**Por qué el recorte vertical para móvil.** Con `object-fit: cover`, un teléfono
en vertical (9:16 o 9:19,5) enseña solo el **tercio central** del ancho del
fotograma. El 480p anterior mandaba el ancho entero a 480 px de alto y el teléfono
lo estiraba 5× (480 → 2.532 px de pantalla). Ahora recibe el recorte a 1080 de
alto (2,3×) por menos bytes. Es 2:3 y no 9:16 porque `max-width: 768px` también
alcanza al iPad mini en vertical (3:4), que con 9:16 perdería más encuadre; con
720 de ancho los teléfonos ven 608 y el iPad mini pierde un 11 % de alto. El
`media` lleva `orientation: portrait` para que un iPhone SE apaisado (667 px) reciba
el 16:9. Se evalúa una vez al cargar: si se gira el teléfono después, se queda el
recorte y `cover` enseña su centro — aceptable para un fondo decorativo. El
recorte es centrado porque todos los planos del montaje tienen el motivo en el
centro (comprobado plano a plano sobre una hoja de contactos).

**Alternativa considerada — AV1.** Medido con SVT-AV1 (preset 6, CRF 35): 2.630 KB
con SSIM 0,9888, es decir, la calidad del HEVC elegido con un 30 % menos. Se
descarta por ahora: Safari solo lo decodifica por hardware desde el iPhone 15 Pro
y los Mac M3; en el resto, Chrome y Firefox lo decodifican por software, que en
un móvil es CPU y batería justo en los dispositivos que más se beneficiarían del
ahorro; es un tercer archivo por encuadre que mantener y tarda 5× más en
codificar. El ahorro real es 1,1 MB en escritorio, donde menos importa. Revisar
cuando el hardware AV1 sea la norma. Misma conclusión a la que llegó el proyecto
hermano `ochoa-cokima` con su vídeo.

**Alternativa considerada — VP9/WebM**, descartada ya en abril y en agosto sobre el
vídeo anterior. Se volvió a medir porque el master es otro: CRF 33 da 3.253 KB con
SSIM 0,9852, **peor que el HEVC a CRF 25 con el mismo peso** (3.241 KB, 0,9881).
Y solo serviría a Chrome/Firefox sin HEVC, que ya reciben el H.264. Tercera vez
que sale mal; no se añade.

**Alternativa considerada — solo H.264**, dos archivos en vez de cuatro. Costaría
a Safari e iOS —la mayoría del tráfico móvil— 1,7× los bytes por la misma
calidad. Descartada.

**Alternativa considerada — un escalón 720p para tablet y portátil.** En pantallas
retina todo se amplía igualmente (un MacBook de 13" tiene 2.560 px de ancho), así
que un 720p ahí es 2× de ampliación; la prioridad es la calidad y el 1080p en HEVC
pesa lo que pesaba el 720p antiguo. Todo lo que no es móvil en vertical recibe el
1080p.

**Alternativa considerada — mantener `poster` en el `<video>`.** El navegador
descarga el `poster` nada más crear el elemento, con `preload="none"` o sin él,
así que en móvil sería bajar el póster de escritorio (76 KB) además del suyo
(34 KB). Sin `poster` ni datos, el `<video>` es transparente y se ve el
`<picture>` de debajo, que sí sirve el póster de cada encuadre. Como el póster es
el primer fotograma del vídeo con el mismo recorte, el paso de imagen a vídeo no
se ve. Comprobado en Chromium sobre el build (vídeo sin fuentes ni `poster`:
se ve el `<picture>`); **en Safari e iOS queda por mirar en dispositivo real**,
que es donde este repo ya se ha llevado sustos (`docs/hallazgos-abiertos.md`).

**Alternativa considerada — bajar el CRF a 30, como decía el backlog de agosto.**
Aquello se midió sobre un vídeo oscuro de 8 s bajo un degradado; el nuevo es
metraje de oficina a plena luz, con hierba, tejidos y bolígrafos donde el bloqueo
se nota, y la petición prioriza la calidad. Superado.

**Por qué la versión va en la carpeta.** `vercel.json` sirve `.mp4` y `.webp` con
7 días de caché más 30 de `stale-while-revalidate`: un vídeo nuevo con el nombre
viejo seguiría siendo el viejo para quien ya visitó la web, y un póster viejo con
un vídeo nuevo se nota como un salto al arrancar. La versión está en dos sitios
que tienen que coincidir (`HERO_VERSION` en `heroMedia.ts` y `VERSION` en el
script); detalle en `docs/trampas-conocidas.md`.

**El master de 26 MB entra en el repo** siguiendo el precedente del anterior
(6,4 MB): es lo único que permite retocar el CRF o el encuadre de ESTE vídeo sin
pedirlo de nuevo a edición. El siguiente vídeo traerá su propio master y este
quedará en el histórico.

**Lo que se ve y no es un fallo**: el bucle corta en seco del último plano (la
escultura de cerca) al primero (la puerta al jardín). Va con el ritmo del montaje,
que cambia de plano cada ~1,8 s. Si se quiere un fundido, es decisión de edición
sobre el master, no un apaño en la web.

**Queda fuera a propósito**, como propuesta y no como cambio: pausar el vídeo
cuando el hero sale de pantalla y no pedirlo con «Ahorro de datos» activado.
Ambas cosas están validadas en `ochoa-cokima` (`docs/cokima-el-rediseno.md`, §4),
pero son cambios de comportamiento que no se han pedido.

---

## 2026-09-21 · `/talentos` pasa a una selección ordenada por categoría, con el campograma como referencia

> **Superada el 2026-09-25**: el orden ya no es por bloques de categoría sino el
> de la lista de Mario, y los escudos solo entran si la lista los pone delante.
> Siguen vigentes el campograma como referencia, el entrenador fuera del grid y
> las altas y cambios de club de este día. Ver la entrada del 2026-09-25.
> **El entrenador vuelve al grid el 2026-10-02**: ver esa entrada.

**Decisión**: la web deja de enseñar el roster entero (114 jugadores visibles,
sin orden declarado) y muestra **una selección** ordenada por los bloques que
fijó Mario: 1ª División España · 2ª División España · 1ª Fuera (primera
división extranjera) · 2ª Fuera · 1ª RFEF · Escudos importantes (canteras y
filiales de Depor, Barça, Real Madrid, Atlético, Málaga, Betis y Valencia).
Dentro de cada bloque, el orden de su lista; los que salen del campograma van
detrás, agrupados por club. El entrenador (Thomas Christiansen) **sale del
grid**: pasa a ser solo de jugadores. Nada se borra: quien sale queda
`hidden` + `on-hold` con nota fechada.

**El bloque de escudos importantes está aparcado** (oculto, `on-hold`, nota
«bloque aparcado») desde el mismo día: Mario quiere cerrar antes su
composición, que además incorpora al Getafe (Getafe B y juvenil). Hasta
entonces la web enseña solo los cinco primeros bloques: **31 jugadores**.

**Los bloques, tal como están hoy en `jugadores.json`** (el archivo no lleva
el bloque; el corte entre uno y otro solo está escrito aquí):

- *1ª España*: Juan Cruz, Dani Requena, Mati Barzic, Iker Luque.
- *2ª España*: Owen Emeka, Salim El-Jebari, Damián Cáceres, Juanjo Sánchez,
  Carlos Guirao.
- *1ª Fuera*: Javi Hernández, Alberto Del Moral, Francisco Dias, Dani Muñoz,
  Christian Manrique, Dimitar Danev, Roberto Olabe, Alessandro Burlamaqui,
  Axel Montaña.
- *2ª Fuera*: Luis Quintero, Abde Raihani, Abdoulaye Keita, Dani Rebollo,
  Jordi Ferrer, Gonzalo Rodríguez, Lawson Sunderland.
- *1ª RFEF*: Pablo Pascual, Eneko Ortiz, Jorge Delgado, Omar Ouhdadi, Fran
  Manzanara, Destiny Ilahude.
- *Escudos importantes* (aparcado, oculto en el archivo justo detrás de los
  31 visibles y en este orden): Thiago Helguera, Rayan Zinebi, Aimar García,
  Jorge Rajado, Hugo Ríos, Iker Vidal, José Rey, Mauro Valeiro (los dos
  últimos, juvenil del Depor, no Fabril), y después los del campograma por
  club: Andrés Corcoba, Pablo Ibáñez, Jesús Palacios, Unai
  Ordóñez, Hugo Fernández (Real Madrid); David Fernández, Carlos Núñez, Miguel
  Serrano (Atlético); Byron Mendoza, Víctor Santiago (Barça); Sosu Kwame,
  Adrián Vidican, JL Mejías (Betis); Frank Iglesias, Janusz Florek (Depor);
  Mario Guilabert (Valencia).

**La fuente de la selección es el campograma interno** (`campograma-ph`, el
Numbers de PH), no la web anterior ni Transfermarkt. De ahí salen las altas
que faltaban en la web (Abde Raihani, Fran Manzanara, David Fernández, JL
Mejías), tres clubes corregidos (Dani Rebollo y Abdoulaye Keita al AVS, los
dos confirmados por prensa portuguesa; Víctor Santiago al FC Barcelona) y el
nombre completo de Keita, antes «Abd. Keita» (la foto se renombró en el mismo
cambio, porque el slug del nombre es el nombre del archivo). Tres fichas que la web tenía en escudos
importantes **no aparecen en el campograma**; Mario confirmó el mismo día que siguen en PH y dónde:
Brayan de la Cruz (juvenil del Atlético), Marcos López (Atlético Malagueño) y
Adrián Martín (Getafe B; la ficha lo tenía en el Betis y se corrige). Con eso
se cierran tres de las 16 fichas con el club en duda desde el 2026-09-03. Los
tres pertenecen al bloque de escudos importantes y esperan con él.

**El número y el grid**: el grid es de 2/3/5 columnas según el ancho. Con el
bloque de escudos aparcado son **31 tarjetas**, que dejan una colgando en los
tres anchos; con los escudos eran 55. Mario prioriza móvil y escritorio, así
que el total final tiene que acabar en múltiplo de 10; está pendiente de
cerrar el bloque de escudos y decidir a quién meter o quitar. El primer corte del día fue 29 jugadores +
entrenador = 30, el único total cercano a 30 que cierra en los tres anchos; se
descartó al pedir Mario que el grid fuera solo de jugadores y al ampliar la
selección con las canteras de los escudos importantes.

**Alternativas descartadas**:
- *Un campo nuevo tipo `featured: true` o `category`.* Duplica el mecanismo
  que ya existe (`hidden` + `hiddenReason`) y el orden dentro de cada bloque
  seguiría siendo manual, así que no ahorra mantenimiento. El JSON sigue siendo
  la única fuente y el orden, el del archivo.
- *Mantener al entrenador en el grid.* Mario lo sacó expresamente: la lista es
  de jugadores.

**Lo que no cambia**: cero líneas de código. `getAllRosterEntries()` ya
filtraba por `hidden` y el orden del grid ya era el del archivo. Las 7
entradas ocultas sin `hiddenReason` (Bernt Klavervoer, Adrián Martín, Carles
Garrido, Marcos García, Vinicius da Conceição, Asier Carmona y Liam Fernández)
siguen sin él: no se rellena inventando.

**Sin foto** (salen con el avatar genérico): Abde Raihani, Dani Rebollo,
Gonzalo Rodríguez y Fran Manzanara entre los visibles; en el bloque aparcado,
Jesús Palacios, David Fernández, Víctor Santiago y JL Mejías. Mario va a
revisar las fotos de toda la selección.

## 2026-09-10 · Un roster oculto no es lo mismo que un roster que se fue

**Decisión**: junto a `hidden: true` en `data/jugadores.json` y
`data/entrenadores.json` va **`hiddenReason`**, con dos valores cerrados:
`left-agency` (ya no es de PH) y `on-hold` (sigue en PH pero no se muestra).
El campo es opcional; ausente significa **motivo sin registrar**.

**El problema**: `hidden: true` significaba las dos cosas a la vez. La única
diferencia estaba en la prosa del campo `note` —«se ha ido de PH» frente a
cualquier otra redacción—, y de las 16 entradas ocultas **7 no tenían nota
ninguna**: Bernt Klavervoer, Adrián Martín, Rebollo, Carles Garrido, Marcos
García, Vinicius da Conceição y Asier Carmona (más Liam Fernández). De esas
nadie sabe ya por qué están fuera, y no hay forma de averiguarlo.

**Alternativa descartada**: separar las salidas a un archivo aparte
(`data/ex-jugadores.json`). Duplica los sitios donde mirar, rompe la fuente
única de verdad del roster y la entrada pierde su posición en el orden del
grid, que es manual.

**Lo que el campo no hace**: nada del código lo lee. Los ocultos no se
renderizan y no hay páginas por jugador, así que no cambia una sola línea de
la web. Lo que compra es que la pregunta «¿se ha ido o solo lo escondemos?» se
conteste en el momento de ocultar. Si algún día se quiere con dientes, un test
del smoke que falle cuando un `hidden` no traiga `hiddenReason` son cinco
líneas — se dejó fuera a propósito para no encarecer el cambio.

**Relleno inicial**: se marcaron `left-agency` los cuatro cuya nota ya lo decía
(Pedro Lima, Paco Esteban, Sergio Esteban, Txus Alba) más Kevin Prieto, y
`on-hold` Lawson Sunderland y Gonzalo Rodríguez, que Mario confirmó que siguen
en PH. Las 8 restantes se quedan sin campo: **no se rellena inventando**.

**De paso**: el filtro `!row.hidden` de `getAllRosterEntries()` solo se aplicaba
a los jugadores. Un entrenador marcado como oculto seguía saliendo en el grid.
Se descubrió al ocultar a Nacho Castro y está corregido.

## 2026-09-03 · El scroll suave se apaga durante la navegación entre páginas

**Decisión**: en cada `astro:before-swap`, `ph-text-animations.ts` escribe
`scroll-behavior: auto` en el `<html>` del documento **entrante**, y lo retira tras
el `ScrollTrigger.refresh()` del montaje. Además, la posición que deja el
`ClientRouter` se captura en `astro:after-swap` y se **reafirma** justo después de
ese refresh.

**El problema**: dos bugs con la misma raíz, medidos en producción el 2026-09-03
envolviendo `window.scrollTo` para registrar cada llamada con su traza.

1. **Atrás no devolvía donde estabas** (quedaba en `y≈2`, abierto desde agosto). El
   router restaura con `scrollTo(x, y)` —forma de dos argumentos, que no admite
   `behavior`—, así que hereda el `scroll-behavior: smooth` de `global.css` y la
   restauración se anima. 60 ms después, el refresh de ScrollTrigger hace su ciclo
   guardar → ir a 0 → restaurar, fotografía la animación a medio camino y la deja
   clavada ahí.
2. **Entrar en `/talentos` desde media página aterrizaba a la misma altura** en vez
   de arriba (4 de 4, desde la home, `/sobre-nosotros` y `/servicios`). El mismo
   refresh restauraba una posición heredada de la página anterior. Este no estaba
   registrado en ninguna parte: apareció al investigar el primero.

**Lo que esto corrige de la documentación anterior**: la hipótesis que estuvo
escrita en `hallazgos-abiertos.md` —el `scrollTo` ocurre cuando el documento aún no
tiene altura— **era falsa**. Y el guardado en el historial funcionaba correctamente:
`history.state.scrollY` valía 1200 al volver. Lo que fallaba era la restauración.
Sí se confirma lo que decía sobre `QuietScrollHistory`: no tiene nada que ver.

**Alternativa considerada — `ScrollTrigger.clearScrollMemory()`**, que es la API que
GSAP ofrece justo para limpiar la posición guardada al cambiar de ruta. Se
implementó y se midió: **no arregla nada**, `/talentos` seguía aterrizando a la
altura de la que venías. Por eso la posición buena se reafirma a mano en vez de
confiar en la caché interna de GSAP.

**Alternativa considerada — quitar `scroll-behavior: smooth` de `html`** en
`global.css`. Es la solución de fondo y elimina la clase entera de "el `scrollTo` de
otro se me anima sin querer", pero el indicador del hero (`<a href="#talentos">`) es
un ancla pelada que depende de ese CSS: pasaría a saltar de golpe, y recuperar el
movimiento suave cuesta un manejador de clic nuevo. Se descarta por ahora; si algún
día el indicador deja de ser un ancla, esta es la simplificación que toca.

**Por qué el atributo va en el documento entrante y no en el actual**: el swap
resetea los atributos de `<html>` a los del documento nuevo, y el `scrollTo` del
router corre *después* del swap. Es el mismo motivo por el que `.ph-anim` se copia
ahí, dos líneas más abajo en el mismo hook.

**Por qué hay un temporizador además del refresh**: `/aviso-legal` y `/privacidad`
no montan animaciones, así que no piden ningún refresh y nadie volvería a encender
el scroll suave. Un `setTimeout` de 1 s en `astro:page-load` lo cubre.

**Verificado** con una sonda de Playwright contra el preview del build: atrás desde
`/talentos` vuelve a 1200 y se queda ahí, entrar en `/talentos` aterriza en 0 (4 de
4), el indicador del hero sigue bajando suave en carga directa y tras navegación
SPA, y `/aviso-legal` recupera el scroll suave. Smoke E2E, 38/38.

---

## 2026-08-29 · El telón de intro pasa a CSS, y el vídeo del hero deja de precargarse

> ⚠️ **La parte del vídeo quedó sin objeto el 2026-09-25**: el hero es una foto
> fija. Lo aprendido (`preload="none"` y `play()` tras `load`) vale si vuelve un
> vídeo. **La parte del telón en CSS sigue vigente.**

**Decisión**: la animación de entrada de la home se reproduce con `@keyframes`, sin
GSAP y sin depender de que ningún JavaScript se ejecute. El vídeo del hero pierde
el `autoplay` y pasa a `preload="none"`, con la reproducción lanzada a mano tras
`load`.

**El motivo no era la velocidad, aunque también.** El telón era un overlay opaco a
pantalla completa que **solo desaparecía si el JS llegaba, se ejecutaba y terminaba
bien**. Un error de JavaScript, una red que corta el chunk, un bloqueador: la
portada se queda en negro para siempre. Eso no es lentitud, es un modo de fallo en
la cara visible del negocio. En CSS termina solo pase lo que pase — comprobado
cargando la home con JavaScript desactivado.

De paso, las cifras (móvil, CPU ×4, 4G lenta, mediana de 5): contenido visible
**4.978 → 1.832 ms**, transferido **1.254 → 259 KB**. La animación baja de 2,57 s
a 1,26 s. Detalle y método en `docs/rendimiento.md`.

**Alternativa considerada — parchear el telón sin reescribirlo** (adelantar su
arranque a `DOMContentLoaded`, acortar la timeline, saltarlo en visitas
repetidas). Llegaba a ~2,8 s con unas 20 líneas, contra ~1,8 s reescribiéndolo.
Se descartó porque **dejaba intacto el modo de fallo**: seguía siendo un overlay
que solo el JS puede retirar. Y, contra la intuición, la reescritura salió más
barata en código: **+225 líneas contra −248**.

**Alternativa considerada — `pathLength="1"` en los polígonos**, que es la forma
elegante de normalizar la longitud del trazo a 0-1 y evitar medirla. Descartada:
en formas básicas (`<polygon>`) es SVG 2, WebKit lo ignoró durante años y sigue
habiendo un bug por el que el zoom de página altera el valor. En iPhone **todos**
los navegadores son WebKit y este repo ya se ha llevado ese susto (ver la entrada
del alto de viewport). Si fallara, el logo saldría punteado y completo desde el
primer fotograma. Como los perímetros son constantes, van escritos: **753 y 637**.

**Alternativa considerada — WebM/VP9 para el vídeo**, la recomendación de manual.
Medida sobre el master real: sale **peor** que el H.264 actual (2.003–3.933 KB
según el CRF, contra 2.849 KB). No se añade. El margen del vídeo está en bajar el
CRF de 25 a 30, que da −50 % con el mismo códec, y queda pendiente.

**Alternativa considerada — bloquear el scroll durante la intro**, como hacía la
versión de GSAP (`overflow: hidden` + compensación de la barra). Descartada: no se
puede deshacer en CSS puro, y colgarlo de un `animationend` cambia un modo de
fallo por otro peor — hoy una pantalla negra, mañana una página que no scrollea
nunca más. El overlay ya tapa; se le añade `touch-action: none` y ya está. Se
asume a propósito que la rueda del ratón siga pasando durante 1,26 s.

**Por qué "una vez cada 18 h" y no por sesión ni por día natural.** Pedido por
Mario: que la intro no se repita mientras navegas, pero sí al volver al día
siguiente. `sessionStorage` se comporta según la pestaña, no según el tiempo (la
cierras y vuelves a los cinco minutos, y sale otra vez). Guardar la **fecha** del
calendario tiene tres agujeros: medianoche, cambiar de país y tocar el reloj del
sistema. Un `Date.now()` con ventana en horas no tiene ninguno, y 18 h es el
número que cumple lo pedido: entras el lunes por la mañana, vuelves esa noche y no
sale; vuelves el martes y sí.

**Efecto secundario del cambio, para que nadie se asuste**: el LCP que reporta
PageSpeed **sube** de 596 ms a ~1.692 ms. No es una regresión. Antes el telón
tapaba todo y el único candidato visible era el textito «SCROLL» de la esquina
(700 px²); ahora mide el titular del hero, que es el contenido de verdad.

**Se borran** `src/lib/is-document-reload.ts` (sin referencias) y el evento
`ph:logo-revealed` (sin oyentes), que existían solo para esta animación. También
desaparece el parche `ph-logo-reveal-active` y su rama en el manejador de scroll,
al montarse el overlay fuera de `<main>`.

**El plan pasó por una revisión adversarial antes de ejecutarse**, y menos mal:
tres de sus puntos rompían la home (entre ellos, que los estilos en el atributo
`style` del overlay hacían imposible ocultarlo). Otros dos aparecieron al medir y
no se ven leyendo el código. Están todos en `docs/rendimiento.md`.

---

## 2026-08-29 · El smoke comprueba de qué proyecto es el servidor antes de medir

**Decisión**: un `globalSetup` (`tests/e2e/comprobar-servidor.ts`) busca la marca
de este proyecto en el HTML antes de arrancar los tests. Si no está, aborta
diciendo qué web sirve ese puerto. Se añade `PH_E2E_PORT` para cambiar de puerto
sin editar la configuración.

**El problema**: `playwright.config.ts` usa `reuseExistingServer` en local, que
comprueba que *algo* responde en el puerto, no *qué* responde. Un `astro preview`
de otro proyecto ocupaba el 4322, el smoke midió esa web y dio 37 fallos que
abortaron un push a main. El informe decía que `og:site_name` era "Horizon Sport";
hasta llegar a esa línea, el fallo se lee como una regresión propia.

**Por qué merecía arreglarse y no era solo una molestia.** Un smoke que mide otra
web **en verde miente**, que es mucho peor que fallar: si el otro proyecto se
pareciera más, algunos tests pasarían. Y en rojo tiene un final previsible —
alguien concluye "esto falla siempre" y empieza a usar `--no-verify`, con lo que
el hook deja de proteger nada. Justo lo que el hook existe para impedir.

**Alternativa considerada — `reuseExistingServer: false` siempre.** Playwright
levantaría siempre el suyo y el conflicto daría un "puerto en uso" claro.
Descartada porque quita la comodidad de reutilizar un `preview` propio ya abierto,
y **no cubre el caso de fondo**: seguiría sin comprobar la identidad de lo que
mide en CI o en cualquier otro montaje.

**Alternativa considerada — mover el puerto a uno más raro.** Es mudar el problema,
no resolverlo: cualquier puerto puede estar ocupado mañana por otra cosa.

**Por qué un `globalSetup` y no un test más**: un test que compruebe la identidad
llegaría tarde y en desorden, mezclado entre los otros 37 fallos. En `globalSetup`
corre antes que nada, aborta en un segundo y el mensaje es lo único que se lee.

---

## 2026-08-29 · Los "6 PAÍSES" del equipo no se derivan de la plantilla

> **El número cambió el 2026-10-01**: son 7 desde que PHSPORT opera en Italia (ver
> la entrada de esa fecha). El criterio de esta entrada sigue vigente: los países
> cuentan dónde opera PHSPORT, no de dónde es la plantilla.

**Decisión**: al sacar a Thiago Nanini —el único con `countryKey: 'uruguay'`—, el
rótulo de la sección de equipo se queda en **6 países** aunque las nacionalidades
de la plantilla sumen 5. El nº de integrantes sí baja, de 21 a 20.

**Motivo** (de Mario): ese "6 PAÍSES" habla de **dónde opera PHSPORT**, no de la
procedencia de los empleados. Que se vaya la persona asignada a un país no retira
al país. Por el mismo motivo, `about.presencia.country.uruguay` tampoco se toca:
Uruguay sigue en la sección de Presencia.

**Por qué se registra algo tan pequeño**: porque el rótulo va escrito a mano y
ahora **contradice al array** a ojos de cualquiera que los compare. Sin esto, el
siguiente que pase lo dará por un bug y lo "arreglará" a 5. Queda también un
comentario junto a la clave en `es.ts`, que es donde mirará quien lo vea.

**Alternativa considerada — derivar ambos números de `TEAM_MEMBERS`**, que evitaría
que se desincronicen. Descartada precisamente por esta decisión: los países no son
derivables de la plantilla, así que automatizarlo daría el número equivocado. El de
integrantes sí lo es, pero por un solo número no compensa montar el cálculo.

**Nota sobre el borrado**: a diferencia del roster de jugadores, aquí no existe
`hidden: true` — `TEAM_MEMBERS` es un array sin ese campo y la rotación del equipo
no lo justifica. Si vuelve, se recupera la fila del commit `4b193e7`.

---

## 2026-08-13 · El examen al agente frío: banco fijo de regresión + encargo rotatorio de descubrimiento

**Decisión**: la calidad de la documentación se mide examinando a un agente sin
contexto sobre un clon del repo (`docs/examen/`). Dos mitades: un **banco fijo**
que se corre entero (regresión, umbral 12/12) y **un encargo abierto nuevo cada
vez** (descubrimiento, sin nota). Pedido por Mario: garantizar que el contexto
viaja por Git y no por memorias locales de un dispositivo.

**Alternativa considerada — una nota de 0-100 puesta por un juez, con aprobado en
90.** Era la propuesta inicial y se descartó por dos motivos. Uno, no es
reproducible: el mismo repo puntuado dos días distintos da cifras distintas, así
que el umbral se decide por ruido. Dos, y más importante, **una nota no dice qué
arreglar**. La corrección binaria por encargo sí: cada fallo apunta a una frase
que falta en un documento concreto.

**Por qué el umbral es 100 % y no 90 %**: es un banco de regresión, no un examen
de conocimientos. Cada encargo es una trampa ya pagada una vez. Un 11 de 12 no es
un notable — es un agente frío a punto de repetir un error que costó meses.

**Alternativa considerada — rotarlo todo**, ya que un encargo se "quema" cuando la
documentación aprende a responderlo. Descartada a medias, y ahí está el matiz:
un encargo quemado deja de descubrir, pero **sigue detectando regresiones** —
exactamente igual que el smoke E2E, que no encuentra bugs nuevos e impide que
vuelvan los viejos. Por eso rota solo la mitad de descubrimiento.

**Los encargos no se inventan**: entran desde un hueco real destapado por la mitad
de descubrimiento, o desde un error caro cometido en el trabajo real. Misma
disciplina que este documento.

**Detalles que no son obvios**:
- El clon va a una **ruta temporal nueva** (`npm run examen:clon`) porque la
  memoria de un agente se indexa por ruta: una ruta inédita es un agente sin
  recuerdos. Examinarlo en el directorio de trabajo invalidaría la prueba.
- Se le retira el **remoto** al clon: sin él, no puede resolver dudas fuera de lo
  que el repositorio contiene.
- **Un agente nuevo por encargo**, y nunca un fork de la sesión en curso: heredaría
  justo el contexto que se quiere descartar.
- Los encargos van redactados **como los pediría un cliente**, con premisas
  equivocadas a propósito. Si se reformulan con vocabulario del repo, se filtra
  la respuesta y el examen deja de medir nada.

**Lo que este examen no puede medir** — y conviene no confiar de más en un
aprobado: documentación *equivocada* (el agente frío se equivocará igual, y con
seguridad), criterio, y lo que a nadie se le ocurrió preguntar. Detalle en
`docs/examen/README.md`.

---

## 2026-08-13 · Una sola carpeta para planes y specs: `docs/historico/`, y un guard que lo sostiene

**Decisión**: los planes y specs viven **solo** en `docs/historico/{plans,specs}/`.
`docs/superpowers/` no existe, y si reaparece, el hook de pre-push y la Action
abortan hasta que se mueva.

**El problema**: las skills de `superpowers` (`brainstorming`, `writing-plans`)
llevan `docs/superpowers/` escrito a fuego en su propio `SKILL.md`. El renombrado
del 2026-08-11 por tanto **se deshacía solo**: bastaba con generar un plan nuevo
para que la carpeta volviera y los documentos quedaran repartidos en dos sitios.

**Alternativa considerada — volver a llamarla `docs/superpowers/`** y dejar que la
skill escriba donde quiere. Es la opción de cero fricción, y se descartó por el
nombre: `superpowers` dice **qué herramienta** generó los documentos, dato inútil
para quien llega frío. `historico` dice **qué son** — foto congelada del día que
se escribieron. Y confundir eso es el error caro de este repo: leer un plan de
abril como si fuera el estado de hoy (ver la island fantasma en `CLAUDE.md`). Un
nombre que avisa vale más que uno que le ahorra trabajo al plugin.

**Alternativa considerada — mantener las dos carpetas**, la vieja para lo que
escriba la skill y la nueva para lo demás. Descartada de plano: duplica el sitio
donde buscar, que es exactamente lo que se venía de arreglar.

**Alternativa considerada — solo la regla escrita en `CLAUDE.md`**, sin guard.
Insuficiente: la skill lleva la ruta contraria en su texto, así que la regla
compite con una instrucción explícita y basta un despiste para que se cuele. El
guard convierte la convención en algo que el repo comprueba solo.

**Por qué el guard va en el hook *y* en la Action**: mismo motivo que el smoke —
un hook vive en la máquina de quien empuja, y `--no-verify` existe.

**No confundir con `.superpowers/` en la raíz**: esa sí es del plugin (su espacio
de trabajo de ejecución, en `.gitignore:70`) y no se toca. El guard mira
`docs/superpowers/` únicamente.

---

## 2026-08-12 · El smoke se ejecuta solo: hook `pre-push` que bloquea + Action que avisa

**Decisión**: el smoke E2E deja de depender de que alguien se acuerde. Dos capas:
- **`.githooks/pre-push`** — corre el smoke antes de cualquier push que toque `main` y **aborta el push** si falla.
- **`.github/workflows/e2e.yml`** — lo repite en push a `main`, en PRs y a demanda. **Avisa, no frena el despliegue.**

Pedido por Mario el 2026-08-12: "se me olvidará lanzarlos".

**Alternativa considerada — correr los tests dentro del build de Vercel**, de modo que un fallo cancele el despliegue. Es la única opción que impide de verdad publicar una regresión, y aun así se descartó: obliga a descargar Chromium en cada build (1-2 min más por deploy) y deja la web sin actualizarse entera cuando falla un solo test. Para un sitio corporativo estático, quedarse sin poder publicar por un test frágil es peor que publicar con un fallo de marcado y arreglarlo en diez minutos. **Si algún día el smoke crece hacia cosas críticas de negocio, esta decisión merece revisarse.**

**Alternativa considerada — solo la Action.** No resuelve el problema planteado: el aviso llega cuando Vercel ya ha desplegado.

**Por qué las dos capas y no solo el hook**: un hook vive en la máquina de quien empuja. Este proyecto se trabaja desde varios dispositivos y con agentes distintos, y `--no-verify` siempre existe. La Action cubre justo esos huecos.

**Detalles que no son obvios**:
- El hook vive en **`.githooks/`, versionado**, no en `.git/hooks/`, que no se clona. Lo activa `core.hooksPath` vía el script **`prepare`** de `package.json`, que npm ejecuta tras cada `npm install`: en un clon nuevo no hay que hacer nada a mano. Se eligió eso antes que **Husky**, que es una dependencia más para lo que resuelven dos líneas — y el repo acaba de retirar tres dependencias sin uso.
- El hook **solo actúa sobre `main`**: empujar una rama de trabajo no paga los 40 segundos.
- Un push que **borra** la rama remota (sha local a ceros) se salta los tests.

**Verificación**: se probaron los cuatro caminos del hook. Rama que no es `main` → sale en 0 sin ejecutar nada. Borrado de rama → ídem. Push a `main` con el código sano → 38 tests en verde, salida 0. Push a `main` tras comentar `/privacidad` en `STATIC_ROUTES` → 2 tests rojos y **salida 1, push abortado**. Revertido después.

---

## 2026-08-12 · Smoke E2E con Playwright sobre el build, sin tests visuales

**Decisión**: se adopta **Playwright** (`@playwright/test`, solo Chromium) para un único smoke que prueba las 12 páginas del build. Vive en `tests/e2e/` y se lanza con `npm run test:e2e`. **No se añaden snapshots visuales ni tests de animación.**

**Alternativas consideradas**:
- **Seguir sin tests.** Era el estado desde abril. Se descarta porque con 116 tarjetas de roster y View Transitions frágiles, una regresión no la ve nadie hasta que está en producción.
- **Tests unitarios (Vitest) de los helpers de `src/lib/`.** Son funciones puras y fáciles de probar, pero ninguna de las regresiones que este proyecto ha sufrido de verdad vivía ahí: fueron marcado, hosting y timing. Habría dado cobertura donde no duele.
- **Capturas de referencia (snapshot visual).** Descartadas a propósito: con GSAP y `ScrollTrigger` el resultado depende del momento exacto en que se toma la captura, y darían falsos positivos hasta que alguien dejase de mirarlos. Un test que se ignora es peor que no tenerlo.

**Motivo de lo que sí cubre**: se eligieron comprobaciones sobre el **marcado servido**, que es estable, y en concreto las que protegen reglas que ya han costado tiempo:
- El JSON-LD `WebSite` **solo en la home**: 4 meses de "phsport" en minúsculas en la SERP (entrada del 2026-08-11). Era un comentario en el código; ahora es un test.
- **`hreflang` recíproco y hacia páginas existentes**: cuando una ruta no está en `STATIC_ROUTES`, `getAlternateLangUrl()` devuelve `/` sin avisar — el `console.warn` está bajo `import.meta.env.DEV`, así que en el build no se entera nadie.
- **Errores de consola y respuestas ≥400**, con lista explícita de warnings tolerados (hoy solo `apple-mobile-web-app-capable`, deprecado a propósito). Silenciar la consola entera habría hecho el test inútil el día que aparezca un error nuevo.

**Detalles que no son obvios**:
- Corre contra `dist/` vía `astro preview`, **no contra el dev server**: se verifica lo que se sube a Vercel.
- Puerto **4322**. El 4321 tiene `strictPort: true`, así que usarlo rompería los tests con `npm run dev` abierto.
- Las rutas se derivan de `dist/`, no de una lista escrita a mano: una página nueva entra en el smoke sola.
- `tests/e2e/rutas.ts` usa `process.cwd()` y no `import.meta.url` porque el `package.json` no declara `"type": "module"` y Playwright transpila a CommonJS.

**Verificación de que los tests sirven**: no basta con que pasen. Se rompió a propósito la condición `isHome` de `BaseLayout.astro` para emitir `WebSite` en todas las páginas: el smoke pasó de 38 verdes a **11 fallos** — las 11 páginas que no son la home— y la home siguió pasando. Después se revirtió.

**Fuera de alcance, y por qué**: los 146 redirects de `vercel.json` (los sirve Vercel, no `astro preview`), las View Transitions (viven en la `top-layer`: ni captura ni `getAnimations()` las ven) y los bugs de motor concreto en iOS, que siguen exigiendo dispositivo real.

---

## 2026-08-11 · Retiradas `lucide`, `marked` y `puppeteer` — restos sin uso

**Decisión**: las tres salen de `package.json`. Ninguna se importaba en `src/`, `scripts/` ni `astro.config.mjs`, y ninguna aparecía en el `dist/` construido.

**Alternativa considerada**: dejarlas. Son devDependencies y el sitio es estático, así que no llegan al usuario final. Se descartó porque el coste real no es el peso servido sino el engaño: una dependencia declarada se lee como "esto se usa", y lleva a conclusiones falsas sobre cómo funciona el proyecto (ver más abajo el caso de `puppeteer`).

**Motivo, uno por uno** — de dónde venía cada una, rastreado con `git log -S`:

- **`lucide`** (entró en `c994ae3`, con las secciones de servicios y equipo): los iconos acabaron siendo SVG inline y en `public/icons/`, pero la librería se quedó declarada.
- **`marked`** (entró en `144578f`, "modal flip, detail view, and grid payloads"): servía para renderizar la biografía en la **vista de detalle de jugador**, que se retiró a propósito el 2026-04-24 (ver esa entrada). Se fue la feature y quedó el renderizador de markdown.
- **`puppeteer`** (entró en `f64ee49`, el bootstrap inicial): nunca llegó a usarse en código versionado. Se usaba desde scripts de captura temporales en la raíz, que el `.gitignore` sigue excluyendo (`/capture-*.mjs`, `/check-*.mjs`). Al no haber rastro en el repo, la suposición natural es que lo usa `build-favicons.mjs` — **y no es cierto: ese script usa `sharp`**. Esa confusión es justo lo que motivó retirarla.

**Verificación**: `npm run build` (12 páginas) y `npm run astro -- check` (0 errores) después de la retirada.

**Regla resultante**: si una dependencia deja de usarse al retirar una feature, sale en el mismo commit que la feature. Para volver a necesitar Puppeteer (capturas, mediciones), instalarlo puntualmente en vez de dejarlo declarado sin consumidor en el repo.

---

## 2026-08-11 · Dominio canónico en el apex + todos los redirects en `vercel.json`

**Decisión**: `phsport.es` (apex) es el dominio que sirve la web; `www.phsport.es` redirige a él con **308 permanente**. Se configura en Vercel → Settings → Domains. Además, **todos** los redirects del proyecto viven en `vercel.json`, no en `astro.config.mjs`.

**Alternativa considerada**: dejar `www` como principal y cambiar `site` en `astro.config.mjs` para alinear el código con el hosting.

**Motivo**: durante 4 meses la SERP mostró el nombre del sitio como **"phsport"** en minúsculas (visible sobre todo en móvil, donde Google sustituye el título por el *site name*). La causa no estaba en el marcado — estaba bien desde el P0 de mayo (commit `ac8f35d`) — sino en la capa de hosting: **el apex devolvía 307 a `www`, así que Googlebot nunca recibía HTML de la raíz del dominio**. El *site name* es el único mecanismo de Google que se resuelve leyendo el marcado **en la raíz** ("the domain or subdomain level root URI"); por eso fallaba solo el nombre mientras títulos, descripciones e indexación iban bien.

Se eligió el apex porque todo el código ya lo declaraba (`site` en `astro.config`, canonical, sitemap, `robots.txt`, hreflang) y la propiedad de Search Console es `sc-domain:phsport.es`, que cubre ambos hosts. Girar la única pieza discordante (Vercel) en vez de reescribir las seis restantes.

**Por qué los redirects no van en `astro.config`**: en build estático Astro los materializa como HTML con `<meta http-equiv="refresh">` y **respuesta 200**, que Google trata como redirección débil. `/equipo` llevaba así desde siempre. En `vercel.json` son 301 reales a nivel de servidor.

**Cambios ejecutados**:
- Vercel: apex a `Connect to an environment / Production`; `www` a `Redirect to Another Domain / 308 Permanent`.
- `BaseLayout.astro`: el JSON-LD `WebSite` se emite **solo en la home** (`Astro.url.pathname === '/'`) — Google lo exige en la raíz del dominio e ignora el nivel de subdirectorio, así que en las otras 11 páginas era ruido. `url` con barra final para casar exacto con el canonical.
- `vercel.json`: 146 redirects 301 para el legado del WordPress anterior (inventario vía Wayback CDX: 538 URLs). 130 fichas de jugador y las taxonomías (`/category/*`, `/cl_team/*`, `/tag/*`) → `/talentos/`; `/contacto/` y `/equipo/` → `/sobre-nosotros`; homes antiguas y `/author/*` → `/`. Las `/wp-*` (350) quedan fuera a propósito: son ficheros internos, no páginas indexables.
- `astro.config.mjs`: retirado el bloque `redirects`.
- `Header.astro`: `hreflang` en los enlaces del selector de idioma (commit `6a0aabf`).

**Regla resultante**:
- Cualquier redirect nuevo va a `vercel.json`, nunca a `astro.config.mjs`.
- Al tocar dominios, verificar SIEMPRE con `curl -A "…Googlebot…" -I https://phsport.es/` que la raíz devuelve **200** y sirve el `WebSite` JSON-LD. Un 3xx ahí rompe el site name aunque el marcado sea perfecto.
- El sitemap de `@astrojs/sitemap` **no** debe llevar la opción `i18n`: empareja versiones por path y aquí los slugs están traducidos (`/servicios` ↔ `/en/services`), así que solo anota 2 de 12 URLs. El hreflang vive en el HTML, completo y recíproco.

**Pendiente de verificar (desde ~2026-08-25)**: que la SERP móvil muestre "PHSPORT". Los sitelinks que mezclan ES/EN no tienen control directo — los elige Google y la herramienta para degradarlos se retiró de Search Console hace años.

---

## 2026-06-25 · LogoReveal de island React a vanilla — React sale del proyecto

> **Superada en parte el 2026-08-29**: la salida de React y de las islands sigue
> vigente, pero el reveal ya no usa GSAP ni `astro:page-load` — es CSS puro y no
> depende del JavaScript. Ver la entrada del 2026-08-29.

> Registrada retroactivamente el 2026-08-11. El cambio se hizo en junio (commit `2b74656`) y no llegó a documentarse: durante dos meses `ARCHITECTURE.md` describió una island que ya no existía.

**Decisión**: `LogoReveal` deja de ser una island de React (`LogoReveal.tsx` con `client:load`) y pasa a ser `src/components/LogoReveal.astro` con un `<script>` GSAP. Se retira la integración `@astrojs/react` de `astro.config.mjs`. **El proyecto se queda sin ninguna island de React.**

**Alternativa considerada**: mantener la island y optimizar su carga.

**Motivo**: era el único island del proyecto y arrastraba React al bundle de la home (~182 KB). El overlay se renderiza en servidor, así que cubre la pantalla desde el primer paint igual que hacía el SSR del island, y el `<script>` reproduce la intro en `astro:page-load` — el mismo patrón que ya usaban todas las secciones. Comportamiento preservado: reveal en cold-load, F5 y navegación SPA a la home.

**Regla resultante**:
- Todo el JS de cliente vive en `<script>` de componentes `.astro`, con GSAP importado desde `src/scripts/ph-text-animations.ts`.
- **No existe ningún patrón de island vigente en el repo.** Si en el futuro hiciera falta una (estado de React genuino), es una decisión nueva que se registra aquí — no la aplicación de un patrón existente.
- Queda **superada** la regla de 2026-04-21 en la parte que decía "`LogoReveal.tsx` sigue siendo la única island GSAP activa".

**Cierre (2026-08-11)**: `react`, `react-dom`, `@astrojs/react`, `@types/react` y `@types/react-dom` **retirados** de `package.json`. Verificado antes de borrarlos: cero imports en `src/`, y `npm ls react` confirmaba que solo se necesitaban entre ellos. Tras quitarlos, el build produce los mismos 401 archivos y un HTML idéntico salvo hashes; la única diferencia en los JS eran 5 bytes de alias del minificador, porque `@astrojs/react` arrastraba una copia duplicada de `esbuild`. `package-lock.json` adelgaza 1.157 líneas. Preview verificado: las 6 rutas responden 200 y todos los JS de la home resuelven.

---

## 2026-04-24 · Eliminar páginas de detalle + renombrar ruta a `/talentos/` + escudos en la card

**Decisión**: retirar `/jugadores/[slug]` y `/en/players/[slug]`. El grid de `/talentos/` (antes `/jugadores/`) es la única vista de roster y las tarjetas no son clicables. Los escudos de selección nacional pasan a renderizarse en la esquina superior-derecha de cada card y la escuadra dorada (antes decorativa en hover) ahora los enmarca al hacer hover como énfasis.

**Alternativa considerada**: mantener la página de detalle sin enlaces desde la grid.

**Motivo**: decisión del cliente — el perfil individual no aporta valor actualmente (sin bio, sin stats, sin social) y abrir una URL para cada jugador pone una superficie de SEO que no queremos indexar. La escuadra ganaba en expresividad si se usaba para destacar información real (el escudo) en lugar de ser pura ornamentación.

**Cambios ejecutados**:
- Borradas las páginas `[slug].astro` en ambos idiomas.
- Borrado `components/players/PlayerDetailView.astro` y la carpeta entera.
- Carpeta `src/content/` eliminada (Content Collection `players` + 4 bios `.md`) — ya no se usaba fuera del detalle.
- Renombrado `/jugadores/` → `/talentos/` y `/en/players/` → `/en/talents/`. Actualizados `navigation.ts`, `i18n/utils.ts` (sin `DYNAMIC_ROUTES`), `HomePlayersSection.astro`, canonicals y hreflang.
- `playerDetail.ts` simplificado: sin `contentHtml`, `paths`, `ModalPayload`; solo los campos que consume el card.
- `TalentsSection.astro`: añadidos `<img class="talents__badge">` por cada `nationalTeamCodes`; `.talents__corner` escalada a 32×32 alrededor de los escudos con `data-badges="0|1|2"` ajustando el ancho.
- `PortraitCard.astro` y `scripts/smoke-interactions.mjs` (dead code desde V3) eliminados.

**Supersede**: la decisión de 2026-04-19 ("Páginas de jugador implementadas (PlayerDetailView)") queda revertida.

---

## 2026-04-24 · Roster en JSON plano (salida definitiva de Content Collections)

**Decisión**: el roster vive únicamente en `data/jugadores.json` + `data/entrenadores.json`. La Content Collection `players` (bios Markdown) se retira.

**Motivo**: los 4 bios existentes no se usaban en ningún sitio tras eliminar la vista de detalle. Mantener la collection añadía carga cognitiva (dos fuentes de verdad posibles) y requería el schema Zod sin beneficio. JSON + helper en `lib/playerDetail.ts` es más directo.

**Condición de cambio**: si vuelve a haber contenido editorial por jugador (bio, media, timeline) y se reintroduce una vista de detalle, reevaluar Content Collections o una tabla de contenido separada.

---

## 2026-04-23 · Jugadores ocultos con campo `hidden` en jugadores.json

**Decisión**: los jugadores pendientes de firma se marcan con `"hidden": true` en `data/jugadores.json`. `getAllRosterEntries()` en `playerDetail.ts` los filtra en build time — no llegan al navegador.

**Alternativas consideradas**: eliminarlos temporalmente del JSON, o moverlos a un archivo separado `jugadores_pendientes.json`.

**Motivo**: conservar los datos en el mismo archivo facilita activarlos en el futuro (basta con quitar `"hidden": true`). El filtro en build time es más limpio que hacerlo en cliente y no añade JS al bundle.

**Regla resultante**: para ocultar un jugador temporalmente, añadir `"hidden": true` a su entrada en `jugadores.json`. Para reactivarlo, eliminar el campo.

---

## 2026-04-22 · Hero con vídeo de fondo — 2 variantes mp4 + poster

> ⚠️ **SUPERADA**: el 2026-09-22 cambiaron el vídeo y sus archivos, y el
> 2026-09-25 el hero pasó a una foto fija. Ver esas dos entradas.

**Decisión**: el hero usa vídeo de fondo con dos variantes de calidad servidas localmente (`video-ph-web-480.mp4` para móvil, `*-720.mp4` para tablet/desktop) y un poster estático (`hero-poster.webp`) como LCP real. El master `video-ph-web.mp4` vive en `assets/source-media/` y solo se usa como input de `scripts/build-hero-variants.mjs`.

**Alternativa considerada**: una sola variante de vídeo.

**Motivo**: dos variantes permiten servir resolución adecuada según dispositivo sin sobrecargar móviles. `preload="metadata"` evita que el browser descargue el vídeo completo en page load.

**Fuente de verdad**: `src/lib/heroMedia.ts` centraliza rutas y configuración del vídeo. Las páginas/secciones no hardcodean rutas directamente.

**Nota**: el Logo Reveal (`LogoReveal.tsx`) coexiste con el vídeo — ejecuta la animación de entrada sobre el vídeo, no en lugar de él.

> Aclaración 2026-08-11: esta decisión del hero **sigue vigente**; solo cambió el archivo del reveal, que hoy es `LogoReveal.astro` (ver 2026-06-25).

---

## 2026-04-22 · LogoReveal re-trigger en F5 via is-document-reload.ts

> **SUPERADA el 2026-08-29**: `src/lib/is-document-reload.ts` está **borrado**. Ya no
> hace falta detectar el F5: cuándo sale la intro lo decide una marca de tiempo en
> `localStorage` (una vez cada 18 h), leída antes del primer pintado. Ver la entrada
> del 2026-08-29.

**Decisión**: detectar recargas de página (F5) con `src/lib/is-document-reload.ts` para re-ejecutar el Logo Reveal en esos casos.

**Problema**: con View Transitions (ClientRouter), el reveal se ejecutaba correctamente en la primera visita pero no en F5 desde la home ni en cold-load, porque el estado del componente React persistía.

**Motivo**: la experiencia de entrada es parte de la marca — el reveal debe verse siempre que el usuario llegue "de cero" a la home.

**Regla resultante**: el helper lee `performance.navigation.type` para distinguir recarga de navegación interna. En navegación interna (SPA transitions) el reveal no se re-ejecuta.

---

## 2026-04-21 · Sistema de animaciones en scripts/ (GSAP fuera de islands)

> ⚠️ **SUPERADA PARCIALMENTE por la decisión de 2026-06-25.** La parte de esta entrada que habla de islands `.tsx` ya no aplica: no queda ninguna en el repo. Lo vigente es que **todo** el GSAP va en `<script>` de `.astro`.

**Decisión**: ampliar el uso de GSAP a `src/scripts/ph-text-animations.ts`, importado como `<script>` vanilla desde componentes `.astro`. La regla anterior de "GSAP solo en islands" queda actualizada.

**Alternativa considerada**: mantener islands React para cada sección animada.

**Motivo**: crear una island por sección (HomeAbout, HomeServices, Talents…) es overhead innecesario cuando la animación no necesita estado React. Un `<script>` vanilla con `import` de GSAP es suficiente y más ligero.

**Regla actualizada**: GSAP puede vivir en `scripts/ph-text-animations.ts` (importado desde `<script>` en `.astro`) O en islands `.tsx` para casos que requieran estado React. `LogoReveal.tsx` sigue siendo la única island GSAP activa. No importar GSAP directamente en el markup de un `.astro` — siempre a través de `ph-text-animations.ts` o una island.

---

## 2026-04-20 · About V3 — absorción de /equipo en #equipo

**Decisión**: eliminar las páginas `/equipo` y `/en/team` como rutas independientes. El contenido del equipo (21 integrantes) pasa a ser una sección dentro de `/sobre-nosotros` y `/en/about`, con anchor `#equipo`.

**Alternativa considerada**: mantener `/equipo` como página separada.

**Motivo**: el equipo es parte de la identidad de la agencia, no un producto separado. Unificarlo en About refuerza el storytelling y evita que el usuario tenga que navegar a otra página para ver algo que forma parte de "quiénes somos".

**Cambios**:
- `TeamSection.astro` eliminado.
- Las rutas `/equipo` y `/en/team` redirigen a `#equipo`.
- `src/lib/teamMembers.ts` creado como fuente de verdad de los 21 integrantes.
- Nav: la entrada "Equipo/Team" eliminada.

---

## 2026-04-20 · Datos de dominio centralizados en lib/

**Decisión**: crear `src/lib/` como capa de datos y helpers de dominio. Las páginas y secciones consumen estos módulos; no acceden directamente a Content Collections salvo en las páginas de jugador.

> Aclaración 2026-08-11: la decisión de `src/lib/` como capa de datos **sigue vigente**. La salvedad ya no aplica: ni las Content Collections ni las páginas de jugador existen desde el 2026-04-24. Hoy `src/lib/` es la única vía de acceso a los datos.

**Módulos creados**:
- `playerDetail.ts` — payloads enriquecidos de jugadores (foto, paths i18n, metadata)
- `teamMembers.ts` — 21 integrantes del equipo
- `servicesItems.ts` — 6 pilares de servicios
- `heroMedia.ts` — configuración del vídeo hero
- `navigation.ts` — items de navegación
- `social.ts`, `countryLabels.ts`, `nationalTeamBadge.ts`, etc.

**Motivo**: evitar que cada página tenga su propia lógica de acceso a datos. Un cambio en la estructura de un jugador o un servicio se hace en un solo lugar.

---

## 2026-04-19 · Páginas de jugador implementadas (PlayerDetailView)

> ⚠️ **REVERTIDA por la decisión de 2026-04-24.** No hay páginas individuales por jugador: `/talentos/` es un grid único con tarjetas no clicables. `PlayerDetailView.astro` y las rutas `[slug]` están borradas. **No proponer resucitarlas.**

**Decisión**: implementar `/jugadores/[slug]` y `/en/players/[slug]` con `PlayerDetailView.astro`. Los datos se preparan en `playerDetail.ts` y se pasan como props.

**Alternativa considerada**: modal en la grid de jugadores.

**Motivo**: las páginas de detalle tienen URL propia — mejor para SEO, enlaces directos y compartir perfiles. El modal se descartó porque no permite indexación.

**Regla resultante**: `buildPlayerDetailPayloadsForLang(lang)` en `playerDetail.ts` es el punto de entrada para datos de jugador. No reconstruir esa lógica en las páginas.

---

## 2026-04-18 · V3 redesign — estructura del home

**Decisión**: rediseñar el home con una estructura editorial — Hero (vídeo + claim grande) → Players → Services (accordion) → About → Contact. Se eliminan secciones experimentales anteriores (Stats Strip, Manifesto, 360).

**Alternativa considerada**: mantener la estructura del intento anterior en `feat/homepage-redesign-v2` (Stats → Players → Manifesto → Services → 360 → About).

**Motivo**: la estructura de la rama anterior era demasiado densa para una primera visita. La V3 prioriza claridad y jerarquía: primero el producto (jugadores), luego la propuesta (servicios), luego quiénes somos.

---

## 2026-04-17 · /servicios como página independiente con 6 pilares

**Decisión**: crear `/servicios` y `/en/services` como páginas propias con `ServicesSection.astro`. Los 6 pilares del servicio (prensa, rendimiento, media, family office, psicólogo, plan de acción) son la estructura definitiva.

**Alternativa considerada**: mantener servicios solo en el home.

**Motivo**: los servicios son el producto principal de la agencia — merecen URL propia, SEO independiente y espacio para desarrollar cada pilar. El home tiene una versión resumida (accordion) que enlaza a la página completa.

---

## 2026-04-15 · ClientRouter en lugar de ViewTransitions

**Decisión**: usar `<ClientRouter />` de `astro:transitions` en lugar del import anterior de `ViewTransitions`.

**Motivo**: cambio de API en Astro 5 — `ViewTransitions` fue renombrado a `ClientRouter`. El comportamiento es idéntico; es solo una actualización de nombre requerida para evitar warnings de deprecación.

---

## 2026-03-16 · Convención única para slugs de Content Collections

> ⚠️ **OBSOLETA desde 2026-04-24.** Las Content Collections se retiraron (`src/content/` ya no existe). El roster vive en `data/*.json` y el slug se deriva con `slugify(name)` en `src/lib/playerDetail.ts`.

**Decisión**: usar una única convención en todo el proyecto:
- Para rutas dinámicas de jugadores, el slug se obtiene con `entry.id.replace(/\.md$/, '')`

**Alternativa descartada**: mezclar criterios con `entry.slug` en parte del código/documentación.

**Motivo**: evita contradicciones entre documentos y código. Refleja el comportamiento actual que ya usa el proyecto.

**Regla resultante**: no documentar ni implementar una segunda vía para slugs mientras esta convención siga activa.

---

## 2026-03-16 · Overrides de seguridad en dependencias transitivas

**Decisión**: fijar versiones parcheadas en `package.json` mediante `overrides`:
- `devalue: 5.6.4`
- `svgo: 4.0.1`

**Alternativa descartada**: esperar a que la cadena transitoria se actualice sola.

**Motivo**: reducir riesgo en dependencias de producción sin romper compatibilidad del stack actual (Astro 5.x). Eliminar la vulnerabilidad `high` reportada en `svgo`.

---

## 2026-03-05 · Routing i18n con mapeo explícito ES ↔ EN

**Decisión**: mapear rutas estáticas y dinámicas en `src/i18n/utils.ts` con `STATIC_ROUTES` y `DYNAMIC_ROUTES`.

**Motivo**: garantizar `hreflang` correcto y alternates válidos. Evitar enlaces EN inválidos para rutas traducidas (por ejemplo, `/sobre-nosotros` → `/en/about`).

**Regla resultante**: toda ruta nueva debe añadirse a `STATIC_ROUTES` o `DYNAMIC_ROUTES` en `utils.ts`.

---

## 2026-03-05 · Menú mobile en Header con script vanilla (sin island)

**Decisión**: implementar el menú mobile en `Header.astro` con HTML/CSS + script vanilla, sin crear una Island React.

**Alternativa considerada**: `src/components/islands/MobileMenu.tsx` con `client:load`.

**Motivo**: el comportamiento es un toggle simple de UI. Usar React aumentaría JS cliente innecesario.

**Regla resultante**: para interacciones simples de layout/navigation, preferir script vanilla en `.astro`. Reservar Islands para lógica/animación compleja.

---

## 2026-03-05 · Normalización de nombre de familia tipográfica (Sohne)

**Decisión**: usar `Sohne` (sin umlaut) como nombre único de `font-family` en `@font-face`, variables CSS y Tailwind.

**Motivo**: el nombre de familia debe coincidir exactamente entre definición y consumo para evitar fallback silencioso a Helvetica.

**Regla resultante**: cualquier referencia a la fuente display en código debe usar `Sohne`.

---

## 2026-03-03 · Slug único para jugadores en ambos idiomas

**Decisión**: el slug de cada jugador es el mismo en las rutas ES y EN.

**Alternativa considerada**: slugs traducidos (`/en/players/charles-smith`).

**Motivo**: con ~60 jugadores, mantener dos slugs por jugador introduce riesgo de desincronización sin ningún beneficio real. Los nombres propios no se traducen.

---

## 2026-03-03 · `prefixDefaultLocale: false` (ES sin prefijo)

**Decisión**: el español, idioma principal de la agencia, no lleva prefijo de ruta.

**Alternativa considerada**: prefijo `/es/` para todos los idiomas.

**Motivo**: URLs más limpias para el mercado principal.

---

## 2026-03-03 · Content Collections sobre CMS headless

> ⚠️ **SUPERADA por la decisión de 2026-04-24.** Se salió de Content Collections: el roster es JSON plano en `data/`. La conclusión de fondo (no meter un CMS headless) sigue vigente; el mecanismo elegido, no.

**Decisión**: contenido gestionado en archivos Markdown en el propio repo.

**Alternativa considerada**: Sanity, Storyblok o Contentful.

**Motivo**: único editor técnico, sin necesidad de interfaz gráfica. Sin coste de CMS, tipado automático vía Zod, historial en Git.

**Condición de cambio**: si un editor no técnico necesita actualizar jugadores, migrar a Sanity. La estructura de Collections está diseñada para que esa migración sea directa.

---

## 2026-03-03 · GSAP restringido — regla original

**Decisión original (2026-03-03)**: GSAP solo en `src/components/islands/` con `client:visible`.

**Actualización (2026-04-21)**: regla ampliada — GSAP también puede usarse en `src/scripts/ph-text-animations.ts` importado como `<script>` vanilla desde `.astro`. Ver decisión de 2026-04-21.

---

## 2026-03-03 · Fuentes servidas localmente

**Decisión**: fuentes desde `/public/fonts/` via `@font-face` en `global.css`.

**Alternativa considerada**: Google Fonts.

**Motivo**: elimina round-trips externos. Cloudflare Pages sirve los assets con headers de caché óptimos. Mejora LCP, elimina FOIT.

---

## 2026-03-03 · slug eliminado del schema de Content Collections

> ⚠️ **OBSOLETA desde 2026-04-24.** Ya no hay Content Collections ni schema Zod en el proyecto.

**Decisión**: el campo `slug` no se declara en el schema Zod ni en el frontmatter.

**Motivo**: `slug` es un campo reservado de Astro Content Collections — declararlo provoca error de validación en el build.

**Regla resultante**: el nombre del archivo es el slug. `carlos-garcia.md` → slug `carlos-garcia`. En Astro 5, `entry.id` incluye la extensión `.md` — usar siempre `entry.id.replace(/\.md$/, '')`.

---

## 2026-03-03 · Sistema de diseño — paleta y tokens

**Decisión**: tres colores únicos. `#0d0f12` base, `#ffffff` texto, `#D6B25E` acento único.

**Motivo**: brandboard explícito — minimalismo premium, "charcoal authority". Más colores diluirían el estándar visual.

**Regla resultante**: el oro se usa como acento, nunca como relleno o fondo.

---

## 2026-03-03 · Tipografía — Söhne + Helvetica

**Decisión**: Söhne (Klim) para títulos. Helvetica para cuerpo y UI. Self-hosted.

**Corrección**: el brandboard indicaba Canela. El cliente confirmó que la fuente correcta es Söhne.

**Nota**: Söhne es de pago. Licencia en https://klim.co.nz/retail-fonts/sohne/ — obligatoria antes de producción. Los archivos actuales son de prueba.

---

## 2026-03-03 · @astrojs/react en astro.config.mjs

> ⚠️ **REVERTIDA por la decisión de 2026-06-25.** `@astrojs/react` ya no está en `astro.config.mjs`, y el paquete se retiró de `package.json` el 2026-08-11. No hay renderer de React en el proyecto.

**Decisión**: integrar `@astrojs/react` como renderer.

**Motivo**: Astro requiere un renderer explícito para hidratar `.tsx` como Islands. Sin esto, `client:load` en `LogoReveal.tsx` no funciona.

**Implicación**: cualquier Island futura en `.tsx` ya tiene soporte sin configuración adicional.
