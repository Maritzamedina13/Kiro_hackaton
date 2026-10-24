#!/usr/bin/env bash
source "$(dirname "$0")/_lib.sh"

say "Acto 5 — Conocimiento bajo demanda (Skills)"
note "Skills = manuales en .kiro/skills/ que se cargan solo cuando la pregunta coincide."
pause

step "dynamodb-tickets/SKILL.md     -> modelar tickets, equipos e historial en DynamoDB"
step "priorizacion-clinica/SKILL.md -> priorizar por riesgo clinico y asignar SLA"
pause

say "Pruebalo:"
note '  "Disena el esquema de datos del sistema de tickets"      (activa dynamodb-tickets)'
note '  "Como priorizo un ventilador en UCI frente a un monitor?" (activa priorizacion-clinica)'
