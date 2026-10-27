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

`/talentos`, 116 tarjetas cuando se midió. **Desde el 2026-10-05 son 62**: las
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

### 9 jugadores con el club sin confirmar (2026-09-03)

El 2026-09-03 se cotejó `data/jugadores.json` con la ficha de la agencia PHSPORT en
Transfermarkt (<https://www.transfermarkt.es/phsport/beraterfirma/berater/8087>).
De ahí salieron 48 desajustes de club: 29 se verificaron contra el comunicado
oficial del club o prensa deportiva y se aplicaron (commit `3f0668e`), 22 eran solo
filial contra club matriz —el fichero nombra siempre el matriz, decisión de Mario— y
**estos 16 quedaron sin cerrar, a la espera de que el equipo de PH los valide**.
El 2026-09-21 se cerraron tres (Abdoulaye Keita y Dani Rebollo al AVS, confirmado
por prensa portuguesa; Adrián Martín al Getafe B, confirmado por Mario). El
2026-09-25 se cerró Santi Pallarés (CE Europa, lo que dice el campograma). El
2026-10-05 se cerró Lawson Sunderland: aquí acertaba Transfermarkt, porque
rescindió con el Dordrecht el 26-08-2026 y sigue sin equipo; se ocultó. El
2026-10-20 se cerró Jannick Buyla: Lusitano GC, confirmado por Mario y por su foto de
estudio. Ese mismo día se cerró Tomás Méndez, y aquí acertaba Transfermarkt: es el de la
cantera del Sevilla FC. Se llegó a cambiar a «Tomás Mendes» del Torreense por la foto
que llegó, que era de otra persona; PH lo corrigió el 2026-10-22 y la foto se retiró. Quedan 9.

**Transfermarkt dice otra cosa y no hay fuente que lo decida** (7). Primera columna,
lo que dice hoy la web:

| Jugador | En la web | En Transfermarkt |
|---|---|---|
| Héctor Peña | CD Numancia | Racing Club Portuense |
| Yeray Izquierdo | UD Barbastro | UE Cornellà |
| Unai Ordóñez | Real Madrid CF | CD Basconia B |
| Miguel Serrano | Atlético de Madrid | Sin equipo |
| Jordi Ortega | CE Sabadell FC | Atlètic Lleida / UE Olot |
| Hugo Buyla | *(vacío)* | CF América U21 |
| Txus Alba *(oculto)* | CD Lugo | Sin equipo |

**Aquí el que falla es Transfermarkt, no la web** (2). No tocar estas dos fichas:

| Jugador | En la web (correcto) | En Transfermarkt | Comprobación |
|---|---|---|---|
| Adrián Vidican | Real Betis Balompié | Sin equipo | el Betis lo lista en la plantilla de su Juvenil LN |
| Jorge Rajado | Real Madrid CF | Sin equipo | fichó por el Madrid el 2026-09-02; ya aplicado |

**Por qué esto importa más allá de estas 16 fichas**: Transfermarkt **no es una
fuente verificada**, sus datos los editan usuarios. La asignación de agencia es lo
menos fiable de todo —su ficha lista 73 jugadores y el repo tiene 117 visibles—, y
las categorías inferiores van con retraso. Sirve para levantar sospechas, nunca para
aplicar cambios a ciegas: si se hubiera hecho, se habría borrado el club de tres
jugadores que sí lo tienen.


### Fichas de Profesionales incompletas (2026-10-15)

Entraron en la web con la lista «Senior» de PH aunque les faltaran datos, por
decisión de Mario (`DECISIONS.md`, 2026-10-15). Lo que hace falta de cada uno:

| Jugador | Falta |
|---|---|
| Billy Gee | Nada urgente: su nombre completo es William Peter Gee (FBref); en la ficha va «Billy», que es como se le conoce. Club desde el 2026-10-20: Železničar Pančevo (FK Železničar Pančevo, SuperLiga serbia; en la ficha sin el «FK», por decisión de Mario), donde firmó por tres temporadas al salir del Norwich. Se puso antes el de Lajkovac deduciéndolo por el «1927» del escudo, y era un error |

Resuelto el 2026-10-20: foto de estudio y club de Billy Gee y Jannick Buyla (la ficha decía «Janick»;
Mario confirmó «Jannick» y se renombraron ficha y foto juntas).
Resuelto el 2026-10-19: las
fotos de estudio de Luciano Rodríguez, Adrián Martín, Mateo Sciancalepore, Alejandro
Santiago, Agus Moreno, Hugo García e Israel Motos (y las de Kaua do Vale y Gonzalo Rodríguez, esta ya con la del Danubio, esa misma noche), y el club de Luciano, que es el
Club Nacional de Football (su foto lleva el escudo «C.N. de F.»). Pendiente además: si «Lluis Quintero» es la
forma correcta del nombre de Luis Quintero, renombrar ficha y foto juntas.

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
2. ~~ScrollTrigger se carga en las cuatro páginas para dos usos en el hero~~ — en la
   rama de la variante A ya no aplica: las entradas son CSS con un
   `IntersectionObserver` y ScrollTrigger se usa para lo ligado al scroll de
   verdad (las cintas, la salida del rótulo del hero y la banda del modelo). El
   empuje de los pilares de Servicios salió de ScrollTrigger el 2026-10-15: ahora
   lo mueve `ph-live-photos.ts`, sin GSAP.
3. Cuatro imágenes con margen de compresión real.

El tirón al entrar en `/sobre-nosotros` (135 spans con `filter: blur()`) se
resolvió el 2026-10-02: los párrafos ya no entran palabra a palabra. Cifras en
[`rendimiento.md`](rendimiento.md).

### SEO pendiente (P1/P2)

- Analítica sin cookies (Plausible o GA4).
- Un `public/llms.txt` para buscadores con IA.
- Una página `/faq` con preguntas y respuestas literales.
- Auditar los `alt=""` de Header, Footer y Hero para confirmar que son decorativos.

### Variante A «Retransmisión»: sin probar en un móvil real (2026-10-03)

En `preview` desde el 2026-10-05 y en producción desde el 2026-10-15 (`DECISIONS.md`,
2026-10-03, 2026-10-05 y 2026-10-15; sustituye
al «Marcador» del 2026-10-02, que tampoco se llegó a probar en un
móvil). Comprobado con Playwright sobre el build, en Chromium y WebKit, a 360, 390,
768, 1024 y 1440 px en los tres idiomas: desbordes, la diagonal de las placas
contra su texto, movimiento reducido, JS bloqueado, consola en las 16 páginas,
las interacciones una a una y la cortinilla en los dos sentidos (por eventos de
animación: no sale en capturas). **Falta un iPhone y un Android de verdad**:

- Que las entradas por `clip-path` aguanten fluidas en `/talentos` en un móvil
  modesto, con el fondo animado detrás: entran hasta ~10 fichas a la vez (foto y
  dos placas cada una). Si tira, la primera palanca es quitar el recorte de las
  placas de las fichas y dejar solo el de la foto.
- Que la cortinilla (una placa del tamaño de la diagonal de la pantalla) y el menú
  móvil vayan a 60 fps.
- **Lo que Playwright no puede comprobar**: en WebKit el tabulador no lleva el foco
  a los enlaces (es el ajuste por defecto de macOS), así que el foco atrapado del
  menú móvil y el paso por las opciones de idioma se han comprobado solo en
  Chromium. Y el `<noscript>` que despliega los paneles de Servicios sin JS no se
  aplica en el modo «sin JavaScript» de Playwright (el analizador sigue tratando
  `<noscript>` como texto): se comprobó que la regla está en el HTML servido.

### Sin control para pausar el movimiento continuo (WCAG 2.2.2)

Visto al investigar el rediseño, el 2026-10-02; **ya pasaba antes**. El vídeo del
hero va en bucle y el fondo animado (en la variante A, en todas las páginas salvo
las legales desde el 2026-10-05) se mueve mientras la página está abierta, más de 5 s y junto a otro contenido, sin un botón
para pararlos. Desde el 2026-10-15 se suman **las fotos de la oficina** de los
pilares de Servicios y de Contacto, que respiran en reposo mientras están en
pantalla (`DECISIONS.md`, 2026-10-15): lo pidió Mario sabiendo que esto seguía
abierto. (Aparte de esos tres, en la variante A no hay bucles: la línea del
bug «Scroll» se llena con el scroll en vez de correr sola, y las cintas solo se
mueven con el scroll.) Con `prefers-reduced-motion` se paran todos, pero WCAG 2.2.2 (nivel
A) pide además un control en la página. Arreglarlo es añadir un botón, y su texto
no existe en las traducciones: es decisión de Mario. Un mismo botón pararía los
tres: el fondo (`ph-ambient.ts`), las fotos (`ph-live-photos.ts`, que ya se paran
solas fuera de la vista) y el bucle del hero.

### Fondos animados de sección: sin medir en un móvil real (2026-10-01)

**En la variante A, desde el 2026-10-05**, el fondo está en todas las páginas salvo
las legales, también en la portada bajo el vídeo, y sale de un bombo de cinco
escenas (`DECISIONS.md`). Neón y Velo, que vienen de Mochi, tampoco se han medido
en un móvil real.

Los fondos en directo de Talentos, Servicios y Sobre nosotros (`DECISIONS.md`,
2026-10-01) están comprobados en Chromium y WebKit con Playwright, en escritorio y
con un iPhone 14 y un Pixel 7 emulados: arrancan, se pausan fuera de la vista,
quedan fijos con movimiento reducido y liberan su contexto al navegar. **No se ha
medido el coste en un móvil real**: ni batería ni temperatura tras unos minutos
con la página abierta, ni si un móvil modesto mantiene la fluidez. Desde la
cabecera de sección legible (2026-10-01) el lienzo es el fondo de toda la página:
ocupa la pantalla entera y se dibuja mientras la página está abierta, no solo con
la cabecera a la vista, así que el coste es mayor que en las versiones anteriores.
Si hiciera falta aligerar, la primera palanca es la resolución interna (`scale` de
cada escena y `MAX_DPR` en `src/scripts/ph-ambient.ts`); la segunda, volver a
pausarlo cuando el titular queda lejos, aunque entonces la luz dejaría de estar
siempre, que es lo que se pidió.

### Fotos de la oficina: originales pequeños y sin probar en un móvil real (2026-10-15)

Las fotos de los pilares de Servicios y de Contacto (`DECISIONS.md`, 2026-10-15)
salen de lo que había: cuatro fotos de la sesión a 1600×1066 —sin datos de cámara,
con pinta de haber pasado por WhatsApp— y dos fotogramas de 1920×1080 del vídeo
de la oficina (la escultura de Rendimiento sustituyó a un tercero, la pared, el
2026-10-27). Enteras se ven bien, pero en un portátil retina un pilar se pinta
a 1,2-1,3× y se nota algo blando. **Lo que lo arregla son los originales del
fotógrafo** (fotos y vídeo). Al cambiarlos no basta con volver a pasar
`npm run assets:oficina`: las máscaras de la luz están medidas sobre estas fotos
(cajas, umbrales y las siluetas de la mesa y de la escultura en
`scripts/build-office-photos.mjs`) y hay que revisar sus cifras.

Comprobado con Playwright sobre el build en Chromium, WebKit y a 390 px de ancho:
las cinco fotos y la de Contacto cargan, la cámara respira en reposo, la luz se
aviva con el scroll y se calma al parar, el reflejo de la tarjeta cruza al
entrar, con movimiento reducido todo queda quieto y no hay errores, también al
navegar con el ClientRouter. **No se ha visto en un móvil real**: cada fotograma
mueve la máscara de la luz de la foto que está en pantalla, que obliga a repintar
esa capa. Si en un móvil modesto tirara, la primera palanca es quitar la luz y
dejar solo la cámara (la luz empieza apagada en CSS).
La escultura (2026-10-27) se comprobó solo en Chromium, a 1280 y a 390 px: carga,
la luz cae sobre la pieza y se calienta con el scroll, sin errores. **No se ha
visto en Safari.**

### Textos en italiano sin revisión nativa (2026-10-01)

La versión italiana (`src/i18n/it.ts`, `DECISIONS.md` 2026-10-01) la tradujo
un agente de IA desde el español, y no la ha leído nadie que hable italiano.
**Está en producción desde el 2026-10-15 sin esa revisión**, por decisión de Mario
(`DECISIONS.md`, 2026-10-15): sigue haciendo falta que la lea un nativo, porque
una traducción automática puede ser correcta y aun así sonar rara en el sector
del fútbol. Lo que corrija se aplica directamente sobre producción.

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
