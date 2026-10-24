import { useState, type FormEvent, type ReactElement } from "react";
import { crearTicket } from "../services/api";
import {
  AREA_LABEL,
  TIPO_EQUIPO_LABEL,
  type Area,
  type NuevoTicket,
  type TipoEquipo,
} from "../types";

interface Props {
  // Se llama tras crear un ticket para refrescar el tablero.
  onCreado: () => void;
}

const AREAS = Object.keys(AREA_LABEL) as Area[];
const TIPOS = Object.keys(TIPO_EQUIPO_LABEL) as TipoEquipo[];

const ESTADO_INICIAL: NuevoTicket = {
  activo: "",
  area: "urgencias",
  reportado_por: "",
  descripcion: "",
  tipo_equipo: "monitor_signos_vitales",
  soporte_vital: false,
  en_uso_con_paciente: false,
  respaldo_disponible: true,
};

type Feedback = { tipo: "ok" | "error"; texto: string } | null;

/** Formulario rápido de reporte de fallas para el personal clínico. */
export function ReporteFalla({ onCreado }: Props): ReactElement {
  const [form, setForm] = useState<NuevoTicket>(ESTADO_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  function set<K extends keyof NuevoTicket>(campo: K, valor: NuevoTicket[K]): void {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setFeedback(null);
    setEnviando(true);
    try {
      const creado = await crearTicket(form);
      setFeedback({
        tipo: "ok",
        texto: `Ticket creado con prioridad ${creado.prioridad.toUpperCase()}. SLA: ${creado.sla_minutos} min.`,
      });
      setForm(ESTADO_INICIAL);
      onCreado();
    } catch (err) {
      const texto = err instanceof Error ? err.message : "No se pudo crear el ticket.";
      setFeedback({ tipo: "error", texto });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="card" aria-labelledby="titulo-reporte">
      <h2 id="titulo-reporte">Reportar falla de un equipo</h2>

      {feedback && (
        <p className={`feedback ${feedback.tipo}`} role={feedback.tipo === "error" ? "alert" : "status"}>
          {feedback.texto}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="tipo_equipo">Tipo de equipo</label>
          <select
            id="tipo_equipo"
            value={form.tipo_equipo}
            onChange={(e) => set("tipo_equipo", e.target.value as TipoEquipo)}
            required
          >
            {TIPOS.map((t) => (
              <option key={t} value={t}>
                {TIPO_EQUIPO_LABEL[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="activo">Placa / activo del equipo</label>
          <input
            id="activo"
            value={form.activo}
            onChange={(e) => set("activo", e.target.value)}
            placeholder="Ej. VENT-UCI-07"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="area">Área solicitante</label>
          <select
            id="area"
            value={form.area}
            onChange={(e) => set("area", e.target.value as Area)}
            required
          >
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {AREA_LABEL[a]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="reportado_por">Reportado por</label>
          <input
            id="reportado_por"
            value={form.reportado_por}
            onChange={(e) => set("reportado_por", e.target.value)}
            placeholder="Nombre de quien reporta"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="descripcion">Descripción de la falla</label>
          <textarea
            id="descripcion"
            value={form.descripcion}
            onChange={(e) => set("descripcion", e.target.value)}
            rows={3}
            minLength={5}
            placeholder="Describe el comportamiento del equipo"
            required
          />
        </div>

        <fieldset className="checkboxes" style={{ border: "none", padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.5rem" }}>
            Contexto clínico (ayuda a priorizar)
          </legend>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.soporte_vital}
              onChange={(e) => set("soporte_vital", e.target.checked)}
            />
            ¿Es un equipo de soporte vital?
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.en_uso_con_paciente}
              onChange={(e) => set("en_uso_con_paciente", e.target.checked)}
            />
            ¿Está en uso con un paciente ahora mismo?
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.respaldo_disponible}
              onChange={(e) => set("respaldo_disponible", e.target.checked)}
            />
            ¿Hay un equipo de respaldo disponible?
          </label>
        </fieldset>

        <div className="field">
          <label htmlFor="evidencia_url">Evidencia (URL de foto, opcional)</label>
          <input
            id="evidencia_url"
            value={form.evidencia_url ?? ""}
            onChange={(e) => set("evidencia_url", e.target.value || null)}
            placeholder="https://…"
          />
        </div>

        <button className="btn" type="submit" disabled={enviando}>
          {enviando ? "Enviando…" : "Crear ticket"}
        </button>
      </form>
    </section>
  );
}
