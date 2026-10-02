# Hallazgos abiertos

Bugs conocidos sin arreglar y trabajo medido sin hacer. Están escritos aquí para
que nadie los rediagnostique desde cero ni los atribuya a la causa equivocada.

El índice corto vive en `CLAUDE.md`, con lo que hay que saber **antes de tocar
nada**. Aquí está el detalle y el estado.

**Al cerrar uno, se borra de aquí y del índice de `CLAUDE.md`**, en el mismo commit
que lo arregla.

## Bloqueados por una decisión que no es técnica

### ⚠️ Söhne se sirve en producción con los `.woff2` de prueba de Klim

La licencia **no está comprada** (confirmado por Mario el 2026-08-11) y la web está
publicada desde abril. Es un **incumplimiento de licencia abierto**, no un pendiente
estético.

Salida: comprar en <https://klim.co.nz/retail-fonts/sohne/> y sustituir los archivos
de `public/fonts/sohne/`.

**No tocar la tipografía ni proponer alternativas sin hablarlo con Mario**: cambiar
de fuente altera la identidad de marca, y es decisión suya, no técnica.

**Los archivos de prueba no traen letras acentuadas** (medido el 2026-10-01 con
Chromium, preguntando al navegador qué fuente pinta cada carácter). Solo traen las
letras sin tilde. Las acentuadas del español y del italiano (á, é, ñ, ó, à, è, ì,
ò, ù…), el apóstrofo tipográfico, la raya y el símbolo de grado salen en la
fuente de reserva: Helvetica Neue en Mac, Arial en Windows. En los títulos se nota
como letras sueltas de otro dibujo (la «ó» del titular «Representar con
propósito» de `/sobre-nosotros`). Pasa desde que se
publicó la web y se arregla con la misma compra: los archivos con licencia traen
el juego completo.

**Las cursivas de los titulares son sintéticas** (visto el 2026-10-01 al revisar
las cabeceras de Talentos, Servicios y Sobre nosotros). No hay ningún
`@font-face` de Söhne cursiva, así que «roster», «campo» o «Representar» son la
redonda inclinada por el navegador, no una cursiva dibujada. Con la compra,
añadir el peso cursivo que se use (Buch Kursiv) y declararlo con
`font-style: italic`.

### Coste del snapshot del `ClientRouter` en páginas pesadas

`/talentos`, 116 tarjetas cuando se midió. **Desde el 2026-09-25 son 51**: las
cifras de aquí y de `rendimiento.md` son anteriores a ese recorte y habría que
volver a medir antes de decidir nada. Identificado en junio, **sin hacer a propósito por riesgo
alto**: tocar la View Transition ahí puede romper la fluidez que costó dos
auditorías. **No abordarlo sin que Mario lo supervise.**

Detalle en [`rendimiento.md`](rendimiento.md).

## Diagnosticados, con la causa equivocada ya descartada

### Sitelinks de Google mezclando ES y EN

El marcado está **verificado correcto** (`lang` por página, hreflang recíproco). Los
sitelinks los elige Google y no hay control directo. No perseguirlo.

## Pendientes acotados

### 12 jugadores con el club sin confirmar (2026-09-03)

