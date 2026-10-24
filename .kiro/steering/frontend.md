---
inclusion: fileMatch
fileMatchPattern: '*.tsx|*.jsx'
---
# Frontend — Reglas de UI (solo al editar *.tsx / *.jsx)

## Componentes
- React funcional + hooks. Nada de class components.
- TypeScript estricto; props tipadas, sin `any`.
- Un componente por archivo; nombres en PascalCase.

## UX del reporte de fallas
- El formulario de reporte debe ser rápido: el personal clínico tiene poco tiempo.
- Campos obligatorios mínimos: equipo, área, descripción de la falla.
- La prioridad `critica` debe ser visualmente evidente (rojo) en el tablero.
- Estados del ticket con color y etiqueta clara (abierto, asignado, en_reparacion,
  en_espera_repuesto, cerrado).

## Accesibilidad
- Todos los campos con `label` asociado.
- Contraste suficiente; no depender solo del color para transmitir prioridad.
- Navegable por teclado.

## Estado y datos
- Llamadas a la API centralizadas en una capa `services/`.
- Manejo de carga y error visible para el usuario (en español).
