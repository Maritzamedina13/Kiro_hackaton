---
inclusion: always
---
# Producto — Sistema de Tickets de Equipos Biomédicos

## Visión
Sistema de tickets para que las diferentes áreas de una **clínica de segundo nivel**
reporten **fallas y daños** en dispositivos y equipos biomédicos, y para que el equipo
de **Ingeniería Biomédica** los priorice, atienda, dé seguimiento y cierre con evidencia.

La clínica cuenta con médicos generales y especialistas básicos (pediatría,
ginecoobstetricia, cirugía general, medicina interna) para hospitalización y
procedimientos de mayor resolución que el primer nivel.

## Idioma
Responde siempre en **español**.

## Áreas solicitantes (quién abre tickets)
- Urgencias
- UCI / Cuidados intensivos
- Cirugía / Quirófanos
- Hospitalización
- Consulta externa
- Laboratorio clínico
- Imágenes diagnósticas
- Esterilización (central de equipos)

## Tipos de equipo biomédico
- Monitores de signos vitales
- Ventiladores / Respiradores
- Bombas de infusión
- Desfibriladores
- Incubadoras y cunas de calor radiante
- Electrobisturí
- Máquinas de anestesia
- Equipos de imágenes (ecógrafos, Rx portátil)
- Autoclaves / esterilizadores

## Ciclo de vida del ticket (estados)
1. `abierto` — el área reporta la falla
2. `asignado` — biomédica asigna a un técnico/ingeniero
3. `en_reparacion` — intervención en curso
4. `en_espera_repuesto` — bloqueado esperando parte o proveedor
5. `cerrado` — resuelto, con evidencia y verificación

## Prioridad por riesgo clínico
| Prioridad | Criterio | SLA de respuesta |
|---|---|---|
| `critica` | Equipo de soporte vital en uso (ventilador, desfibrilador, monitor en UCI/urgencias) | Inmediata (< 30 min) |
| `alta` | Equipo asistencial sin redundancia disponible | < 2 horas |
| `media` | Equipo con respaldo o reemplazo disponible | < 24 horas |
| `baja` | Falla menor, estética o preventiva | < 72 horas |

## Datos mínimos de un ticket
- Área solicitante y persona que reporta
- Equipo afectado (tipo, marca, modelo, placa/activo, ubicación)
- Descripción de la falla o daño
- Prioridad sugerida (la valida biomédica)
- Evidencia (foto / descripción del comportamiento)

## Trazabilidad y datos sensibles
Los tickets pueden asociarse a un procedimiento o ubicación con **datos sensibles**.
No se almacena historia clínica del paciente en el ticket; solo referencia mínima
del equipo y del evento. Nunca expongas identificadores de paciente en logs.
