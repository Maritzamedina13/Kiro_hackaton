// Datos de ejemplo para la demo. Se cargan una sola vez si no hay tickets,
// así el tablero no arranca vacío. No afecta a datos ya guardados.

import { crearTicket, listarTickets } from "./api";
import type { NuevoTicket } from "../types";

const EJEMPLOS: NuevoTicket[] = [
  {
    activo: "VENT-UCI-07",
    area: "uci",
    reportado_por: "Enf. Laura Gómez",
    descripcion: "El ventilador silencia las alarmas de forma intermitente durante el uso.",
    tipo_equipo: "ventilador",
    soporte_vital: true,
    en_uso_con_paciente: true,
    respaldo_disponible: false,
  },
  {
    activo: "AUTO-CENT-02",
    area: "esterilizacion",
    reportado_por: "Téc. Pedro Ruiz",
    descripcion: "El autoclave no alcanza la temperatura de ciclo; frena la esterilización de cirugía.",
    tipo_equipo: "autoclave",
    soporte_vital: false,
    en_uso_con_paciente: false,
    respaldo_disponible: false,
  },
  {
    activo: "MON-CE-15",
    area: "consulta_externa",
    reportado_por: "Dra. Ana Torres",
    descripcion: "Pantalla del monitor parpadea. Hay otro monitor disponible en el área.",
    tipo_equipo: "monitor_signos_vitales",
    soporte_vital: false,
    en_uso_con_paciente: false,
    respaldo_disponible: true,
  },
];

/** Carga los tickets de ejemplo solo si el almacenamiento está vacío. */
export async function sembrarSiVacio(): Promise<void> {
  const actuales = await listarTickets();
  if (actuales.length > 0) return;
  for (const ejemplo of EJEMPLOS) {
    await crearTicket(ejemplo);
  }
}
