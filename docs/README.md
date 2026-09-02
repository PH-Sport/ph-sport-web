# docs/

Dos cosas distintas viven aquí, y confundirlas es el error caro:

| Ruta | Qué es | ¿Fiable hoy? |
|---|---|---|
| `trampas-conocidas.md` | El porqué de las trampas que `CLAUDE.md` indexa: mediciones y qué se probó ya sin éxito | ✅ Sí — documentación viva |
| `hallazgos-abiertos.md` | Bugs sin arreglar y trabajo medido sin hacer, con su estado. Se borra la entrada al cerrarla | ✅ Sí — documentación viva |
| `rendimiento.md` | Histórico de auditorías, cifras de referencia y **cómo medir**. Se mantiene | ✅ Sí — documentación viva |
| `examen/` | Comprueba que el contexto viaja por Git: se examina a un agente frío con el repo recién clonado. Método, banco de encargos e historial | ✅ Sí — documentación viva |
| `historico/` | Specs y planes de features concretas, tal como se escribieron | ⛔️ No — foto del día que se escribieron |

## Por qué `historico/` no se actualiza

Son el registro de **cómo se llegó hasta aquí**: qué se planteó, qué alternativas
se descartaron y con qué criterio. Que un plan de abril mencione un archivo que
hoy ya no existe es correcto — así era entonces. Reescribirlos destruiría
justamente lo que los hace útiles.

**Para saber cómo está algo hoy**: el código, o `ARCHITECTURE.md`, `DECISIONS.md`
y `CLAUDE.md` en la raíz del repo.

Se llamaba `superpowers/` hasta el 2026-08-11. El nombre venía de la herramienta
que generó los documentos, no de su contenido, y no decía lo único que importa
saber antes de leerlos: que están congelados.

## Añadir aquí

- ¿Se mantendrá al día? → `docs/` a secas, y entra en la tabla de arriba y en el
  mapa de documentación de `CLAUDE.md`.
- ¿Es la foto de un momento? → `historico/`, con fecha en el nombre
  (`AAAA-MM-DD-tema.md`) y sin volver a tocarlo.
