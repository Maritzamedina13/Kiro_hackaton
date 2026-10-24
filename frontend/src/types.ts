// Tipos del dominio de tickets biomédicos (espejo de los modelos del backend).

export type Area =
  | "urgencias"
  | "uci"
  | "cirugia"
  | "hospitalizacion"
  | "consulta_externa"
  | "laboratorio"
  | "imagenes"
  | "esterilizacion";

export type TipoEquipo =
  | "monitor_signos_vitales"
  | "ventilador"
  | "bomba_infusion"
  | "desfibrilador"
  | "incubadora"
  | "electrobisturi"
  | "maquina_anestesia"
  | "equipo_imagenes"
  | "autoclave";

export type Prioridad = "critica" | "alta" | "media" | "baja";

export type EstadoTicket =
  | "abierto"
  | "asignado"
  | "en_reparacion"
  | "en_espera_repuesto"
  | "cerrado";

export interface Ticket {
  ticket_id: string;
  activo: string;
  tipo_equipo: TipoEquipo;
  area: Area;
  reportado_por: string;
  descripcion: string;
  prioridad: Prioridad;
  estado: EstadoTicket;
  asignado_a: string | null;
  evidencia_url: string | null;
  sla_minutos: number;
  created_at: string;
  updated_at: string;
}

export interface NuevoTicket {
  activo: string;
  area: Area;
  reportado_por: string;
  descripcion: string;
  tipo_equipo: TipoEquipo;
  soporte_vital: boolean;
  en_uso_con_paciente: boolean;
  respaldo_disponible: boolean;
  prioridad_sugerida?: Prioridad | null;
  evidencia_url?: string | null;
}

// Etiquetas legibles en español para la UI.
export const AREA_LABEL: Record<Area, string> = {
  urgencias: "Urgencias",
  uci: "UCI / Cuidados intensivos",
  cirugia: "Cirugía / Quirófanos",
  hospitalizacion: "Hospitalización",
  consulta_externa: "Consulta externa",
  laboratorio: "Laboratorio clínico",
  imagenes: "Imágenes diagnósticas",
  esterilizacion: "Esterilización",
};

export const TIPO_EQUIPO_LABEL: Record<TipoEquipo, string> = {
  monitor_signos_vitales: "Monitor de signos vitales",
  ventilador: "Ventilador / Respirador",
  bomba_infusion: "Bomba de infusión",
  desfibrilador: "Desfibrilador",
  incubadora: "Incubadora / Cuna de calor",
  electrobisturi: "Electrobisturí",
  maquina_anestesia: "Máquina de anestesia",
  equipo_imagenes: "Equipo de imágenes",
  autoclave: "Autoclave / Esterilizador",
};

export const PRIORIDAD_LABEL: Record<Prioridad, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export const ESTADO_LABEL: Record<EstadoTicket, string> = {
  abierto: "Abierto",
  asignado: "Asignado",
  en_reparacion: "En reparación",
  en_espera_repuesto: "En espera de repuesto",
  cerrado: "Cerrado",
};
