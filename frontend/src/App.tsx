import { useEffect, useState, type ReactElement } from "react";
import { ReporteFalla } from "./components/ReporteFalla";
import { Tablero } from "./components/Tablero";
import { sembrarSiVacio } from "./services/seed";
import { IconPulso } from "./components/icons";

/** Raíz de la app: barra de marca + formulario de reporte + tablero. */
export function App(): ReactElement {
  // Token que se incrementa al crear un ticket para refrescar el tablero.
  const [recargarToken, setRecargarToken] = useState(0);

  // Carga datos de ejemplo la primera vez (si el almacenamiento está vacío).
  useEffect(() => {
    void sembrarSiVacio().then(() => setRecargarToken((n) => n + 1));
  }, []);

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <IconPulso />
            </span>
            <span className="brand-text">
              <strong>BioTickets</strong>
              <span>Ingeniería Biomédica · Clínica 2.º nivel</span>
            </span>
          </div>
          <span className="topbar-spacer" />
          <span className="env-pill">MVP · demo</span>
        </div>
      </header>

      <main className="page" id="contenido">
        <div className="page-head">
          <h1>Gestión de fallas en equipos biomédicos</h1>
          <p>
            Reporta fallas desde cada área y haz seguimiento con prioridad por riesgo
            clínico. La prioridad crítica se resalta para atención inmediata.
          </p>
        </div>

        <div className="layout">
          <div className="col-form">
            <ReporteFalla onCreado={() => setRecargarToken((n) => n + 1)} />
          </div>
          <Tablero recargarToken={recargarToken} />
        </div>

        <footer className="footer">
          Sistema de tickets biomédicos · Los datos se guardan en este navegador
          (MVP sin backend). Prioridad y SLA según riesgo clínico.
        </footer>
      </main>
    </>
  );
}
