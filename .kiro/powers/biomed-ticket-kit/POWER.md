---
name: "biomed-ticket-kit"
displayName: "Biomed Ticket Starter Kit"
description: "Equipo y buenas practicas para construir un sistema de tickets de fallas en equipos biomedicos sobre AWS serverless"
keywords: ["tickets", "biomedica", "equipos", "mantenimiento", "clinica", "dynamodb", "soporte vital"]
---
# Biomed Ticket Starter Kit

## Onboarding
Este power empaqueta el conocimiento, los flujos y las herramientas para construir un
**sistema de tickets de equipos biomedicos** para una clinica de segundo nivel. Las areas
(urgencias, UCI, cirugia, hospitalizacion, laboratorio, imagenes) reportan fallas y danos;
Ingenieria Biomedica prioriza por riesgo clinico, atiende y cierra con evidencia.

## Steering Instructions
- Responde siempre en espanol.
- Respeta el ciclo de vida del ticket: abierto -> asignado -> en_reparacion ->
  en_espera_repuesto -> cerrado.
- Prioriza por riesgo clinico: critica (soporte vital en uso) > alta > media > baja.
- Nunca almacenes ni expongas datos de historia clinica del paciente en el ticket.
- Stack: React + FastAPI + DynamoDB sobre AWS serverless.

## Workflow: De la idea al MVP
1. El **arquitecto** propone la arquitectura serverless y el modelo de datos.
2. El **backend-dev** implementa la API de tickets (crear, listar, asignar, cambiar estado).
3. El **frontend-dev** construye el formulario de reporte y el tablero con prioridad.
4. El **reviewer** audita seguridad (datos sensibles) y la logica de priorizacion.
5. El **deploy-ops** despliega a AWS.

## Best Practices
- Registra toda intervencion como evento de historial (trazabilidad del equipo).
- Marca equipos con 3+ fallas en 30 dias para evaluacion de baja.
- Escala los tickets criticos que superen su SLA al jefe de biomedica.
- Usa el MCP de draw.io para diagramar arquitectura, flujo del ticket y modelo de datos.
