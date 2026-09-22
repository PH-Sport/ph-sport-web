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

### Coste del snapshot del `ClientRouter` en páginas pesadas

`/talentos`, 116 tarjetas cuando se midió. **Desde el 2026-09-21 son 31** (cifra
provisional: el bloque de escudos importantes está aparcado y Mario decide el
total): las
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

### 13 jugadores con el club sin confirmar (2026-09-03)

El 2026-09-03 se cotejó `data/jugadores.json` con la ficha de la agencia PHSPORT en
Transfermarkt (<https://www.transfermarkt.es/phsport/beraterfirma/berater/8087>).
De ahí salieron 48 desajustes de club: 29 se verificaron contra el comunicado
oficial del club o prensa deportiva y se aplicaron (commit `3f0668e`), 22 eran solo
filial contra club matriz —el fichero nombra siempre el matriz, decisión de Mario— y
**estos 16 quedaron sin cerrar, a la espera de que el equipo de PH los valide**.
El 2026-09-21 se cerraron tres (Abdoulaye Keita y Dani Rebollo al AVS, confirmado
por prensa portuguesa; Adrián Martín al Getafe B, confirmado por Mario) y quedan 13.

**Transfermarkt dice otra cosa y no hay fuente que lo decida** (10). Primera columna,
lo que dice hoy la web:

| Jugador | En la web | En Transfermarkt |
|---|---|---|
| Héctor Peña | CD Numancia | Racing Club Portuense |
| Yeray Izquierdo | UD Barbastro | UE Cornellà |
| Santi Pallarés | UD Las Palmas | CE Europa |
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


### Fotos de jugadores con la camiseta del club anterior (2026-09-04)

Encargo de Mario, en curso. El 2026-09-03 se actualizó el club de 29 jugadores
(commit `3f0668e`), pero **la foto sigue siendo la del club de antes**, así que en
`/talentos` hay tarjetas que dicen un club y enseñan la camiseta de otro.

**Desde el 2026-09-21 solo se muestra una selección de 31** (`DECISIONS.md`,
misma fecha; el bloque de escudos importantes está aparcado): lo pendiente de
esta sección solo importa para los que estén visibles. De ellos, cuatro no
tienen foto ninguna (Abde Raihani, Dani Rebollo, Gonzalo Rodríguez y Fran
Manzanara) y Mario va a revisar las del resto.

**Hechas (6)**: Dani Requena, Juan Cruz, Mati Barzic, Javi Hernández, Thiago Helguera
e Iker Luque.

**Lo primero que hay que retomar**, porque es trabajo ya hecho que se pierde si no se
escribe:

- **Alberto Del Moral tiene foto buena y ya localizada**, no hace falta volver a
  buscarla: partido del Hajduk Split en Poljud, `WhatsApp Image 2026-07-14 at
  13.44.15.jpeg` en su carpeta de Drive (1600×1066). Cumple el criterio entero —campo,
  cuerpo entero, balón y cara— y admite un 3:4 de 798×1064 recortando desde x=510. No
  se aplicó porque quedó pendiente del visto bueno de Mario. **No contarlo entre los
  que están sin mirar.**
- **La foto de Mati Barzic está aplicada pero corta de resolución**: 619×825, así que
  la variante de 720w que sirve la tarjeta sale **escalada** desde 619 px y se ve más
  blanda que el resto del roster. El original del que salió ese encuadre es de
  1638×2048 (`WhatsApp Image 2026-07-20 at 14.34.41 (2).jpeg`) y da para repetir el
  mismo recorte a ~1180×1573. No es urgente, pero es la única de las siete con esa
  pega.

Los 29 nombres salen de ese commit; los más visibles son los que cambiaron de acera:
Iker Luque (Atlético → Racing), Aimar García y Jorge Rajado (Atlético → Real Madrid),
Rayan Zinebi (Granada → Real Madrid) y Javi Hernández (Panathinaikos → Cerezo Osaka).

Las fotos viven en `src/assets/images/players/` (110 archivos, `nombre-apellido.jpg`
o `.jpeg`) y las resuelve `getAllRosterEntries()` en `src/lib/playerDetail.ts`, que
cae a `avatar-placeholder.svg` cuando no encuentra ninguna. No están en `public/`:
las procesa el build, así que **sustituir el archivo basta y no hay que tocar código**.

**Sustituir, no añadir**: `playerPhotos.ts` indexa por el nombre **sin extensión**, así
que dejar `dani-requena.jpg` y `dani-requena.jpeg` a la vez hace que se pisen y gane
uno u otro según el orden del glob. Si la foto nueva viene en otra extensión, se
guarda con la del archivo que ya existe.

**Renombrar a un jugador le quita la foto.** El nombre del archivo es
`slugify(row.name)`, así que pasar de `"Eneko"` a `"Eneko Ortiz"` hace que la ficha
busque `eneko-ortiz.jpeg` en vez de `eneko.jpeg`. No falla el build ni avisa nadie: la
tarjeta cae al avatar genérico en silencio. Al cambiar un nombre en `jugadores.json`
hay que renombrar el archivo de foto en el mismo commit.

Ese avatar genérico **no se puede buscar por «avatar-placeholder» en el HTML**: pesa
menos de 4 kB, así que Vite lo incrusta como `data:image/svg+xml`. Para contar cuántas
fichas se quedan sin foto hay que cruzar `jugadores.json` con el listado de
`src/assets/images/players/`, no hacer grep sobre `dist/`. A 2026-09-05 eran 13;
a 2026-09-21, con la selección de 31, son 4.

No confundir con los otros 16 jugadores de más arriba: ahí lo que está en duda es el
club, no la foto.

**De dónde salen las fotos.** Del Drive de PH, carpeta «JUGADORES PH SPORT» en
*Compartido conmigo*, con una subcarpeta por jugador titulada `NOMBRE (CLUB)`. Dos
trampas comprobadas el 2026-09-05:

- **El título de la carpeta no dice qué hay dentro.** «RAYAN ZINEBI (REAL MADRID C)»
  contiene solo fotos del Granada. La equipación se valida mirando el escudo y el
  patrocinador, nunca por el nombre de la carpeta.
- **Los nombres de archivo tampoco** (`WhatsApp Image 2026-07-20 at 20.54.31 (2).jpeg`).
  Hay que verlas. La vista de cuadrícula de Drive sirve para triar de un vistazo.

**Criterio de selección** (el que aplicó Mario al elegir las seis hechas): equipación
del club actual, cara visible y encuadre 3:4. Se prefiere acción en el campo con balón
y cuerpo entero, pero **un posado de presentación vale cuando es lo único que hay** —
Javi Hernández, Thiago Helguera e Iker Luque son de sesión de estudio o de fichaje. Y
entre dos de acción gana la del jugador aislado sobre la que tiene un rival encima.

**Siete de los que quedan no tienen ninguna foto del club nuevo en Drive** (barrido del
2026-09-05, carpeta por carpeta): Carlos Guirao, Víctor García, Jesús Bernal, Jorge
Delgado, Ognjen Teofilovic, Rayan Zinebi y Salim El-Jebari. En todos ellos el material
es del club anterior. No es que no se hayan buscado: no están. Volver a mirar cuando el
fotógrafo suba material nuevo. De los siete, a 2026-09-21 siguen visibles Carlos
Guirao, Jorge Delgado y Salim El-Jebari.

### Backlog de rendimiento (medido el 2026-08-18)

Todo verificado con cifras, no estimado. Detalle en [`rendimiento.md`](rendimiento.md).
Por rentabilidad, de mayor a menor:

1. Los diccionarios `i18n` completos viajan en el JS del header para usar **ocho
   cadenas**.
2. ScrollTrigger se carga en las cuatro páginas cuando `ScrollTrigger.create()` se
   usa **una sola vez** en todo el sitio.
3. Tirón de **217-359 ms** al entrar en `/sobre-nosotros` (135 spans animados con
   `filter: blur()`).
4. Cuatro imágenes con margen de compresión real.

### Fuga de listeners de scroll en la home

Uno nuevo por visita: `initHeroScrollCue` registra una función nueva en cada
`astro:page-load` sin quitar la anterior. Comprobado contando listeners reales:
**3 → 4 → 6**.

### SEO pendiente (P1/P2)

- Analítica sin cookies (Plausible o GA4).
- Un `public/llms.txt` para buscadores con IA.
- Una página `/faq` con preguntas y respuestas literales.
- Auditar los `alt=""` de Header, Footer y Hero para confirmar que son decorativos.

### El `<video>` del hero sin `poster`, sin comprobar en Safari ni en iPhone (2026-09-22)

Desde el vídeo nuevo, el `<video>` del hero no lleva atributo `poster` (el porqué
en `DECISIONS.md`, 2026-09-22): el póster lo pone un `<picture>` debajo, con un
recorte por pantalla. Eso da por hecho que un `<video>` con `preload="none"` y sin
`poster` **es transparente hasta que tiene un fotograma**. Es lo que dice la
especificación y lo que hace Chromium (comprobado sobre el build el mismo día,
vaciando las fuentes del vídeo y viendo el póster a través). **En Safari de
escritorio y en iPhone no se ha comprobado**, y en iOS todos los navegadores son
WebKit.

Qué mirar, en un iPhone real con la caché vacía: al entrar en la home, ¿se ve el
jardín (el póster) hasta que el vídeo arranca, o un rectángulo negro? Y con «Modo
de bajo consumo», que bloquea el autoplay: ¿se queda el póster, sin botón de play
encima? Si sale negro, el arreglo es devolver el atributo `poster` al `<video>`
apuntando al póster de escritorio y asumir esa descarga extra en móvil (76 KB), o
ponerlo por JavaScript según el `media` que aplique.
