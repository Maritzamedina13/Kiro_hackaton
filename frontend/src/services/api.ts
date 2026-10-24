// Capa centralizada de llamadas a la API (regla de frontend.md).
// La URL base viene de VITE_API_URL (definida en el build de GitHub Actions).

import type {
  EstadoTicket,
  NuevoTicket,
  Prioridad,
  Ticket,
} from "../types";

const BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000";

interface ApiError {
  detail?: string;
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as ApiError;
    return body.detail ?? "Ocurrió un error inesperado.";
  } catch {
    return "No se pudo contactar con el servidor.";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new Error("No se pudo contactar con el servidor. Revisa tu conexión.");
  }
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return (await res.json()) as T;
}

export interface FiltroTickets {
  estado?: EstadoTicket;
  prioridad?: Prioridad;
  area?: string;
}

export async function listarTickets(filtro: FiltroTickets = {}): Promise<Ticket[]> {
  const params = new URLSearchParams();
  if (filtro.estado) params.set("estado", filtro.estado);
  if (filtro.prioridad) params.set("prioridad", filtro.prioridad);
  if (filtro.area) params.set("area", filtro.area);
  const qs = params.toString();
  return request<Ticket[]>(`/tickets${qs ? `?${qs}` : ""}`);
}

export async function crearTicket(ticket: NuevoTicket): Promise<Ticket> {
  return request<Ticket>("/tickets", {
    method: "POST",
    body: JSON.stringify(ticket),
  });
}

export async function actualizarTicket(
  ticketId: string,
  cambios: { estado?: EstadoTicket; asignado_a?: string; prioridad?: Prioridad; nota?: string },
): Promise<Ticket> {
  return request<Ticket>(`/tickets/${ticketId}`, {
    method: "PATCH",
    body: JSON.stringify(cambios),
  });
}
