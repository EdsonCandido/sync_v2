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

### Docker Compose

- Target: web + server
- Config: `docker-compose.yml` (app Dockerfiles live in `apps/*/Dockerfile`)
- Build images: npm run docker:build
- Start: npm run docker:up
- Logs: npm run docker:logs
- Stop: npm run docker:down

Environment variables are read from each app's `.env` file (baked into web builds for public variables) and overridden in `docker-compose.yml` for container networking.

For more details, see the guide on [Deploying with Docker Compose](https://www.better-t-stack.dev/docs/guides/docker).

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
