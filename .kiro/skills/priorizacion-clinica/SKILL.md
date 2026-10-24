---
name: priorizacion-clinica
description: Reglas para priorizar tickets de fallas en equipos biomedicos por riesgo clinico y asignar el SLA de atencion. Usala al decidir la prioridad o el orden de atencion de un ticket.
---
# Priorizacion por riesgo clinico — Tickets biomedicos

## Principio
La prioridad de un ticket NO depende solo del equipo, sino del **riesgo para el paciente**
si ese equipo falla en su contexto de uso actual.

## Matriz de prioridad
| Prioridad | Cuando aplica | SLA de respuesta |
|---|---|---|
| `critica` | Equipo de soporte vital en uso en UCI, urgencias o quirofano (ventilador, desfibrilador, monitor, maquina de anestesia) sin respaldo inmediato | < 30 min |
| `alta` | Equipo asistencial necesario sin redundancia disponible en el area | < 2 h |
| `media` | Equipo con respaldo o reemplazo disponible | < 24 h |
| `baja` | Falla menor, estetica o mantenimiento preventivo | < 72 h |

## Preguntas para clasificar
1. ¿El equipo esta conectado o en uso con un paciente ahora mismo?
2. ¿Es un equipo de soporte vital?
3. ¿Hay un equipo de respaldo disponible en el area?
4. ¿La falla compromete la seguridad del paciente o del operador?

Si 1 y 2 son "si" y 3 es "no" → **critica**.

## Escalamiento
- Un ticket `critica` abierto mas alla del SLA se escala al jefe de Ingenieria Biomedica
  y al coordinador del area.
- Un equipo con fallas recurrentes (3+ tickets en 30 dias) se marca para evaluacion de baja.

## Ejemplos
- Ventilador en UCI que apaga alarmas → **critica**.
- Monitor en consulta externa con pantalla intermitente, hay otro disponible → **media**.
- Autoclave de esterilizacion fuera de servicio sin respaldo → **alta** (frena cirugias).
