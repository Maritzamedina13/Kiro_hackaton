"""Capa de acceso a DynamoDB (single-table design).

Esquema de claves (ver skill dynamodb-tickets):

| Entidad          | PK                    | SK                            |
|------------------|-----------------------|-------------------------------|
| Equipo           | EQUIPO#<activo>       | META                          |
| Ticket (por id)  | TICKET#<ticketId>     | META                          |
| Ticket x equipo  | EQUIPO#<activo>       | TICKET#<fecha>#<ticketId>     |
| Evento historial | TICKET#<ticketId>     | HIST#<timestamp>              |

GSI1 (por estado):    GSI1PK = ESTADO#<estado>,    GSI1SK = PRIORIDAD#<n>#<fecha>
GSI2 (por prioridad): GSI2PK = PRIORIDAD#<nivel>,  GSI2SK = <fecha>
"""
from __future__ import annotations

import uuid
from typing import Any, Optional

import boto3
from boto3.dynamodb.conditions import Key

from app import config
from app.models import (
    PRIORIDAD_ORDEN,
    EquipoIn,
    EstadoTicket,
    Prioridad,
    TicketCreate,
    TicketUpdate,
    ahora_iso,
)
from app.priorizacion import resolver_prioridad, sla_de

_resource = None


def _table():
    """Devuelve el recurso de la tabla, creándolo perezosamente."""
    global _resource
    if _resource is None:
        kwargs: dict[str, Any] = {"region_name": config.AWS_REGION}
        if config.DYNAMODB_ENDPOINT:
            kwargs["endpoint_url"] = config.DYNAMODB_ENDPOINT
        _resource = boto3.resource("dynamodb", **kwargs)
    return _resource.Table(config.TABLE_NAME)


# ---------------------------------------------------------------------------
# Helpers de claves
# ---------------------------------------------------------------------------
def _gsi1sk(prioridad: Prioridad, fecha: str) -> str:
    return f"PRIORIDAD#{PRIORIDAD_ORDEN[prioridad]}#{fecha}"


def _nuevo_ticket_id() -> str:
    return uuid.uuid4().hex[:12]


# ---------------------------------------------------------------------------
# Equipos
# ---------------------------------------------------------------------------
def crear_equipo(equipo: EquipoIn) -> dict:
    """Registra un equipo en el inventario."""
    now = ahora_iso()
    item = {
        "PK": f"EQUIPO#{equipo.activo}",
        "SK": "META",
        "entity": "EQUIPO",
        "tipo": equipo.tipo.value,
        "marca": equipo.marca,
        "modelo": equipo.modelo,
        "activo": equipo.activo,
        "ubicacion": equipo.ubicacion,
        "soporte_vital": equipo.soporte_vital,
        "created_at": now,
        "updated_at": now,
    }
    _table().put_item(Item=item)
    return item


def listar_equipos() -> list[dict]:
    """Lista todos los equipos del inventario (scan filtrado por entidad META)."""
    # Para el MVP usamos scan con filtro; a escala se migraría a un GSI de entidad.
    resp = _table().scan(
        FilterExpression=Key("SK").eq("META") & Key("entity").eq("EQUIPO")
    )
    return resp.get("Items", [])


# ---------------------------------------------------------------------------
# Tickets
# ---------------------------------------------------------------------------
def _ticket_item(
    ticket_id: str,
    data: TicketCreate,
    prioridad: Prioridad,
    estado: EstadoTicket,
    created_at: str,
    updated_at: str,
    asignado_a: Optional[str],
) -> dict:
    """Construye el item canónico del ticket (PK TICKET#id / SK META)."""
    return {
        "PK": f"TICKET#{ticket_id}",
        "SK": "META",
        "entity": "TICKET",
        "ticket_id": ticket_id,
        "activo": data.activo,
        "tipo_equipo": data.tipo_equipo.value,
        "area": data.area.value,
        "reportado_por": data.reportado_por,
        "descripcion": data.descripcion,
        "prioridad": prioridad.value,
        "estado": estado.value,
        "asignado_a": asignado_a,
        "evidencia_url": data.evidencia_url,
        "sla_minutos": sla_de(prioridad),
        "created_at": created_at,
        "updated_at": updated_at,
        # Índices
        "GSI1PK": f"ESTADO#{estado.value}",
        "GSI1SK": _gsi1sk(prioridad, created_at),
        "GSI2PK": f"PRIORIDAD#{prioridad.value}",
        "GSI2SK": created_at,
    }


def crear_ticket(data: TicketCreate) -> dict:
    """Crea un ticket de falla, calcula su prioridad y escribe trazabilidad.

    Escribe tres items: el ticket canónico, un duplicado bajo el equipo (para
    el historial del equipo) y un evento de historial de creación.
    """
    ticket_id = _nuevo_ticket_id()
    now = ahora_iso()
    prioridad = resolver_prioridad(data)
    estado = EstadoTicket.abierto

    item = _ticket_item(ticket_id, data, prioridad, estado, now, now, None)

    # Duplicado indexado por equipo para consultar su historial de tickets.
    item_equipo = {
        "PK": f"EQUIPO#{data.activo}",
        "SK": f"TICKET#{now}#{ticket_id}",
        "entity": "TICKET_EQUIPO",
        "ticket_id": ticket_id,
        "prioridad": prioridad.value,
        "estado": estado.value,
        "created_at": now,
    }

    evento = {
        "PK": f"TICKET#{ticket_id}",
        "SK": f"HIST#{now}",
        "entity": "HIST",
        "timestamp": now,
        "tipo": "creacion",
        "detalle": f"Ticket creado con prioridad {prioridad.value}.",
        "autor": data.reportado_por,
    }

    with _table().batch_writer() as batch:
        batch.put_item(Item=item)
        batch.put_item(Item=item_equipo)
        batch.put_item(Item=evento)

    return item


