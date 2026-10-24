#!/usr/bin/env bash
source "$(dirname "$0")/_lib.sh"

say "Acto 0 — Montamos la oficina (.kiro/)"
note "Creamos la estructura de configuracion de Kiro para el sistema de tickets biomedicos."
pause

for d in steering agents skills hooks settings security powers specs; do
  mkdir -p ".kiro/$d"
  step "Creada carpeta .kiro/$d"
done

[ -f .kiro/settings/mcp.json ] || printf '{\n  "mcpServers": {}\n}\n' > .kiro/settings/mcp.json
step "settings/mcp.json listo (vacio; se llena en el Acto 7)"

say "Oficina montada. Scope de proyecto: .kiro/ aplica solo a este proyecto."
