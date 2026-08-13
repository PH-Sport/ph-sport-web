#!/bin/sh
# Prepara el clon aislado sobre el que se examina a un agente frío.
# Ver docs/examen/README.md para el método completo.
#
# Por qué un clon y no el propio directorio de trabajo:
#
#   1. La memoria de un agente va indexada por la ruta del proyecto. Una ruta que
#      no ha visto nunca es, literalmente, un agente sin recuerdos. Examinarlo
#      dentro de /Users/.../ph-sport-web le daría acceso a la memoria local, que
#      es justo aquello de lo que este examen debe demostrar que no dependemos.
#   2. Un clon solo contiene ficheros versionados: ni .env, ni .superpowers/, ni
#      node_modules/, ni capturas sueltas. Es exactamente lo que recibe alguien
#      que llega nuevo — que es lo que se está midiendo.
#
# Uso:  npm run examen:clon  [ref]     (ref por defecto: HEAD)

set -e

ref="${1:-HEAD}"
raiz="$(git rev-parse --show-toplevel)"
sha="$(git -C "$raiz" rev-parse --short "$ref")"

destino="$(mktemp -d "${TMPDIR:-/tmp}/examen-frio-XXXXXX")/repo"

git clone --quiet --no-hardlinks --single-branch "$raiz" "$destino"
git -C "$destino" checkout --quiet "$sha"

# Sin remoto: que el agente no pueda mirar el repositorio de origen ni resolver
# dudas por fuera de lo que el clon contiene.
git -C "$destino" remote remove origin 2>/dev/null || true

cat <<MSG

✓ Clon aislado listo — commit $sha

  $destino

  Siguiente paso (ver docs/examen/README.md):

  · Un subagente de CONTEXTO NUEVO por encargo. Nunca un fork de la sesión en
    curso: heredaría justo el contexto que el examen debe descartar.
  · Se le pasa el encargo tal cual está en docs/examen/banco.md, sin reformular
    ni añadir vocabulario del repo.
  · No hace falta que ejecute nada: se evalúa qué dice que hará y con qué lo
    justifica.

  Al terminar, anota la ejecución en docs/examen/historial.md y borra el clon:

  rm -rf "$(dirname "$destino")"

MSG
