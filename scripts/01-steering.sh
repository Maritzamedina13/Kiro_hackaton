#!/usr/bin/env bash
source "$(dirname "$0")/_lib.sh"

say "Acto 1 — Las reglas de la casa (Steering)"
note "Steering = contexto persistente del proyecto en .kiro/steering/."
pause

step "producto.md  (always)    -> vision del sistema de tickets biomedicos"
step "tech.md       (always)    -> stack: React + FastAPI + DynamoDB"
step "frontend.md   (fileMatch) -> reglas de UI al editar *.tsx/*.jsx"
pause

say "Pruebalo:"
note "kiro-cli --v3 chat"
note '  "Que stack usamos y en que idioma respondes?"  (deberia citar el stack en espanol)'
