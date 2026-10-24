// Reglas de priorización por riesgo clínico (portadas de la skill
// `priorizacion-clinica`). Como el MVP no tiene backend, el cálculo vive aquí.

import type { Area, NuevoTicket, Prioridad } from "../types";

// SLA de respuesta en minutos por prioridad.
export const SLA_MINUTOS: Record<Prioridad, number> = {
  critica: 30, // inmediata (< 30 min)
  alta: 120, // < 2 horas
  media: 1440, // < 24 horas
  baja: 4320, // < 72 horas
};

// Menor número = mayor prioridad (para ordenar y comparar).
export const PRIORIDAD_ORDEN: Record<Prioridad, number> = {
  critica: 1,
  alta: 2,
  media: 3,
  baja: 4,
};

// Áreas de alto riesgo donde un equipo de soporte vital en uso es crítico.
const AREAS_CRITICAS: ReadonlySet<Area> = new Set<Area>(["uci", "urgencias", "cirugia"]);

/** Clasifica la prioridad según el riesgo clínico del contexto de uso. */
export function calcularPrioridad(t: NuevoTicket): Prioridad {
  const soporteVital = t.soporte_vital;
  const enUso = t.en_uso_con_paciente;
  const sinRespaldo = !t.respaldo_disponible;
  const areaCritica = AREAS_CRITICAS.has(t.area);

  // Crítica: soporte vital, en uso con paciente y sin respaldo.
  if (soporteVital && enUso && sinRespaldo) return "critica";
  // Crítica: soporte vital en área de alto riesgo sin respaldo.
  if (soporteVital && areaCritica && sinRespaldo) return "critica";
  // Alta: equipo necesario sin redundancia disponible.
  if (sinRespaldo) return "alta";
  // Media: hay respaldo, pero es soporte vital o está en uso.
  if (soporteVital || enUso) return "media";
  // Baja: falla menor, estética o preventiva.
  return "baja";
}

/** Prioridad final: la más alta entre la calculada y la sugerida por el área. */
export function resolverPrioridad(t: NuevoTicket): Prioridad {
  const calculada = calcularPrioridad(t);
  if (!t.prioridad_sugerida) return calculada;
  return PRIORIDAD_ORDEN[t.prioridad_sugerida] < PRIORIDAD_ORDEN[calculada]
    ? t.prioridad_sugerida
    : calculada;
}
