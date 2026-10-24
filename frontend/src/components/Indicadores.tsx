import type { ReactElement } from "react";
import type { Ticket } from "../types";
import { IconAlerta, IconInbox, IconPulso, IconReloj } from "./icons";

interface Props {
  tickets: Ticket[];
}

/**
 * Panel de indicadores del tablero: resumen rápido para Ingeniería Biomédica.
 * Los números dan contexto antes de mirar la lista (gestión de un vistazo).
 */
export function Indicadores({ tickets }: Props): ReactElement {
  const abiertos = tickets.filter((t) => t.estado !== "cerrado");
  const criticos = abiertos.filter((t) => t.prioridad === "critica").length;
  const sinAsignar = abiertos.filter((t) => !t.asignado_a).length;
  const fueraServicio = tickets.filter((t) => t.estado_equipo === "fuera_de_servicio").length;

  const items = [
    {
      label: "Tickets activos",
      value: abiertos.length,
      icon: <IconInbox />,
      dot: "abiertos",
    },
    {
      label: "Prioridad crítica",
      value: criticos,
      icon: <IconAlerta />,
      dot: "critica",
    },
    {
      label: "Sin asignar",
      value: sinAsignar,
      icon: <IconReloj />,
      dot: "alta",
    },
    {
      label: "Equipos fuera de servicio",
      value: fueraServicio,
      icon: <IconPulso />,
      dot: "media",
    },
  ];

  return (
    <section className="kpis" aria-label="Indicadores del tablero">
      {items.map((it) => (
        <article className="kpi" key={it.label}>
          <div className="kpi-label">
            <span className={`dot ${it.dot}`} aria-hidden="true" />
            {it.icon}
            {it.label}
          </div>
          <div className="kpi-value">{it.value}</div>
        </article>
      ))}
    </section>
  );
}
