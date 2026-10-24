#!/usr/bin/env bash
source "$(dirname "$0")/_lib.sh"

say "Acto 3 — El equipo crece (mas Agents)"
note "El foco: el contraste de permisos (tools / allowedTools)."
pause

step "backend-dev.json  — leer/escribir/ejecutar -> API de tickets (FastAPI)"
step "frontend-dev.json — leer/escribir/ejecutar -> UI de reporte (React)"
step "reviewer.json     — SOLO LECTURA -> audita, no modifica"
note "El reviewer no tiene fs_write ni execute_bash: aunque le pidas 'arreglalo', no puede."
pause

say "Flujo tipico: arquitecto disena -> devs implementan -> reviewer audita."
note "Cambia de sombrero con: /agent swap <name>"
