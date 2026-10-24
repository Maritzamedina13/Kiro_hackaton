import { useCallback, useEffect, useMemo, useState, type ReactElement } from "react";
import { actualizarTicket, listarTickets } from "../services/api";
import {
  AREA_LABEL,
  ESTADO_EQUIPO_LABEL,
  ESTADO_LABEL,
  INGENIEROS_BIOMEDICA,
  PRIORIDAD_LABEL,
  TIPO_EQUIPO_LABEL,
  type EstadoTicket,
  type Ticket,
} from "../types";
import { Indicadores } from "./Indicadores";
import {
  IconAlerta,
  IconCheck,
  IconDispositivo,
  IconError,
  IconFlecha,
  IconInbox,
  IconMapa,
  IconUsuario,
} from "./icons";

interface Props {
  // Cambia cuando se crea un ticket, para forzar recarga.
  recargarToken: number;
}

const ESTADOS = Object.keys(ESTADO_LABEL) as EstadoTicket[];
const ORDEN_PRIORIDAD: Record<string, number> = { critica: 1, alta: 2, media: 3, baja: 4 };

/** Siguiente estado sugerido en el ciclo de vida del ticket. */
const SIGUIENTE_ESTADO: Partial<Record<EstadoTicket, EstadoTicket>> = {
  abierto: "asignado",
  asignado: "en_reparacion",
  en_reparacion: "cerrado",
  en_espera_repuesto: "en_reparacion",
};

