#!/usr/bin/env bash
source "$(dirname "$0")/_lib.sh"

say "Acto 4 — El orquestador (Sub-agents)"
note "Un agente que delega tareas enfocadas a otros agentes, en paralelo."
pause

step "tech-lead.json — reparte el trabajo entre arquitecto, backend-dev, frontend-dev y reviewer"
note "Necesita la tool 'subagent' + toolsSettings.subagent.availableAgents/trustedAgents."
pause

say "Pruebalo:"
note "kiro-cli --v3 chat --agent tech-lead"
note '  "Arma el MVP del sistema de tickets: arquitecto propone, devs implementan en paralelo, reviewer audita."'
note "Vigila sub-agentes largos con Ctrl+G."
