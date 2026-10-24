---
name: dynamodb-tickets
description: Modela los datos del sistema de tickets biomedicos en DynamoDB (tickets, equipos, areas, historial de mantenimiento) con single-table design. Usala al disenar el esquema de datos.
---
# Modelado DynamoDB — Tickets de equipos biomedicos

## Objetivo
Single-table design que soporte: crear tickets de falla, listarlos por area, estado y
prioridad, consultar el inventario de equipos y su historial de mantenimiento.

## Entidades
- **Equipo** (EQUIPO): tipo, marca, modelo, placa/activo, ubicacion, estado operativo.
- **Ticket** (TICKET): equipo afectado, area solicitante, descripcion, prioridad, estado, responsable.
- **Area** (AREA): urgencias, UCI, cirugia, hospitalizacion, laboratorio, imagenes…
- **Evento de historial** (HIST): cada cambio de estado o intervencion sobre un equipo/ticket.

## Tabla unica (claves)
| Entidad | PK | SK |
|---|---|---|
| Equipo | `EQUIPO#<activo>` | `META` |
| Ticket | `EQUIPO#<activo>` | `TICKET#<fecha>#<ticketId>` |
| Ticket (por id) | `TICKET#<ticketId>` | `META` |
| Evento historial | `TICKET#<ticketId>` | `HIST#<timestamp>` |
| Area (indice) | `AREA#<area>` | `TICKET#<fecha>#<ticketId>` |

## Indices secundarios globales (GSI)
- **GSI1 (por estado):** `GSI1PK = ESTADO#<estado>`, `GSI1SK = PRIORIDAD#<n>#<fecha>`
  → tablero: tickets abiertos ordenados por prioridad clinica.
- **GSI2 (por prioridad):** `GSI2PK = PRIORIDAD#<critica|alta|media|baja>`, `GSI2SK = <fecha>`
  → cola de atencion de biomedica.

## Patrones de acceso
1. Crear ticket de falla de un equipo → `PutItem` (TICKET#id META + duplicado bajo EQUIPO#activo).
2. Listar tickets abiertos por prioridad → `Query` GSI1 con `ESTADO#abierto`.
3. Ver historial de un equipo → `Query` `EQUIPO#<activo>` con prefijo `TICKET#`.
4. Ver trazabilidad de un ticket → `Query` `TICKET#<id>` con prefijo `HIST#`.
5. Cola de criticos → `Query` GSI2 con `PRIORIDAD#critica`.

## Reglas
- Mapear prioridad a un numero para ordenar: critica=1, alta=2, media=3, baja=4.
- Nunca almacenar datos de historia clinica del paciente en el item del ticket.
- Guardar `createdAt`/`updatedAt` en ISO 8601, zona America/Bogota.
