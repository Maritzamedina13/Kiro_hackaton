---
inclusion: always
---
# Tech — Stack del Sistema de Tickets Biomédicos

## Stack
- **Frontend:** React + TypeScript (Vite). UI de reporte y tablero de tickets.
- **Backend:** Python + FastAPI. API REST de tickets, equipos y áreas.
- **Base de datos:** DynamoDB (single-table design).
- **Infraestructura:** AWS serverless — API Gateway + Lambda + DynamoDB.
- **Despliegue:** AWS (Amplify / SAM según el caso).

## Convenciones
- Idioma de respuesta y de los comentarios de código: **español**.
- Nombres de variables y funciones en inglés; mensajes al usuario en español.
- Validación de entrada en el backend con Pydantic.
- Manejo de errores explícito; nunca filtrar stack traces al cliente.
- Fechas en ISO 8601 y zona horaria `America/Bogota`.

## Seguridad
- Nunca leer ni exponer archivos de secretos (`.env`, `*.pem`, `secrets/**`).
- No registrar datos sensibles en logs.
- Autenticación por área/rol (quién puede abrir, asignar y cerrar tickets).

## Estilo de API (tickets)
- `POST /tickets` — crear ticket de falla
- `GET /tickets` — listar / filtrar por área, estado, prioridad
- `GET /tickets/{id}` — detalle
- `PATCH /tickets/{id}` — cambiar estado / asignar
- `GET /equipos` — inventario de equipos biomédicos
