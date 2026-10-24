// Capa de datos del MVP sin backend: los tickets se guardan en localStorage.
// Mantiene la misma firma que una API para que los componentes no cambien.
// Migrar a una API REST real solo requiere reescribir este archivo.

import type { EstadoTicket, NuevoTicket, Prioridad, Ticket } from "../types";
import { resolverPrioridad, SLA_MINUTOS } from "./priorizacion";

const STORAGE_KEY = "biomed.tickets.v1";

// Pequeña demora simulada para que la UI ejerza sus estados de carga.
const delay = (ms = 120): Promise<void> => new Promise((r) => setTimeout(r, ms));

function leerTodos(): Ticket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Ticket[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function guardarTodos(tickets: Ticket[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

function nuevoId(): string {
  // Identificador corto y único suficiente para el MVP.
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  ).toUpperCase();
}

function ahoraIso(): string {
  // Fecha en hora local del navegador, en formato ISO (sin milisegundos).
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

export interface FiltroTickets {
  estado?: EstadoTicket;
  prioridad?: Prioridad;
  area?: string;
}

export async function listarTickets(filtro: FiltroTickets = {}): Promise<Ticket[]> {
  await delay();
  let tickets = leerTodos();
  if (filtro.estado) tickets = tickets.filter((t) => t.estado === filtro.estado);
  if (filtro.prioridad) tickets = tickets.filter((t) => t.prioridad === filtro.prioridad);
  if (filtro.area) tickets = tickets.filter((t) => t.area === filtro.area);
  return tickets;
}

export async function crearTicket(nuevo: NuevoTicket): Promise<Ticket> {
  await delay();
  const prioridad = resolverPrioridad(nuevo);
  const now = ahoraIso();
  const ticket: Ticket = {
    ticket_id: nuevoId(),
    activo: nuevo.activo,
    tipo_equipo: nuevo.tipo_equipo,
    area: nuevo.area,
    reportado_por: nuevo.reportado_por,
    descripcion: nuevo.descripcion,
    prioridad,
    estado: "abierto",
    asignado_a: null,
    evidencia_url: nuevo.evidencia_url ?? null,
    sla_minutos: SLA_MINUTOS[prioridad],
    created_at: now,
    updated_at: now,
  };
  const tickets = leerTodos();
  tickets.push(ticket);
  guardarTodos(tickets);
  return ticket;
}

export async function actualizarTicket(
  ticketId: string,
  cambios: { estado?: EstadoTicket; asignado_a?: string; prioridad?: Prioridad; nota?: string },
): Promise<Ticket> {
  await delay();
  const tickets = leerTodos();
  const idx = tickets.findIndex((t) => t.ticket_id === ticketId);
  if (idx === -1) {
    throw new Error("Ticket no encontrado.");
  }
  const actual = tickets[idx];
  const actualizado: Ticket = {
    ...actual,
    estado: cambios.estado ?? actual.estado,
    prioridad: cambios.prioridad ?? actual.prioridad,
    asignado_a: cambios.asignado_a !== undefined ? cambios.asignado_a : actual.asignado_a,
    updated_at: ahoraIso(),
  };
  if (cambios.prioridad) {
    actualizado.sla_minutos = SLA_MINUTOS[cambios.prioridad];
  }
  tickets[idx] = actualizado;
  guardarTodos(tickets);
  return actualizado;
}
