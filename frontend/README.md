# Tickets de equipos biomédicos — MVP estático

Sistema de tickets para reportar y dar seguimiento a fallas en equipos biomédicos
de una clínica de segundo nivel. Este MVP es un **sitio estático sin base de datos**:
los tickets se guardan en el navegador con `localStorage`.

- **Frontend:** React + TypeScript (Vite).
- **Persistencia:** `localStorage` del navegador (sin backend, sin AWS).
- **Despliegue:** GitHub Pages (workflow incluido).

## Qué hace
- Formulario rápido de reporte de fallas (equipo, área, descripción, contexto clínico).
- Cálculo automático de **prioridad por riesgo clínico** (crítica, alta, media, baja) y su SLA.
- Tablero de tickets ordenado por prioridad, con avance de estado
  (abierto → asignado → en reparación → cerrado).

> Al no haber backend, los datos viven en el navegador de cada usuario: no se
> comparten entre equipos ni personas. Es un MVP de demostración.

## Desarrollo local

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Otros comandos:

```bash
npm run build      # type-check + build a dist/
npm run preview    # sirve el build localmente
npm run lint       # solo type-check
```

## Despliegue a GitHub Pages

1. Sube el repo a GitHub.
2. En el repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada push a `main` que toque `frontend/` dispara el workflow
   `.github/workflows/deploy-frontend.yml`, que compila y publica el sitio.

El `base` del sitio se ajusta solo al nombre del repo (vía `VITE_BASE` en el workflow).
Si tu repo tiene otro nombre, no necesitas tocar nada: el workflow usa
`/${{ github.event.repository.name }}/`.
