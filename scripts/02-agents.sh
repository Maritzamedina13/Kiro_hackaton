#!/usr/bin/env bash
source "$(dirname "$0")/_lib.sh"

say "Acto 2 — El primer especialista (Agents)"
note "Custom Agents = JSON en .kiro/agents/ que fijan un rol."
pause

step "Creado arquitecto.json — arquitecto AWS de SOLO LECTURA"
note "Tools: fs_read, grep, glob, code. No escribe ni ejecuta: seguridad por diseno."
pause

say "Pruebalo:"
note "kiro-cli --v3 chat --agent arquitecto"
note '  "Propon la arquitectura del sistema de tickets biomedicos y explicamela sin tecnicismos."'
