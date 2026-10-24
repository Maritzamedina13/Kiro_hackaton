#!/usr/bin/env bash
source "$(dirname "$0")/_lib.sh"

say "Acto 7 — Herramientas externas (MCP)"
note "MCP conecta Kiro a servidores externos. Config en .kiro/settings/mcp.json."
pause

step "Conectado el MCP remoto de draw.io (solo URL, sin instalar nada)"
note "Aporta create_diagram y get_drawio_reference."
pause

say "Pruebalo:"
note "kiro-cli --v3 chat   ->   /mcp list"
note '  "Dibuja el flujo del ticket: Area -> Registro -> Priorizacion por riesgo -> Asignacion a biomedica -> Reparacion -> Cierre, en Mermaid."'
