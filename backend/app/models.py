"""Modelos Pydantic y enums del dominio de tickets biomédicos.

Validación de entrada en el backend (regla de tech.md): toda petición que
crea o modifica un ticket pasa por estos modelos antes de tocar la base de datos.
"""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class Area(str, Enum):
    """Áreas solicitantes que pueden abrir tickets."""

    urgencias = "urgencias"
    uci = "uci"
    cirugia = "cirugia"
    hospitalizacion = "hospitalizacion"
    consulta_externa = "consulta_externa"
    laboratorio = "laboratorio"
    imagenes = "imagenes"
    esterilizacion = "esterilizacion"


class TipoEquipo(str, Enum):
    """Tipos de equipo biomédico soportados."""

    monitor = "monitor_signos_vitales"
    ventilador = "ventilador"
    bomba_infusion = "bomba_infusion"
    desfibrilador = "desfibrilador"
    incubadora = "incubadora"
    electrobisturi = "electrobisturi"
    maquina_anestesia = "maquina_anestesia"
    equipo_imagenes = "equipo_imagenes"
    autoclave = "autoclave"


class Prioridad(str, Enum):
    """Prioridad por riesgo clínico."""

    critica = "critica"
    alta = "alta"
    media = "media"
    baja = "baja"


class EstadoTicket(str, Enum):
    """Ciclo de vida del ticket."""

    abierto = "abierto"
    asignado = "asignado"
    en_reparacion = "en_reparacion"
    en_espera_repuesto = "en_espera_repuesto"
    cerrado = "cerrado"


# Mapa de prioridad a número para ordenar en los índices (critica primero).
PRIORIDAD_ORDEN: dict[Prioridad, int] = {
    Prioridad.critica: 1,
    Prioridad.alta: 2,
    Prioridad.media: 3,
    Prioridad.baja: 4,
}


# ---------------------------------------------------------------------------
# Equipos
# ---------------------------------------------------------------------------
class EquipoBase(BaseModel):
    """Datos de un equipo biomédico del inventario."""

    tipo: TipoEquipo
    marca: str = Field(..., min_length=1, max_length=80)
    modelo: str = Field(..., min_length=1, max_length=80)
    activo: str = Field(..., min_length=1, max_length=40, description="Placa o número de activo (identificador único).")
    ubicacion: str = Field(..., min_length=1, max_length=120)
    soporte_vital: bool = Field(
        default=False,
        description="True si es un equipo de soporte vital (ventilador, desfibrilador, monitor, anestesia).",
    )


class EquipoIn(EquipoBase):
    """Payload para registrar un equipo."""


class Equipo(EquipoBase):
    """Equipo tal como se devuelve al cliente."""

    created_at: str
    updated_at: str


# ---------------------------------------------------------------------------
# Tickets
# ---------------------------------------------------------------------------
class TicketCreate(BaseModel):
    """Payload para crear un ticket de falla."""

    activo: str = Field(..., min_length=1, max_length=40, description="Activo del equipo afectado.")
    area: Area
    reportado_por: str = Field(..., min_length=1, max_length=120, description="Persona que reporta la falla.")
    descripcion: str = Field(..., min_length=5, max_length=1000, description="Descripción de la falla o daño.")
    tipo_equipo: TipoEquipo = Field(..., description="Tipo de equipo afectado.")
    soporte_vital: bool = Field(
        default=False,
        description="¿El equipo es de soporte vital?",
    )
    en_uso_con_paciente: bool = Field(
        default=False,
        description="¿El equipo está conectado o en uso con un paciente ahora mismo?",
    )
    respaldo_disponible: bool = Field(
        default=True,
        description="¿Hay un equipo de respaldo disponible en el área?",
    )
    prioridad_sugerida: Optional[Prioridad] = Field(
        default=None,
        description="Prioridad sugerida por el área (la valida biomédica).",
    )
    evidencia_url: Optional[str] = Field(
        default=None,
        max_length=500,
        description="URL o referencia de la evidencia (foto / descripción del comportamiento).",
    )


class TicketUpdate(BaseModel):
    """Payload para cambiar estado o asignar un ticket (PATCH)."""

    estado: Optional[EstadoTicket] = None
    asignado_a: Optional[str] = Field(default=None, max_length=120)
    prioridad: Optional[Prioridad] = None
    nota: Optional[str] = Field(default=None, max_length=1000, description="Nota que queda en el historial.")


class Ticket(BaseModel):
    """Ticket completo tal como se devuelve al cliente."""

    ticket_id: str
    activo: str
    tipo_equipo: TipoEquipo
    area: Area
    reportado_por: str
    descripcion: str
    prioridad: Prioridad
    estado: EstadoTicket
    asignado_a: Optional[str] = None
    evidencia_url: Optional[str] = None
    sla_minutos: int = Field(..., description="SLA de respuesta en minutos según la prioridad.")
    created_at: str
    updated_at: str


class EventoHistorial(BaseModel):
    """Evento de trazabilidad de un ticket."""

    timestamp: str
    tipo: str = Field(..., description="Tipo de evento: creacion, cambio_estado, asignacion, nota.")
    detalle: str
    autor: Optional[str] = None


def ahora_iso() -> str:
    """Devuelve el instante actual en ISO 8601, zona America/Bogota."""
    from app.config import TIMEZONE

    return datetime.now(TIMEZONE).isoformat(timespec="seconds")
