# sync_v2

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, React Router, Express, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **React Router** - Declarative routing for React
- **Chakra UI** - Accessible component library for the web UI
- **Express** - Fast, unopinionated web framework
- **Node.js** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Biome** - Linting and formatting
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
npm install
```

## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:

```bash
npm run db:push
```

Seed do usuário super (preencha `SEED_SUPER_*` em `apps/server/.env` — veja `.env.example`):

```bash
npm run db:seed
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## UI

The web app uses [Chakra UI v3](https://chakra-ui.com/). Provider, toaster, and color-mode helpers live in `apps/web/src/components/ui/`.

```tsx
import { Button, Stack } from "@chakra-ui/react";
```

## Deployment

### Produção (Ubuntu + Nginx Proxy Manager)

Fluxo: `git pull` + `docker compose up -d --build`. Isolamento: `COMPOSE_PROJECT_NAME=sync_v2` no `.env` da raiz.

Pré-requisito: Docker network externa `proxy` (mesma do Nginx Proxy Manager). `web` e `server` entram nela; Postgres fica só na network interna do compose.

**Domínios (NPM — nome do container + porta interna)**

| Host | Forward NPM |
|------|-------------|
| `https://sync.helioslabs.com.br` | `http://sync_v2-web:3001` |
| `https://api.sync.helioslabs.com.br` | `http://sync_v2-server:3000` |

DNS: ambos A/CNAME para o IP do servidor. SSL Let's Encrypt no NPM. Websocket on no proxy do web. Portas host `13001`/`13000` só para debug (`curl`); NPM não precisa delas.

**Setup inicial**

```bash
git clone <repo> /opt/sync_v2
cd /opt/sync_v2
cp .env.example .env
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
# editar senhas, BETTER_AUTH_*, CORS_ORIGIN, BETTER_AUTH_URL, VITE_SERVER_URL, SEED_*
# produção tipica:
#   COMPOSE_PROJECT_NAME=sync_v2
#   VITE_SERVER_URL=https://api.sync.helioslabs.com.br
#   SEED_ON_START=true
#   apps/server: BETTER_AUTH_URL=https://api.sync.helioslabs.com.br
#                CORS_ORIGIN=https://sync.helioslabs.com.br

docker compose up -d --build
# db:push via packages/db (Turbo na raiz esvazia DATABASE_URL)
docker compose exec server sh -c 'cd /app/packages/db && npm run db:push'
# se seed rodou antes do schema: docker compose restart server
```

**Deploy recorrente**

```bash
cd /opt/sync_v2
git pull
docker compose up -d --build
# se schema mudou:
docker compose exec server sh -c 'cd /app/packages/db && npm run db:push'
```

**Seed**

- Com `SEED_ON_START=true`, o entrypoint do `server` roda o bootstrap Helios antes da API (idempotente).
- Manual: `docker compose exec server sh -c 'cd /app && npm run db:seed -w server'`
- Cria: plano básico, empresa/cliente Helios, 3 usuários (`super` / `admin_empresa` / `cliente`), categorias, centros de custo, 1 banco.
- Variáveis: ver `apps/server/.env.example`.

**Portas / conflito**

Portas host padrão: web `13001`, API `13000`, Postgres `15432` (evita conflito com 3000/3001/5432). Override via `.env`: `WEB_HOST_PORT`, `SERVER_HOST_PORT`, `POSTGRES_HOST_PORT`.

Postgres publica só em `127.0.0.1` (não na internet).

### Docker Compose (dev)

- Config: `docker-compose.yml` (Dockerfiles em `apps/*/Dockerfile`)
- Build: `npm run docker:build`
- Start: `npm run docker:up`
- Logs: `npm run docker:logs`
- Stop: `npm run docker:down`

Envs: `.env` na raiz + `apps/server/.env` + `apps/web/.env`. `VITE_*` é bake no build do web — mudou URL da API? Rebuild do `web`.

## Git Hooks and Formatting

- Run checks: `npm run check`

## Project Structure

```
sync_v2/
├── apps/
│   ├── web/         # Frontend (React + React Router + Chakra UI)
│   └── server/      # Backend API (Express) — business rules live here
├── packages/
│   ├── auth/        # Better Auth config (no domain business rules)
│   ├── config/      # Shared tooling / tsconfig
│   ├── db/          # Drizzle schema + client (no business rules)
│   ├── contracts/   # Shared API DTOs / schemas
│   ├── types/       # Shared types
│   ├── utils/       # Pure shared helpers
│   └── env/         # Environment variables
├── tasks/           # Agent work specs
└── AGENTS.md        # Architecture rules and task workflow
```

Server (`apps/server/src`): Controller → Service → Repository → Drizzle. See [AGENTS.md](AGENTS.md).

### Agent / tasks

- Guide: [AGENTS.md](AGENTS.md)
- Create a task: copy [tasks/TEMPLATE.md](tasks/TEMPLATE.md) → `tasks/YYYYMMDD-slug.md`
- Skill: `.agents/skills/create-task/SKILL.md`
- UI work: always use the `chakra-ui-builder` skill

## Available Scripts

- `npm run dev`: Start all applications in development mode
- `npm run build`: Build all applications
- `npm run dev:web`: Start only the web application
- `npm run dev:server`: Start only the server
- `npm run check-types`: Check TypeScript types across all apps
- `npm run db:push`: Push schema changes to database
- `npm run db:generate`: Generate database client/types
- `npm run db:migrate`: Run database migrations
- `npm run db:studio`: Open database studio
- `npm run check`: Run Biome formatting and linting
- `npm run docker:build`: Build the Docker Compose images
- `npm run docker:up`: Build and start the Docker Compose stack
- `npm run docker:logs`: Tail logs from the Docker Compose stack
- `npm run docker:down`: Stop the Docker Compose stack