def obtener_ticket(ticket_id: str) -> Optional[dict]:
    """Devuelve el item canónico de un ticket o None si no existe."""
    resp = _table().get_item(Key={"PK": f"TICKET#{ticket_id}", "SK": "META"})
    return resp.get("Item")


def listar_tickets_por_estado(estado: EstadoTicket) -> list[dict]:
    """Tablero: tickets de un estado, ordenados por prioridad clínica (GSI1)."""
    resp = _table().query(
        IndexName="GSI1",
        KeyConditionExpression=Key("GSI1PK").eq(f"ESTADO#{estado.value}"),
        ScanIndexForward=True,  # PRIORIDAD#1 (critica) primero
    )
    return resp.get("Items", [])


def listar_tickets_por_prioridad(prioridad: Prioridad) -> list[dict]:
    """Cola de atención: tickets de una prioridad (GSI2)."""
    resp = _table().query(
        IndexName="GSI2",
        KeyConditionExpression=Key("GSI2PK").eq(f"PRIORIDAD#{prioridad.value}"),
        ScanIndexForward=False,  # más recientes primero
    )
    return resp.get("Items", [])


def listar_tickets_por_area(area: str) -> list[dict]:
    """Tickets de un área consultando el duplicado por equipo no aplica directo;
    para el MVP filtramos por área con scan sobre items canónicos."""
    resp = _table().scan(
        FilterExpression=Key("entity").eq("TICKET") & Key("area").eq(area)
    )
    return resp.get("Items", [])


def listar_todos_los_tickets() -> list[dict]:
    """Lista todos los tickets canónicos (scan filtrado)."""
    resp = _table().scan(FilterExpression=Key("entity").eq("TICKET"))
    return resp.get("Items", [])


def listar_historial(ticket_id: str) -> list[dict]:
    """Trazabilidad de un ticket (eventos HIST), del más antiguo al más reciente."""
    resp = _table().query(
        KeyConditionExpression=Key("PK").eq(f"TICKET#{ticket_id}")
        & Key("SK").begins_with("HIST#"),
        ScanIndexForward=True,
    )
    return resp.get("Items", [])


def actualizar_ticket(ticket_id: str, cambios: TicketUpdate, autor: Optional[str]) -> Optional[dict]:
    """Actualiza estado/asignación/prioridad de un ticket y registra el evento.

    Devuelve el ticket actualizado, o None si no existe.
    """
    actual = obtener_ticket(ticket_id)
    if actual is None:
        return None

    now = ahora_iso()
    nuevo_estado = cambios.estado.value if cambios.estado else actual["estado"]
    nueva_prioridad = cambios.prioridad.value if cambios.prioridad else actual["prioridad"]
    nuevo_asignado = cambios.asignado_a if cambios.asignado_a is not None else actual.get("asignado_a")

    prioridad_enum = Prioridad(nueva_prioridad)

    expr = (
        "SET estado = :estado, prioridad = :prioridad, asignado_a = :asignado, "
        "updated_at = :updated, sla_minutos = :sla, "
        "GSI1PK = :g1pk, GSI1SK = :g1sk, GSI2PK = :g2pk"
    )
    values = {
        ":estado": nuevo_estado,
        ":prioridad": nueva_prioridad,
        ":asignado": nuevo_asignado,
        ":updated": now,
        ":sla": sla_de(prioridad_enum),
        ":g1pk": f"ESTADO#{nuevo_estado}",
        ":g1sk": _gsi1sk(prioridad_enum, actual["created_at"]),
        ":g2pk": f"PRIORIDAD#{nueva_prioridad}",
    }

    resp = _table().update_item(
        Key={"PK": f"TICKET#{ticket_id}", "SK": "META"},
        UpdateExpression=expr,
        ExpressionAttributeValues=values,
        ReturnValues="ALL_NEW",
    )

    # Registrar evento de historial.
    detalle_partes = []
    if cambios.estado:
        detalle_partes.append(f"estado -> {nuevo_estado}")
    if cambios.asignado_a is not None:
        detalle_partes.append(f"asignado a {nuevo_asignado}")
    if cambios.prioridad:
        detalle_partes.append(f"prioridad -> {nueva_prioridad}")
    if cambios.nota:
        detalle_partes.append(f"nota: {cambios.nota}")
    detalle = "; ".join(detalle_partes) or "actualización sin cambios"

    _table().put_item(
        Item={
            "PK": f"TICKET#{ticket_id}",
            "SK": f"HIST#{now}",
            "entity": "HIST",
            "timestamp": now,
            "tipo": "actualizacion",
            "detalle": detalle,
            "autor": autor or nuevo_asignado,
        }
    )

    return resp.get("Attributes")
