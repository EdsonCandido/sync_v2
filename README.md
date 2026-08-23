# sync_v2

Monorepo Sync (Helios Labs): gestão de empresas, clientes, financeiro e kanban.

Frontend React + Chakra UI, API Express, PostgreSQL com Drizzle, autenticação Better Auth. Turborepo + npm workspaces.

## Documentação

- [Desenvolvimento local](docs/LOCAL.md) — PC novo, Postgres Docker, schema, seed, `npm run dev`
- [Produção](docs/PRODUCAO.md) — Ubuntu, Docker Compose, Nginx Proxy Manager
- [AGENTS.md](AGENTS.md) — arquitetura e fluxo de tarefas para agentes/contribuidores

## Stack

| Camada | Tecnologia |
| ------ | ---------- |
| Monorepo | Turborepo + npm workspaces |
| Web | React, React Router, Chakra UI v3 |
| Server | Express |
| DB | PostgreSQL + Drizzle |
| Auth | Better Auth (`packages/auth`) |
| Lint | Biome |

## Estrutura

```
sync_v2/
├── apps/
│   ├── web/         # Frontend (React + React Router + Chakra UI)
│   └── server/      # Backend API (Express) — regra de negócio só aqui
├── packages/
│   ├── auth/        # Config Better Auth (sem regra de domínio)
│   ├── config/      # Tooling / tsconfig compartilhado
│   ├── db/          # Schema Drizzle + client (sem regra de negócio)
│   ├── contracts/   # DTOs / schemas de API
│   ├── types/       # Tipos compartilhados
│   ├── utils/       # Helpers puros
│   └── env/         # Variáveis de ambiente
├── docs/            # Guias local e produção
├── tasks/           # Specs de trabalho
└── AGENTS.md
```

Server (`apps/server/src`): **Route → Controller → Service → Repository → Drizzle**.

UI: Chakra UI v3 — helpers em `apps/web/src/components/ui/`.

## Scripts

| Script | Uso |
| ------ | --- |
| `npm run dev` | Web + server em desenvolvimento |
| `npm run build` | Build de todos os apps |
| `npm run dev:web` / `dev:server` | Só web ou só API |
| `npm run db:start` | Sobe Postgres (Docker) |
| `npm run db:push` | Aplica schema no banco (dev / prototipagem) |
| `npm run db:migrate` | Aplica migrations SQL (produção / deploy) |
| `npm run db:generate` | Gera migration a partir do schema TS |
| `npm run db:seed` | Bootstrap Helios (usuários, empresa, etc.) |
| `npm run db:studio` | Drizzle Studio |
| `npm run check` | Biome format + lint |
| `npm run docker:up` | Stack completa (web + server + postgres) |
| `npm run docker:down` / `docker:logs` | Para stack / logs |

Detalhes de setup: [docs/LOCAL.md](docs/LOCAL.md) e [docs/PRODUCAO.md](docs/PRODUCAO.md).
