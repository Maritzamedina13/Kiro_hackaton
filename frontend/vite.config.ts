import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// El sitio se publica en GitHub Pages bajo https://<usuario>.github.io/<repo>/
// por eso `base` debe ser el nombre del repo. Se puede sobrescribir con VITE_BASE.
// En desarrollo (vite dev) base es "/".
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? process.env.VITE_BASE ?? "/Kiro_hackaton/" : "/",
}));
