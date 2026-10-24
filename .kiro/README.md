# Mapa de la oficina — .kiro/

Configuracion de Kiro para el **Sistema de Tickets de Equipos Biomedicos**
(clinica de segundo nivel).

```
.kiro/
├── steering/          # reglas de la casa (Acto 1)
│   ├── producto.md    # always    -> vision del sistema de tickets
│   ├── tech.md        # always    -> stack tecnologico
│   └── frontend.md    # fileMatch -> reglas de UI al editar *.tsx/*.jsx
├── agents/            # los especialistas (Actos 2-4, 8)
│   ├── arquitecto.json
│   ├── backend-dev.json
│   ├── frontend-dev.json
│   ├── reviewer.json      (crear manual: bloqueado por permissions.yaml)
│   ├── tech-lead.json     (crear manual: bloqueado por permissions.yaml)
│   └── deploy-ops.json    (crear manual: bloqueado por permissions.yaml)
├── skills/            # conocimiento bajo demanda (Acto 5)
│   ├── dynamodb-tickets/SKILL.md
│   └── priorizacion-clinica/SKILL.md
├── hooks/             # automatizacion por eventos (Acto 6)
│   ├── qa-tests.json
│   └── guard-shell.json
├── settings/
│   └── mcp.json       # conexion a draw.io (Acto 7) — crear manual: dir protegido
├── security/
│   └── permissions.yaml  # ejemplo de permisos (Acto 8)
├── powers/            # empaquetado (Acto 9)
│   └── biomed-ticket-kit/
│       ├── POWER.md
│       └── mcp.json
├── specs/             # features estructuradas (Acto 10, en vivo)
└── README.md          # este mapa
```
