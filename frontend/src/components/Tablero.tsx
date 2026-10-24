import { useCallback, useEffect, useState, type ReactElement } from "react";
import { actualizarTicket, listarTickets } from "../services/api";
import {
  AREA_LABEL,
  ESTADO_LABEL,
  PRIORIDAD_LABEL,
  TIPO_EQUIPO_LABEL,
  type EstadoTicket,
  type Ticket,
} from "../types";

interface Props {
  // Cambia cuando se crea un ticket, para forzar recarga.
  recargarToken: number;
}

const ESTADOS = Object.keys(ESTADO_LABEL) as EstadoTicket[];

/** Siguiente estado sugerido en el ciclo de vida del ticket. */
const SIGUIENTE_ESTADO: Partial<Record<EstadoTicket, EstadoTicket>> = {
  abierto: "asignado",
  asignado: "en_reparacion",
  en_reparacion: "cerrado",
  en_espera_repuesto: "en_reparacion",
};

/** Tablero de tickets para Ingeniería Biomédica. */
export function Tablero({ recargarToken }: Props): ReactElement {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoTicket | "">("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await listarTickets(filtroEstado ? { estado: filtroEstado } : {});
      // Ordenar por prioridad clínica (critica primero) y luego por fecha.
      const orden: Record<string, number> = { critica: 1, alta: 2, media: 3, baja: 4 };
      data.sort((a, b) => {
        const p = (orden[a.prioridad] ?? 9) - (orden[b.prioridad] ?? 9);
        return p !== 0 ? p : b.created_at.localeCompare(a.created_at);
      });
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los tickets.");
    } finally {
      setCargando(false);
    }
  }, [filtroEstado]);

  useEffect(() => {
    void cargar();
  }, [cargar, recargarToken]);

  async function avanzar(ticket: Ticket): Promise<void> {
    const siguiente = SIGUIENTE_ESTADO[ticket.estado];
    if (!siguiente) return;
    try {
      await actualizarTicket(ticket.ticket_id, { estado: siguiente });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el ticket.");
    }
  }

  return (
    <section className="card" aria-labelledby="titulo-tablero">
      <h2 id="titulo-tablero">Tablero de tickets</h2>

      <div className="filtros">
        <div className="field" style={{ marginBottom: 0 }}>
          <label htmlFor="filtro-estado">Filtrar por estado</label>
          <select
            id="filtro-estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoTicket | "")}
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ESTADO_LABEL[e]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="feedback error" role="alert">
          {error}
        </p>
      )}
      {cargando && <p className="loading">Cargando tickets…</p>}
      {!cargando && !error && tickets.length === 0 && (
        <p className="empty">No hay tickets para mostrar.</p>
      )}

      <div className="ticket-list">
        {tickets.map((t) => {
          const siguiente = SIGUIENTE_ESTADO[t.estado];
          return (
            <article key={t.ticket_id} className={`ticket prio-${t.prioridad}`}>
              <div className="ticket-top">
                <h3>
                  {TIPO_EQUIPO_LABEL[t.tipo_equipo]} · {t.activo}
                </h3>
                <div className="badges">
                  <span className={`badge prio-${t.prioridad}`}>
                    {PRIORIDAD_LABEL[t.prioridad]}
                  </span>
                  <span className="badge estado">{ESTADO_LABEL[t.estado]}</span>
                </div>
              </div>
              <p className="desc">{t.descripcion}</p>
              <p className="meta">
                {AREA_LABEL[t.area]} · reportó {t.reportado_por} · SLA {t.sla_minutos} min
                {t.asignado_a ? ` · asignado a ${t.asignado_a}` : ""}
              </p>
              {siguiente && (
                <button className="btn" type="button" onClick={() => void avanzar(t)}>
                  Marcar como {ESTADO_LABEL[siguiente]}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
