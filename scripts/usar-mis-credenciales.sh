#!/usr/bin/env bash
# Usa con:  source ./scripts/usar-mis-credenciales.sh
# Quita la API key del evento para poder entrar con TUS credenciales (device-flow).
unset KIRO_API_KEY AWS_BEARER_TOKEN_KIRO 2>/dev/null || true
echo "API key del evento removida de esta shell."
echo "Ahora:  kiro-cli login --use-device-flow"
