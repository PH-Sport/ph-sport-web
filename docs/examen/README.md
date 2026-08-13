# El examen — ¿sobrevive el contexto a un `git clone`?

Este proyecto se trabaja desde varios dispositivos, con agentes distintos y
sesiones que empiezan de cero. La única garantía aceptable es que **todo lo
necesario viaje en el repositorio**: nada de memorias locales, notas en una
máquina concreta ni paquetes copiados a mano entre ordenadores.

Eso es una afirmación comprobable, y esto es cómo se comprueba.

## Por qué hace falta un tercero

La calidad de una documentación **no se puede juzgar desde dentro**. Quien la
escribió rellena los huecos con lo que recuerda, así que lee coherencia donde un
recién llegado encuentra un vacío. Ni Mario ni el agente que trabajó la sesión
sirven como jueces: ambos saben demasiado.

El instrumento válido es un agente **frío**: mismo repositorio, cero contexto
previo. Si él llega a la conclusión correcta, la documentación la contiene. Si
no, no la contiene — por convencidos que estemos de lo contrario.

## Las dos mitades (y por qué no es un examen rotatorio a secas)

Rotar todas las preguntas sería un error. Hay dos cosas distintas que medir:

| | **Regresión** | **Descubrimiento** |
|---|---|---|
| Qué busca | Que las trampas ya pagadas sigan cubiertas | Huecos que nadie sabe que existen |
| Preguntas | Banco fijo, en `banco.md`. Se corren **todas** | Un encargo abierto **nuevo cada vez** |
| Resultado | Nota `aciertos/total` | Lista de huecos, sin nota |
| Coste | Bajo | Alto |

La mitad de **regresión es el smoke test de la documentación**, y funciona igual
que el `.githooks/pre-push` de este repo: no descubre nada nuevo, impide que se
rompa lo que ya funcionaba. Por eso no rota — se corre entera, siempre.

La mitad de **descubrimiento** sí rota, y por obligación: un encargo ya usado ha
dejado su respuesta escrita en el repo y no vuelve a discriminar. Cada ejecución
estrena encargo.

## La nota

`aciertos / total` de la mitad de regresión. Nada de un 0-100 juzgado a ojo: la
misma documentación puntuada dos días distintos por un juez daría cifras
distintas, y un número así no dice **qué** arreglar.

**El umbral es el 100 %, no el 90.** Es un banco de regresión: cada fallo es una
trampa concreta, ya pagada una vez, que vuelve a estar viva. Un 11 de 12 no es
un notable — es un agente frío a punto de repetir un error que costó meses.

Hay un tercer resultado además de acierta/falla: **acierta sin citar la fuente**.
No suspende, pero se anota. Significa que la información está en el repo y el
agente llegó a ella por instinto o por suerte; el siguiente puede no tenerla. Un
patrón de aciertos sin fuente señala documentación *presente pero enterrada*.

## Cómo se ejecuta

1. **Clon aislado**, fuera del directorio de trabajo:

   ```sh
   npm run examen:clon
   ```

   Crea un clon del `HEAD` actual en una ruta temporal nueva. Esto importa: la
   memoria de un agente va indexada por la ruta del proyecto, así que una ruta
   que no ha visto nunca es un agente sin recuerdos. Y un clon solo contiene
   ficheros versionados — ni `.env`, ni `.superpowers/`, ni `node_modules/`.

2. **Agente frío.** Se lanza un subagente **de contexto nuevo** (nunca un fork
   de la sesión en curso: heredaría justo lo que queremos que no tenga), con el
   directorio del clon y una sola instrucción: el encargo, tal cual está escrito
   en `banco.md`, **sin añadir pistas ni vocabulario del repo**.

3. **Un encargo por agente.** Compartir agente entre encargos contamina: lo
   aprendido en el primero le sirve para el segundo, y deja de medirse la
   documentación.

4. **No se ejecuta el encargo.** Lo que se evalúa es lo que el agente *dice que
   va a hacer* y con qué lo justifica. No hace falta que escriba código.

## Cómo se corrige

Cada encargo de `banco.md` trae escrito qué es acertar y qué es suspender. La
corrección es binaria a propósito: si hay que deliberar si una respuesta "medio
vale", el criterio está mal redactado y hay que afilarlo, no negociar la nota.

## Qué se hace con el resultado

Un fallo **no es culpa del agente: es un defecto de la documentación**, y se
trata como un bug.

1. Se escribe lo que faltaba, en el documento vivo que le corresponda
   (`CLAUDE.md`, `ARCHITECTURE.md`, `DECISIONS.md`).
2. Se anota la ejecución en `historial.md`: fecha, commit, nota, qué falló y qué
   se escribió a raíz de ello.
3. Se vuelve a correr **ese** encargo sobre el commit nuevo. Si ahora acierta, el
   agujero está tapado.

## Cómo crece el banco

Los encargos **no se inventan**. Entran por dos puertas, y las dos son hechos:

- **Un hueco encontrado por la mitad de descubrimiento** se documenta, y el
  encargo que lo destapó pasa al banco de regresión.
- **Un error caro cometido durante el trabajo real** — algo que costó una tarde,
  o que se hizo dos veces — se documenta y entra al banco.

Es la misma disciplina que `DECISIONS.md`: el registro sale de lo que pasó, no de
lo que se nos ocurre que podría pasar.

## Lo que este examen no mide

Conviene tenerlo presente para no confiar de más en un aprobado:

- **No detecta documentación equivocada.** Si un documento afirma algo falso, el
  agente frío se equivocará con seguridad y coherencia — y sonará convincente.
- **No mide criterio ni gusto.** Mide que no se repita un error conocido.
- **No cubre lo que a nadie se le ocurrió preguntar.** Para eso está la mitad de
  descubrimiento, y ni así es exhaustiva.
- **Se quema al aprobarlo.** Una vez la documentación responde explícitamente a un
  encargo, ese encargo deja de distinguir entre comprender y leer. Sigue valiendo
  como regresión, pero si la nota se convierte en el objetivo, acabaremos
  escribiendo documentación optimizada para el examen. La nota es un **suelo**,
  nunca un techo.

Y un límite de fondo: **el 100 % del contexto no es alcanzable**, ni falta que
hace. Hay cosas que viven legítimamente en la cabeza de Mario — la relación con
el cliente, el presupuesto, por qué se confía en un proveedor. La meta que sí es
alcanzable y sí se mide es más estrecha, y es la que persigue este examen:

> **que nadie que llegue frío repita un error que ya pagamos.**
