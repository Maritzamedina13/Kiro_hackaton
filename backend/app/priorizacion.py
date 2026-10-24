"""Reglas de priorización por riesgo clínico y asignación de SLA.

Implementa la matriz de la skill `priorizacion-clinica`: la prioridad depende
del riesgo para el paciente si el equipo falla en su contexto de uso actual,
no solo del tipo de equipo.
"""
from __future__ import annotations

from app.models import Area, Prioridad, TicketCreate

# SLA de respuesta en minutos por prioridad.
SLA_MINUTOS: dict[Prioridad, int] = {
    Prioridad.critica: 30,      # inmediata (< 30 min)
    Prioridad.alta: 120,        # < 2 horas
    Prioridad.media: 1440,      # < 24 horas
    Prioridad.baja: 4320,       # < 72 horas
}

# Áreas de alto riesgo donde un equipo de soporte vital en uso es crítico.
AREAS_CRITICAS = {Area.uci, Area.urgencias, Area.cirugia}


def calcular_prioridad(ticket: TicketCreate) -> Prioridad:
    """Clasifica la prioridad de un ticket según el riesgo clínico.

    Lógica (ver skill priorizacion-clinica):
    1. ¿El equipo está en uso con un paciente ahora mismo?
    2. ¿Es un equipo de soporte vital?
    3. ¿Hay un equipo de respaldo disponible en el área?

    - Soporte vital + en uso + sin respaldo (en área crítica) -> critica.
    - Equipo asistencial necesario sin redundancia -> alta.
    - Equipo con respaldo o reemplazo disponible -> media.
    - En otro caso (falla menor / preventiva) -> baja por defecto.
    """
    soporte_vital = ticket.soporte_vital
    en_uso = ticket.en_uso_con_paciente
    sin_respaldo = not ticket.respaldo_disponible
    area_critica = ticket.area in AREAS_CRITICAS

    # Crítica: soporte vital, en uso con paciente y sin respaldo inmediato.
    if soporte_vital and en_uso and sin_respaldo:
        return Prioridad.critica

    # Crítica también si está en un área de alto riesgo, es soporte vital y no hay respaldo.
    if soporte_vital and area_critica and sin_respaldo:
        return Prioridad.critica

    # Alta: equipo asistencial necesario sin redundancia disponible.
    if sin_respaldo:
        return Prioridad.alta

    # Media: hay respaldo o reemplazo disponible.
    if not sin_respaldo and (soporte_vital or en_uso):
        return Prioridad.media

    # Baja: falla menor, estética o preventiva.
    return Prioridad.baja


def resolver_prioridad(ticket: TicketCreate) -> Prioridad:
    """Devuelve la prioridad calculada.

    La prioridad sugerida por el área es solo una referencia; biomédica
    (vía este backend) la valida con la matriz de riesgo clínico. Si el
    cálculo da una prioridad más alta que la sugerida, prevalece la más alta.
    """
    calculada = calcular_prioridad(ticket)
    if ticket.prioridad_sugerida is None:
        return calculada

    from app.models import PRIORIDAD_ORDEN

    # Menor número = mayor prioridad. Nos quedamos con la más alta de las dos.
    if PRIORIDAD_ORDEN[ticket.prioridad_sugerida] < PRIORIDAD_ORDEN[calculada]:
        return ticket.prioridad_sugerida
    return calculada


def sla_de(prioridad: Prioridad) -> int:
    """SLA de respuesta en minutos para una prioridad."""
    return SLA_MINUTOS[prioridad]
