#!/usr/bin/env bash
source "$(dirname "$0")/_lib.sh"

say "Acto 6 — Automatizacion por eventos (Hooks)"
note "Hooks = comandos/prompts que Kiro corre en puntos del ciclo de vida del agente."
pause

step "qa-tests.json    (PostToolUse) -> corre tests al escribir codigo"
step "guard-shell.json (PreToolUse)  -> BLOQUEA comandos de shell peligrosos"
note "PreToolUse es fail-closed: si el guardia falla, el tool se bloquea igual."
pause

say "Pruebalo:"
note '  pide a backend-dev crear un archivo (dispara el QA)'
note '  pide ejecutar  rm -rf /   (el guardia lo bloquea antes de correr)'
