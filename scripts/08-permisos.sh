#!/usr/bin/env bash
source "$(dirname "$0")/_lib.sh"

say "Acto 8 — Seguridad: permisos del equipo"
note "Modelo de permisos por capacidad. En clinica importa: los tickets pueden tocar datos sensibles."
pause

step "deploy-ops.json  -> solo despliega (git/npm/aws); destructivo y secretos DENEGADOS"
step ".kiro/security/permissions.yaml -> ejemplo de referencia (scope global)"
note "Precedencia estricta: deny > ask > allow. Un deny gana en cualquier scope."
pause

say "Pruebalo:"
note "kiro-cli --v3 chat --agent deploy-ops"
note '  pidele desplegar (corre git/npm/aws) y luego  rm -rf /  (denegado por sus permisos)'
