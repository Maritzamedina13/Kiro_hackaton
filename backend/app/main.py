"""API REST del sistema de tickets biomédicos (FastAPI + Mangum para Lambda).

Endpoints (ver tech.md):
- POST   /tickets        crear ticket de falla
- GET    /tickets        listar / filtrar por área, estado, prioridad
- GET    /tickets/{id}   detalle + historial
- PATCH  /tickets/{id}   cambiar estado / asignar
- GET    /equipos        inventario de equipos
- POST   /equipos        registrar equipo

Manejo de errores explícito: nunca se filtran stack traces al cliente.
"""
from __future__ import annotations

import logging
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app import config, db
from app.models import (
    Area,
    EquipoIn,
    EstadoTicket,
    Prioridad,
    TicketCreate,
    TicketUpdate,
)

logger = logging.getLogger("biomed-tickets")
logger.setLevel(logging.INFO)

app = FastAPI(
    title="Tickets Biomédicos",
    description="API de reporte y seguimiento de fallas en equipos biomédicos.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health", tags=["infra"])
def health() -> dict:
    """Chequeo de salud para API Gateway / monitoreo."""
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Equipos
# ---------------------------------------------------------------------------
@app.get("/equipos", tags=["equipos"])
def get_equipos() -> list[dict]:
    """Inventario de equipos biomédicos."""
    try:
        return db.listar_equipos()
    except Exception:
        logger.exception("Error listando equipos")
        raise HTTPException(status_code=500, detail="No se pudo consultar el inventario.")


@app.post("/equipos", status_code=status.HTTP_201_CREATED, tags=["equipos"])
def post_equipo(equipo: EquipoIn) -> dict:
    """Registra un equipo en el inventario."""
    try:
        return db.crear_equipo(equipo)
    except Exception:
        logger.exception("Error creando equipo")
        raise HTTPException(status_code=500, detail="No se pudo registrar el equipo.")


# ---------------------------------------------------------------------------
# Tickets
# ---------------------------------------------------------------------------
@app.post("/tickets", status_code=status.HTTP_201_CREATED, tags=["tickets"])
def post_ticket(ticket: TicketCreate) -> dict:
    """Crea un ticket de falla. La prioridad se calcula por riesgo clínico."""
    try:
        return db.crear_ticket(ticket)
    except Exception:
        logger.exception("Error creando ticket")
        raise HTTPException(status_code=500, detail="No se pudo crear el ticket.")


@app.get("/tickets", tags=["tickets"])
def get_tickets(
    estado: Optional[EstadoTicket] = Query(default=None),
    prioridad: Optional[Prioridad] = Query(default=None),
    area: Optional[Area] = Query(default=None),
) -> list[dict]:
    """Lista tickets. Filtra por estado, prioridad o área (en ese orden de preferencia)."""
    try:
        if estado is not None:
            return db.listar_tickets_por_estado(estado)
        if prioridad is not None:
            return db.listar_tickets_por_prioridad(prioridad)
        if area is not None:
            return db.listar_tickets_por_area(area.value)
        return db.listar_todos_los_tickets()
    except Exception:
        logger.exception("Error listando tickets")
        raise HTTPException(status_code=500, detail="No se pudieron consultar los tickets.")


@app.get("/tickets/{ticket_id}", tags=["tickets"])
def get_ticket(ticket_id: str) -> dict:
    """Detalle de un ticket con su historial de trazabilidad."""
    try:
        ticket = db.obtener_ticket(ticket_id)
        if ticket is None:
            raise HTTPException(status_code=404, detail="Ticket no encontrado.")
        historial = db.listar_historial(ticket_id)
        return {"ticket": ticket, "historial": historial}
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error obteniendo ticket")
        raise HTTPException(status_code=500, detail="No se pudo consultar el ticket.")


@app.patch("/tickets/{ticket_id}", tags=["tickets"])
def patch_ticket(ticket_id: str, cambios: TicketUpdate) -> dict:
    """Cambia estado, asigna responsable o ajusta la prioridad de un ticket."""
    try:
        actualizado = db.actualizar_ticket(ticket_id, cambios, autor=cambios.asignado_a)
        if actualizado is None:
            raise HTTPException(status_code=404, detail="Ticket no encontrado.")
        return actualizado
    except HTTPException:
        raise
    except Exception:
        logger.exception("Error actualizando ticket")
        raise HTTPException(status_code=500, detail="No se pudo actualizar el ticket.")


# Adaptador para AWS Lambda (API Gateway -> ASGI).
handler = Mangum(app)
