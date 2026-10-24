import { useState } from "react";
import { ReporteFalla } from "./components/ReporteFalla";
import { Tablero } from "./components/Tablero";

/** Raíz de la app: formulario de reporte + tablero de seguimiento. */
export function App(): JSX.Element {
  // Token que se incrementa al crear un ticket para refrescar el tablero.
  const [recargarToken, setRecargarToken] = useState(0);

  return (
    <div className="app">
      <header>
        <h1>Tickets de equipos biomédicos</h1>
        <p>Reporte y seguimiento de fallas · Ingeniería Biomédica</p>
      </header>

      <div className="layout">
        <ReporteFalla onCreado={() => setRecargarToken((n) => n + 1)} />
        <Tablero recargarToken={recargarToken} />
      </div>
    </div>
  );
}