/** Tablero de gestión de tickets para Ingeniería Biomédica. */
export function Tablero({ recargarToken }: Props): ReactElement {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoTicket | "">("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Ticket en proceso de cierre (muestra el campo de observación) y su texto.
  const [cerrandoId, setCerrandoId] = useState<string | null>(null);
  const [obsCierre, setObsCierre] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      // Siempre traemos todos (para KPIs) y filtramos en memoria.
      const data = await listarTickets();
      data.sort((a, b) => {
        const p = (ORDEN_PRIORIDAD[a.prioridad] ?? 9) - (ORDEN_PRIORIDAD[b.prioridad] ?? 9);
        return p !== 0 ? p : b.created_at.localeCompare(a.created_at);
      });
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los tickets.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar, recargarToken]);

  const visibles = useMemo(
    () => (filtroEstado ? tickets.filter((t) => t.estado === filtroEstado) : tickets),
    [tickets, filtroEstado],
  );

  async function cambiar(
    ticketId: string,
    cambios: Parameters<typeof actualizarTicket>[1],
  ): Promise<void> {
    try {
      await actualizarTicket(ticketId, cambios);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el ticket.");
    }
  }

  // Confirma el cierre con la observación obligatoria.
  async function confirmarCierre(ticketId: string): Promise<void> {
    setError(null);
    try {
      await actualizarTicket(ticketId, { estado: "cerrado", observacion_cierre: obsCierre });
      setCerrandoId(null);
      setObsCierre("");
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cerrar el ticket.");
    }
  }

  // Conteo por estado para las pestañas de filtro.
  const conteoPorEstado = useMemo(() => {
    const c: Record<string, number> = {};
    for (const t of tickets) c[t.estado] = (c[t.estado] ?? 0) + 1;
    return c;
  }, [tickets]);

  return (
    <section className="card" aria-labelledby="titulo-tablero">
      <div className="card-head">
        <span className="card-icon">
          <IconInbox />
        </span>
        <h2 id="titulo-tablero">Tablero de gestión</h2>
      </div>

      <div style={{ padding: "1.5rem 1.5rem 0" }}>
        <Indicadores tickets={tickets} />
      </div>

      {/* Filtro por estado — organiza la gestión del flujo de trabajo */}
      <div className="toolbar" role="group" aria-label="Filtrar tickets por estado">
        <div className="seg">
          <button
            type="button"
            aria-pressed={filtroEstado === ""}
            onClick={() => setFiltroEstado("")}
          >
            Todos ({tickets.length})
          </button>
          {ESTADOS.map((e) => (
            <button
              key={e}
              type="button"
              aria-pressed={filtroEstado === e}
              onClick={() => setFiltroEstado(e)}
            >
              {ESTADO_LABEL[e]} ({conteoPorEstado[e] ?? 0})
            </button>
          ))}
        </div>
        <span className="count" aria-live="polite">
          {visibles.length} {visibles.length === 1 ? "ticket" : "tickets"}
        </span>
      </div>

      {error && (
        <div style={{ padding: "1rem 1.5rem 0" }}>
          <p className="feedback error" role="alert">
            <IconError />
            {error}
          </p>
        </div>
      )}

      {cargando ? (
        <div className="skeleton" aria-hidden="true">
          <div className="row" />
          <div className="row" />
          <div className="row" />
        </div>
      ) : visibles.length === 0 ? (
        <div className="state" role="status">
          <IconInbox />
          <strong>No hay tickets en esta vista</strong>
          <span>Cambia el filtro o registra una falla para empezar.</span>
        </div>
      ) : (
        <div className="ticket-list">
          {visibles.map((t) => {
            const siguiente = SIGUIENTE_ESTADO[t.estado];
            return (
              <article key={t.ticket_id} className={`ticket prio-${t.prioridad}`}>
                <div className="ticket-top">
                  <h3>
                    {TIPO_EQUIPO_LABEL[t.tipo_equipo]}{" "}
                    <span className="activo">· {t.activo}</span>
                  </h3>
                  <div className="badges">
                    <span className={`badge prio-${t.prioridad}`}>
                      {t.prioridad === "critica" && <IconAlerta />}
                      {PRIORIDAD_LABEL[t.prioridad]}
                    </span>
                    <span className="badge estado">{ESTADO_LABEL[t.estado]}</span>
                    <span className={`badge equipo-${t.estado_equipo}`} title="Estado del equipo">
                      <IconDispositivo />
                      {ESTADO_EQUIPO_LABEL[t.estado_equipo]}
                    </span>
                  </div>
                </div>

                <p className="desc">{t.descripcion}</p>

                <div className="meta">
                  <span className="meta-item">
                    <IconMapa />
                    {AREA_LABEL[t.area]}
                  </span>
                  <span className="meta-item">
                    <IconUsuario />
                    Reportó {t.reportado_por}
                  </span>
                  <span className="meta-item">SLA {t.sla_minutos} min</span>
                </div>

                {/* Gestión: asignar ingeniero + avanzar estado */}
                <div className="ticket-actions">
                  <label className="visually-hidden" htmlFor={`asignar-${t.ticket_id}`}>
                    Asignar ingeniero al ticket {t.activo}
                  </label>
                  <select
                    id={`asignar-${t.ticket_id}`}
                    className="btn-sm"
                    value={t.asignado_a ?? ""}
                    onChange={(e) =>
                      void cambiar(t.ticket_id, {
                        asignado_a: e.target.value,
                        // Al asignar desde "abierto", el ticket pasa a "asignado".
                        estado: e.target.value && t.estado === "abierto" ? "asignado" : undefined,
                      })
                    }
                    style={{
                      padding: "0.4rem 0.6rem",
                      border: "1px solid var(--border-strong)",
                      borderRadius: 7,
                      background: "var(--surface)",
                      color: "var(--text)",
                      font: "inherit",
                      fontSize: "0.85rem",
                    }}
                  >
                    <option value="">Sin asignar…</option>
                    {INGENIEROS_BIOMEDICA.map((ing) => (
                      <option key={ing} value={ing}>
                        {ing}
                      </option>
                    ))}
                  </select>

                  {siguiente && (
                    <button
                      className="btn btn-sm"
                      type="button"
                      onClick={() => {
                        if (siguiente === "cerrado") {
                          // Abre el panel de observación en vez de cerrar directo.
                          setCerrandoId(t.ticket_id);
                          setObsCierre("");
                        } else {
                          void cambiar(t.ticket_id, { estado: siguiente });
                        }
                      }}
                    >
                      {siguiente === "cerrado" ? <IconCheck /> : <IconFlecha />}
                      {ESTADO_LABEL[siguiente]}
                    </button>
                  )}
                </div>

                {/* Panel de cierre: observación obligatoria (evidencia/verificación) */}
                {cerrandoId === t.ticket_id && (
                  <div className="cierre-panel">
                    <label htmlFor={`obs-${t.ticket_id}`}>
                      Observación de cierre <span className="req">*</span>
                    </label>
                    <textarea
                      id={`obs-${t.ticket_id}`}
                      value={obsCierre}
                      onChange={(e) => setObsCierre(e.target.value)}
                      rows={3}
                      placeholder="Describe la intervención, el repuesto usado y la verificación del equipo."
                      autoFocus
                    />
                    <div className="cierre-acciones">
                      <button
                        className="btn btn-sm"
                        type="button"
                        disabled={!obsCierre.trim()}
                        onClick={() => void confirmarCierre(t.ticket_id)}
                      >
                        <IconCheck />
                        Confirmar cierre
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        type="button"
                        onClick={() => {
                          setCerrandoId(null);
                          setObsCierre("");
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Observación registrada en tickets ya cerrados */}
                {t.estado === "cerrado" && t.observacion_cierre && (
                  <div className="cierre-registro">
                    <IconCheck />
                    <div>
                      <strong>Cierre:</strong> {t.observacion_cierre}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
