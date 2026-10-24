#!/usr/bin/env bash
# Utilidades compartidas por los scripts del taller.
# Pausa entre pasos salvo que WORKSHOP_NOWAIT=1.
set -euo pipefail

pause() {
  if [ "${WORKSHOP_NOWAIT:-0}" = "1" ]; then return 0; fi
  printf '\n  (Enter para continuar) '
  read -r _
}

say()  { printf '\n\033[1;36m%s\033[0m\n' "$*"; }
step() { printf '  \033[0;32m- %s\033[0m\n' "$*"; }
note() { printf '  \033[0;33m%s\033[0m\n' "$*"; }
