#!/usr/bin/env bash
source "$(dirname "$0")/_lib.sh"

say "Acto 9 — Empaquetar y compartir (Powers)"
note "Powers = bundles instalables (steering + workflows + MCP) que Kiro activa por keywords."
pause

step "Creado el power local: .kiro/powers/biomed-ticket-kit/"
note "POWER.md (onboarding + steering + workflow + best practices) y mcp.json (draw.io)."
pause

say "Comandos (CLI v3):"
note "/powers list"
note "/powers install .kiro/powers/biomed-ticket-kit"
note "/powers uninstall biomed-ticket-kit"