El 2026-09-03 se cotejó `data/jugadores.json` con la ficha de la agencia PHSPORT en
Transfermarkt (<https://www.transfermarkt.es/phsport/beraterfirma/berater/8087>).
De ahí salieron 48 desajustes de club: 29 se verificaron contra el comunicado
oficial del club o prensa deportiva y se aplicaron (commit `3f0668e`), 22 eran solo
filial contra club matriz —el fichero nombra siempre el matriz, decisión de Mario— y
**estos 16 quedaron sin cerrar, a la espera de que el equipo de PH los valide**.
El 2026-09-21 se cerraron tres (Abdoulaye Keita y Dani Rebollo al AVS, confirmado
por prensa portuguesa; Adrián Martín al Getafe B, confirmado por Mario). El
2026-09-25 se cerró Santi Pallarés (CE Europa, lo que dice el campograma) y
quedan 12.

**Transfermarkt dice otra cosa y no hay fuente que lo decida** (9). Primera columna,
lo que dice hoy la web:

| Jugador | En la web | En Transfermarkt |
|---|---|---|
| Héctor Peña | CD Numancia | Racing Club Portuense |
| Yeray Izquierdo | UD Barbastro | UE Cornellà |
| Unai Ordóñez | Real Madrid CF | CD Basconia B |
| Miguel Serrano | Atlético de Madrid | Sin equipo |
| Jordi Ortega | CE Sabadell FC | Atlètic Lleida / UE Olot |
| Tomás Méndez | SC União Torreense | Sevilla FC Juvenil A |
| Janick Buyla | *(vacío)* | Lusitano GC |
| Hugo Buyla | *(vacío)* | CF América U21 |
| Txus Alba *(oculto)* | CD Lugo | Sin equipo |

En **Tomás Méndez** se sospecha que Transfermarkt mezcla a dos jugadores distintos:
un Tomás Méndez del juvenil del Sevilla y un Tomás Mendes portugués del Torreense.

**Aquí el que falla es Transfermarkt, no la web** (3). No tocar estas tres fichas:

| Jugador | En la web (correcto) | En Transfermarkt | Comprobación |
|---|---|---|---|
| Lawson Sunderland | FC Dordrecht | Sin equipo | ESPN, Sofascore y la Premier League lo mantienen en el Dordrecht, con contrato hasta 2027 |
| Adrián Vidican | Real Betis Balompié | Sin equipo | el Betis lo lista en la plantilla de su Juvenil LN |
| Jorge Rajado | Real Madrid CF | Sin equipo | fichó por el Madrid el 2026-09-02; ya aplicado |

**Por qué esto importa más allá de estas 16 fichas**: Transfermarkt **no es una
fuente verificada**, sus datos los editan usuarios. La asignación de agencia es lo
menos fiable de todo —su ficha lista 73 jugadores y el repo tiene 117 visibles—, y
las categorías inferiores van con retraso. Sirve para levantar sospechas, nunca para
aplicar cambios a ciegas: si se hubiera hecho, se habría borrado el club de tres
jugadores que sí lo tienen.


### Fotos de talentos en AVIF: más lentas con 4G lento (2026-10-01)

Consecuencia medida del paso a AVIF 90 (`DECISIONS.md`, 2026-10-01), pendiente de que
Mario decida. Simulado en Chrome de escritorio, no en un móvil real: Android de gama
media (412 px a 2,625×, recibe la variante de 720), CPU ×4, «Slow 4G» de DevTools
(1,6 Mbps, 150 ms) y bajando por el grid a 400 px por segundo:

| | WebP 85 (antes) | AVIF 90 (ahora) |
|---|---|---|
| Primeras cuatro fotos cargadas | 2,2-3,0 s | 4,2-4,6 s |
| Tarjetas vacías más de 1 s al bajar | 1 de 51 | 23 de 51, y 6 sin cargar al terminar |
| Espera más larga | 1,5 s | 9,8 s |
| Fotos descargadas | 2,6 MB | 4,4 MB (sin completar) |

El LCP no cambia (1,7-1,8 s): es el fondo de la cabecera, no una tarjeta. El coste de
decodificar es parecido (7 frente a 6 ms por foto con CPU ×4), aunque esa emulación no
frena del todo la decodificación. **El problema es la red, no el procesador.**

Propuesta hecha a Mario, sin aplicar: AVIF 80 solo para la variante de 720. Medido al
tamaño en que la pinta ese móvil (483 px), AVIF 80 y AVIF 90 quedan casi iguales (SSIM
cara 0,989 frente a 0,991; pecho 0,971 frente a 0,975; WebP 85: 0,976 y 0,946), y esa
variante pasaría de ~109 a ~59 KB, lo que pesaba el WebP. Si se aplica, repetir esta
misma simulación para confirmarlo.

### Backlog de rendimiento (medido el 2026-08-18)

Todo verificado con cifras, no estimado. Detalle en [`rendimiento.md`](rendimiento.md).
Por rentabilidad, de mayor a menor:

1. Los diccionarios `i18n` completos viajan en el JS del header para usar **ocho
   cadenas**.
2. Cuatro imágenes con margen de compresión real.

Dos puntos de esta lista quedaron sin objeto el 2026-10-01, al retirar GSAP con el
rediseño: ScrollTrigger cargado en las cuatro páginas para un solo uso, y el tirón
de 217-359 ms al entrar en `/sobre-nosotros` por los 135 spans que se animaban con
desenfoque. No se han vuelto a medir las páginas después del cambio.

### SEO pendiente (P1/P2)

- Analítica sin cookies (Plausible o GA4).
- Un `public/llms.txt` para buscadores con IA.
- Una página `/faq` con preguntas y respuestas literales.
- Auditar los `alt=""` de Header, Footer y Hero para confirmar que son decorativos.

### Fondo animado y paneles esmerilados: sin medir en un móvil real (2026-10-01, ampliado el 2026-10-02)

El fondo en directo (`src/scripts/ph-ambient.ts`) está comprobado en Chromium y
WebKit con Playwright, en escritorio y con un iPhone 14 y un Pixel 7 emulados:
arranca, se pausa con la pestaña oculta, queda fijo con movimiento reducido y
libera su contexto al navegar. **No se ha medido el coste en un móvil real**: ni
batería ni temperatura tras unos minutos con la página abierta, ni si un móvil
modesto mantiene la fluidez al hacer scroll.

Desde el 2026-10-02 el coste es mayor que en las versiones anteriores:

- el fondo está en todas las páginas salvo las legales, a pantalla completa;
- Neón y Velo hacen más cálculos por píxel que las demás (sin medir cuánto se nota);
- los paneles están esmerilados también en móvil (decisión de Mario), así que el
  navegador redesenfoca la animación detrás de cada panel en cada fotograma.

Si hiciera falta aligerar, de más barata a más visible:

1. Quitar el esmerilado en móvil (`--ph-panel-blur: none` bajo un `@media` de
   puntero grueso) y dejar el 60 % de opacidad.
2. Bajar la resolución interna (`scale` de cada escena y `MAX_DPR`).
3. Sacar del bombo la escena que más cueste.

### Textos en italiano sin revisión nativa (2026-10-01)

La versión italiana (`src/i18n/it.ts`, `DECISIONS.md` 2026-10-01) la tradujo
un agente de IA desde el español, y no la ha leído nadie que hable italiano.
**Antes de llevarla a producción tiene que revisarla un nativo**: una traducción
automática puede ser correcta y aun así sonar rara en el sector del fútbol.

Puntos que conviene que mire con atención:

- El claim: «I marchi contano, ma sono le persone a segnare». Juega con
  *segnare*, que es marcar un gol y dejar huella, como el «marcan» del original.
- Anglicismos que se dejaron a propósito, como en español: *roster*, *brand
  personale*, *performance*, *scouting*, *Family Office*.
- Cargos del equipo: «Dto. Fútbol» pasó a «Area Calcio», como se nombran los
  departamentos en los clubes italianos.

Al cerrarlo, quitar el aviso de la cabecera de `it.ts`, la nota de `README.md` y
las de `ARCHITECTURE.md` (i18n, «Páginas» y «Pendientes»).

### Vídeo del hero: sin probar en un iPhone real (2026-10-01)

El vídeo renderizado del neón sustituyó a la foto (`DECISIONS.md`, 2026-10-01):
la resolución ya no depende de un original. El titular sí vuelve a compartir
sitio con la parte baja del logo en los planos cercanos de pantallas 16:10, por
decisión de Mario (logo centrado; misma fecha). Queda:

- **Nada se ha visto en un iPhone real.** Comprobado en Chromium y en WebKit (el
  motor de Safari) con Playwright, en escritorio a 1440×900 y con un Pixel 7 y
  un iPhone 14 emulados: cada motor elige su códec (H.264 y HEVC) y su encuadre,
  el encendido da paso al bucle a los 3 s y, con movimiento reducido, se queda
  el póster encendido sin descargar vídeo. Falta en el dispositivo: que en modo
  de bajo consumo, que bloquea la reproducción automática, se vea el póster
  encendido y no el apagado; y que, mientras carga, el `<video>` sin datos deje
  ver el póster de debajo (la misma duda que tenía el vídeo del 2026-09-22).
  Tampoco se ha probado **cambiar de pestaña del navegador o de app y volver**:
  no se puede reproducir con Playwright. Si en el iPhone el rótulo se queda
  parado así (no al navegar por la web, que ya está arreglado), el sospechoso es
  que Safari pausa el vídeo al ocultar la página y no lo reanuda, porque no lleva
  `autoplay`; se arreglaría reanudándolo en `visibilitychange`.
- **En pantallas retina grandes el apaisado se amplía.** Es de 1920×1080: en un
  portátil de 2.880 px físicos se pinta a 1,5×. El brillo del neón lo disimula.
  Si hiciera falta, el render admite cualquier tamaño: subir `FORMATS` en
  `scripts/build-hero-neon.mjs` a 2560×1440, a costa de más bytes.

### Rediseño: sin probar en un móvil real (2026-10-01)

El rediseño se ha comprobado en Chromium con Playwright, en escritorio y a 390 px
de ancho: sin desbordes ni errores de consola. **No se ha visto en un iPhone ni en
un Android reales.** Lo que más puede cambiar allí: los desenfoques de entrada del
contenido (`filter: blur`) en móviles modestos y el menú móvil que crece desde la
cápsula.

### Filtros de Talentos y detalles de móvil: pendientes de la revisión del 2026-10-02

La revisión de diseño del 2026-10-02 (`DECISIONS.md`, «Contra el aspecto de
plantilla») dejó esto para la ronda siguiente, a petición de Mario. Comprobado
con Playwright; ya pasaba antes del rediseño:

- **Los desplegables de Talentos no dicen qué filtro hay puesto.** Tras elegir
  «Jugadores» u ordenar de la Z a la A, los botones siguen diciendo «Ver» y
  «Orden». Propuesta: mostrar el valor («Ver · Jugadores»).
- **«Entrenadores» da siempre 0 resultados**: el único entrenador está `on-hold`.
  El aviso dice «No hay resultados para tu búsqueda» aunque no se haya buscado
  nada. Propuesta: ocultar la opción mientras no haya ninguno visible. Un aviso
  distinto sería texto nuevo y necesita el visto bueno de Mario.
- **En móvil, las pestañas del Plan de acción de la portada se cortan**
  («Rendimie…») sin señal de que se deslizan. Propuesta: partirlas en dos filas o
  usar el desplegable (`.ph-select`).
